import {set, get, update, remove, ref, child, getDatabase} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 
let business = localStorage.getItem('business')
let ProductSelect = document.getElementById('product-select')
let ProductSave = document.getElementById('save-button')


get(child(ref(db),`/businesses/${business}/Items`)).then((Products) => {
    Products.forEach(
        function(product){
           ProductSelect.innerHTML += `
            <option value="${product.key}">${String(product.key).replaceAll("_"," ")}</option>
           `
        })
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
        vendor: String(document.getElementById('item-vendor').value).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,""),
    });
    
}

window.getDetails = getDetails
