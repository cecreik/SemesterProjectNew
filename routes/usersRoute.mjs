import express from "express";
import User from "../modules/user.mjs";
import { HTTPCodes } from "../modules/httpConstants.mjs";
import SuperLogger from "../modules/SuperLogger.mjs";
import { generateHash } from "../modules/crypto.mjs";
import DBManager from "../modules/storageManager.mjs";

const USER_API = express.Router();
USER_API.use(express.json()); 

USER_API.get('/users', async (req, res, next) => {
    try {
        const users = await DBManager.getAllUsers();
        res.status(HTTPCodes.SuccessfullResponse.Ok).json(users);
        SuperLogger.log('GET /users', SuperLogger.LOGGING_LEVELS.NORMAL);
    } catch (error) {
        console.error('Error retrieving all users:', error);
        res.status(HTTPCodes.ServerErrorResponse.InternalError).json({ error: 'Internal server error' });
    }
});

USER_API.get('/:id', async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await DBManager.getUserById(userId);
        if (!user) {
            res.status(HTTPCodes.ClientSideErrorResponse.NotFound).json({ error: 'User not found' });
        } else {
            res.status(HTTPCodes.SuccessfullResponse.Ok).json(user);
        }
        SuperLogger.log(`GET /${userId}`, SuperLogger.LOGGING_LEVELS.NORMAL);
    } catch (error) {
        console.error('Error retrieving user by ID:', error);
        res.status(HTTPCodes.ServerErrorResponse.InternalError).json({ error: 'Internal server error' });
    }
});

USER_API.post('/', async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(HTTPCodes.ClientSideErrorResponse.BadRequest).json({ error: 'Missing required fields' });
            return;
        }
        
        const hashedPassword = generateHash(password, process.env.SECRET);
        
        const newUser = new User(); 
        newUser.name = name;
        newUser.email = email;
        newUser.password = hashedPassword;
        
        await newUser.save(); 
        res.status(HTTPCodes.SuccessfullResponse.Ok).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(HTTPCodes.ServerErrorResponse.InternalError).json({ error: 'Internal server error' });
    }
});

USER_API.put('/userupdate/:id', async (req, res) => {
    const userId = req.params.id;
    const { name, password } = req.body; 
    if (!userId) {
        res.status(HTTPCodes.ClientSideErrorResponse.BadRequest).json({ error: 'User ID is missing' });
        return;
    }
    try {
        const hashedPassword = generateHash(password, process.env.SECRET);
        const updatedUser = await DBManager.updateUser(userId, name, hashedPassword);

        res.status(HTTPCodes.SuccessfullResponse.Ok).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(HTTPCodes.ServerErrorResponse.InternalError).json({ error: 'Internal server error' });
    }
});

USER_API.delete('/deleteUser/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        console.log(`Attempting to delete user with ID ${userId}`);
        await DBManager.deleteUser(userId);
        console.log(`User with ID ${userId} deleted successfully`);
        res.status(HTTPCodes.SuccessfullResponse.Ok).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(HTTPCodes.ServerErrorResponse.InternalError).json({ error: 'Internal server error' });
    }
});

USER_API.use((err, req, res, next) => {
    console.error(err);
    const errorMap = {
      notFoundError: { message: 'Resource not found', statusCode: 404 },
      authenticationError: { message: 'Unauthorized', statusCode: 401 },
    };
    const { message = 'Internal server error', statusCode = 400 } = errorMap[err.name] || {};
    res.status(statusCode).json({ error: message });
});

export default USER_API;

