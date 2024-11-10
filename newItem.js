import {set, get, update, remove, ref, child} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

let item = document.getElementById('new-item-name')
let itemCat = document.getElementById('new-item-cat')
let itemVend = document.getElementById('new-item-vendor')
let itemPack = document.getElementById('new-item-pack')
let itemMin = document.getElementById('new-item-min')
let submitButton = document.getElementById('add-item-button')

function uploadItem(){
    if(item.value==""){return}
    let business = localStorage.getItem('business')
    let itemName = String(item.value).trim().replaceAll(' ','_')

        update(ref(db,'businesses/'+business+'/Items/'+itemName+"/"),{
            vendor: String(itemVend.value).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,""),
            category: String(itemCat.value).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,""),
            packQty:  Number(itemPack.value)>0 ? Number(itemPack.value)>0:1,
            minStock: Number(itemMin.value)>0 ? Number(itemMin.value)>0:1,
            orderQty: 0,
            stock: 0,
         });
    
}

submitButton.addEventListener('click',()=>{
    uploadItem()

    if(confirm("Registrado! Deseas agregar otro producto?")){
        setTimeout(() => {
            location.href = 'newItem.html'
        }, "1000");
    }
    else{
        setTimeout(() => {
            location.href = 'compras.html'
        }, "1000");
    }
})

itemMin.addEventListener('keypress',function(e){
    if(e.key != 'Enter'){
        return
    }
    uploadItem()
    setTimeout(() => {
        location.href = 'newItem.html'
    }, "1000");
})

itemPack.addEventListener('keypress',function(e){
    if(e.key != 'Enter'){
        return
    }
    uploadItem()
    setTimeout(() => {
        location.href = 'newItem.html'
    }, "1000");
})

itemVend.addEventListener('keypress',function(e){
    if(e.key != 'Enter'){
        return
    }
    uploadItem()
    setTimeout(() => {
        location.href = 'newItem.html'
    }, "1000");
})

itemCat.addEventListener('keypress',function(e){
    if(e.key != 'Enter'){
        return
    }
    uploadItem()
    setTimeout(() => {
        location.href = 'newItem.html'
    }, "1000");
})