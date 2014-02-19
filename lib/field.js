var Validator = require('./validator')

var _ = require('underscore')
var async = require('async')

var ValidDataTypes = ['string', 'text', 'integer', 'float', 'decimal', 'number', 'date']

var Field = function(name, options) {

	options || (options = {})

	if (typeof options == 'string')
		options = {type: options}

	this.name = name
	this.options = options

	this.initialize()

}

_.extend(Field.prototype, {

	initialize: function() {

		this.prepareValidationRules()

	},

	validate: function(value, instance, cb) {

		var rules = this.validation || {}
		var errors = []

		async.each(rules, function(rule, next) {

			var fn = rule.fn

			switch (typeof fn)
			{
				case 'string':

					if (!Validator.testExists(fn))
					{
						errors.push('Validator function not found: \'' + fn + '\'')

						return next()
					}

					var args = rule.args || []

					if (!Validator.test(fn, [value].concat(args)))
					{
						var error = rule.msg || Validator.getError(fn, args[0])

						errors.push(error)
					}

					next()

				break

				case 'function':

					fn.call(instance, value, function(error) {

						if (error)
							errors.push(error)

						next()

					})

				break

				default:

					errors.push('Malformed validation rule')

					next()

				break
			}

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

	prepareValidationRules: function() {

		var methods = this.options.validate || {}
		var rules = []

		var self = this

		async.each(_.keys(methods), function(name, next) {

			var rule = {}

			switch (typeof methods[name])
			{
				case 'function':

					rule.fn = methods[name]

				break

				case 'boolean':

					rule.fn = name

				break

				case 'object':

					rule.fn = name

					if (_.isArray(methods[name]))
					{
						if (typeof methods[name][0] == 'object')
							rule.args = methods[name]
						else
							rule.args = [methods[name]]
					}
					else if (methods[name] instanceof RegExp)
					{
						rule.args = [methods[name]]
					}
					else
					{
						rule.args = methods[name].args || []
						rule.msg = methods[name].msg || ''
					}

				break

				default:

					rule.fn = name
					rule.args = [methods[name]]

				break
			}

			rules.push(rule)

			next()

		}, function() {

			self.validation = rules

		})

	},

	getName: function() {

		return this.name

	}

})

module.exports = Field