import {set, get, update, remove, ref, child} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 
import {getDatabase, goOnline, goOffline, } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

const emailField = document.getElementById('email-input');
const passField = document.getElementById('password-input');
const submit = document.getElementById('submit-login');

// something like this
const db = getDatabase()
goOffline(db);

async function checkCreds(emailField){
    
    let username = String(emailField).replace(/\W/g, '').toLowerCase()
    console.log(username)
   
    get(child(ref(db),`users/${username}`)).then((user)=>{
        localStorage.setItem("active",String(user.val().active)=='true'?'true':'false');

        if(String(user.val().email).toLowerCase() != String(emailField).toLowerCase()){
            alert('Correo incorrecto')
            return
        }
        if(user.val().password === passField.value.split("").reverse()
            .join("").replace(/a/g, "@").replace(/e/g, "@").replace(/i/g, "!").replace(/o/g, "0").replace(/g/g, "0")){
            let admin = 'false'
            if(user.val().admin==true){
                admin = 'true'
            }

            let businessName = user.val().business
            get(child(ref(db),`businesses/${businessName}/users/${user.val().user}`)).then((userName)=>{
                let username = user.val().name +' '+ user.val().lastName
                localStorage.setItem("business", businessName);
                localStorage.setItem("username", username);
                localStorage.setItem("email", String(emailField).replace(/\W/g, '').toLowerCase());
                localStorage.setItem("admin",userName.val().admin);
    
                document.getElementById('login-card').style.transform = 'scale(2)';
                document.getElementById('login-card').style.opacity = '0.2';
                let TempKey = (Math.random() + 1).toString(36).substring(7)
                localStorage.setItem('TempKey',TempKey)
                console.log(TempKey)

                update(ref(db,`users/${String(emailField).replace(/\W/g, '').toLowerCase()}`),{
                    lastLogin: new Date(),
                    sessionID: TempKey
                })
            })
 
            setTimeout(()=>{
                location.href = "menu.html"
            },'500')
        }
        else{
            alert('credenciales incorrectos')
            return
        }
    })
    
}

submit.addEventListener('click',()=>{
    goOnline(db)
    setTimeout(()=>{
        checkCreds(emailField.value)
    },'1000')
})

passField.addEventListener('keypress',function(e){
    goOnline(db)
    if(e.key != 'Enter'){
        return
    }
    setTimeout(()=>{
        checkCreds(emailField.value)
    },'1000')
})

emailField.addEventListener('keypress',function(e){
    goOnline(db)
    if(e.key != 'Enter'){
        return
    }
    setTimeout(()=>{
        checkCreds(emailField.value)
    },'1000')
})