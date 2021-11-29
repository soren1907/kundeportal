const statusMessage = document.getElementById('status-message');
const goToLogin = document.getElementById('go-to-login');

function signUp(){

    const data = {
        Email: document.getElementById("email-register").value,
        firstName: document.getElementById("first-name").value,
        lastName: document.getElementById("last-name").value,
        password: document.getElementById("password").value,
        passwordConfirmation: document.getElementById("password-confirmation").value
    };

    fetch("/api/register", {
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        },
        method: "POST",
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