module.exports = {
	mysql: {
		host: process.env.DB_HOST !== undefined ? process.env.DB_HOST : 'localhost',
		port: process.env.DB_PORT !== undefined ? process.env.DB_PORT : 3306,
		user: process.env.DB_USER !== undefined ? process.env.DB_USER : 'sequel_test',
		password: process.env.DB_PASS !== undefined ? process.env.DB_PASS : 'password',
		database: process.env.DB_NAME !== undefined ? process.env.DB_NAME : 'sequel_test',
		driver: 'mysql'
	},
	sqlite: {
		filename: ':memory:',
		driver: 'sqlite'
	}
}