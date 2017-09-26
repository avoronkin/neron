[![Build Status](https://travis-ci.org/avoronkin/neron.svg?branch=master)](https://travis-ci.org/avoronkin/neron)

```javascript
const Neron = require('neron')

async function server () {
    const neron = await Neron('math')

    await neron.listen('sum', (a, b) => a + b)
}

server()

```


```javascript
const Neron = require('neron')
const assert = require('assert')

async function client () {
    const neron = await Neron('math')

    await neron.listen('sum.result', function (result) {
        assert.equal(result, 5)
    })

    await neron.publish('sum?', 2, 3)
}

client()
```
