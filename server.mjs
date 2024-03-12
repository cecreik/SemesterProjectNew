import 'dotenv/config'
import express from 'express' // Express is installed using npm
import USER_API from './routes/usersRoute.mjs'; // This is where we have defined the API for working with users.
import SuperLogger from './modules/SuperLogger.mjs';
import printDeveloperStartupInportantInformationMSG from './modules/developerHelpers.mjs';
import DBManager from './modules/storageManager.mjs';
import {generateHash} from "./modules/crypto.mjs";

printDeveloperStartupInportantInformationMSG();

// Creating an instance of the server
const server = express();
// Selecting a port for the server to use.
const port = (process.env.PORT || 8080);
server.set('port', port);



// Enable logging for server
const logger = new SuperLogger();
server.use(logger.createAutoHTTPRequestLogger()); // Will logg all http method requests
//parse incoming JSON payloads
server.use(express.json());
// Defining a folder that will contain static files.
server.use(express.static('public'));

// Telling the server to use the USER_API (all urls that uses this code will have to have the /user after the base address)
server.use("/user", USER_API);

// Login endpoint
server.post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      console.log("before getUserByEmail");
      // Fetch user from the database based on email
      const user = await DBManager.getUserByEmail(email);
      if (!user) {
        // If user not found, send 404 error
        const notFoundError = new Error('User not found');
        notFoundError.name = 'notFoundError';
        throw notFoundError;
      }
      console.log("DB pwd:" + user.password);
      console.log("input pwd:" + password);
      // Check if the password matches
      if (user.password !== generateHash(password, process.env.SECRET)) {
        // If password is incorrect, send 401 error
        const authenticationError = new Error('Invalid password');
        authenticationError.name = 'authenticationError';
        throw authenticationError;
      }
      // If login is successful, send user data
      res.json({ message: 'Login successful', user });
    } catch (error) {
      // Handle errors
      next(error);
    }
});

  // Error handling middleware
server.use((err, req, res, next) => {
    SuperLogger.log(err);
    const errorMap = {
      notFoundError: { message: 'Resource not found', statusCode: 404 },
      authenticationError: { message: 'Unauthorized', statusCode: 401 },
    };
    const { message = 'Internal server error', statusCode = 400 } = errorMap[err.name] || {};
    res.status(statusCode).json({ error: message });
});

// Triggering a notFoundError
server.get("/nonexistent", (req, res, next) => {
    const notFoundError = new Error('Resource not found');
    notFoundError.name = 'notFoundError';
    next(notFoundError);
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});