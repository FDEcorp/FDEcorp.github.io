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
                    <div class="wrap" style="flex: 5; font-size: 16px; color: Black; width: 100px; text-align: left; padding: 10px; display: flex; flex-direction: column;">
                        <div>
                            <b>${Users.val().name} ${Users.val().lastName}</b> <br>
                            ${String(Users.val().email).replaceAll('_', ' ')}
                        </div>
                    </div>
                    <div style="display: flex; align-content: center; align-items: center; gap: 10px;">
                        <div> 
                            Admin    
                        </div>
                        <input 
                            onchange="changeAdminStatus('${user.key}', this.checked)" 
                            type="checkbox" 
                            id="${user.key}-check" 
                            style="margin: 10px; height: 20px; width: 20px; text-align: center; color: black; font-weight: bold; border-radius: 10px;" 
                            ${isAdmin ? 'checked' : ''}
                        >
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
