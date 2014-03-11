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

		it('included data should be cast to correct data types as specified by their model', function(done) {

			var as = Child.table

			async.each(Parent.instances, function(parent, nextInstance) {

				var child = null

				for (var i in Child.instances)
					if (Child.instances[i].get('ref_id') == parent.get('id'))
					{
						child = Child.instances[i]
						break
					}

				if (!child)
					// Skips instances that do not have associated data.
					return nextInstance()

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

						expect( result.get(as).id ).to.be.a('number')
						expect( result.get(as).ref_id ).to.be.a('number')
						expect( result.get(as).value3 ).to.be.a('string')
						expect( result.get(as).value4 ).to.be.a('string')
						expect( result.get(as).created_at ).to.be.a('date')
						expect( result.get(as).updated_at ).to.be.a('date')

						nextInstance()

					})

			}, done)

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

			it('should play nice with the \'order\' option', function(done) {

				var as = Child.table

				Parent.model.findAll({
					include: [
						{model: Child.model.name, join: 'left'}
					],
					order: 'id ASC'
				})
					.complete(function(error, results) {

						if (error)
							return nextInstance(new Error(error))

						expect(results).to.have.length(Parent.instances.length)

						async.each(results, function(result, nextInstance) {

							var child = null

							for (var i in Child.instances)
								if (Child.instances[i].get('ref_id') == result.get('id'))
								{
									child = Child.instances[i]
									break
								}

							expect(result).to.not.equal(null)

							if (!child)
								for (var field in result.get(as))
									expect(result.get(as)[field]).to.equal(null)
							else
								expect(result.get(as)).to.deep.equal(child.data)

							nextInstance()

						}, done)

					})

			})

			it('should play nice with the \'group\' option', function(done) {

				var as = Child.table

				Parent.model.findAll({
					include: [
						{model: Child.model.name, join: 'left'}
					],
					group: 'id'
				})
					.complete(function(error, results) {

						if (error)
							return nextInstance(new Error(error))

						expect(results).to.have.length(Parent.instances.length)

						async.each(results, function(result, nextInstance) {

							var child = null

							for (var i in Child.instances)
								if (Child.instances[i].get('ref_id') == result.get('id'))
								{
									child = Child.instances[i]
									break
								}

							expect(result).to.not.equal(null)

							if (!child)
								for (var field in result.get(as))
									expect(result.get(as)[field]).to.equal(null)
							else
								expect(result.get(as)).to.deep.equal(child.data)

							nextInstance()

						}, done)

					})

			})

			it('should return the fields specified by the \'attributes\' option as well as the \'attributes\' option from an include', function(done) {

				var as = Child.table

				Parent.model.findAll({
					attributes: ['id', 'name', 'value1'],
					include: [
						{model: Child.model.name, attributes: ['value3'], join: 'left'}
					]
				})
					.complete(function(error, results) {

						if (error)
							return done(new Error(error))

						expect(results).to.have.length(Parent.instances.length)

						async.each(results, function(result, nextInstance) {

							var child = null

							for (var i in Child.instances)
								if (Child.instances[i].get('ref_id') == result.get('id'))
								{
									child = Child.instances[i]
									break
								}

							expect(result.get('name')).to.not.equal(null)
							expect(result.get('value1')).to.not.equal(null)
							expect(result.get(as).value3).to.equal( !!child ? child.get('value3') : null )

							nextInstance()

						}, done)

					})

			})

			it('should return all fields for the parent when no \'attributes\' option is specified, even when the \'attributes\' option is included for an include', function(done) {

				var as = Child.table

				Parent.model.findAll({
					include: [
						{model: Child.model.name, attributes: ['value3'], join: 'left'}
					]
				})
					.complete(function(error, results) {

						if (error)
							return done(new Error(error))

						expect(results).to.have.length(Parent.instances.length)

						async.each(results, function(result, nextInstance) {

							var child = null

							for (var i in Child.instances)
								if (Child.instances[i].get('ref_id') == result.get('id'))
								{
									child = Child.instances[i]
									break
								}

							for (var field in Parent.model.fields)
								expect(result.get(field)).to.not.equal(undefined)

							expect(result.get(as).value3).to.equal( !!child ? child.get('value3') : null )

							nextInstance()

						}, done)

					})

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

			it('should play nice with the \'order\' option', function(done) {

				var as = Parent.table

				Child.model.findAll({
					include: [
						{model: Parent.model.name, join: 'left'}
					],
					order: 'id ASC'
				})
					.complete(function(error, results) {

						if (error)
							return nextInstance(new Error(error))

						expect(results).to.have.length(Child.instances.length)

						async.each(results, function(result, nextInstance) {

							var parent = null

							for (var i in Parent.instances)
								if (Parent.instances[i].get('id') == result.get('ref_id'))
								{
									parent = Parent.instances[i]
									break
								}

							expect(result).to.not.equal(null)

							if (!parent)
								for (var field in result.get(as))
									expect(result.get(as)[field]).to.equal(null)
							else
								expect(result.get(as)).to.deep.equal(parent.data)

							nextInstance()

						}, done)

					})

			})

			it('should play nice with the \'group\' option', function(done) {

				var as = Parent.table

				Child.model.findAll({
					include: [
						{model: Parent.model.name, join: 'left'}
					],
					group: 'id'
				})
					.complete(function(error, results) {

						if (error)
							return nextInstance(new Error(error))

						expect(results).to.have.length(Child.instances.length)

						async.each(results, function(result, nextInstance) {

							var parent = null

							for (var i in Parent.instances)
								if (Parent.instances[i].get('id') == result.get('ref_id'))
								{
									parent = Parent.instances[i]
									break
								}

							expect(result).to.not.equal(null)

							if (!parent)
								for (var field in result.get(as))
									expect(result.get(as)[field]).to.equal(null)
							else
								expect(result.get(as)).to.deep.equal(parent.data)

							nextInstance()

						}, done)

					})

			})

			it('should return the fields specified by the \'attributes\' option as well as the \'attributes\' option from an include', function(done) {

				var as = Parent.table

				Child.model.findAll({
					attributes: ['ref_id', 'value3'],
					include: [
						{model: Parent.model.name, attributes: ['name', 'value1'], join: 'left'}
					]
				})
					.complete(function(error, results) {

						if (error)
							return done(new Error(error))

						expect(results).to.have.length(Child.instances.length)

						async.each(results, function(result, nextInstance) {

							var parent = null

							for (var i in Parent.instances)
								if (Parent.instances[i].get('id') == result.get('ref_id'))
								{
									parent = Parent.instances[i]
									break
								}

							expect(result.get('value3')).to.not.equal(null)
							expect(result.get(as).name).to.equal( !!parent ? parent.get('name') : null )
							expect(result.get(as).value1).to.equal( !!parent ? parent.get('value1') : null )

							nextInstance()

						}, done)

					})

			})

		})

	})

})

})(drivers[i].sequel, drivers[i].TestManager)