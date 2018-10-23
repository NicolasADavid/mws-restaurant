console.log("Registering SW");

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
    .register("/sw.js")
    .then(reg => {
        console.log("Register Success");
    })
    .catch(err => {
        console.log("Register error: ", err);
    })
}