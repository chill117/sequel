var modeler = require('../../modeler')
var TestManager = require('../../test-manager')

var _ = require('underscore')
var async = require('async')
var chai = require('chai')
var expect = chai.expect


describe('Model#primaryKeys', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	describe('when attempting to create a new instance with a value that matches an existing instance for a field that has been marked as a \'primaryKey\'', function() {

		it('should return an error', function(done) {

			var model = modeler.define('TableOne', {

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

			var data = {}

			data.name = 'some name'
			data.value1 = 51
			data.value2 = 2256

			model.create(data).complete(function(errors, instance) {

				expect(errors).to.equal(null)
				expect(instance).to.not.equal(null)

				var data2 = {}

				data2.id = instance.get('id')// Use the same ID.
				data2.name = 'another name'
				data2.value1 = 56
				data2.value2 = 2020

				model.create(data2).complete(function(errors, result) {

					expect(errors).to.not.equal(null)
					expect(errors.id).to.not.equal(undefined)
					expect(errors.id).to.be.an('array')
					expect(errors.id.length).to.equal(1)
					expect(result).to.equal(null)

					done()

				})

			})

		})

	})

})