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

	var ChildModelOne

	before(function() {

		ChildModelOne = sequel.define('ChildModelOne', {

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

	var ChildModelTwo

	before(function() {

		ChildModelTwo = sequel.define('ChildModelTwo', {

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
			somevalue2: 'text',
			somevalue3: 'text'

		}, {

			tableName: 'child_table_2',

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

	var children1 = []

	before(function(done) {

		// Create some children.

		var childData = [
			{parent_id: 1, somevalue1: 'Some text data..'},
			{parent_id: 2, somevalue1: 'Even more text..'}
		]

		async.each(childData, function(data, nextChild) {

			ChildModelOne.create(data).complete(function(errors, result) {

				if (errors)
					return nextChild(new Error('Unexpected error(s)'))

				children1.push(result)
				nextChild()

			})

		}, done)

	})

	var children2 = []

	before(function(done) {

		// Create a different kind of children.

		var childData = [
			{parent_id: 1, somevalue2: 'Some data here', somevalue3: 'a third field'},
			{parent_id: 2, somevalue2: '.. And here..', somevalue3: 'Yup..'}
		]

		async.each(childData, function(data, nextChild) {

			ChildModelTwo.create(data).complete(function(errors, result) {

				if (errors)
					return nextChild(new Error('Unexpected error(s)'))

				children2.push(result)
				nextChild()

			})

		}, done)

	})

	after(TestManager.tearDown)

	describe('One-to-One', function() {

		function getParentById(parent_id) {

			for (var i in parents)
				if (parents[i].get('id') == parent_id)
					return parents[i]

		}

		it('should return the parent\'s data along with the data for both types of children', function(done) {

			ParentModel.findAll({
				include: [
					{model: ChildModelOne.name, as: 'child1'},
					{model: ChildModelTwo.name, as: 'child2'}
				]
			})
				.complete(function(error, results) {

					if (error)
						return done(new Error('Unexpected error(s)'))

					expect(results.length).to.equal(parents.length)

					for (var i in results)
					{
						var result = results[i]
						var data = result.get()
						var childOneData = data.child1 || null
						var childTwoData = data.child2 || null

						expect(childOneData).to.not.equal(null)
						expect(childTwoData).to.not.equal(null)

						var parent = getParentById(result.get('id'))

						delete data.child1
						delete data.child2

						expect(data).to.deep.equal(parent.get())
					}

					done()

				})

		})

		it('when the \'attributes\' include option is used, the data returned for that include should be restricted to fields specified in the \'attributes\' include option; all data for the parent and any other includes should be returned as usual', function(done) {

			var attributesOptionForChildOne = ['id']

			ParentModel.findAll({
				include: [
					{model: ChildModelOne.name, as: 'child1', attributes: attributesOptionForChildOne},
					{model: ChildModelTwo.name, as: 'child2'}
				]
			})
				.complete(function(error, results) {

					if (error)
						return done(new Error('Unexpected error(s)'))

					expect(results.length).to.equal(parents.length)

					for (var i in results)
					{
						var result = results[i]
						var data = result.get()
						var childOneData = data.child1 || null
						var childTwoData = data.child2 || null

						expect(childOneData).to.not.equal(null)
						expect(childTwoData).to.not.equal(null)

						checkingChildOneData:
						for (var name in childOneData)
						{
							for (var n in attributesOptionForChildOne)
								if (attributesOptionForChildOne[n] == name)
									continue checkingChildOneData

							return done(new Error('Expected \'' + name + '\' to not have been returned in the result\'s include data for child one'))
						}

						for (var name in ParentModel.fields)
							if (typeof data[name] == 'undefined')
								return done(new Error('Expected \'' + name + '\' to be returned in the result data'))

						for (var name in ChildModelTwo.fields)
							if (typeof data.child2[name] == 'undefined')
								return done(new Error('Expected \'' + name + '\' to be returned in the result\'s include data for child two'))
					}

					done()

				})

		})

	})

})