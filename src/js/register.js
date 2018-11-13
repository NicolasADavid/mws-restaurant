if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register("./sw.js").then(reg => {

        console.log("SW register success");

        // if(!navigator.serviceWorker.controller) {
        //     return;
        // }

        // if('sync' in reg) {
        //     reg.sync.register('outbox').then(() =>{
        //         console.log("Initial sync registered");
        //     })
        // }

    })
    .catch(err => {
        console.log("SW register error: ", err);
    })
    
} else {
    console.log("SW not supported.");
}