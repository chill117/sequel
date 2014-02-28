var chai = require('chai')
var expect = chai.expect

var drivers = require('../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Instance#dataTypes', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var model

	before(function() {

		model = sequel.define('DataTypesTest', {

			a_string: 'text',
			a_long_string: 'text',
			an_array_of_integers: 'array-integer',
			an_array_of_strings: 'array-string',
			an_array_of_floats: 'array-float',
			an_empty_text_array: 'array-text',
			an_empty_number_array: 'array-number',
			a_read_only_array: {
				type: 'array-text',
				readOnly: true
			},
			a_decimal: 'decimal',
			an_integer: 'integer',
			a_date: 'date'

		}, {

			tableName: 'test_table_3',
			timestamps: false

		})

	})

	var improperlyTypedData = {
		a_string: 0.532,
		a_long_string: 829201881745540.592912592912376437437592912376437,
		a_decimal: '10.05192',
		an_integer: '401',
		a_date: new Date().toString(),
		an_array_of_integers: ['0', '1', '2.3'],
		an_array_of_strings: [0, 1, 4.9, 3],
		an_array_of_floats: ['0.255', '1.123', '2.355'],
		an_empty_text_array: [],
		an_empty_number_array: [],
		a_read_only_array: ['some', 'text', 'array']
	}

	it('when an instance is made, its data should be cast to their proper types', function() {

		var data = improperlyTypedData

		var instance = model.build(data)

		expect(instance.get('a_string')).to.be.a('string')
		expect(instance.get('a_string')).to.equal(data.a_string.toString())

		expect(instance.get('a_long_string')).to.be.a('string')
		expect(instance.get('a_long_string')).to.equal(data.a_long_string.toString())

		expect(instance.get('a_decimal')).to.equal(parseFloat(data.a_decimal))

		expect(instance.get('an_integer')).to.equal(parseInt(data.an_integer))

		expect(instance.get('a_date')).to.be.a('date')
		expect(instance.get('a_date')).to.deep.equal(new Date(data.a_date))

		expect(instance.get('an_array_of_integers')).to.be.an('array')
		expect(instance.get('an_array_of_integers')).to.have.length(data.an_array_of_integers.length)

		for (var i in data.an_array_of_integers)
			expect(instance.get('an_array_of_integers')[i]).to.equal(parseInt(data.an_array_of_integers[i]))

		expect(instance.get('an_array_of_strings')).to.be.an('array')
		expect(instance.get('an_array_of_strings')).to.have.length(data.an_array_of_strings.length)

		for (var i in data.an_array_of_strings)
			expect(instance.get('an_array_of_strings')[i]).to.equal(data.an_array_of_strings[i].toString())

		expect(instance.get('an_array_of_floats')).to.be.an('array')
		expect(instance.get('an_array_of_floats')).to.have.length(data.an_array_of_floats.length)

		for (var i in data.an_array_of_floats)
			expect(instance.get('an_array_of_floats')[i]).to.equal(parseFloat(data.an_array_of_floats[i]))

		expect(instance.get('an_empty_text_array')).to.be.an('array')
		expect(instance.get('an_empty_text_array')).to.have.length(0)

		expect(instance.get('an_empty_number_array')).to.be.an('array')
		expect(instance.get('an_empty_number_array')).to.have.length(0)

		expect(instance.get('a_read_only_array')).to.be.an('array')
		expect(instance.get('a_read_only_array')).to.have.length(data.a_read_only_array.length)

		for (var i in data.a_read_only_array)
			expect(instance.get('a_read_only_array')[i]).to.equal(data.a_read_only_array[i].toString())

	})

	it('when an instance is created, the data should be saved to the database correctly and subsequently retrieved with the correct data types', function(done) {

		var data = improperlyTypedData

		model.create(data).complete(function(errors, result) {

			expect(errors).to.equal(null)
			expect(result).to.not.equal(null)

			var id = result.get('id')

			// Get a fresh instance from the database.
			model.find(id).complete(function(error, instance) {

				expect(error).to.equal(null)

				expect(instance.get('a_string')).to.be.a('string')
				expect(instance.get('a_string')).to.equal(data.a_string.toString())

				expect(instance.get('a_long_string')).to.be.a('string')
				expect(instance.get('a_long_string')).to.equal(data.a_long_string.toString())

				expect(instance.get('a_decimal')).to.equal(parseFloat(data.a_decimal))

				expect(instance.get('an_integer')).to.equal(parseInt(data.an_integer))

				expect(instance.get('a_date')).to.be.a('date')
				expect(instance.get('a_date')).to.deep.equal(new Date(data.a_date))

				expect(instance.get('an_array_of_integers')).to.be.an('array')
				expect(instance.get('an_array_of_integers')).to.have.length(data.an_array_of_integers.length)

				for (var i in data.an_array_of_integers)
					expect(instance.get('an_array_of_integers')[i]).to.equal(parseInt(data.an_array_of_integers[i]))

				expect(instance.get('an_array_of_strings')).to.be.an('array')
				expect(instance.get('an_array_of_strings')).to.have.length(data.an_array_of_strings.length)

				for (var i in data.an_array_of_strings)
					expect(instance.get('an_array_of_strings')[i]).to.equal(data.an_array_of_strings[i].toString())

				expect(instance.get('an_array_of_floats')).to.be.an('array')
				expect(instance.get('an_array_of_floats')).to.have.length(data.an_array_of_floats.length)

				for (var i in data.an_array_of_floats)
					expect(instance.get('an_array_of_floats')[i]).to.equal(parseFloat(data.an_array_of_floats[i]))

				expect(instance.get('an_empty_text_array')).to.be.an('array')
				expect(instance.get('an_empty_text_array')).to.have.length(0)

				expect(instance.get('an_empty_number_array')).to.be.an('array')
				expect(instance.get('an_empty_number_array')).to.have.length(0)

				expect(instance.get('a_read_only_array')).to.be.an('array')
				expect(instance.get('a_read_only_array')).to.have.length(data.a_read_only_array.length)

				for (var i in data.a_read_only_array)
					expect(instance.get('a_read_only_array')[i]).to.equal(data.a_read_only_array[i].toString())

				done()

			})

		})

	})

})

})(drivers[i].sequel, drivers[i].TestManager)