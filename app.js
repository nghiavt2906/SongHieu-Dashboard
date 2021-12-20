const express = require('express')
const path = require('path')
const exphbs = require("express-handlebars")

require('dotenv').config()
const port = process.env.PORT || 3000

const app = express()

const overviewRoute = require('./routes/overview')
const generalRoute = require('./routes/general')
const chartRoute = require('./routes/chart')
const reportRoute = require('./routes/report')

app.use(express.static(path.join(__dirname, "/public")));

app.engine("handlebars", exphbs.engine({
	helpers: {
		ifeq: function (a, b, options) {
			if (a === b) {
				return options.fn(this);
			}

			return options.inverse(this);
		}
	}
}));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }))
app.use((req, res, next) => {
	express.json()(req, res, err => {
		if (err) {
			console.error(err);
			return res.sendStatus(400); // Bad request
		}

		next();
	});
});

app.get('/', (req, res) => res.render('tong-quan/index', { activeNavItem: 'tong-quan' }))
app.use('/tong-quan', overviewRoute)
app.use('/bang-bieu', generalRoute)
app.use('/bieu-do-cam-bien', chartRoute)
app.use('/bao-cao', reportRoute)

app.listen(port, () => console.log(`listening on port ${port}`))