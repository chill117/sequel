var _ = require('underscore')
var BigNumber = require('bignumber.js')

module.exports = {

	trim: function(str) {

		return str.replace(/^\s+|\s+$/, '')

	},

	castToDataType: function(value, dataType) {

		switch (dataType)
		{
			case 'integer':
				return parseInt(value)

			case 'float':
			case 'number':
				return parseFloat(value)

			case 'date':

				if (_.isDate(value))
					return value

				return new Date(value)

			break

			case 'decimal':

				try {

					value = BigNumber(value.toString())

				} catch (error) {

					if (error)
						return NaN

				}

				return value

			break

			case 'string':
			case 'text':
			default:
				return value.toString()
		}

	}

}