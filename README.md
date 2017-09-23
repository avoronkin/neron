```javascript
const Neron = require('neron')

async function server () {
    const neron = await Neron('math')

    neron.listen('sum', (a, b) => a + b)
}

server()

```


```javascript
const Neron = require('neron')
const assert = require('assert')

async function client () {
    const neron = await Neron('math')

    neron.listen('sum.result', function (result) {
        assert.equal(result, 5)
    })

    neron.publish('sum?', 2, 3)
}

client()
```
