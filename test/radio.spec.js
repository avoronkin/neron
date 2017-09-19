const Radio = require('../lib/Radio')
const assert = require('assert')
const sinon = require('sinon')

describe('Radio', () => {
    it('should support multiple listeners', async function () {
        const radio = await Radio()
        let data1, data2

        await radio.listen('sum.calculated', function (_data) {
            data1 = _data
        })

        await radio.listen('sum.calculated', function (_data) {
            data2 = _data
        })

        await radio.publish('sum.calculated', 23)

        await new Promise(resolve => setTimeout(resolve, 10))

        assert.equal(data1, 23)
        assert.equal(data2, 23)
    })

    it('should support multiple publishers', async function () {
        const radio = await Radio()
        const handler1 = sinon.spy()
        const handler2 = sinon.spy()

        await radio.listen('sum.calculated', handler1)
        await radio.listen('sum.calculated', handler2)

        await radio.publish('sum.calculated', 23)
        await radio.publish('sum.calculated', 34)

        await new Promise(resolve => setTimeout(resolve, 10))

        assert.equal(handler1.calledTwice, true)
        assert.equal(handler2.calledTwice, true)
        assert.equal(handler1.args[0][0], 23)
        assert.equal(handler1.args[1][0], 34)
        assert.equal(handler2.args[0][0], 23)
        assert.equal(handler2.args[1][0], 34)
    })
})
