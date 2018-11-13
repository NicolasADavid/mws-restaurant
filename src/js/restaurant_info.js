import regeneratorRuntime from "regenerator-runtime";
import DBHelper from './dbhelper';
import favoriteButton from './favorite-button';
import review from './review';
import './register.js';

let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});

/**
 * Initialize leaflet map
 */
const initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      if(navigator.onLine){
        newMap = L.map('map', {
          center: [restaurant.latlng.lat, restaurant.latlng.lng],
          zoom: 16,
          scrollWheelZoom: false
        });
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
          mapboxToken: 'pk.eyJ1IjoidGVycmlmaWNuaWNvIiwiYSI6ImNqbTl4b2hpODU2eXEzcHA0a21ndjZ3b2cifQ.Pl5wNPr4rbcOlt98awMCBA',
          maxZoom: 18,
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          id: 'mapbox.streets'    
        }).addTo(newMap);
        fillBreadcrumb();
        DBHelper.mapMarkerForRestaurant(restaurant, newMap);
      } else {
        console.log("Offline. Cannot fetch maps.");
      }
      
    }
  });
}  

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    let error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id)
    .then((restaurant)=>{
      self.restaurant = restaurant;
      if (!restaurant) {
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = async (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'

  const imageURLbase = await DBHelper.imageUrlForRestaurant(restaurant);

  const imgurl1x = imageURLbase + "-800_1x.jpg";
  const imgurl2x = imageURLbase + "-1600_2x.jpg";

  image.src = imgurl1x;
  image.srcset = `${imgurl1x} 1x, ${imgurl2x} 2x`;
  image.alt = restaurant.name + " restaurant image";

  // Favorite
  const favoriteContainer = document.getElementById('favorite-container')
  const favButton = favoriteButton(restaurant);
  favoriteContainer.append(favButton);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  
  // fill reviews
  DBHelper.fetchReviewsByRestaurantId(restaurant.id)
  .then(fillReviewsHTML);
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.tabIndex = 0;
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    time.tabIndex = 0;
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (reviews = self.restaurant.reviews) => {

  console.log("Filling reviews: ", reviews);

  // Existing Reviews
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  title.tabIndex = 0;
  container.appendChild(title);

  // If no reviews
  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    noReviews.tabIndex = 0;
    container.appendChild(noReviews);
  } else {
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
      ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
  }

  const reviewContainer = document.createElement('div');
  reviewContainer.className = "review";

  // New review form
  const h3 = document.createElement('h3');
  h3.innerHTML = "Submit a review";
  reviewContainer.appendChild(h3);

  const id = getParameterByName('id');
  reviewContainer.appendChild(review(id));  

  container.appendChild(reviewContainer);
}

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = (review) => {
  const li = document.createElement('li');
  const nameStrong = document.createElement('strong')
  const name = document.createElement('p');
  name.tabIndex = 0;
  name.innerHTML = review.name;
  nameStrong.appendChild(name)
  li.appendChild(nameStrong);

  const date = document.createElement('p');
  date.tabIndex = 0;
  date.innerHTML = new Date(review.createdAt).toLocaleDateString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.tabIndex = 0;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.tabIndex = 0;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url)
  url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
