var _ = require('underscore')
var BigNumber = require('bignumber.js')
var expect = require('chai').expect

module.exports = {

	expectDataToMatch: function(data1, data2, model) {

		for (var name in data1)
		{
			var field = model.fields[name]
			var dataType = field.getDataType()

			if (!field.isArray())
			{
				data1 = [data1]
				data2 = [data2]
			}

			for (var i in data1[name])
			{
				var value2 = data2[name][i]
				var value1 = data1[name][i]

				switch (dataType)
				{
					case 'decimal':

						value2 = BigNumber( value2.toString() )

						expect( value2.equals(value1.toString()) ).to.equal(true)

					break

					case 'date':

						value2 = new Date(value2).toString()
						value1 = new Date(value1).toString()

						expect( value2 ).to.equal( value1 )

					break

					default:

						expect( value2 ).to.equal( value1 )

					break
				}
			}
		}

	}

}