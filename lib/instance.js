var _ = require('underscore')
var async = require('async')
var EventEmitter = require('events').EventEmitter
var Promise = require('pseudo-promise')

var Db, sequel

var Instance = function(model, data, options) {

	this.options = options || {}

	this.model = model
	this.data = data
	this.isNewRecord = this.options.isNewRecord === true

	sequel = _.last(arguments)
	Db = sequel.db

	this.initialize()

}

_.extend(Instance.prototype, EventEmitter.prototype, {

	initialize: function() {

		this.prepareData()
		this.cleanUpOptions()

	},

	getAllData: function() {

		return this.data

	},

	getChangedData: function() {

		var fields = this.getFields()

		var data = {}

		for (var name in fields)
			if (this.hasChanged(name))
				data[name] = this.get(name)

		return data

	},

	anyHaveChanged: function(fields) {

		fields || (fields = this.getFields())

		for (var name in fields)
			if (this.hasChanged(name))
				return true

		return false

	},

	hasChanged: function(name) {

		return this.data[name] !== this.syncedData[name]

	},

	wasChanged: function(name) {

		return this.syncedData[name] !== this.dataBeforeLastSync[name]

	},

	syncData: function() {

		this.dataBeforeLastSync = this.syncedData || {}
		this.syncedData = {}

		for (var name in this.data)
			this.syncedData[name] = this.get(name)

		if (!this._hasSyncedData)
			this.dataBeforeLastSync = this.syncedData

		this._hasSyncedData = true

	},

	get: function(name) {

		return typeof this.data[name] != 'undefined' ? this.data[name] : null

	},

	set: function(name_or_values, value) {

		if (typeof name_or_values == 'string')
		{
			var field = this.getField(name_or_values)

			// Field not valid.
			if (!field)
				return

			if (field.isReadOnly() && this.isExistingRecord())
				// Don't allow setting of read-only fields for existing records.
				return

			this.data[name_or_values] = value

			return
		}

		for (var name in name_or_values)
			this.set(name, name_or_values[name])

	},

	save: function(options) {

		options || (options = {})

		if (options.validate === false)
		{
			// Skip validation.

			if (!this.isExistingRecord())
				return this.create(options)

			return this.update(options)
		}

		var promise = new Promise()

		if (!this.isExistingRecord())
			this.setDefaults()

		var self = this

		this.validate().complete(function(errors) {

			if (errors)
				return promise.reject(errors)

			if (!self.isExistingRecord())
				return self.create(options).complete(function(errors, result) {

					if (errors)
						return promise.reject(errors)

					promise.resolve(result)

				})

			self.update(options).complete(function(error, result) {

				if (error)
					return promise.reject(error)

				promise.resolve(result)

			})

		})

		return promise

	},

	// Insert a new record.
	create: function(options) {

		var promise = new Promise()

		if (this.isExistingRecord())
			return promise.reject('Could not create new record, because it already exists')

		options || (options = {})

		var self = this

		this.runHook('beforeCreate').complete(function(error) {

			if (error)
				return promise.reject(error)

			options.table = self.getTableName()

			if (self.model.useTimestamps())
			{
				var now = self.now()

				self.set('created_at', now)
				self.set('updated_at', now)
			}

			var data = {}

			for (var name in self.model.fields)
				data[name] = self.get(name)

			data = self.collapseArrays(data)

			Db.create(data, options).complete(function(error, insert_id) {

				if (error)
					return promise.reject(error)

				if (self.hasAutoIncrementPrimaryKeyField())
					self.setPrimaryKey(insert_id)

				self.syncData()

				self.isNewRecord = false

				self.runHook('afterCreate').complete(function(error) {

					if (error)
						return promise.reject(error)

					promise.resolve(self)

				})

			})

		})

		return promise

	},

	// Update an existing record.
	update: function(options) {

		var promise = new Promise()

		if (!this.isExistingRecord())
			return promise.reject('Could not update record, because it does not yet exist')

		options || (options = {})

		var self = this

		this.runHook('beforeUpdate').complete(function(error) {

			if (error)
				return promise.reject(error)

			options.table = self.getTableName()

			options.where = {}
			options.where[self.getPrimaryKeyFieldName()] = self.getPrimaryKey()

			options.limit = 1

			// Nothing to update?
			if (!self.anyHaveChanged())
				// Then just fire the 'afterUpdate' hook, and keep movin'.
				return self.runHook('afterUpdate').complete(function(error) {

					if (error)
						return promise.reject(error)

					promise.resolve(self)

				})

			if (self.model.useTimestamps())
			{
				var now = self.now()

				self.set('updated_at', now)
			}

			var data = self.getChangedData()

			data = self.collapseArrays(data)

			Db.update(data, options).complete(function(error, num_updated) {

				if (error)
					return promise.reject(error)

				self.syncData()

				self.runHook('afterUpdate').complete(function(error) {

					if (error)
						return promise.reject(error)

					promise.resolve(self)

				})

			})

		})

		return promise

	},

	destroy: function() {

		var promise = new Promise()

		if (!this.isExistingRecord())
			return promise.reject('Could not destroy record, because it does not yet exist')

		var self = this

		this.runHook('beforeDestroy').complete(function(error) {

			if (error)
				return promise.reject(error)

			var options = {}

			options.table = self.getTableName()

			options.where = {}
			options.where[self.getPrimaryKeyFieldName()] = self.getPrimaryKey()

			options.limit = 1

			Db.destroy(options).complete(function(error) {

				if (error)
					return promise.reject(error)

				self.runHook('afterDestroy').complete(function(error) {

					if (error)
						return promise.reject(error)

					promise.resolve()

				})

			})

		})

		return promise

	},

	validate: function() {

		var promise = new Promise()

		var self = this

		this.runHook('beforeValidate').complete(function(error) {

			if (error)
				return promise.reject(error)

			// This is only temporary.
			self.errors = {}

			async.parallel([

				_.bind(self.validateFields, self),
				_.bind(self.validateInstance, self),
				_.bind(self.validateUniqueKeys, self),
				_.bind(self.validateForeignKeys, self)

			], function() {

				var errors = self.errors

				// Free up memory.
				delete self.errors

				for (var name in errors)
					if (!(errors[name].length > 0))
						delete errors[name]

				for (var name in errors)
					for (var i in errors[name])
						return promise.reject(errors)

				self.runHook('afterValidate').complete(function(error) {

					if (error)
						return promise.reject(error)

					promise.resolve()

				})

			})

		})

		return promise

	},

	validateFields: function(cb) {

		var fields = this.getFields()

		var self = this

		async.each(_.keys(fields), function(name, next) {

			var field = fields[name]

			self.errors[name] || (self.errors[name] = [])

			// This is an existing record and this field hasn't changed.
			if (self.isExistingRecord() && !self.hasChanged(name))
				// Skip validation.
				return next()

			var value = self.get(name)

			field.validate(value, self, function(errors) {

				if (errors)
					for (var i in errors)
						self.errors[name].push(errors[i])

				if (field.isReadOnly() && self.hasChanged(name))
					self.errors[name].push('Cannot change \'' + name + '\' for an existing record')

				next()

			})

		}, cb)

	},

	validateInstance: function(cb) {

		// Are there instance-level validations?
		if (!this.model.options.validate)
			// Nothing to do.
			return cb()

		var methods = this.model.options.validate
		var self = this

		async.each(_.keys(methods), function(name, next) {

			var fn = methods[name]

			self.errors[name] || (self.errors[name] = [])

			switch (typeof fn)
			{
				case 'function':

					fn.call(self, function(error) {

						if (error)
							self.errors[name].push(error)

						next()

					})

				break

				default:

					self.errors[name].push('Malformed validation rule')
					next()

				break
			}

		}, cb)

	},

	validateUniqueKeys: function(cb) {

		var uniqueKeys = this.model.getUniqueKeys()
		var self = this

		async.each(_.keys(uniqueKeys), function(name, next) {

			var uniqueKey = uniqueKeys[name]

			self.errors[name] || (self.errors[name] = [])

			// If this is an existing record, and none of the fields in this key have changed.
			if (self.isExistingRecord() && !self.anyHaveChanged(uniqueKey.fields))
				// Then, skip it.
				return next()

			var options = {}

			options.where = {}

			for (var i in uniqueKey.fields)
			{
				var field_name = uniqueKey.fields[i]
				var value = self.get(field_name)

				// Don't try to search based on NULL values.
				if (value === null)
					continue

				options.where[field_name] = value
			}

			// If no search criteria, then move to the next key.
			if (!(_.keys(options.where).length > 0))
				return next()

			options.attributes = [self.getPrimaryKeyFieldName()]

			self.model.find(options).complete(function(error, result) {

				if (error)
					return next(error)

				if (result)
				{
					var message = uniqueKey.msg || 'Duplicate entry found for the following field(s): \'' + uniqueKey.fields.join('\', \'') + '\''

					self.errors[name].push(message)
				}

				next()

			})

		}, cb)

	},

	validateForeignKeys: function(cb) {

		var foreignKeys = this.model.options.foreignKeys || {}

		var self = this

		async.each(_.keys(foreignKeys), function(name, next) {

			var foreignKey = foreignKeys[name]

			self.errors[name] || (self.errors[name] = [])

			// If this is an existing record, and the local value hasn't changed.
			if (self.isExistingRecord() && !self.hasChanged(name))
				// Then, skip it.
				return next()

			var foreignModel = sequel.getModel(foreignKey.model)

			if (!foreignModel)
				return next('Invalid foreign key: Could not find model')

			var field = foreignKey.field
			var value = self.get(name)

			var options = {}

			options.where = {}
			options.where[field] = value
			options.attributes = [field]

			foreignModel.find(options).complete(function(error, result) {

				if (error)
					return next(error)

				if (!result)
				{
					var message = foreignKey.msg || 'Missing parent row for foreign key field'

					self.errors[name].push(message)
				}

				next()

			})

		}, cb)

	},

	castDataToTypes: function() {

		var fields = this.getFields()

		for (var name in fields)
		{
			var field = fields[name]
			var value = this.get(name)

			// Only cast non-null values.
			if (value === null)
				continue

			var dataType = field.getDataType()

			if (field.isArray())
			{
				// Arrays are a bit special.

				if (!value)
					// Default to an empty array.
					value = []

				if (!_.isArray(value))
					value = [value]

				for (var i in value)
					value[i] = this.castDataToType(value[i], dataType)

				this.set(name, value)
			}
			else
			{
				value = this.castDataToType(value, dataType)

				this.set(name, value)
			}

		}

	},

	castDataToType: function(value, dataType) {

		switch (dataType)
		{
			case 'integer':

				return parseInt(value)

			break

			case 'float':
			case 'decimal':
			case 'number':

				return parseFloat(value)

			break

			case 'date':

				return new Date(value.toString())

			break

			case 'string':
			case 'text':
			default:

				return value.toString()

			break
		}

	},

	setDefaults: function() {

		var fields = this.getFields()

		for (var name in fields)
		{
			var field = fields[name]

			// Don't set defaults for fields that have a value already.
			if (this.get(name) !== null)
				continue

			if (!field.hasDefaultValue())
				continue

			this.set(name, field.getDefaultValue())
		}

	},

	getField: function(name) {

		return this.model.getField(name)

	},

	getFields: function() {

		return this.model.getFields()

	},

	getTableName: function() {

		return this.model.tableName

	},

	setPrimaryKey: function(value) {

		this.set(this.getPrimaryKeyFieldName(), value)

	},

	getPrimaryKey: function() {

		return this.get(this.getPrimaryKeyFieldName())

	},

	getPrimaryKeyFieldName: function() {

		return this.model.getPrimaryKeyFieldName()

	},

	getPrimaryKeyField: function() {

		return this.model.getPrimaryKeyField()

	},

	hasAutoIncrementPrimaryKeyField: function() {

		var field = this.getPrimaryKeyField()

		return !!field && field.isAutoIncrement()

	},

	isExistingRecord: function() {

		return this.isNewRecord !== true

	},

	now: function() {

		// Date.setMilliseconds() forces the Date object into a timestamp.
		// But, we want a Date object..
		// So.. we use new Date() twice.. Fun times.
		return new Date(new Date().setMilliseconds(0))

	},

	prepareData: function() {

		var data = {}

		if (this.hasAutoIncrementPrimaryKeyField())
			data[this.getPrimaryKeyFieldName()] = null

		this.data = _.extend(data, this.data)

		this.expandArrays()
		this.castDataToTypes()
		this.syncData()

	},

	cleanUpOptions: function() {

		delete this.options.isNewRecord

	},

	expandArrays: function() {

		var fields = this.getFields()

		for (var name in fields)
		{
			var field = fields[name]

			// Not an array field?
			if (!field.isArray())
				// Skip it.
				continue

			var delimiter = field.options.delimiter || ','
			var value = this.get(name) || ''

			// Already an array.
			if (_.isArray(value))
				// Nothing to do.
				continue

			var array = value.length > 0 ? value.split(delimiter) : []

			this.set(name, array)
		}

	},

	collapseArrays: function(data) {

		var fields = this.getFields()

		for (var name in fields)
		{
			var field = fields[name]

			// Not an array field?
			if (!field.isArray())
				// Skip it.
				continue

			var delimiter = field.options.delimiter || ','
			var value = data[name] || ''

			// Already a string.
			if (!_.isArray(value))
				// Nothing to do.
				continue

			var string = value.join(delimiter)

			data[name] = string
		}

		return data

	},

	runHook: function(type) {

		var promise = new Promise()

		var self = this

		async.eachSeries(this.getHooks(type), function(fn, next) {

			fn.call(self, next)

		}, function(error) {

			if (error)
				return promise.reject(error)

			promise.resolve()

		})

		return promise

	},

	getHooks: function(type) {

		return this.model.getHooks(type)

	}

})

Instance.prototype.trigger = Instance.prototype.emit
Instance.prototype.off = Instance.prototype.removeListener

module.exports = Instance