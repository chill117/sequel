var drivers = require('../../../../drivers')
var TestManager = drivers.mysql.TestManager
var MySQLDriver = drivers.mysql.sequel.db

var _ = require('underscore')
var async = require('async')
var chai = require('chai')
var expect = chai.expect


describe('MySQLDriver', function() {

	describe('buildCountQuery(options, cb)', function() {

		var PreComputed = [

			{
				options: {table: 'test_table'},
				result: {
					error: null,
					sql: 'SELECT COUNT(*) FROM `test_table`',
					params: []
				}
			},

			{
				options: {
					table: 'test_table',
					where: {
						id: 1
					}
				},
				result: {
					error: null,
					sql: 'SELECT COUNT(*) FROM `test_table` WHERE `id` = ?',
					params: [1]
				}
			},

			{
				options: {
					table: 'test_table',
					where: {
						id: [1, 2, 3]
					}
				},
				result: {
					error: null,
					sql: 'SELECT COUNT(*) FROM `test_table` WHERE `id` IN (?)',
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
					sql: 'SELECT COUNT(*) FROM `test_table` WHERE `value1` > ? AND `value1` <= ?',
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
					sql: 'SELECT COUNT(*) FROM `test_table` WHERE `value1` > ? AND `value1` <= ? GROUP BY `id`',
					params: [0, 100]
				}
			}

		]

		for (var i in PreComputed)
			(function(options, result) {

				it('should return the expected results', function(done) {

					MySQLDriver.buildCountQuery(options, function(error, sql, params) {

						expect(error).to.equal(result.error)
						expect(sql).to.equal(result.sql)
						expect(params).to.deep.equal(result.params)

						done()

					})

				})

			})(PreComputed[i].options, PreComputed[i].result)

	})

	describe('count(options)', function() {

		before(TestManager.tearDown)
		before(TestManager.setUp)
		after(TestManager.tearDown)

		var fixtures = {
			'test_table_1': require('../../../../fixtures/test_table_1'),
			'test_table_2': require('../../../../fixtures/test_table_2')
		}

		it('should return an error when no table is specified', function(done) {

			MySQLDriver.count().complete(function(error, count) {

				expect(error).to.not.equal(null)
				expect(count).to.equal(null)

				done()

			})

		})

		it('should return the correct row count', function(done) {

			var tables = _.keys(fixtures)

			async.eachSeries(tables, function(table, nextTable) {

				var num_created = 0

				async.eachSeries(fixtures[table], function(data, nextFixture) {

					var options = {}

					options.table = table

					MySQLDriver.create(data, options).complete(function(errors, insert_id) {

						if (errors)
						{
							console.log(errors)

							return nextFixture(new Error('An unexpected error has occurred'))
						}

						num_created++

						var options = {}

						options.table = table

						MySQLDriver.count(options).complete(function(error, count) {

							if (error)
								return nextFixture(new Error(error))

							expect(count).to.equal(num_created)

							nextFixture()

						})

					})

				}, nextTable)

			}, done)

		})

	})

})