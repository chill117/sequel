var _ = require('underscore')
var async = require('async')
var expect = require('chai').expect


describe('Model#create(data[, options])', function() {

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

		expect(ModelOne.create).to.be.a('function')

	})

	it('default values should be used for fields where data is missing', function(done) {

		var data = {}

		data.name = 'testing default value'
		data.value1 = 5
		data.value2 = 500
		// data.modata
		// data.moproblems

		ModelOne.create(data).complete(function(errors, instance) {

			expect(errors).to.equal(null)
			expect(instance).to.not.equal(null)
			expect(instance).to.be.an('object')
			expect(instance.get('name')).to.equal(data.name)
			expect(instance.get('value1')).to.equal(data.value1)
			expect(instance.get('value2')).to.equal(data.value2)
			expect(instance.get('modata')).to.equal(ModelOne.fields.modata.getDefaultValue())
			expect(instance.get('moproblems')).to.equal(ModelOne.fields.moproblems.getDefaultValue())

			done()

		})

	})

	it('should return a newly created instance for each row of data', function(done) {

		async.each(_.values(models), function(model, nextModel) {

			var table = model.tableName

			async.eachSeries(fixtures[table], function(data, nextFixture) {

				model.create(data).complete(function(errors, instance) {

					expect(errors).to.equal(null)
					expect(instance).to.not.equal(null)
					expect(instance).to.be.an('object')

					for (var field in data)
						if (data[field])
							expect(instance.get(field)).to.equal(data[field])

					nextFixture()

				})

			}, nextModel)

		}, done)

	})

})

