var _ = require('underscore')
var async = require('async')
var expect = require('chai').expect


describe('Model#find([primay_key, ]options)', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var fixtures = require('../../../fixtures')
	var ModelOne, ModelTwo, models

	before(function() {

		ModelOne = sequel.define('CRUDCreateModelOne', {

			id: {
				type: 'integer',
				autoIncrement: true,
				primaryKey: true
			},
			name: {
				type: 'text',
				validate: {
					notEmpty: {
						msg: 'Name cannot be empty'
					}
				}
			},
			value1: {
				type: 'integer',
				validate: {
					notNull: true,
					isInt: true,
					max: 500
				},
				defaultValue: 20
			},
			value2: {
				type: 'integer',
				validate: {
					notNull: true,
					isInt: true,
					max: 5000
				},
				defaultValue: 0
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

		ModelTwo = sequel.define('CRUDCreateModelTwo', {

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

			tableName: 'test_table_2'

		})

		models = {
			'test_table_1': ModelOne,
			'test_table_2': ModelTwo
		}

	})

	it('should be a method', function() {

		expect(ModelOne.find).to.be.a('function')

	})

	describe('with instances in the database', function() {

		var instances = {}

		before(function(done) {

			async.each(_.values(models), function(model, nextModel) {

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

		it('should return null when no instance is found', function(done) {

			var primary_key = 500

			ModelOne.find(primary_key).complete(function(error, instance) {

				expect(error).to.equal(null)
				expect(instance).to.equal(null)

				done()

			})

		})

		it('should return the correct instance', function(done) {

			async.each(_.values(models), function(model, nextModel) {

				var table = model.tableName

				async.each(instances[table], function(instance, nextInstance) {

					var primary_key = instance.get('id')

					model.find(primary_key).complete(function(error, result) {

						expect(error).to.equal(null)
						expect(result.get()).to.deep.equal(instance.get())

						nextInstance()

					})

				}, nextModel)

			}, done)

		})

	})

})

