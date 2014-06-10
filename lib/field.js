var _ = require('underscore')
var async = require('async')
var BigNumber = require('bignumber.js')

var ValidDataTypes = ['string', 'text', 'integer', 'number', 'float', 'decimal', 'date']

var sequel, Validation

var Field = function(name, options) {

	options || (options = {})

	if (typeof options == 'string')
		options = {type: options}

	this.name = name
	this.options = options

	sequel = _.last(arguments)
	Validation = sequel.validation

}

_.extend(Field.prototype, {

	validate: function(value, instance, cb) {

		var methods = this.options.validate || {}
		var errors = []

		if (value !== null)
		{
			if (this.isArray())
			{
				if (!_.isArray(value))
					errors.push('Array expected')
				else
				{
					failedDataType:
					for (var i in value)
						if (!this.valueMatchesDataType(value[i]))
						{
							errors.push('One or more values in array do not match data type')
							break failedDataType
						}
				}
			}
			else if (!this.valueMatchesDataType(value))
				errors.push('Does not match data type')

		}

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

			if (!Validation.test(name, value, args))
			{
				var error = msg || Validation.getError(name, args)

				errors.push(error)
			}

			next()

		}, function() {

			cb(errors)

		})

	},

	valueMatchesDataType: function(value) {

		switch (this.getDataType())
		{
			case 'string':
			case 'text':
				return typeof value == 'string'

			case 'integer':
				return !isNaN(parseInt(value))

			case 'number':
			case 'float':
				return !isNaN(parseFloat(value))

			case 'date':
				return value instanceof Date && value.toString() != 'Invalid Date'

			case 'decimal':
				return value instanceof BigNumber
		}

		return false

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

		if (!this.hasDefaultValue())
			return null

		var type = this.getType()
		var defaultValue = this.options.defaultValue

		switch (type)
		{
			case 'decimal':
				return BigNumber(defaultValue)

			case 'array-decimal':

				if (!_.isArray(defaultValue))
					throw new Error('Invalid default value for field \'' + this.getName() + '\'. Expected an array.')

				for (var i in defaultValue)
					defaultValue[i] = BigNumber(defaultValue[i])

				return defaultValue

			break

			default:
				return defaultValue
		}

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