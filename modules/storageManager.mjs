import pg from "pg"
import SuperLogger from "./SuperLogger.mjs";


class DBManager {

    #credentials = {};

    constructor(connectionString) {
        this.#credentials = {
            connectionString,
            ssl: (process.env.DB_SSL === "true") ? process.env.DB_SSL : false
        };

    }

    async updateUser(userId, name, password) {
        const client = new pg.Client(this.#credentials);
    
        try {
            await client.connect();

            const output = await client.query('UPDATE "public"."Users" SET "name" = $1, "password" = $2 WHERE id = $3 RETURNING *', [name, password, userId]);
    

            if (output.rows.length > 0) {
                const updatedUser = output.rows[0];
                return updatedUser;
              } else {
                throw new Error("User not found or not updated");
              }

        } catch (error) {
            console.error('Error updating user:', error);
            throw new Error('Failed to update user information'); // Rethrow the error to handle it in the calling code
        } finally {
            client.end();
        }
    }
    
    async deleteUser(user) {

        const client = new pg.Client(this.#credentials);

        try {
            await client.connect();
            const output = await client.query('Delete from "public"."Users"  where id = $1;', [user.id]);

            if (output.rowCount === 1){
                console.log(`User ${user.id} deleted`);
            }else{
                console.log(`User ${user.id} does not exist`);
            }

            // Client.Query returns an object of type pg.Result (https://node-postgres.com/apis/result)
            // Of special intrest is the rows and rowCount properties of this object.


        } catch (error) {

        } finally {
            client.end(); // Always disconnect from the database.
        }

        return user;
    }

    async createUser(user) {

        const client = new pg.Client(this.#credentials);

        try {
            await client.connect();
            const output = await client.query('INSERT INTO "public"."Users"("name", "email", "password") VALUES($1::Text, $2::Text, $3::Text) RETURNING id;', [user.name, user.email, user.pswHash]);

            // Client.Query returns an object of type pg.Result (https://node-postgres.com/apis/result)
            // Of special intrest is the rows and rowCount properties of this object.

            if (output.rows.length == 1) {
                // We stored the user in the DB.
                user.id = output.rows[0].id;
            }

        } catch (error) {
            console.error(error);

        } finally {
            client.end(); // Always disconnect from the database.
        }

        return user;

    }

        async getAllUsers(){
            const client = new pg.Client(this.#credentials);

            try{
                await client.connect();
                const output = await client.query('SELECT * FROM public."Users"');
                const users = output.rows;
                return users;

            } catch (error){
                console.error(error);
                throw error;

            } finally {
                client.end();
            }
        }

        async getUserByEmail(email) {
            const client = new pg.Client(this.#credentials);
    
            try {
                await client.connect();
                const query = 'SELECT * FROM "public"."Users" WHERE "email" = $1';
                const result = await client.query(query, [email]);
                if (result.rows.length === 0) {
                    return null; // Return null if user not found
                }
                return result.rows[0]; // Return the user object
            } catch (error) {
                // Handle errors...
                throw error;
            } finally {
                client.end();
            }
        }
        
    }
// The following is thre examples of how to get the db connection string from the enviorment variables.
// They accomplish the same thing but in different ways.
// It is a judgment call which one is the best. But go for the one you understand the best.

// 1:
let connectionString = process.env.ENVIORMENT == "local" ? process.env.DB_CONNECTIONSTRING_LOCAL : process.env.DB_CONNECTIONSTRING_PROD;

// We are using an enviorment variable to get the db credentials 
if (connectionString == undefined) {
    throw ("You forgot the db connection string");
}

export default new DBManager(connectionString);

//