var _ = require('underscore')
var mysql = require('mysql')
var Promise = require('pseudo-promise')

var operators = {
	gt: '>',
	gte: '>=',
	lt: '<',
	lte: '<=',
	ne: '!='
}

module.exports = function(connection) {

	return {

		Insert: function(data, options) {

			var promise = new Promise()

			options || (options = {})

			var table = options.table || ''

			if (!table)
				return promise.reject('Missing required option: \'table\'')

			var sql = 'INSERT INTO ' + mysql.escapeId(table) + ' SET ?'

			var query = connection.query(sql, data, function(error, result) {

				if (options.debug === true)
					console.log(query.sql)

				if (error)
					return promise.reject(error)

				promise.resolve(result.insertId)

			})

			return promise

		},

		Select: function(options) {

			var promise = new Promise()

			options || (options = {})

			var table = options.table || ''
			var limit = options.limit || null
			var offset = options.offset || 0

			if (!table)
				return promise.reject('Missing required option: \'table\'')

			var sql = '', queryData = [], fields = []

			sql += 'SELECT '

			if (options.attributes)
			{
				for (var i in options.attributes)
				{
					var field = mysql.escapeId(options.attributes[i])

					fields.push(field)
				}
			}
			else
			{
				fields.push(mysql.escapeId(table) + '.*')
			}

			if (options.include)
				for (var i in options.include)
				{
					var include = options.include[i]
					var as = include.as || include.table

					if (!as)
						return promise.reject('Missing required include attribute: \'table\'')

					if (include.attributes)
					{
						for (var n in include.attributes)
						{
							var field = include.attributes[n]

							fields.push(mysql.escapeId(as + '.' + field))
						}
					}
					else
					{
						fields.push(mysql.escapeId(as) + '.*')
					}
				}

			sql += fields.join(', ')

			sql += ' FROM ' + mysql.escapeId(table)

			if (options.include)
			{
				var join

				try {

					join = buildJoinClause(table, options.include)

				} catch (error) {

					return promise.reject(error)

				}

				if (join)
					sql += join
			}

			if (options.where)
			{
				var where

				try {

					where = buildWhereClause(options.where)

				} catch (error) {

					return promise.reject(error)

				}

				if (where.sql)
				{
					queryData = queryData.concat(where.queryData)
					sql += ' WHERE ' + where.sql
				}
			}

			if (options.order)
			{
				var order = options.order.split(',')

				for (var i in order)
				{
					order[i] = order[i].replace(/^\s+|\s+$/g, '').split(' ')
					
					order[i][0] = mysql.escapeId(order[i][0])

					order[i] = order[i].join(' ')
				}

				sql += ' ORDER BY ' + order.join(', ')
			}

			if (limit)
				sql += ' LIMIT ' + parseInt(offset) + ',' + parseInt(limit)

			var query = connection.query({sql: sql, nestTables: true}, queryData, function(error, results, fields) {

				if (options.debug === true)
					console.log(query.sql)

				if (error)
					return promise.reject(error)

				var rows = []

				for (var i in results)
				{
					var result = results[i]
					var row = {}

					skip_field:
					for (var n in fields)
					{
						var field = fields[n]

						if (field.table != table)
							continue skip_field

						row[field.name] = result[table][field.name]
					}

					if (options.include)
						for (var x in options.include)
						{
							var include = options.include[x]
							var as = include.as || include.table

							row[as] = {}

							skip_field:
							for (var n in fields)
							{
								var field = fields[n]

								if (field.table != as)
									continue skip_field

								row[as][field.name] = result[as][field.name]
							}
						}

					rows.push(row)
				}

				promise.resolve(rows)

			})

			return promise

		},

		Update: function(data, options) {

			var promise = new Promise()

			options || (options = {})

			var table = options.table || ''
			var limit = options.limit || null

			if (!table)
				return promise.reject('Missing required option: \'table\'')

			var sql = '', queryData = []

			sql += 'UPDATE ' + mysql.escapeId(table)

			var set = []

			for (var field in data)
			{
				set.push(mysql.escapeId(field) + ' = ?')
				queryData.push(data[field])
			}

			sql += ' SET ' + set.join(', ')

			if (options.where)
			{
				var where

				try {

					where = buildWhereClause(options.where)

				} catch (error) {

					return promise.reject(error)

				}

				if (where.sql)
				{
					queryData = queryData.concat(where.queryData)
					sql += ' WHERE ' + where.sql
				}
			}

			if (limit)
				sql += ' LIMIT ' + parseInt(limit)

			var query = connection.query(sql, queryData, function(error, rows) {

				if (options.debug === true)
					console.log(query.sql)

				if (error)
					return promise.reject(error)

				var num_updated = rows.affectedRows

				promise.resolve(num_updated)

			})

			return promise

		},

		Delete: function(options) {

			var promise = new Promise()

			options || (options = {})

			var table = options.table || ''
			var limit = options.limit || null

			if (!table)
				return promise.reject('Missing required option: \'table\'')

			var sql = '', queryData = []

			sql += 'DELETE FROM ' + mysql.escapeId(table)

			if (options.where)
			{
				var where

				try {

					where = buildWhereClause(options.where)

				} catch (error) {

					return promise.reject(error)

				}

				if (where.sql)
				{
					queryData = queryData.concat(where.queryData)
					sql += ' WHERE ' + where.sql
				}
			}

			if (limit)
				sql += ' LIMIT ' + parseInt(limit)

			var query = connection.query(sql, queryData, function(error) {

				if (options.debug === true)
					console.log(query.sql)

				if (error)
					return promise.reject(error)

				promise.resolve()

			})

			return promise

		},

		Count: function(options) {

			var promise = new Promise()

			var table = options.table || ''
			var primaryKey = (options.primaryKey ? mysql.escapeId(options.primaryKey) : '*')

			if (!table)
				return promise.reject('Missing required option: \'table\'')

			var sql = '', queryData = []

			sql += 'SELECT COUNT(' + primaryKey + ')'
			sql += ' FROM ' + mysql.escapeId(table)

			if (options.where)
			{
				var where

				try {

					where = buildWhereClause(options.where)

				} catch (error) {

					return promise.reject(error)

				}

				if (where.sql)
				{
					queryData = queryData.concat(where.queryData)
					sql += ' WHERE ' + where.sql
				}
			}

			var query = connection.query(sql, queryData, function(error, results) {

				if (options.debug === true)
					console.log(query.sql)

				if (error)
					return promise.reject(error)

				var count = results[0]['COUNT(' + primaryKey + ')']

				promise.resolve(count)

			})

			return promise

		}

	}

}

