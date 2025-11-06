interface StoredUser {
  id: number;
  email: string;
  name: string;
}

export const storage = {
  getUserId: (): number | null => {
    const user = storage.getUser();
    return user?.id || null;
  },

  getUser: (): StoredUser | null => {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },

  setUser: (user: StoredUser): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearUser: (): void => {
    localStorage.removeItem('user');
    storage.clearStoredSession();
  },

  getStoredSession: (): string | null => {
    return sessionStorage.getItem('currentSessionToken');
  },

  setStoredSession: (sessionToken: string): void => {
    sessionStorage.setItem('currentSessionToken', sessionToken);
  },

  clearStoredSession: (): void => {
    sessionStorage.removeItem('currentSessionToken');
  },

  isAuthenticated: (): boolean => {
    return storage.getUser() !== null;
  }
};