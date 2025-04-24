export function createItemTemplate(story) {
    return `
      <article class="story-card">
        <img src="${story.photoUrl}" alt="Foto cerita oleh ${story.name}" loading="lazy" />
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        <p class="created-date">${new Date(story.createdAt).toLocaleDateString()}</p>
      </article>
    `;
}