var async = require('async')
var chai = require('chai')
var expect = chai.expect

var drivers = require('../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Model#includes', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var TableOne, TableTwo, models, instances = {}

	before(function() {

		TableOne = sequel.define('IncludesTestOne', {

			id: {
				type: 'integer',
				autoIncrement: true,
				primaryKey: true
			},
			name: {
				type: 'text',
				validate: {
					notEmpty: true
				}
			},
			value1: {
				type: 'integer',
				validate: {
					notNull: true
				}
			},
			value2: {
				type: 'integer',
				validate: {
					notNull: true
				}
			}

		}, {

			tableName: 'test_table_1'

		})

		TableTwo = sequel.define('IncludesTestTwo', {

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

			tableName: 'test_table_2',

			foreignKeys: {

				ref_id: {
					model: 'IncludesTestOne',
					field: 'id'
				}

			}

		})

		models = [TableOne, TableTwo]

	})

	describe('with the database pre-populated with data', function() {

		before(function(done) {

			var fixtures = require('../../fixtures')

			async.eachSeries(models, function(model, nextModel) {

				var table = model.tableName

				instances[table] = []

				async.each(fixtures[table], function(data, nextFixture) {

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

		describe('one-to-one relationship (parent to child)', function() {

			it('should return each instance with its associated data', function(done) {

				var table = TableOne.tableName

				async.each(instances[table], function(instance, nextInstance) {

					var relatedInstance

					for (var i in instances[TableTwo.tableName])
						if (instances[TableTwo.tableName][i].get('ref_id') == instance.get('id'))
						{
							relatedInstance = instances[TableTwo.tableName][i]
							break
						}

					TableOne.find({
						where: {id: instance.get('id')},
						include: [
							{model: TableTwo.name}
						]
					})
						.complete(function(error, result) {

							if (error)
								return nextInstance(new Error(error))

							for (var name in instance.data)
								if (name != 'created_at' && name != 'updated_at')
									expect(result.get(name)).to.equal(instance.data[name])

							expect(result.get(TableTwo.tableName)).to.deep.equal(relatedInstance.data)

							nextInstance()

						})

				}, done)

			})

			it('when using the \'as\' option in the include, should return the associated data where expected', function(done) {

				var table = TableOne.tableName

				async.each(instances[table], function(instance, nextInstance) {

					var relatedInstance

					for (var i in instances[TableTwo.tableName])
						if (instances[TableTwo.tableName][i].get('ref_id') == instance.get('id'))
						{
							relatedInstance = instances[TableTwo.tableName][i]
							break
						}

					TableOne.find({
						where: {id: instance.get('id')},
						include: [
							{model: TableTwo.name, as: 'tabletwo'}
						]
					})
						.complete(function(error, result) {

							if (error)
								return nextInstance(new Error(error))

							for (var name in instance.data)
								if (name != 'created_at' && name != 'updated_at')
									expect(result.get(name)).to.equal(instance.data[name])

							expect(result.get('tabletwo')).to.deep.equal(relatedInstance.data)

							nextInstance()

						})

				}, done)

			})

		})

		describe('one-to-one relationship (child to parent)', function() {

			it('should return each instance with its associated data', function(done) {

				var table = TableTwo.tableName

				async.each(instances[table], function(instance, nextInstance) {

					var relatedInstance

					for (var i in instances[TableOne.tableName])
						if (instances[TableOne.tableName][i].get('id') == instance.get('ref_id'))
						{
							relatedInstance = instances[TableOne.tableName][i]
							break
						}

					TableTwo.find({
						where: {id: instance.get('id')},
						include: [
							{model: TableOne.name}
						]
					})
						.complete(function(error, result) {

							if (error)
								return nextInstance(new Error(error))

							for (var name in instance.data)
								if (name != 'created_at' && name != 'updated_at')
									expect(result.get(name)).to.equal(instance.data[name])

							expect(result.get(TableOne.tableName)).to.deep.equal(relatedInstance.data)

							nextInstance()

						})

				}, done)

			})

			it('when using the \'as\' option in the include, should return the associated data where expected', function(done) {

				var table = TableTwo.tableName

				async.each(instances[table], function(instance, nextInstance) {

					var relatedInstance

					for (var i in instances[TableOne.tableName])
						if (instances[TableOne.tableName][i].get('id') == instance.get('ref_id'))
						{
							relatedInstance = instances[TableOne.tableName][i]
							break
						}

					TableTwo.find({
						where: {id: instance.get('id')},
						include: [
							{model: TableOne.name, as: 'tableone'}
						]
					})
						.complete(function(error, result) {

							if (error)
								return nextInstance(new Error(error))

							for (var name in instance.data)
								if (name != 'created_at' && name != 'updated_at')
									expect(result.get(name)).to.equal(instance.data[name])

							expect(result.get('tableone')).to.deep.equal(relatedInstance.data)

							nextInstance()

						})

				}, done)

			})

		})

	})

})

})(drivers[i].sequel, drivers[i].TestManager)