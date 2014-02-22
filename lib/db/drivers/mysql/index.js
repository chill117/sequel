var _ = require('underscore')
var mysql = require('mysql')
var Promise = require('pseudo-promise')

var ValidJoinTypes = ['left', 'right', 'outer', 'inner']
var ValidWhereTypes = ['and', 'or']
var WhereOperators = {
	gt: '>',
	gte: '>=',
	lt: '<',
	lte: '<=',
	ne: '!=',
	not_in: 'NOT IN'
}

var MySQLDriver = function(options, connection) {

	this.options = options || (options = {})

	this.connection = connection || null

	if (!connection)
	{
		this.connection = mysql.createConnection(options)
		this.connection.connect()
	}

}

_.extend(MySQLDriver.prototype, {

	query: function(sql, params, cb) {

		if (typeof params == 'function')
		{
			cb = params
			params = []
		}

		var query = this.connection.query(sql, params, cb)

		if (this.options.debug === true)
			console.log(query.sql)

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

			self.query(sql, params, function(error, rows) {

				if (error)
					return promise.reject(error)

				var insert_id = rows.insertId

				promise.resolve(insert_id)

			})

		})

		return promise

	},

	buildCreateQuery: function(data, options, cb) {

		data || (data = {})
		options || (options = {})

		if (!options.table)
			return cb('Missing table name')

		var sql = 'INSERT INTO ' + this.escapeId(options.table) + ' SET ?'
		var params = data

		cb(null, sql, params)

	},

	find: function(options) {

		var promise = new Promise()

		options || (options = {})

		var self = this

		this.buildFindQuery(options, function(error, sql, params) {

			if (error)
				return promise.reject(error)

			self.query({sql: sql, nestTables: true}, params, function(error, rows, fields) {

				if (error)
					return promise.reject(error)

				var results = self.buildResultData(options, rows, fields)

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

		sql += this.buildSelectExpressionsClause(options)

		sql += ' FROM ' + this.escapeId(options.table)

		var self = this

		this.buildJoinClause(options, function(error, _sql, _params) {

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

	},

	update: function(data, options) {

		var promise = new Promise()

		data || (data = {})
		options || (options = {})
		options.table || (options.table = '')
		options.where || (options.where = {})
		options.order_by || (options.order_by = '')
		options.limit || (options.limit = null)

		if (_.isEmpty(data))
			return promise.reject('No data provided')

		var self = this

		this.buildUpdateQuery(data, options, function(error, sql, params) {

			if (error)
				return promise.reject(error)

			self.query(sql, params, function(error, rows) {

				if (error)
					return promise.reject(error)

				var num_updated = rows.affectedRows

				promise.resolve(num_updated)

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

			if (options.order_by)
				sql += ' ORDER BY ' + self.buildOrderByClause(options)

			if (options.limit)
				sql += ' LIMIT ' + parseInt(options.limit)

			cb(null, sql, params)

		})

	},

	destroy: function(options) {

		var promise = new Promise()

		options || (options = {})
		options.table || (options.table = '')
		options.where || (options.where = {})
		options.order_by || (options.order_by = '')
		options.limit || (options.limit = null)

		var self = this

		this.buildDestroyQuery(options, function(error, sql, params) {

			if (error)
				return promise.reject(error)

			self.query(sql, params, function(error, rows) {

				if (error)
					return promise.reject(error)

				var num_destroyed = rows.affectedRows

				promise.resolve(num_destroyed)

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

			if (options.order_by)
				sql += ' ORDER BY ' + self.buildOrderByClause(options)

			if (options.limit)
				sql += ' LIMIT ' + parseInt(options.limit)

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

			self.query(sql, params, function(error, rows) {

				if (error)
					return promise.reject(error)

				var count = rows[0]['COUNT(*)']

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

	buildSelectExpressionsClause: function(options) {

		var expressions = []

		if (options.select.length > 0)
		{
			for (var i in options.select)
				expressions.push( this.escapeId(options.select[i]) )
		}
		else
		{
			var tables = []

			tables.push( options.table )

			if (options.joins.length > 0)
				for (var i in options.joins)
				{
					var join = options.joins[i]

					if (!join.table)
						continue

					tables.push( join.as || join.table )
				}

			if (!(tables.length > 1))
				expressions.push( '*' )
			else
				for (var i in tables)
					expressions.push( this.escapeId(tables[i]) + '.*' )
		}

		return expressions.join(', ')

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

			// If there are joins.
			if (!!options.joins && options.joins.length > 0)
				// And, the field does not have a table prepended to it.
				if (field.indexOf('.') == -1)
					// Prepend the main table.
					field = options.table + '.' + field

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
					sql += this.escapeId(field) + ' IN (?)'
				else
					sql += this.escapeId(field) + ' = ?'

				params.push(value)
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

			// If there are joins.
			if (!!options.joins && options.joins.length > 0)
				// And, the field does not have a table prepended to it.
				if (field.indexOf('.') == -1)
					// Prepend the main table.
					field = options.table + '.' + field

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

			// If there are joins.
			if (!!options.joins && options.joins.length > 0)
				// And, the field does not have a table prepended to it.
				if (field.indexOf('.') == -1)
					// Prepend the main table.
					field = options.table + '.' + field

			group_by[i] = this.escapeId(field)
		}

		return group_by.join(', ')

	},

	buildResultData: function(options, rows, fields) {

		var results = []

		for (var i in rows)
		{
			var row = rows[i]

			var result = {}

			for (var n in fields)
				if (fields[n].table == options.table)
					result[fields[n].name] = row[options.table][fields[n].name]

			for (var n in options.joins)
			{
				var join = options.joins[n]
				var as = join.as || join.table

				result[as] = {}

				for (var n in fields)
					if (fields[n].table == as)
						result[as][fields[n].name] = row[as][fields[n].name]
			}

			results.push(result)
		}

		return results

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

	escapeId: function(identifier) {

		if (identifier.indexOf('.') != -1)
		{
			var parts = identifier.split('.')

			return mysql.escapeId(parts[0]) + '.' + mysql.escapeId(parts[1])
		}

		return mysql.escapeId(identifier)

	},

	escape: function(value) {

		return this.connection.escape(value)

	},

	startTransaction: function(cb) {

		return this.connection.beginTransaction(cb)

	},

	rollbackTransaction: function(cb) {

		return this.connection.rollback(cb)

	},

	commitTransaction: function(cb) {

		return this.connection.commit(cb)

	}

})

function trim(str) {

	return str.replace(/^\s+|\s+$/, '')

}

module.exports = MySQLDriver