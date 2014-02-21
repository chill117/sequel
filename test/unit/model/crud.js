var _ = require('underscore')
var async = require('async')
var chai = require('chai')
var expect = chai.expect

var drivers = require('../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Model#', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var table1 = 'test_table_1'
	var table2 = 'test_table_2'

	var TableOneModel = sequel.define('TableOne', {

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

		tableName: table1

	})

	var TableTwoModel = sequel.define('TableTwo', {

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

		tableName: table2

	})

	var models = {
		'test_table_1': TableOneModel,
		'test_table_2': TableTwoModel
	}

	var created = {
		'test_table_1': [],
		'test_table_2': []
	}

	var tables = []

	for (var table in models)
		tables.push(table)


	describe('create(data, options)', function() {

		it('should be a method', function() {

			for (var table in models)
			{
				var model = models[table]

				expect(model.create).to.be.a('function')
			}

		})

		it('default values should be used for fields where data is missing', function(done) {

			var table = tables[0]
			var model = models[table]

			var data = {}

			data.name = 'testing default value'
			data.value1 = 5
			data.value2 = 500
			// data.modata
			// data.moproblems

			model.create(data).complete(function(errors, instance) {

				expect(errors).to.equal(null)
				expect(instance).to.not.equal(null)
				expect(instance).to.be.an('object')
				expect(instance.get('name')).to.equal(data.name)
				expect(instance.get('value1')).to.equal(data.value1)
				expect(instance.get('value2')).to.equal(data.value2)
				expect(instance.get('modata')).to.equal(model.fields.modata.getDefaultValue())
				expect(instance.get('moproblems')).to.equal(model.fields.moproblems.getDefaultValue())

				created[table].push(instance)

				done()

			})

		})

		it('should return a newly created instance for each row of data', function(done) {

			var fixtures = require('../../fixtures')

			async.eachSeries(tables, function(table, next) {

				async.eachSeries(fixtures[table], function(fixture, next2) {

					var data = {}

					for (var field in fixture)
						if (field != 'created_at' && field != 'updated_at')
							data[field] = fixture[field]

					models[table].create(data).complete(function(errors, instance) {

						expect(errors).to.equal(null)
						expect(instance).to.not.equal(null)
						expect(instance).to.be.an('object')

						for (var field in data)
							if (data[field])
								expect(instance.get(field)).to.equal(data[field])

						created[table].push(instance)

						next2()

					})

				}, next)

			}, function(error) {

				if (error)
					return done(new Error(error))

				done()

			})

		})

	})

	describe('find([primay_key, ]options)', function() {

		it('should be a method', function() {

			for (var table in models)
			{
				var model = models[table]

				expect(model.find).to.be.a('function')
			}

		})

		it('should return null when no instance is found', function(done) {

			var table = tables[0]
			var model = models[table]

			var primary_key = 25

			model.find(primary_key).complete(function(error, instance) {

				expect(error).to.equal(null)
				expect(instance).to.equal(null)

				done()

			})

		})

		it('should return the correct instance', function(done) {

			var table = tables[0]
			var model = models[table]

			var expected = created[table][0]
			var primary_key = expected.get('id')

			model.find(primary_key).complete(function(error, instance) {

				expect(error).to.equal(null)
				expect(instance.data).to.deep.equal(expected.data)

				done()

			})

		})

		it('should return the instance with related data', function(done) {

			var table1 = tables[0]
			var table2 = tables[1]

			var model1 = models[table1]

			var expected = []

			expected = _.clone(created[table1][0].data)

			for (var i in created[table2])
			{
				var instance = created[table2][i]

				if (instance.get('ref_id') == expected.id)
				{
					expected[table2] = _.clone(instance.data)

					break
				}
			}

			var options = {}

			options.where = {}
			options.where[table1 + '.id'] = expected.id

			options.include = [
				{
					table: table2,
					on: [table2 + '.ref_id', table1 + '.id'],
					join: 'left'
				}
			]

			model1.find(options).complete(function(error, instance) {

				expect(error).to.equal(null)
				expect(instance.data).to.deep.equal(expected)

				done()

			})

		})

		it('associated data should be assigned to the correct data attribute when using the \'as\' attribute in an \'include\'', function(done) {

			var table1 = tables[0]
			var table2 = tables[1]

			var model1 = models[table1]

			var as = 'other'

			var expected = []

			expected = _.clone(created[table1][0].data)

			for (var i in created[table2])
			{
				var instance = created[table2][i]

				if (instance.get('ref_id') == expected.id)
				{
					expected[as] = _.clone(instance.data)

					break
				}
			}

			var options = {}

			options.where = {}
			options.where[table1 + '.id'] = expected.id

			options.include = [
				{
					table: table2,
					as: as,
					on: [as + '.ref_id', table1 + '.id'],
					join: 'left'
				}
			]

			model1.find(options).complete(function(error, instance) {

				expect(error).to.equal(null)
				expect(instance.data).to.deep.equal(expected)

				done()

			})

		})

	})

	describe('findAll(options)', function() {

		it('should be a method', function() {

			for (var table in models)
			{
				var model = models[table]

				expect(model.findAll).to.be.a('function')
			}

		})

		it('should return all instances', function(done) {

			async.each(tables, function(table, next) {

				var model = models[table]
				var expected = created[table]

				model.findAll().complete(function(error, instances) {

					expect(error).to.equal(null)
					expect(instances.length).to.equal(expected.length)

					for (var i in instances)
						expect(instances[i].data).to.deep.equal(expected[i].data)

					next()

				})

			}, function(error) {

				if (error)
					return done(new Error(error))

				done()

			})

		})

		it('should return instances in the correct order', function(done) {

			var tryWith = [
				{table: tables[0], order: 'value1 DESC'},
				{table: tables[0], order: 'value1 ASC'}
			]

			async.times(tryWith.length, function(i, next) {

				var table = tryWith[i].table
				var order = tryWith[i].order

				var model = models[table]
				var expected = []

				var expected = []

				expected = _.clone(created[table])

				var sorts = order.split(',')

				for (var i in sorts)
				{
					var sort = sorts[i].replace(/^\s+|\s+$/g, '').split(' ')

					var field = sort[0]
					var direction = sort[1] || 'ASC'

					expected.sort(function(instance1, instance2) {

						if (direction == 'ASC')
							return instance1.get(field) - instance2.get(field)

						return instance2.get(field) - instance1.get(field)

					})
				}

				model.findAll({

					order: order

				})
					.complete(function(error, instances) {

						expect(error).to.equal(null)
						expect(instances.length).to.equal(expected.length)

						for (var i in instances)
							expect(instances[i].data).to.deep.equal(expected[i].data)

						next()

					})

			}, function(error) {

				if (error)
					return done(new Error(error))

				done()

			})

		})

		it('should return only the instances that satisfy the \'where\' option', function(done) {

			var operators = ['gt', 'gte', 'lt', 'lte', 'ne']
			var value1 = 50

			var table = tables[0]

			async.each(operators, function(operator, next) {

				var model = models[table]
				var expected = []

				for (var i in created[table])
				{
					var instance = created[table][i]

					switch (operator)
					{
						case 'gt':

							if (instance.get('value1') > value1)
								expected.push(instance)

						break

						case 'gte':

							if (instance.get('value1') >= value1)
								expected.push(instance)

						break

						case 'lt':

							if (instance.get('value1') < value1)
								expected.push(instance)

						break

						case 'lte':

							if (instance.get('value1') <= value1)
								expected.push(instance)

						break

						case 'ne':

							if (instance.get('value1') != value1)
								expected.push(instance)

						break
					}
				}

				var options = {}

				options.where = {}
				options.where.value1 = {}
				options.where.value1[operator] = value1

				model.findAll(options).complete(function(error, instances) {

					expect(error).to.equal(null)
					expect(instances.length).to.equal(expected.length)

					for (var i in instances)
						expect(instances[i].data).to.deep.equal(expected[i].data)

					next()

				})

			}, function(error) {

				if (error)
					return done(new Error(error))

				done()

			})

		})

	})

	describe('update(data, options)', function() {

		it('should be a method', function() {

			for (var table in models)
			{
				var model = models[table]

				expect(model.update).to.be.a('function')
			}

		})

		it('should update all instances that satisfy the \'where\' option', function(done) {

			var table = tables[0]
			var model = models[table]

			var value1 = 500
			var expected = []

			expected = created[table]

			for (var i in expected)
				if (expected[i].get('value1') < value1)
					expected[i].set('value1', value1)

			model.update({value1: value1}, {

				where: {
					value1: {lt: value1}
				}

			})
				.complete(function(error) {

					expect(error).to.equal(null)

					model.findAll().complete(function(error, instances) {

						expect(error).to.equal(null)
						expect(instances.length).to.equal(expected.length)

						for (var i in instances)
							expect(instances[i].data).to.deep.equal(expected[i].data)

					})

					done()

				})

		})

		it('should correctly update a single instance', function(done) {

			var table = tables[1]
			var model = models[table]

			var value3 = 'this field was changed'
			var expected = []

			expected = created[table][2]
			expected.set('value3', value3)

			var id = expected.get('id')

			model.update({value3: value3}, {

				where: {
					id: id
				},
				limit: 1

			})
				.complete(function(error) {

					expect(error).to.equal(null)

					model.find(id).complete(function(error, instance) {

						expect(error).to.equal(null)
						expect(instance).to.not.equal(null)
						expect(instance.data).to.deep.equal(expected.data)

					})

					done()

				})

		})

	})

	describe('destroy(options)', function() {

		it('should be a method', function() {

			for (var table in models)
			{
				var model = models[table]

				expect(model.destroy).to.be.a('function')
			}

		})

		it('should destroy all the instances that satisfy the \'where\' option', function(done) {

			var table = tables[1]
			var model = models[table]

			var ids = [created[table][2].get('id'), created[table][3].get('id')]

			var expected = []

			skip:
			for (var i in created[table])
			{
				for (var n in ids)
					if (created[table][i].get('id') == ids[n])
						continue skip

				expected.push(created[table][i])
			}

			model.destroy({

				where: {
					id: ids
				},
				limit: 2

			})
				.complete(function(error) {

					expect(error).to.equal(null)

					model.findAll().complete(function(error, instances) {

						expect(error).to.equal(null)
						expect(instances.length).to.equal(expected.length)

						for (var i in instances)
							expect(instances[i].data).to.deep.equal(expected[i].data)

					})

					done()

				})

		})

		it('should destroy all remaining instances', function(done) {

			var table = tables[1]
			var model = models[table]

			model.destroy().complete(function(error) {

				expect(error).to.equal(null)

				model.findAll().complete(function(error, instances) {

					expect(error).to.equal(null)
					expect(instances).to.be.an('array')
					expect(instances.length).to.equal(0)

				})

				done()

			})

		})

	})

	describe('count(options)', function() {

		it('should be a method', function() {

			for (var table in models)
			{
				var model = models[table]

				expect(model.count).to.be.a('function')
			}

		})

		it('should return an accurate count of the total number of instances', function(done) {

			var table = tables[0]
			var model = models[table]

			model.count().complete(function(error, count) {

				expect(error).to.equal(null)
				expect(count).to.equal(created[table].length)

				done()

			})

		})

		it('should return an accurate count of the total number of instances that satisfy the \'where\' option', function(done) {

			var operators = ['gt', 'gte', 'lt', 'lte', 'ne']
			var value2 = 500

			var table = tables[0]

			async.each(operators, function(operator, next) {

				var model = models[table]
				var expected = []

				for (var i in created[table])
				{
					var instance = created[table][i]

					switch (operator)
					{
						case 'gt':

							if (instance.get('value2') > value2)
								expected.push(instance)

						break

						case 'gte':

							if (instance.get('value2') >= value2)
								expected.push(instance)

						break

						case 'lt':

							if (instance.get('value2') < value2)
								expected.push(instance)

						break

						case 'lte':

							if (instance.get('value2') <= value2)
								expected.push(instance)

						break

						case 'ne':

							if (instance.get('value2') != value2)
								expected.push(instance)

						break
					}
				}

				var options = {}

				options.where = {}
				options.where.value2 = {}
				options.where.value2[operator] = value2

				model.count(options).complete(function(error, count) {

					expect(error).to.equal(null)
					expect(count).to.be.a('number')
					expect(count).to.equal(expected.length)

					next()

				})

			}, function(error) {

				if (error)
					return done(new Error(error))

				done()

			})

		})

		it('should return an accurate count of the total number of instances', function(done) {

			var table = tables[0]
			var model = models[table]

			async.timesSeries(created[table].length, function(i, next) {

				var expected = created[table].length - (i + 1)

				model.destroy({

					limit: 1

				})
					.complete(function(error) {

						expect(error).to.equal(null)

						model.count().complete(function(error, count) {

							expect(error).to.equal(null)
							expect(count).to.equal(expected)

							next()

						})

					})

			}, function(error) {

				if (error)
					return done(new Error(error))

				done()

			})

		})

	})

})

})(drivers[i].sequel, drivers[i].TestManager)