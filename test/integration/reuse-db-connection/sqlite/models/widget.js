var sequel = require('../sequel')

var Widget = sequel.define('Widget', {

	id: {
		type: 'integer',
		autoIncrement: true,
		primaryKey: true
	},

	name: {
		type: 'text',
		uniqueKey: true,
		validate: {
			notEmpty: true,
			maxLen: 100
		}
	},

	description: {
		type: 'text',
		validate: {
			maxLen: 1000
		}
	}

}, {

	tableName: 'widgets'

})

module.exports = Widget