module.exports = {
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
		debug: true,
		driver: 'sqlite'
	}
}