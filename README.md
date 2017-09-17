```javascript
const Neron = require('neron')

async function server () {
    const neron = await Neron()

    neron.reply('reports', async function (data) {
        data.result = 5
        return data
    })
}

server()

```


```javascript
const Neron = require('neron')

async function client () {
    const neron = await Neron()

    neron.listen('reports.answers', async function (data) {
        console.log('data', data)
    })

    neron.ask('reports', {
        type: '11'
    })
}

client()
```
