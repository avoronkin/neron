const amqp = require('amqplib')
let connection

module.exports = async function (options) {
    const { url = 'amqp://localhost' } = options || {}

    if (!connection) {
        connection = await amqp.connect(url)
    }

    const ch = await connection.createChannel()

    return {
        ch,

        async publish ({
            exchangeName,
            exchangeType,
            exchangeOptions,
            routingKey,
            content,
            publishOptions
        }) {

            await ch.assertExchange(exchangeName, exchangeType, exchangeOptions)

            return ch.publish(exchangeName, routingKey, content, publishOptions)
        },

        async consume ({
            exchangeName,
            exchangeType,
            exchangeOptions,

            dlExchangeName,
            dlExchangeType,
            dlExchangeOptions,

            queueName,
            queueOptions,
            routingKey,
            handler,
            consumeOptions
        }) {

            if (dlExchangeType) {
                await ch.assertExchange(dlExchangeName, dlExchangeType, dlExchangeOptions)
            }

            await ch.assertExchange(exchangeName, exchangeType, exchangeOptions)

            const { queue: qName } = await ch.assertQueue(queueName, queueOptions)

            await ch.bindQueue(qName, exchangeName, routingKey)

            return ch.consume(qName, handler, consumeOptions)
        }
    }
}
