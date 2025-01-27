import {set, get, update, remove, ref, child, onValue} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 
let username = localStorage.getItem('email')

onValue(ref(db, `/users/${username}/`),()=>{
    get(child(ref(db),`users/${username}`)).then((user)=>{
        console.log(user.val().sessionID)
        if(user.val().sessionID == localStorage.getItem('TempKey')){
            console.log('valid device')
        }
        else{
            location.href ='index.html'
        }
    })
})

