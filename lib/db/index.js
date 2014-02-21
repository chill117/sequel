var _ = require('underscore')
var fs = require('fs')

var Db = function(options) {

	options || (options = {})

	if (!options.driver)
	{
		console.log('Fatal Error: Database driver not specified')

		return false
	}

	if (!driverExists(options.driver))
	{
		console.log('Fatal Error: Invalid database driver')

		return false
	}

	return loadDriver(options.driver, options)

}

function loadDriver(driver, options) {

	var Driver = require(__dirname + '/drivers/' + driver)

	return new Driver(options)

}

function driverExists(driver) {

	return fs.existsSync(__dirname + '/drivers/' + driver)

}

module.exports = Db