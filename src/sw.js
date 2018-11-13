var cacheVer = "reviews010";
import DBHelper from "./js/dbhelper";

self.addEventListener("install", event => {

    console.log("Installing");

    event.waitUntil(
        caches.open(cacheVer).then(cache => {
            return cache
                .addAll([
                    "/index.html",
                    "/restaurant.html",
                    "/css/styles.css",
                    "/js/main.js",
                    "/js/restaurant_info.js",
                    "/manifest.json"
                ])
        })
    )
})

self.addEventListener('fetch', function (event) {

    console.log("Fetch happening", event);

    let cacheRequest = event.request;

    let cacheUrlObj = new URL(event.request.url);

    if (event.request.url.indexOf("restaurant.html") > -1) {

        const cacheURL = "restaurant.html";

        cacheRequest = new Request(cacheURL);

    }

    if (event.request.url.indexOf("index.html") > -1) {

        const cacheURL = "index.html";

        cacheRequest = new Request(cacheURL);
    }

    if (cacheUrlObj.hostname !== "localhost") {

        // event.request.mode = "no-cors"

    }

    //Don't rely on cache for reviews. We're using indexDB for that.
    if (event.request.url.indexOf("reviews") > -1) {
        return fetch(event.request);
    }

    if (event.request.url.indexOf("restaurants") > -1) {
        return fetch(event.request);
    }

    if (event.request.method != "POST" && event.request.method != "PUT") {
        event.respondWith(

            caches.match(cacheRequest)
                .then(response => {

                    return (
                        response ||
                        fetch(event.request)
                            .then(fetchResponse => {

                                return caches.open(cacheVer).then(cache => {

                                    cache.put(event.request, fetchResponse.clone());

                                    return fetchResponse;

                                });

                            })
                            .catch(err => {

                                console.log("Service worker fetching error: ", err);

                                if (event.request.url.indexOf(".jpg") > -1) {
                                    return caches.match("/images/na.jpg");
                                }

                                return new Response('Not connected', {
                                    status: 200,
                                    statusText: "Not connected to internet"
                                });

                            })
                    )

                })
        )
    } else {
        fetch(event.request).then(fetchResponse => {
            return fetchResponse;
        })
    }
})

self.addEventListener('sync', function (event) {

    console.log("Sync event happened: ", event);

    event.waitUntil(DBHelper.postReviews())

}) 