var async = require('async')
var chai = require('chai')
var expect = chai.expect

var drivers = require('../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Transaction', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	describe('start()', function() {

		it('should be a method', function() {

			var transaction = sequel.transaction()

			expect(transaction.start).to.not.equal(undefined)
			expect(transaction.start).to.be.a('function')

		})

		it('should not be able to start a transaction after it has already been started', function(done) {

			var transaction = sequel.transaction()

			transaction.start().complete(function(error) {

				if (error)
					return done(new Error(error))

				transaction.start().complete(function(error) {

					expect(error).to.not.equal(null)

					transaction.rollback().complete(function(error) {

						if (error)
							return done(new Error(error))

						done()

					})

				})

			})

		})

	})

	describe('rollback()', function() {

		it('should be a method', function() {

			var transaction = sequel.transaction()

			expect(transaction.rollback).to.not.equal(undefined)
			expect(transaction.rollback).to.be.a('function')

		})

		it('should not be able to rollback a transaction after it has already been rolled back', function(done) {

			var transaction = sequel.transaction()

			transaction.start().complete(function(error) {

				if (error)
					return done(new Error(error))

				transaction.rollback().complete(function(error) {

					if (error)
						return done(new Error(error))

					transaction.rollback().complete(function(error) {

						expect(error).to.not.equal(null)
						done()

					})

				})

			})

		})

		it('should not be able to rollback a transaction after it has already been committed', function(done) {

			var transaction = sequel.transaction()

			transaction.start().complete(function(error) {

				if (error)
					return done(new Error(error))

				transaction.commit().complete(function(error) {

					if (error)
						return done(new Error(error))

					transaction.rollback().complete(function(error) {

						expect(error).to.not.equal(null)
						done()

					})

				})

			})

		})

		describe('', function() {

			before(TestManager.tearDown)
			before(TestManager.setUp)

			var TestModel = getTestModel()

			var instances

			before(function(done) {

				var sampleData = [
					{
						name: 'some test',
						value1: 40,
						value2: 400
					},
					{
						name: 'another test',
						value1: 45,
						value2: 450
					},
					{
						name: 'one last test',
						value1: 50,
						value2: 500
					}
				]

				async.map(sampleData, function(data, next) {

					TestModel.create(data).complete(next)

				}, function(error, results) {

					if (error)
						return done(new Error(error))

					instances = results

					done()

				})

			})

			after(TestManager.tearDown)

			it('rolling back a transaction should cause all changes made during the transaction to be reverted', function(done) {

				var transaction = sequel.transaction()

				transaction.start().complete(function(error) {

					var instance1 = instances[0], newValue = 77

					instance1.set('value1', newValue)

					instance1.save().complete(function(error) {

						if (error)
							return done(new Error(error))

						var instance2 = instances[1]

						instance2.destroy().complete(function(error) {

							if (error)
								return done(new Error(error))

							// Now revert the changes by rolling back the transaction.

							transaction.rollback().complete(function(error) {

								if (error)
									return done(new Error(error))

								var id1 = instance1.get('id')

								// Now, find the instance where we modified one of its values.
								TestModel.find(id1).complete(function(error, instance) {

									if (error)
										return done(new Error(error))

									expect(instance.get('value1')).to.not.equal(newValue)

									var id2 = instance2.get('id')

									// Now, find the instance we deleted.
									TestModel.find(id2).complete(function(error, instance) {

										if (error)
											return done(new Error(error))

										expect(instance).to.not.equal(null)

										done()

									})

								})

							})

						})

					})

				})

			})

		})

	})

	describe('commit()', function() {

		it('should be a method', function() {

			var transaction = sequel.transaction()

			expect(transaction.commit).to.not.equal(undefined)
			expect(transaction.commit).to.be.a('function')

		})

		it('should not be able to commit a transaction after it has already been committed', function(done) {

			var transaction = sequel.transaction()

			transaction.start().complete(function(error) {

				if (error)
					return done(new Error(error))

				transaction.commit().complete(function(error) {

					if (error)
						return done(new Error(error))

					transaction.commit().complete(function(error) {

						expect(error).to.not.equal(null)
						done()

					})

				})

			})

		})

		it('should not be able to commit a transaction after it has already been rolled back', function(done) {

			var transaction = sequel.transaction()

			transaction.start().complete(function(error) {

				if (error)
					return done(new Error(error))

				transaction.rollback().complete(function(error) {

					if (error)
						return done(new Error(error))

					transaction.commit().complete(function(error) {

						expect(error).to.not.equal(null)
						done()

					})

				})

			})

		})

		describe('', function() {

			var TestModel = getTestModel()

			before(TestManager.tearDown)
			before(TestManager.setUp)

			var instances

			before(function(done) {

				var sampleData = [
					{
						name: 'some test',
						value1: 40,
						value2: 400
					},
					{
						name: 'another test',
						value1: 45,
						value2: 450
					},
					{
						name: 'one last test',
						value1: 50,
						value2: 500
					}
				]

				async.map(sampleData, function(data, next) {

					TestModel.create(data).complete(next)

				}, function(error, results) {

					if (error)
						return done(new Error(error))

					instances = results

					done()

				})

			})

			after(TestManager.tearDown)

			it('committing a transaction should cause all changes made during the transaction to be kept', function(done) {

				var transaction = sequel.transaction()

				transaction.start().complete(function(error) {

					var instance1 = instances[0], newValue = 98

					instance1.set('value1', newValue)

					instance1.save().complete(function(error) {

						if (error)
							return done(new Error(error))

						var instance2 = instances[1]

						instance2.destroy().complete(function(error) {

							if (error)
								return done(new Error(error))

							// Now commit the changes.

							transaction.commit().complete(function(error) {

								if (error)
									return done(new Error(error))

								var id1 = instance1.get('id')

								// Now, find the instance where we modified one of its values.
								TestModel.find(id1).complete(function(error, instance) {

									if (error)
										return done(new Error(error))

									expect(instance.get('value1')).to.equal(newValue)

									var id2 = instance2.get('id')

									// Now, find the instance we deleted.
									TestModel.find(id2).complete(function(error, instance) {

										if (error)
											return done(new Error(error))

										expect(instance).to.equal(null)

										done()

									})

								})

							})

						})

					})

				})

			})

		})

	})

})

function getTestModel() {

	return sequel.define('TableOne', {

		id: {
			type: 'integer',
			autoIncrement: true,
			primaryKey: true
		},
		name: {
			type: 'text',
			validate: {
				notNull: true
			}
		},
		value1: {
			type: 'integer',
			validate: {
				notNull: true
			}
		},
		value2: {
			type: 'integer',
			validate: {
				notNull: true
			}
		}

	}, {

		tableName: 'test_table_1'

	})

}

})(drivers[i].sequel, drivers[i].TestManager)