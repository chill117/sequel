var Instance = require('../../../../lib/instance')

var async = require('async')
var expect = require('chai').expect


describe('Model#hooks \'beforeValidate\'', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var model

	before(function() {

		model = sequel.define('ModelHooksBeforeValidate', {

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

	it('should execute all of the callbacks before the validation step', function(done) {

		model.clearHooks()

		var repeat_n_times = 3, num_called = 0, validValue2 = 4500

		for (var n = 1; n <= repeat_n_times; n++)
			model.addHook('beforeValidate', function(next) {

				num_called++

				// Fix data so that it will pass validation.
				this.set('value2', validValue2)

				next()

			})

		var data = {}

		data.name = 'a test'
		data.value1 = 25
		data.value2 = 5500

		model.create(data).complete(function(errors, instance) {

			// The data should have been fixed by the 'beforeValidate' hooks.
			// So, the instance should be created.

			expect(errors).to.equal(null)
			expect(instance).to.not.equal(null)
			expect(instance).to.be.an('object')
			expect(instance.get('value2')).to.equal(validValue2)
			expect(num_called).to.equal(repeat_n_times)
			done()

		})

	})

	it('should not execute any of the callbacks, when the validation step is skipped', function(done) {

		model.clearHooks()

		var repeat_n_times = 3, num_called = 0

		for (var n = 1; n <= repeat_n_times; n++)
			model.addHook('beforeValidate', function(next) {

				num_called++
				next()

			})

		var data = {}

		data.name = 'a test'
		data.value1 = 25
		data.value2 = 5500

		model.create(data, {validate: false}).complete(function(errors, instance) {

			expect(errors).to.equal(null)
			expect(instance).to.not.equal(null)
			expect(num_called).to.equal(0)
			done()

		})

	})

})

