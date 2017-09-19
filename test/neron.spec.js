const Neron = require('../lib/Neron')
const assert = require('assert')

describe('Neron', () => {
    it('should work with sync', async function () {
        const neron = await Neron()
        let result

        await neron.reply('sum', function (a, b) {
            return a + b
        })

        await neron.listen('sum.answer', function (_result) {
            result = _result
        })

        await neron.ask('sum', 2, 3)

        await new Promise(resolve => setTimeout(resolve, 90))

        assert.equal(result, 5)
    })

    it('should work with async', async function () {
        const neron = await Neron()
        let result

        await neron.reply('difference', function (a, b) {
            return Promise.resolve(a - b)
        })

        await neron.listen('difference.answer', function (_result) {
            result = _result
        })

        await neron.ask('difference', 2, 3)

        await new Promise(resolve => setTimeout(resolve, 50))

        assert.equal(result, -1)
    })
})
