# Sequel

A Database Modeler for Node; designed to help you produce easy-to-read, maintainable code. Works with **MySQL** and **SQLite**.

The goal of this project is not to be everthing to everyone. It is not meant to solve every possible edge case. Instead, it is to focus on the most common use cases of data-driven applications. That being said, take a gander at the [Documentation](#documentation) to see if sequel will fit your application's needs.


## !! Warning !!

Sequel is still under active development. Core functionality is likely to change.


## Installation

The quick way:
```
npm install sequel
```

The slower way is to add `sequel` to your project's `package.json` file:
```json
{
  "name": "Your App",
  "dependencies": {
    "sequel": "latest"
  }
}
```
*It is recommended that you specify a hard-coded version number instead of `latest`*

*See https://npmjs.org/package/sequel for the latest release version*

Then, from your project's directory:
```
npm install
```

### Installing Database Driver

Sequel does not have a database driver as a dependency, so you must install one separately from sequel.

If you are using MySQL, and have not already installed the `mysql` package, you can install it with the following:
```
npm install mysql
```

If you are using SQLite, and have not already installed the `sqlite3` package, you can install it with the following:
```
npm install sqlite3
```


## Contributing

There are a number of ways you can contribute:

* **Improve or correct the documentation** - All the documentation is in this `readme.md` file. If you see a mistake, or think something should be clarified or expanded upon, please [submit a pull request](https://github.com/chill117/sequel/pulls/new)
* **Report a bug** - Please review [existing issues](https://github.com/chill117/sequel/issues) before submitting a new one; to avoid duplicates. If you can't find an issue that relates to the bug you've found, please [create a new one](https://github.com/chill117/sequel/issues).
* **Request a feature** - Again, please review the [existing issues](https://github.com/chill117/sequel/issues) before posting a feature request. If you can't find an existing one that covers your feature idea, please [create a new one](https://github.com/chill117/sequel/issues).
* **Fix a bug** - Have a look at the [existing issues](https://github.com/chill117/sequel/issues) for the project. If there's a bug in there that you'd like to tackle, please feel free to do so. I would ask that when fixing a bug, that you first create a failing test that proves the bug. Then to fix the bug, make the test pass. This should hopefully ensure that the bug never creeps into the project again. After you've done all that, you can [submit a pull request](https://github.com/chill117/sequel/pulls/new) with your changes.

If you are planning on contributing code to this project, please see the [Contributing Code](#contributing-code) section.


<a name="contributing-code" />
## Contributing Code

Before you contribute code, please read through at least some of the source code for the project. I would appreciate it if any pull requests for source code changes follow the coding style of the rest of the project.

Now if you're still interested, you'll need to get your local environment configured.

### Configure Local Environment

#### Step 1: Get the Code

First, you'll need to pull down the code from GitHub:
```
git clone git@github.com:chill117/sequel.git
```

#### Step 2: Install Dependencies

Second, you'll need to install the project dependencies as well as the dev dependencies. To do this, simply run the following from the directory you created in step 1:
```
npm install
```

#### Step 3: Set Up Databases

Now, you'll need to set up local test databases for each database driver:
```js
{
	mysql: {
		host: 'localhost',
		port: 3306,
		user: 'sequel_test',
		password: 'password',
		database: 'sequel_test',
		driver: 'mysql'
	},
	sqlite: {
		filename: ':memory:',
		driver: 'sqlite'
	}
}
```
*These database credentials are located at `test/config/database.js`*


### Running Tests

With your local environment configured, running all tests is as simple as:
```
mocha
```
To run only the unit tests:
```
mocha test/unit
```
To run only database driver tests:
```
mocha test/unit/db/drivers
```
You get the idea :)


<a name="documentation" />
## Documentation

* [Basic Usage](#basic-usage)
* [Timestamps](#timestamps)
* [CRUD Methods](#crud-methods)
* [Includes](#includes)
* [Field Types](#field-types)
* [Validation](#validation)
* [Read-Only Fields](#read-only-fields)
* [Unique Keys](#unique-keys)
* [Foreign Keys](#foreign-keys)
* [Class Methods](#class-methods)
* [Instance Methods](#instance-methods)
* [Hooks](#hooks)
* [Transactions](#transactions)


<a name="basic-usage" />
### Basic Usage

Initializing Sequel:
```js
var Sequel = require('sequel')

var options = {
	host: 'localhost',
	port: 3306,
	user: 'sequel_test',
	password: 'password',
	database: 'sequel_test',
	driver: 'mysql'
}

var sequel = new Sequel(options)
```

Defining a model:
```js
var Widget = sequel.define('Widget', {

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

Destroying a single instance:
```js
widget.destroy().complete(function(error) {
	
	if (error)
		return console.log(error)

	console.log('Widget destroyed!')

})
```


<a name="timestamps" />
### Timestamps

As a convenience, the following timestamp fields are added to all models by default:
```js
'created_at': 'date',// Set once, when an instance is first saved to the database.
'updated_at': 'date'// Set everytime an instance is saved to the database.
```

To disable timestamp fields on a model:
```js
var Widget = sequel.define('Widget', {

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

	tableName: 'widgets',
	timestamps: false

})
```


<a name="crud-methods" />
### CRUD Methods

To make working with your data easier, each model has CRUD (**C**reate **R**ead **U**pdate **D**elete) methods available.

#### Create

`create([data[, options])`:
* `data` is optional; should be an object:
```js
{
	name: 'Some Widget',
	description: 'A description for this widget'
}
```
* `options` is optional; all possible options for `create`:
```js
{
	validate: false,// When FALSE, the validation step will be skipped.
	debug: true// When TRUE, debugging information will be printed to the console.
}
```

#### Read

`find(primary_key[, options])`:
* `primary_key`
* `options` is optional

Will find a single record, by its primary key.

`find([options])`:
* `options` is optional

Will find a single record.

`findAll([options])`:
* `options` is optional

Will find one or more records.

All possible `options` for `find`:
```js
{
	where: {
		some_value: 5// Where 'some_value' is equal to 5.
		some_value2: [5, 6, 7],// Where 'some_value2' is equal to one of the values in the array.
		other_value: {
			gt: 0,// Where 'other_value' is greater than 0.
			gte: 1,// Where 'other_value' is greater than or equal to 1.
			lt: 100,// Where 'other_value' is less than 100.
			lte: 100,// Where 'other_value' is less than or equal to 100.
			ne: 5,// Where 'other_value' is NOT equal to 5.
			not_in: [8, 9, 10]// Where 'other_value' is NOT equal to any of the values in the array.
		}
	},
	attributes: ['id', 'name'],// An array of attributes to return for each record found. The default behavior is to return all attributes.
	include: [
		{model: 'User'},// Will join the 'User' model's table in the query, and select all columns from the 'User' model's table.
		{model: 'User', attributes: ['id', 'username']}// Will join the 'User' model's table in the query, and select only the 'id' and 'username' columns from the 'User' model's table.
	],
	order: 'id ASC',// Order the results by the 'id' field in ascending order.
	group: 'id',// Group the results by the 'id' field.
	limit: 5,// An integer that specifies the maximum number of records to get. Default is no limit.
	offset: 2,// An integer that specifies the offset of the query. Default is 0.
	debug: true// When TRUE, debugging information will be printed to the console.
}
```
*For detailed information about the `include` option, see [Includes](#includes)*


#### Update

`update(data[, options])`:
* `data` is **required**; should be an object:
```js
{
	description: 'A new description for the widget',
	num_users: {
		increment: 1,// Increase 'num_users' by 1
		decrement: 3// Decrease 'num_users' by 3
	}
}
```
* `options` is optional; all possible options for `update`:
```js
{
	validate: false,// When FALSE, the validation step will be skipped.
	where: {
		some_value: 5// Where 'some_value' is equal to 5.
		some_value2: [5, 6, 7],// Where 'some_value2' is equal to one of the values in the array.
		other_value: {
			gt: 0,// Where 'other_value' is greater than 0.
			gte: 1,// Where 'other_value' is greater than or equal to 1.
			lt: 100,// Where 'other_value' is less than 100.
			lte: 100,// Where 'other_value' is less than or equal to 100.
			ne: 5,// Where 'other_value' is NOT equal to 5.
			not_in: [8, 9, 10]// Where 'other_value' is NOT equal to any of the values in the array.
		}
	},
	order: 'id ASC',// Order the affected records by the 'id' field in ascending order.
	limit: 5,// An integer that specifies the maximum number of records to update. Default is no limit.
	debug: true// When TRUE, debugging information will be printed to the console.
}
```

Example usage:
```js
Widget.update({value2: 50}, {
	where: {
		id: 10
	},
	limit: 1
})
	.complete(function(errors) {

		// If errors occurred, 'errors' will contain a non-null value.
		if (errors)
			return console.log(errors)

	})
```

#### Delete

`destroy([options])`:
* `options` is optional; all possible options for `destroy`:
```js
{
	where: {
		some_value: 5// Where 'some_value' is equal to 5.
		some_value2: [5, 6, 7],// Where 'some_value2' is equal to one of the values in the array.
		other_value: {
			gt: 0,// Where 'other_value' is greater than 0.
			gte: 1,// Where 'other_value' is greater than or equal to 1.
			lt: 100,// Where 'other_value' is less than 100.
			lte: 100,// Where 'other_value' is less than or equal to 100.
			ne: 5,// Where 'other_value' is NOT equal to 5.
			not_in: [8, 9, 10]// Where 'other_value' is NOT equal to any of the values in the array.
		}
	},
	order: 'id ASC',// Order the affected records by the 'id' field in ascending order.
	limit: 5,// An integer that specifies the maximum number of records to destroy. Default is no limit.
	debug: true// When TRUE, debugging information will be printed to the console.
}
```

Example usage:
```js
Widget.destroy().complete(function(error) {

	// If an error occurred with the query, 'error' will contain a non-null value.
	if (error)
		return console.log(error)

})
```

#### Count

As a convenience, a count method is also included. It behaves similarly to the read methods from above.

`count([options])`:
* `options` is optional; all possible options for `count`:
```js
{
	where: {
		some_value: 5// Where 'some_value' is equal to 5.
		some_value2: [5, 6, 7],// Where 'some_value2' is equal to one of the values in the array.
		other_value: {
			gt: 0,// Where 'other_value' is greater than 0.
			gte: 1,// Where 'other_value' is greater than or equal to 1.
			lt: 100,// Where 'other_value' is less than 100.
			lte: 100,// Where 'other_value' is less than or equal to 100.
			ne: 5,// Where 'other_value' is NOT equal to 5.
			not_in: [8, 9, 10]// Where 'other_value' is NOT equal to any of the values in the array.
		}
	},
	group: 'id',// Group the results by the 'id' field.
	debug: true// When TRUE, debugging information will be printed to the console.
}
```

Example usage:
```js
Widget.count().complete(function(error, num_widgets) {
	
	// If an error occurred with the query, 'error' will contain a non-null value.
	if (error)
		return console.log(error)

	// Since we didn't supply any options to the count() method, 'num_widgets' will equal the total number of widgets.
	console.log('There are ' + num_widgets + ' widgets')

})
```


<a name="includes" />
### Includes

Includes allow for the retrieval of data from multiple related records in a single read query.

It is important to note that to use the `include` option, there must exist a foreign key relating at least one of the models to the other. Either the included model has a foreign key pointing to the model you are performing the read query on, or the inverse.

Let's use an example to illustrate what this means:
```js
var Widget = sequel.define('Widget', {

	id: {
		type: 'integer',
		autoIncrement: true,
		primaryKey: true
	},
	user_id: {
		type: 'integer',
		validate: {
			notNull: true,
			isInt: true
		}
	},
	name: {
		type: 'text',
		readOnly: true,
		validate: {
			notEmpty: true
		}
	}

}, {

	tableName: 'widgets',

	foreignKeys: {

		user_id: {
			model: 'User',
			field: 'id'
		}

	}

})

var User = sequel.define('User', {

	id: {
		type: 'integer',
		autoIncrement: true,
		primaryKey: true
	},
	username: {
		type: 'text',
		validate: {
			notEmpty: true
		}
	},
	email: {
		type: 'text',
		validate: {
			notEmpty: true
		}
	}

}, {

	tableName: 'users'

})
```
In the above setup, the `Widget` model has a foreign key on its `user_id` field that points to the `User` model. This would allow us to perform the following `find()` with the `Widget` model:
```js
Widget.find({
	where: {
		id: 5
	},
	include: [
		{model: 'User', attributes: ['id', 'username']}
	]
})
	.complete(function(error, widget) {

		if (error)
			return console.log(error)

		console.log(widget.get())

	})
```
And, if there was a widget found, the data would look something like this:
```js
{
	id: 5,
	user_id: 20,
	name: 'The Name of a Widget',
	created_at: Sun Feb 23 2014 11:15:43 GMT+0100 (CET),
	updated_at: Sun Feb 23 2014 11:15:43 GMT+0100 (CET),
	users: {
		id: 20,
		username: 'test_testerson'
	}
}
```
By default the key used to add the included data to the data object is the included model's table name. To change this, use the `as` option on the include:
```js
{model: 'User', as: 'user', attributes: ['id', 'username']}
```
The output would change to this:
```js
{
	id: 5,
	user_id: 20,
	name: 'The Name of a Widget',
	created_at: Sun Feb 23 2014 11:15:43 GMT+0100 (CET),
	updated_at: Sun Feb 23 2014 11:15:43 GMT+0100 (CET),
	user: {
		id: 20,
		username: 'test_testerson'
	}
}
```


<a name="field-types" />
### Field Types

Fields types are used to type-cast the data of instances when they are created. Here is the full list of field types:

* `text` - Cast to a string using `toString()`
* `string` - *Same as `text`*
* `integer` - Cast to an integer using `parseInt()`
* `number` - Cast to a number using `parseFloat()`
* `float` - *Same as `number`*
* `decimal` - Cast to an instance of `BigNumber()`; see <a href="http://mikemcl.github.io/bignumber.js/">bignumber.js</a> for details.
* `date` - Cast to a date using `Date()`
* `array-text` - Cast to an array of `text` values
* `array-string` - *Same as `array-text`*
* `array-integer` - Cast to an array of `integer` values
* `array-number` - Cast to an array of `number` values
* `array-float` - *Same as `array-number`*
* `array-decimal` - Cast to an array of `decimal` values
* `array-date` - Cast to an array of `date` values

#### Array Fields

You may have noticed the `array-` types in the list above. The values for these fields are automatically collapsed to a **string** before being inserted into the database. As a result, you will want to use a column type for medium to large sized strings in your database schema for these fields. By default the data for these fields is concatenated using a comma as the delimiter. But, you can change this on a per field basis as follows:
```js
var SomeModel = sequel.define('SomeModel', {

	id: {
		type: 'integer',
		autoIncrement: true,
		primaryKey: true
	},
	some_list: {
		type: 'array-text',
		delimiter: '|'
	}

}, {

	tableName: 'some_table'

})
```
Inversely, the values for array fields are automatically expanded back to arrays when retrieved from the database. Each value within a single array field is cast to the field's data type. So, `array-integer` will be cast to an array of integer values. And, `array-string` will be cast to an array of string values.


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
var Widget = sequel.define('Widget', {

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

Attempting to create a new widget without a name:
```js
Widget.create({}).complete(function(errors, widget) {

	if (errors)
		return console.log(errors)

})
```
Will result in the following errors:
```js
{ name: [ 'Expected non-empty string' ] }
```

To set a custom error message for a validation rule:
```js
validate: {
	notEmpty: {
		msg: 'This is a custom error message'
	}
}
```

And, setting a custom error message for a validation rule that has arguments:
```js
validate: {
	maxLen: {
		args: 100,
		msg: 'This is a custom error message'
	}
}
```

#### Custom Validation Methods

It is possible to set custom validation methods on each field individually, or for the entire model. First, for an individual field:
```js
name: {
	type: 'text',
	validate: {
		notEmpty: true,
		customValidationMethod: function(value, next) {

			// This method is called with the instance's context.

			// The 'value' argument is the value of the 'name' field for this instance.

			if (value.length > 100)
				// Call the next() callback with a non-null value to signal failed validation.
				return next('Are you sure there isn\'t a more succinct way of naming this widget?')

			// Call the next() callback with no arguments to signal passed validation.
			next()

		}
	}
}
```
Errors from custom field-level validation methods are added to the field's error array within the errors object:
```js
{ name: [ 'Are you sure there isn\'t a more succinct way of naming this widget?' ] }
```

And, an example of a custom instance-level validation method:
```js
var Widget = sequel.define('Widget', {

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

	tableName: 'widgets',

	validate: {
		customValidationMethod: function(next) {

			// This method is called with the instance's context.

			// The next() callback works in the same manner as the field-level validation.

			next('No passing go')

		}
	}

})
```
Errors from custom instance-level validation methods are added to the errors object as follows:
```js
{ customValidationMethod: [ 'No passing go' ] }
```


<a name="read-only-fields" />
### Read-Only fields

Read-only fields are useful if you want to prevent the value of a field from being altered after it has been entered into the database.

#### Examples

For example, let's say we wanted to make the `name` field of our `Widget` model read-only:
```js
var Widget = sequel.define('Widget', {

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
var User = sequel.define('User', {

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
var Project = sequel.define('Project', {

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
{ user_id_name: [ 'Duplicate entry found for the following field(s): \'user_id\', \'name\'' ] }
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
		name: 'unique_project_names_for_each_user',
		fields: ['user_id', 'name'],
		msg: 'You have already used that name with a different project'
	}
]
```
Now the error object will look like this:
```js
{ unique_project_names_for_each_user: [ 'You have already used that name with a different project' ] }
```


<a name="foreign-keys" />
### Foreign Keys

Foreign keys are useful for maintaining data integrity in an application. Let's revisit the example we were using previously with unique keys. Since we're associating `projects` with `users`, we will want to ensure that whenever we create a new `Project`, its associated `User` must exist in the database. That's where foreign keys come in.

#### Examples

```js
var Project = sequel.define('Project', {

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
var Project = sequel.define('Project', {

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

Instance methods are available on each instance generated from a model. Instance methods are called with their instance's context.

#### Examples

Add an instance method to a model when you are defining it:
```js
var User = sequel.define('User', {

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

	tableName: 'users',

	instanceMethods: {

		getProjects: function(cb) {

			var user_id = this.get('id')

			Project.findAll({
				where: {
					user_id: user_id
				}
			})
				.complete(function(error, projects) {

					if (error)
						return cb(error)

					cb(null, projects)

				})

		}

	}

})
```

Use the instance method like this:
```js
User.find(id).complete(function(error, user) {
	
	if (error)
		return console.log(error)

	if (!user)
		return console.log('User not found!')

	user.getProjects(function(error, projects) {

		if (error)
			return console.log(error)

		console.log('user projects:')
		console.log(projects)

	})

})
```


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

A hook is only executed if no errors have occurred before it. So, the **afterValidate** hook callbacks will not be called if there are validation errors.

#### Examples

There are two ways to add callbacks to a hook. The first is to pass them as an option when defining a model:
```js
var Project = sequel.define('Project', {

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
			function(next) {

				// Hook callbacks are executed with the instance context.

				// You can change data of the instance like this:
				this.set('name', 'Changed name!')

				// Call the next() callback to continue.
				next()

			},
			function(next) {

				// If an error occurs here, you can pass it to the next() callback.
				// This will prevent any other callbacks on this hook from being executed.
				// Plus, since this is the 'beforeCreate' hook, it will prevent the creation of the new instance.
				next('An error occurred!')

			}
		]
	}

})
```

The second is to use the `addHook(name, fn)` method:
```js
Project.addHook('afterCreate', function(next) {

	var user_id = this.get('user_id')
	
	User.find(user_id).complete(function(error, user) {

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
var transaction = sequel.transaction()

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
							return console.log('Failed to revert changes: ' + error)

						// Changes reverted.

					})

			// When done and happy with changes, commit the transaction:
			transaction.commit().complete(function(error) {

				if (error)
					return console.log('Failed to commit changes: ' + error)

				// Changes committed.

			})

		})

})
```