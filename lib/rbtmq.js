const amqp = require('amqplib')

module.exports = async function (url) {
    const connection = await amqp.connect(url)
    const ch = await connection.createChannel()

    return {
        topic (exchangeName, exchangeOptions) {

            return {
                async publish (routingKey, content, publishOptions) {
                    await ch.assertExchange(exchangeName, 'topic', exchangeOptions)

                    return ch.publish(exchangeName, routingKey, content, publishOptions)
                },

                queue (queueName, queueOptons) {

                    return {
                        async listen (routingKey, handler, options) {
                            await Promise.all([
                                ch.assertQueue(queueName, queueOptons),
                                ch.assertExchange(exchangeName, 'topic', exchangeOptions)
                            ])
                            await ch.bindQueue(queueName, exchangeName, routingKey)

                            return ch.consume(queueName, handler, options)
                        },

                        ack (msg) {
                            return ch.ack(msg)
                        },

                        nack (msg) {
                            return ch.nack(msg)
                        }
                    }

                }

            }
        },

        fanout (exchangeName, exchangeOptions) {

            return {
                async publish (content, publishOptions) {
                    await ch.assertExchange(exchangeName, 'fanout', exchangeOptions)

                    return ch.publish(exchangeName, '', content, publishOptions)
                },

                queue (queueName, queueOptons) {

                    return {
                        async listen (handler, options) {
                            await Promise.all([
                                ch.assertExchange(exchangeName, 'fanout', exchangeOptions),
                                ch.assertQueue(queueName, queueOptons)
                            ])
                            await ch.bindQueue(queueName, exchangeName, '')

                            return ch.consume(queueName, handler, options)
                        },

                        ack (msg) {
                            return ch.ack(msg)
                        },

                        nack (msg) {
                            return ch.nack(msg)
                        }
                    }
                }
            }
        },

        direct (exchangeName, exchangeOptions) {

            return {
                async publish (routingKey, content, publishOptions) {
                    await ch.assertExchange(exchangeName, 'direct', exchangeOptions)
                    return ch.publish(exchangeName, routingKey, content, publishOptions)
                },
                queue (queueName, queueOptons) {

                    return {
                        async listen (routingKey, handler, options) {
                            await ch.assertExchange(exchangeName, 'direct', exchangeOptions)
                            await ch.assertQueue(queueName, queueOptons)
                            await ch.bindQueue(queueName, exchangeName, routingKey)

                            return ch.consume(queueName, handler, options)

                        },

                        ack (msg) {
                            return ch.ack(msg)
                        },

                        nack (msg) {
                            return ch.nack(msg)
                        }
                    }
                }
            }
        },

        headers (exchangeName, exchangeOptions) {

            return {
                async publish (content, publishOptions) {
                    await ch.assertExchange(exchangeName, 'headers', exchangeOptions)

                    return ch.publish(exchangeName, '', content, publishOptions)
                },

                queue (queueName, queueOptons) {

                    return {
                        async listen (routingKey, handler, options) {
                            await Promise.all([
                                ch.assertQueue(queueName, queueOptons),
                                ch.assertExchange(exchangeName, 'headers', exchangeOptions)
                            ])
                            await ch.bindQueue(queueName, exchangeName, options)

                            return ch.consume(queueName, handler)
                        },

                        ack (msg) {
                            return ch.ack(msg)
                        },

                        nack (msg) {
                            return ch.nack(msg)
                        }
                    }

                }

            }
        },
    }
}
