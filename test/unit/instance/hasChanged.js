var chai = require('chai')
var expect = chai.expect

var drivers = require('../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Instance#hasChanged(name)', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var model, instance, data, newData

	before(function() {

		model = sequel.define('InstanceHasChangedTest', {

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

		data = {
			a_string: 'a regular amount of text',
			a_long_string: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Donec et mollis dolor. Praesent et diam eget libero egestas mattis sit amet vitae augue.',
			an_array_of_integers: [1, 2, 3],
			an_array_of_strings: ['an', 'array', 'of', 'strings'],
			an_array_of_floats: [15.01, 20, 300.001],
			an_array_of_dates: [new Date(), new Date()],
			an_empty_text_array: [],
			an_empty_number_array: [],
			a_decimal: 201.54,
			an_integer: 15,
			a_date: new Date()
		}

		instance = model.build(data)

	})

	it('should return FALSE for fields that have not been changed', function() {

		for (var field in data)
			expect(instance.hasChanged(field)).to.equal(false)

	})

	it('should return TRUE for fields that have been changed', function() {

		newData = {
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

		instance.set(newData)

		for (var field in newData)
			expect(instance.hasChanged(field)).to.equal(true)

	})

	it('should return FALSE for all the changed fields, after the changes are saved to the database', function(done) {

		instance.save().complete(function(errors, result) {

			if (errors)
			{
				console.log(errors)
				return done(new Error('An unexpected error has occurred'))
			}

			for (var field in newData)
				expect(result.hasChanged(field)).to.equal(false)

			done()

		})

	})

})

})(drivers[i].sequel, drivers[i].TestManager)