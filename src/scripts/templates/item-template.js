const createItemTemplate = (story) => {
  const { id, name, description, photoUrl, createdAt } = story;
  
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgdmlld0JveD0iMCAwIDMyMCAzMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIzMjAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zNWVtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  
  return `
    <article class="story-card">
      <img 
        src="${photoUrl}" 
        alt="Foto cerita oleh ${name}"
        class="story-image"
        onerror="this.onerror=null; this.src='${placeholderImage}';"
        loading="lazy"
      />
      <div class="story-content">
        <h3>${name}</h3>
        <p class="story-description">${description}</p>
        <p class="story-date">${new Date(createdAt).toLocaleDateString()}</p>
      </div>
      <div class="story-card-actions">
        <a href="#/detail/${id}" class="btn-detail">Lihat Detail</a>
      </div>
    </article>
  `;
};

export { createItemTemplate };