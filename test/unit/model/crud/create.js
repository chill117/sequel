var expect = require('chai').expect


describe('Model#create(data[, options])', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var model

	before(function() {

		model = sequel.define('CRUDCreateModel', {

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

	})

	it('should be a method', function() {

		expect(model.create).to.be.a('function')

	})

	it('should return a newly created instance when valid data is provided', function(done) {

		var data = {}

		data.name = 'testing default value'
		data.value1 = 5
		data.value2 = 500
		data.modata = 3
		data.moproblems = 'text!'

		model.create(data).complete(function(errors, instance) {

			expect(errors).to.equal(null)
			expect(instance).to.not.equal(null)
			expect(instance).to.be.an('object')

			for (var field in data)
				if (data[field])
					expect(instance.get(field)).to.equal(data[field])

			done()

		})

	})

	it('default values should be used for fields where data is missing', function(done) {

		var data = {}

		data.name = 'testing default value'
		data.value1 = 5
		data.value2 = 500
		// data.modata
		// data.moproblems

		model.create(data).complete(function(errors, instance) {

			expect(errors).to.equal(null)
			expect(instance).to.not.equal(null)
			expect(instance).to.be.an('object')
			expect(instance.get('name')).to.equal(data.name)
			expect(instance.get('value1')).to.equal(data.value1)
			expect(instance.get('value2')).to.equal(data.value2)
			expect(instance.get('modata')).to.equal(model.fields.modata.getDefaultValue())
			expect(instance.get('moproblems')).to.equal(model.fields.moproblems.getDefaultValue())

			done()

		})

	})

})