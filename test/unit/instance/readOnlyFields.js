var expect = require('chai').expect


describe('Instance#readOnlyFields', function() {

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

	describe('for an instance that has not yet been saved to the database', function() {

		var instance

		beforeEach(function() {

			var data = {}

			data.name = 'changeable until saved'
			data.value1 = 41
			data.value2 = 3000

			instance = model.build(data)

		})

		it('should be able to set a "read-only" field', function() {

			var newName = 'a name change'
			var nameBefore = instance.get('name')

			instance.set('name', newName)

			expect(instance.get('name')).to.equal(newName)

		})

		it('should be able to set a "read-only" field in a callback on the \'beforeValidate\' hook', function(done) {

			var newName = 'another change!'
			var nameBefore = instance.get('name')

			model.addHook('beforeValidate', function(next) {

				this.set('name', newName)

				expect(instance.get('name')).to.equal(newName)

				next()

			})

			instance.save().complete(function(errors, result) {

				expect(errors).to.equal(null)
				expect(result.get('name')).to.equal(newName)

				done()

			})

		})

		it('should be able to set a "read-only" field in a callback on the \'beforeCreate\' hook', function(done) {

			var newName = 'another change!'
			var nameBefore = instance.get('name')

			model.addHook('beforeValidate', function(next) {

				this.set('name', newName)

				expect(instance.get('name')).to.equal(newName)

				next()

			})

			instance.save().complete(function(errors, result) {

				expect(errors).to.equal(null)
				expect(result.get('name')).to.equal(newName)

				done()

			})

		})

	})

	describe('for an instance that has already been saved to the database', function() {

		var instance

		before(function(done) {

			var data = {}

			data.name = 'should not be able to change this'
			data.value1 = 52
			data.value2 = 3900

			model.create(data).complete(function(errors, result) {

				expect(errors).to.equal(null)
				expect(result).to.not.equal(null)

				instance = result

				done()

			})

		})

		it('should not be able to change a "read-only" field', function() {

			var nameBefore = instance.get('name')

			instance.set('name', 'a new name!')

			var nameAfter = instance.get('name')

			expect(nameAfter).to.equal(nameBefore)

		})

		it('an error should be returned when attempting to save an instance where the value of the read-only field has been altered', function(done) {

			var nameBefore = instance.get('name')

			var id = instance.get('id')

			// A kludgy way of altering data.
			// We want to make sure we can stop these types of shenanigans as well.
			instance.data.name = 'a new name!'

			instance.save().complete(function(errors) {

				expect(errors).to.not.equal(null)
				expect(errors.name).to.not.equal(undefined)
				expect(errors.name).to.be.an('array')
				expect(errors.name.length).to.equal(1)

				// Verify the entry in the database was not changed.
				model.find(id).complete(function(error, result) {

					expect(error).to.equal(null)
					expect(result).to.not.equal(null)
					expect(result.get('name')).to.equal(nameBefore)

					done()

				})

			})

		})

	})

})