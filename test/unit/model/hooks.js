var Instance = require('../../../lib/instance')

var chai = require('chai')
var expect = chai.expect

var drivers = require('../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Model#hooks', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	describe('\'hooks\' option', function() {

		var num_called = 0

		var model = sequel.define('HooksTest', {

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

		it('should execute the callbacks added via the model\'s \'hooks\' option', function(done) {

			model.create({}).complete(function(errors, instance) {

				expect(num_called).to.equal(3)
				done()

			})

		})

	})

	it('should execute hook callbacks in the order that they are added', function(done) {

		var model = sequel.define('SomeModel', {

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

		model.create({}).complete(function() {

			done()

		})

	})

	it('hook callbacks should be executed with the instance context', function(done) {

		var model = sequel.define('SomeModel', {

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

		model.create({}).complete(function() {

			done()

		})

	})

	describe('addHook(type, fn)', function() {

		var model = sequel.define('HooksTest2', {

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

		var created = []

		it('should execute all callbacks added to the \'beforeValidate\' hook before the validation step', function(done) {

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

				created.push(instance)

				done()

			})

		})

		it('should not execute any of the callbacks added to the \'beforeValidate\' hook before validation, when the validation step is skipped', function(done) {

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

				created.push(instance)

				done()

			})

		})

		it('should execute all callbacks added to the \'beforeCreate\' hook before a new instance is created', function(done) {

			model.clearHooks()

			var repeat_n_times = 3, num_called = 0, newValue2 = 880

			for (var n = 1; n <= repeat_n_times; n++)
				model.addHook('beforeCreate', function(next) {

					num_called++

					// Change data before the instance is created.
					this.set('value2', newValue2)

					next()

				})

			var data = {}

			data.name = 'another test'
			data.value1 = 33
			data.value2 = 4350

			model.create(data).complete(function(errors, instance) {

				expect(num_called).to.equal(repeat_n_times)

				// The data should have been changed by the 'beforeCreate' hooks.
				expect(instance.get('value2')).to.equal(newValue2)

				created.push(instance)

				done()

			})

		})

		it('should execute all callbacks added to the \'afterCreate\' hook after a new instance is created', function(done) {

			model.clearHooks()

			var repeat_n_times = 3, num_called = 0, newValue1 = 77

			for (var n = 1; n <= repeat_n_times; n++)
				model.addHook('afterCreate', function(next) {

					num_called++

					// Change data after the instance is created.
					this.set('value1', newValue1)

					next()

				})

			var data = {}

			data.name = 'another test'
			data.value1 = 33
			data.value2 = 4350

			model.create(data).complete(function(errors, instance) {

				expect(num_called).to.equal(repeat_n_times)

				// The data should have been changed by the 'afterCreate' hooks.
				expect(instance.get('value1')).to.equal(newValue1)

				created.push(instance)

				var id = instance.get('id')

				model.find(id).complete(function(error, result) {

					// The data should equal what it was before the 'afterCreate' hooks.
					// Because, the data was changed AFTER it was inserted into the database.
					expect(result.get('value1')).to.equal(data.value1)

					done()

				})

			})

		})

		it('should not execute any callbacks added to the \'afterCreate\' hook if the creation of an instance failed', function(done) {

			model.clearHooks()

			var repeat_n_times = 3, num_called = 0

			for (var n = 1; n <= repeat_n_times; n++)
				model.addHook('afterCreate', function(next) {

					num_called++

					next()

				})

			var data = {}

			data.name = 'another test'
			data.value1 = 33
			data.value2 = 5500// Should cause validation to fail.

			model.create(data).complete(function(errors, instance) {

				expect(num_called).to.equal(0)
				done()

			})

		})

		it('should execute all callbacks added to the \'beforeUpdate\' hook before an existing instance is updated', function(done) {

			model.clearHooks()

			// Use one of the instances that was created by a previous test.
			var instance = created[1]

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

		it('should execute all callbacks added to the \'afterUpdate\' hook after an existing instance is updated', function(done) {

			model.clearHooks()

			// Use one of the instances that was created by a previous test.
			var instance = created[0]

			var repeat_n_times = 3, num_called = 0, incrementBy = 7

			for (var n = 1; n <= repeat_n_times; n++)
				model.addHook('afterUpdate', function(next) {

					num_called++

					// Change data after the instance is updated.
					this.set('modata', this.get('modata') + incrementBy)

					next()

				})

			var changeTo = 2

			instance.set('modata', changeTo)

			instance.save().complete(function(errors, result) {

				expect(num_called).to.equal(repeat_n_times)

				var expectedValue = changeTo

				for (var n = 1; n <= repeat_n_times; n++)
					expectedValue += incrementBy

				// The data should have been changed by the 'afterUpdate' hooks.
				expect(result.get('modata')).to.equal(expectedValue)

				var id = instance.get('id')

				model.find(id).complete(function(error, result2) {

					// The data should equal what it was before the 'afterUpdate' hooks.
					// Because, the data was changed AFTER the database entry was updated.
					expect(result2.get('modata')).to.equal(changeTo)

					done()

				})

			})

		})

		it('should not execute any callbacks added to the \'afterUpdate\' hook if updating an instance failed', function(done) {

			model.clearHooks()

			var repeat_n_times = 3, num_called = 0

			for (var n = 1; n <= repeat_n_times; n++)
				model.addHook('afterUpdate', function(next) {

					num_called++

					next()

				})

			// Use one of the instances that was created by a previous test.
			var instance = created[1]

			// Should not pass validation.
			instance.set('value2', 5500)
			
			instance.save().complete(function(errors, instance) {

				expect(num_called).to.equal(0)
				done()

			})

		})

		var beforeDestroy = ['beforeDestroy', 'beforeDelete']

		for (var i in beforeDestroy)
			(function(hookType) {

				it('should execute all callbacks added to the \'' + hookType + '\' hook before an instance is destroyed', function(done) {

					model.clearHooks()

					// Use one of the instances that was created by a previous test.
					var instance = created[0]
					var id = instance.get('id')

					var repeat_n_times = 3, num_called = 0

					for (var n = 1; n <= repeat_n_times; n++)
						model.addHook(hookType, function(next) {

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

				it('should execute all callbacks added to the \'' + hookType + '\' hook after an instance is destroyed', function(done) {

					model.clearHooks()

					// Use one of the instances that was created by a previous test.
					var instance = created[0]
					var id = instance.get('id')

					var repeat_n_times = 3, num_called = 0

					for (var n = 1; n <= repeat_n_times; n++)
						model.addHook(hookType, function(next) {

							num_called++

							// Verify that the instance has been destroyed.
							model.find(id).complete(function(error, result) {

								expect(result).to.equal(null)
								done()

							})

						})

					instance.destroy().complete(function() {

						expect(num_called).to.equal(repeat_n_times)

						// Remove the instance that was just destroyed.
						created = created.slice(1)

						done()

					})

				})

			})(afterDestroy[i])

	})

})

})(drivers[i].sequel, drivers[i].TestManager)