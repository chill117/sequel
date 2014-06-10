var Db = require('./db')
var Lang = require('./lang')
var Model = require('./model')
var Transaction = require('./transaction')
var Validation = require('./validation')

var _ = require('underscore')

var Sequel = function(options, connection) {

	this.models = {}
	this.options = options || {}
	this.connection = connection || null

	this.initialize()

}

_.extend(Sequel.prototype, {

	initialize: function() {

		this.lang = new Lang(this.options)
		this.validation = new Validation(this.options, this)
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

	transaction: function(options) {

		return new Transaction(options, this.db, this)

	},

	clearModels: function() {

		this.models = {}

	}

})

module.exports = Sequel