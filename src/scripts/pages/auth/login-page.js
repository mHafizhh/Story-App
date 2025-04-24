export default class LoginPage {
    async render() {
      return `
        <section class="form-container">
          <h2>Masuk</h2>
          <form id="login-form">
            <input type="email" id="email" placeholder="Email" required />
            <input type="password" id="password" placeholder="Password" required />
            <button type="submit">Masuk</button>
          </form>
          <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
        </section>
      `;
    }
  
    async afterRender() {
      const form = document.querySelector('#login-form');
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
  
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;
  
        try {
          const response = await fetch('https://story-api.dicoding.dev/v1/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });
  
          const result = await response.json();
  
          if (!response.ok) {
            alert(result.message || 'Login gagal');
            return;
          }
  
          // Simpan token ke localStorage
          localStorage.setItem('token', result.loginResult.token);
          localStorage.setItem('userName', result.loginResult.name);
  
          alert('Login berhasil!');
          window.location.hash = '#/';
        } catch (error) {
          alert('Terjadi kesalahan. Coba lagi nanti.');
          console.error(error);
        }
      });
    }
}
  