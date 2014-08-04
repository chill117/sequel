var _ = require('underscore')
var BigNumber = require('bignumber.js')
var expect = require('chai').expect

module.exports = {

	expectDataToMatch: function(data1, data2, model) {

		for (var name in data1)
		{
			var field = model.fields[name]

			switch (field.getType())
			{
				case 'decimal':
					expect( data2[name].equals( BigNumber(data1[name]) ) ).to.equal(true)
				break

				case 'array-decimal':
					for (var i in data1[name])
						expect( data2[name][i].equals( BigNumber(data1[name][i]) ) ).to.equal(true)
				break

				case 'date':
					expect( data2[name].toString() ).to.equal( data1[name].toString() )
				break

				case 'array-date':
					for (var i in data1[name])
						expect( data2[name][i].toString() ).to.equal( data1[name][i].toString() )
				break

				default:
					if (_.isArray(data1[name]))
						for (var i in data1[name])
							expect( data2[name][i] ).to.equal( data1[name][i] )
					else
						expect( data2[name] ).to.equal( data1[name] )
				break
			}
		}

	}

}