const express = require('express')
const csv = require('fast-csv');

const dboperations = require('../dboperations')

const router = express.Router()

router.get('/', (req, res) => res.render('bao-cao', { activeNavItem: 'bao-cao' }))
router.get('/export', async (req, res) => {
	const exportType = req.query.exportType

	switch (exportType) {
		case 'Day': {
			const records = await dboperations.getRecordsByDay(req.query.day)

			const fileName = `Báo cáo ngày ${req.query.day.split('-').reverse().join('-')}.csv`;
			const csvStream = csv.format({ headers: true });

			res.writeHead(200, {
				"Content-Type": "text/plain",
				"Content-Disposition": `attachment; filename=${fileName}`
			})
			csvStream.pipe(res)
			for (let index = records.length - 1; index >= 0; index--) {
				delete records[index].Record
				records[index].Timestamp = new Date(records[index].Timestamp[0]).toLocaleString("en-GB", { timeZone: 'UTC' }).replace(/,/g, '') // Timestamp is an array because of left join from 2 tables
				csvStream.write({ ...records[index] })
			}
			csvStream.end();
			break;
		}
		case 'Month': {
			const records = await dboperations.getRecordsByMonth(req.query.yearAndMonth)

			const fileName = `Báo cáo tháng ${req.query.yearAndMonth.split('-').reverse().join('-')}.csv`;
			const csvStream = csv.format({ headers: true });

			res.writeHead(200, {
				"Content-Type": "text/plain",
				"Content-Disposition": `attachment; filename=${fileName}`
			})
			csvStream.pipe(res)
			for (let index = records.length - 1; index >= 0; index--) {
				delete records[index].Record
				records[index].Timestamp = new Date(records[index].Timestamp[0]).toLocaleString("en-GB", { timeZone: 'UTC' }).replace(/,/g, '')
				csvStream.write({ ...records[index] })
			}
			csvStream.end();
			break;
		}
		case 'CustomRange': {
			const records = await dboperations.getRecordsByCustomRange(req.query.fromDate, req.query.toDate)

			const fileName = `Báo cáo ${req.query.fromDate.split('-').reverse().join('-')} _ ${req.query.toDate.split('-').reverse().join('-')}.csv`;
			const csvStream = csv.format({ headers: true });

			res.writeHead(200, {
				"Content-Type": "text/plain",
				"Content-Disposition": `attachment; filename=${fileName}`
			})
			csvStream.pipe(res)
			for (let index = records.length - 1; index >= 0; index--) {
				delete records[index].Record
				records[index].Timestamp = new Date(records[index].Timestamp[0]).toLocaleString("en-GB", { timeZone: 'UTC' }).replace(/,/g, '')
				csvStream.write({ ...records[index] })
			}
			csvStream.end();
			break;
		}
		default:
			break;
	}
})

module.exports = router