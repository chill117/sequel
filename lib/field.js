var Validation = require('./validation')

var _ = require('underscore')
var async = require('async')

var ValidDataTypes = ['string', 'text', 'integer', 'float', 'decimal', 'number', 'date']

var Field = function(name, options) {

	options || (options = {})

	if (typeof options == 'string')
		options = {type: options}

	this.name = name
	this.options = options

}

_.extend(Field.prototype, {

	validate: function(value, instance, cb) {

		var methods = this.options.validate || {}
		var errors = []

		async.each(_.keys(methods), function(name, next) {

			if (typeof methods[name] == 'function')
				return methods[name].call(instance, value, function(error) {

					if (error)
						errors.push(error)

					next()

				})

			if (!Validation.testExists(name))
			{
				errors.push('Validation test not found: \'' + name + '\'')

				return next()
			}

			var args = [], msg = ''

			switch (typeof methods[name])
			{
				case 'object':

					if (
						_.isArray(methods[name]) ||
						methods[name] instanceof RegExp
					)
						args = methods[name]
					else
					{
						args = methods[name].args || []
						msg = methods[name].msg || ''
					}

				break

				case 'boolean':
				break

				default:
					args = methods[name]
				break
			}

			if (!Validation.test(name, [value].concat(args)))
			{
				var error = msg || Validation.getError(name, args)

				errors.push(error)
			}

			next()

		}, function() {

			cb(errors)

		})

	},

	isAutoIncrement: function() {

		return 	this.isPrimaryKey() &&
				typeof this.options.autoIncrement != 'undefined' &&
				this.options.autoIncrement !== false

	},

	isPrimaryKey: function() {

		return 	typeof this.options.primaryKey != 'undefined' &&
				this.options.primaryKey !== false

	},

	isUniqueKey: function() {

		return 	typeof this.options.uniqueKey != 'undefined' &&
				this.options.uniqueKey !== false

	},

	isReadOnly: function() {

		return 	typeof this.options.readOnly != 'undefined' &&
				this.options.readOnly !== false

	},

	getDefaultValue: function() {

		return this.options.defaultValue

	},

	hasDefaultValue: function() {

		return typeof this.options.defaultValue != 'undefined'

	},

	hasValidDataType: function() {

		var dataType = this.getDataType()

		for (var i in ValidDataTypes)
			if (dataType == ValidDataTypes[i])
				return true

		return false

	},

	isArray: function() {

		var type = this.getType()

		return type.substr(0, 'array-'.length) == 'array-'

	},

	getDataType: function() {

		var type = this.getType()

		if (this.isArray())
			return type.substr('array-'.length)

		return type

	},

	getType: function() {

		return this.options.type || null

	},

	getName: function() {

		return this.name

	}

})

module.exports = Field