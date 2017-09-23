module.exports = {
    serialize (data) {
        return Buffer.from(JSON.stringify(data))
    },
    deserialize (data) {
        return JSON.parse(data.toString())
    }
}
