var Instance = require('../../../../lib/instance')

var async = require('async')
var chai = require('chai')
var expect = chai.expect

var drivers = require('../../../drivers')

for (var i in drivers) (function(sequel, TestManager) {

describe('Model#hooks', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	describe('clearHook(name)', function() {

		it('should throw an error when clearing an invalid hook', function() {

			var model = sequel.define('HooksClearHookInvalidHookTest', {

				id: {
					type: 'integer',
					autoIncrement: true,
					primaryKey: true
				},
				name: 'text'

			}, {

				tableName: 'does_not_exist'

			})

			var thrownError

			try {

				model.clearHook('beforeAnInvalidHook')

			} catch (error) {

				thrownError = error

			} finally {

				expect(thrownError).to.not.equal(undefined)
				expect(thrownError instanceof Error).to.equal(true)

			}

		})

		it('should clear only the hook specified by \'name\'', function(done) {

			var hooks = ['beforeValidate', 'afterValidate', 'beforeCreate', 'afterCreate']

			async.each(hooks, function(hook, nextHook) {

				var model = sequel.define('HooksClearHookTest', {

					id: {
						type: 'integer',
						autoIncrement: true,
						primaryKey: true
					},
					name: 'text'

				}, {

					tableName: 'does_not_exist'
				})

				var num_callbacks = 5

				for (var n = 0; n < num_callbacks; n++)
					for (var i in hooks)
						model.addHook(hooks[i], function() {})

				// This should clear only the one hook.
				model.clearHook(hook)

				for (var i in hooks)
					if (hooks[i] == hook)
						expect(model.hooks[hooks[i]]).to.have.length(0)
					else
						expect(model.hooks[hooks[i]]).to.have.length(num_callbacks)

				nextHook()

			}, done)

		})
		
	})

})

})(drivers[i].sequel, drivers[i].TestManager)