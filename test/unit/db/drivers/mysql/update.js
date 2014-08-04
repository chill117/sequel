var drivers = require('../../../../drivers')
var TestManager = drivers.mysql.TestManager
var MySQLDriver = drivers.mysql.sequel.db

var _ = require('underscore')
var async = require('async')
var expect = require('chai').expect


describe('MySQLDriver', function() {

	describe('buildUpdateQuery(data, options, cb)', function() {

		var PreComputed = [

			{
				data: {
					name: 'A name'
				},
				options: {
					table: 'test_table',
					where: {
						id: 10
					},
					limit: 1
				},
				result: {
					error: null,
					sql: 'UPDATE `test_table` SET `name` = ? WHERE `id` = ? LIMIT 1',
					params: ['A name', 10]
				}
			},

			{
				data: {
					value2: 0
				},
				options: {
					table: 'test_table'
				},
				result: {
					error: null,
					sql: 'UPDATE `test_table` SET `value2` = ?',
					params: [0]
				}
			},

			{
				data: {
					value1: {
						increment: 1
					}
				},
				options: {
					table: 'test_table',
					where: {
						id: 15
					},
					limit: 1
				},
				result: {
					error: null,
					sql: 'UPDATE `test_table` SET `value1` = `value1` + ? WHERE `id` = ? LIMIT 1',
					params: [1, 15]
				}
			},

			{
				data: {
					value1: {
						decrement: 3
					}
				},
				options: {
					table: 'test_table',
					where: {
						id: 22
					},
					limit: 1
				},
				result: {
					error: null,
					sql: 'UPDATE `test_table` SET `value1` = `value1` - ? WHERE `id` = ? LIMIT 1',
					params: [3, 22]
				}
			},

			{
				data: {
					value1: 2,
					value2: 20
				},
				options: {
					table: 'test_table',
					where: {
						id: 33
					},
					limit: 10
				},
				result: {
					error: null,
					sql: 'UPDATE `test_table` SET `value1` = ?, `value2` = ? WHERE `id` = ? LIMIT 10',
					params: [2, 20, 33]
				}
			},

			{
				data: {
					value1: 2,
					value2: 20
				},
				options: {
					table: 'test_table',
					where: {
						id: 33
					},
					order_by: 'value3',
					limit: 10
				},
				result: {
					error: null,
					sql: 'UPDATE `test_table` SET `value1` = ?, `value2` = ? WHERE `id` = ? ORDER BY `value3` LIMIT 10',
					params: [2, 20, 33]
				}
			}

		]

		for (var i in PreComputed)
			(function(data, options, result) {

				it('should return the expected results', function(done) {

					MySQLDriver.buildUpdateQuery(data, options, function(error, sql, params) {

						expect(error).to.equal(result.error)
						expect(sql).to.equal(result.sql)
						expect(params).to.deep.equal(result.params)

						done()

					})

				})

			})(PreComputed[i].data, PreComputed[i].options, PreComputed[i].result)

	})

	describe('update(data, options)', function() {

		before(TestManager.tearDown)
		before(TestManager.setUp)
		after(TestManager.tearDown)

		var fixtures = {
			'test_table_1': require('../../../../fixtures/test_table_1'),
			'test_table_2': require('../../../../fixtures/test_table_2')
		}
		var tables = _.keys(fixtures)

		it('should return an error when no data is given', function(done) {

			async.parallel([

				function(next) {

					MySQLDriver.update(undefined, {table: tables[0]}).complete(function(error, num_updated) {

						expect(error).to.not.equal(null)
						expect(num_updated).to.equal(null)

						next()

					})

				},

				function(next) {

					MySQLDriver.update({}, {table: tables[0]}).complete(function(error, num_updated) {

						expect(error).to.not.equal(null)
						expect(num_updated).to.equal(null)

						next()

					})

				}

			], done)

		})

		it('should return an error when no table is specified', function(done) {

			var data = fixtures[tables[0]][0]

			MySQLDriver.update(data).complete(function(error, num_updated) {

				expect(error).to.not.equal(null)
				expect(num_updated).to.equal(null)

				done()

			})

		})

		it('should return 0 for \'num_updated\' when there were no rows updated', function(done) {

			var data = {value1: 50}

			MySQLDriver.update(data, {table: tables[0]}).complete(function(error, num_updated) {

				expect(error).to.equal(null)
				expect(num_updated).to.equal(0)

				done()

			})

		})

		describe('with pre-populated rows in the database', function() {

			var ids = {}

			before(function(done) {

				async.eachSeries(tables, function(table, nextTable) {

					ids[table] = []

					async.eachSeries(fixtures[table], function(data, nextFixture) {

						MySQLDriver.create(data, {table: table}).complete(function(errors, insert_id) {

							if (errors)
							{
								console.log(errors)

								return nextFixture(new Error('Unexpected error(s)'))
							}

							ids[table].push(insert_id)

							nextFixture()

						})

					}, nextTable)

				}, done)

			})

			it('should update each row one-by-one', function(done) {

				var data_by_table = {
					'test_table_1': {
						value1: 104,
						value2: 205
					},
					'test_table_2': {
						value3: 'this row',
						value4: 'has been updated'
					}
				}

				async.eachSeries(tables, function(table, nextTable) {

					var data = data_by_table[table]

					async.eachSeries(ids[table], function(id, nextRow) {

						var options = {}

						options.table = table
						options.where = {id: id}
						options.limit = 1

						MySQLDriver.update(data, options).complete(function(error, num_updated) {

							expect(error).to.equal(null)
							expect(num_updated).to.equal(1)

							// Verify that the row was updated.
							MySQLDriver.find(options).complete(function(error, results) {

								if (error)
									return nextRow(new Error(error))

								expect(results).to.be.an('array')
								expect(results[0]).to.not.equal(undefined)

								var row = results[0]

								for (var name in data)
									expect(row[name]).to.equal(data[name])

								nextRow()

							})

						})

					}, nextTable)

				}, done)

			})

		})

	})

})