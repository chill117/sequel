var util = require('./lib/util')

module.exports = {}

var drivers = util.getListOfDrivers()

for (var i in drivers)
{
	var driver = drivers[i]

	module.exports['integration-' + driver] = {
		options: {
			reporter: 'spec',
			require: [
				requireTestManager(driver),
				requireSequel(driver)
			]
		},
		src: ['test/integration/**/*.js']
	}

	module.exports['unit-driver-' + driver] = {
		options: {
			reporter: 'spec',
			require: [
				requireTestManager(driver),
				requireSequel(driver)
			]
		},
		src: [
			'test/unit/driver/**/*.js'
		]
	}

	module.exports['unit-generic-' + driver] = {
		options: {
			reporter: 'spec',
			require: [
				requireTestManager(driver),
				requireSequel(driver)
			]
		},
		src: [
			'test/unit/instance/**/*.js',
			'test/unit/model/**/*.js'
		]
	}
}

function requireTestManager(driver) {

	return function() {

		TestManager = require('../test/drivers/' + driver + '/test-manager')

	}

}

function requireSequel(driver) {

	return function() {

		sequel = require('../test/drivers/' + driver + '/sequel')

	}

}