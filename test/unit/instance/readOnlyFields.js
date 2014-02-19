var sequel = require('../../sequel')
var TestManager = require('../../test-manager')

var _ = require('underscore')
var async = require('async')
var chai = require('chai')
var expect = chai.expect


describe('Instance#readOnlyFields', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var model = sequel.define('TableOne', {

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

	it('when a field is marked as \'readOnly\', should be able to assign a value to the field before the new instance has been saved', function() {

		var data = {}

		data.name = 'changeable until saved'
		data.value1 = 41
		data.value2 = 3000

		var instance = model.build(data)

		var nameBefore = instance.get('name')

		instance.set('name', 'a name change')

		var nameAfter = instance.get('name')

		expect(nameAfter).to.not.equal(nameBefore)

	})

	it('when a field is marked as \'readOnly\', should not be able to assign a new value to the field for a instance that has already been entered into the database', function(done) {

		var data = {}

		data.name = 'should not be able to change this'
		data.value1 = 52
		data.value2 = 3900

		model.create(data).complete(function(errors, instance) {

			expect(errors).to.equal(null)
			expect(instance).to.not.equal(null)

			var nameBefore = instance.get('name')

			instance.set('name', 'a new name!')

			var nameAfter = instance.get('name')

			expect(nameAfter).to.equal(nameBefore)

			done()

		})

	})

	it('when a field is marked as \'readOnly\', an error should be returned when attempting to save an instance where the value of the read-only field has been altered', function(done) {

		var data = {}

		data.name = 'a name to stand the test of time... and kludgy work-arounds'
		data.value1 = 57
		data.value2 = 490

		model.create(data).complete(function(errors, instance) {

			expect(errors).to.equal(null)
			expect(instance).to.not.equal(null)

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