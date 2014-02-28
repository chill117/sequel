var chai = require('chai')
var expect = chai.expect

var drivers = require('../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

	describe('Instance#', function() {

		var model

		before(function() {

			model = sequel.define('InstanceGetTest', {

				id: {
					type: 'integer',
					autoIncrement: true,
					primaryKey: true
				},
				name: 'text',
				description: 'text',
				num_something: 'integer'

			}, {

				tableName: 'does_not_exist'

			})

		})

		describe('set(name, value)', function() {

			it('should change instance data as expected', function() {

				var data = {
					id: 2,
					name: 'Another thing',
					description: 'A description of another thing',
					num_something: 2
				}

				var instance = model.build(data)

				var value = 'Changed name'

				instance.set('name', value)

				data.name = value

				expect(instance.get()).to.deep.equal(data)

			})
			
		})

		describe('set(values)', function() {

			it('should change instance data as expected', function() {

				var data = {
					id: 2,
					name: 'Another thing',
					description: 'A description of another thing',
					num_something: 2
				}

				var instance = model.build(data)

				var values = {
					name: 'Changed name',
					description: 'Also changed the description'
				}

				instance.set(values)

				data.name = values.name
				data.description = values.description

				expect(instance.get()).to.deep.equal(data)

			})

		})

	})

})(drivers[i].sequel, drivers[i].TestManager)