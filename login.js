import {set, get, update, remove, ref, child} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

const emailField = document.getElementById('email-input');
const passField = document.getElementById('password-input');
const submit = document.getElementById('submit-login');

function checkCreds(emailField){
    let username = String(emailField).replace(/\W/g, '').toLowerCase()
    console.log(username)
    get(child(ref(db),`users/${username}`)).then((user)=>{
        if(user.val().email != String(emailField).toLowerCase()){
            alert('Correo incorrecto')
            return
        }
        if(user.val().password === passField.value){
            let businessName = user.val().business
            localStorage.setItem("business", businessName);
            location.href = "menu.html"
        }
        else{
            alert('credenciales incorrectos')
            return
        }
    })
}

submit.addEventListener('click',()=>{
    checkCreds(emailField.value)
})