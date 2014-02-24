var app = require('./app')
var TestManager = require('./test-manager')

var http = require('http')

describe('GET /widget/:id', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	describe('when trying to get a widget that does not exist', function() {

		it('should return a 404 Not Found error', function(done) {

			var req = http.get({

				hostname: app.get('host'),
				port: app.get('port'),
				path: '/widget/44'

			}, function(res) {

				if (res.statusCode != 404)
					return done(new Error('Expected HTTP status code 404'))

				done()

			})

			req.once('error', function(e) {

				done(new Error('Problem with request: ' + e.message))

			})

		})

	})

	describe('when trying to get a widget that exists', function() {

		var fixture = {
			name: 'Some Widget',
			description: 'a description of a widget'
		}

		var widget

		before(function(done) {

			var Widget = require('./models/widget')

			Widget.create(fixture).complete(function(errors, result) {

				if (errors)
				{
					console.log(errors)

					return done(new Error('An unexpected error has occurred'))
				}

				widget = result

				done()

			})

		})

		it('should return the widget data', function(done) {

			var req = http.get({

				hostname: app.get('host'),
				port: app.get('port'),
				path: '/widget/' + widget.get('id')

			}, function(res) {

				if (res.statusCode != 200)
					return done(new Error('Expected HTTP status code 200'))

				res.setEncoding('utf8')

				res.once('data', function(responseData) {

					var responseData = JSON.parse(responseData)

					if (typeof responseData != 'object')
						return done(new Error('Expected response data to be an object'))

					if (responseData.name != widget.get('name'))
						return done(new Error('Incorrect widget data'))

					if (responseData.description != widget.get('description'))
						return done(new Error('Incorrect widget data'))

					res.destroy()

					done()

				})

			})

			req.once('error', function(e) {

				done(new Error('Problem with request: ' + e.message))

			})

		})

	})

})