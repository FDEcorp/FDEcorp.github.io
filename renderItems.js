import {set, get, update, remove, ref, child, getDatabase, onValue} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

let business = localStorage.getItem('business')

let filterSelect = document.getElementById('cat-filter') 
let filterReset = document.getElementById('filter-reset') 
let prodSearch = document.getElementById('prod-search') 
let searchReset = document.getElementById('search-reset') 
let prodList = document.getElementById('products-window')
let orderTotal = document.getElementById('order-total')
window.ItemsCost = {}

let resumenToggle = document.getElementById('resumen-button')
localStorage.setItem('resumen',false)

resumenToggle.addEventListener('click',()=>{
    
    if(localStorage.getItem('resumen')=="false"){
        localStorage.setItem('resumen',true)
    }
    else{
        localStorage.setItem('resumen',false)
    }
    
    renderItems()
})


/*
onValue(ref(db, `/businesses/${business}/Items`), (snapshot) => {
 renderItems()
}) ; */

filterSelect.addEventListener('change',()=>{
    prodList.innerHTML = ''
    prodSearch.value = ''
    renderItems(filterSelect.value)
})
filterReset.addEventListener('click',()=>{
    prodList.innerHTML = ''
    prodSearch.val = ''
    filterSelect.value = 'all'
    renderItems()
})

prodSearch.addEventListener('change',()=>{
    prodList.innerHTML = ''
    filterSelect.value = 'all'
    renderItems(prodSearch.value,true)
})
searchReset.addEventListener('click',()=>{
    prodList.innerHTML = ''
    filterSelect.value = 'all'
    prodSearch.value = ''
    renderItems()
})

let month = String(new Date().getMonth()+1).padStart(2, '0')
let date = String(new Date()).split(" ")
let day = String(new Date().getDate()).padStart(2,'0')
let year = new Date().getFullYear()

window.order = {}
window.orderArr = []
window.total = 0

window.categorias = {}
window.catList = []

get(child(ref(db),`/businesses/${business}/Items`)).then((Items) => {
    Items.forEach(
        function(item){ 
            let categoria = String(item.val().category).toLowerCase()
            if(categorias[categoria]==undefined){
                categorias[categoria] = 1
            }
            else{
                categorias[categoria] = Number(categorias[categoria]) + 1
            }
        })
    document.getElementById('cat-filter').innerHTML += Object.keys(categorias).map((cat)=>`<option value="${cat}">${cat}</option>`)
    catList = Object.keys(categorias)
    catList = catList.reverse()
})

renderItems()

function renderItems(filter = 'all',productSearch=false){

    prodList.innerHTML=""

    get(child(ref(db),`/businesses/${business}/Items/`)).then((Items) => {
        
        catList.forEach((cat) => {
            console.log(cat)
        
        Items.forEach(
            function(item){
                let packPrice = item.val().packPrice || 0
        
                if(item.val().category == String(cat)){
                    let image = Object.values(item.val())[2]

                    if(filter == 'all' || (filter == item.val().category && productSearch==false) || (productSearch == true && String(item.key).toLowerCase().includes(String(prodSearch.value).trim().replaceAll(' ','_').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,"") ) )|| (productSearch == true && String(item.val().vendor).toLowerCase().includes(String(prodSearch.value).trim().replaceAll(' ','_').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,"") ) )){
    
                    if((localStorage.getItem('resumen')=="true" && item.val().orderQty > 0)||localStorage.getItem('resumen')=="false"){
                        console.log("resumen: ",localStorage.getItem('resumen'))
                        document.getElementById(orderTotal).innerHTML += Number(item.val().orderQty)*Number(packPrice)
                        
                        prodList.innerHTML += `
                    <div class="item" id="${item.key}-card" style="background-color: ${item.val().stock>=item.val().minStock?'var(--primary-base-light)':'rgb(255, 238, 163);'};">
                        <div ondblclick="editProd('${item.key}')" style="margin: 6px; border-radius: 6px; display: flex; flex-direction: row; gap: 8px; flex: 1">
                            
                                <div class="wrap" style="flex:5; font-weight:600; font-size: 16px; color: Black; width: 100px; height: 60px; text-align: left; width: 60%; padding-left: 4px; display: flex; flex-direction: column; align-items: start;">
                                    <div style="height:20px; overflow: hidden" onclick="editItem('${item.key}')">
                                        ${String(item.key).replaceAll('_',' ')}
                                    </div>
                                    <did style="display: flex; flex-direction: row; gap: 4px; margin-botton: 10px;">
                                        <span style="font-size: 10px; color: gray; font-weight: 100; magin-top: 2px;" id="${item.key}-stock-qty">stock: ${(Math.round(item.val().stock * 100) / 100).toFixed(0)}</span>
                                        <span style="font-size: 10px; color: gray; font-weight: 100">pack: ${item.val().packQty}</span>
                                    </did>
            
                                    <span style="font-size: 12px; color: gray; font-weight: 100;">${item.val().lastUpdate}</span>
                                </div>
                            
                                <div style="height: 20px; font-size: 16px; text-align: left; padding-right:0px; padding-top: 2px; flex: 1">
                                    <p style="padding: 0; margin:0; font-size: 10px; font-weight: bold;">Order:</p>
                                    <input onchange="updateOrder('${item.key}',this.value)" type="number" id="${item.key}-order-qty" style="margin: 0px; height: 14px; width: 30px; text-align: center; color: black; font-weight: bold;" value="${(Math.round(item.val().orderQty * 100) / 100).toFixed(0)}">
                                </div>
                                
                                <div style="flex: 4; display: flex; flex-direction: row; gap: 8px">
                                    <button class="order-qty-control" onclick="changeOrdQty('${item.key}',false);checkQty('${item.key}')">-</button>
                                    <button class="order-qty-control" onclick="changeOrdQty('${item.key}',true);">+</button>
                                    <button class="order-qty-control" id="${item.key}-receive" onclick="receiveItem('${item.key}')" style="background-color: ${item.val().orderQty > 0 ? 'var(--primary-blue)':'var(--primary-base-mid)'}; font-weight: bold; font-size: 18x; padding-top: 0px;">↓</button>
                                </div>
    
                            
                        </div>
                       
                    </div> 
                    `
                    }
                    
                    }
                }
    
                

    
            }
    
            
        )
        })
    })
}

