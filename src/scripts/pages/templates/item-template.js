export function createItemTemplate(story) {
    
    const hasLocation = story.lat && story.lon;
    
    return `
      <article class="story-card">
        <img src="${story.photoUrl}" alt="Foto cerita oleh ${story.name}" loading="lazy" />
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        <p class="created-date">${new Date(story.createdAt).toLocaleDateString()}</p>
        ${hasLocation ? `<p class="location">📍 Lokasi: ${story.lat}, ${story.lon}</p>` : ''}
        <div class="story-card-actions">
          <a href="#/story/${story.id}" class="btn-detail">Lihat Detail</a>
        </div>
      </article>
    `;
}