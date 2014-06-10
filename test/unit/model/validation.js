var Instance = require('../../../lib/instance')

var chai = require('chai')
var expect = chai.expect

var drivers = require('../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Model#validation', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)

	var Validation

	before(function() {

		Validation = sequel.validation

	})

	after(TestManager.tearDown)

	describe('create(data, options)', function() {

		it('should return errors when given data that will fail validation', function(done) {

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

				tableName: 'test_table_1'

			})

			var data = {}

			data.name = ''
			data.value1 = 25
			data.value2 = 4500

			model.create(data).complete(function(errors, instance) {

				expect(errors).to.not.equal(null)
				expect(errors).to.be.an('object')
				expect(instance).to.equal(null)

				done()

			})

		})

		describe('out-of-the-box validations', function() {

			var model = sequel.define('ModelValidationOutOfTheBoxTest', {

				name: {
					type: 'text',
					validate: {
						notEmpty: true,
						minLen: 10
					}
				},
				description: {
					type: 'text',
					validate: {
						notEmpty: true,
						maxLen: 100
					}
				},
				email: {
					type: 'text',
					validate: {
						notEmpty: true,
						isEmail: true
					}
				},
				ip_address: {
					type: 'text',
					validate: {
						notEmpty: true,
						isIP: true
					}
				},
				match_this: {
					type: 'text',
					validate: {
						matches: new RegExp('^[a-zA-Z0-9_]+$')
					}
				},
				no_null_please: {
					type: 'integer',
					validate: {
						notNull: true
					}
				},
				number_with_min: {
					type: 'integer',
					validate: {
						min: 10
					}
				},
				number_with_max: {
					type: 'integer',
					validate: {
						max: 5000
					}
				},
				decimal_precision: {
					type: 'number',
					validate: {
						precision: 3
					}
				},
				some_int: {
					type: 'integer',
					validate: {
						isIn: [1, 3, 5, 7]
					}
				},
				some_char: {
					type: 'text',
					validate: {
						isIn: ['some', 'array', 'of', 'text']
					}
				}

			}, {

				tableName: 'does_not_exist'

			})

			it('should return default error messages', function(done) {

				var data = {}

				data.name = 'too short'
				data.description = 'A very long description: Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
				data.email = 'not an email address'
				data.ip_address = 'not an ip address'
				data.match_this = 's()me we!rd ch@racter$'
				//data.no_null_please
				data.number_with_min = 3
				data.number_with_max = 16000
				data.decimal_precision = 1.0001
				data.some_int = 2
				data.some_char = 'not'

				var instance = model.build(data)

				instance.validate().complete(function(errors) {

					expect(errors).to.not.equal(null)
					expect(errors).to.be.an('object')

					expect(errors.name).to.deep.equal([Validation.getError('minLen', 10)])
					expect(errors.description).to.deep.equal([Validation.getError('maxLen', 100)])
					expect(errors.email).to.deep.equal([Validation.getError('isEmail')])
					expect(errors.ip_address).to.deep.equal([Validation.getError('isIP')])
					expect(errors.match_this).to.deep.equal([Validation.getError('matches')])
					expect(errors.no_null_please).to.deep.equal([Validation.getError('notNull')])
					expect(errors.number_with_min).to.deep.equal([Validation.getError('min', 10)])
					expect(errors.number_with_max).to.deep.equal([Validation.getError('max', 5000)])
					expect(errors.decimal_precision).to.deep.equal([Validation.getError('precision', 3)])

					done()

				})

			})

			it('should pass validation successfully', function(done) {

				var data = {}

				data.name = 'just long enough'
				data.description = 'An acceptable length for a description.'
				data.email = 'test_testerson@testing.com'
				data.ip_address = '255.255.255.255'
				data.match_this = 'some_normal_string'
				data.no_null_please = 2
				data.number_with_min = 12
				data.number_with_max = 4000
				data.decimal_precision = 1.001
				data.some_int = 3
				data.some_char = 'some'

				var instance = model.build(data)

				instance.validate().complete(function(errors) {

					expect(errors).to.equal(null)

					done()

				})

			})

		})

		it('should return errors for data that does not match its field\'s data type', function(done) {

			var model = sequel.define('ModelDataTypeValidationTest', {

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
				an_array_of_dates: 'array-date'

			}, {

				tableName: 'test_table_3'

			})

			var data = {
				an_integer: 'not an integer',
				a_number: 'not a number',
				a_float: 'not a float',
				a_decimal: 'not a decimal',
				a_date: 'not a date',
				an_array_of_integers: 'not an array of integers',
				an_array_of_numbers: 'not an array of numbers',
				an_array_of_floats: 'not an array of floats',
				an_array_of_decimals: 'not an array of decimals',
				an_array_of_dates: 'not an array of dates'
			}

			var instance = model.build(data)

			instance.validate().complete(function(errors) {

				expect(errors).to.not.equal(null)

				// There should be an error for each field.
				for (var field in data)
					expect(errors[field]).to.not.equal(undefined)

				done()

			})

		})

		it('should pass validation when all data matches its field\'s data type', function(done) {

			var model = sequel.define('ModelDataTypeValidationTest', {

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
				an_array_of_dates: 'array-date'

			}, {

				tableName: 'test_table_3'

			})

			var data = {
				an_integer: 2,
				a_number: 200.12,
				a_float: 0.012,
				a_decimal: 0.02,
				a_date: new Date(),
				an_array_of_integers: [1, 2, 3],
				an_array_of_numbers: [1, 0.02, 3.001],
				an_array_of_floats: [12.01, 10.0, 15],
				an_array_of_decimals: [0.02, 0.002, 0.002],
				an_array_of_dates: [new Date(), new Date()]
			}

			var instance = model.build(data)

			instance.validate().complete(function(errors) {

				expect(errors).to.equal(null)

				done()

			})

		})

		it('should return custom error message if set', function(done) {

			var errorMessage = 'Name cannot be empty'

			var model = sequel.define('ModelValidationCustomErrorMsgTest', {

				id: {
					type: 'integer',
					autoIncrement: true,
					primaryKey: true
				},
				name: {
					type: 'text',
					validate: {
						notEmpty: {
							msg: errorMessage
						}
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

				tableName: 'test_table_1'

			})

			var data = {}

			data.name = ''
			data.value1 = 25
			data.value2 = 4000

			model.create(data).complete(function(errors, instance) {

				expect(errors).to.not.equal(null)
				expect(errors).to.be.an('object')
				expect(errors.name).to.deep.equal([errorMessage])
				expect(instance).to.equal(null)

				done()

			})

		})

		it('should return a newly created instance, when validation is skipped, even if given data that would normally fail validation', function(done) {

			var model = sequel.define('ModelValidationSkippedTest', {

				id: {
					type: 'integer',
					autoIncrement: true,
					primaryKey: true
				},
				name: {
					type: 'text',
					validate: {
						notNull: true
					}
				},
				value1: {
					type: 'integer',
					validate: {
						notNull: true,
						min: 5
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

				tableName: 'test_table_1'

			})

			var data = {}

			data.name = 'hi there!'
			data.value1 = 3// Would cause failure, if we didn't skip validation.
			data.value2 = 3000

			model.create(data, {validate: false}).complete(function(errors, instance) {

				expect(errors).to.equal(null)
				expect(instance).to.not.equal(null)
				expect(instance).to.be.an('object')
				expect(instance.get('name')).to.equal(data.name)
				expect(instance.get('value1')).to.equal(data.value1)
				expect(instance.get('value2')).to.equal(data.value2)

				done()

			})

		})

		describe('field-level custom validation methods', function() {

			it('should be called with the instance context and the following arguments: \'value\', \'next\'', function(done) {

				var called = false

				var data = {}

				data.name = 'some test'
				data.value1 = 25
				data.value2 = 4500

				var model = sequel.define('ModelFieldLevelCustomValidationTest', {

					id: {
						type: 'integer',
						autoIncrement: true,
						primaryKey: true
					},
					name: {
						type: 'text',
						validate: {
							notEmpty: true,
							customFieldLevelValidationMethod: function(value, next) {

								expect(this).to.not.equal(undefined)
								expect(this instanceof Instance).to.equal(true)
								expect(value).to.equal(data.name)
								expect(next).to.be.a('function')

								called = true

								next()

							}
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

					tableName: 'test_table_1'

				})

				model.create(data).complete(function(errors, instance) {

					expect(called).to.equal(true)

					done()

				})

			})

			it('an error passed to the \'next\' callback method should cause validation to fail, and the error message should be returned as part of the \'errors\' object', function(done) {

				var errorMessage = 'An error occurred!'

				var data = {}

				data.name = 'some test'
				data.value1 = 25
				data.value2 = 4500

				var model = sequel.define('ModelFieldLevelCustomValidationErrorTest', {

					id: {
						type: 'integer',
						autoIncrement: true,
						primaryKey: true
					},
					name: {
						type: 'text',
						validate: {
							notEmpty: true,
							customFieldLevelValidationMethod: function(value, next) {

								next(errorMessage)

							}
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

					tableName: 'test_table_1'

				})

				model.create(data).complete(function(errors, instance) {

					expect(errors).to.not.equal(null)
					expect(errors.name).to.deep.equal([errorMessage])
					expect(instance).to.equal(null)

					done()

				})

			})

		})

		describe('instance-level custom validation methods', function() {

			it('should be called with the instance context and the following argument: \'next\'', function(done) {

				var called = false

				var data = {}

				data.name = 'some test'
				data.value1 = 25
				data.value2 = 4500

				var model = sequel.define('ModelInstanceLevelCustomValidationTest', {

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

					validate: {
						customInstanceLevelValidationMethod: function(next) {

							expect(this).to.not.equal(undefined)
							expect(this instanceof Instance).to.equal(true)
							expect(next).to.be.a('function')

							called = true

							next()

						}
					}

				})

				model.create(data).complete(function(errors, instance) {

					expect(called).to.equal(true)

					done()

				})

			})

			it('an error passed to the \'next\' callback method should cause validation to fail, and the error message should be returned as part of the \'errors\' object', function(done) {

				var errorMessage = 'An error occurred!'

				var data = {}

				data.name = 'some test'
				data.value1 = 25
				data.value2 = 4500

				var model = sequel.define('ModelInstanceLevelCustomValidationErrorTest', {

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

					validate: {
						customInstanceLevelValidationMethod: function(next) {

							next(errorMessage)

						}
					}

				})

				model.create(data).complete(function(errors, instance) {

					expect(errors).to.not.equal(null)
					expect(errors.customInstanceLevelValidationMethod).to.deep.equal([errorMessage])
					expect(instance).to.equal(null)

					done()

				})

			})

		})

	})

	describe('update(data, options)', function() {

		it('should return errors when given data that will fail validation', function(done) {

			var model = sequel.define('ModelUpdateFailedValidationTest', {

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
						notNull: true,
						max: 500
					}
				},
				value2: {
					type: 'integer',
					validate: {
						notNull: true,
						max: 5000
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

				tableName: 'test_table_1'

			})

			// Find any instance.
			model.find().complete(function(error, instance) {

				var id = instance.get('id')

				var data = {}, options = {}

				data.name = ''
				data.value1 = 501
				data.value2 = 5001

				options.where = {}
				options.where.id = id

				model.update(data, options).complete(function(errors) {

					expect(errors).to.not.equal(null)
					expect(errors).to.be.an('object')

					done()

				})

			})

		})

	})

})

})(drivers[i].sequel, drivers[i].TestManager)