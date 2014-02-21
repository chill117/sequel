var drivers = require('../../../../drivers')
var TestManager = drivers.mysql.TestManager
var MySQLDriver = drivers.mysql.sequel.db

var _ = require('underscore')
var async = require('async')
var chai = require('chai')
var expect = chai.expect


describe('MySQLDriver', function() {

	describe('buildFindQuery(options, cb)', function() {

		var PreComputed = [

			{
				options: {table: 'test_table'},
				result: {
					error: null,
					sql: 'SELECT * FROM `test_table`',
					params: []
				}
			},

			{
				options: {
					table: 'test_table',
					where: {
						id: 1
					},
					limit: 1
				},
				result: {
					error: null,
					sql: 'SELECT * FROM `test_table` WHERE `id` = ? LIMIT 0,1',
					params: [1]
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
					sql: 'SELECT * FROM `test_table` WHERE `id` IN (?) LIMIT 0,3',
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
					sql: 'SELECT * FROM `test_table` WHERE `value1` > ? AND `value1` <= ?',
					params: [0, 100]
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
					},
					group_by: 'id'
				},
				result: {
					error: null,
					sql: 'SELECT * FROM `test_table` WHERE `value1` > ? AND `value1` <= ? GROUP BY `id`',
					params: [0, 100]
				}
			},

			{
				options: {
					table: 'test_table',
					select: ['id', 'value1', 'value2'],
					where: {
						value1: {
							gt: 0,
							lte: 100
						}
					},
					group_by: 'id'
				},
				result: {
					error: null,
					sql: 'SELECT `id`, `value1`, `value2` FROM `test_table` WHERE `value1` > ? AND `value1` <= ? GROUP BY `id`',
					params: [0, 100]
				}
			},

			{
				options: {
					table: 'test_table',
					select: ['id', 'value1', 'value2'],
					distinct: true,
					where: {
						value1: {
							gt: 0,
							lte: 100
						}
					},
					order_by: 'value3',
					group_by: 'id'
				},
				result: {
					error: null,
					sql: 'SELECT DISTINCT `id`, `value1`, `value2` FROM `test_table` WHERE `value1` > ? AND `value1` <= ? ORDER BY `value3` GROUP BY `id`',
					params: [0, 100]
				}
			},

			{
				options: {
					table: 'test_table',
					select: ['id', 'value1', 'value2'],
					distinct: true,
					where: {
						value1: {
							gt: 0,
							lte: 100
						}
					},
					order_by: 'value3',
					group_by: 'id',
					limit: 22
				},
				result: {
					error: null,
					sql: 'SELECT DISTINCT `id`, `value1`, `value2` FROM `test_table` WHERE `value1` > ? AND `value1` <= ? ORDER BY `value3` GROUP BY `id` LIMIT 0,22',
					params: [0, 100]
				}
			},

			{
				options: {
					table: 'test_table1',
					joins: [
						{
							table: 'test_table2',
							on: ['test_table2.ref_id', 'test_table1.id']
						}
					],
					where: {
						id: 20
					},
					limit: 1
				},
				result: {
					error: null,
					sql: 'SELECT `test_table1`.*, `test_table2`.* FROM `test_table1` JOIN `test_table2` ON `test_table2`.`ref_id` = `test_table1`.`id` WHERE `id` = ? LIMIT 0,1',
					params: [20]
				}
			},

			{
				options: {
					table: 'test_table1',
					joins: [
						{
							table: 'test_table2',
							on: ['test_table2.ref_id', 'test_table1.id'],
							type: 'left'
						}
					],
					where: {
						id: 20
					},
					limit: 1
				},
				result: {
					error: null,
					sql: 'SELECT `test_table1`.*, `test_table2`.* FROM `test_table1` LEFT JOIN `test_table2` ON `test_table2`.`ref_id` = `test_table1`.`id` WHERE `id` = ? LIMIT 0,1',
					params: [20]
				}
			},

			{
				options: {
					table: 'test_table1',
					joins: [
						{
							table: 'test_table2',
							on: ['test_table2.ref_id', 'test_table1.id'],
							type: 'right'
						}
					],
					where: {
						id: 20
					},
					limit: 1
				},
				result: {
					error: null,
					sql: 'SELECT `test_table1`.*, `test_table2`.* FROM `test_table1` RIGHT JOIN `test_table2` ON `test_table2`.`ref_id` = `test_table1`.`id` WHERE `id` = ? LIMIT 0,1',
					params: [20]
				}
			},

			{
				options: {
					table: 'test_table1',
					joins: [
						{
							table: 'test_table2',
							on: ['test_table2.ref_id', 'test_table1.id'],
							type: 'inner'
						}
					],
					where: {
						id: 20
					},
					limit: 1
				},
				result: {
					error: null,
					sql: 'SELECT `test_table1`.*, `test_table2`.* FROM `test_table1` INNER JOIN `test_table2` ON `test_table2`.`ref_id` = `test_table1`.`id` WHERE `id` = ? LIMIT 0,1',
					params: [20]
				}
			},

			{
				options: {
					table: 'test_table1',
					joins: [
						{
							table: 'test_table2',
							on: ['test_table2.ref_id', 'test_table1.id'],
							type: 'outer'
						}
					],
					where: {
						id: 20
					},
					limit: 1
				},
				result: {
					error: null,
					sql: 'SELECT `test_table1`.*, `test_table2`.* FROM `test_table1` OUTER JOIN `test_table2` ON `test_table2`.`ref_id` = `test_table1`.`id` WHERE `id` = ? LIMIT 0,1',
					params: [20]
				}
			},

			{
				options: {
					table: 'test_table1',
					joins: [
						{
							table: 'test_table2',
							as: 't2',
							on: ['t2.ref_id', 'test_table1.id'],
							type: 'left'
						}
					],
					where: {
						id: 20
					},
					limit: 1
				},
				result: {
					error: null,
					sql: 'SELECT `test_table1`.*, `t2`.* FROM `test_table1` LEFT JOIN `test_table2` AS `t2` ON `t2`.`ref_id` = `test_table1`.`id` WHERE `id` = ? LIMIT 0,1',
					params: [20]
				}
			},

			{
				options: {
					table: 'test_table1',
					joins: [
						{
							table: 'test_table2',
							as: 't2',
							on: ['t2.ref_id', 'test_table1.id'],
							type: 'left'
						},
						{
							table: 'test_table3',
							as: 't3',
							on: ['t3.some_id', 'test_table1.id'],
							type: 'left'
						}
					],
					where: {
						id: 20
					},
					limit: 1
				},
				result: {
					error: null,
					sql: 'SELECT `test_table1`.*, `t2`.*, `t3`.* FROM `test_table1` LEFT JOIN `test_table2` AS `t2` ON `t2`.`ref_id` = `test_table1`.`id` LEFT JOIN `test_table3` AS `t3` ON `t3`.`some_id` = `test_table1`.`id` WHERE `id` = ? LIMIT 0,1',
					params: [20]
				}
			}

		]

		for (var i in PreComputed)
			(function(options, result) {

				it('should return the expected results', function(done) {

					MySQLDriver.buildFindQuery(options, function(error, sql, params) {

						expect(error).to.equal(result.error)
						expect(sql).to.equal(result.sql)
						expect(params).to.deep.equal(result.params)

						done()

					})

				})

			})(PreComputed[i].options, PreComputed[i].result)

	})

	describe('find(options)', function() {

		before(TestManager.tearDown)
		before(TestManager.setUp)
		after(TestManager.tearDown)

		var fixtures = require('../../../../fixtures')
		var tables = _.keys(fixtures)

		it('should return an error when no table is specified', function(done) {

			MySQLDriver.find().complete(function(error, results) {

				expect(error).to.not.equal(null)
				expect(results).to.equal(null)

				done()

			})

		})

		it('should return an empty array of results when there are no rows in the table', function(done) {

			var options = {}

			options.table = tables[0]

			MySQLDriver.find(options).complete(function(error, results) {

				expect(error).to.equal(null)
				expect(results).to.have.length(0)

				done()

			})

		})

		it('should return the correct row', function(done) {

			async.eachSeries(tables, function(table, nextTable) {

				async.eachSeries(fixtures[table], function(data, nextFixture) {

					var options = {}

					options.table = table

					MySQLDriver.create(data, options).complete(function(errors, insert_id) {

						if (errors)
						{
							console.log(errors)

							return nextFixture(new Error('An unexpected error has occurred'))
						}

						var options = {}

						options.table = table
						options.where = {id: insert_id}
						options.limit = 1

						MySQLDriver.find(options).complete(function(error, results) {

							expect(error).to.equal(null)
							expect(results).to.not.equal(null)
							expect(results).to.be.an('array')
							expect(results).to.have.length(1)

							var row = results[0]

							for (var name in data)
								if (name != 'created_at' && name != 'updated_at')
									expect(row[name]).to.equal(data[name])

							nextFixture()

						})

					})

				}, nextTable)

			}, done)

		})

		it('should return all rows', function(done) {

			async.eachSeries(tables, function(table, nextTable) {

				var num_rows = fixtures[table].length

				var options = {}

				options.table = table
				options.order_by = 'id ASC'

				MySQLDriver.find(options).complete(function(error, results) {

					expect(error).to.equal(null)
					expect(results).to.not.equal(null)
					expect(results).to.be.an('array')
					expect(results).to.have.length(num_rows)

					for (var i in results)
					{
						var row = results[i]
						var data = fixtures[table][i]

						for (var name in data)
							if (name != 'created_at' && name != 'updated_at')
								expect(row[name]).to.equal(data[name])
					}

					nextTable()

				})

			}, done)

		})

		it('should return joined data as expected', function(done) {

			var table1 = tables[0]
			var table2 = tables[1]

			var options = {}

			options.table = table1
			options.joins = [
				{
					table: table2,
					on: [table2 + '.ref_id', table1 + '.id'],
					type: 'left'
				}
			]
			options.order_by = table1 + '.id ASC'

			MySQLDriver.find(options).complete(function(error, results) {

				expect(error).to.equal(null)
				expect(results).to.not.equal(null)
				expect(results).to.be.an('array')
				expect(results).to.have.length(fixtures[table1].length)

				for (var i in results)
				{
					var row = results[i]
					var data1 = fixtures[table1][i]
					var data2 = fixtures[table2][i]

					for (var name in data1)
						if (name != 'created_at' && name != 'updated_at')
							expect(row[name]).to.equal(data1[name])

					expect(row[table2]).to.not.equal(undefined)
					expect(row[table2]).to.be.an('object')

					for (var name in data2)
						if (name != 'created_at' && name != 'updated_at')
							expect(row[table2][name]).to.equal(data2[name])
				}

				done()

			})

		})

	})

})