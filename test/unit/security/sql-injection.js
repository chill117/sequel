var async = require('async')
var chai = require('chai')
var expect = chai.expect

var drivers = require('../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Security, SQL Injection', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var model, attacks

	before(function() {

		model = sequel.define('SecuritySQLInjectionTest', {

			id: {
				type: 'integer',
				autoIncrement: true,
				primaryKey: true
			},
			a_string: 'text',
			a_long_string: 'text',
			an_integer: 'integer',
			a_number: 'number',
			a_float: 'float',
			a_decimal: 'decimal',
			a_date: 'date',
			an_array_of_strings: 'array-string',
			an_array_of_integers: 'array-integer',
			an_array_of_numbers: 'array-number',
			an_array_of_floats: 'array-float',
			an_array_of_decimals: 'array-decimal',
			an_array_of_dates: 'array-date',
			an_empty_text_array: 'array-text',
			an_empty_number_array: 'array-number',
			a_read_only_array: {
				type: 'array-text',
				readOnly: true
			}

		}, {

			tableName: 'test_table_3',
			timestamps: false

		})

		attacks = [
			"' DROP TABLE IF EXISTS `test_table_3`"
		]

	})

	describe('create(data, options)', function() {

		it('should not be able to inject SQL into queries via the \'data\' argument', function(done) {

			async.eachSeries(attacks, function(attack, nextAttack) {

				var data = {
					a_string: attack,
					a_long_string: attack,
					an_array_of_strings: [attack]
				}

				var instance = model.build(data)

				instance.save().complete(function(errors, result) {

					expect(errors).to.equal(null)
					expect(result).to.not.equal(null)

					expect(result.get('a_string')).to.equal(attack)
					expect(result.get('a_long_string')).to.equal(attack)

					for (var i in data.an_array_of_strings)
						expect(result.get('an_array_of_strings')[i]).to.equal(attack)

					// Let's verify that the instance was created, and that we can retrieve it.
					model.find(result.get('id')).complete(function(error, result) {

						expect(errors).to.equal(null)
						expect(result).to.not.equal(null)

						expect(result.get('a_string')).to.equal(attack)
						expect(result.get('a_long_string')).to.equal(attack)

						for (var i in data.an_array_of_strings)
							expect(result.get('an_array_of_strings')[i]).to.equal(attack)

						nextAttack()

					})

				})

			}, done)

		})

	})

})

})(drivers[i].sequel, drivers[i].TestManager)