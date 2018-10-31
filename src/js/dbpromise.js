import idb from 'idb';

const dbPromise = {
    
    db: idb.open('restaurant-reviews-db', 1, function(upgradeDb) {
        switch( upgradeDb.oldVersion) {
            case 0:
                upgradeDb.createObjectStore('restaurants', {keyPath: 'id' })   
        }
    }),

    putRestaurants(restaurants) {

        if (!restaurants.push) restaurants = [restaurants];

        return this.db.then(db => {

            const store = db.transaction('restaurants', 'readwrite').objectStore('restaurants');

            Promise.all(restaurants.map(networkRestaurant => {

                return store.get(networkRestaurant.id).then(idbRestaurant => {

                    if (!idbRestaurant || networkRestaurant.updatedAt > idbRestaurant.updatedAt) {

                        return store.put(networkRestaurant);

                    }

                })

            })).then(function () {

                return store.complete;

            });

        });

    },

    getRestaurants(id = undefined){

        return this.db.then(db => {

            const store = db.transaction('restaurants').objectStore('restaurants');

            // console.log("Searching for ID: ", id);
            if (id) return store.get(Number(id));

            // console.log("Returning all");
            return store.getAll();

        })

    }

}

export default dbPromise;