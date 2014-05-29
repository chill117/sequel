var express = require('express')
var app = module.exports = express()

var host = 'localhost', port = 3000

app.set('host', host)
app.set('port', port)

app.configure(function() {

	app.use(express.logger())
	app.use(express.bodyParser())

})

app.listen(port)

require('./controllers/widget')