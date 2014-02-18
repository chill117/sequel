# db-modeler

A Database Modeler for Node.


## !! Warning !!

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
	user: 'db**modeler**test',
	password: 'password',
	database: 'db**modeler**test'
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
	},
	description: 'text'

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

Retrieve the instance we just created, by its ID:
```js
Widget.find(id).complete(function(error, widget) {

	if (error)
		return consoe.log(error)

	if (!widget)
		return console.log('Widget not found!')

	console.log('Found the widget:')
	console.log(widget)

})
```

Getting the value of a field for an instance:
```js
var name = widget.get('name')

console.log('The name of the widget is "' + name + '"')
```

Changing a single field, and saving:
```js
widget.set('name', 'A New Name!')

widget.save().complete(function(errors, widget) {

	if (errors)
		return console.log(errors)

	console.log('Successfully saved the widget!')

	var name = widget.get('name')

	console.log('The name of the widget is now "' + name + '"')

})
```

Changing multiple fields at once:
```js
widget.set({
	name: 'A widget by any other name',
	description: 'would work just as well'
})

widget.save().complete(function(errors, widget) {

	if (errors)
		return console.log(errors)

	console.log('Successfully saved the widget again!')

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
{ name: [ 'Expected non-empty string' ] }
```

It's also possible to set a custom error message for a validation rule:
```js
validate: {
	notEmpty: {
		msg: 'This is a custom error message'
	}
}
```

Setting a custom error message for a validation rule that has arguments:
```js
validate: {
	maxLen: {
		args: [100],
		msg: 'This is a custom error message'
	}
}
```


<a name="read-only-fields" />
### Read-Only fields

Read-only fields are useful if you want to prevent the value of a field from being altered after it has been entered into the database.

#### Examples

For example, let's say we wanted to make the `name` field of our `Widget` model read-only:
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

Trying to change a read-only field after the instance has been saved to the database:
```js
Widget.create({
	name: 'An Unchangeable Name'
})
	.complete(function(errors, widget) {

		if (errors)
			return console.log(errors)

		var nameBefore = widget.get('name')

		widget.set('name', 'A New Name!')

		var nameAfter = widget.get('name')

		console.log('nameBefore: ' + nameBefore)
		console.log('nameAfter: ' + nameAfter)

	})
```
The above will output the following:
```js
nameBefore: An Unchangeable Name
nameAfter: An Unchangeable Name
```

Of course, you could try working around the `set()` method:
```js
// A kludgy way of altering instance data.
// Don't do this..
widget.data.name = 'A New Name!'

widget.save().complete(function(errors, widget) {
	
	if (errors)
		return console.log(errors)

})
```
But, that won't work either:
```js
{ name: [ 'Cannot change \'name\' for an existing record' ] }
```


<a name="unique-keys" />
### Unique Keys

Unique keys are useful for preventing duplicate values for a single field, or for a combination of fields.\

#### Examples

Let's look at a common use-case:
```js
var User = modeler.define('User', {

	id: {
		type: 'integer',
		autoIncrement: true,
		primaryKey: true
	},
	username: {
		type: 'text',
		uniqueKey: true
	},
	email: {
		type: 'text',
		uniqueKey: true
	}

}, {

	tableName: 'users'

})
```
Here we've defined a `User` model, with `username` and `email` fields. For most applications, these two fields should be unique, so we use a unique key for each.

When we attempt to create a new user:
```js
User.create({
	username: 'test_testerson',
	email: 'test_testerson@testing.com'
})
	.complete(function(errors, user) {

		if (errors)
			return console.log(errors)

		// New user created!

	})
```
If the username already exists, we will get the following errors:
```js
{ username: [ 'Duplicate entry found for the following field(s): \'username\'' ] }
```

Much like with validation rules, it is possible to set custom error messages for unique keys:
```js
username: {
	type: 'text',
	uniqueKey: {
		msg: 'That username has already been taken'
	}
}
```

Now, if we add a `Project` model to our application:
```js
var Project = modeler.define('Project', {

	id: {
		type: 'integer',
		autoIncrement: true,
		primaryKey: true
	},
	user_id: 'integer',
	name: 'text'

}, {

	tableName: 'projects',

	uniqueKeys: [
		['user_id', 'name']
	]

})
```
This is an alternative method for adding unique keys to a model. Unique keys can span one or more fields in the model. The unique key in the `Project` model above will require the `user_id` and `name` combination to be unique for each project created.

Attempting to create a duplicate would yield the following error:
```js
{ user**id**name: [ 'Duplicate entry found for the following field(s): \'user_id\', \'name\'' ] }
```

Again, it is possible to set a custom error message:
```js
uniqueKeys: [
	{
		fields: ['user_id', 'name'],
		msg: 'You have already used that name with a different project'
	}
]
```

Additionally, if you want to change the key in the errors object for a unique key:
```js
uniqueKeys: [
	{
		name: 'unique**project**names**for**each_user',
		fields: ['user_id', 'name'],
		msg: 'You have already used that name with a different project'
	}
]
```
Now the error object will look like this:
```js
{ unique**project**names**for**each_user: [ 'You have already used that name with a different project' ] }
```


<a name="foreign-keys" />
### Foreign Keys

