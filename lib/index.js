var Db = require('./db')
var Model = require('./model')
var Transaction = require('./transaction')

var _ = require('underscore')

var Sequel = function(options, connection) {

	this.models = {}
	this.options = options || {}
	this.connection = connection || null

	this.initialize()

}

_.extend(Sequel.prototype, {

	initialize: function() {

		this.db = new Db(this.options, this.connection)

	},

	getModel: function(name) {

		return this.models[name] || null

	},

	define: function(name, fields, options) {

		options || (options = {})

		this.models[name] = new Model(name, fields, options, this)

		return this.models[name]

	},

	transaction: function() {

		return new Transaction(this.db)

	},

	clearModels: function() {

		this.models = {}

	}

})

module.exports = Sequel