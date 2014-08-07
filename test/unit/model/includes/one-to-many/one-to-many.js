var async = require('async')
var expect = require('chai').expect


describe('Model#Includes', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)

	var ParentModel

	before(function() {

		ParentModel = sequel.define('ParentModel', {

			id: {
				type: 'integer',
				autoIncrement: true,
				primaryKey: true
			},
			name: 'text',
			description: 'text'

		}, {

			tableName: 'parent_table_1'

		})

	})

	var ChildModel

	before(function() {

		ChildModel = sequel.define('ChildModel', {

			id: {
				type: 'integer',
				autoIncrement: true,
				primaryKey: true
			},
			parent_id: {
				type: 'integer',
				validate: {
					notNull: true,
					isInt: true
				}
			},
			somevalue1: 'text'

		}, {

			tableName: 'child_table_1',

			foreignKeys: {

				parent_id: {
					model: 'ParentModel',
					field: 'id'
				}

			}

		})

	})

	var parents = []

	before(function(done) {

		// Create some parents.

		var parentData = [
			{name: 'Some Parent', description: 'very short description..'},
			{name: 'Another Parent!', description: ''}
		]

		async.each(parentData, function(data, nextParent) {

			ParentModel.create(data).complete(function(errors, result) {

				if (errors)
					return nextParent(new Error('Unexpected error(s)'))

				parents.push(result)
				nextParent()

			})

		}, done)

	})

	var children = []

	before(function(done) {

		// Create some children.

		var childData = [
			{parent_id: 1, somevalue1: 'Some text data..'},
			{parent_id: 1, somevalue1: 'More text data!'},
			{parent_id: 2, somevalue1: 'Even more text..'}
		]

		async.each(childData, function(data, nextChild) {

			ChildModel.create(data).complete(function(errors, result) {

				if (errors)
					return nextChild(new Error('Unexpected error(s)'))

				children.push(result)
				nextChild()

			})

		}, done)

	})

	after(TestManager.tearDown)

	describe('One-to-Many', function() {

		function getParentById(parent_id) {

			for (var i in parents)
				if (parents[i].get('id') == parent_id)
					return parents[i]

			return null

		}

		function getChildById(child_id) {

			for (var i in children)
				if (children[i].get('id') == child_id)
					return children[i]

			return null

		}

		function getParentOfChild(child_id) {

			var child = getChildById(child_id)
			var parent_id = child.get('parent_id')

			return getParentById(parent_id)

		}

		it('should return each child with their associated parent\'s data', function(done) {

			ChildModel.findAll({
				include: [
					{model: ParentModel.name}
				]
			})
				.complete(function(error, results) {

					if (error)
						return done(new Error('Unexpected error(s)'))

					expect(results.length).to.equal(children.length)

					for (var i in results)
					{
						var result = results[i]
						var data = result.get()
						var parentData = data[ParentModel.tableName] || null

						expect(parentData).to.not.equal(null)

						var parent = getParentOfChild(result.get('id'))

						expect(parentData).to.deep.equal(parent.get())
					}

					done()

				})

		})

		it('when the \'as\' include option is provided, the parent\'s data should be included in the result data as expected', function(done) {

			var as = 'parent'

			ChildModel.findAll({
				include: [
					{model: ParentModel.name, as: as}
				]
			})
				.complete(function(error, results) {

					if (error)
						return done(new Error('Unexpected error(s)'))

					expect(results.length).to.equal(children.length)

					for (var i in results)
					{
						var result = results[i]
						var data = result.get()
						var parentData = data[as] || null

						expect(parentData).to.not.equal(null)
					}

					done()

				})

		})

		it('when the \'attributes\' include option is used, the data returned for the included model should be restricted to those specified in the \'attributes\' include option', function(done) {

			var attributesForInclude = ['id']

			ChildModel.findAll({
				include: [
					{model: ParentModel.name, attributes: attributesForInclude}
				]
			})
				.complete(function(error, results) {

					if (error)
						return done(new Error('Unexpected error(s)'))

					expect(results.length).to.equal(children.length)

					for (var i in results)
					{
						var result = results[i]
						var data = result.get()
						var parentData = data[ParentModel.tableName] || null

						expect(parentData).to.not.equal(null)

						checkingParentData:
						for (var name in parentData)
						{
							for (var n in attributesForInclude)
								if (attributesForInclude[n] == name)
									continue checkingParentData

							return done(new Error('Expected \'' + name + '\' to not have been returned in the result\'s include data'))
						}

						for (var name in ChildModel.fields)
							if (typeof data[name] == 'undefined')
								return done(new Error('Expected \'' + name + '\' to be returned in the result data'))
					}

					done()

				})

		})

	})

})