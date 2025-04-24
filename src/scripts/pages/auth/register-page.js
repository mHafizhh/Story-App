export default class RegisterPage {
    async render() {
      return `
        <section class="form-container">
          <h2>Daftar Akun</h2>
          <form id="register-form">
            <input type="text" id="name" placeholder="Nama Lengkap" required />
            <input type="email" id="email" placeholder="Email" required />
            <input type="password" id="password" placeholder="Password" required />
            <button type="submit">Daftar</button>
          </form>
          <p>Sudah punya akun? <a href="#/login">Masuk di sini</a></p>
        </section>
      `;
    }
  
    async afterRender() {
      const form = document.querySelector('#register-form');
  
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
  
        const name = document.querySelector('#name').value;
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;
  
        try {
          const response = await fetch('https://story-api.dicoding.dev/v1/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
          });
  
          const result = await response.json();
  
          if (!response.ok) {
            alert(result.message || 'Gagal mendaftar');
            return;
          }
  
          alert('Pendaftaran berhasil! Silakan login.');
          window.location.hash = '#/login';
        } catch (error) {
          alert('Terjadi kesalahan saat mendaftar.');
          console.error(error);
        }
      });
    }
}
  