var app = require('./app')
var TestManager = require('../../drivers/mysql').TestManager

var _ = require('underscore')
var http = require('http')
var querystring = require('querystring')

describe('POST /widget', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	describe('when attempting to create a widget with invalid data', function() {

		it('should return errors', function(done) {

			var data = {}

			data.name = ''// Leave this blank to cause a validation error.
			data.description = 'A description!'

			var postData = querystring.stringify(data)

			var headers = {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': postData.length
			}

			var options = {
				hostname: app.get('host'),
				port: app.get('port'),
				path: '/widget',
				method: 'POST',
				headers: headers
			}

			var req = http.request(options, function(res) {

				if (res.statusCode != 400)
					return done(new Error('Expected HTTP status code 400'))

				res.setEncoding('utf8')

				res.once('data', function(responseData) {

					var responseData = JSON.parse(responseData)

					if (typeof responseData != 'object')
						return done(new Error('Expected response data to be an object'))

					if (
						!_.isArray(responseData['name']) ||
						!(responseData['name'].length > 0)
					)
						return done(new Error('Expected errors for the \'name\' field'))

					res.destroy()

					done()

				})

			})

			req.once('error', function(e) {

				done(new Error('Problem with request: ' + e.message))

			})

			req.write(postData)
			req.end()

		})

	})

	describe('when attempting to create a widget with valid data', function() {

		it('should return the new widget', function(done) {

			var data = {}

			data.name = 'A New Widget'
			data.description = 'This one should work'

			var postData = querystring.stringify(data)

			var headers = {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': postData.length
			}

			var options = {
				hostname: app.get('host'),
				port: app.get('port'),
				path: '/widget',
				method: 'POST',
				headers: headers
			}

			var req = http.request(options, function(res) {

				if (res.statusCode != 200)
					return done(new Error('Expected HTTP status code 200'))

				res.setEncoding('utf8')

				res.once('data', function(responseData) {

					var responseData = JSON.parse(responseData)

					if (typeof responseData != 'object')
						return done(new Error('Expected response data to be an object'))

					if (responseData.name != data.name)
						return done(new Error('Incorrect widget data'))

					if (responseData.description != data.description)
						return done(new Error('Incorrect widget data'))

					res.destroy()

					done()

				})

			})

			req.once('error', function(e) {

				done(new Error('Problem with request: ' + e.message))

			})

			req.write(postData)
			req.end()

		})

	})

})