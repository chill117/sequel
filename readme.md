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


## Features

### Validation

_Usage example goes here_

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