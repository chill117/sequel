var driver = require('../../../../drivers/mysql')
var TestManager = driver.TestManager
var MySQLDriver = driver.sequel.db

var _ = require('underscore')
var async = require('async')
var expect = require('chai').expect


describe('MySQLDriver', function() {

	describe('buildCreateQuery(data, options, cb)', function() {

		var PreComputed = [

			{
				data: {
					name: 'A name',
					value1: 2,
					value2: 200,
					value3: 505
				},
				options: {
					table: 'test_table'
				},
				result: {
					error: null,
					sql: 'INSERT INTO `test_table` SET ?',
					params: {
						name: 'A name',
						value1: 2,
						value2: 200,
						value3: 505
					}
				}
			}

		]

		for (var i in PreComputed)
			(function(data, options, result) {

				it('should return the expected results', function(done) {

					MySQLDriver.buildCreateQuery(data, options, function(error, sql, params) {

						expect(error).to.equal(result.error)
						expect(sql).to.equal(result.sql)
						expect(params).to.deep.equal(result.params)

						done()

					})

				})

			})(PreComputed[i].data, PreComputed[i].options, PreComputed[i].result)

	})

	describe('create(data, options)', function() {

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

					MySQLDriver.create(undefined, {table: tables[0]}).complete(function(error, insert_id) {

						expect(error).to.not.equal(null)
						expect(insert_id).to.equal(null)

						next()

					})

				},

				function(next) {

					MySQLDriver.create({}, {table: tables[0]}).complete(function(error, insert_id) {

						expect(error).to.not.equal(null)
						expect(insert_id).to.equal(null)

						next()

					})

				}

			], done)

		})

		it('should return an error when no table is specified', function(done) {

			var data = fixtures[tables[0]][0]

			MySQLDriver.create(data).complete(function(error, insert_id) {

				expect(error).to.not.equal(null)
				expect(insert_id).to.equal(null)

				done()

			})

		})

		it('should insert each fixture into the database successfully', function(done) {

			async.eachSeries(tables, function(table, nextTable) {

				async.eachSeries(fixtures[table], function(data, nextFixture) {

					MySQLDriver.create(data, {table: table}).complete(function(errors, insert_id) {

						expect(errors).to.equal(null)
						expect(insert_id).to.not.equal(null)

						nextFixture()

					})

				}, nextTable)

			}, done)

		})

	})

})