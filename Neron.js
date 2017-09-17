const amqp = require('amqplib')

let ch

module.exports = async function Neron () {
    if (!ch) {
        const connection = await amqp.connect()
        ch = await connection.createChannel()
    }

    return {

        ask: async function (topic, data) {
            await ch.assertQueue(topic)
            await ch.assertQueue(topic + '.answers')

            return ch.publish('', topic, serialize(data), { replyTo: topic + '.answers' })
        },

        reply: async function (topic, handle) {
            await ch.assertQueue(topic)

            await ch.consume(topic, function (msg) {
                const data = deserialize(msg.content)

                handle(data, msg)
                    .then((result) => {
                        ch.ack(msg)
                        return ch.publish('', msg.properties.replyTo, serialize(result))
                    })
                    .then(null, () => {
                        ch.nack(msg)
                    })
            })
        },

        listen: async function (topic, handle) {
            await ch.assertQueue(topic)

            await ch.consume(topic, function (msg) {
                const data = deserialize(msg.content)

                handle(data, msg)
                    .then(() => {
                        ch.ack(msg)
                    })
                    .then(null, () => {
                        ch.nack(msg)
                    })
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
