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
        return await DBManager.updateUser(this.id, this);
    }
}

async update() {
    try {
        return await DBManager.updateUser(this.id, this);
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

async delete() {
    try {
        return await DBManager.deleteUser(this);
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

  async getUserByEmail(email) {
    try {
      const user = await DBManager.getUserByEmail(email);
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }
      return user;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }
}

export default User;
