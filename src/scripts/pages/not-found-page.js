// pages/not-found-page.js
class NotFoundPage {
    async render() {
      return `
        <section>
          <h2>404 - Page Not Found</h2>
          <p>Halaman yang Anda cari tidak tersedia.</p>
          <a href="#/">Kembali ke Beranda</a>
        </section>
      `;
    }
  
    async afterRender() {}
  }
  
  export default NotFoundPage;
  