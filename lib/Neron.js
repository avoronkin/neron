const amqp = require('amqplib')
const wrap = require('wrapped')
const __ = require('arguejs')
const { serialize, deserialize } = require('./util')

let connection

module.exports = async function Neron (topic, options) {
    const { url = 'amqp://localhost' } = options || {}

    if (!connection) {
        connection = await amqp.connect(url)
    }

    const ch = await connection.createChannel()

    await ch.assertExchange(topic, 'topic', {durable: true})

    return {

        publish: async function (key, ...data) {
            const isQuestion = key.search(/\?/) !== -1
            key = key.replace(/\?/, '')

            return ch.publish(topic, key, serialize(data), {
                persistent: true,
                replyTo: isQuestion ? key + '.result' : undefined
            })
        },

        listen: async function () {
            const {queue, key, handle} = __({queue: [String, null], key: String, handle: Function}, arguments)
            const qok = await ch.assertQueue(queue, {
                durable: !!queue,
                autoDelete: !queue,
                exclusive: !queue
            })

            const qName = qok.queue
            await ch.bindQueue(qName, topic, key)

            await ch.consume(qName, function (msg) {
                const data = deserialize(msg.content)

                wrap(handle).apply(null, data.concat(msg).concat(function (err, ...results) {
                    if (err) return ch.nack(msg)

                    ch.ack(msg)

                    if (msg.properties.replyTo) {
                        return ch.publish(topic, msg.properties.replyTo, serialize(results), {
                            persistent: true
                        })
                    }
                }))
            })
        },
    }
}
