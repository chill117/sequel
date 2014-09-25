var _ = require('underscore')
var async = require('async')
var expect = require('chai').expect

var Instances = require('../../../lib/instances')


describe('Model#update(data[, options])', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var model

	before(function() {

		model = sequel.define('CRUDUpdateModel', {

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

		expect(model.update).to.be.a('function')

	})

	describe('with the test table populated with data', function() {

		var instances

		beforeEach(function(done) {

			instances = []

			var fixtures = require('../../../fixtures')[model.tableName]

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

		it('should update all instances', function(done) {

			var data = {
				name: '--UPDATE--'
			}

			var options = {}

			model.update(data, options).complete(function(errors) {

				expect(errors).to.equal(null)

				model.findAll().complete(function(error, results) {

					expect(error).to.equal(null)
					expect(results).to.have.length(instances.length)

					for (var i in results)
						for (var fieldName in data)
							expect(results[i].get(fieldName)).to.equal(data[fieldName])

					done()

				})

			})

		})

		it('should update the correct instances; using "equals" operator in where clause', function(done) {

			var data = {
				name: '--UPDATE--'
			}

			var options = {
				where: {
					value1: 45
				}
			}

			var expected = new Instances(instances)

			expected.filter(options.where)

			model.update(data, options).complete(function(errors) {

				expect(errors).to.equal(null)

				model.findAll().complete(function(error, results) {

					expect(error).to.equal(null)
					expect(results).to.have.length(instances.length)

					for (var i in results)
					{
						var shouldHaveBeenUpdated = false

						findInExpectedInstances:
						for (var n in expected.instances)
							if (expected.instances[n].get('id') == results[i].get('id'))
							{
								shouldHaveBeenUpdated = true
								break findInExpectedInstances
							}

						for (var fieldName in data)
							if (shouldHaveBeenUpdated)
								expect(results[i].get(fieldName)).to.equal(data[fieldName])
							else
								expect(results[i].get(fieldName)).to.equal(instances[i].get(fieldName))
					}

					done()

				})

			})

		})

		it('should update the correct instances; using "greater than" operator in where clause', function(done) {

			var data = {
				name: '--UPDATE--'
			}

			var options = {
				where: {
					value1: {gt: 45}
				}
			}

			var expected = new Instances(instances)

			expected.filter(options.where)

			model.update(data, options).complete(function(errors) {

				expect(errors).to.equal(null)

				model.findAll().complete(function(error, results) {

					expect(error).to.equal(null)
					expect(results).to.have.length(instances.length)

					for (var i in results)
					{
						var shouldHaveBeenUpdated = false

						findInExpectedInstances:
						for (var n in expected.instances)
							if (expected.instances[n].get('id') == results[i].get('id'))
							{
								shouldHaveBeenUpdated = true
								break findInExpectedInstances
							}

						for (var fieldName in data)
							if (shouldHaveBeenUpdated)
								expect(results[i].get(fieldName)).to.equal(data[fieldName])
							else
								expect(results[i].get(fieldName)).to.equal(instances[i].get(fieldName))
					}

					done()

				})

			})

		})

		it('should update the correct instances; using "greater than or equal to" operator in where clause', function(done) {

			var data = {
				name: '--UPDATE--'
			}

			var options = {
				where: {
					value1: {gte: 45}
				}
			}

			var expected = new Instances(instances)

			expected.filter(options.where)

			model.update(data, options).complete(function(errors) {

				expect(errors).to.equal(null)

				model.findAll().complete(function(error, results) {

					expect(error).to.equal(null)
					expect(results).to.have.length(instances.length)

					for (var i in results)
					{
						var shouldHaveBeenUpdated = false

						findInExpectedInstances:
						for (var n in expected.instances)
							if (expected.instances[n].get('id') == results[i].get('id'))
							{
								shouldHaveBeenUpdated = true
								break findInExpectedInstances
							}

						for (var fieldName in data)
							if (shouldHaveBeenUpdated)
								expect(results[i].get(fieldName)).to.equal(data[fieldName])
							else
								expect(results[i].get(fieldName)).to.equal(instances[i].get(fieldName))
					}

					done()

				})

			})

		})

		it('should update the correct instances; using "less than" operator in where clause', function(done) {

			var data = {
				name: '--UPDATE--'
			}

			var options = {
				where: {
					value1: {lt: 45}
				}
			}

			var expected = new Instances(instances)

			expected.filter(options.where)

			model.update(data, options).complete(function(errors) {

				expect(errors).to.equal(null)

				model.findAll().complete(function(error, results) {

					expect(error).to.equal(null)
					expect(results).to.have.length(instances.length)

					for (var i in results)
					{
						var shouldHaveBeenUpdated = false

						findInExpectedInstances:
						for (var n in expected.instances)
							if (expected.instances[n].get('id') == results[i].get('id'))
							{
								shouldHaveBeenUpdated = true
								break findInExpectedInstances
							}

						for (var fieldName in data)
							if (shouldHaveBeenUpdated)
								expect(results[i].get(fieldName)).to.equal(data[fieldName])
							else
								expect(results[i].get(fieldName)).to.equal(instances[i].get(fieldName))
					}

					done()

				})

			})

		})

		it('should update the correct instances; using "less than or equal to" operator in where clause', function(done) {

			var data = {
				name: '--UPDATE--'
			}

			var options = {
				where: {
					value1: {lte: 45}
				}
			}

			var expected = new Instances(instances)

			expected.filter(options.where)

			model.update(data, options).complete(function(errors) {

				expect(errors).to.equal(null)

				model.findAll().complete(function(error, results) {

					expect(error).to.equal(null)
					expect(results).to.have.length(instances.length)

					for (var i in results)
					{
						var shouldHaveBeenUpdated = false

						findInExpectedInstances:
						for (var n in expected.instances)
							if (expected.instances[n].get('id') == results[i].get('id'))
							{
								shouldHaveBeenUpdated = true
								break findInExpectedInstances
							}

						for (var fieldName in data)
							if (shouldHaveBeenUpdated)
								expect(results[i].get(fieldName)).to.equal(data[fieldName])
							else
								expect(results[i].get(fieldName)).to.equal(instances[i].get(fieldName))
					}

					done()

				})

			})

		})

		it('should update the correct instances; using "not equal" operator in where clause', function(done) {

			var data = {
				name: '--UPDATE--'
			}

			var options = {
				where: {
					value1: {ne: 45}
				}
			}

			var expected = new Instances(instances)

			expected.filter(options.where)

			model.update(data, options).complete(function(errors) {

				expect(errors).to.equal(null)

				model.findAll().complete(function(error, results) {

					expect(error).to.equal(null)
					expect(results).to.have.length(instances.length)

					for (var i in results)
					{
						var shouldHaveBeenUpdated = false

						findInExpectedInstances:
						for (var n in expected.instances)
							if (expected.instances[n].get('id') == results[i].get('id'))
							{
								shouldHaveBeenUpdated = true
								break findInExpectedInstances
							}

						for (var fieldName in data)
							if (shouldHaveBeenUpdated)
								expect(results[i].get(fieldName)).to.equal(data[fieldName])
							else
								expect(results[i].get(fieldName)).to.equal(instances[i].get(fieldName))
					}

					done()

				})

			})

		})

		it('should increment the value of a single field for all instances', function(done) {

			var data = {
				value2: {increment: 3}
			}

			var options = {}

			model.update(data, options).complete(function(errors) {

				expect(errors).to.equal(null)

				model.findAll().complete(function(error, results) {

					expect(error).to.equal(null)
					expect(results).to.have.length(instances.length)

					for (var i in results)
					{
						var valueBefore = instances[i].get('value2')
						var valueAfter = results[i].get('value2')
						var expectedValue = valueBefore + data.value2.increment

						expect(valueAfter).to.equal(expectedValue)
					}

					done()

				})

			})

		})

		it('should decrement the value of a single field for all instances', function(done) {

			var data = {
				value2: {decrement: 2}
			}

			var options = {}

			model.update(data, options).complete(function(errors) {

				expect(errors).to.equal(null)

				model.findAll().complete(function(error, results) {

					expect(error).to.equal(null)
					expect(results).to.have.length(instances.length)

					for (var i in results)
					{
						var valueBefore = instances[i].get('value2')
						var valueAfter = results[i].get('value2')
						var expectedValue = valueBefore - data.value2.decrement

						expect(valueAfter).to.equal(expectedValue)
					}

					done()

				})

			})

		})

	})

})

