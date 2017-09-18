const amqp = require('amqplib')
const wrap = require('wrapped')

let ch

module.exports = async function Neron () {
    if (!ch) {
        const connection = await amqp.connect()
        ch = await connection.createChannel()
    }

    return {

        ask: async function (topic, ...data) {
            await ch.assertQueue(topic)
            await ch.assertQueue(topic + '.answer')


            return ch.publish('', topic, serialize(data), { replyTo: topic + '.answer' })
        },

        reply: async function (topic, handle) {
            await ch.assertQueue(topic)

            await ch.consume(topic, function (msg) {
                const data = deserialize(msg.content)


                wrap(handle).apply(null, data.concat(msg).concat(function (err, ...results) {
                    if (err) {
                        ch.nack(msg)
                    } else {
                        ch.ack(msg)
                        return ch.publish('', msg.properties.replyTo, serialize(results))
                    }

                }))
            })
        },

        listen: async function (topic, handle) {
            await ch.assertQueue(topic)

            await ch.consume(topic, function (msg) {
                const data = deserialize(msg.content)

                wrap(handle).apply(null, data.concat(msg).concat(function (err) {
                    if (err) {
                        ch.nack(msg)
                    } else {
                        ch.ack(msg)
                    }
                }))
            })
        },

    }
}


function serialize (data) {
    return Buffer.from(JSON.stringify(data))
}

function deserialize (data) {
    return JSON.parse(data.toString())
}
