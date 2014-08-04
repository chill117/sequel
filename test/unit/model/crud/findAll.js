var _ = require('underscore')
var async = require('async')
var expect = require('chai').expect

var Instances = require('../../../lib/instances')


describe('Model#findAll([options])', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var fixtures = require('../../../fixtures')
	var ModelOne, ModelTwo, models

	before(function() {

		ModelOne = sequel.define('CRUDFindAllModelOne', {

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

		ModelTwo = sequel.define('CRUDFindAllModelTwo', {

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
						return nextFixture(new Error('Unexpected error(s)'))
					}

					instances[table].push(instance)

					nextFixture()

				})

			}, nextModel)

		}, done)

	})

	it('should be a method', function() {

		expect(ModelOne.findAll).to.be.a('function')

	})

	it('should return all instances', function(done) {

		async.each(_.values(models), function(model, nextModel) {

			var table = model.tableName
			var expected = instances[table]

			model.findAll().complete(function(error, results) {

				expect(error).to.equal(null)
				expect(results).to.have.length(expected.length)

				for (var i in results)
					expect(results[i].get()).to.deep.equal(expected[i].get())

				nextModel()

			})

		}, done)

	})

	it('should return instances in the correct order', function(done) {

		var tryWithArray = [
			{model: ModelOne, order: 'value1 DESC'},
			{model: ModelOne, order: 'value1 ASC'},
			{model: ModelOne, order: 'value2 DESC'},
			{model: ModelOne, order: 'value2 ASC'},
			{model: ModelOne, order: 'id DESC'},
			{model: ModelOne, order: 'id ASC'},
			{model: ModelTwo, order: 'ref_id DESC'},
			{model: ModelTwo, order: 'ref_id ASC'}
		]

		async.each(tryWithArray, function(tryWith, nextTry) {

			var model = tryWith.model
			var order = tryWith.order
			var table = model.tableName

			var expected = new Instances(instances[table])

			expected.orderBy(order)

			model.findAll({ order: order }).complete(function(error, results) {

				expect(error).to.equal(null)
				expect(results).to.have.length(expected.instances.length)

				for (var i in results)
					expect(results[i].get()).to.deep.equal(expected.instances[i].get())

				nextTry()

			})

		}, done)

	})

	it('should return expected results when using various where operators', function(done) {

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

				model.findAll(options).complete(function(error, results) {

					expect(error).to.equal(null)
					expect(results).to.have.length(expected.instances.length)

					for (var i in results)
						expect(results[i].get()).to.deep.equal(expected.instances[i].get())

					nextOperator()

				})

			}, nextTry)

		}, done)

	})

})

