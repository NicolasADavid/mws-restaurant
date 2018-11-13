import idb from 'idb';

const dbPromise = {
    
    db: idb.open('restaurant-reviews-db', 3, function(upgradeDb) {
        switch( upgradeDb.oldVersion) {
            case 0:
                upgradeDb.createObjectStore('restaurants', {keyPath: 'id' })
            case 1:
                upgradeDb.createObjectStore('reviews', {keyPath: 'id' })
                    .createIndex('restaurant_id', 'restaurant_id');
            case 2:
                console.log("Temp ID");
                upgradeDb.createObjectStore('outbox', { autoIncrement: true, keyPath: 'tempid'});
        }
    }),

    putRestaurants(restaurants) {

        // console.log("put restaurants: ", restaurants, forceUpdate);

        if (!restaurants.push) restaurants = [restaurants];

        return this.db.then(db => {

            const store = db.transaction('restaurants', 'readwrite').objectStore('restaurants');

            Promise.all(restaurants.map(networkRestaurant => {

                return store.get(networkRestaurant.id).then(idbRestaurant => {

                    if (!idbRestaurant || new Date(networkRestaurant.updatedAt) > new Date(idbRestaurant.updatedAt)) {
                        console.log("Putting in a NEW restaurant!!");

                        return store.put(networkRestaurant);

                    }

                })

            })).then(function () {

                return store.complete;

            });

        });

    },

    getRestaurants(id = undefined){
        
        // console.log("get restaurants: ", id);
        
        return this.db.then(db => {
            
            const store = db.transaction('restaurants').objectStore('restaurants');
            
            // console.log("Searching for ID: ", id);
            if (id) return store.get(Number(id));
            
            // console.log("Returning all");
            return store.getAll();
            
        })
        
    },
    
    putReviews(reviews){

        console.log("put reviews in IDB: ", reviews);

        if(!reviews.push) reviews = [reviews]; //Convert to iterable object if not iterable

        return this.db.then(db => {
            const store = db.transaction('reviews', 'readwrite').objectStore('reviews');
            Promise.all(reviews.map(networkReview => {
                return store.get(networkReview.id).then(idbReview => {
                    if(!idbReview || new Date(networkReview.updatedAt) > new Date(idbReview.upatedAt)) {
                        console.log("Inserting NEW review!!!");
                        return store.put(networkReview);
                    }
                });
            })).then(()=>{
                return store.complete;
            });
        });
    },

    getReviews(restaurantId){

        console.log("get reviews: ", restaurantId);

        return this.db.then(db => {
            const storeIndex = db.transaction('reviews').objectStore('reviews')
                .index('restaurant_id');

            return storeIndex.getAll(Number(restaurantId))
        })
    },

    queueReview(review){

        console.log("Really queuing review..");

        if(!review){
            return
        }

        return this.db.then(db => {


            const store = db.transaction('outbox', 'readwrite').objectStore('outbox');

            return store.put(review);
        })

    },

    getQueuedReviews(){
        return this.db.then(db => {
            const store = db.transaction('outbox').objectStore('outbox');

            return store.getAll();
        })
        .catch((error)=>{
            console.log("Error getting queued reviews: ", error);
        })
    },

    clearQueuedReviews(){
        console.log("Really clearing queue");

        return this.db.then(db => {
            const store = db.transaction('outbox', 'readwrite').objectStore('outbox');

            return store.clear();
        })
        .catch((error) => {
            console.log("Error clearing queue: ", error);
        })

    },

}

export default dbPromise;