```javascript
const Neron = require('neron')

async function server () {
    const neron = await Neron()

    neron.reply('sum', function (a, b) {
        return a + b
    })
}

server()

```


```javascript
const Neron = require('neron')

async function client () {
    const neron = await Neron()

    neron.listen('sum.answer', function (result) {
        assert.equal(result, 5)
        done()
    })

    neron.ask('sum', 2, 3)
}

client()
```
