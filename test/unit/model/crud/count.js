var _ = require('underscore')
var async = require('async')
var expect = require('chai').expect

var Instances = require('../../../lib/instances')


describe('Model#count([options])', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var fixtures = require('../../../fixtures')
	var ModelOne, ModelTwo, models

	before(function() {

		ModelOne = sequel.define('CRUDCountModelOne', {

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

		ModelTwo = sequel.define('CRUDCountModelTwo', {

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

		expect(ModelOne.count).to.be.a('function')

	})

	describe('with instances in the database', function() {

		var instances = {}

		before(function(done) {

			async.each(_.values(models), function(model, nextModel) {

				var table = model.tableName

				instances[table] = []

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

			}, done)

		})

		it('should return an accurate count when using various where operators', function(done) {

			var operators = ['gt', 'gte', 'lt', 'lte', 'ne']

			var tryWithArray = [
				{model: ModelOne, field: 'value1', value: 50},
				{model: ModelOne, field: 'value2', value: 400},
				{model: ModelOne, field: 'id', value: 4},
				{model: ModelTwo, field: 'id', value: 3}
			]

			async.each(tryWithArray, function(tryWith, nextTry) {

				var model = tryWith.model
				var field = tryWith.field
				var value = tryWith.value

				var table = model.tableName

				async.each(operators, function(operator, nextOperator) {

					var options = {}

					options.where = {}
					options.where[field] = {}
					options.where[field][operator] = value

					var expected = new Instances(instances[table])

					expected.filter(options.where)

					model.count(options).complete(function(error, count) {

						expect(error).to.equal(null)
						expect(count).to.equal(expected.instances.length)

						nextOperator()

					})

				}, nextTry)

			}, done)

		})

		it('should return an accurate count of the total number of instances', function(done) {

			async.each(_.values(models), function(model, nextModel) {

				var table = model.tableName

				var num_instances = instances[table].length

				async.eachSeries(instances[table], function(instance, nextInstance) {

					instance.destroy().complete(function(error) {

						if (error)
							return nextInstance(new Error(error))

						num_instances--

						model.count().complete(function(error, count) {

							expect(error).to.equal(null)
							expect(count).to.equal(num_instances)

							nextInstance()

						})

					})

				}, nextModel)

			}, done)

		})

	})

})

