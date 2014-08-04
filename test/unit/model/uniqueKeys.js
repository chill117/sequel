var expect = require('chai').expect


describe('Model#uniqueKeys', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	describe('when attempting to create a new instance with a value that matches an existing instance for a field that has been marked as a \'uniqueKey\'', function() {

		it('should return an error', function(done) {

			var model = sequel.define('TableOne', {

				id: {
					type: 'integer',
					autoIncrement: true,
					primaryKey: true
				},
				name: {
					type: 'text',
					uniqueKey: true,
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

			data.name = 'a unique name'
			data.value1 = 41
			data.value2 = 3000

			model.create(data).complete(function(errors, instance) {

				expect(errors).to.equal(null)
				expect(instance).to.not.equal(null)

				var data2 = {}

				data2.name = data.name// Use the same name.
				data2.value1 = 56
				data2.value2 = 2020

				model.create(data2).complete(function(errors, result) {

					expect(errors).to.not.equal(null)
					expect(errors.name).to.not.equal(undefined)
					expect(errors.name).to.be.an('array')
					expect(errors.name.length).to.equal(1)
					expect(result).to.equal(null)

					done()

				})

			})

		})

		it('should return a custom error message if one is set', function(done) {

			var customErrorMessage = 'The name you entered is already in use'

			var model = sequel.define('TableOne', {

				id: {
					type: 'integer',
					autoIncrement: true,
					primaryKey: true
				},
				name: {
					type: 'text',
					uniqueKey: {
						msg: customErrorMessage
					},
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

			data.name = 'a different unique name'
			data.value1 = 41
			data.value2 = 3000

			model.create(data).complete(function(errors, instance) {

				expect(errors).to.equal(null)
				expect(instance).to.not.equal(null)

				var data2 = {}

				data2.name = data.name// Use the same name.
				data2.value1 = 56
				data2.value2 = 2020

				model.create(data2).complete(function(errors, result) {

					expect(errors).to.not.equal(null)
					expect(errors.name).to.deep.equal([customErrorMessage])
					expect(result).to.equal(null)

					done()

				})

			})

		})

	})

	
	describe('when attempting to create a new instance with values that match an existing instance for a \'uniqueKey\'', function() {

		it('should return an error', function(done) {

			var model = sequel.define('TableTwo', {

				id: {
					type: 'integer',
					autoIncrement: true,
					primaryKey: true
				},
				ref_id: {
					type: 'integer',
					validate: {
						notNull: true
					}
				},
				value3: 'text',
				value4: 'text'

			}, {

				tableName: 'test_table_2',

				uniqueKeys: [
					['ref_id', 'value3']
				]

			})

			var data = {}

			data.ref_id = 1
			data.value3 = 'a unique value paired with ref ID 1'
			data.value4 = 'this one can be anything'

			model.create(data).complete(function(errors, instance) {

				expect(errors).to.equal(null)
				expect(instance).to.not.equal(null)

				var data2 = {}

				// Use the same 'ref_id' and 'value3'
				data2.ref_id = data.ref_id
				data2.value3 = data.value3
				data2.value4 = 'some text'

				model.create(data2).complete(function(errors, result) {

					expect(errors).to.not.equal(null)
					expect(errors.ref_id_value3).to.not.equal(undefined)
					expect(errors.ref_id_value3).to.be.an('array')
					expect(errors.ref_id_value3.length).to.equal(1)
					expect(result).to.equal(null)

					done()

				})

			})

		})

		it('should return a custom error message if one is set', function(done) {

			var customErrorMessage = 'That value3 and reference ID combination is already in use'

			var model = sequel.define('TableTwo', {

				id: {
					type: 'integer',
					autoIncrement: true,
					primaryKey: true
				},
				ref_id: {
					type: 'integer',
					validate: {
						notNull: true
					}
				},
				value3: 'text',
				value4: 'text'

			}, {

				tableName: 'test_table_2',

				uniqueKeys: [
					{
						fields: ['ref_id', 'value3'],
						msg: customErrorMessage
					}
				]

			})

			var data = {}

			data.ref_id = 1
			data.value3 = 'some value'
			data.value4 = 'this one can be anything'

			model.create(data).complete(function(errors, instance) {

				expect(errors).to.equal(null)
				expect(instance).to.not.equal(null)

				var data2 = {}

				// Use the same 'ref_id' and 'value3'
				data2.ref_id = data.ref_id
				data2.value3 = data.value3
				data2.value4 = 'some text'

				model.create(data2).complete(function(errors, result) {

					expect(errors).to.not.equal(null)
					expect(errors.ref_id_value3).to.not.equal(undefined)
					expect(errors.ref_id_value3).to.deep.equal([customErrorMessage])
					expect(result).to.equal(null)

					done()

				})

			})

		})

		it('should add the uniqueKey-related errors to the errors object under the unique key\'s name, when one is specified', function(done) {

			var keyName = 'custom_key_name'

			var model = sequel.define('TableTwo', {

				id: {
					type: 'integer',
					autoIncrement: true,
					primaryKey: true
				},
				ref_id: {
					type: 'integer',
					validate: {
						notNull: true
					}
				},
				value3: 'text',
				value4: 'text'

			}, {

				tableName: 'test_table_2',

				uniqueKeys: [
					{
						name: keyName,
						fields: ['ref_id', 'value3']
					}
				]

			})

			var data = {}

			data.ref_id = 1
			data.value3 = 'some other value'
			data.value4 = 'this one can be anything'

			model.create(data).complete(function(errors, instance) {

				expect(errors).to.equal(null)
				expect(instance).to.not.equal(null)

				var data2 = {}

				// Use the same 'ref_id' and 'value3'
				data2.ref_id = data.ref_id
				data2.value3 = data.value3
				data2.value4 = 'some text'

				model.create(data2).complete(function(errors, result) {

					expect(errors).to.not.equal(null)
					expect(errors[keyName]).to.not.equal(undefined)
					expect(errors[keyName]).to.be.an('array')
					expect(errors[keyName].length).to.equal(1)
					expect(result).to.equal(null)

					done()

				})

			})

		})

	})

})