function checkQty(item){
    console.log("checking qty")
    if(Number(document.getElementById(item+"-order-qty").value) > 0){
        document.getElementById(item+"-receive").style.backgroundColor = 'rgb(51, 153, 255)'
    }
    else{
        document.getElementById(item+"-receive").style.backgroundColor = 'rgb(200,200,200)'
    }
}

function receiveItem(itemOBJ){
    //increase inventory by order qty*qtypack
    let itemName = itemOBJ
    //reset order qty to 0
    get(child(ref(db),`/businesses/${business}/Items/${itemName}`)).then((item) => {
        let currentOrder = item.val().orderQty
        let currentStock = item.val().stock
        let pack = item.val().packQty

            update(ref(db,'businesses/'+business+'/Items/'+itemName),{
                stock: Number(currentStock) + Number(currentOrder)*Number(pack),
                orderQty: Number(0),
                lastUpdate: String(new Date()).substring(0,11)+String(new Date()).substring(16,21),
            });

            update(ref(db, `/businesses/${business}/Consumo/${itemName}/${new Date()}`), {
                stock: Number(currentStock) + Number(currentOrder)*Number(pack),
                delta: Number(currentOrder)*Number(pack),
            }); 

            document.getElementById(itemName+"-order-qty").value = 0;
            document.getElementById(itemName+"-stock-qty").innerHTML = `stock: ${Number(currentStock) + Number(currentOrder)*Number(pack)}`
            checkQty(itemName)
        
        }
    )
    
}

window.editItem = editItem;
function editItem(item){
    if(true){
        location.href = `ItemDetails.html?prod=${item}`
    }
}

function changeOrdQty(itemOBJ,increase){

    let itemName = itemOBJ

    get(child(ref(db),`/businesses/${business}/Items/${itemName}`)).then((item) => {
        let current = item.val().orderQty

        if(increase){
            update(ref(db,'businesses/'+business+'/Items/'+itemName),{
                orderQty: current+1,
                lastUpdate: String(new Date()).substring(0,11)+String(new Date()).substring(16,21)
            });
            console.log('updated on',String(new Date()).substring(0,11)+String(new Date()).substring(16,21))
            document.getElementById(itemName+"-order-qty").value++;
            checkQty(itemName)
        }
        if(!increase && Number(document.getElementById(itemName+"-order-qty").value)>0){
            update(ref(db,'businesses/'+business+'/Items/'+itemName),{
                orderQty: current-1,
                lastUpdate: String(new Date()).substring(0,11)+String(new Date()).substring(16,21)
            });
            console.log('updated on',String(new Date()).substring(0,11)+String(new Date()).substring(16,21))
            document.getElementById(itemName+"-order-qty").value--;
            checkQty(itemName)
        }
        }
    )
    
}

window.updateOrder = updateOrder;
function updateOrder(item,qty){
    update(ref(db,'businesses/'+business+'/Items/'+item),{
        orderQty: Number(qty),
        lastUpdate: String(new Date()).substring(0,11)+String(new Date()).substring(16,21),
    });
    alert('Updated')
}

window.checkQty = checkQty;
window.changeOrdQty = changeOrdQty;
window.receiveItem = receiveItem;

