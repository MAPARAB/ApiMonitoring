// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var http = require('http');
var cors = require('cors');

var apiService = require('./service/elastic');
var auth = require('./authenticate/auth');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

var port = process.env.PORT || 8080;        // set our port


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/home', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

//Login
router.post('/login', auth.login);

//Elastic search query
router.post('/api/v1/report', apiService.apiReport);

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);

// Auth Middleware - This will check if the token is valid
// Only the requests that start with /api/v1/* will be checked for the token.
// Any URL's that do not follow the below pattern should be avoided unless you 
// are sure that authentication is not needed
//app.all('/api/v1/*', [require('./middlewares/validateRequest')]);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
