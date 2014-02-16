var modeler = require('../../modeler')
var TestManager = require('../../test-manager')

var _ = require('underscore')
var async = require('async')
var chai = require('chai')
var expect = chai.expect


describe('Model#hooks', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var table = 'test_table_1'

	var model = modeler.define({

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

		tableName: table

	})

	var created = []

	it('should execute all callbacks added to the \'beforeValidate\' hook (in the order they were added) before the validation step', function(done) {

		var repeat_n_times = 3

		for (var n = 1; n <= repeat_n_times; n++)
			model.addHook('beforeValidate', _.bind(fixValueBeforeValidate, undefined, n))

		var num_called = 0, validValue2 = 4500

		function fixValueBeforeValidate(call_order, values, next) {

			num_called++

			expect(num_called).to.equal(call_order)
			expect(values).to.be.an('object')
			expect(next).to.be.a('function')

			// Fix data so that it will pass validation.
			values.value2 = validValue2

			next(null, values)

		}

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

			created.push(instance)

			done()

		})

	})

	it('should not execute any of the callbacks added to the \'beforeValidate\' hook before validation, when the validation step is skipped', function(done) {

		model.clearHooks()

		var repeat_n_times = 3

		for (var n = 1; n <= repeat_n_times; n++)
			model.addHook('beforeValidate', fixValueBeforeValidate)

		var num_called = 0

		function fixValueBeforeValidate(values, next) {

			num_called++

			next()

		}

		var data = {}

		data.name = 'a test'
		data.value1 = 25
		data.value2 = 5500

		model.create(data, {validate: false}).complete(function(errors, instance) {

			expect(errors).to.equal(null)
			expect(instance).to.not.equal(null)
			expect(num_called).to.equal(0)

			created.push(instance)

			done()

		})

	})

	it('should execute all callbacks added to the \'beforeCreate\' hook (in the order they were added) before a new instance is created', function(done) {

		model.clearHooks()

		var repeat_n_times = 3

		for (var n = 1; n <= repeat_n_times; n++)
			model.addHook('beforeCreate', _.bind(changeValueBeforeCreate, undefined, n))

		var num_called = 0, newValue2 = 880

		function changeValueBeforeCreate(call_order, values, next) {

			num_called++

			expect(num_called).to.equal(call_order)
			expect(values).to.be.an('object')
			expect(next).to.be.a('function')

			// Change data before the instance is created.
			values.value2 = newValue2

			next(null, values)

		}

		var data = {}

		data.name = 'another test'
		data.value1 = 33
		data.value2 = 4350

		model.create(data).complete(function(errors, instance) {

			expect(errors).to.equal(null)
			expect(instance).to.not.equal(null)
			expect(instance).to.be.an('object')

			// The data should have been changed by the 'beforeCreate' hooks.
			expect(instance.get('value2')).to.equal(newValue2)

			expect(num_called).to.equal(repeat_n_times)

			created.push(instance)

			done()

		})

	})

	it('should execute all callbacks added to the \'afterCreate\' hook (in the order they were added) after a new instance is created', function(done) {

		model.clearHooks()

		var repeat_n_times = 3

		for (var n = 1; n <= repeat_n_times; n++)
			model.addHook('afterCreate', _.bind(changeValueAfterCreate, undefined, n))

		var num_called = 0, newValue1 = 77

		function changeValueAfterCreate(call_order, values, next) {

			num_called++

			expect(num_called).to.equal(call_order)
			expect(values).to.be.an('object')
			expect(next).to.be.a('function')

			// Change data after the instance is created.
			values.value1 = newValue1

			next(null, values)

		}

		var data = {}

		data.name = 'another test'
		data.value1 = 33
		data.value2 = 4350

		model.create(data).complete(function(errors, instance) {

			expect(errors).to.equal(null)
			expect(instance).to.not.equal(null)
			expect(instance).to.be.an('object')

			// The data should have been changed by the 'afterCreate' hooks.
			expect(instance.get('value1')).to.equal(newValue1)

			expect(num_called).to.equal(repeat_n_times)

			created.push(instance)

			var id = instance.get('id')

			model.find(id).complete(function(error, result) {

				expect(error).to.equal(null)
				expect(result).to.not.equal(null)
				expect(result).to.be.an('object')

				// The data should equal what it was before the 'afterCreate' hooks.
				// Because, the data was changed AFTER it was inserted into the database.
				expect(result.get('value1')).to.equal(data.value1)

				done()

			})

		})

	})

	it('should not execute any callbacks added to the \'afterCreate\' hook if the creation of an instance failed', function(done) {

		model.clearHooks()

		var repeat_n_times = 3

		for (var n = 1; n <= repeat_n_times; n++)
			model.addHook('afterCreate', shouldNotBeCalled)

		var num_called = 0

		function shouldNotBeCalled(values, next) {

			num_called++

			next()

		}

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

	it('should execute all callbacks added to the \'beforeUpdate\' hook (in the order they were added) before an existing instance is updated', function(done) {

		model.clearHooks()

		// Use one of the instances that was created by a previous test.
		var instance = created[1]

		var repeat_n_times = 3

		for (var n = 1; n <= repeat_n_times; n++)
			model.addHook('beforeUpdate', _.bind(changeValueBeforeUpdate, undefined, n))

		var num_called = 0, incrementBy = 51

		function changeValueBeforeUpdate(call_order, values, next) {

			num_called++

			expect(num_called).to.equal(call_order)
			expect(values).to.be.an('object')
			expect(values).to.deep.equal(instance.data)
			expect(next).to.be.a('function')

			// Change data before the instance is updated.
			values.value2 += incrementBy

			next(null, values)

		}

		var changeTo = 78

		instance.set('value2', changeTo)

		instance.save().complete(function(errors, result) {

			expect(errors).to.equal(null)
			expect(result).to.not.equal(null)
			expect(result).to.be.an('object')

			var expectedValue2 = changeTo

			for (var n = 1; n <= repeat_n_times; n++)
				expectedValue2 += incrementBy

			// The data should have been changed by the 'beforeUpdate' hooks.
			expect(result.get('value2')).to.equal(expectedValue2)

			expect(num_called).to.equal(repeat_n_times)

			done()

		})

	})

	it('should execute all callbacks added to the \'afterUpdate\' hook (in the order they were added) after an existing instance is updated', function(done) {

		model.clearHooks()

		// Use one of the instances that was created by a previous test.
		var instance = created[0]

		var repeat_n_times = 3

		for (var n = 1; n <= repeat_n_times; n++)
			model.addHook('afterUpdate', _.bind(changeValueAfterUpdate, undefined, n))

		var num_called = 0, incrementBy = 7

		function changeValueAfterUpdate(call_order, values, next) {

			num_called++

			expect(num_called).to.equal(call_order)
			expect(values).to.be.an('object')
			expect(values).to.deep.equal(instance.data)
			expect(next).to.be.a('function')

			// Change data after the instance is updated.
			values.modata += incrementBy

			next(null, values)

		}

		var changeTo = 2

		instance.set('modata', changeTo)

		instance.save().complete(function(errors, result) {

			expect(errors).to.equal(null)
			expect(result).to.not.equal(null)
			expect(result).to.be.an('object')

			var expectedValue = changeTo

			for (var n = 1; n <= repeat_n_times; n++)
				expectedValue += incrementBy

			// The data should have been changed by the 'afterUpdate' hooks.
			expect(result.get('modata')).to.equal(expectedValue)

			expect(num_called).to.equal(repeat_n_times)

			var id = instance.get('id')

			model.find(id).complete(function(error, result2) {

				expect(error).to.equal(null)
				expect(result2).to.not.equal(null)
				expect(result2).to.be.an('object')

				// The data should equal what it was before the 'afterUpdate' hooks.
				// Because, the data was changed AFTER the database entry was updated.
				expect(result2.get('modata')).to.equal(changeTo)

				done()

			})

		})

	})

	it('should not execute any callbacks added to the \'afterUpdate\' hook if updating an instance failed', function(done) {

		model.clearHooks()

		var repeat_n_times = 3

		for (var n = 1; n <= repeat_n_times; n++)
			model.addHook('afterUpdate', shouldNotBeCalled)

		var num_called = 0

		function shouldNotBeCalled(values, next) {

			num_called++

			next()

		}

		// Use one of the instances that was created by a previous test.
		var instance = created[1]

		// Should not pass validation.
		instance.set('value2', 5500)
		
		instance.save().complete(function(errors, instance) {

			expect(errors).to.not.equal(null)
			expect(instance).to.equal(null)

			expect(num_called).to.equal(0)

			done()

		})

	})

	var beforeDestroy = ['beforeDestroy', 'beforeDelete']

	for (var i in beforeDestroy)
		(function(hookType) {

			it('should execute all callbacks added to the \'' + hookType + '\' hook (in the order they were added) before an instance is destroyed', function(done) {

				model.clearHooks()

				// Use one of the instances that was created by a previous test.
				var instance = created[0]
				var id = instance.get('id')

				var repeat_n_times = 3

				for (var n = 1; n <= repeat_n_times; n++)
					model.addHook(hookType, _.bind(checkBeforeDestroy, undefined, n))

				var num_called = 0

				function checkBeforeDestroy(call_order, values, next) {

					num_called++

					expect(num_called).to.equal(call_order)
					expect(values).to.be.an('object')
					expect(values).to.deep.equal(instance.data)
					expect(next).to.be.a('function')

					// Verify that the instance has not been destroyed yet.
					model.find(id).complete(function(error, result) {

						expect(error).to.equal(null)
						expect(result).to.not.equal(null)
						expect(result.get('id')).to.equal(id)

						next()

					})

				}

				instance.destroy().complete(function(error) {

					expect(error).to.equal(null)
					expect(num_called).to.equal(repeat_n_times)

					// Verify that the instance has been destroyed.
					model.find(id).complete(function(error, result) {

						expect(error).to.equal(null)
						expect(result).to.equal(null)

						// Remove the instance that was just destroyed.
						created = created.slice(1)

						done()

					})

				})

			})

		})(beforeDestroy[i])


	var afterDestroy = ['afterDestroy', 'afterDelete']

	for (var i in afterDestroy)
		(function(hookType) {

			it('should execute all callbacks added to the \'' + hookType + '\' hook (in the order they were added) after an instance is destroyed', function(done) {

				model.clearHooks()

				// Use one of the instances that was created by a previous test.
				var instance = created[0]
				var id = instance.get('id')

				var repeat_n_times = 3

				for (var n = 1; n <= repeat_n_times; n++)
					model.addHook(hookType, _.bind(checkAfterDestroy, undefined, n))

				var num_called = 0

				function checkAfterDestroy(call_order, values, next) {

					num_called++

					expect(num_called).to.equal(call_order)
					expect(values).to.be.an('object')
					expect(values).to.deep.equal(instance.data)
					expect(next).to.be.a('function')

					// Verify that the instance has been destroyed.
					model.find(id).complete(function(error, result) {

						expect(error).to.equal(null)
						expect(result).to.equal(null)

						done()

					})

				}

				instance.destroy().complete(function(error) {

					expect(error).to.equal(null)
					expect(num_called).to.equal(repeat_n_times)

					// Remove the instance that was just destroyed.
					created = created.slice(1)

					done()

				})

			})

		})(afterDestroy[i])

})