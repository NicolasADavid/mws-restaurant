if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register("./sw.js")
    .catch(err => {
        console.log("SW register error: ", err);
    })
    
} else {
    console.log("SW not supported.");
}