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

var Db, sequel

var Model = function(name, fields, options) {

	this.options = options || {}

	this.name = name
	this.fields = fields
	this.tableName = this.options.tableName || ''
	this.hooks = this.options.hooks || {}

	sequel = _.last(arguments)
	Db = sequel.db

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

		options.limit = 1

		this.findAll(options).complete(function(error, instances) {

			if (error)
				return promise.reject(error)

			if (!instances[0])
				return promise.resolve(null)

			var instance = instances[0]

			promise.resolve(instance)

		})

		return promise

	},

	findAll: function(options) {

		var promise = new Promise()

		options || (options = {})

		options.table = this.getTableName()
		options.select = this.compileSelectFromOptions(options)

		if (!!options.include)
			options.joins = this.compileJoinsFromIncludes(options.include)

		options.order_by || (options.order_by = options.order || '')
		options.group_by || (options.group_by = options.group || '')

		if (!!options.joins && options.joins.length > 0)
			options = this.disambiguateOptions(options)

		var self = this

		Db.find(options).complete(function(error, rows) {

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

		Db.destroy(options).complete(function(error) {

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

		Db.count(options).complete(function(error, count) {

			if (error)
				return promise.reject(error)

			promise.resolve(count)

		})

		return promise

	},

	build: function(data, options) {

		options || (options = { isNewRecord: true })

		var instance = new Instance(this, data, options, sequel)

		if (this.options.instanceMethods)
			_.extend(instance, this.options.instanceMethods)

		return instance

	},

	disambiguateOptions: function(options) {

		if (!!options.where)
		{
			var where = {}

			for (var field in options.where)
				if (field.indexOf('.') == -1)
					where[options.table + '.' + field] = options.where[field]
				else
					where[field] = options.where[field]

			options.where = where
		}

		if (options.order_by)
		{
			var order_by = options.order_by.split(',')

			for (var i in order_by)
			{
				order_by[i] = trim(order_by[i])

				if (order_by[i].indexOf('.') == -1)
					order_by[i] = options.table + '.' + order_by[i]
			}

			options.order_by = order_by.join(', ')
		}

		if (options.group_by)
		{
			var group_by = options.group_by.split(',')

			for (var i in group_by)
			{
				group_by[i] = trim(group_by[i])

				if (group_by[i].indexOf('.') == -1)
					group_by[i] = options.table + '.' + group_by[i]
			}

			options.group_by = group_by.join(', ')
		}

		return options

	},

	compileSelectFromOptions: function(options) {

		var select = options.attributes || []

		if (!!options.include && options.include.length > 0)
		{
			if (select.length > 0)
				for (var i in select)
					select[i] = options.table + '.' + select[i]

			// Select all fields from main table, if there are attributes specified for an include.
			for (var i in options.include)
				if (!!options.include[i].attributes)
				{
					if (!(select.length > 0))
					{
						for (var field in this.getFields())
							select.push( options.table + '.' + field )

						break
					}
				}

			for (var i in options.include)
			{
				var include = options.include[i], model = {}

				if (include.model)
					model = sequel.getModel(include.model)

				var table = include.table || model.tableName || ''
				var as = include.as || table

				if (!!include.attributes)
					for (var n in include.attributes)
						select.push( as + '.' + include.attributes[n] )
			}
		}

		return select

	},

	compileJoinsFromIncludes: function(includes) {

		var joins = []

		for (var i in includes)
		{
			var include = includes[i]

			var join = {}, model = {}

			if (include.model)
				model = sequel.getModel(include.model)

			join.table = include.table || model.tableName || ''
			join.on = include.on || []
			join.as = include.as || join.table
			join.type = include.join || ''

			if (include.model && ( !_.isArray(join.on) || !(join.on.length > 0) ))
			{
				var foreignKeys = {}

				// Find foreign keys in this model that reference the included model.
				for (var local in this.options.foreignKeys)
					if (this.options.foreignKeys[local].model == include.model)
					{
						var foreign = this.options.foreignKeys[local].field

						foreignKeys[local] = foreign
					}

				// And the inverse..
				// Find foreign keys in the included model that reference this model.
				for (var foreign in model.options.foreignKeys)
					if (model.options.foreignKeys[foreign].model == this.name)
					{
						var local = model.options.foreignKeys[foreign].field

						foreignKeys[local] = foreign
					}

				if (!_.isEmpty(foreignKeys))
				{
					var local, foreign

					if (typeof join.on == 'string')
					{
						// Use the string from the 'on' clause as the local field.
						// And, then use the local field's matching foreign key field.

						local = join.on
						foreign = foreignKeys[local] || null
					}
					else
					{
						// Use the first foreign key found.

						found_one:
						for (var local in foreignKeys)
						{
							foreign = foreignKeys[local]

							break found_one
						}
					}

					join.on = []

					if (foreign)
						join.on = [
							join.as + '.' + foreign,
							this.tableName + '.' + local
						]
				}
			}

			joins.push(join)
		}

		return joins

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

	fieldExists: function(name) {

		return !!this.getField(name)

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

	clearHook: function(type) {

		this.hooks[type] = []

	},

	clearHooks: function() {

		for (var type in this.hooks)
			this.hooks[type] = []

	}

})

function trim(str) {

	return str.replace(/^\s+|\s+$/, '')

}

module.exports = Model