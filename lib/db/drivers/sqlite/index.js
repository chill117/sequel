var _ = require('underscore')
var async = require('async')
var Promise = require('pseudo-promise')
var sqlite3 = require('sqlite3')

var ValidJoinTypes = ['left', 'right', 'outer', 'inner']
var ValidWhereTypes = ['and', 'or']
var WhereOperators = {
	gt: '>',
	gte: '>=',
	lt: '<',
	lte: '<=',
	ne: '!='
}

var SQLiteDriver = function(options, database) {

	this.options = options || (options = {})
	this.database = database || null

	this.initialize()

}

_.extend(SQLiteDriver.prototype, {

	initialize: function() {

		if (this.options.debug === true)
			sqlite3.verbose()

		if (!this.database)
		{
			this.database = new sqlite3.Database(this.options.filename)

			this.database.on('error', function(error) {
				console.log('Failed to open SQLite database: ' + error)
			})
		}

	},

	query: function(sql, params, cb) {

		if (typeof params == 'function')
		{
			cb = params
			params = []
		}

		this.database.run(sql, params, cb)

	},

	create: function(data, options) {

		var promise = new Promise()

		data || (data = {})
		options || (options = {})
		options.table || (options.table = '')

		if (_.isEmpty(data))
			return promise.reject('No data provided')

		var self = this

		this.buildCreateQuery(data, options, function(error, sql, params) {

			if (error)
				return promise.reject(error)

			self.query(sql, params, function(error) {

				if (error)
					return promise.reject(error)

				promise.resolve(this.lastID)

			})

		})

		return promise

	},

	buildCreateQuery: function(data, options, cb) {

		data || (data = {})
		options || (options = {})

		if (!options.table)
			return cb('Missing table name')

		var sql = '', params = []

		sql += 'INSERT INTO ' + this.escapeId(options.table)

		var fields = []

		for (var field in data)
		{
			var value = data[field]

			fields.push( this.escapeId(field) )
			params.push( this.prepareValue(value) )
		}

		sql += ' (' + fields.join(', ') + ')'
		sql += ' VALUES ('

		for (var i in fields)
			sql += (i > 0 ? ', ' : '') + '?'

		sql += ')'

		cb(null, sql, params)

	},

	find: function(options) {

		var promise = new Promise()

		options || (options = {})

		var self = this

		this.buildFindQuery(options, function(error, sql, params) {

			if (error)
				return promise.reject(error)

			self.database.all(sql, params, function(error, rows) {

				if (error)
					return promise.reject(error)

				var results = self.buildResultData(options, rows)

				promise.resolve(results)

			})

		})

		return promise

	},

	buildFindQuery: function(options, cb) {

		if (!options.table)
			return cb('Missing table name')

		options || (options = {})
		options.table || (options.table = '')
		options.select || (options.select = [])
		options.distinct || (options.distinct = false)
		options.where || (options.where = {})
		options.joins || (options.joins = [])
		options.order_by || (options.order_by = '')
		options.group_by || (options.group_by = '')
		options.limit || (options.limit = null)
		options.offset || (options.offset = 0)

		var sql = '', params = []

		sql += 'SELECT '

		if (options.distinct)
			sql += 'DISTINCT '

		var self = this

		this.buildSelectExpressionsClause(options, function(error, _sql) {

			if (error)
				return cb(error)

			if (_sql)
				sql += _sql

			sql += ' FROM ' + self.escapeId(options.table)

			self.buildJoinClause(options, function(error, _sql, _params) {

				if (error)
					return cb(error)

				if (_sql)
				{
					sql += ' ' + _sql
					params = params.concat(_params)
				}

				self.buildWhereClause(options, function(error, _sql, _params) {

					if (error)
						return cb(error)

					if (_sql)
					{
						sql += ' WHERE ' + _sql
						params = params.concat(_params)
					}

					if (options.order_by)
						sql += ' ORDER BY ' + self.buildOrderByClause(options)

					if (options.group_by)
						sql += ' GROUP BY ' + self.buildGroupByClause(options)

					if (options.limit)
						sql += ' LIMIT ' + parseInt(options.offset) + ',' + parseInt(options.limit)

					cb(null, sql, params)

				})

			})

		})

	},

	update: function(data, options) {

		var promise = new Promise()

		data || (data = {})
		options || (options = {})
		options.table || (options.table = '')
		options.where || (options.where = {})

		if (_.isEmpty(data))
			return promise.reject('No data provided')

		var self = this

		this.buildUpdateQuery(data, options, function(error, sql, params) {

			if (error)
				return promise.reject(error)

			self.query(sql, params, function(error) {

				if (error)
					return promise.reject(error)

				promise.resolve(this.changes)

			})

		})

		return promise

	},

	buildUpdateQuery: function(data, options, cb) {

		data || (data = {})
		options || (options = {})

		if (!options.table)
			return cb('Missing table name')

		var sql = '', params = []

		sql += 'UPDATE ' + this.escapeId(options.table)

		var set = []

		for (var field in data)
		{
			var value = data[field]

			switch (typeof value)
			{
				case 'object':

					for (var key in value)
						switch (key)
						{
							case 'increment':
								set.push( this.escapeId(field) + ' = ' + this.escapeId(field) + ' + ?' )
								params.push( value[key] )
							break

							case 'decrement':
								set.push( this.escapeId(field) + ' = ' + this.escapeId(field) + ' - ?' )
								params.push( value[key] )
							break
						}

				break

				default:
					set.push( this.escapeId(field) + ' = ?' )
					params.push( value )
				break
			}
		}

		if (!(set.length > 0))
			return cb('Must update at least one field')

		sql += ' SET ' + set.join(', ')

		var self = this

		this.buildWhereClause(options, function(error, _sql, _params) {

			if (error)
				return cb(error)

			if (_sql)
			{
				sql += ' WHERE ' + _sql
				params = params.concat(_params)
			}

			cb(null, sql, params)

		})

	},

	destroy: function(options) {

		var promise = new Promise()

		options || (options = {})
		options.table || (options.table = '')
		options.where || (options.where = {})

		var self = this

		this.buildDestroyQuery(options, function(error, sql, params) {

			if (error)
				return promise.reject(error)

			self.query(sql, params, function(error) {

				if (error)
					return promise.reject(error)

				promise.resolve(this.changes)

			})

		})

		return promise

	},

	buildDestroyQuery: function(options, cb) {

		options || (options = {})

		if (!options.table)
			return cb('Missing table name')

		var sql = '', params = []

		sql += 'DELETE FROM ' + this.escapeId(options.table)

		var self = this

		this.buildWhereClause(options, function(error, _sql, _params) {

			if (error)
				return cb(error)

			if (_sql)
			{
				sql += ' WHERE ' + _sql
				params = params.concat(_params)
			}

			cb(null, sql, params)

		})

	},

	count: function(options) {

		var promise = new Promise()

		options || (options = {})
		options.table || (options.table = '')
		options.where || (options.where = {})
		options.group_by || (options.group_by = '')

		var self = this

		this.buildCountQuery(options, function(error, sql, params) {

			if (error)
				return promise.reject(error)

			self.database.get(sql, params, function(error, row) {

				if (error)
					return promise.reject(error)

				var count = row['COUNT(*)']

				promise.resolve(count)

			})

		})

		return promise

	},

	buildCountQuery: function(options, cb) {

		options || (options = {})

		if (!options.table)
			return cb('Missing table name')

		var sql = '', params = []

		sql += 'SELECT COUNT(*)'
		sql += ' FROM ' + this.escapeId(options.table)

		var self = this

		this.buildWhereClause(options, function(error, _sql, _params) {

			if (error)
				return cb(error)

			if (_sql)
			{
				sql += ' WHERE ' + _sql
				params = params.concat(_params)
			}

			if (options.group_by)
				sql += ' GROUP BY ' + self.buildGroupByClause(options)

			cb(null, sql, params)

		})

	},

	buildSelectExpressionsClause: function(options, cb) {

		var expressions = [], tables = []

		tables.push( options.table )

		if (options.joins.length > 0)
			for (var i in options.joins)
			{
				var join = options.joins[i]

				if (!join.table)
					continue

				tables.push( join.table )
			}

		if (options.select.length > 0)
		{
			for (var i in options.select)
				expressions.push( this.escapeId(options.select[i]) )
		}
		else if (!(tables.length > 1))
			expressions.push( '*' )
		else
		{
			expressions.push( this.escapeId( options.table ) + '.*' )

			for (var i in options.joins)
			{
				var join = options.joins[i]
				var as = join.as || join.table

				expressions.push( this.escapeId( as ) + '.*' )
			}
		}

		if (!(tables.length > 1))
			return cb(null, expressions.join(', '))

		var self = this

		var fieldLists = {}

		async.each(tables, function(table, nextTable) {

			var as = table

			for (var i in options.joins)
			{
				var join = options.joins[i]

				if (join.table == table)
				{
					as = join.as || join.table
					break
				}
			}

			fieldLists[ self.escapeId(as) ] = []

			self.getFieldList(table, function(error, fields) {

				if (error)
					return nextTable(error)

				for (var i in fields)
					fieldLists[ self.escapeId(as) ].push( self.escapeId(fields[i].name) )

				nextTable()

			})

		}, function(error) {

			if (error)
				return cb(error)

			var expanded = []

			for (var i in expressions)
			{
				var expr = expressions[i]

				if (expr.indexOf('.') == -1)
					expanded.push( expr )

				var parts = expr.split('.')
				var table = parts[0]

				if (parts[1] == '*')
				{
					for (var i in fieldLists[table])
					{
						var field = fieldLists[table][i]
						var as = self.escapeId( (table + '__' + field).replace(/`/g, '') )

						expanded.push( table + '.' + field + ' AS ' + as)
					}
				}
				else
				{
					var field = parts[1]
					var as = self.escapeId( (table + '__' + field).replace(/`/g, '') )

					expanded.push( field + ' AS ' + as)
				}
			}

			cb(null, expanded)

		})

	},

	buildWhereClause: function(options, cb) {

		var sql = '', params = []

		for (var i in options.where)
		{
			if (_.isArray(options.where))
			{
				var where = options.where[i]
				var field = where.field || ''
				var value = where.value || null
				var type = where.type || 'and'
			}
			else
			{
				var field = i
				var value = options.where[i]
				var type = 'and'
			}

			if (!this.isValidWhereType(type))
				return cb('Invalid where type: \'' + type + '\'')

			if (!field)
				return cb('No field specified in where clause')

			if (typeof value == 'object' && !_.isArray(value))
			{
				for (var key in value)
				{
					var operator = WhereOperators[key] || null

					if (!operator)
						return cb('Invalid operator in where clause: \'' + key + '\'')

					if (sql)
						sql += ' ' + type.toUpperCase() + ' '

					if (typeof value[key] == 'object')
						sql += this.escapeId(field) + ' ' + operator + ' (?)'
					else
						sql += this.escapeId(field) + ' ' + operator + ' ?'

					params.push(value[key])
				}
			}
			else
			{
				if (sql)
					sql += ' ' + type.toUpperCase() + ' '

				if (typeof value == 'object')
					sql += this.escapeId(field) + ' IN (' + this.collapseValueArray(value) + ')'
				else
				{
					sql += this.escapeId(field) + ' = ?'
					params.push(value)
				}

			}
		}

		cb(null, sql, params)

	},

	buildJoinClause: function(options, cb) {

		var sql = '', params = []

		for (var i in options.joins)
		{
			var join = options.joins[i]
			var type = (join.type || '')

			// Must be a valid join type.
			if (type && !this.isValidJoinType(type))
				return cb('Invalid join type: \'' + type + '\'')

			// Must have a table to join.
			if (!join.table)
				return cb('No table specified in join')

			// Must have an 'on' clause.
			if (!join.on || !_.isArray(join.on) || join.on.length != 2)
				return cb('Missing on clause in join')

			if (sql)
				sql += ' '

			if (type)
				sql += type.toUpperCase() + ' '

			sql += 'JOIN ' + this.escapeId(join.table)

			var as = join.as || join.table

			if (as != join.table)
				sql += ' AS ' + this.escapeId(as)

			var field1 = join.on[0]
			var field2 = join.on[1]

			sql += ' ON ' + this.escapeId(field1) + ' = ' + this.escapeId(field2)
		}

		cb(null, sql, params)

	},

	buildOrderByClause: function(options) {

		var order_by = options.order_by.split(',')

		for (var i in order_by)
		{
			order_by[i] = trim(order_by[i]).split(' ')

			var field = this.escapeId(order_by[i][0])
			var direction = (order_by[i][1] || '').toString().toUpperCase()

			if (direction == 'DESC' || direction == 'ASC')
				order_by[i] = field + ' ' + direction
			else
				order_by[i] = field
		}

		return order_by.join(', ')

	},

	buildGroupByClause: function(options) {

		var group_by = options.group_by.split(',')

		for (var i in group_by)
		{
			var field = trim(group_by[i])

			group_by[i] = this.escapeId(field)
		}

		return group_by.join(', ')

	},

	buildResultData: function(options, rows) {

		if (!(options.joins.length > 0))
			return rows

		var results = []

		for (var i in rows)
		{
			var row = rows[i], result = {}

			nextField:
			for (var field in row)
			{
				var pos = field.indexOf('__')
				var table = field.substr(0, pos)
				var value = this.autoCastDataType(row[field])
				var realFieldName = field.substr(pos + '__'.length)

				if (table == options.table)
				{
					result[realFieldName] = value
					continue nextField
				}

				for (var i in options.joins)
				{
					var join = options.joins[i]
					var as = join.as || join.table

					if (table == as)
					{
						result[as] || (result[as] = {})
						result[as][realFieldName] = value
						continue nextField
					}
				}
			}

			results.push(result)
		}

		return results

	},

	autoCastDataType: function(data) {

		switch (typeof data)
		{
			case 'string':

				if (data == parseInt(data).toString())
					return parseInt(data)

				if (data == parseFloat(data).toString())
					return parseFloat(data)

				if (data == (new Date(data)).toString())
					return new Date(data)

			break
		}

		return data

	},

	isValidJoinType: function(type) {

		type = type.toLowerCase()

		for (var i in ValidJoinTypes)
			if (type == ValidJoinTypes[i])
				return true

		return false

	},

	isValidWhereType: function(type) {

		type = type.toLowerCase()

		for (var i in ValidWhereTypes)
			if (type == ValidWhereTypes[i])
				return true

		return false

	},

	collapseValueArray: function(value_array) {

		for (var i in value_array)
			value_array[i] = this.escape(value_array[i])

		return value_array.join(', ')

	},

	prepareValue: function(value) {

		if (value === undefined || value === null)
			return null

		if (typeof value == 'boolean')
			return !!value ? 'true' : 'false'

		return value.toString()

	},

	escapeId: function(identifier) {

		if (identifier.indexOf('.') != -1)
		{
			var parts = identifier.split('.')

			return this.escapeId(parts[0]) + '.' + this.escapeId(parts[1])
		}

		return '`' + identifier.replace(/`/g, '``').replace(/\./g, '`.`') + '`';

	},

	escape: function(value) {

		if (value === undefined || value === null)
			return null

		switch (typeof value)
		{
			case 'boolean':
				return !!value ? 'true' : 'false'

			case 'number':
				return value.toString()
		}

		value = value.toString().replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function(str) {

			switch (str)
			{
				case "\0": return "\\0"
				case "\n": return "\\n"
				case "\r": return "\\r"
				case "\b": return "\\b"
				case "\t": return "\\t"
				case "\x1a": return "\\Z"
				default: return "\\" + str
			}

		})

		return "'" + value + "'"

	},

	getFieldList: function(table, cb) {

		var sql = 'pragma table_info(' + this.escapeId(table) + ')'

		this.database.all(sql, [], cb)

	},

	startTransaction: function(cb) {

		return this.database.run('BEGIN TRANSACTION', [], cb)

	},

	rollbackTransaction: function(cb) {

		return this.database.run('ROLLBACK TRANSACTION', [], cb)

	},

	commitTransaction: function(cb) {

		return this.database.run('COMMIT TRANSACTION', [], cb)

	}

})

function trim(str) {

	return str.replace(/^\s+|\s+$/, '')

}

module.exports = SQLiteDriver