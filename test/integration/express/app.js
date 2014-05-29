var express = require('express')
var app = module.exports = express()
var bodyParser = require('body-parser')

var host = 'localhost', port = 3000

app.set('host', host)
app.set('port', port)

app.use(bodyParser())

app.listen(port)

require('./controllers/widget')