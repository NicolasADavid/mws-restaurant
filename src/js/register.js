console.log("Registering SW");

if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register("./sw.js").then(reg => {

        if(!navigator.serviceWorker.controller) {
            return;
        }

        console.log(reg);
        console.log("Register Success");
    })
    .catch(err => {
        console.log("Register error: ", err);
    })

}