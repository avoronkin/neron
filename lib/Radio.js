const amqp = require('amqplib')
const wrap = require('wrapped')

let ch

module.exports = async function Neron () {
    if (!ch) {
        const connection = await amqp.connect()
        ch = await connection.createChannel()
    }

    return {

        publish: async function (channel, ...data) {
            await ch.assertExchange(channel, 'fanout', {
                durable: false,
                autoDelete: true
            })

            return ch.publish(channel, '', serialize(data))
        },

        listen: async function (channel, handle) {
            const qok = await ch.assertQueue(null, {
                autoDelete: true,
                exclusive: true
            })
            await ch.assertExchange(channel, 'fanout', {
                durable: false,
                autoDelete: true
            })
            await ch.bindQueue(qok.queue, channel)

            await ch.consume(qok.queue, function (msg) {
                const data = deserialize(msg.content)

                wrap(handle).apply(null, data.concat(msg))
            },  {noAck: true})
        },

    }
}


function serialize (data) {
    return Buffer.from(JSON.stringify(data))
}

function deserialize (data) {
    return JSON.parse(data.toString())
}
