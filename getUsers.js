import {set, get, update, remove, ref, child} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

let UsersList = document.getElementById('users-list')
let business = localStorage.getItem('business')
getUsers()
function getUsers(){
    UsersList.innerHTML=''
get(child(ref(db),`businesses/${business}/users`)).then((Users)=>{
    Users.forEach((user)=>{
        get(child(ref(db),`users/${user.key}`)).then((Users)=>{
            
        const userData = user.val();
        const isAdmin = !!userData.admin; // Ensure boolean value
        
        UsersList.innerHTML += `
            <div class="item" id="${user.key}-card">
                <div style="margin: 6px; border-radius: 6px; display: flex; flex-direction: row; gap: 8px; flex: 1">
                    <div class="wrap" style="flex: 4; font-size: 14px; color: Black; width: 100px; text-align: left; padding: 10px; display: flex; flex-direction: column;">
                        <div style="overflow: hidden">
                            <b>${Users.val().name} ${Users.val().lastName}</b> <br>
                            ${String(Users.val().email).replaceAll('_', ' ')}<br>
                            <p style="margin:0; padding:0; color: ${String(Users.val().active)=='true'?'rgb(39, 169, 39)':'var(--primary-red)'};">${String(Users.val().active)=='true'?'Activo':'Inactivo'}</p>
                        </div>
                    </div>
                    <div style="display: flex; flex: 1; flex-direction:column; align-content: center; align-items: center; gap: 4px;">
                        <div style="margin-top:14px; padding:0; font-size: 14px"> 
                            Admin    
                        </div>
                         <div> 
                        <input 
                            onchange="changeAdminStatus('${user.key}', this.checked)" 
                            type="checkbox" 
                            id="${user.key}-check" 
                            style="margin: 0px; height: 20px; width: 20px; text-align: center; color: black; font-weight: bold; border-radius: 10px;" 
                            ${isAdmin ? 'checked' : ''}
                        ></div>
                    </div>
                    <div style="display: flex; flex: 2; align-content: center; align-items: center; gap: 10px; margin-right: 10px;">
                        <div style="padding: 10px; width: 70px; padding-inline: 10px; border-radius: 4px; background: ${String(Users.val().active)=='true'?'var(--primary-base-mid)':'var(--primary-blue)'}; color: white;">
                            <a style="color: white; text-decoration: none" href="https://checkout-three-ruddy.vercel.app/${String(Users.val().active)=='true'?'cancel':'resume'}-subscription?sub_id=${Users.val().stripeSubscriptionId}&username=${Users.val().user}">${String(Users.val().active)=='true'?'Pausar':'Resumir'}</a>
                        </div>
                    </div>
                </div>
            </div>`;
        })
       
        
    
    })
})
}
window.changeAdminStatus = changeAdminStatus;
function changeAdminStatus(user,value){
    console.log(value)
    update(ref(db,`businesses/${business}/users/${user}`),{admin:value}).then(
        setTimeout(()=>{getUsers()},'500')
    )
    
}
