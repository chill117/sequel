var modeler = require('../../modeler')
var Model = require('../../../lib/model')

var chai = require('chai')
var expect = chai.expect


describe('Model#classMethods', function() {

	var model = modeler.define('ClassMethodsTest', {

		id: {
			type: 'integer',
			autoIncrement: true,
			primaryKey: true
		},
		somefield: 'integer',
		anotherfield: 'text'

	}, {

		tableName: 'does_not_exist',

		classMethods: {

			performMagic: performMagic

		}

	})

	function performMagic(value) {

		var magic_number = 5

		return (value * magic_number) + magic_number

	}

	it('a class method that is defined in the options of a model should be available on the model object, but should not be available on an instance of the model', function() {

		expect(model.performMagic).to.be.a('function')
		expect(model.performMagic).to.equal(performMagic)

		var instance = model.build()

		expect(instance.performMagic).to.equal(undefined)

	})

	it('class methods should be called with the model context', function(done) {

		var model = modeler.define('ClassMethodsTest2', {

			id: {
				type: 'integer',
				autoIncrement: true,
				primaryKey: true
			},
			name: 'text'

		}, {

			tableName: 'does_not_exist',

			classMethods: {
				someMethod: function(callback) {

					expect(this).to.not.equal(undefined)
					expect(this instanceof Model).to.equal(true)
					expect(this).to.deep.equal(model)

					// Do stuff here!

					callback()

				}
			}

		})

		expect(model.someMethod).to.not.equal(undefined)
		expect(model.someMethod).to.be.a('function')

		model.someMethod(function() {

			// This is the callback.

			done()

		})

	})

})