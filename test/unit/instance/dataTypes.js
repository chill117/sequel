var BigNumber = require('bignumber.js')
var expect = require('chai').expect

describe('Instance#dataTypes', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var model

	before(function() {

		model = sequel.define('DataTypesTest', {

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

	})

	var improperlyTypedData = {
		a_string: 0.532,
		a_long_string: 829201881745540.592912592912376437437592912376437,
		an_integer: '401',
		a_number: '10.05192',
		a_float: '10.1001',
		a_decimal: 0.20,
		a_date: new Date().toString(),
		an_array_of_strings: [0, 1, 4.9, 3],
		an_array_of_integers: ['0', '1', '2.3'],
		an_array_of_numbers: ['0.255', '1.123', '2.355'],
		an_array_of_floats: ['0.255', '1.123', '2.355'],
		an_array_of_decimals: [0.00002, 1.01, 4.9, 3.00003],
		an_array_of_dates: [new Date().toString(), new Date().toString()],
		an_empty_text_array: [],
		an_empty_number_array: [],
		a_read_only_array: ['some', 'text', 'array']
	}

	it('when an instance is made, its data should be cast to their proper types', function() {

		var data = improperlyTypedData

		var instance = model.build(data)

		expect(instance.get('a_string')).to.be.a('string')
		expect(instance.get('a_string')).to.equal( data.a_string.toString() )
		expect(instance.get('a_long_string')).to.be.a('string')
		expect(instance.get('a_long_string')).to.equal( data.a_long_string.toString() )

		expect(instance.get('an_integer')).to.equal( parseInt(data.an_integer) )

		expect(instance.get('a_number')).to.equal( parseFloat(data.a_number) )
		expect(instance.get('a_float')).to.equal( parseFloat(data.a_float) )

		expect(instance.get('a_decimal')).to.deep.equal( BigNumber(data.a_decimal) )

		expect(instance.get('a_date')).to.be.a('date')
		expect(instance.get('a_date')).to.deep.equal( new Date(data.a_date) )

		expect(instance.get('an_array_of_strings')).to.be.an('array')
		expect(instance.get('an_array_of_strings')).to.have.length( data.an_array_of_strings.length )

		for (var i in data.an_array_of_strings)
			expect(instance.get('an_array_of_strings')[i]).to.equal( data.an_array_of_strings[i].toString() )

		expect(instance.get('an_array_of_integers')).to.be.an('array')
		expect(instance.get('an_array_of_integers')).to.have.length( data.an_array_of_integers.length )

		for (var i in data.an_array_of_integers)
			expect(instance.get('an_array_of_integers')[i]).to.equal( parseInt(data.an_array_of_integers[i]) )

		expect(instance.get('an_array_of_numbers')).to.be.an('array')
		expect(instance.get('an_array_of_numbers')).to.have.length( data.an_array_of_numbers.length )

		for (var i in data.an_array_of_numbers)
			expect(instance.get('an_array_of_numbers')[i]).to.equal( parseFloat(data.an_array_of_numbers[i]) )

		expect(instance.get('an_array_of_floats')).to.be.an('array')
		expect(instance.get('an_array_of_floats')).to.have.length( data.an_array_of_floats.length )

		for (var i in data.an_array_of_floats)
			expect(instance.get('an_array_of_floats')[i]).to.equal( parseFloat(data.an_array_of_floats[i]) )

		expect(instance.get('an_array_of_decimals')).to.be.an('array')
		expect(instance.get('an_array_of_decimals')).to.have.length( data.an_array_of_decimals.length )

		for (var i in data.an_array_of_decimals)
			expect(instance.get('an_array_of_decimals')[i]).to.deep.equal( BigNumber(data.an_array_of_decimals[i]) )

		expect(instance.get('an_array_of_dates')).to.be.an('array')
		expect(instance.get('an_array_of_dates')).to.have.length( data.an_array_of_dates.length )

		for (var i in data.an_array_of_dates)
		{
			expect(instance.get('an_array_of_dates')[i]).to.be.a('date')
			expect(instance.get('an_array_of_dates')[i]).to.deep.equal( new Date(data.an_array_of_dates[i]) )
		}

		expect(instance.get('an_empty_text_array')).to.be.an('array')
		expect(instance.get('an_empty_text_array')).to.have.length( 0 )

		expect(instance.get('an_empty_number_array')).to.be.an('array')
		expect(instance.get('an_empty_number_array')).to.have.length( 0 )

		expect(instance.get('a_read_only_array')).to.be.an('array')
		expect(instance.get('a_read_only_array')).to.have.length( data.a_read_only_array.length )

		for (var i in data.a_read_only_array)
			expect(instance.get('a_read_only_array')[i]).to.equal( data.a_read_only_array[i].toString() )

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
				expect(instance.get('a_string')).to.equal( data.a_string.toString() )
				expect(instance.get('a_long_string')).to.be.a('string')
				expect(instance.get('a_long_string')).to.equal( data.a_long_string.toString() )

				expect(instance.get('an_integer')).to.equal( parseInt(data.an_integer) )

				expect(instance.get('a_number')).to.equal( parseFloat(data.a_number) )
				expect(instance.get('a_float')).to.equal( parseFloat(data.a_float) )

				expect(instance.get('a_decimal')).to.deep.equal( BigNumber(data.a_decimal) )

				expect(instance.get('a_date')).to.be.a('date')
				expect(instance.get('a_date')).to.deep.equal( new Date(data.a_date) )

				expect(instance.get('an_array_of_strings')).to.be.an('array')
				expect(instance.get('an_array_of_strings')).to.have.length( data.an_array_of_strings.length )

				for (var i in data.an_array_of_strings)
					expect(instance.get('an_array_of_strings')[i]).to.equal( data.an_array_of_strings[i].toString() )

				expect(instance.get('an_array_of_integers')).to.be.an('array')
				expect(instance.get('an_array_of_integers')).to.have.length( data.an_array_of_integers.length )

				for (var i in data.an_array_of_integers)
					expect(instance.get('an_array_of_integers')[i]).to.equal( parseInt(data.an_array_of_integers[i]) )

				expect(instance.get('an_array_of_numbers')).to.be.an('array')
				expect(instance.get('an_array_of_numbers')).to.have.length( data.an_array_of_numbers.length )

				for (var i in data.an_array_of_numbers)
					expect(instance.get('an_array_of_numbers')[i]).to.equal( parseFloat(data.an_array_of_numbers[i]) )

				expect(instance.get('an_array_of_floats')).to.be.an('array')
				expect(instance.get('an_array_of_floats')).to.have.length( data.an_array_of_floats.length )

				for (var i in data.an_array_of_floats)
					expect(instance.get('an_array_of_floats')[i]).to.equal( parseFloat(data.an_array_of_floats[i]) )

				expect(instance.get('an_array_of_decimals')).to.be.an('array')
				expect(instance.get('an_array_of_decimals')).to.have.length( data.an_array_of_decimals.length )

				for (var i in data.an_array_of_decimals)
					expect(instance.get('an_array_of_decimals')[i]).to.deep.equal( BigNumber(data.an_array_of_decimals[i]) )

				expect(instance.get('an_array_of_dates')).to.be.an('array')
				expect(instance.get('an_array_of_dates')).to.have.length( data.an_array_of_dates.length )

				for (var i in data.an_array_of_dates)
				{
					expect(instance.get('an_array_of_dates')[i]).to.be.a('date')
					expect(instance.get('an_array_of_dates')[i]).to.deep.equal( new Date(data.an_array_of_dates[i]) )
				}

				expect(instance.get('an_empty_text_array')).to.be.an('array')
				expect(instance.get('an_empty_text_array')).to.have.length( 0 )

				expect(instance.get('an_empty_number_array')).to.be.an('array')
				expect(instance.get('an_empty_number_array')).to.have.length( 0 )

				expect(instance.get('a_read_only_array')).to.be.an('array')
				expect(instance.get('a_read_only_array')).to.have.length( data.a_read_only_array.length )

				for (var i in data.a_read_only_array)
					expect(instance.get('a_read_only_array')[i]).to.equal( data.a_read_only_array[i].toString() )

				done()

			})

		})

	})

	it('should cast non-number values to NaN for decimal fields, instead of passing the value to BigNumber(), which throws an error when given a non-number value', function() {

		var data = {
			a_decimal: {objects: 'are', not: 'numbers'}
		}

		var instance, thrownError

		try {

			instance = model.build(data)

		} catch (error) {

			thrownError = error

		} finally {

			expect(thrownError).to.equal(undefined)
			expect(instance).to.not.equal(undefined)
			expect( isNaN(instance.get('a_decimal')) ).to.equal(true)

		}

	})

})