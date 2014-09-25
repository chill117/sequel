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

				if (value instanceof Date)
					return value

				return new Date(value.toString())

			break

			case 'decimal':

				if (isNaN(parseFloat(value.toString())))
					return NaN

				return BigNumber(value.toString())

			break

			case 'string':
			case 'text':
			default:
				return value.toString()
		}

	}

}