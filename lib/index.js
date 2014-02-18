var Connection = require('./connection')
var Model = require('./model')
var Transaction = require('./transaction')

var _ = require('underscore')

var DbModeler = function(options) {

	this.options = options || {}

	this.initialize()

}

_.extend(DbModeler.prototype, {

	initialize: function() {

		this.connection = new Connection(this.options)

	},

	define: function(fields, options) {

		options || (options = {})

		return new Model(fields, options, this.connection)

	},

	transaction: function() {

		return new Transaction(this.connection)

	}

})

module.exports = DbModeler