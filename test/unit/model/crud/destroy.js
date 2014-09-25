var async = require('async')
var expect = require('chai').expect

var Instances = require('../../../lib/instances')


describe('Model#destroy([options])', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var model

	before(function() {

		model = sequel.define('CRUDDestroyModel', {

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

	it('should be a method', function() {

		expect(model.destroy).to.be.a('function')

	})

	describe('with the test table populated with data', function() {

		var instances

		beforeEach(function(done) {

			var fixtures = require('../../../fixtures')[model.tableName]

			instances = []

			// Populate the test table with data.
			async.each(fixtures, function(data, nextFixture) {

				model.create(data).complete(function(errors, instance) {

					if (errors)
					{
						console.error(errors)
						return nextFixture(new Error('Unexpected error(s)'))
					}

					instances.push(instance)

					nextFixture()

				})

			}, done)

		})

		afterEach(function(done) {

			// Clear the test table.

			model.destroy().complete(done)
			
		})

		it('should destroy the expected instances; using "equals" operator in where clause', function(done) {

			var options = {
				where: {
					value1: 50
				}
			}

			var expected = new Instances(instances)

			expected.invertedFilter(options.where)

			model.destroy(options).complete(function(error) {

				expect(error).to.equal(null)

				model.findAll().complete(function(error, results) {

					expect(error).to.equal(null)
					expect(results).to.have.length(expected.instances.length)

					for (var i in results)
						expect(results[i].get()).to.deep.equal(expected.instances[i].get())

					done()

				})

			})

		})

		it('should destroy the expected instances; using "greater than" operator in where clause', function(done) {

			var options = {
				where: {
					value1: {gt: 50}
				}
			}

			var expected = new Instances(instances)

			expected.invertedFilter(options.where)

			model.destroy(options).complete(function(error) {

				expect(error).to.equal(null)

				model.findAll().complete(function(error, results) {

					expect(error).to.equal(null)
					expect(results).to.have.length(expected.instances.length)

					for (var i in results)
						expect(results[i].get()).to.deep.equal(expected.instances[i].get())

					done()

				})

			})

		})

		it('should destroy the expected instances; using "greater than or equal to" operator in where clause', function(done) {

			var options = {
				where: {
					value1: {gte: 50}
				}
			}

			var expected = new Instances(instances)

			expected.invertedFilter(options.where)

			model.destroy(options).complete(function(error) {

				expect(error).to.equal(null)

				model.findAll().complete(function(error, results) {

					expect(error).to.equal(null)
					expect(results).to.have.length(expected.instances.length)

					for (var i in results)
						expect(results[i].get()).to.deep.equal(expected.instances[i].get())

					done()

				})

			})

		})

		it('should destroy the expected instances; using "less than" operator in where clause', function(done) {

			var options = {
				where: {
					value1: {lt: 50}
				}
			}

			var expected = new Instances(instances)

			expected.invertedFilter(options.where)

			model.destroy(options).complete(function(error) {

				expect(error).to.equal(null)

				model.findAll().complete(function(error, results) {

					expect(error).to.equal(null)
					expect(results).to.have.length(expected.instances.length)

					for (var i in results)
						expect(results[i].get()).to.deep.equal(expected.instances[i].get())

					done()

				})

			})

		})

		it('should destroy the expected instances; using "less than or equal to" operator in where clause', function(done) {

			var options = {
				where: {
					value1: {lte: 50}
				}
			}

			var expected = new Instances(instances)

			expected.invertedFilter(options.where)

			model.destroy(options).complete(function(error) {

				expect(error).to.equal(null)

				model.findAll().complete(function(error, results) {

					expect(error).to.equal(null)
					expect(results).to.have.length(expected.instances.length)

					for (var i in results)
						expect(results[i].get()).to.deep.equal(expected.instances[i].get())

					done()

				})

			})

		})

		it('should destroy the expected instances; using "not equal" operator in where clause', function(done) {

			var options = {
				where: {
					value1: {ne: 50}
				}
			}

			var expected = new Instances(instances)

			expected.invertedFilter(options.where)

			model.destroy(options).complete(function(error) {

				expect(error).to.equal(null)

				model.findAll().complete(function(error, results) {

					expect(error).to.equal(null)
					expect(results).to.have.length(expected.instances.length)

					for (var i in results)
						expect(results[i].get()).to.deep.equal(expected.instances[i].get())

					done()

				})

			})

		})

	})

})