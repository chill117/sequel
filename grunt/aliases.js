var util = require('./lib/util')

module.exports = {
	'default': [
		'test'
	],
	'test': [
		'test:unit', 'test:integration'
	],
	'test:integration': [],
	'test:unit': []
}

var drivers = util.getListOfDrivers()

for (var i in drivers)
{
	var driver = drivers[i]

	module.exports['test:' + driver] = [
		'test:unit:' + driver,
		'test:integration:' + driver
	]

	module.exports['test:unit'].push('test:unit:' + driver)
	module.exports['test:integration'].push('test:integration:' + driver)

	module.exports['test:unit:' + driver] = []
	module.exports['test:integration:' + driver] = []

	module.exports['test:unit:' + driver].push( 'mochaTest:unit-driver-' + driver )
	module.exports['test:unit:' + driver].push( 'mochaTest:unit-generic-' + driver )
	module.exports['test:integration:' + driver].push( 'mochaTest:integration-' + driver )
}