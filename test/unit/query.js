var modeler = require('../modeler')
var connection = modeler.connection
var Query = require('../../lib/query')(connection)
var TestManager = require('../test-manager')

var _ = require('underscore')
var async = require('async')
var chai = require('chai')
var expect = chai.expect
var mysql = require('mysql')


describe('Query', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)


	var data = require('../fixtures')

	var table1 = 'test_table_1'
	var table2 = 'test_table_2'

	it('should be an object', function() {

		expect(Query).to.be.an('object')

	})

	describe('Insert(data, options)', function() {

		it('should be a method', function() {

			expect(typeof Query.Insert).to.equal('function')

		})

		it('should return an error when missing \'table\' option', function(done) {

			Query.Insert(data[table1][0]).complete(function(error, insert_id) {

				if (!error)
					return done(new Error('Expected an error'))

				done()

			})

		})

		it('should succeed when given valid \'data\' and \'options\'', function(done) {

			async.each([table1, table2], function(table, next) {

				var num_records = 0

				async.timesSeries(data[table].length, function(i, next2) {

					var row = data[table][i]

					var options = {}

					options.table = table

					Query.Insert(row, options).complete(function(error, insert_id) {

						if (error)
							return next2(error)

						num_records++

						data[table][i] = _.extend({id: insert_id}, data[table][i])

						var sql = 'SELECT COUNT(`id`) FROM ' + mysql.escapeId(table)

						connection.query(sql, function(error, results) {

							if (error)
								return next2(error)

							var count = results[0]['COUNT(`id`)']

							expect(count).to.equal(num_records)

							next2()

						})

					})

				}, next)

			}, function(error) {

				if (error)
					return done(new Error(error))

				done()

			})

		})

	})

	describe('Select(options)', function() {

		it('should be a method', function() {

			expect(typeof Query.Select).to.equal('function')

		})

		it('should return an error when missing \'table\' option', function(done) {

			Query.Select().complete(function(error, rows) {

				if (!error)
					return done(new Error('Expected an error'))

				done()

			})

		})

		it('should return all rows', function(done) {

			Query.Select({

				table: table1

			})
				.complete(function(error, rows) {

					if (error)
						return done(error)

					var expected = []

					expected = _.clone(data[table1])

					expect(rows.length).to.equal(expected.length)
					expect(rows).to.deep.equal(expected)

					done()

				})

		})

		it('should return rows in the correct order', function(done) {

			var expected = []

			expected = _.clone(data[table1])

			expected.sort(function(row1, row2) {

				return row2.value1 - row1.value1

			})

			Query.Select({

				table: table1,
				order: 'value1 DESC'

			})
				.complete(function(error, rows) {

					if (error)
						return done(error)

					expect(rows).to.deep.equal(expected)

					done()

				})

		})

		it('should return the correct rows when a limit is specified', function(done) {

			async.timesSeries(data[table1].length, function(i, next) {

				var limit = i + 1

				var expected = []

				expected = _.clone(data[table1].slice(0, limit))

				Query.Select({

					table: table1,
					limit: limit

				})
					.complete(function(error, rows) {

						if (error)
							return next(error)

						expect(rows).to.deep.equal(expected)

						next()

					})

			}, function(error) {

				if (error)
					return done(new Error(error))

				done()

			})

		})

		it('should return the correct rows when a limit and an offset are specified', function(done) {

			async.timesSeries(data[table1].length, function(i, next) {

				var limit = i + 1
				var offset = limit - 1

				var expected = []

				expected = _.clone(data[table1].slice(offset, limit + offset))

				Query.Select({

					table: table1,
					limit: limit,
					offset: offset

				})
					.complete(function(error, rows) {

						if (error)
							return next(error)

						expect(rows).to.deep.equal(expected)

						next()

					})

			}, function(error) {

				if (error)
					return done(new Error(error))

				done()

			})

		})

		it('should return the rows that satisify the \'where\' option', function(done) {

			var expected = []

			var value2 = 50

			for (var i in data[table1])
				if (data[table1][i].value2 == value2)
					expected.push(_.clone(data[table1][i]))

			Query.Select({

				table: table1,
				where: {
					value2: value2
				}

			})
				.complete(function(error, rows) {

					if (error)
						return done(error)

					expect(rows).to.deep.equal(expected)

					done()

				})

		})

		var tryOperators = ['gt', 'gte', 'lt', 'lte', 'ne']

		for (var i in tryOperators)
			(function(operator) {

				it('should return the rows that satisify the \'where\' option; using the \'' + operator + '\' operator', function(done) {

					var expected = []

					var value2 = 50

					for (var i in data[table1])
						switch (operator)
						{
							case 'gt':

								if (data[table1][i].value2 > value2)
									expected.push(_.clone(data[table1][i]))

							break

							case 'gte':

								if (data[table1][i].value2 >= value2)
									expected.push(_.clone(data[table1][i]))

							break

							case 'lt':

								if (data[table1][i].value2 < value2)
									expected.push(_.clone(data[table1][i]))

							break

							case 'lte':

								if (data[table1][i].value2 <= value2)
									expected.push(_.clone(data[table1][i]))

							break

							case 'ne':

								if (data[table1][i].value2 != value2)
									expected.push(_.clone(data[table1][i]))

							break
						}

					var where = {}

					where.value2 = {}
					where.value2[operator] = value2

					Query.Select({

						table: table1,
						where: where

					})
						.complete(function(error, rows) {

							if (error)
								return done(error)

							expect(rows).to.deep.equal(expected)

							done()

						})

				})

			})(tryOperators[i])

		it('should return associated data when the \'include\' option is specified', function(done) {

			var expected = []

			for (var i in data[table1])
			{
				var row = _.clone(data[table1][i])

				row[table2] = _.clone(data[table2][i])

				expected.push(row)
			}

			Query.Select({

				table: table1,
				include: [
					{
						table: table2,
						on: [table2 + '.ref_id', table1 + '.id'],
						join: 'left'
					}
				]

			})
				.complete(function(error, rows) {

					if (error)
						return done(error)

					expect(rows).to.deep.equal(expected)

					done()

				})

		})

		it('should correctly assign the associated data when using the \'as\' attribute within an \'include\'', function(done) {

			var as = 'other'

			var expected = []

			for (var i in data[table1])
			{
				var row = _.clone(data[table1][i])

				row[as] = _.clone(data[table2][i])

				expected.push(row)
			}

			Query.Select({

				table: table1,
				include: [
					{
						table: table2,
						as: as,
						on: [as + '.ref_id', table1 + '.id'],
						join: 'left'
					}
				]

			})
				.complete(function(error, rows) {

					if (error)
						return done(error)

					expect(rows).to.deep.equal(expected)

					done()

				})

		})

	})

	describe('Update(data, options)', function() {

		it('should be a method', function() {

			expect(typeof Query.Update).to.equal('function')

		})

		it('should correctly update an individual row', function(done) {

			var row = _.clone(data[table1][2])

			var expected = []

			expected = _.clone(row)
			expected.value1 = 2

			Query.Update({value1: expected.value1}, {

				table: table1,
				where: {
					id: row.id
				},
				limit: 1

			})
				.complete(function(error) {

					if (error)
						return done(error)

					Query.Select({

						table: table1,
						where: {
							id: row.id
						},
						limit: 1

					})
						.complete(function(error, rows) {

							if (error)
								return done(error)

							expect(rows[0]).to.deep.equal(expected)

							done()

						})

				})

		})

		it('should correctly update all rows', function(done) {

			var expected = []

			expected = _.clone(data[table1])

			value1 = 46

			for (var i in expected)
				expected[i].value1 = value1

			Query.Update({value1: value1}, {

				table: table1

			})
				.complete(function(error) {

					if (error)
						return done(error)

					Query.Select({

						table: table1

					})
						.complete(function(error, rows) {

							if (error)
								return done(error)

							expect(rows).to.deep.equal(expected)

							done()

						})

				})

		})

	})

	describe('Count(options)', function() {

		it('should be a method', function() {

			expect(typeof Query.Count).to.equal('function')

		})

		it('should return the correct total number of rows for the table', function(done) {

			Query.Count({

				table: table1

			})
				.complete(function(error, count) {

					if (error)
						return done(error)

					expect(count).to.equal(data[table1].length)

					done()

				})

		})

		it('should return the correct total number of rows that satisify the \'where\' option', function(done) {

			var expected = []

			var value2 = 50

			for (var i in data[table1])
				if (data[table1][i].value2 == value2)
					expected.push(_.clone(data[table1][i]))

			Query.Count({

				table: table1,
				where: {
					value2: value2
				}

			})
				.complete(function(error, count) {

					if (error)
						return done(error)

					expect(count).to.equal(expected.length)

					done()

				})

		})

	})

	describe('Delete(options)', function() {

		it('should be a method', function() {

			expect(typeof Query.Delete).to.equal('function')

		})

		it('should delete only the rows that satisfy the \'where\' option', function(done) {

			var expected = []

			var value2 = 50

			for (var i in data[table1])
				if (data[table1][i].value2 != value2)
					expected.push(_.clone(data[table1][i]))

			Query.Delete({

				table: table1,
				where: {
					value2: value2
				}

			})
				.complete(function(error) {

					if (error)
						return done(error)

					Query.Select({

						table: table1,
						where: {
							value2: {
								ne: value2
							}
						}

					})
						.complete(function(error, rows) {

							if (error)
								return done(error)

							expect(rows).to.deep.equal(expected)

							done()

						})

				})

		})

		it('should delete all remaining rows', function(done) {

			Query.Delete({

				table: table1

			})
				.complete(function(error) {

					if (error)
						return done(error)

					Query.Count({

						table: table1

					})
						.complete(function(error, count) {

							if (error)
								return done(error)

							expect(count).to.equal(0)

							done()

						})

				})

		})

	})

})