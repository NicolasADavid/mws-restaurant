var cacheVer = "003";

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(cacheVer).then(cache=>{
            return cache
            .addAll([
                "/",
                "/index.html",
                "/restaurant.html",
                "/css/styles.css",
                "/data/restaurants.json",
                "/js/",
                "/js/dbhelper.js",
                "/js/main.js",
                "/js/restaurant_info.js",
                "/js/register.js",
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