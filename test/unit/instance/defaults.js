var BigNumber = require('bignumber.js')
var chai = require('chai')
var expect = chai.expect

var drivers = require('../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Instance#Defaults', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var model

	before(function() {

		model = sequel.define('DefaultsTest', {

			id: {
				type: 'integer',
				autoIncrement: true,
				primaryKey: true
			},
			a_string: {
				type: 'text',
				defaultValue: 'a default string value'
			},
			an_array_of_strings: {
				type: 'array-string',
				defaultValue: ['a string', 'another string']
			}

		}, {

			tableName: 'test_table_3',
			timestamps: false

		})

	})

	describe('when saving a new instance to the database', function() {

		it('should use the default value for a field when no value is given', function(done) {

			var instance = model.build()

			instance.save().complete(function(errors, result) {

				expect(errors).to.equal(null)
				expect(result).to.not.equal(null)

				var expectedDefaultValue = model.getField('a_string').getDefaultValue()

				expect(result.get('a_string')).to.equal( expectedDefaultValue )

				var id = result.get('id')

				// Verify the value was saved to the database correctly.
				model.find(id).complete(function(error, result) {

					expect(error).to.equal(null)
					expect(result).to.not.equal(null)

					expect(result.get('a_string')).to.equal( expectedDefaultValue )

					done()

				})

			})

		})

		it('should set the default value for an array field when no value is given', function(done) {

			var instance = model.build()

			instance.save().complete(function(errors, result) {

				expect(errors).to.equal(null)
				expect(result).to.not.equal(null)

				var expectedDefaultValue = model.getField('an_array_of_strings').getDefaultValue()

				expect(result.get('an_array_of_strings')).to.deep.equal( expectedDefaultValue )

				var id = result.get('id')

				// Verify the value was saved to the database correctly.
				model.find(id).complete(function(error, result) {

					expect(error).to.equal(null)
					expect(result).to.not.equal(null)

					expect(result.get('an_array_of_strings')).to.deep.equal( expectedDefaultValue )

					done()

				})

			})
			
		})

	})

})

})(drivers[i].sequel, drivers[i].TestManager)