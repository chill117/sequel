var async = require('async')
var expect = require('chai').expect

var Instances = require('../../../lib/instances')


describe('Model#count([options])', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var model

	before(function() {

		model = sequel.define('CRUDCountModel', {

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

		expect(model.count).to.be.a('function')

	})

	describe('with the test table populated with data', function() {

		var instances = []

		before(function(done) {

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

		it('should return an accurate count', function(done) {

			model.count().complete(function(error, count) {

				expect(error).to.equal(null)
				expect(count).to.equal(instances.length)

				done()

			})

		})

		it('should return an accurate count; using "equals" operator in where clause', function(done) {

			var options = {
				where: {
					value1: 45
				}
			}

			var expected = new Instances(instances)

			expected.filter(options.where)

			model.count(options).complete(function(error, count) {

				expect(error).to.equal(null)
				expect(count).to.equal(expected.instances.length)

				done()

			})

		})

		it('should return an accurate count; using "greater than" operator in where clause', function(done) {

			var options = {
				where: {
					value1: {gt: 45}
				}
			}

			var expected = new Instances(instances)

			expected.filter(options.where)

			model.count(options).complete(function(error, count) {

				expect(error).to.equal(null)
				expect(count).to.equal(expected.instances.length)

				done()

			})

		})

		it('should return an accurate count; using "greater than or equal to" operator in where clause', function(done) {

			var options = {
				where: {
					value1: {gte: 45}
				}
			}

			var expected = new Instances(instances)

			expected.filter(options.where)

			model.count(options).complete(function(error, count) {

				expect(error).to.equal(null)
				expect(count).to.equal(expected.instances.length)

				done()

			})

		})

		it('should return an accurate count; using "less than" operator in where clause', function(done) {

			var options = {
				where: {
					value1: {lt: 45}
				}
			}

			var expected = new Instances(instances)

			expected.filter(options.where)

			model.count(options).complete(function(error, count) {

				expect(error).to.equal(null)
				expect(count).to.equal(expected.instances.length)

				done()

			})

		})

		it('should return an accurate count; using "less than or equal to" operator in where clause', function(done) {

			var options = {
				where: {
					value1: {lte: 45}
				}
			}

			var expected = new Instances(instances)

			expected.filter(options.where)

			model.count(options).complete(function(error, count) {

				expect(error).to.equal(null)
				expect(count).to.equal(expected.instances.length)

				done()

			})

		})

		it('should return an accurate count; using "not equal" operator in where clause', function(done) {

			var options = {
				where: {
					value1: {ne: 45}
				}
			}

			var expected = new Instances(instances)

			expected.filter(options.where)

			model.count(options).complete(function(error, count) {

				expect(error).to.equal(null)
				expect(count).to.equal(expected.instances.length)

				done()

			})

		})

	})

})