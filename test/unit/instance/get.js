var chai = require('chai')
var expect = chai.expect

var drivers = require('../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

	describe('Instance#', function() {

		var model = sequel.define('InstanceGetTest', {

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

		describe('get(name)', function() {

			it('should return the value for a single field', function() {

				var data = {
					id: 1,
					name: 'Some thing',
					description: 'A description of some thing',
					num_something: 10
				}

				var instance = model.build(data)

				for (var field in data)
					expect(instance.get(field)).to.equal(data[field])

			})
			
		})

		describe('get()', function() {

			it('should return all data', function() {

				var data = {
					id: 2,
					name: 'Another thing',
					description: 'A description of another thing',
					num_something: 2
				}

				var instance = model.build(data)

				expect(instance.get()).to.deep.equal(data)
				
			})
			
		})

	})

})(drivers[i].sequel, drivers[i].TestManager)