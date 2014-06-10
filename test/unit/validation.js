var chai = require('chai')
var expect = chai.expect

var drivers = require('../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Validation', function() {

	var Validation

	before(function() {

		Validation = sequel.validation

	})

	describe('#customFunctions', function() {

		var customFunctions = {

			notEmpty: [
				{
					pass: [
						' hi',
						'there !',
						"\n with a linebreak"
					],
					fail: [
						" ",
						"\n ",
						" \t",
						" \t "
					]
				}
			],

			notNull: [
				{
					pass: [
						0,
						200,
						300.22,
						new Date(),
						'hi!'
					],
					fail: [
						null,
						''
					]
				}
			],

			notIn: [
				{
					args: [1, 2, 3, 4, 6],
					pass: [ 0, 5, 200 ],
					fail: [ 1, 2, 3, 6 ]
				},
				{
					args: ['hi', 'there', 'friend'],
					pass: [ 1, 2, 3, 6, 'howdy' ],
					fail: [ 'hi', 'there', 'friend' ]
				}
			],

			isIn: [
				{
					args: [1, 2, 3, 4, 6],
					pass: [ 1, 2, 3, 6 ],
					fail: [ 0, 5, 200 ]
				},
				{
					args: ['hi', 'there', 'friend'],
					pass: [ 'hi', 'there', 'friend' ],
					fail: [ 1, 2, 3, 6, 'howdy' ]
				}
			],

			isDecimal: [
				{
					pass: [ 0.12, 15.1, 200.00002 ],
					fail: [ 1, 2, 3, 6, '', 'hi', undefined, null, true, false ]
				}
			],

			isNumber: [
				{
					pass: [ 1, 2, 3, 6, 0.12, 15.1, 200.00002 ],
					fail: [ '', 'hi', undefined, null, true, false ]
				}
			],

			min: [
				{
					args: 10,
					pass: [ 12, 26, 200 ],
					fail: [ 0, 5, 9 ]
				}
			],

			max: [
				{
					args: 10,
					pass: [ 0, 5, 9 ],
					fail: [ 12, 26, 200 ]
				}
			],

			minLen: [
				{
					args: 8,
					pass: [
						'this should be long enough',
						'password',
						'testing!',
						' testing',
						'testing '
					],
					fail: [
						'almost!',
						'nope',
						' nope',
						'nope ',
						'',
						' '
					]
				}
			],

			maxLen: [
				{
					args: 8,
					pass: [
						'almost!',
						'nope',
						' nope',
						'nope ',
						'',
						' '
					],
					fail: [
						'this should be too long',
						' password ',
						'! testing! ',
						' #testing ',
						'09 testing  '
					]
				}
			],

			precision: [
				{
					args: 4,
					pass: [ 10, 0.12, 15.1, 200.0002 ],
					fail: [ 1.00001, 1000.05001, 0.00003333333 ]
				}
			]

		}

		for (var fn in customFunctions)
			it('\'' + fn + '\' should exist', function() {

				expect(Validation.testExists(fn)).to.equal(true)

			})

		for (var fn in customFunctions)
			it('\'' + fn + '\' should pass as expected', function() {

				var testCases = customFunctions[fn]

				for (var i in testCases)
				{
					var testCase = testCases[i]
					var args = testCase.args || []
					var pass = testCase.pass

					for (var i in pass)
					{
						var value = pass[i]

						var result = Validation.test(fn, value, args)

						expect(result).to.equal(true)
					}
				}

			})

		for (var fn in customFunctions)
			it('\'' + fn + '\' should fail as expected', function() {

				var testCases = customFunctions[fn]

				for (var i in testCases)
				{
					var testCase = testCases[i]
					var args = testCase.args || []
					var fail = testCase.fail

					for (var i in fail)
					{
						var value = fail[i]
						var result = Validation.test(fn, value, args)

						expect(result).to.equal(false)
					}
				}

			})

		for (var fn in customFunctions)
			it('\'' + fn + '\' should have a default error message', function() {

				var errorMessage = Validation.getError(fn)

				expect(errorMessage).to.be.a('string')
				expect(errorMessage.length).to.not.equal(0)

			})

	})

})

})(drivers[i].sequel, drivers[i].TestManager)