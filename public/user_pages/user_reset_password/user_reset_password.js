const statusMessage = document.getElementById('status-message');
const goToLogin = document.getElementById('go-to-login');
url = window.location.href;
const uuidToken = url.substring(url.lastIndexOf('/') + 1)
let userData;

fetch("/api/jwt_info/" + uuidToken).then(res => {
    return res.json();
}).then(data => {
    userData = data;
    document.getElementById("user-email").innerText = data.email;
}).catch(error => {
    console.log("error: " + error);
});

function resetPassword(){

    const data = {
        email: userData.email,
        uuid: userData.uuid,
        password: document.getElementById("password").value,
        passwordConfirmation: document.getElementById("password-confirmation").value
    };

    fetch("/api/save-new-password", {
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        },
        method: "PATCH",
        body: JSON.stringify(data)
    }).then(res => {
        return res.json();
    }).then(data => {

        statusMessage.innerText = data.msg; 
        if(data.mailsent){
            goToLogin.innerText = "Gå tilbage til login" 
        }
    
    }).catch(error => {
        console.log(error);
    });
}
