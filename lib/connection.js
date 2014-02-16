var mysql = require('mysql')

var Connection = function(options) {

	options || (options = {})

	var connection = mysql.createConnection(options)

	connection.connect()

	return connection

}

module.exports = Connection