import API from '../../data/api';
import { createItemTemplate } from '../templates/item-template';

export default class HomePage {
  async render() {
    return `
      <section class="container">
        <h1>Daftar Cerita</h1>
        <div id="story-list" class="grid"></div>
        <div id="map" style="height: 400px; margin-top: 2rem;"></div>
      </section>
    `;
  }

  async afterRender() {
    const stories = await API.getAllStories();
    console.log('Fetched stories:', stories);
    const listContainer = document.getElementById('story-list');

    if (stories.length === 0) {
      listContainer.innerHTML = '<p>No stories available.</p>';
      return;
    }

    stories.forEach((story) => {
      listContainer.innerHTML += createItemTemplate(story);
    });

    const map = L.map('map').setView([-2.5, 118], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        L.marker([story.lat, story.lon])
          .addTo(map)
          .bindPopup(`<b>${story.name}</b><br>${story.description}`);
      }
    });
  }
}
