import express from 'express';
import 'dotenv/config';
import SuperLogger from './modules/SuperLogger.mjs';
import printDeveloperStartupInportantInformationMSG from './modules/developerHelpers.mjs';
import DBManager from './modules/storageManager.mjs';
import { generateHash } from './modules/crypto.mjs';

import USER_API from './routes/usersRoute.mjs'

printDeveloperStartupInportantInformationMSG();

const server = express();
const port = process.env.PORT || 8080;
server.set('port', port);

const logger = new SuperLogger();

server.use(logger.createAutoHTTPRequestLogger()); 
server.use(express.json());
server.use(express.static('public'));

server.use("/user",USER_API);

server.post('/login', async (req, res, next) => {
  try {
      const { email, password } = req.body;
      console.log("Received login request with email:", email);
      
      const user = await DBManager.getUserByEmail(email);
      console.log("Retrieved user from the database:", user);
      
      if (!user) {
          const notFoundError = new Error('User not found');
          notFoundError.name = 'notFoundError';
          throw notFoundError;
      }
      console.log("DB pwd:", user.password);
      console.log("Input pwd:", password);
      
      if (user.password !== generateHash(password, process.env.SECRET)) {
          const authenticationError = new Error('Invalid password');
          authenticationError.name = 'authenticationError';
          throw authenticationError;
      }
      res.json({ message: 'Login successful', user });
  } catch (error) {
      console.error("Login error:", error);
      next(error);
  }
});

server.post('/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
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

server.get("/nonexistent", (req, res, next) => {
    const notFoundError = new Error('Resource not found');
    notFoundError.name = 'notFoundError';
    next(notFoundError);
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
