const Neron = require('../lib/Neron')
const assert = require('assert')
const sinon = require('sinon')
const _ = require('lodash')

describe('Neron', () => {
    describe('rpc', () => {
        it('should work with sync', async function () {
            const dialog = await Neron('math')
            let result

            await dialog.listen('sum', (a, b) => a + b)

            await dialog.listen('sum.result', _result => result = _result)

            await dialog.publish('sum?', [2, 3])

            await new Promise(resolve => setTimeout(resolve, 80))

            assert.equal(result, 5)
        })

        it('should dead letter', async function () {
            const dialog = await Neron('math')
            const handler = sinon.spy()
            const errorHandler = sinon.spy()

            await dialog.listen('difference', () => Promise.reject(new Error('lol')))

            await dialog.listen('difference.error', errorHandler)

            await dialog.listen('difference.result', handler)

            await dialog.publish('difference?', [2, 3])

            await new Promise(resolve => setTimeout(resolve, 100))

            assert.equal(handler.called, false)
            assert.equal(errorHandler.called, true)
        })

        it('should work with async', async function () {
            const dialog = await Neron('math')
            let result, msg1, msg2
            const correlationId = '888'

            await dialog.listen('difference1', function (a, b, _msg) {
                msg1 = _msg
                return Promise.resolve(a - b)
            })

            await dialog.listen('difference1.result', function (_result, _msg) {
                result = _result
                msg2 = _msg
            })

            await dialog.publish('difference1?', [2, 3], {
                correlationId: correlationId
            })

            await new Promise(resolve => setTimeout(resolve, 100))

            assert.equal(msg1.properties.correlationId, correlationId)
            assert.equal(msg2.properties.correlationId, correlationId)
            assert.equal(result, -1)
        })


    })

    describe('pubsub', () => {
        it('should support multiple listeners', async function () {
            const topic = await Neron('math')
            let data1, data2

            await topic.listen('sum.calculated0', function (_data) {
                data1 = _data
            })

            await topic.listen('sum.calculated0', function (_data) {
                data2 = _data
            })

            await topic.publish('sum.calculated0', [23])

            await new Promise(resolve => setTimeout(resolve, 10))

            assert.equal(data1, 23)
            assert.equal(data2, 23)
        })

        it('should support wildcards', async function () {
            const topic = await Neron('math')
            let data1, data2, data3

            await topic.listen('*.calculated5', function (_data) {
                data1 = _data
            })

            await topic.listen('sum.*', function (_data) {
                data2 = _data
            })

            await topic.listen('sum.sum', function (_data) {
                data3 = _data
            })

            await topic.publish('sum.calculated5', [23])

            await new Promise(resolve => setTimeout(resolve, 10))

            assert.equal(data1, 23)
            assert.equal(data2, 23)
            assert.equal(data3, undefined)
        })

        it('should support multiple publishers', async function () {
            const topic = await Neron('math')
            const handler1 = sinon.spy()
            const handler2 = sinon.spy()

            await topic.listen('sum.calculated2', handler1)
            await topic.listen('sum.calculated2', handler2)

            await topic.publish('sum.calculated2', [23])
            await topic.publish('sum.calculated2', [34])

            await new Promise(resolve => setTimeout(resolve, 100))

            assert.equal(handler1.calledTwice, true)
            assert.equal(handler2.calledTwice, true)
            assert.equal(handler1.args[0][0], 23)
            assert.equal(handler1.args[1][0], 34)
            assert.equal(handler2.args[0][0], 23)
            assert.equal(handler2.args[1][0], 34)
        })

        it('should support publish options', async function () {
            const topic = await Neron('math')
            const handler1 = sinon.spy()

            await topic.listen('sum.calculated3', handler1)

            const correlationId = '1234567890'
            await topic.publish('sum.calculated3', [23], {
                correlationId: correlationId
            })

            await new Promise(resolve => setTimeout(resolve, 100))

            assert.equal(handler1.calledOnce, true)
            assert.equal(handler1.args[0][0], 23)
            assert.equal(_.get(handler1.args[0][1], 'properties.correlationId'), correlationId)
        })
    })

})
