import {set, get, update, remove, ref, child, getDatabase, onValue} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 
var url = new URL(location);
var tempUser = url.searchParams.get("id");

get(ref(db,`/temp_users/${tempUser}`)).then((tempUser)=>{
    if(tempUser.exists()){
        let username = tempUser.val().user
        let TempKey = (Math.random() + 1).toString(36).substring(7)

        localStorage.TempKey = TempKey

        update(ref(db,`/users/${username}/`),{sessionID:`${TempKey}`})

        get(ref(db,`/users/${username}`)).then((userdata)=>{   
            localStorage.business = userdata.val().business
            localStorage.admin = userdata.val().admin
            localStorage.active = userdata.val().active
            localStorage.USER = userdata.key 
            remove(child(ref(db),`temp_users/${tempUser.key}`))
            document.getElementById('header').innerHTML = `
            <h1>
                <img src="fdeicon.png" height="24px" alt="">
                FDE: <span id="business" style="overflow: hidden;">${userdata.val().business}</span></h1>
            
            <div id="logout" onclick="location.href = 'https://checkout-three-ruddy.vercel.app/login'">Cerrar Sesión</div>
        `
        })

    }

   
    
    
})

onValue(ref(db, `/users/${localStorage.getItem('USER')}/`), (USER) => {
    if(USER.val().TempKey != localStorage.getItem('TempKey')){
        console.log(`Temp key from DB: ${USER.val().TempKey} does not match local Temp key ${localStorage.getItem('TempKey')}`)
    }else{
        console.log(`Temp key from DB: ${USER.val().TempKey} does match local Temp key ${localStorage.getItem('TempKey')}`)
    }
})

setTimeout(()=>{
    if(localStorage.business == null){
        location.href = 'https://checkout-three-ruddy.vercel.app/login'
    }

    
    
},'1000')