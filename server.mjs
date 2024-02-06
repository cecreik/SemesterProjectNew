import 'dotenv/config'
import express from 'express'; // Express is installed using npm
import USER_API from './routes/usersRoute.mjs'; // This is where we have defined the API for working with users.
import {HTTPCodes, HTTPMethods} from './modules/httpConstants.mjs';
import SuperLogger from './modules/SuperLogger.mjs';
// Creating an instance of the server
const server = express();
// Selecting a port for the server to use.
const port = (process.env.PORT || 8080);
server.set('port', port);

// Enable logging for server
//const logger = new SuperLogger();
//server.use(logger.createAutoHTTPRequestLogger()); // Will logg all http method requests

// Defining a folder that will contain static files.
server.use(express.static('public'));
// Telling the server to use the USER_API (all urls that uses this code will have to have the /user after the base address)
server.use("/user", USER_API);


// error handling middleware
server.use((err, req, res, next) =>{
    SuperLogger.log(err);

    const errorMap={
        notFoundError: {message: 'Resource not found', statusCode: HTTPCodes.ClientSideErrorResponse.NotFound},
        authenticationError: {message: 'Unauthorized', statusCode: HTTPCodes.ClientSideErrorResponse.Unauthorized},
    };
    const {message = 'Internal server error', statusCode = HTTPCodes.ClientSideErrorResponse.BadRequest} = errorMap[err.constructor.name] || {};
    res.status(statusCode).json({error: message});
});

//triggering a notFoundError:
server.get("/nonexistent", (req, res, next) =>{
    const notFoundError = new Error('Resource not found');
    notFoundError.name = 'notFoundError';
    next(notFoundError);
});

// Start the server 
server.listen(server.get('port'), function () {
    console.log('server running', server.get('port'));
});