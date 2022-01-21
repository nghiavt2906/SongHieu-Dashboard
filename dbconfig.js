const config = {
	user: 'songhieu',
	password: 'Abc123#@!',
	server: '203.205.6.12',
	// server: 'localhost',
	port: 1433,
	database: 'SongHieu',
	requestTimeout: 300000,
	options: {
		trustedConnection: true,
		enableArithAbort: true,
		trustServerCertificate: true,
		// instancename: 'SQLEXPRESS',
		cryptoCredentialsDetails: {
			minVersion: 'TLSv1'
		}
	},
}

module.exports = config;