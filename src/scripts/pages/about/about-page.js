export default class AboutPage {
  async render() {
    return `
      <section class="container about-container">
        <h1 class="page-title">Tentang Story App</h1>
        
        <div class="about-content">
          <p>Story App adalah platform berbagi cerita seputar Dicoding, mirip seperti post Instagram namun khusus untuk pengalaman belajar dan berkarya di Dicoding.</p>
          
          <h2>Fitur Utama</h2>
          <ul>
            <li>Lihat cerita dari pengguna Dicoding lainnya</li>
            <li>Bagikan cerita pengalaman belajar Anda</li>
            <li>Unggah gambar untuk melengkapi cerita Anda</li>
            <li>Tandai lokasi saat membagikan cerita</li>
          </ul>
          
          <h2>Teknologi</h2>
          <p>Aplikasi ini dikembangkan menggunakan:</p>
          <ul>
            <li>HTML, CSS, dan JavaScript (Vanilla)</li>
            <li>Single Page Application (SPA) Architecture</li>
            <li>REST API</li>
            <li>Local Storage untuk Authentication</li>
          </ul>
          
          <h2>Pengembang</h2>
          <p>Aplikasi ini dibuat sebagai proyek latihan dalam pembelajaran di Dicoding Indonesia.</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // afterRender implementation
  }
}
