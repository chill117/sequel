var Field = require('./field')
var Instance = require('./instance')

var _ = require('underscore')
var async = require('async')
var Promise = require('pseudo-promise')

var DateTimeFields = {
	created_at: 'date',
	updated_at: 'date'
}

var OptionDefaults = {
	timestamps: true
}

var HookSynonyms = {
	'beforeDelete': 'beforeDestroy',
	'afterDelete': 'afterDestroy'
}

var Query, modeler

var Model = function(fields, options) {

	this.options = options || {}

	this.fields = fields
	this.tableName = this.options.tableName || ''
	this.hooks = this.options.hooks || {}

	modeler = _.last(arguments)
	Query = require(__dirname + '/query')(modeler.connection)

	this.initialize()

}

_.extend(Model.prototype, {

	initialize: function() {

		this.setOptionDefaults()
		this.appendClassMethods()
		this.prepareFields()
		this.cleanUpOptions()

	},

	find: function(primary_key, options) {

		if (typeof primary_key == 'object')
		{
			options = primary_key
			primary_key = null
		}

		var promise = new Promise()

		options || (options = {})

		// Find a single instance by its primary key.
		if (primary_key)
		{
			options.where = {}
			options.where[this.getPrimaryKeyFieldName()] = primary_key
		}

		options.table = this.getTableName()
		options.include = options.include || {}
		options.limit = 1

		var self = this

		Query.Select(options).complete(function(error, rows) {

			if (error)
				return promise.reject(error)

			if (!rows[0])
				return promise.resolve(null)

			var instance = self.build(rows[0], {isNewRecord: false})

			promise.resolve(instance)

		})

		return promise

	},

	findAll: function(options) {

		var promise = new Promise()

		options || (options = {})

		options.table = this.getTableName()
		options.include = options.include || {}

		var self = this

		Query.Select(options).complete(function(error, rows) {

			if (error)
				return promise.reject(error)

			var instances = []

			for (var i in rows)
			{
				var instance = self.build(rows[i], {isNewRecord: false})

				instances.push(instance)
			}

			promise.resolve(instances)

		})

		return promise

	},

	create: function(data, options) {

		var promise = new Promise()

		options || (options = {})

		var instance = this.build(data)

		instance.save(options).complete(function(errors, result) {

			if (errors)
				return promise.reject(errors)

			promise.resolve(result)

		})

		return promise

	},

	update: function(data, options) {

		var promise = new Promise()

		options || (options = {})

		options.table = this.getTableName()

		this.findAll(options).complete(function(error, instances) {

			if (error)
				return promise.reject(error)

			async.each(instances, function(instance, next) {

				instance.set(data)

				instance.save().complete(next)

			}, function(errors) {

				if (errors)
					return promise.reject(errors)

				promise.resolve()

			})

		})

		return promise

	},

	destroy: function(options) {

		var promise = new Promise()

		options || (options = {})

		options.table = this.getTableName()

		Query.Delete(options).complete(function(error) {

			if (error)
				return promise.reject(error)

			promise.resolve()

		})

		return promise

	},

	count: function(options) {

		var promise = new Promise()

		options || (options = {})

		options.table = this.getTableName()

		var self = this

		Query.Count(options).complete(function(error, count) {

			if (error)
				return promise.reject(error)

			promise.resolve(count)

		})

		return promise

	},

	build: function(data, options) {

		options || (options = { isNewRecord: true })

		var instance = new Instance(this, data, options, modeler)

		if (this.options.instanceMethods)
			_.extend(instance, this.options.instanceMethods)

		return instance

	},

	getTableName: function() {

		return this.tableName

	},

	getField: function(name) {

		return typeof this.fields[name] != 'undefined' ? this.fields[name] : null

	},

	getFields: function() {

		return this.fields

	},

	hasPrimaryKeyField: function() {

		return !!this.getPrimaryKeyField()

	},

	getPrimaryKeyField: function() {

		var name = this.getPrimaryKeyFieldName()

		return !!name && this.getField(name)

	},

	getPrimaryKeyFieldName: function() {

		for (var name in this.fields)
			if (this.fields[name].isPrimaryKey())
				return name

		return null

	},

	getUniqueKeys: function() {

		var uniqueKeys = {}

		// Get individual fields marked as unique keys.
		for (var name in this.fields)
		{
			var field = this.fields[name]

			// Not a unique key?
			if (!field.isUniqueKey())
				// Skip it.
				continue

			var uniqueKey = {}

			uniqueKey.fields = [name]
			uniqueKey.msg = field.options.uniqueKey.msg || ''

			uniqueKeys[name] = uniqueKey
		}

		// Primary key is a unique key, too.
		if (this.hasPrimaryKeyField())
		{
			var field = this.getPrimaryKeyField()
			var name = this.getPrimaryKeyFieldName()

			var uniqueKey = {}

			uniqueKey.fields = [name]
			uniqueKey.msg = field.options.primaryKey.msg || ''

			uniqueKeys[name] = uniqueKey
		}

		if (!!this.options.uniqueKeys)
			for (var i in this.options.uniqueKeys)
			{
				var fields, name, msg

				if (_.isArray(this.options.uniqueKeys[i]))
				{
					fields = this.options.uniqueKeys[i]
					name = fields.join('_').toLowerCase()
					msg = ''
				}
				else
				{
					fields = this.options.uniqueKeys[i].fields
					name = this.options.uniqueKeys[i].name || fields.join('_').toLowerCase()
					msg = this.options.uniqueKeys[i].msg || ''
				}

				var uniqueKey = {}

				uniqueKey.fields = fields
				uniqueKey.msg = msg

				uniqueKeys[name] = uniqueKey
			}

		return uniqueKeys

	},

	useTimestamps: function() {

		return this.options.timestamps === true

	},

	setOptionDefaults: function() {

		for (var name in OptionDefaults)
			if (typeof this.options[name] == 'undefined')
				this.options[name] = OptionDefaults[name]

	},

	prepareFields: function() {

		if (this.useTimestamps())
			_.extend(this.fields, DateTimeFields)

		for (var name in this.fields)
			this.fields[name] = new Field(name, this.fields[name])

	},

	appendClassMethods: function() {

		if (this.options.classMethods)
			// Add class methods to this model.
			_.extend(this, this.options.classMethods)

	},

	cleanUpOptions: function() {

		delete this.options.tableName

	},

	addHook: function(type, fn) {

		// If this is a synonym, swap it out for the preferred type.
		if (HookSynonyms[type])
			type = HookSynonyms[type]

		this.hooks[type] || (this.hooks[type] = [])

		this.hooks[type].push(fn)

	},

	getHooks: function(type) {

		return this.hooks[type] || []

	},

	clearHooks: function() {

		for (var type in this.hooks)
			this.hooks[type] = []

	}

})

module.exports = Model