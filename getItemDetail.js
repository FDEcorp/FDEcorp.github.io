import {set, get, update, remove, ref, child, getDatabase} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 
let business = localStorage.getItem('business')
let ProductSelect = document.getElementById('product-select')
let ProductSave = document.getElementById('save-button')
let ItemsCost = {}

get(child(ref(db),`/businesses/${business}/Items`)).then((Products) => {
    Products.forEach(
        function(item){
           ProductSelect.innerHTML += `
            <option value="${item.key}">${String(item.key).replaceAll("_"," ")}</option>
           `
           let packPrice = item.val().packPrice || 0
           let packQty = item.val().packQty || 0
           let unitCost = Number(packPrice)/Number(packQty)
           ItemsCost[item.key] = (Math.round(unitCost * 100) / 100).toFixed(2)
        })
        console.log(ItemsCost)
})

ProductSelect.addEventListener('change',()=>{
    getDetails(ProductSelect.value)
})

function getDetails(selected){
    console.log(selected)
    get(child(ref(db),`/businesses/${business}/Items/${selected}`)).then((selected) => {
        console.log(selected.val())

        document.getElementById('item-cat').value = selected.val().category
        document.getElementById('item-stock').value = selected.val().stock
        document.getElementById('item-pack').value = selected.val().packQty
        document.getElementById('item-min').value = selected.val().minStock
        document.getElementById('item-vendor').value = selected.val().vendor
        document.getElementById('last-update').innerText = selected.val().lastUpdate
        document.getElementById('item-pack-price').value = selected.val().packPrice || ' '

    })
}


ProductSave.addEventListener('click',()=>{
    updateItem()
})

document.getElementById('delete-product').addEventListener('click',()=>{
    deleteItem()
})


function deleteItem(){
    let item = document.getElementById('product-select')
    if(item.value==""){return}
    
    if(confirm('¿Seguro que deseas eliminar '+ item.value + '?')){
        remove(child(ref(db),`businesses/${business}/Items/${item.value}`))
        setTimeout(()=>{
            location.href = 'ItemDetails.html'
        },'1000')
    }
}

function updateItem(){
    let item = document.getElementById('product-select')
    let itemName = String(item.value).trim().replaceAll(' ','_')

    let business = localStorage.getItem('business')
    update(ref(db,'businesses/'+business+'/Items/'+itemName),{
        category: String(document.getElementById('item-cat').value).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,""),
        stock: Number(document.getElementById('item-stock').value),
        minStock: Number(document.getElementById('item-min').value),
        packQty: Number(document.getElementById('item-pack').value),
        packPrice:Number(document.getElementById('item-pack-price').value),
        vendor: String(document.getElementById('item-vendor').value).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,""),
    }).then(()=>{
        alert('actualizado')
    });
    
}

window.getDetails = getDetails
