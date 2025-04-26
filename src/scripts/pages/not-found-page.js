// pages/not-found-page.js
class NotFoundPage {
    async render() {
      return `
        <section class="not-found-container">
          <div class="not-found-content">
            <h1 class="not-found-title">404</h1>
            <h2 class="not-found-subtitle">Halaman Tidak Ditemukan</h2>
            <p class="not-found-description">Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
            <a href="#/" class="not-found-button">Kembali ke Beranda</a>
          </div>
        </section>
      `;
    }
  
    async afterRender() {}
  }
  
  export default NotFoundPage;
  