import DBManager from "./storageManager.mjs";

class User {
  constructor() {
    this.email;
    this.pswHash;
    this.name;
    this.id;
  }

  async save() {
    if (this.id == null) {
      return await DBManager.createUser(this);
    } else {
      return await DBManager.updateUser(this);
    }
  }

  delete() {
    DBManager.deleteUser(this);
  }

  async getUserByEmail(email) {
    try {
        // Implement your logic to fetch user from the database based on email
        // For example:
        const user = await DBManager.getUserByEmail(email);
        if (!user) {
            // If user not found, you can throw a custom error
            const error = new Error('User not found');
            error.statusCode = 404; // You can attach additional information to the error object
            throw error;
        }
        return user;
    } catch (error) {
        // Log the error for debugging purposes
        console.error('Error fetching user by email:', error);
        // Rethrow the error or handle it based on your application's requirements
        throw error;
    }
  }
}

export default User;
