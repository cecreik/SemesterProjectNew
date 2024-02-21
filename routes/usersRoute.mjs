import express from "express";
import User from "../modules/user.mjs";
import { HTTPCodes } from "../modules/httpConstants.mjs";
import SuperLogger from "../modules/SuperLogger.mjs";

const USER_API = express.Router();
USER_API.use(express.json());

const users = [];

USER_API.get('/', (req, res, next) => {
    // Your GET request handler
});

USER_API.get('/:id', (req, res, next) => {
    // Your GET request handler for retrieving a specific user
});

USER_API.post('/', async (req, res, next) => {
    const { name, email, password } = req.body;

    if (name && email && password) {
        // Check if user with the same email already exists
        const userExists = users.some(user => user.email === email);
        if (!userExists) {
            const newUser = new User({ name, email, password });
            // Here you would typically save the user to your database
            users.push(newUser); // For demonstration purposes, pushing to a local array
            res.status(HTTPCodes.SuccesfullRespons.Ok).json(newUser).end();
        } else {
            res.status(HTTPCodes.ClientSideErrorRespons.BadRequest).send("User already exists").end();
        }
    } else {
        res.status(HTTPCodes.ClientSideErrorRespons.BadRequest).send("Missing required fields").end();
    }
});

USER_API.put('/:id', (req, res) => {
    // Your PUT request handler for updating user information
});

USER_API.delete('/:id', (req, res) => {
    // Your DELETE request handler for deleting a user
});

export default USER_API;
