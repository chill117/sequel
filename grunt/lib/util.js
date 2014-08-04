var fs = require('fs')

module.exports = {

	getListOfDrivers: function() {

		var drivers = []

		var driversDir = process.cwd() + '/lib/db/drivers'
		var files = fs.readdirSync(driversDir)

		for (var i in files)
		{
			var file = files[i]
			var stat = fs.statSync(driversDir + '/' + file)

			if (stat && stat.isDirectory())
				drivers.push( file )
		}

		return drivers

	}

}