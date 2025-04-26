const NAME_KEY = "name";
const TOKEN_KEY = "token";

const AuthService = {
  setAuth(userData) {
    localStorage.setItem(NAME_KEY, userData.name);
    localStorage.setItem(TOKEN_KEY, userData.token);
  },

  getAuth() {
    const name = localStorage.getItem(NAME_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (!name || !token) return null;
    
    return {
      name,
      token
    };
  },

  destroyAuth() {
    localStorage.removeItem(NAME_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  isLoggedIn() {
    return !!this.getAuth();
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUserInfo() {
    const auth = this.getAuth();
    if (!auth) return null;
    return auth;
  },
};

export default AuthService;
