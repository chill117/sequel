var util = require('../../lib/util')

var _ = require('underscore')
var async = require('async')
var BigNumber = require('bignumber.js')
var expect = require('chai').expect


describe('Instance#save([options])', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var model, fixtures

	before(function() {

		model = sequel.define('InstanceSaveTest', {

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

		fixtures = require('../../fixtures/test_table_3')

	})

	describe('When an instance has not yet been saved to the database', function() {

		var instance, data

		beforeEach(function() {

			data = fixtures[0]
			instance = model.build(data)

		})

		afterEach(function(done) {

			instance.destroy().complete(function(error) {

				if (error)
					return done(new Error(error))

				done()

			})

		})

		it('should create a new record in the database', function(done) {

			instance.save().complete(function(errors, result) {

				if (errors)
					return done(new Error('Unexpected error(s)'))

				util.expectDataToMatch(data, result.get(), model)

				model.find(result.get('id')).complete(function(error, result) {

					if (error)
						return done(new Error(error))

					util.expectDataToMatch(data, result.get(), model)

					done()

				})

			})

		})

	})

	describe('When an instance has already been saved to the database', function() {

		var instance, data

		beforeEach(function(done) {

			data = fixtures[0]

			model.create(data).complete(function(errors, result) {

				if (errors)
					return done(new Error('Unexpected error(s)'))

				instance = result
				done()

			})

		})

		afterEach(function(done) {

			instance.destroy().complete(function(error) {

				if (error)
					return done(new Error(error))

				done()

			})

		})

		it('should update the record in the database', function(done) {

			var changedValues = {
				a_string: 'changed string',
				a_long_string: '',
				an_integer: 37,
				a_number: 371,
				a_float: 100000.0001,
				a_decimal: 0.000042,
				a_date: new Date('Sat Mar 01 2014 11:16:34'),
				an_array_of_strings: ['a', 'changed', 'array', 'of', 'strings'],
				an_array_of_integers: [20, 30, 40, 50],
				an_array_of_numbers: [80.02, 100, 1],
				an_array_of_floats: [100.01, 200.02],
				an_array_of_decimals: [100.00002, 0.0002, 50.000002],
				an_array_of_dates: [new Date('Sat Mar 01 2014 11:16:34')]
			}

			instance.set(changedValues)

			instance.save().complete(function(errors, result) {

				if (errors)
					return done(new Error('Unexpected error(s)'))

				util.expectDataToMatch(changedValues, result.get(), model)

				model.find(instance.get('id')).complete(function(error, result) {

					if (error)
						return done(new Error(error))

					util.expectDataToMatch(changedValues, result.get(), model)

					done()

				})

			})

		})

		it('should accurately increment integers, floats, numbers, and decimals', function(done) {

			var valuesBefore = instance.get()

			var increments = {
				an_integer: 2,
				a_number: 0.1,
				a_float: 0.1,
				a_decimal: 0.1
			}

			var expected = {
				an_integer: valuesBefore.an_integer + increments.an_integer,
				a_number: parseFloat( BigNumber(valuesBefore.a_number).plus( increments.a_number ) ),
				a_float: parseFloat( BigNumber(valuesBefore.a_float).plus( increments.a_float ) ),
				a_decimal: valuesBefore.a_decimal.plus( increments.a_decimal )
			}

			instance.set('an_integer', {increment: increments.an_integer})
			instance.set('a_number', {increment: increments.a_number})
			instance.set('a_float', {increment: increments.a_float})
			instance.set('a_decimal', {increment: increments.a_decimal})

			instance.save().complete(function(errors, result) {

				if (errors)
					return done(new Error('Unexpected error(s)'))

				expect(result.get('an_integer')).to.not.equal(null)
				expect(result.get('a_number')).to.not.equal(null)
				expect(result.get('a_float')).to.not.equal(null)
				expect(result.get('a_decimal')).to.not.equal(null)

				expect(result.get('an_integer')).to.equal(expected.an_integer)
				expect(result.get('a_number')).to.equal(expected.a_number)
				expect(result.get('a_float')).to.equal(expected.a_float)
				expect(result.get('a_decimal').toString()).to.equal(expected.a_decimal.toString())

				done()

			})

		})

		it('should accurately decrement integers, floats, numbers, and decimals', function(done) {

			var valuesBefore = instance.get()

			var decrements = {
				an_integer: 2,
				a_number: 0.1,
				a_float: 0.1,
				a_decimal: 0.1
			}

			var expected = {
				an_integer: valuesBefore.an_integer - decrements.an_integer,
				a_number: parseFloat( BigNumber(valuesBefore.a_number).minus( decrements.a_number ) ),
				a_float: parseFloat( BigNumber(valuesBefore.a_float).minus( decrements.a_float ) ),
				a_decimal: valuesBefore.a_decimal.minus( decrements.a_decimal )
			}

			instance.set('an_integer', {decrement: decrements.an_integer})
			instance.set('a_number', {decrement: decrements.a_number})
			instance.set('a_float', {decrement: decrements.a_float})
			instance.set('a_decimal', {decrement: decrements.a_decimal})

			instance.save().complete(function(errors, result) {

				if (errors)
					return done(new Error('Unexpected error(s)'))

				expect(result.get('an_integer')).to.not.equal(null)
				expect(result.get('a_number')).to.not.equal(null)
				expect(result.get('a_float')).to.not.equal(null)
				expect(result.get('a_decimal')).to.not.equal(null)

				expect(result.get('an_integer')).to.equal(expected.an_integer)
				expect(result.get('a_number')).to.equal(expected.a_number)
				expect(result.get('a_float')).to.equal(expected.a_float)
				expect(result.get('a_decimal').toString()).to.equal(expected.a_decimal.toString())

				done()

			})

		})

		it('should accurately increment decimal fields when the increment value is a BigNumber instance', function(done) {

			var increment = BigNumber(0.1)
			var expected = instance.get('a_decimal').plus( increment )

			instance.set('a_decimal', {increment: increment})

			instance.save().complete(function(errors, result) {

				if (errors)
					return done(new Error('Unexpected error(s)'))

				expect(result.get('a_decimal')).to.not.equal(null)
				expect(result.get('a_decimal').equals(expected)).to.equal(true)

				model.find(instance.get('id')).complete(function(error, result) {

					if (error)
						return done(new Error(error))

					expect(result.get('a_decimal')).to.not.equal(null)
					expect(result.get('a_decimal').equals(expected)).to.equal(true)

					done()

				})

			})

		})

		it('should accurately decrement decimal fields when the decrement value is a BigNumber instance', function(done) {

			var decrement = BigNumber(0.1)
			var expected = instance.get('a_decimal').minus( decrement )

			instance.set('a_decimal', {decrement: decrement})

			instance.save().complete(function(errors, result) {

				if (errors)
					return done(new Error('Unexpected error(s)'))

				expect(result.get('a_decimal')).to.not.equal(null)
				expect(result.get('a_decimal').equals(expected)).to.equal(true)

				model.find(instance.get('id')).complete(function(error, result) {

					if (error)
						return done(new Error(error))

					expect(result.get('a_decimal')).to.not.equal(null)
					expect(result.get('a_decimal').equals(expected)).to.equal(true)

					done()

				})

			})

		})

	})

})