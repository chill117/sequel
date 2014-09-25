var _ = require('underscore')
var async = require('async')
var expect = require('chai').expect

var Instances = require('../../../lib/instances')


describe('Model#findAll([options])', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	it('should be a method', function() {

		var model = sequel.define('SomeModel', {tableName: 'some_table'})

		expect(model.findAll).to.be.a('function')

	})

	describe('with the test table populated with data', function() {

		var model

		before(function() {

			model = sequel.define('CRUDFindAllModel', {

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

		it('should return all instances', function(done) {

			model.findAll().complete(function(error, results) {

				expect(error).to.equal(null)
				expect(results).to.have.length(instances.length)

				for (var i in results)
					expect(results[i].get()).to.deep.equal(instances[i].get())

				done()

			})

		})

		it('should return instances in the correct order; using ASC', function(done) {

			var options = {
				order: 'value1 ASC'
			}

			var expected = new Instances(instances)

			expected.orderBy(options.order)

			model.findAll(options).complete(function(error, results) {

				expect(error).to.equal(null)
				expect(results).to.have.length(expected.instances.length)

				for (var i in results)
					expect(results[i].get()).to.deep.equal(expected.instances[i].get())

				done()

			})

		})

		it('should return instances in the correct order; using DESC', function(done) {

			var options = {
				order: 'value1 DESC'
			}

			var expected = new Instances(instances)

			expected.orderBy(options.order)

			model.findAll(options).complete(function(error, results) {

				expect(error).to.equal(null)
				expect(results).to.have.length(expected.instances.length)

				for (var i in results)
					expect(results[i].get()).to.deep.equal(expected.instances[i].get())

				done()

			})

		})

		it('should return correct results; using "equals" operator in where clause', function(done) {

			var options = {
				where: {
					value1: 45
				}
			}

			var expected = new Instances(instances)

			expected.filter(options.where)

			model.findAll(options).complete(function(error, results) {

				expect(error).to.equal(null)
				expect(results).to.have.length(expected.instances.length)

				for (var i in results)
					expect(results[i].get()).to.deep.equal(expected.instances[i].get())

				done()

			})

		})

		it('should return correct results; using "greater than" operator in where clause', function(done) {

			var options = {
				where: {
					value1: {gt: 45}
				}
			}

			var expected = new Instances(instances)

			expected.filter(options.where)

			model.findAll(options).complete(function(error, results) {

				expect(error).to.equal(null)
				expect(results).to.have.length(expected.instances.length)

				for (var i in results)
					expect(results[i].get()).to.deep.equal(expected.instances[i].get())

				done()

			})

		})

		it('should return correct results; using "greater than or equal to" operator in where clause', function(done) {

			var options = {
				where: {
					value1: {gte: 45}
				}
			}

			var expected = new Instances(instances)

			expected.filter(options.where)

			model.findAll(options).complete(function(error, results) {

				expect(error).to.equal(null)
				expect(results).to.have.length(expected.instances.length)

				for (var i in results)
					expect(results[i].get()).to.deep.equal(expected.instances[i].get())

				done()

			})

		})

		it('should return correct results; using "less than" operator in where clause', function(done) {

			var options = {
				where: {
					value1: {lt: 45}
				}
			}

			var expected = new Instances(instances)

			expected.filter(options.where)

			model.findAll(options).complete(function(error, results) {

				expect(error).to.equal(null)
				expect(results).to.have.length(expected.instances.length)

				for (var i in results)
					expect(results[i].get()).to.deep.equal(expected.instances[i].get())

				done()

			})

		})

		it('should return correct results; using "less than or equal to" operator in where clause', function(done) {

			var options = {
				where: {
					value1: {lte: 45}
				}
			}

			var expected = new Instances(instances)

			expected.filter(options.where)

			model.findAll(options).complete(function(error, results) {

				expect(error).to.equal(null)
				expect(results).to.have.length(expected.instances.length)

				for (var i in results)
					expect(results[i].get()).to.deep.equal(expected.instances[i].get())

				done()

			})

		})

		it('should return correct results; using "not equal" operator in where clause', function(done) {

			var options = {
				where: {
					value1: {ne: 45}
				}
			}

			var expected = new Instances(instances)

			expected.filter(options.where)

			model.findAll(options).complete(function(error, results) {

				expect(error).to.equal(null)
				expect(results).to.have.length(expected.instances.length)

				for (var i in results)
					expect(results[i].get()).to.deep.equal(expected.instances[i].get())

				done()

			})

		})

	})

	describe('with a test table populated with data', function() {

		before(function() {

			model = sequel.define('CRUDFindAllModel2', {

				id: {
					type: 'integer',
					autoIncrement: true,
					primaryKey: true
				},
				a_string: 'text',
				a_long_string: 'text',
				an_integer: 'integer',
				a_number: 'number',
				a_float: 'float',
				a_decimal: 'decimal',
				a_date: 'date',
				an_array_of_strings: 'array-string',
				an_array_of_integers: 'array-integer',
				an_array_of_numbers: 'array-number',
				an_array_of_floats: 'array-float',
				an_array_of_decimals: 'array-decimal',
				an_array_of_dates: 'array-date',
				an_empty_text_array: 'array-text',
				an_empty_number_array: 'array-number',
				a_read_only_array: {
					type: 'array-text',
					readOnly: true
				}

			}, {

				tableName: 'test_table_3',
				timestamps: false

			})

		})

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

		it('should return correct results; using "less than" clause on a date field in the where clause', function(done) {

			var options = {
				where: {
					a_date: {
						lt: model.now()
					}
				}
			}

			var expected = new Instances(instances)

			expected.filter(options.where)

			model.findAll(options).complete(function(error, results) {

				expect(error).to.equal(null)
				expect(results).to.have.length(expected.instances.length)

				for (var i in results)
					expect(results[i].get()).to.deep.equal(expected.instances[i].get())

				done()

			})

		})

	})

})