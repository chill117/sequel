var sequel = require('../../sequel')
var TestManager = require('../../test-manager')

var _ = require('underscore')
var async = require('async')
var chai = require('chai')
var expect = chai.expect


describe('Model#autoIncrement', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	describe('create(data, options)', function() {

		var model = sequel.define('TableOne', {

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

		it('should return an instance with the correct value for the auto-increment field', function(done) {

			async.timesSeries(5, function(i, next) {

				var data = {}

				data.name = 'some name'
				data.value1 = 51
				data.value2 = 2256

				model.create(data).complete(function(errors, instance) {

					expect(errors).to.equal(null)
					expect(instance).to.not.equal(null)
					expect(instance.get('id')).to.equal(i + 1)

					next()

				})

			}, function(error) {

				if (error)
					return done(new Error(error))

				done()

			})

		})

	})

})