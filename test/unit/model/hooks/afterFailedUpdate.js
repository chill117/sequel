var Field = require('../../../../lib/field')
var Instance = require('../../../../lib/instance')

var async = require('async')
var expect = require('chai').expect


describe('Model#hooks \'afterFailedUpdate\'', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var model

	before(function() {

		model = sequel.define('ModelHooksAfterFailedUpdate', {

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

	it('should execute all of the callbacks if updating an instance failed due to a database error', function(done) {

		model.clearHooks()

		var data = fixtures[0]

		model.create(data).complete(function(errors, instance) {

			// Add a field to the model that does not exist in the database.
			model.addField('does_not_exist', {type: 'text'})

			var repeat_n_times = 3, num_called = 0

			for (var n = 1; n <= repeat_n_times; n++)
				model.addHook('afterFailedUpdate', function(next) {

					num_called++
					next()

				})

			instance.set('does_not_exist', 'a field that does not exist')

			instance.save({validate: false}).complete(function(errors, result) {

				expect(errors).to.not.equal(null)
				expect(result).to.equal(null)
				expect(num_called).to.equal(repeat_n_times)

				// Don't forget to delete the field.
				delete model.fields.does_not_exist

				done()

			})

		})

	})

})

