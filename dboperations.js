const config = require('./dbconfig')
const sql = require('mssql');

const getRecordsBySensorId = async (sensorId, num) => {
    try {
        let pool = await sql.connect(config);
        const sensors = (await pool.request().query('SELECT * FROM Table_General')).recordsets[0]
        const sensorType = sensors.find(sensor => sensor.Kyhieu.trim() === sensorId).Loaicambien

        let tableName;
		let sensorSqlLabel = '';

        switch (sensorType) {
            case 'Ứng suất':
            case 'Nhiệt độ':
                tableName = 'StaticSensorRESULT_Day'
                break;
            case 'Lực':
                tableName = 'Tension'
                break;
			case 'Gia tốc':
				tableName = 'VibraSensor_Day'
				sensorSqlLabel = ` AS "${sensorId}"`
				const [sensorLabel, sensorIdx] = sensorId.split('-')
				if (sensorLabel === 'AC1D')
					sensorId = `Gtmax${sensorIdx}`
				else
					sensorId = `Gtmax${parseInt(sensorIdx)+3}`
				break;
            default:
                console.log(`Error: can't find sensor type ${sensorType} in db!`)
                return []
        }
		
        let result = await pool.request()
            .query(`SELECT TOP ${num} Timestamp, ${sensorId}${sensorSqlLabel} FROM ${tableName} ORDER BY Timestamp DESC`);

        return result.recordsets[0];
    }
    catch (error) {
        console.log(error);
    }
}

const getLastestRecord = async () => {
    try {
        let pool = await sql.connect(config);
		const staticSensors = (await pool.request()
                .query(`SELECT TOP 1 * FROM StaticSensorRESULT_Day ORDER BY Timestamp DESC`)).recordsets[0][0]
		const tensions = (await pool.request()
                .query(`SELECT TOP 1 * FROM Tension ORDER BY Timestamp DESC`)).recordsets[0][0]
		const vibraSensors = (await pool.request()
                .query(`SELECT TOP 1 * FROM VibraSensor_Day ORDER BY Timestamp DESC`)).recordsets[0][0]
		let timestamps = [staticSensors.Timestamp, tensions.Timestamp]
		timestamps.sort()
        let result = {
            ...staticSensors,
            ...tensions,
			...vibraSensors,
			Timestamp: timestamps[0]
        }
		
		result['AC1D-1'] = result['Gtmax1']
		result['AC1D-2'] = result['Gtmax2']
		//result['AC1D-3'] = result['Gtmax3']
		//result['AC1D-4'] = result['Gtmax4']

        return result;
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

const getRecordsByDay = async day => {
    const startOfDay = `'${day} 00:00:00'`
    const endOfDay = `'${day} 23:59:59'`

    try {
        let pool = await sql.connect(config)
        let result = await pool.request()
            .query(`SELECT * FROM StaticSensorRESULT_Day A
                    LEFT JOIN Tension B
                    ON A.Timestamp = B.Timestamp
                    WHERE A.Timestamp BETWEEN ${startOfDay} AND ${endOfDay} 
                    ORDER BY A.Timestamp DESC`)
        return result.recordsets[0]
    }
    catch (err) {
        console.log(err)
    }
}

const getRecordsByMonth = async yearAndMonth => {
    const [year, month] = yearAndMonth.split('-')

    const startOfMonth = `'${yearAndMonth}-01'`
    const endOfMonth = `'${yearAndMonth}-${(new Date(year, month, 0)).getDate()} 23:59:59'`

    try {
        let pool = await sql.connect(config)
        let result = await pool.request()
            .query(`SELECT * FROM StaticSensorRESULT_Day A
                    LEFT JOIN Tension B
                    ON A.Timestamp = B.Timestamp
                    WHERE A.Timestamp BETWEEN ${startOfMonth} AND ${endOfMonth} 
                    ORDER BY A.Timestamp DESC`)
        return result.recordsets[0]
    }
    catch (err) {
        console.log(err)
    }
}

const getRecordsByCustomRange = async (fromDate, toDate) => {
    try {
        let pool = await sql.connect(config)
        let result = await pool.request()
            .query(`SELECT * FROM StaticSensorRESULT_Day A
                    LEFT JOIN Tension B
                    ON A.Timestamp = B.Timestamp
                    WHERE A.Timestamp BETWEEN '${fromDate} 00:00:00' AND '${toDate} 23:59:59'
                    ORDER BY A.Timestamp DESC`)
        return result.recordsets[0]
    }
    catch (err) {
        console.log(err)
    }
}

module.exports = {
    getRecordsBySensorId,
    getLastestRecord,
    getGeneralTable,
    getRecordsByDay,
    getRecordsByMonth,
    getRecordsByCustomRange
}