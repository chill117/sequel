var Field = require('../../../../lib/field')
var Instance = require('../../../../lib/instance')

var async = require('async')
var chai = require('chai')
var expect = chai.expect

var drivers = require('../../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Model#hooks \'afterFailedDestroy\'', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var model

	before(function() {

		model = sequel.define('ModelHooksAfterFailedDestroy', {

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

	it('should execute all of the callbacks if destroying an instance failed due to a database error', function(done) {

		var data = fixtures[0]

		model.create(data).complete(function(errors, instance) {

			if (errors)
			{
				console.log(errors)
				return done(new Error('An unexpected error has occurred'))
			}

			// Add a field to the model that does not exist in the database.
			model.fields.does_not_exist = new Field('does_not_exist', {type: 'integer'})
			model.addField('does_not_exist', {type: 'integer'})

			var repeat_n_times = 3, num_called = 0

			for (var n = 1; n <= repeat_n_times; n++)
				model.addHook('afterFailedDestroy', function(next) {

					num_called++
					next()

				})

			instance.data.id = NaN// This should cause a database error for sure.

			instance.destroy().complete(function(error) {

				expect(error).to.not.equal(null)
				expect(num_called).to.equal(repeat_n_times)

				// Don't forget to delete the field.
				delete model.fields.does_not_exist

				done()

			})

		})

	})

})

})(drivers[i].sequel, drivers[i].TestManager)