var Instance = require('../../../../lib/instance')

var async = require('async')
var expect = require('chai').expect


describe('Model#hooks', function() {

	before(TestManager.tearDown)
	before(TestManager.setUp)
	after(TestManager.tearDown)

	describe('clearHooks()', function() {

		it('should clear all hooks', function(done) {

			var model = sequel.define('HooksClearHooksTest', {

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
			var hooks = ['beforeValidate', 'afterValidate', 'beforeCreate', 'afterCreate']

			for (var n = 0; n < num_callbacks; n++)
				for (var i in hooks)
					model.addHook(hooks[i], function() {})

			// This should clear all hooks.
			model.clearHooks()

			for (var i in hooks)
				expect(model.hooks[hooks[i]]).to.have.length(0)

			done()

		})

	})

})

