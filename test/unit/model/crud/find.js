var async = require('async')
var expect = require('chai').expect


describe('Model#find([primay_key, ]options)', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	it('should be a method', function() {

		var model = sequel.define('SomeModel', {tableName: 'some_table'})

		expect(model.find).to.be.a('function')

	})

	describe('with the test table populated with data', function() {

		var model

		before(function() {

			model = sequel.define('CRUDFindModel', {

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

		it('should return NULL when no instance is found', function(done) {

			var primary_key = 500

			model.find(primary_key).complete(function(error, result) {

				expect(error).to.equal(null)
				expect(result).to.equal(null)

				done()

			})

		})

		it('should return the correct instance', function(done) {

			var instance = instances[1]
			var primary_key = instance.get('id')

			model.find(primary_key).complete(function(error, result) {

				expect(error).to.equal(null)
				expect(result.get()).to.deep.equal(instance.get())

				done()

			})

		})

	})

})