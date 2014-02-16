var modeler = require('../../modeler')

var chai = require('chai')
var expect = chai.expect


describe('Model#timestamps', function() {

	it('timestamp fields should be included in the fields list by default', function() {

		var model = modeler.define({

			id: {
				type: 'integer',
				primaryKey: true
			},
			value5: 'text',
			value6: 'text'

		}, {

			tableName: 'does_not_exist'

		})

		expect(model.fields.created_at).to.not.equal(undefined)
		expect(model.fields.updated_at).to.not.equal(undefined)

	})

	it('timestamp fields should not be included in the fields list when the \'timestamps\' option is set to false', function() {

		var model = modeler.define({

			id: {
				type: 'integer',
				primaryKey: true
			},
			value5: 'text',
			value6: 'text'

		}, {

			tableName: 'does_not_exist',
			timestamps: false

		})

		expect(model.fields.created_at).to.equal(undefined)
		expect(model.fields.updated_at).to.equal(undefined)

	})

})