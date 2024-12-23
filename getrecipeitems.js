let currentRecipe = document.getElementById("current-recipe")
let availItems = document.getElementById("avail-items")
import {set, get, update, remove, ref, child, getDatabase} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 


let business = localStorage.getItem('business')
get(child(ref(db),`/businesses/${business}/Items/`)).then((Items) => {
    Items.forEach(
        function(item){
            availItems.innerHTML += `
            <li id="${item.key}" style="background-color: white; padding-inline: 8px; width: auto; display: flex; flex-direction: row; gap: 8px; align-items: center; border: 0px solid rgb(220,220,220); border-radius: 10px;">
                    <div style="text-align: left; flex-grow: 1; font-weight: bold; padding-left: 4px;">${String(item.key).replaceAll('_',' ')}</div><div style="width: 70px; text-align: right;"><button style="width: 60px; height: 30px; padding:0;">Add+</button></div><div style="text-align: right; padding: 0px; width: 100px;"><input type="text" placeholder="Cantidad" style="height: 16px; width: 80px; border-radius: 6px; border: 0px; text-align: right;"></div>
            </li>
            `

})})