Foreign keys are useful for maintaining data integrity in an application. Let's revisit the example we were using previously with unique keys. Since we're associating `projects` with `users`, we will want to ensure that whenever we create a new `Project`, its associated `User` must exist in the database. That's where foreign keys come in.

#### Examples

```js
var Project = modeler.define('Project', {

	id: {
		type: 'integer',
		autoIncrement: true,
		primaryKey: true
	},
	user_id: 'integer',
	name: 'text'

}, {

	tableName: 'projects',

	foreignKeys: {
		user_id: {
			model: 'User',
			field: 'id'
		}
	}

})
```

This will perform a validation check to ensure that there exists a `User` with the given `user_id`. So, if we attempted to create a new project:
```js
Project.create({
	user_id: 20,
	name: 'A Project Name'
})
	.complete(function(errors, project) {

		if (errors)
			return console.log(errors)

		// New project created!

	})
```
And, if the `user_id` does not match any existing `users`, we will get the following errors:
```js
{ user_id: [ 'Missing parent row for foreign key field' ] }
```

Much like with validation rules, it is possible to set custom error messages for foreign keys:
```js
	foreignKeys: {
		user_id: {
			model: 'User',
			field: 'id',
			msg: 'You cannot create a project for a user that does not exist'
		}
	}
```


<a name="class-methods" />
### Class Methods

Class methods allow you to extend an individual model with your own custom methods. Class methods are called with their model's context.

#### Examples

Add a class method to a model when you are defining it:
```js
var Project = modeler.define('Project', {

	id: {
		type: 'integer',
		autoIncrement: true,
		primaryKey: true
	},
	user_id: 'integer',
	name: 'text'

}, {

	tableName: 'projects',

	classMethods: {

		performMagic: function(input) {

			var magic_number = 5

			return (input * magic_number) + magic_number

		}

	}

})
```

Use the class method like this:
```js
var output = Project.performMagic(2)

consoe.log('output: ' + output)
```

Here's an example that makes use of the model context:
```js
classMethods: {

	countProjectsByUser: function(user_id, cb) {

		this.count({
			where: {
				user_id: user_id
			}
		})
			.complete(cb)

	}

}
```

Use the class method:
```js
Project.countProjectsByUser(2, function(error, count) {
	
	if (error)
		return console.log(error)

	consoe.log('The user has ' + count + ' project(s)')

})
```


<a name="instance-methods" />
### Instance Methods

_Usage example goes here_


<a name="hooks" />
### Hooks

* **beforeValidate** - Occurs before the validation step.
* **afterValidate** - Occurs after the validation step.
* **beforeCreate** - Occurs before the creation of a new instance.
* **afterCreate** - Occurs after the creation of a new instance.
* **beforeUpdate** - Occurs before updating an existing instance.
* **afterUpdate** - Occurs after updating an existing instance.
* **beforeDestroy** - Occurs before destroying an existing instance.
* **afterDestroy** - Occurs after destroying an existing instance.
* **beforeDelete** - Synonym of **beforeDestroy**.
* **afterDelete** - Synonym of **afterDestroy**.

A hook is only executed if no errors have occurred before it. So, the **afterValidate** hook callbacks will not be called if there are validation errors.

#### Examples

There are two ways to add callbacks to a hook. The first is to pass them as an option when defining a model:
```js
var Project = modeler.define('Project', {

	id: {
		type: 'integer',
		autoIncrement: true,
		primaryKey: true
	},
	user_id: 'integer',
	name: 'text'

}, {

	tableName: 'projects',

	hooks: {
		beforeCreate: [
			function(values, next) {

				// The 'values' argument is the new instance's data object.

				// You can change these values:
				values.name = 'Changed name!'

				// And, pass the new values on to the next callback.
				next(null, values)

			}
		]
	}

})
```

The second is to use the `addHook(type, fn)` method:
```js
Project.addHook('afterCreate', function(values, next) {
	
	User.find(values.user_id).complete(function(error, user) {

		if (error)
			return next(error)

		if (!user)
			return next('User not found?!')

		var num_projects = user.get('num_projects')

		num_projects++

		user.set('num_projects', num_projects)

		user.save().complete(function(errors) {

			if (errors)
				return next('An unexpected error has occurred')

			// Be sure to call next() when the hook callback is done doing its thing.
			next()

		})

	})

})
```


<a name="transactions" />
### Transactions

Sometimes it is necessary to tie a series of database changes together; they all fail or succeed together. That's what transactions are for. Here's an example of using a transaction:
```js
var transaction = modeler.transaction()

transaction.start().complete(function(error) {
	
	if (error)
		return console.log('Failed to start transaction: ' + error)

	// Make database changes here.

	Project.create({
		user_id: 4,
		name: 'A new project'
	})
		.complete(function(errors, project) {

			if (errors)
				// Errors occurred, so revert?
				return transaction.revert().complete(function(error) {

						if (error)
							return console.log('Failled to revert changes: ' + error)

						// Changes reverted.

					})

			// When done and happy with changes, commit the transaction:
			transaction.commit().complete(function(error) {

				if (error)
					return console.log('Failled to commit changes: ' + error)

				// Changes committed.

			})

		})

})
```

<a name="planned" />
### Planned

* Multi-database support
* Easy-to-extend validation


