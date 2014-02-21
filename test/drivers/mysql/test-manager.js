var sequel = require('./sequel')
var Db = sequel.db

var async = require('async')
var fs = require('fs')

module.exports = {

	setUp: function(done) {

		var queries = fs.readFileSync(__dirname + '/set-up.sql', 'utf-8')

		async.each(queries.split(';'), function(sql, nextQuery) {

			Db.query(sql, nextQuery)

		}, function(error) {

			if (error)
				return done(new Error(error))

			done()

		})

	},

	tearDown: function(done) {

		var queries = fs.readFileSync(__dirname + '/tear-down.sql', 'utf-8')

		async.each(queries.split(';'), function(sql, nextQuery) {

			Db.query(sql, nextQuery)

		}, function(error) {

			if (error)
				return done(new Error(error))

			done()

		})

	}

}