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

function instancePassesFilter(instance, where) {

	for (var field in where)
	{
		var value = where[field]

		if (_.isArray(value))
		{
			if (_.indexOf(value, instance.get(field)) == -1)
				return false

			continue
		}
		else if (typeof value == 'object')
		{
			for (var operator in value)
			{
				switch (operator)
				{
					case 'gt':
						if (!(instance.get(field) > value[operator]))
							return false
					break

					case 'gte':
						if (!(instance.get(field) >= value[operator]))
							return false
					break

					case 'lt':
						if (!(instance.get(field) < value[operator]))
							return false
					break

					case 'lte':
						if (!(instance.get(field) <= value[operator]))
							return false
					break

					case 'ne':
						if (!(instance.get(field) != value[operator]))
							return false
					break
				}
			}

			continue
		}

		if (instance.get(field) != value)
			return false

		continue
	}

	return true

}

module.exports = Instances