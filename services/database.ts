import { DBUser, User } from '../types';

const DB_KEY = 'mindEase_users_db';
const SIMULATED_DELAY_MS = 600;

// Helper to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const database = {
  /**
   * Simulates finding a user by email in the database
   */
  async findUserByEmail(email: string): Promise<DBUser | null> {
    await delay(SIMULATED_DELAY_MS);
    
    try {
      const storedData = localStorage.getItem(DB_KEY);
      const users: DBUser[] = storedData ? JSON.parse(storedData) : [];
      return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    } catch (error) {
      console.error("Database Error:", error);
      return null;
    }
  },

  /**
   * Simulates creating a new user in the database
   */
  async createUser(userData: { name: string; email: string; password: string }): Promise<User> {
    await delay(SIMULATED_DELAY_MS);

    const storedData = localStorage.getItem(DB_KEY);
    const users: DBUser[] = storedData ? JSON.parse(storedData) : [];

    // Check for existing user again to prevent race conditions
    if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error("User already exists");
    }

    const newUser: DBUser = {
      id: crypto.randomUUID(),
      name: userData.name,
      email: userData.email,
      password: userData.password, // In a real app, hash this before saving!
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(DB_KEY, JSON.stringify(users));

    // Return sanitized user object (without password)
    return { name: newUser.name, email: newUser.email };
  },

  /**
   * Simulates a login attempt
   */
  async loginUser(email: string, password: string): Promise<User> {
    const user = await this.findUserByEmail(email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // In a real app, compare hashed passwords here
    if (user.password !== password) {
      throw new Error("Invalid email or password");
    }

    return { name: user.name, email: user.email };
  }
};
