export function getToken() {
    const token = localStorage.getItem('token');
    return token;
  }
  
  export function getUserName() {
    return localStorage.getItem('userName');
}
  
  export function isAuthenticated() {
    return !!getToken();
}
  
  export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    console.log('Token and user info removed from localStorage');
    window.location.hash = '#/login';
    location.reload();
}
  