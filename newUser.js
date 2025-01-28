import {set, get, update, remove, ref, child} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

let userNameField = document.getElementById('user-first-last')
let userEmailField = document.getElementById('user-email')
let userPassField = document.getElementById('user-pass')
let userConfirm = document.getElementById('user-confirm')
let business = localStorage.getItem('business')

let createButton = document.getElementById('save-button')

createButton.addEventListener('click',()=>{
    createNewUser()
})

function createNewUser(){
    let userName = String(userEmailField.value).replace(/[^a-z0-9]/gi, '')
    if(userPassField.value != userConfirm.value){
        alert('Contraseña debe coincidir en ambos campos')
        return
    }

    update(ref(db,`businesses/${business}/users/${userName}`),{
        admin: false,
    })

    update(ref(db,`users/${userName}`),{
        email: String(userEmailField.value).toLowerCase(),
        user: userName,
        password: userPassField.value,
        business: business,
        name: String(userNameField.value).split(' ')[0],
        lastName: String(userNameField.value).split(' ')[1],
        admin: false
    }).then(()=>{
        if(confirm('Usuario creado. ¿Desea continuar?')){
            location.href = 'menu.html'
        }
    }
    )
            
}