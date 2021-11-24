//Will set users email in button at header
fetch("/api/get_profile").then(res => {
    return res.json();
}).then(data => {
    document.getElementById("user-email").innerText = data.email;
}).catch(error => {
    console.log("error: " + error);
});