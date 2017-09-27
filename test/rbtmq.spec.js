const rbtmq = require('../lib/rbtmq')
const assert = require('assert')
const Promise = require('bluebird')
const mngr = require('http-rabbitmq-manager').client()

Promise.promisifyAll(mngr)

describe.only('rbtmq', () => {
    describe('topic', () => {

        it('create topic exchange', async () => {
            const rb = await rbtmq()
            const topic = rb.topic('test-topic', {durable: false})
            const queue = topic.queue('test-topic-queue', {durable: false})

            await queue.listen('test.key', msg => {

                assert.equal(msg.content.toString(), 'hello world')

                queue.ack(msg)
            })

            await topic.publish('test.key', Buffer.from('hello world'))

            await new Promise(resolve => setTimeout(resolve, 50))
        })
    })

    describe('fanout', () => {

        it('create fanout exchange', async () => {
            const rb = await rbtmq()
            const fanout = await rb.fanout('test-fanout', {durable: false})

            const queue = fanout.queue('test-fanout-queue', {durable: false})
            const content = 'hello fanout'

            await queue.listen(msg => {

                assert.equal(msg.content.toString(), content)

                queue.ack(msg)
            })

            await fanout.publish(Buffer.from(content))

            await new Promise(resolve => setTimeout(resolve, 50))
        })
    })

    describe('direct', () => {
        it('create direct exchange', async () => {
            const rb = await rbtmq()
            const direct = await rb.direct('test-direct', {durable: false})
            const queue = direct.queue('test-direct-queue', {durable: false})

            await queue.listen('test.key', msg => {

                assert.equal(msg.content.toString(), 'hello world')

                queue.ack(msg)
            })

            await direct.publish('test.key', Buffer.from('hello world'))

            await new Promise(resolve => setTimeout(resolve, 50))
        })

    })

})
