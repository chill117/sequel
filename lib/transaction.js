var _ = require('underscore')
var Promise = require('pseudo-promise')

var Transaction = function(db) {

	this.db = db

}

_.extend(Transaction.prototype, {

	started: false,
	ended: false,

	start: function() {

		var promise = new Promise()

		if (this.started)
			return promise.reject('This transaction has already been started')

		this.started = true

		this.db.startTransaction(function(error) {

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

		this.db.rollbackTransaction(function(error) {

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

		this.db.commitTransaction(function(error) {

			if (error)
				return promise.reject(error)

			promise.resolve()

		})

		return promise
		
	}

})

module.exports = Transaction