var async = require('async')
var chai = require('chai')
var expect = chai.expect

var drivers = require('../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Model#includes', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var fixtures = require('../../fixtures')
	var TableOne, TableTwo, models

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

		var instances = instances = {}

		before(function(done) {

			async.each(models, function(model, nextModel) {

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

		var Parent, Child

		before(function() {

			Parent = {
				model: TableOne,
				table: TableOne.tableName,
				instances: instances[TableOne.tableName]
			}

			Child = {
				model: TableTwo,
				table: TableTwo.tableName,
				instances: instances[TableTwo.tableName]
			}

		})

		describe('one-to-one relationship (parent to child)', function() {

			it('should return each instance with its associated data', function(done) {

				var as = Child.table

				async.each(Parent.instances, function(parent, nextInstance) {

					var child = null

					for (var i in Child.instances)
						if (Child.instances[i].get('ref_id') == parent.get('id'))
						{
							child = Child.instances[i]
							break
						}

					Parent.model.find({
						where: {id: parent.get('id')},
						include: [
							{model: Child.model.name, join: 'left'}
						]
					})
						.complete(function(error, result) {

							if (error)
								return nextInstance(new Error(error))

							expect(result).to.not.equal(null)

							for (var name in parent.data)
								if (name != 'created_at' && name != 'updated_at')
									expect(result.get(name)).to.equal(parent.data[name])

							if (!child)
								for (var field in result.get(as))
									expect(result.get(as)[field]).to.equal(null)
							else
								expect(result.get(as)).to.deep.equal(child.data)

							nextInstance()

						})

				}, done)

			})

			it('when using the \'as\' option in the include, should return the associated data where expected', function(done) {

				var as = 'child'

				async.each(Parent.instances, function(parent, nextInstance) {

					var child = null

					for (var i in Child.instances)
						if (Child.instances[i].get('ref_id') == parent.get('id'))
						{
							child = Child.instances[i]
							break
						}

					Parent.model.find({
						where: {id: parent.get('id')},
						include: [
							{model: Child.model.name, as: as, join: 'left'}
						]
					})
						.complete(function(error, result) {

							if (error)
								return nextInstance(new Error(error))

							expect(result).to.not.equal(null)

							for (var name in parent.data)
								if (name != 'created_at' && name != 'updated_at')
									expect(result.get(name)).to.equal(parent.data[name])

							if (!child)
								for (var field in result.get(as))
									expect(result.get(as)[field]).to.equal(null)
							else
								expect(result.get(as)).to.deep.equal(child.data)

							nextInstance()

						})

				}, done)

			})

		})

		describe('one-to-one relationship (child to parent)', function() {

			it('should return each instance with its associated data', function(done) {

				var as = Parent.table

				async.each(Child.instances, function(child, nextInstance) {

					var parent = null

					for (var i in Parent.instances)
						if (Parent.instances[i].get('id') == child.get('ref_id'))
						{
							parent = Parent.instances[i]
							break
						}

					Child.model.find({
						where: {id: child.get('id')},
						include: [
							{model: Parent.model.name, join: 'left'}
						]
					})
						.complete(function(error, result) {

							if (error)
								return nextInstance(new Error(error))

							expect(result).to.not.equal(null)

							for (var name in child.data)
								if (name != 'created_at' && name != 'updated_at')
									expect(result.get(name)).to.equal(child.data[name])

							if (!parent)
								for (var field in result.get(as))
									expect(result.get(as)[field]).to.equal(null)
							else
								expect(result.get(as)).to.deep.equal(parent.data)

							nextInstance()

						})

				}, done)

			})

			it('when using the \'as\' option in the include, should return the associated data where expected', function(done) {

				var as = 'parent'

				async.each(Child.instances, function(child, nextInstance) {

					var parent = null

					for (var i in Parent.instances)
						if (Parent.instances[i].get('id') == child.get('ref_id'))
						{
							parent = Parent.instances[i]
							break
						}

					Child.model.find({
						where: {id: child.get('id')},
						include: [
							{model: Parent.model.name, as: as, join: 'left'}
						]
					})
						.complete(function(error, result) {

							if (error)
								return nextInstance(new Error(error))

							expect(result).to.not.equal(null)

							for (var name in child.data)
								if (name != 'created_at' && name != 'updated_at')
									expect(result.get(name)).to.equal(child.data[name])

							if (!parent)
								for (var field in result.get(as))
									expect(result.get(as)[field]).to.equal(null)
							else
								expect(result.get(as)).to.deep.equal(parent.data)

							nextInstance()

						})

				}, done)

			})

		})

	})

})

})(drivers[i].sequel, drivers[i].TestManager)