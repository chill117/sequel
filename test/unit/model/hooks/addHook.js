var Instance = require('../../../../lib/instance')

var async = require('async')
var chai = require('chai')
var expect = chai.expect

var drivers = require('../../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Model#hooks', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	describe('addHook(name, fn)', function() {

		it('should throw an error when adding to an invalid hook', function() {

			var model = sequel.define('HooksAddHookInvalidHookTest', {

				id: {
					type: 'integer',
					autoIncrement: true,
					primaryKey: true
				},
				name: 'text'

			}, {

				tableName: 'does_not_exist'

			})

			var thrownError

			try {

				model.addHook('beforeAnInvalidHook', function(next) {})

			} catch (error) {

				thrownError = error

			} finally {

				expect(thrownError).to.not.equal(undefined)
				expect(thrownError instanceof Error).to.equal(true)

			}

		})

		it('should execute the callbacks added via the \'addHook\' method', function(done) {

			var model = sequel.define('HooksAddHookExecutionTest', {

				id: {
					type: 'integer',
					autoIncrement: true,
					primaryKey: true
				},
				name: 'text',
				description: 'text',
				some_value: 'integer'

			}, {

				tableName: 'does_not_exist'

			})

			var num_called = 0

			model.addHook('beforeValidate', function(next) {

				num_called++
				next()

			})

			model.addHook('beforeValidate', function(next) {

				num_called++
				next()

			})

			model.addHook('beforeValidate', function(next) {

				num_called++
				next('An error!')

			})

			model.create().complete(function(errors, instance) {

				expect(num_called).to.equal(3)
				done()

			})

		})

	})

})

})(drivers[i].sequel, drivers[i].TestManager)