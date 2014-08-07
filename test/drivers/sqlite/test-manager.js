var sequel = require('./sequel')
var Db = sequel.db

var fs = require('fs')

module.exports = {

	setUp: function(done) {

		var queries = fs.readFileSync(__dirname + '/set-up.sql', 'utf-8')

		Db.database.exec(queries, function(error) {

			if (error)
				return done(new Error(error))

			done()

		})

	},

	tearDown: function(done) {

		// Reset the models object..
		sequel.models = {}

		var queries = fs.readFileSync(__dirname + '/tear-down.sql', 'utf-8')

		Db.database.exec(queries, function(error) {

			if (error)
				return done(new Error(error))

			done()

		})

	}

}