/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 8000 // Change this to your server port
    return `http://localhost:${port}/data/restaurants.json`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants() {
    
    return fetch('http://localhost:1337/restaurants')
    .then(function(response) {
      return response.json();
    })
    .then(function(restaurants){
      return restaurants;
    })
    .catch(function(err){
      console.log("fetchRestaurants", err);
    })

  }

  static fetchRestaurantById(id){

    return DBHelper.fetchRestaurants()
    .then((restaurants)=>{

      const restaurant = restaurants.find(r => r.id == id);

      if (restaurant) { // Got the restaurant

        return restaurant;

      } else { // Restaurant does not exist in the database

        throw "Restaurant does not exist!"

      }

    })
    .catch((err)=>{
      console.log("fetchRestaurantById", err);
    })
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine) {

    return DBHelper.fetchRestaurants()
    .then((restaurants)=>{

      // Filter restaurants to have only given cuisine type
      return restaurants.filter(r => r.cuisine_type == cuisine);

    })
    .catch((err)=>{
      console.log("fetchRestaurantByCuisine", err);
    })
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood) {

    return DBHelper.fetchRestaurants()
    .then((restaurants)=>{

      return restaurants.filter(r => r.neighborhood == neighborhood);

    })
    .catch((err)=>{
      console.log("fetchRestaurantByNeighborhood", err);
    })
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
    // Fetch all restaurants
    return DBHelper.fetchRestaurants()
    .then((restaurants)=>{

      if (cuisine != 'all') { // filter by cuisine

        restaurants = restaurants.filter(r => r.cuisine_type == cuisine);

      }
      
      if (neighborhood != 'all') { // filter by neighborhood

        restaurants = restaurants.filter(r => r.neighborhood == neighborhood);

      }

      return restaurants;

    })
    .catch((err)=>{
      console.log("fetchRestaurantByCuisineAndNeighborhood", err);
    })

  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods() {

    return DBHelper.fetchRestaurants()
    .then((restaurants)=>{

      // Get all neighborhoods from all restaurants
      const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)

      // Remove duplicates from neighborhoods
      const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)

      return uniqueNeighborhoods;

    })
    .catch((err)=>{
      console.log("fetchNeighborhoods", err);
    })
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines() {

    return DBHelper.fetchRestaurants()
    .then((restaurants)=>{
      const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
      // Remove duplicates from cuisines
      const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)

      return uniqueCuisines;
    })
    .catch((err)=>{
      console.log("fetchCuisines", err);
    })
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {

    return DBHelper.fetchRestaurantById(restaurant.id)
    .then((restaurant)=>{
      return (`/images/${restaurant.photograph}`);
    })
    .catch((err)=>{
      console.log("imageUrlForRestaurant", err);
    })

  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

}
