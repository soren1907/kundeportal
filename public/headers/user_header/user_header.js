//Will set users email in button at header
fetch("/api/email").then(res => {
    return res.json();
}).then(data => {
    document.getElementById("user-email").innerText = data.email;
}).catch(error => {
    console.log("error: " + error);
});