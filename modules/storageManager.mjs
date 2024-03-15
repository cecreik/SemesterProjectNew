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
            throw new Error('Failed to update user information'); 
            client.end();
        }
    }
    
    async deleteUser(userId) {
        const client = new pg.Client(this.#credentials);
        try {
            await client.connect();
            const output = await client.query('DELETE FROM "public"."Users" WHERE id = $1', [userId]);
            if (output.rowCount === 1) {
                console.log(`User ${userId} deleted`);
            } else {
                console.log(`User ${userId} does not exist`);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        } finally {
            client.end();
        }
    }
     

    async createUser(user) {
        const client = new pg.Client(this.#credentials);
        try {
            await client.connect();
            const output = await client.query('INSERT INTO "public"."Users"("name", "email", "password") VALUES($1::Text, $2::Text, $3::Text) RETURNING id;', [user.name, user.email, user.password]);
            if (output.rows.length == 1) {
                user.id = output.rows[0].id;
            }
        } catch (error) {
            console.error(error);
        } finally {
            client.end(); 
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
                    return null; 
                }
                return result.rows[0]; 
            } catch (error) {
                throw error;
            } finally {
                client.end();
            }
        }
        
    }

let connectionString = process.env.ENVIORMENT == "local" ? process.env.DB_CONNECTIONSTRING_LOCAL : process.env.DB_CONNECTIONSTRING_PROD;
    //if (connectionString == undefined) {
        //throw ("You forgot the db connection string");
//}

export default new DBManager(connectionString);