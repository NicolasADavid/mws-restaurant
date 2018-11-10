import DBHelper from './dbhelper';
import dbPromise from "./dbpromise";

function click() {
    const restaurantId = this.dataset.id;
    const fav = this.getAttribute('aria-pressed') == 'true';
    const url = `${DBHelper.API_URL}/restaurants/${restaurantId}/?is_favorite=${!fav}`;
    const PUT = {method: 'PUT'};

    return fetch(url, PUT).then(response => {
        if(!response.ok) return Promise.reject("Could not favorite restaurant");
        return response.json();
    }).then(updatedRestaurant => {
        dbPromise.putRestaurants(updatedRestaurant);
        this.setAttribute('aria-pressed', !fav);
    });
}

export default function favorite(restaurant) {
    const button = document.createElement('button');

    button.innerHTML = "&#x2764;"; //Heart hex
    button.className = "fav"; //for styling
    button.dataset.id = restaurant.id; 
    button.setAttribute('aria-label', `Mark ${restaurant.name} as favorited.`);
    button.setAttribute('aria-pressed', restaurant.is_favorite);
    button.onclick = click;

    return button;
}