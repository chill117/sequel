var _ = require('underscore')
var async = require('async')
var chai = require('chai')
var expect = chai.expect

var Instances = require('../../../lib/instances')

var drivers = require('../../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Model#update(data[, options])', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var fixtures = require('../../../fixtures')
	var ModelOne, ModelTwo, models

	before(function() {

		ModelOne = sequel.define('CRUDUpdateModelOne', {

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

		ModelTwo = sequel.define('CRUDUpdateModelTwo', {

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

		expect(ModelOne.update).to.be.a('function')

	})

	describe('with instances in the database', function() {

		before(function(done) {

			async.each(_.values(models), function(model, nextModel) {

				model.destroy().complete(function(error) {

					if (error)
						return nextModel(new Error(error))

					nextModel()

				})

			}, done)

		})

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

		it('should increment the value of a single field for all instances', function(done) {

			var increment = 21

			ModelOne.findAll().complete(function(error, instances) {

				if (error)
					return done(new Error(error))

				ModelOne.update({value2: {increment: increment}}).complete(function(errors) {

					expect(errors).to.equal(null)

					ModelOne.findAll().complete(function(error, results) {

						if (error)
							return done(new Error(error))

						expect(results).to.have.length(instances.length)

						for (var i in results)
						{
							var expected = instances[i].get('value2') + increment

							expect(results[i].get('value2')).to.equal(expected)
						}

						done()

					})

				})

			})

		})

		it('should decrement the value of a single field for all instances', function(done) {

			var decrement = 11

			ModelOne.findAll().complete(function(error, instances) {

				if (error)
					return done(new Error(error))

				ModelOne.update({value2: {decrement: decrement}}).complete(function(errors) {

					expect(errors).to.equal(null)

					ModelOne.findAll().complete(function(error, results) {

						if (error)
							return done(new Error(error))

						expect(results).to.have.length(instances.length)

						for (var i in results)
						{
							var expected = instances[i].get('value2') - decrement

							expect(results[i].get('value2')).to.equal(expected)
						}

						done()

					})

				})

			})

		})

	})

	it('should correctly update the expected instances when using various where operators', function(done) {

		// This test might take a bit.
		this.timeout(4000)

		var operators = ['gt', 'gte', 'lt', 'lte', 'ne']

		var tryWithArray = [
			{model: ModelOne, field: 'value1', value: 50},
			{model: ModelOne, field: 'value2', value: 400},
			{model: ModelOne, field: 'id', value: 4},
			{model: ModelTwo, field: 'id', value: 3}
		]

		var updateData = {
			'test_table_1': {
				name: '--UPDATED--',
				moproblems: '--UPDATED--'
			},
			'test_table_2': {
				value3: '--UPDATED--',
				value4: '--UPDATED--'
			}
		}

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

					var data = updateData[table]

					var options = {}

					options.where = {}
					options.where[field] = {}
					options.where[field][operator] = value

					var expected = new Instances(instances[table])

					expected.filter(options.where)

					model.update(data, options).complete(function(error) {

						expect(error).to.equal(null)

						model.findAll().complete(function(error, results) {

							if (error)
								return nextOperator(new Error(error))

							var ids = []

							for (var i in expected.instances)
								ids.push( expected.instances[i].get('id') )

							for (var i in results)
							{
								var result = results[i]

								if ( _.indexOf(ids, result.get('id')) != -1 )
									// Should have been updated.
									for (var field in data)
										expect(results[i].get(field)).to.equal(data[field])
								else
									// Should NOT have been updated.
									for (var field in data)
										expect(results[i].get(field)).to.not.equal(data[field])
							}

							nextOperator()

						})

					})

				})

			}, nextTry)

		}, done)

	})

})

})(drivers[i].sequel, drivers[i].TestManager)