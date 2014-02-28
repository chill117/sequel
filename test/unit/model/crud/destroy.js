var _ = require('underscore')
var async = require('async')
var chai = require('chai')
var expect = chai.expect

var Instances = require('../../../lib/instances')

var drivers = require('../../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Model#destroy([options])', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var fixtures = require('../../../fixtures')
	var ModelOne, ModelTwo, models

	before(function() {

		ModelOne = sequel.define('CRUDDestroyModelOne', {

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
			},
			a_decimal: 'decimal'

		}, {

			tableName: 'test_table_1'

		})

		ModelTwo = sequel.define('CRUDDestroyModelTwo', {

			id: {
				type: 'integer',
				autoIncrement: true,
				primaryKey: true
			},
			ref_id: {
				type: 'integer',
				validate: {
					notNull: true
				}
			},
			value3: 'text',
			value4: 'text'

		}, {

			tableName: 'test_table_2'

		})

		models = {
			'test_table_1': ModelOne,
			'test_table_2': ModelTwo
		}

	})

	it('should be a method', function() {

		expect(ModelOne.destroy).to.be.a('function')

	})

	describe('with instances in the database', function() {

		before(function(done) {

			async.each(_.values(models), function(model, nextModel) {

				var table = model.tableName

				async.eachSeries(fixtures[table], function(data, nextFixture) {

					model.create(data).complete(function(errors, instance) {

						if (errors)
						{
							console.log(errors)
							return nextFixture(new Error('An unexpected error has occurred'))
						}

						nextFixture()

					})

				}, nextModel)

			}, done)

		})

		it('should destroy all instances', function(done) {

			async.each(_.values(models), function(model, nextModel) {

				model.destroy().complete(function(error) {

					expect(error).to.equal(null)

					model.count().complete(function(error, count) {

						if (error)
							return nextModel(new Error(error))

						expect(count).to.equal(0)
						nextModel()

					})

				})

			}, done)

		})

	})

	it('should destroy the expected instances when using various where operators', function(done) {

		// This test might take a bit.
		this.timeout(4000)

		var operators = ['gt', 'gte', 'lt', 'lte', 'ne']

		var tryWithArray = [
			{model: ModelOne, field: 'value1', value: 50},
			{model: ModelOne, field: 'value2', value: 400},
			{model: ModelOne, field: 'id', value: 4},
			{model: ModelTwo, field: 'id', value: 3}
		]

		async.eachSeries(tryWithArray, function(tryWith, nextTry) {

			var model = tryWith.model
			var field = tryWith.field
			var value = tryWith.value

			var table = model.tableName

			async.eachSeries(operators, function(operator, nextOperator) {

				var instances = {}

				async.each(_.values(models), function(model, nextModel) {

					var table = model.tableName

					instances[table] = []

					model.destroy().complete(function(error) {

						if (error)
							return nextFixture(new Error(error))

						async.eachSeries(fixtures[table], function(data, nextFixture) {

							model.create(data).complete(function(errors, instance) {

								if (errors)
								{
									console.log(errors)
									return nextFixture(new Error('An unexpected error has occurred'))
								}

								instances[table].push(instance)

								nextFixture()

							})

						}, nextModel)

					})

				}, function(error) {

					if (error)
						return nextOperator(error)

					var options = {}

					options.where = {}
					options.where[field] = {}
					options.where[field][operator] = value

					var expected = new Instances(instances[table])

					expected.invertedFilter(options.where)

					model.destroy(options).complete(function(error) {

						expect(error).to.equal(null)

						model.findAll().complete(function(error, results) {

							if (error)
								return nextOperator(new Error(error))

							expect(results).to.have.length(expected.instances.length)

							for (var i in results)
								expect(results[i].get()).to.deep.equal(expected.instances[i].get())

							nextOperator()

						})

					})

				})

			}, nextTry)

		}, done)

	})

})

})(drivers[i].sequel, drivers[i].TestManager)