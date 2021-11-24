//Method check if there is a session(first time visit) -> show cookies.
//Checks if a user is logged in. 
//if logged in, goes to user-profile and dont show login page.
//Script is called in footer.html (will be used on every route)
 
fetch("/api/new_session_check").then(res => {
    return res.json();
}).then(data => {

    if(data.newSession) {
        const myModal = new bootstrap.Modal(document.getElementById('cookieModal'));
        myModal.show();
    } 

}).catch(error => {
    console.log("error: " + error);
}); 

function signout(){
    fetch("/api/signout", {method: "POST"}).then(res => {
        window.location.href = "/";
    });
}