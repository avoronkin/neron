const wrap = require('wrapped')
const __ = require('arguejs')
const { serialize, deserialize } = require('./util')
const pubcon = require('./pubcon')

module.exports = async function Neron (topic, options) {
    const {ch, publish, consume } = await pubcon(options)

    const deadLetterExchange = topic + '.error'

    return {

        publish: async function (key, data, options = {}) {
            const isQuestion = key.search(/\?/) !== -1
            key = key.replace(/\?/, '')
            const publishOptions = Object.assign({
                persistent: true,
                replyTo: isQuestion ? key + '.result' : undefined
            }, options)

            return publish({
                exchangeName: topic,
                exchangeType: 'topic',
                exchangeOptions: {durable: true},

                routingKey: key,
                content: serialize(data),
                publishOptions: publishOptions
            })
        },

        listen: async function () {
            const {queue, key, handler} = __({queue: [String, null], key: String, handler: Function}, arguments)
            const isDeadLetter = key.search(/\.error/) !== -1
            const _topic = isDeadLetter ? deadLetterExchange : topic

            return consume ({
                exchangeName: _topic,
                exchangeType: 'topic',
                exchangeOptions: {durable: true},

                dlExchangeName: deadLetterExchange,
                dlExchangeType: 'topic',
                dlExchangeOptions: {durable: true},

                queueName: queue,
                queueOptions:{
                    deadLetterExchange: isDeadLetter ? undefined : deadLetterExchange,
                    deadLetterRoutingKey: isDeadLetter ? undefined : key + '.error',
                    durable: !!queue,
                    autoDelete: !queue,
                    exclusive: !queue
                },

                routingKey: key,
                handler: function (msg) {
                    const data = deserialize(msg.content)

                    wrap(handler).apply(null, data.concat(msg).concat(function (err, ...results) {
                        if (err) return ch.nack(msg, false, false)

                        ch.ack(msg)

                        if (!isDeadLetter && msg.properties.replyTo) {
                            return ch.publish(topic, msg.properties.replyTo, serialize(results), {
                                correlationId: msg.properties.correlationId,
                                persistent: true
                            })
                        }
                    }))
                },
                consumeOptions: {}

            })

        },
    }
}
