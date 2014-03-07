var Instance = require('../../../../lib/instance')

var async = require('async')
var chai = require('chai')
var expect = chai.expect

var drivers = require('../../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Model#hooks \'beforeDestroy\'', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var model

	before(function() {

		model = sequel.define('ModelHooksBeforeDestroy', {

			id: {
				type: 'integer',
				autoIncrement: true,
				primaryKey: true
			},
			name: {
				type: 'text',
				validate: {
					notEmpty: {
						msg: 'Name cannot be empty'
					}
				}
			},
			value1: {
				type: 'integer',
				validate: {
					notNull: true,
					isInt: true,
					max: 500
				},
				defaultValue: 20
			},
			value2: {
				type: 'integer',
				validate: {
					notNull: true,
					isInt: true,
					max: 5000
				},
				defaultValue: 0
			},
			modata: {
				type: 'integer',
				defaultValue: 1
			},
			moproblems: {
				type: 'text',
				defaultValue: 'some default text'
			}

		}, {

			tableName: 'test_table_1'

		})

	})

	var fixtures = require('../../../fixtures/test_table_1')

	it('should execute all of the callbacks before an instance is destroyed', function(done) {

		model.clearHooks()

		var data = fixtures[0]

		model.create(data).complete(function(errors, instance) {

			if (errors)
			{
				console.log(errors)
				return done(new Error('An unexpected error has occurred'))
			}

			var id = instance.get('id')

			var repeat_n_times = 3, num_called = 0

			for (var n = 1; n <= repeat_n_times; n++)
				model.addHook('beforeDestroy', function(next) {

					num_called++

					// Verify that the instance has not been destroyed yet.
					model.find(id).complete(function(error, result) {

						expect(result).to.not.equal(null)
						next()

					})

				})

			instance.destroy().complete(function() {

				expect(num_called).to.equal(repeat_n_times)

				// Verify that the instance has been destroyed.
				model.find(id).complete(function() {

					done()

				})

			})

		})

	})

})

})(drivers[i].sequel, drivers[i].TestManager)