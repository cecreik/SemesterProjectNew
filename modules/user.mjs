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
