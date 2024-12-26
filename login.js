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
            let admin = 'false'
            if(user.val().admin==true){
                admin = 'true'
            }
            
            let businessName = user.val().business
            let username = user.val().name +' '+ user.val().lastName
            localStorage.setItem("business", businessName);
            localStorage.setItem("username", username);
            localStorage.setItem("admin",admin);

            document.getElementById('login-card').style.transform = 'scale(2)';
            document.getElementById('login-card').style.opacity = '0.2';

            setTimeout(()=>{
            location.href = "menu.html"
            },'200')
        }
        else{
            alert('credenciales incorrectos')
            return
        }
    })
}

submit.addEventListener('click',()=>{
   
    setTimeout(()=>{
        checkCreds(emailField.value)
    },'00')
})