var expect = require('chai').expect
var Validation = require('../drivers/mysql/sequel').validation


describe('Validation', function() {

	describe('notEmpty', function() {

		it('should exist', function() {

			expect(Validation.testExists('notEmpty')).to.equal(true)

		})

		it('should pass', function() {

			expect(Validation.test('notEmpty', ' hi')).to.equal(true)
			expect(Validation.test('notEmpty', 'there !')).to.equal(true)
			expect(Validation.test('notEmpty', "\n with a linebreak")).to.equal(true)

		})

		it('should fail', function() {

			expect(Validation.test('notEmpty', ' ')).to.equal(false)
			expect(Validation.test('notEmpty', '   ')).to.equal(false)
			expect(Validation.test('notEmpty', "\n ")).to.equal(false)
			expect(Validation.test('notEmpty', "\t ")).to.equal(false)

		})

	})

	describe('notNull', function() {

		it('should exist', function() {

			expect(Validation.testExists('notNull')).to.equal(true)

		})

		it('should pass', function() {

			expect(Validation.test('notNull', 0)).to.equal(true)
			expect(Validation.test('notNull', 200)).to.equal(true)
			expect(Validation.test('notNull', new Date())).to.equal(true)
			expect(Validation.test('notNull', 'hi!')).to.equal(true)
			expect(Validation.test('notNull', ' ')).to.equal(true)

		})

		it('should fail', function() {

			expect(Validation.test('notNull', '')).to.equal(false)
			expect(Validation.test('notNull', null)).to.equal(false)

		})

	})

	describe('notIn', function() {

		it('should exist', function() {

			expect(Validation.testExists('notIn')).to.equal(true)

		})

		it('should pass', function() {

			expect(Validation.test('notIn', 0, [1, 2, 3, 4, 6])).to.equal(true)
			expect(Validation.test('notIn', 'hi', [1, 2, 3, 4, 6])).to.equal(true)
			expect(Validation.test('notIn', ' ', ['hi', 'there', 'friend'])).to.equal(true)
			expect(Validation.test('notIn', 2, ['hi', 'there', 'friend'])).to.equal(true)

		})

		it('should fail', function() {

			expect(Validation.test('notIn', 4, [1, 2, 3, 4, 6])).to.equal(false)
			expect(Validation.test('notIn', 3, [1, 2, 3, 4, 6])).to.equal(false)
			expect(Validation.test('notIn', 'hi', ['hi', 'there', 'friend'])).to.equal(false)
			expect(Validation.test('notIn', 'there', ['hi', 'there', 'friend'])).to.equal(false)

		})

	})

	describe('isIn', function() {

		it('should exist', function() {

			expect(Validation.testExists('isIn')).to.equal(true)

		})

		it('should pass', function() {

			expect(Validation.test('isIn', 4, [1, 2, 3, 4, 6])).to.equal(true)
			expect(Validation.test('isIn', 3, [1, 2, 3, 4, 6])).to.equal(true)
			expect(Validation.test('isIn', 'hi', ['hi', 'there', 'friend'])).to.equal(true)
			expect(Validation.test('isIn', 'there', ['hi', 'there', 'friend'])).to.equal(true)

		})

		it('should fail', function() {

			expect(Validation.test('isIn', 0, [1, 2, 3, 4, 6])).to.equal(false)
			expect(Validation.test('isIn', 'hi', [1, 2, 3, 4, 6])).to.equal(false)
			expect(Validation.test('isIn', ' ', ['hi', 'there', 'friend'])).to.equal(false)
			expect(Validation.test('isIn', 2, ['hi', 'there', 'friend'])).to.equal(false)

		})

	})

	describe('isDecimal', function() {

		it('should exist', function() {

			expect(Validation.testExists('isDecimal')).to.equal(true)

		})

		it('should pass', function() {

			expect(Validation.test('isDecimal', 0.1)).to.equal(true)
			expect(Validation.test('isDecimal', 0.102)).to.equal(true)
			expect(Validation.test('isDecimal', 100.10)).to.equal(true)

		})

		it('should fail', function() {

			expect(Validation.test('isDecimal', '')).to.equal(false)
			expect(Validation.test('isDecimal', 'hi')).to.equal(false)
			expect(Validation.test('isDecimal', null)).to.equal(false)
			expect(Validation.test('isDecimal', false)).to.equal(false)
			expect(Validation.test('isDecimal', undefined)).to.equal(false)
			expect(Validation.test('isDecimal', true)).to.equal(false)

		})

	})

	describe('isNumber', function() {

		it('should exist', function() {

			expect(Validation.testExists('isNumber')).to.equal(true)

		})

		it('should pass', function() {

			expect(Validation.test('isNumber', 0.1)).to.equal(true)
			expect(Validation.test('isNumber', 0.102)).to.equal(true)
			expect(Validation.test('isNumber', 0)).to.equal(true)
			expect(Validation.test('isNumber', 22)).to.equal(true)

		})

		it('should fail', function() {

			expect(Validation.test('isNumber', '')).to.equal(false)
			expect(Validation.test('isNumber', 'hi')).to.equal(false)
			expect(Validation.test('isNumber', "\n")).to.equal(false)
			expect(Validation.test('isNumber', null)).to.equal(false)
			expect(Validation.test('isNumber', false)).to.equal(false)
			expect(Validation.test('isNumber', undefined)).to.equal(false)
			expect(Validation.test('isNumber', true)).to.equal(false)

		})

	})

	describe('min', function() {

		it('should exist', function() {

			expect(Validation.testExists('min')).to.equal(true)

		})

		it('should pass', function() {

			expect(Validation.test('min', 10, 10)).to.equal(true)
			expect(Validation.test('min', 200, 10)).to.equal(true)

		})

		it('should fail', function() {

			expect(Validation.test('min', 0, 10)).to.equal(false)
			expect(Validation.test('min', 9, 10)).to.equal(false)

		})

	})

	describe('max', function() {

		it('should exist', function() {

			expect(Validation.testExists('max')).to.equal(true)

		})

		it('should pass', function() {

			expect(Validation.test('max', 0, 10)).to.equal(true)
			expect(Validation.test('max', 10, 10)).to.equal(true)

		})

		it('should fail', function() {

			expect(Validation.test('max', 11, 10)).to.equal(false)
			expect(Validation.test('max', 200, 10)).to.equal(false)

		})

	})

	describe('minLen', function() {

		it('should exist', function() {

			expect(Validation.testExists('minLen')).to.equal(true)

		})

		it('should pass', function() {

			expect(Validation.test('minLen', 'hi!', 3)).to.equal(true)
			expect(Validation.test('minLen', ' ', 1)).to.equal(true)

		})

		it('should fail', function() {

			expect(Validation.test('minLen', 'hi', 3)).to.equal(false)
			expect(Validation.test('minLen', 'friend', 10)).to.equal(false)

		})

	})

	describe('maxLen', function() {

		it('should exist', function() {

			expect(Validation.testExists('minLen')).to.equal(true)

		})

		it('should pass', function() {

			expect(Validation.test('maxLen', 'hi', 3)).to.equal(true)
			expect(Validation.test('maxLen', 'friend', 10)).to.equal(true)

		})

		it('should fail', function() {

			expect(Validation.test('maxLen', 'hi!!', 3)).to.equal(false)
			expect(Validation.test('maxLen', '  ', 1)).to.equal(false)

		})

	})

	describe('precision', function() {

		it('should exist', function() {

			expect(Validation.testExists('precision')).to.equal(true)

		})

		it('should pass', function() {

			expect(Validation.test('precision', 10, 4)).to.equal(true)
			expect(Validation.test('precision', 0.12, 4)).to.equal(true)
			expect(Validation.test('precision', 0.0001, 4)).to.equal(true)
			expect(Validation.test('precision', null, 4)).to.equal(true)
			expect(Validation.test('precision', false, 4)).to.equal(true)
			expect(Validation.test('precision', 'sometext', 4)).to.equal(true)

		})

		it('should fail', function() {

			expect(Validation.test('precision', 1.00001, 4)).to.equal(false)
			expect(Validation.test('precision', 0.00003333333, 4)).to.equal(false)

		})

	})

})

