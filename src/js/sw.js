import idb from 'idb';

const dbPromise = {
    
    db: idb.open('restaurant-reviews-db', 1, function(upgradeDb) {
        switch( upgradeDb.oldVersion) {
            case 0:
                upgradeDb.createObjectStore('restaurants', {keyPath: 'id' })
            
        }
    }),

    putRestaurants(restaurants) {

        if(!restaurants.push) restaurants = [restaurants];

        return this.db.then(db => {

            const store = db.transaction('restaurants', 'readwrite').objectStore('restaurants');

            Promise.all(restaurants.map(networkRestaurant => {

                return store.get(networkRestaturant.id).then(idbRestaurant => {

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

            if (id) return store.get(Number(id));

            return store.getAll();

        })

    }

}

var cacheVer = "001";

self.addEventListener("install", event => {


    event.waitUntil(
        caches.open(cacheVer).then(cache=>{
            return cache
            .addAll([
                "/",
                "/index.html",
                "/restaurant.html",
                "/css/styles.css",
                "/js/",
                "/js/main.js",
                "/js/restaurant_info.js",
                "sw.js"
            ])
        })
    )
})

self.addEventListener('fetch', function(event) {

    let cacheRequest = event.request;

    let cacheUrlObj = new URL(event.request.url);

    if (event.request.url.indexOf("restaurant.html") > -1){

        const cacheURL = "restaurant.html";

        cacheRequest = new Request(cacheURL);

    }

    if(cacheUrlObj.hostname !== "localhost") {

        event.request.mode = "no-cors"

    }

    event.respondWith(

        caches.match(cacheRequest)
        .then(response => {

            return (
                response ||
                fetch(event.request)
                .then(fetchResponse => {


                    return caches.open(cacheVer).then(cache =>{

                        //Check to see if we're offline?
                        // console.log(fetchResponse.clone());

                        cache.put(event.request, fetchResponse.clone());
                        return fetchResponse;

                    });

                })
                .catch(err => {

                    if (event.request.url.indexOf(".jpg") > -1) {
                        return caches.match("/images/na.jpg");
                    }

                    return new Response('Not connected', {
                        status: 404,
                        statusText: "Not connected to internet"
                    });

                })
            )

        })
    )

})