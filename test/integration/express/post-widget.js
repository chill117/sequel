var app = require('./app')
var TestManager = require('../../test-manager')

var http = require('http')

describe('POST /widget', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	describe('when attempting to create a widget with invalid data', function() {

		it('should return errors', function(done) {

			done(new Error('Finish writing this test'))

		})

	})

	describe('when attempting to create a widget with valid data', function() {

		it('should return the new widget', function(done) {

			done(new Error('Finish writing this test'))

		})

	})

})