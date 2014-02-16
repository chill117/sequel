var _ = require('underscore')
var EventEmitter = require('events').EventEmitter

var Promise = function() {

}

_.extend(Promise.prototype, EventEmitter.prototype, {

	resolved: false,
	rejected: false,

	cached_result: null,
	cached_error: null,

	resolve: function(result) {

		if (this.resolved || this.rejected)
			return this

		this.resolved = true
		this.cached_result = result

		this.emit('success', result)
		this.emit('complete', null, result)

		return this

	},

	reject: function(error) {

		if (this.resolved || this.rejected)
			return this

		this.rejected = true
		this.cached_error = error

		if (this.listeners('error') > 0)
			this.emit('error', error)

		this.emit('complete', error, null)

		return this

	},

	complete: function(fn) {

		this.on('complete', fn)

		if (this.resolved)
			fn(null, this.cached_result)
		else if (this.rejected)
			fn(this.cached_error, null)

		return this

	},

	error: function(fn) {

		this.on('error', fn)

		if (this.rejected)
			fn(this.cached_error)

		return this

	},

	success: function(fn) {

		this.on('success', fn)

		if (this.resolved)
			fn(this.cached_result)

		return this

	}

})

Promise.prototype.done = Promise.prototype.complete

module.exports = Promise