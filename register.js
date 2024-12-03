import {set, get, update, remove, ref, child} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

let registerPass = document.getElementById('register-password')
let registerPassConf = document.getElementById('register-password-confirm')
let registerEmailField = document.getElementById('email-input');
let registerBusinessField = document.getElementById('business-input');
let registerNameField =document.getElementById('name-input');
let registerLastNameField =document.getElementById('last-name-input');

let errorField = document.getElementById('error-field')
let confirmRegister = document.getElementById('submit-register')

function passMatch(){
    if(registerPass.value == registerPassConf.value){
        errorField.style.visibility = 'hidden'
        return true
    }
    else{
        errorField.textContent = 'Error: Contraseña no coincide con confirmacion.'
        errorField.style.visibility = 'visible'
        return false
    }
}

function checkEmptyCells(){
    if(registerNameField.value===''){
        errorField.textContent = 'Error: Nombre no puede estar vacio.'
        errorField.style.visibility = 'visible'
        return false
    }
    if(registerLastNameField.value===''){
        errorField.textContent = 'Error: Apellido no puede estar vacio.'
        errorField.style.visibility = 'visible'
        return false
    }
    if(registerEmailField.value===''){
        errorField.textContent = 'Error: Email no puede estar vacio.'
        errorField.style.visibility = 'visible'
        return false
    }
    if(registerBusinessField.value===''){
        errorField.textContent = 'Error: Empresa no puede estar vacio.'
        errorField.style.visibility = 'visible'
        return false
    }
    if(registerPass.value===''){
        errorField.textContent = 'Error: Contraseña no puede estar vacio.'
        errorField.style.visibility = 'visible'
        return false
    }
    return true
   
}

registerPass.addEventListener('change',()=>{
    passMatch();
})
registerPassConf.addEventListener('change',()=>{
    passMatch();
})

confirmRegister.addEventListener('click',()=>{

    if(!checkEmptyCells()){
        return
    }

    if(!passMatch()){
        return
    }
    else{
        registerUser(registerEmailField.value)
        
    }
    
})

function registerUser(email){
    let username = String(email).replace(/\W/g, '').toLowerCase()
    console.log(username)
    get(child(ref(db),`users/${username}`)).then((user)=>{
        console.log(user.exists)
        if(user.exists()){
            alert('usuario ya existe')
            return
        }
        else{
            //check if business name has valid characters
            
            //check if business name is available
            let businessname = String(registerBusinessField.value).replace(/[^a-z0-9]/gi, '')
            get(child(ref(db),`businesses/${businessname}`)).then((business)=>{
                if(business.exists()){
                    alert("Negocio ya existe en base de datos, elige otro nombre")
                    return
                }
                else{
                    set(ref(db,'users/'+username),{
                        email: registerEmailField.value,
                        user: username,
                        password: registerPass.value,
                        business: businessname,
                        name: registerNameField.value,
                        lastName: registerLastNameField.value,
                        admin: true,
                    });

                    set(ref(db,'businesses/'+businessname+'/users/'+username),{
                        admin: true,
                    });

                    localStorage.setItem('business',businessname)

                    setTimeout(()=>{
                        location.href = 'menu.html'
                    },'500')
                }
            })

            

            
        }
        
    })
}
