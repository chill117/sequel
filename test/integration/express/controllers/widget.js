var app = require('../app')
var Widget = require('../models/widget')

app.get('/widget/:id', function(req, res) {

	var id = req.params['id'] || null

	if (!id)
		// ID required.
		return res.send(400)

	Widget.find(id).complete(function(error, widget) {

		if (error)
		{
			console.log(error)

			return res.json(500, 'An unexpected error has occurred')
		}

		if (!widget)
			return res.json(404, 'Widget not found')

		res.json(200, widget.data)

	})

})

app.post('/widget', function(req, res) {

	var name = req.body.name || ''
	var description = req.body.description || ''

	// Perform processing here.
	// You don't need to escape the values before using them with the model.

	Widget.create({
		name: name,
		description: description
	})
		.complete(function(errors, widget) {

			if (errors)
				return res.json(400, errors)

			// If we get here, the widget was created.
			res.json(200, widget.data)

		})

})