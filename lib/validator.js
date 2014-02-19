var _ = require('underscore')
var validator = require('validator')

validator.extend('notEmpty', function(str) {
	return !str.match(/^[\s\t\r\n]*$/)
})

validator.extend('notNull', function(str) {
	return !validator.isNull(str)
})

validator.extend('notIn', function(str, values) {
	return !validator.isIn(str, values)
})

validator.extend('isDecimal', function(str) {
	return str.match(/^(?:-?(?:0|[1-9][0-9]*))?(?:\.[0-9]*)?$/)
})

validator.extend('isNumber', function(str) {
	return !isNaN(parseFloat(str))
})

validator.extend('min', function(str, value) {
	var number = parseFloat(str)
	return !isNaN(number) && number >= value
})

validator.extend('max', function(str, value) {
	var number = parseFloat(str)
	return !isNaN(number) && number <= value
})

validator.extend('minLen', function(str, min) {
	return !min || str.length >= min
})

validator.extend('maxLen', function(str, max) {
	return !max || str.length <= max
})

validator.extend('precision', function(str, max) {

	var number = parseFloat(str)

	if (isNaN(number))
		return false

	var precision = Math.max(str.split('').reverse().join('').indexOf('.'), 0)

	return precision <= max
})

var messages = require('./lang/en/messages')

var Validator = {

	getError: function(fn, args) {

		var message = messages[fn] || ''

		if (message.indexOf('%s') != -1 && typeof args != 'undefined')
		{
			if (typeof args == 'object')
			{
				if (typeof args[0] == 'number')
					args = args.join(', ')
				else
					args = '\'' + args.join('\', \'') + '\''
			}

			message = message.replace('%s', args)
		}

		return message

	},

	test: function(fn, args) {

		if (!this.testExists(fn))
			return false

		return validator[fn].apply(undefined, args)

	},

	testExists: function(fn) {

		return typeof validator[fn] == 'function'

	}

}

module.exports = Validator