var _ = require('underscore')
var async = require('async')
var BigNumber = require('bignumber.js')
var chai = require('chai')
var expect = chai.expect

var drivers = require('../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Instance#save([options])', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var fixtures = require('../../fixtures')
	var model

	before(function() {

		model = sequel.define('InstanceSaveTest', {

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
			},
			a_decimal: 'decimal'

		}, {

			tableName: 'test_table_1'

		})

	})

	describe('when creating new instances', function() {

		it('should save each new instance to the database', function(done) {

			var table = model.tableName

			async.eachSeries(fixtures[table], function(data, nextFixture) {

				var instance = model.build(data)

				instance.save().complete(function(errors, result) {

					if (errors)
					{
						console.log(errors)
						return nextFixture(new Error('An unexpected error has occurred'))
					}

					for (var field in data)
						expect(result.get(field)).to.equal(data[field])

					model.find(result.get('id')).complete(function(error, result) {

						if (error)
							return nextFixture(new Error(error))

						for (var field in data)
							expect(result.get(field)).to.equal(data[field])

						nextFixture()

					})

				})

			}, done)

		})

	})

	describe('when updating existing instances', function() {

		before(function(done) {

			model.destroy().complete(function(error) {

				if (error)
					return done(new Error(error))

				done()

			})

		})

		var instances = []

		before(function(done) {

			var table = model.tableName

			async.eachSeries(fixtures[table], function(data, nextFixture) {

				model.create(data).complete(function(errors, instance) {

					if (errors)
					{
						console.log(errors)
						return nextFixture(new Error('An unexpected error has occurred'))
					}

					instances.push(instance)

					nextFixture()

				})

			}, done)

		})

		it('should save the instance data to the database', function(done) {

			async.each(instances, function(instance, nextInstance) {

				var changedValues = {
					name: 'Changed name',
					value1: 37,
					value1: 371,
					modata: 200,
					moproblems: 'Some text here'
				}

				instance.set(changedValues)

				instance.save().complete(function(errors, result) {

					if (errors)
					{
						console.log(errors)
						return nextInstance(new Error('An unexpected error has occurred'))
					}

					expect(result.get()).to.deep.equal(instance.get())

					model.find(instance.get('id')).complete(function(error, result) {

						if (error)
							return nextInstance(new Error(error))

						expect(result.get()).to.deep.equal(instance.get())

						nextInstance()

					})

				})

			}, done)

		})

		it('should accurately increment floating point numbers', function(done) {

			async.each(instances, function(instance, nextInstance) {

				var valueBefore = instance.get('a_decimal')
				var increment = 0.2
				var expected = parseFloat(BigNumber(valueBefore).plus(increment))

				instance.set('a_decimal', {increment: increment})

				instance.save().complete(function(errors, result) {

					if (errors)
					{
						console.log(errors)
						return nextInstance(new Error('An unexpected error has occurred'))
					}

					expect(result.get('a_decimal')).to.equal(expected)

					nextInstance()

				})

			}, done)

		})

		it('should accurately decrement floating point numbers', function(done) {

			async.each(instances, function(instance, nextInstance) {

				var valueBefore = instance.get('a_decimal')
				var decrement = 0.2
				var expected = parseFloat(BigNumber(valueBefore).minus(decrement))

				instance.set('a_decimal', {decrement: decrement})

				instance.save().complete(function(errors, result) {

					if (errors)
					{
						console.log(errors)
						return nextInstance(new Error('An unexpected error has occurred'))
					}

					expect(result.get('a_decimal')).to.equal(expected)

					nextInstance()

				})

			}, done)

		})

	})

})

})(drivers[i].sequel, drivers[i].TestManager)