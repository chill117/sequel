# db-modeler

A Database Modeler for Node.


## Warning

This module is still under active development. Core functionality is likely to change.


## Installation

Add `db-modeler` to your project's `package.json` file:
```
{
  "name": "Your App",
  "dependencies": {
    "db-modeler": "latest"
  }
}
```
*It is recommended that you specify a hard-coded version number instead of `latest`*

*See https://npmjs.org/package/db-modeler for the latest release version*


Then install it by running the following:
```
npm install
```


## Basic Usage

Instantiating the modeler:
```
var DbModeler = require('db-modeler')

var options = {
	host: 'localhost',
	port: 3306,
	user: 'db_user',
	password: 'its_password',
	database: 'db_name'
}

var modeler = new DbModeler(options)
```

Defining a model:
```
var Widget = modeler.define('Widget', {

	id: {
		type: 'integer',
		autoIncrement: true,
		primaryKey: true
	},
	name: {
		type: 'text',
		validate: {
			notEmpty: true,
			maxLen
		}
	}

}, {

	tableName: 'widgets'

})
```

Using the model to create a new instance:
```
Widget.create({
	name: 'Our First Widget'
})
	.complete(function(errors, widget) {

		if (errors)
			return console.log(errors)

		console.log('Created a new widget:')
		console.log(widget)

	})
```

Retrieve the instance we just created, by its name:
```
Widget.find({
	where: {
		name: 'Our First Widget'
	}
})
	.complete(function(error, widget) {

		if (error)
			return consoe.log(error)

		if (!widget)
			return console.log('Widget not found!')

		console.log('Found the widget:')
		console.log(widget)

	})
```


## Features

### Validation

Validation rules are run before an instance is saved to the database. Validation errors are returned as an object.

For example, given the following model:
```
var Widget = modeler.define('Widget', {

	id: {
		type: 'integer',
		autoIncrement: true,
		primaryKey: true
	},
	name: {
		type: 'text',
		validate: {
			notEmpty: true
		}
	}

}, {

	tableName: 'widgets'

	})
```

And, if we attempt to create a new widget with no name:
```
Widget.create({}).complete(function(errors, widget) {
	
	/*
		We would expect the 'errors' to look like this:

		{ name: ['Expected non-empty string'] }

		And, 'widget' will equal NULL when the create failed.
	*/

})
```

It's also possible to set a custom error message for each validation rule:
```
var Widget = modeler.define('Widget', {

	id: {
		type: 'integer',
		autoIncrement: true,
		primaryKey: true
	},
	name: {
		type: 'text',
		validate: {
			notEmpty: {
				msg: 'This is a custom error message'
			}
		}
	}

}, {

	tableName: 'widgets'

})
```


### Hooks

_Usage example goes here_

### Read-only fields

_Usage example goes here_

### Unique keys

_Usage example goes here_

### Foreign keys

_Usage example goes here_

### Class methods

_Usage example goes here_

### Instance methods

_Usage example goes here_

### Transactions

_Usage example goes here_


### Planned

* Multi-database support
* Easy-to-extend validation



## How to Run Tests

First, you must create a test MySQL database in which to run the tests, with the following connection information:
```
	host: 'localhost',
	port: 3306,
	user: 'db_modeler_test',
	password: 'password',
	database: 'db_modeler_test'
```
*These database credentials are located at `test/config/database.js`*


From your project's base directory:
```
mocha
```
*You may need to run `npm install` locally to get the dev dependencies.*