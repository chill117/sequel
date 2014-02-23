var chai = require('chai')
var expect = chai.expect

var drivers = require('../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Model#readOnlyFields', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var model

	before(function() {

		model = sequel.define('TableOne', {

			id: {
				type: 'integer',
				autoIncrement: true,
				primaryKey: true
			},
			name: {
				type: 'text',
				readOnly: true,
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

	})

	it('when a field is marked as \'readOnly\', should be able to assign a value to the field when creating a new instance', function(done) {

		var data = {}

		data.name = 'some name'
		data.value1 = 41
		data.value2 = 3000

		model.create(data).complete(function(errors, instance) {

			expect(errors).to.equal(null)
			expect(instance).to.not.equal(null)

			expect(instance.get('name')).to.equal(data.name)

			done()

		})

	})

	it('should not be able to update a field marked as \'readOnly\'', function(done) {

		var data = {}

		data.name = 'an unchangeable name'
		data.value1 = 14
		data.value2 = 491

		model.create(data).complete(function(errors, instance) {

			if (errors)
			{
				console.log(errors)

				return done(new Error('An unexpected error has occurred'))
			}

			var nameBefore = instance.get('name')
			var id = instance.get('id')

			var data = {}, options = {}

			data.name = 'trying a change anyways'

			options.where = {}
			options.where.id = id

			model.update(data, options).complete(function(errors) {

				// Verify the entry in the database was not changed.
				model.find(id).complete(function(error, result) {

					if (error)
						return done(new Error(error))

					expect(result).to.not.equal(null)
					expect(result.get('name')).to.equal(nameBefore)

					done()

				})

			})

		})

	})

})

})(drivers[i].sequel, drivers[i].TestManager)