var chai = require('chai')
var expect = chai.expect

var drivers = require('../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Instance#uniqueKeys', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	describe('when attempting to save an existing instance with values that do not match any other instances for any unique keys', function() {

		it('should not return an error', function(done) {

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
			data.value3 = 'some other value'
			data.value4 = 'this one can be anything'

			model.create(data).complete(function(errors, instance) {

				expect(errors).to.equal(null)
				expect(instance).to.not.equal(null)

				instance.save().complete(function(errors) {

					expect(errors).to.equal(null)

					done()

				})

			})

		})

	})

})

})(drivers[i].sequel, drivers[i].TestManager)