const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

// set our port
app.set('port', 6500)

// get all data/stuff of the body (POST) parameters
// parse application/json
app.use(bodyParser.json())

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'))

// routes
require('./app/routes')(app)

// start app
app.listen(app.get('port'), function () {
  process.stderr.write(`Node app is running on port ${app.get('port')}\n`)
})

// expose app
exports = module.exports = app
