var Field = require('../../../../lib/field')
var Instance = require('../../../../lib/instance')

var async = require('async')
var chai = require('chai')
var expect = chai.expect

var drivers = require('../../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Model#hooks \'afterFailedCreate\'', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var model

	before(function() {

		model = sequel.define('ModelHooksAfterFailedCreate', {

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

	it('should execute all of the callbacks if creating an instance failed due to a database error', function(done) {

		model.clearHooks()

		// Add a field to the model that does not exist in the database.
		model.fields.does_not_exist = new Field('does_not_exist', {type: 'text'})

		var repeat_n_times = 3, num_called = 0

		for (var n = 1; n <= repeat_n_times; n++)
			model.addHook('afterFailedCreate', function(next) {

				num_called++
				next()

			})

		var data = {}

		data.name = 'some name'
		data.value1 = 33
		data.value2 = 4300
		data.does_not_exist = 'a field that does not exist'

		model.create(data, {validate: false}).complete(function(errors, instance) {

			expect(errors).to.not.equal(null)
			expect(instance).to.equal(null)
			expect(num_called).to.equal(repeat_n_times)

			// Don't forget to delete the field.
			delete model.fields.does_not_exist

			done()

		})

	})

	it('should not execute any of the callbacks if creating an instance failed due to failed validation', function(done) {

		model.clearHooks()

		var repeat_n_times = 3, num_called = 0

		for (var n = 1; n <= repeat_n_times; n++)
			model.addHook('afterFailedCreate', function(next) {

				num_called++
				next()

			})

		var data = {}

		data.name = 'another test'
		data.value1 = 33
		data.value2 = 5500// Should cause validation to fail.

		model.create(data).complete(function(errors, instance) {

			expect(errors).to.not.equal(null)
			expect(instance).to.equal(null)
			expect(num_called).to.equal(0)
			done()

		})

	})

})

})(drivers[i].sequel, drivers[i].TestManager)