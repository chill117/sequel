var DefaultOptions = {
	locale: 'en',
	langDir: __dirname
}

var Lang = function(options) {

	this.options = options || {}

	this.initialize()

}

Lang.prototype.initialize = function() {

	this.setDefaultOptions()

}

Lang.prototype.setDefaultOptions = function() {

	for (var name in DefaultOptions)
		if (typeof this.options[name] == 'undefined')
			this.options[name] = DefaultOptions[name]

}

Lang.prototype.get = function(group, key) {

	var contents = this.getContentsOfLangFile(group)
	var langString = !!contents[key] ? contents[key] : ''

	var additionalArgs = Array.prototype.slice.call(arguments).slice(2)

	if (langString.indexOf('%s') != -1)
		while (additionalArgs.length)
			langString = langString.replace('%s', additionalArgs.shift())

	return langString

}

Lang.prototype.getContentsOfLangFile = function(group) {

	var file = this.options.langDir + '/' + this.options.locale + '/' + group + '.js'

	return require(file)

}

module.exports = Lang