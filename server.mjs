import 'dotenv/config'
import express from 'express' // Express is installed using npm
import USER_API from './routes/usersRoute.mjs'; // This is where we have defined the API for working with users.


import SuperLogger from './modules/SuperLogger.mjs';
// Creating an instance of the server
const server = express();
// Selecting a port for the server to use.
const port = (process.env.PORT || 8080);
server.set('port', port);


// Enable logging for server
const logger = new SuperLogger();
server.use(logger.createAutoHTTPRequestLogger()); // Will logg all http method requests


// Defining a folder that will contain static files.
server.use(express.static('public'));

// Telling the server to use the USER_API (all urls that uses this code will have to have the /user after the base address)
server.use("/user", USER_API);

// error handling middleware
//server.use er for å fange feilene som skjer når man håndterer en request, hvis noe blir feil, logger den det og sender en melding til de som gjorde en request
server.use((err, req, res, next) =>{ // definerer middlewaren med parameterne, error, req, res og next, 
    SuperLogger.log(err);// logger errorene ved bruk av SuperLogger
 
    const errorMap={ //errorMap er et objekt som mapper(?) forskjellige typer errorer og dems errormelding og HTTP statuskode. Map er en datastruktur som lagerer en samling av nøkkel-verdi-par. 
        //definerer en map som matcher error typene med error meldinger og http statuskoder
        //definerer key-value pair med errorMap objekt, key/nøkkelen er notFoundError. 
        // HTTPCodes.ClientSideErrorResponse.NotFound spesifiserer HTTP status koden for å bli sendt når den type error oppstår. 
        notFoundError: {message: 'Resource not found', statusCode: HTTPCodes.ClientSideErrorResponse.NotFound}, 
        //samme som over, definerer en annen key/nøkkel pair innen errorMap objektet, key/nøkkelen er authenticationError som representerer en annen type error
        //statusCode: HTTPCodes.ClientSideErrorResponse.Unauthorized - HTTP statuskoden vil bli sendt når denne typen error oppstår
        authenticationError: {message: 'Unauthorized', statusCode: HTTPCodes.ClientSideErrorResponse.Unauthorized},
    };
    // destruerer meldingen og statuskoden fra error*Map basert på navnet på feilen (err.constructor.name). hvis ikke funnet, bruk standard intern serverfeil med statuskode 400
    const {message = 'Internal server error', statusCode = HTTPCodes.ClientSideErrorResponse.BadRequest} = errorMap[err.constructor.name] || {};
    //setter HTTP status kode og sender en JSON respons med en error melding
    res.status(statusCode).json({error: message});
});
//triggering a notFoundError:
//server.get er når noen feks går inn på siden /nonexistent, vil den gi tilbake en melding
server.get("/nonexistent", (req, res, next) =>{  
    //lager et nytt error objekt med en melding, og kaller den for notFoundError
    const notFoundError = new Error('Resource not found');
    notFoundError.name = 'notFoundError';
    //sender erroren til neste middleware funksjonen, som da er error handler middlewaren ovenfor
    next(notFoundError);
});


// Start the server 
server.listen(server.get('port'), function () {
    console.log('server running', server.get('port'));
});