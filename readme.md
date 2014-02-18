# db-modeler

A Database Modeler for Node.


## Warning

This module is still under active development. Core functionality is likely to change.


## Installation

Add `db-modeler` to your project's `package.json` file:
```json
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


## How to Run Tests

First, you must create a test MySQL database in which to run the tests, with the following connection information:
```js
{
	host: 'localhost',
	port: 3306,
	user: 'db_modeler_test',
	password: 'password',
	database: 'db_modeler_test'
}
```
*These database credentials are located at `test/config/database.js`*


From your project's base directory:
```
mocha
```
*You may need to run `npm install` locally to get the dev dependencies.*


## Documentation

* [Basic Usage](#basic-usage)
* [Validation](#validation)
* [Read-Only Fields](#read-only-fields)
* [Unique Keys](#unique-keys)
* [Foreign Keys](#foreign-keys)
* [Class Methods](#class-methods)
* [Instance Methods](#instance-methods)
* [Hooks](#hooks)
* [Transactions](#transactions)
* [Planned](#planned)


<a name="basic-usage" />
### Basic Usage

Instantiating the modeler:
```js
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
```js
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

Using the model to create a new instance:
```js
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
```js
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


<a name="validation" />
### Validation

Validation rules are run before an instance is saved to the database. [validator.js](https://github.com/chriso/validator.js) is used for validation, with the addition of the following custom rules:

```js
validate: {
	notEmpty: true,// Requires a non-empty string.
	notNull: true,// Requires a non-null value.
	notIn: [1, 2, 3],// Requires the value to not be equal to any of the values in the given array.
	isDecimal: true,// Requires a valid decimal.
	isNumber: true,// Requires a valid number.
	min: 1,// Requires a number greater than or equal to the given number.
	max: 100,// Requires a number less than or equal to the given number.
	minLen: 10,// Requires a string of length greater than or equal to the given number.
	maxLen: 100,// Requires a string of length less than or equal to the given number.
	precision: 2// Requires a number with less than or equal to the given number of digits after the decimal point.
}
```

#### Examples

Validation errors are returned as an object. For example, given the following model:
```js
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

If we attempt to create a new widget without a name:
```js
Widget.create({}).complete(function(errors, widget) {

	if (errors)
		return console.log(errors)

})
```
We will get the following result:
```js
{ name: ['Expected non-empty string'] }
```

It's also possible to set a custom error message for a validation rule:
```js
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

Setting a custom error message for a validation rule that has arguments:
```js
var Widget = modeler.define('Widget', {

	id: {
		type: 'integer',
		autoIncrement: true,
		primaryKey: true
	},
	name: {
		type: 'text',
		validate: {
			maxLen: {
				args: [100],
				msg: 'This is a custom error message'
			}
		}
	}

}, {

	tableName: 'widgets'

})
```


<a name="read-only-fields" />
### Read-Only fields

Read-only fields are useful if you want to prevent the value of a field from being overwritten after it has been entered into the database. For example, given the following model:

```js
var Widget = modeler.define('Widget', {

	id: {
		type: 'integer',
		autoIncrement: true,
		primaryKey: true
	},
	name: {
		type: 'text',
		readOnly: true,
		validate: {
			notEmpty: true
		}
	}

}, {

	tableName: 'widgets'

})
```



<a name="unique-keys" />
### Unique Keys

_Usage example goes here_


<a name="foreign-keys" />
### Foreign Keys

_Usage example goes here_


<a name="class-methods" />
### Class Methods

_Usage example goes here_


<a name="instance-methods" />
### Instance Methods

_Usage example goes here_


<a name="hooks" />
### Hooks

_Usage example goes here_


<a name="transactions" />
### Transactions

_Usage example goes here_


<a name="planned" />
### Planned

* Multi-database support
* Easy-to-extend validation


