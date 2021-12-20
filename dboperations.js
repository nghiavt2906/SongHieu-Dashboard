// const config = require('./dbconfig');
const config = require('./test-dbconfig')
const sql = require('mssql');

const getRecordsBySensorId = async (sensorId, num) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            // .query(`SELECT TOP ${num} ID, Time, ${sensorId} FROM GD2_UNGSUAT ORDER BY Time DESC`);
            .query(`SELECT TOP ${num} Record, Timestamp, ${sensorId} FROM StaticSensorRESULT_Day ORDER BY Timestamp DESC`);

        return result.recordsets[0];
    }
    catch (error) {
        console.log(error);
    }
}

const getGeneralTable = async () => {
    try {
        let pool = await sql.connect(config)
        let result = await pool.request()
            .query('SELECT * FROM Table_General')
        return result.recordsets[0]
    }
    catch (err) {
        console.log(err)
    }
}

module.exports = {
    getRecordsBySensorId,
    getGeneralTable
}