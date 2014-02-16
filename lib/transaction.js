var Promise = require('./promise')

var _ = require('underscore')

var Transaction = function(connection) {

	this.connection = connection

}

_.extend(Transaction.prototype, {

	started: false,
	ended: false,

	start: function() {

		var promise = new Promise()

		if (this.started)
			return promise.reject('This transaction has already been started')

		this.started = true

		this.connection.beginTransaction(function(error) {

			if (error)
				return promise.reject(error)

			promise.resolve()

		})

		return promise

	},

	rollback: function() {

		var promise = new Promise()

		if (this.ended)
			return promise.reject('This transaction has already been ended')

		this.ended = true

		this.connection.rollback(function(error) {

			if (error)
				return promise.reject(error)

			promise.resolve()

		})

		return promise

	},

	commit: function() {

		var promise = new Promise()

		if (this.ended)
			return promise.reject('This transaction has already been ended')

		this.ended = true

		this.connection.commit(function(error) {

			if (error)
				return promise.reject(error)

			promise.resolve()

		})

		return promise
		
	}

})

module.exports = Transaction