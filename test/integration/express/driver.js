var drivers = require('../../drivers')

for (var i in drivers)
{
	module.exports = drivers[i]
	break
}