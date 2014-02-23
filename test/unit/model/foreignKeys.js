var chai = require('chai')
var expect = chai.expect

var drivers = require('../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Model#foreignKeys', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	var ParentModel, ChildModel

	before(function() {

		ParentModel = sequel.define('ModelOne', {

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
			}

		}, {

			tableName: 'test_table_1'

		})

		ChildModel = sequel.define('ModelTwo', {

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

			foreignKeys: {
				ref_id: {
					model: 'ModelOne',
					field: 'id'
				}
			}

		})

	})

	describe('when attempting to create a new instance, where a \'foreignKey\' field\'s parent row does not exist', function() {

		it('should return an error', function(done) {

			ChildModel.create({ref_id: 3}).complete(function(errors, instance) {

				expect(errors).to.not.equal(null)
				expect(errors.ref_id).to.not.equal(undefined)
				expect(errors.ref_id).to.be.an('array')
				expect(errors.ref_id).to.have.length(1)
				expect(instance).to.equal(null)

				done()

			})

		})

	})

	describe('when attempting to create a new instance, where a \'foreignKey\' field\'s parent row exists', function() {

		var parent_id

		before(function(done) {

			var data = {}

			data.name = 'the parent row'
			data.value1 = 25
			data.value2 = 300

			ParentModel.create(data).complete(function(errors, instance) {

				expect(errors).to.equal(null)
				expect(instance).to.not.equal(null)

				parent_id = instance.get('id')

				done()

			})

		})

		it('should succeed', function(done) {

			ChildModel.create({ref_id: parent_id}).complete(function(errors, instance) {

				expect(errors).to.equal(null)
				expect(instance).to.not.equal(null)

				done()

			})

		})

	})

})

})(drivers[i].sequel, drivers[i].TestManager)