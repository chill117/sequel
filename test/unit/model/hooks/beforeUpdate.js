var Instance = require('../../../../lib/instance')

var async = require('async')
var expect = require('chai').expect


describe('Model#hooks \'beforeUpdate\'', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var model

	before(function() {

		model = sequel.define('ModelHooksBeforeUpdate', {

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

	it('should execute all of the callbacks before an existing instance is updated', function(done) {

		model.clearHooks()

		var data = fixtures[0]

		model.create(data).complete(function(errors, instance) {

			if (errors)
			{
				console.log(errors)
				return done(new Error('An unexpected error has occurred'))
			}

			var repeat_n_times = 3, num_called = 0, incrementBy = 51

			for (var n = 1; n <= repeat_n_times; n++)
				model.addHook('beforeUpdate', function(next) {

					num_called++

					// Change data before the instance is updated.
					this.set('value2', this.get('value2') + incrementBy)

					next()

				})

			var changeTo = 78

			instance.set('value2', changeTo)

			instance.save().complete(function(errors, result) {

				expect(num_called).to.equal(repeat_n_times)

				var expectedValue2 = changeTo

				for (var n = 1; n <= repeat_n_times; n++)
					expectedValue2 += incrementBy

				// The data should have been changed by the 'beforeUpdate' hooks.
				expect(result.get('value2')).to.equal(expectedValue2)

				done()

			})

		})

	})

	it('should not execute any of the callbacks, when validation failed', function(done) {

		model.clearHooks()

		var data = fixtures[0]

		model.create(data).complete(function(errors, instance) {

			if (errors)
			{
				console.log(errors)
				return done(new Error('An unexpected error has occurred'))
			}

			var repeat_n_times = 3, num_called = 0, incrementBy = 51

			for (var n = 1; n <= repeat_n_times; n++)
				model.addHook('beforeUpdate', function(next) {

					num_called++

					// Change data before the instance is updated.
					this.set('value2', this.get('value2') + incrementBy)

					next()

				})

			var changeTo = 78

			instance.set('value2', changeTo)

			instance.save().complete(function(errors, result) {

				expect(num_called).to.equal(repeat_n_times)

				var expectedValue2 = changeTo

				for (var n = 1; n <= repeat_n_times; n++)
					expectedValue2 += incrementBy

				// The data should have been changed by the 'beforeUpdate' hooks.
				expect(result.get('value2')).to.equal(expectedValue2)

				done()

			})

		})

	})

})

