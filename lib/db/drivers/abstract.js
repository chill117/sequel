var RequiredMethods = [
	'query',
	'create', 'find', 'update', 'destroy',
	'startTransaction', 'commitTransaction', 'rollbackTransaction',
	'escape', 'escapeId'
]

var Abstract = module.exports = function() {

}

for (var i in RequiredMethods)
	(function(methodName) {

		Abstract.prototype[methodName] = function() {

			throw new Error('Your database driver is missing the ' + methodName + '() method')

		}

	})(RequiredMethods[i])