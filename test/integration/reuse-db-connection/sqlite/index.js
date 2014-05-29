var TestManager = require('./test-manager')

var chai = require('chai')
var expect = chai.expect

describe('When re-using a SQLite database connection', function() {

	var Widget

	before(function() {

		Widget = require('./models/widget')

	})

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	it('should be able to save an instance of a model', function(done) {

		var data = {
			name: 'Some Widget',
			description: 'It\'s a widget..'
		}

		var instance = Widget.build(data)

		instance.save().complete(function(errors, result) {

			expect(errors).to.equal(null)
			expect(result).to.not.equal(null)
			expect(result.get('name')).to.equal(data.name)
			expect(result.get('description')).to.equal(data.description)

			done()

		})

	})

})