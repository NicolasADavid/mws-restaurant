import regeneratorRuntime from "regenerator-runtime";
import DBHelper from './dbhelper';
import favoriteButton from './favorite-button';
// import './register.js';

let restaurants,
  neighborhoods,
  cuisines;
var newMap;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added 
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods()
  .then((neighborhoods)=>{
    self.neighborhoods = neighborhoods;
    fillNeighborhoodsHTML();
  })
}

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    option.removeAttribute('tabindex');
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DBHelper.fetchCuisines()
  .then((cuisines)=>{
    self.cuisines = cuisines;
    fillCuisinesHTML();
  })
}

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
const initMap = () => {
  
  newMap = L.map('map', {

    center: [40.722216, -73.987501],
    zoom: 12,
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

  updateRestaurants();
}
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood)
  .then((restaurants)=>{
    resetRestaurants(restaurants);
    fillRestaurantsHTML(restaurants);
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {

  const ul = document.getElementById('restaurants-list');

  restaurants.forEach(async (restaurant) => {

    const li = await createRestaurantHTML(restaurant);

    ul.append(li);

  });

  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = async (restaurant) => {

  // The overall element
  const li = document.createElement('li');
  li.className = "restaraunt-tile"

  // The image
  const image = document.createElement('img');
  image.className = 'restaurant-img';

  const imageURLbase = await DBHelper.imageUrlForRestaurant(restaurant);

  console.log(imageURLbase);
  if(imageURLbase == undefined){
    image.src = "images/na.jpg"
  } else {
    const imgurl1x = imageURLbase + "-800_1x.jpg";
    const imgurl2x = imageURLbase + "-1600_2x.jpg";

    image.src = imgurl1x;
    image.srcset = `${imgurl1x} 1x, ${imgurl2x} 2x`;
  }
  
  image.alt = restaurant.name + " restaurant image";

  // image.onerror = "na.jpg";
  // image.onerror="this.src='na.jpg';"

  li.append(image);

  // Favorite
  const favButton = favoriteButton(restaurant);
  li.append(favButton);

  // Name of restaraunt
  const name = document.createElement('h3');
  name.innerHTML = restaurant.name;
  name.tabIndex = 2;
  li.append(name);

  // Name of neighborhood
  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  neighborhood.tabIndex = 2;
  li.append(neighborhood);

  // Address
  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  address.tabIndex = 2;
  li.append(address);

  // Button
  const more = document.createElement('a');
  more.tabIndex = 2;
  more.innerHTML = 'View Details';
  // Url for restaraunt details
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.aria-
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {

  restaurants.forEach(restaurant => {

    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, newMap);

    marker.on("click", onClick);

    function onClick() {

      window.location.href = marker.options.url;

    }

    self.markers.push(marker);

  });

} 
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */

