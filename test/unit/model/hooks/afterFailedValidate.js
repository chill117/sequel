var Instance = require('../../../../lib/instance')

var async = require('async')
var chai = require('chai')
var expect = chai.expect

var drivers = require('../../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Model#hooks \'afterFailedValidate\'', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var model

	before(function() {

		model = sequel.define('ModelHooksAfterFailedValidate', {

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

	it('should execute all of the callbacks after validation, when validation failed', function(done) {

		model.clearHooks()

		var repeat_n_times = 3, num_called = 0

		for (var n = 1; n <= repeat_n_times; n++)
			model.addHook('afterFailedValidate', function(next) {

				num_called++
				next()

			})

		var data = {}

		data.name = 'a test'
		data.value1 = 25
		data.value2 = 5500

		model.create(data).complete(function(errors, instance) {

			expect(errors).to.not.equal(null)
			expect(instance).to.equal(null)
			expect(num_called).to.equal(repeat_n_times)
			done()

		})

	})

	it('should not execute any of the callbacks after validation, when validation succeeded', function(done) {

		model.clearHooks()

		var repeat_n_times = 3, num_called = 0

		for (var n = 1; n <= repeat_n_times; n++)
			model.addHook('afterFailedValidate', function(next) {

				num_called++
				next()

			})

		var data = {}

		data.name = 'a test'
		data.value1 = 25
		data.value2 = 4500

		model.create(data).complete(function(errors, instance) {

			expect(errors).to.equal(null)
			expect(instance).to.not.equal(null)
			expect(num_called).to.equal(0)
			done()

		})

	})

})

})(drivers[i].sequel, drivers[i].TestManager)