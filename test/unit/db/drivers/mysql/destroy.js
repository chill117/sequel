var driver = require('../../../../drivers/mysql')
var TestManager = driver.TestManager
var MySQLDriver = driver.sequel.db

var _ = require('underscore')
var async = require('async')
var expect = require('chai').expect


describe('MySQLDriver', function() {

	describe('buildDestroyQuery(options, cb)', function() {

		var PreComputed = [

			{
				options: {
					table: 'test_table'
				},
				result: {
					error: null,
					sql: 'DELETE FROM `test_table`',
					params: []
				}
			},

			{
				options: {
					table: 'test_table',
					where: {
						id: 10
					},
					limit: 1
				},
				result: {
					error: null,
					sql: 'DELETE FROM `test_table` WHERE `id` = ? LIMIT 1',
					params: [10]
				}
			},

			{
				options: {
					table: 'test_table',
					where: {
						id: [1, 2, 3]
					},
					limit: 3
				},
				result: {
					error: null,
					sql: 'DELETE FROM `test_table` WHERE `id` IN (?) LIMIT 3',
					params: [[1, 2, 3]]
				}
			},

			{
				options: {
					table: 'test_table',
					where: {
						value1: {
							gt: 0,
							lte: 100
						}
					}
				},
				result: {
					error: null,
					sql: 'DELETE FROM `test_table` WHERE `value1` > ? AND `value1` <= ?',
					params: [0, 100]
				}
			},

			{
				options: {
					table: 'test_table',
					where: {
						value2: 100
					},
					order_by: 'value1'
				},
				result: {
					error: null,
					sql: 'DELETE FROM `test_table` WHERE `value2` = ? ORDER BY `value1`',
					params: [100]
				}
			}

		]

		for (var i in PreComputed)
			(function(options, result) {

				it('should return the expected results', function(done) {

					MySQLDriver.buildDestroyQuery(options, function(error, sql, params) {

						expect(error).to.equal(result.error)
						expect(sql).to.equal(result.sql)
						expect(params).to.deep.equal(result.params)

						done()

					})

				})

			})(PreComputed[i].options, PreComputed[i].result)

	})

	describe('destroy(options)', function() {

		before(TestManager.tearDown)
		before(TestManager.setUp)
		after(TestManager.tearDown)

		var fixtures = {
			'test_table_1': require('../../../../fixtures/test_table_1'),
			'test_table_2': require('../../../../fixtures/test_table_2')
		}
		var tables = _.keys(fixtures)

		it('should return an error when no table is specified', function(done) {

			MySQLDriver.destroy().complete(function(error, num_destroyed) {

				expect(error).to.not.equal(null)
				expect(num_destroyed).to.equal(null)

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

			it('should destroy each row one-by-one', function(done) {

				async.eachSeries(tables, function(table, nextTable) {

					var num_rows = ids[table].length

					async.eachSeries(ids[table], function(id, nextRow) {

						var options = {}

						options.table = table
						options.where = {id: id}
						options.limit = 1

						MySQLDriver.destroy(options).complete(function(error, num_destroyed) {

							expect(error).to.equal(null)
							expect(num_destroyed).to.equal(1)

							num_rows--

							// Verify that only one row was deleted.
							MySQLDriver.count({table: table}).complete(function(error, count) {

								if (error)
									return nextRow(new Error(error))

								expect(count).to.equal(num_rows)

								nextRow()

							})

						})

					}, nextTable)

				}, done)

			})

			it('should return 0 for \'num_destroyed\' when there were no rows destroyed', function(done) {

				MySQLDriver.destroy({table: tables[0]}).complete(function(error, num_destroyed) {

					expect(error).to.equal(null)
					expect(num_destroyed).to.equal(0)

					done()

				})

			})

		})

	})

})