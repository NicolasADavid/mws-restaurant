import dbPromise from './dbpromise';

/**
 * Common database helper functions.
 */
export default class DBHelper {

  static get API_URL(){
    const port = 1337
    return `http://localhost:${port}`
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants() {
    
    return fetch('http://localhost:1337/restaurants')
    .then(function(response) {

      if(response.status == 200){

        return response.json();

      } else {

        console.log("Request failed. Status: ", response.status, " Trying IDB");

        return dbPromise.getRestaurants().then(idbRestaurants => {

          // console.log("idbRestaurants: ", idbRestaurants);

          if(idbRestaurants.length > 0){
            return idbRestaurants;
          } else {
            throw("No restaurants in storage. Internet connection required.");
          }
        })

      }

    })
    .then(function(restaurants){  

      dbPromise.putRestaurants(restaurants);

      return restaurants;

    })
    .catch(function(err){
      console.log("fetchRestaurants", err);
    })

  }

  static fetchRestaurantById(id){

    return fetch(`http://localhost:1337/restaurants/${id}`).then(response =>{
      
      if(!response.ok) return Promise.reject("No fetch!!");

      // console.log(response);

      return response.json();

    }).then((restaurant)=>{

      dbPromise.putRestaurants(restaurant)

      return restaurant;

    })
    .catch((err)=>{

      console.log("fetchRestaurantById error: ", err, " trying idb.");

      return dbPromise.getRestaurants(id).then(idbRestaurant => {

        if(!idbRestaurant) throw "IDB Restaurant not found."

        return(idbRestaurant);

      })

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

  static fetchReviewsByRestaurantId(restaurantId){
    return fetch(`${DBHelper.API_URL}/reviews/?restaurant_id=${restaurantId}`).then(response => {
      if (!response.ok) return Promise.reject("Failed to fetch reviews");
      return response.json();
    }).then(reviews =>{

      //Store in IDB
      dbPromise.putReviews(reviews);
      return reviews;
    }).catch(error => {
      //Get reviews from idb
      console.log("Attempt to get reviews from IDB");
      console.log(error);

      return dbPromise.getReviews(restaurantId).then(idbReviews => {
        if(idbReviews.length < 1) return null;
        return idbReviews;
      });
    });
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
      if(restaurant.photograph){
        return (`/images/${restaurant.photograph}`);
      }
      return
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
      marker.addTo(map);
    return marker;
  }

  static queueReview(review){
    console.log("Queuing review");
    return dbPromise.queueReview(review)
    .catch((err)=>{
      console.log("Error queuing review: ", err);
    })
  }

  static clearQueuedReviews(){
    console.log("Clearing outbox");

    return dbPromise.clearQueuedReviews()
    .catch((error) => {
      console.log("Error clearing queued reviews: ", error);
    })
  }

  static postReviews(){
    console.log("Posting reviews");

    return dbPromise.getQueuedReviews().then((queuedReviews) => {
      console.log("Queued reviews: ", queuedReviews);

      let promises = []

      queuedReviews.forEach((queuedReview)=> {
        promises.push(DBHelper.postReview(queuedReview))
      });

      return Promise.all(promises);
    }).then((values)=>{
      console.log("Values: ", values);

      return dbPromise.clearQueuedReviews()
    })
  }

  static postReview(review){

    console.log("Actually post a review: ", review);

    const url = `${DBHelper.API_URL}/reviews/`;
    const OPTIONS = {
      method: 'POST',
      body: JSON.stringify(review),
      headers: {
        'Content-Type': 'application/json'
      }
    };

    return fetch(url, OPTIONS).then(response => {

      if(!response.ok) return Promise.reject("Post failed!!");

      return response.json();

    }).then(newReview => {

      console.log("newReview: ", newReview);

      // save new review in idb
      dbPromise.putReviews(newReview);

    })
    .catch((err) => {
      console.log("Error posting review: ",err);
      throw err;
    });
  }

}

