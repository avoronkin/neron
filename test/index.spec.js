const Neron = require('../Neron')
const assert = require('assert')

describe('Neron', () => {
    it('should work with sync', function (done) {
        Neron()
            .then(neron => {
                neron.reply('sum', function (a, b) {
                    return a + b
                })

                neron.listen('sum.answer', function (result) {
                    assert.equal(result, 5)
                    done()
                })

                neron.ask('sum', 2, 3)
            })

    })

    it('should work with async', function (done) {
        Neron()
            .then(neron => {
                neron.reply('difference', function (a, b) {
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve(a - b)
                        }, 300)
                    })
                })

                neron.listen('difference.answer', function (result) {
                    assert.equal(result, -1)
                    done()
                })

                neron.ask('difference', 2, 3)
            })

    })
})
