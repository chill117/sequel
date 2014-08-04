var util = require('./lib/util')

var grunt = require('grunt')

module.exports = {}

var drivers = util.getListOfDrivers()

for (var i in drivers)
{
	var driver = drivers[i]

	module.exports['test:' + driver] = [
		'test:unit:' + driver,
		'test:integration:' + driver
	]

	module.exports['test:unit:' + driver] = []
	module.exports['test:integration:' + driver] = []

	module.exports['test:unit:' + driver].push( 'mochaTest:unit-driver-' + driver )
	module.exports['test:unit:' + driver].push( 'mochaTest:unit-generic-' + driver )
	module.exports['test:integration:' + driver].push( 'mochaTest:integration-' + driver )
}