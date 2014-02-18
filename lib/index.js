var Connection = require('./connection')
var Model = require('./model')
var Transaction = require('./transaction')

var _ = require('underscore')

var DbModeler = function(options) {

	this.models = {}
	this.options = options || {}

	this.initialize()

}

_.extend(DbModeler.prototype, {

	initialize: function() {

		this.connection = new Connection(this.options)

	},

	getModel: function(name) {

		return this.models[name] || null

	},

	define: function(name, fields, options) {

		options || (options = {})

		this.models[name] = new Model(fields, options, this)

		return this.models[name]

	},

	transaction: function() {

		return new Transaction(this.connection)

	}

})

module.exports = DbModeler