function buildWhereClause(where) {

	var queryData = [], parts = []

	for (var field in where)
	{
		var value = where[field]

		if (typeof value == 'object' && !_.isArray(value))
		{
			for (var key in value)
			{
				var operator = operators[key] || null

				if (!operator)
				{
					throw new Error('Invalid operator in where clause: \'' + key + '\'')

					return false
				}

				parts.push( mysql.escapeId(field) + ' ' + operator + ' ?' )

				queryData.push(value[key])
			}
		}
		else
		{
			if (typeof value == 'object')
				parts.push( mysql.escapeId(field) + ' IN (?)' )
			else
				parts.push( mysql.escapeId(field) + ' = ?' )

			queryData.push(value)
		}
	}

	var sql = parts.join(' AND ')

	return {sql: sql, queryData: queryData}

}

function buildJoinClause(table, includes) {

	var sql = ''

	skip_include:
	for (var i in includes)
	{
		var include = includes[i]
		var type = (include.join || '')

		if (type && !isValidJoinType(type))
		{
			throw new Error('Invalid include attribute (\'join\')')

			return false
		}

		if (!include.table)
		{
			throw new Error('Missing required attribute for include: \'table\'')

			return false
		}

		if (type)
			sql += type.toUpperCase() + ' '

		sql += ' JOIN ' + mysql.escapeId(include.table)

		var as = include.as || include.table

		sql += ' AS ' + mysql.escapeId(as)

		if (!include.on)
		{
			throw new Error('Missing required attribute for include: \'on\'')

			return false
		}

		if (typeof include.on != 'object' || !_.isArray(include.on))
		{
			throw new Error('Invalid include attribute (\'on\'): Array expected')

			return false
		}

		if (include.on.length != 2)
		{
			throw new Error('Malformed include attribute (\'on\'): Expected exactly two fields')

			return false
		}

		var field1 = include.on[0]
		var field2 = include.on[1]

		sql += ' ON (' + mysql.escapeId(field1) + ' = ' + mysql.escapeId(field2) + ')'
	}

	return sql

}

var ValidJoinTypes = ['left', 'right', 'inner', 'outer']

function isValidJoinType(type) {

	type = type.toLowerCase()

	for (var i in ValidJoinTypes)
		if (type == ValidJoinTypes[i])
			return true

	return false

}