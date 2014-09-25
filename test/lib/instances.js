var _ = require('underscore')

var Instances = function(instances) {

	this.instances = []
	this.instances = _.clone(instances)

}

_.extend(Instances.prototype, {

	invertedFilter: function(where) {

		var filtered = []

		for (var i in this.instances)
			if (!instancePassesFilter(this.instances[i], where))
				filtered.push(this.instances[i])

		this.instances = filtered

	},

	filter: function(where) {

		var filtered = []

		for (var i in this.instances)
			if (instancePassesFilter(this.instances[i], where))
				filtered.push(this.instances[i])

		this.instances = filtered

	},

	orderBy: function(order) {

		var sorted = []
		var sorted = _.clone(this.instances)

		var sorts = order.split(',')

		for (var i in sorts)
		{
			var sort = trim( sorts[i] ).split(' ')

			var field = sort[0]
			var direction = sort[1] || 'ASC'

			sorted.sort(function(instance1, instance2) {

				if (direction == 'ASC')
					return instance1.get(field) - instance2.get(field)

				return instance2.get(field) - instance1.get(field)

			})
		}

		this.instances = sorted

	}

})

function trim(str) {

	return str.replace(/^\s+|\s+$/g, '')

}

function instancePassesFilter(instance, filter) {

	for (var fieldName in filter)
	{
		var field = instance.getField(fieldName)
		var dataType = field.getDataType()
		var filterValue = _.clone(filter[fieldName])
		var instanceValue = instance.get(fieldName)

		if (dataType == 'date')
			instanceValue = new Date(instanceValue).getTime()

		if (_.isArray(filterValue))
		{
			if (dataType == 'date')
				for (var i in filterValue)
					filterValue[i] = new Date(filterValue[i]).getTime()

			if (_.indexOf(filterValue, instanceValue) == -1)
				return false
		}
		else if (
			filterValue !== null &&
			typeof filterValue == 'object' &&
			filterValue.toString() == '[object Object]'
		)
		{
			for (var operator in filterValue)
			{
				if (dataType == 'date')
					filterValue[operator] = new Date(filterValue[operator]).getTime()

				if (operator == 'gt')
				{
					if (!(instanceValue > filterValue[operator]))
						return false
				}
				else if (operator == 'gte')
				{
					if (!(instanceValue >= filterValue[operator]))
						return false
				}
				else if (operator == 'lt')
				{
					if (!(instanceValue < filterValue[operator]))
						return false
				}
				else if (operator == 'lte')
				{
					if (!(instanceValue <= filterValue[operator]))
						return false
				}
				else if (operator == 'ne')
				{
					if (!(instanceValue != filterValue[operator]))
						return false
				}
			}
		}
		else
		{
			if (dataType == 'date')
				filterValue = new Date(filterValue).getTime()

			if (instanceValue != filterValue)
				return false
		}

		continue
	}

	return true

}

module.exports = Instances