var expect = require('chai').expect


describe('Instance#hasChanged(name)', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var model, data1, data2

	before(function() {

		model = sequel.define('InstanceHasChangedTest', {

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

		data1 = {
			a_string: 'a regular amount of text',
			a_long_string: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Donec et mollis dolor. Praesent et diam eget libero egestas mattis sit amet vitae augue.',
			an_array_of_integers: [1, 2, 3],
			an_array_of_strings: ['an', 'array', 'of', 'strings'],
			an_array_of_floats: [15.01, 20, 300.001],
			an_array_of_dates: [new Date(), new Date()],
			a_decimal: 201.54,
			an_integer: 15,
			a_date: new Date()
		}

		data2 = {
			a_string: 'a different string',
			a_long_string: 'Donec viverra mi quis quam pulvinar at malesuada arcu rhoncus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In rutrum accumsan ultricies. Mauris vitae nisi at sem facilisis semper ac in est.',
			an_array_of_integers: [4, 5, 6],
			an_array_of_strings: ['a', 'new', 'array', 'of', 'strings'],
			an_array_of_floats: [20.1, 40.10, 12],
			an_array_of_dates: [new Date(new Date().getTime() - 15000)],
			a_decimal: 55.20,
			an_integer: 89,
			a_date: new Date(new Date().getTime() - 15000)
		}

	})

	it('should return FALSE for fields that have not been changed', function() {

		var instance = model.build(data1)

		for (var field in data1)
			expect(instance.hasChanged(field)).to.equal(false)

	})

	it('should return TRUE for fields that have been changed, before the changes are saved to the database', function() {

		var instance = model.build(data1)

		instance.set(data2)

		for (var field in data2)
			expect(instance.hasChanged(field)).to.equal(true)

	})

	it('should return FALSE for all the fields that were changed, after the changes are saved to the database', function(done) {

		var instance = model.build(data1)

		instance.set(data2)

		instance.save().complete(function(errors, result) {

			if (errors)
			{
				console.log(errors)
				return done(new Error('Unexpected error(s)'))
			}

			for (var field in data2)
				expect(result.hasChanged(field)).to.equal(false)

			done()

		})

	})

	it('for an instance that had data changed and then saved to the database, should return TRUE for fields that are changed back to their original values', function(done) {

		var instance = model.build(data1)

		instance.set(data2)

		instance.save().complete(function(errors, result) {

			if (errors)
			{
				console.log(errors)
				return done(new Error('Unexpected error(s)'))
			}

			instance.set(data1)

			for (var field in data1)
				expect(instance.hasChanged(field)).to.equal(true)

			done()

		})

	})

	it('should return TRUE for an array field that had its previous values overwritten', function(done) {

		var instance = model.build(data1)

		instance.set(data2)

		instance.save().complete(function(errors, result) {

			if (errors)
			{
				console.log(errors)
				return done(new Error('Unexpected error(s)'))
			}

			var an_array_of_strings = instance.get('an_array_of_strings')

			for (var i in an_array_of_strings)
				an_array_of_strings[i] = 'changed'

			instance.set('an_array_of_strings', an_array_of_strings)

			expect(instance.hasChanged('an_array_of_strings')).to.equal(true)

			done()

		})

	})

	it('should return TRUE for an array field that was emptied', function(done) {

		var instance = model.build(data1)

		instance.set(data2)

		instance.save().complete(function(errors, result) {

			if (errors)
			{
				console.log(errors)
				return done(new Error('Unexpected error(s)'))
			}

			var an_array_of_integers = instance.get('an_array_of_integers')

			an_array_of_integers = []

			instance.set('an_array_of_integers', an_array_of_integers)

			expect(instance.hasChanged('an_array_of_integers')).to.equal(true)

			done()

		})

	})

})