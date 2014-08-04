var Field = require('../../../../lib/field')
var Instance = require('../../../../lib/instance')

var expect = require('chai').expect


describe('Model#hooks \'afterDestroy\'', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var model, fixtures

	before(function() {

		model = sequel.define('ModelHooksAfterDestroy', {

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

		fixtures = require('../../../fixtures/test_table_1')

	})

	afterEach(function() {

		model.clearHooks()

	})

	describe('After an instance has been destroyed', function() {

		var instance

		before(function(done) {

			var data = fixtures[0]

			model.create(data).complete(function(errors, result) {

				if (errors)
					return done(new Error('Unexpected error(s)'))

				instance = result
				done()

			})

		})

		it('should execute all of the callbacks', function(done) {

			var repeat_n_times = 3, num_called = 0

			for (var n = 1; n <= repeat_n_times; n++)
				model.addHook('afterDestroy', function(next) {

					num_called++

					// Verify that the instance has been destroyed.
					model.find(instance.get('id')).complete(function(error, result) {

						expect(result).to.equal(null)
						next()

					})

				})

			instance.destroy().complete(function() {

				expect(num_called).to.equal(repeat_n_times)
				done()

			})

		})

	})

	describe('When destroying an instance failed due to a database error', function() {

		var instance

		before(function(done) {

			var data = fixtures[0]

			model.create(data).complete(function(errors, result) {

				if (errors)
					return done(new Error('Unexpected error(s)'))

				instance = result
				done()

			})

		})

		// With no tables in the database, instance.destroy() should definitely fail.
		before(TestManager.tearDown)

		it('should not execute any of the callbacks', function(done) {

			var repeat_n_times = 3, num_called = 0

			for (var n = 1; n <= repeat_n_times; n++)
				model.addHook('afterDestroy', function(next) {

					num_called++
					next()

				})

			instance.destroy().complete(function(error) {

				expect(error).to.not.equal(null)
				expect(num_called).to.equal(0)

				// Don't forget to delete the field.
				delete model.fields.does_not_exist

				done()

			})

		})

	})

})