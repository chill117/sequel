var Instance = require('../../../lib/instance')

var expect = require('chai').expect


describe('Model#instanceMethods', function() {

	it('an instance method that is defined in the options of a model should not be available on the model object, but should be available on an instance of the model', function() {

		var model = sequel.define('InstanceMethodsTest', {

			id: {
				type: 'integer',
				primaryKey: true
			},
			some_event_happened: 'date',
			another_event_happened: 'date'

		}, {

			tableName: 'does_not_exist',

			instanceMethods: {

				resetDates: resetDates

			}

		})

		function resetDates() {

			var now = this.now()

			this.set('some_event_happened', now)
			this.set('another_event_happened', now)

		}

		expect(model.resetDates).to.equal(undefined)

		var instance = model.build()

		expect(instance.resetDates).to.be.a('function')
		expect(instance.resetDates).to.equal(resetDates)

	})

	it('instance methods should be called with the instance context', function(done) {

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

			tableName: 'test_table_1',

			instanceMethods: {
				someMethod: function(arg1, callback) {

					expect(this).to.not.equal(undefined)
					expect(this instanceof Instance).to.equal(true)
					expect(this).to.deep.equal(instance)
					
					expect(arg1).to.be.a('string')
					expect(callback).to.be.a('function')

					callback('right back atchya!')

				}
			}

		})

		var data = {}

		data.name = 'testing instance methods'
		data.value1 = 44
		data.value2 = 3302

		var instance = model.build(data)

		expect(instance.someMethod).to.not.equal(undefined)
		expect(instance.someMethod).to.be.a('function')

		instance.someMethod('hi there!', function(response) {

			// This is the callback.

			expect(response).to.be.a('string')

			done()

		})

	})

	it('instance methods for one model should not be available on another model', function() {

		var modelOne = sequel.define('ModelOne', {

			id: {
				type: 'integer',
				primaryKey: true
			},
			name: 'text',
			description: 'text'

		}, {

			tableName: 'does_not_exist',

			instanceMethods: {
				someMethod: function() {

				}
			}

		})

		var modelTwo = sequel.define('ModelTwo', {

			ref_id: {
				type: 'integer',
				primaryKey: true
			},
			setting1: 'text',
			setting2: 'integer'

		}, {

			tableName: 'does_not_exist',

			instanceMethods: {
				anotherMethod: function() {

				}
			}

		})

		var instanceOfModelOne = modelOne.build()
		var instanceOfModelTwo = modelTwo.build()

		expect(instanceOfModelOne.anotherMethod).to.equal(undefined)
		expect(instanceOfModelTwo.someMethod).to.equal(undefined)

	})
	
})

