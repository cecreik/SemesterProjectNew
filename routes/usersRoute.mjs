import express from "express";
import User from "../modules/user.mjs";
import { HTTPCodes } from "../modules/httpConstants.mjs";
import SuperLogger from "../modules/SuperLogger.mjs";


const USER_API = express.Router();
USER_API.use(express.json()); // This makes it so that express parses all incoming payloads as JSON for this route.

const users = [];

USER_API.get('/users', async (req, res, next) => {
    SuperLogger.log("Demo of logging tool");
    SuperLogger.log("A important msg", SuperLogger.LOGGING_LEVELS.CRTICAL);

    try {
        let users = new User();
        users = await users.displayAll();
        res.status(HTTPCodes.SuccesfullResponse.Ok).json(users);
    } catch {
        consoloe.error('Error retriving all users:', error);
        res.status(HTTPCodes.serverSideResponse.InternalServerError).json({error: 'Internal server error'});
    }
});


USER_API.get('/:id', (req, res, next) => {

})
    // Tip: All the information you need to get the id part of the request can be found in the documentation 
    // https://expressjs.com/en/guide/routing.html (Route parameters)

    /// TODO: 
    // Return user object


USER_API.post('/', async (req, res, next) => {

    // This is using javascript object destructuring.
    // Recomend reading up https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#syntax
    // https://www.freecodecamp.org/news/javascript-object-destructuring-spread-operator-rest-parameter/
    const { name, email, password } = req.body;
    if (name != "" && email != "" && password != "") {
        let user = new User();
        user.name = name;
        user.email = email;

        ///TODO: Do not save passwords.
        user.pswHash = password;

        ///TODO: Does the user exist?   
        let exists = false;

        if (!exists) {
            //TODO: What happens if this fails?
            user = await user.save();
            res.status(HTTPCodes.SuccesfullResponse.Ok).json(JSON.stringify(user)).end();
        } else {
            res.status(HTTPCodes.ClientSideErrorResponse.BadRequest).end();
        }

    } else {
        res.status(HTTPCodes.ClientSideErrorResponse.BadRequest).send("Mangler data felt").end();
    }

});

USER_API.post('/:id', (req, res, next) => {
    /// TODO: Edit user
    const user = new User(); //TODO: The user info comes as part of the request 
    user.save();
});

USER_API.delete('/users/:id', async (req, res) => {
    const userId = req.params.id;

    console.log('Deleting user with the ID:', userId);

    //must check if it is the logged in user that wants to delte its own profile or an Admin 

    let deleteUser = new User();

    if (userId) {
        try {
            // Call the deleteUser method, not deletedUser
            deleteUser = await deleteUser.delete(userId);

            res.status(HTTPCodes.successfulResponse.Ok).json({ msg: 'The user with the id:' + userId + ' is now deleted' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(HTTPCodes.InternalServerError).json({ error: 'Internal Server Error' });
        }
    } else {
        console.log('User not found for deletion');
        res.status(HTTPCodes.ClientSideErrorResponse.NotFound).json({ error: 'User not found' });
    }
});

USER_API.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({ error: 'Internal Server Error' });
});


export default USER_API