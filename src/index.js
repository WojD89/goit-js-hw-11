import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.getElementById('search-form');
const gallery = document.getElementById('gallery');
const loadMoreBtn = document.getElementById('load-more');

let searchQuery = '';
let currentPage = 1;
let totalHits = 0;
let lightbox = new SimpleLightbox('.gallery a', {});

const API_KEY = '41352870-ce801ab1c44b186ed563ae895';
const API_URL = 'https://pixabay.com/api/';

document.addEventListener('DOMContentLoaded', () => {
  loadMoreBtn.style.display = 'none';
});

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  searchQuery = event.target.searchQuery.value;
  currentPage = 1;
  gallery.innerHTML = '';
  loadMoreBtn.style.display = 'none';
  fetchImages();
});

async function fetchImages() {
  const url = `${API_URL}?key=${API_KEY}&q=${encodeURIComponent(
    searchQuery
  )}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=40`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    totalHits = data.totalHits;

    if (data.hits.length === 0 && currentPage === 1) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      loadMoreBtn.style.display = 'none';
      return false;
    } else if (data.hits.length === 0) {
      return false;
    } else {
      displayImages(data.hits);
      loadMoreBtn.style.display =
        gallery.children.length < totalHits ? 'block' : 'none';
      return true;
    }
  } catch (error) {
    console.error('Error fetching images:', error);
    Notiflix.Notify.failure('Error fetching images. Please try again later.');
    return false;
  }
}

loadMoreBtn.addEventListener('click', async () => {
  currentPage++;
  const hasMoreImages = await fetchImages();

  if (!hasMoreImages && gallery.children.length >= totalHits) {
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
    loadMoreBtn.style.display = 'none';
  }
});

function displayImages(images) {
  images.forEach(image => {
    const photoCard = document.createElement('div');
    photoCard.classList.add('photo-card');
    photoCard.innerHTML = `
      <a href="${image.largeImageURL}" data-lightbox="gallery" data-title="${image.tags}">
          <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      </a>
      <div class="info">
          <p class="info-item"><b>Likes:</b> ${image.likes}</p>
          <p class="info-item"><b>Views:</b> ${image.views}</p>
          <p class="info-item"><b>Comments:</b> ${image.comments}</p>
          <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
      </div>
    `;
    gallery.appendChild(photoCard);
  });

  lightbox.refresh();

  if (gallery.children.length >= totalHits) {
    loadMoreBtn.style.display = 'none';
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}