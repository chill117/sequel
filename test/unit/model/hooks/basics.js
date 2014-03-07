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

	it('should execute hook callbacks in the order that they are added', function(done) {

		var model = sequel.define('HooksExecutionOrderTest', {

			id: {
				type: 'integer',
				autoIncrement: true,
				primaryKey: true
			},
			name: 'text'

		}, {

			tableName: 'does_not_exist'
		})

		var num_called = 0

		for (var n = 0; n < 10; n++)
			(function(call_order) {

				model.addHook('beforeValidate', function(next) {

					expect(num_called).to.equal(call_order)
					num_called++
					next()

				})

			})(n)

		model.create().complete(function() {

			done()

		})

	})

	it('hook callbacks should be executed with the instance context', function(done) {

		var model = sequel.define('HooksContextTest', {

			id: {
				type: 'integer',
				autoIncrement: true,
				primaryKey: true
			},
			name: 'text'

		}, {

			tableName: 'does_not_exist'
		})

		model.addHook('beforeValidate', function(next) {

			expect(this instanceof Instance).to.equal(true)
			next()

		})

		model.create().complete(function() {

			done()

		})

	})

	describe('\'hooks\' option', function() {

		it('should throw an error when adding an invalid hook', function() {

			var thrownError

			try {

				var model = sequel.define('HooksHookOptionInvalidHookTest', {

					id: {
						type: 'integer',
						autoIncrement: true,
						primaryKey: true
					},
					name: 'text'

				}, {

					tableName: 'does_not_exist',

					hooks: {

						beforeNotAValidHook: [

							function(next) {

								next()

							}

						]

					}

				})

			} catch (error) {

				thrownError = error

			} finally {

				expect(thrownError).to.not.equal(undefined)
				expect(thrownError instanceof Error).to.equal(true)

			}

		})

		it('should execute the callbacks added via the model\'s \'hooks\' option', function(done) {

			var num_called = 0

			var model = sequel.define('HooksHookOptionExecutionTest', {

				id: {
					type: 'integer',
					autoIncrement: true,
					primaryKey: true
				},
				name: 'text',
				description: 'text',
				some_value: 'integer'

			}, {

				tableName: 'does_not_exist',

				hooks: {

					beforeValidate: [

						function(next) {

							num_called++
							next()

						},

						function(next) {

							num_called++
							next()

						},

						function(next) {

							num_called++
							next('An error!')

						}

					]

				}

			})

			model.create().complete(function(errors, instance) {

				expect(num_called).to.equal(3)
				done()

			})

		})

	})

})

})(drivers[i].sequel, drivers[i].TestManager)