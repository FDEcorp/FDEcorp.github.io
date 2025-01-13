import {set, get, update, remove, ref, child, getDatabase} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

let business = localStorage.getItem('business')

let filterSelect = document.getElementById('cat-filter') 
let filterReset = document.getElementById('filter-reset') 
let prodSearch = document.getElementById('prod-search') 
let searchReset = document.getElementById('search-reset') 
let prodList = document.getElementById('products-window')

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
                
                if(item.val().category == String(cat)){
                    let image = Object.values(item.val())[2]

                    if(filter == 'all' || (filter == item.val().category && productSearch==false) || (productSearch == true && String(item.key).toLowerCase().includes(String(prodSearch.value).trim().replaceAll(' ','_').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,"") ) )|| (productSearch == true && String(item.val().vendor).toLowerCase().includes(String(prodSearch.value).trim().replaceAll(' ','_').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,"") ) )){
    
                    if((localStorage.getItem('resumen')=="true" && item.val().orderQty > 0)||localStorage.getItem('resumen')=="false"){
                        console.log("resumen: ",localStorage.getItem('resumen'))
                        prodList.innerHTML += `
                    <div class="item" id="${item.key}-card">
                        <div ondblclick="editProd('${item.key}')" style="margin: 6px; border-radius: 6px; display: flex; flex-direction: row; gap: 8px; flex: 1">
                            
                                <div class="wrap" style="flex:5; font-weight:600; font-size: 16px; color: Black; width: 100px; text-align: left; width: 60%; padding-left: 4px; display: flex; flex-direction: column; align-items: start;">
                                    <div style="height:20px; overflow: hidden" onclick="editProd('${item.key}')">
                                        ${String(item.key).replaceAll('_',' ')}
                                    </div>
                                    <span style="font-size: 12px; color: gray; font-weight: 100; magin-top: 2px;" id="${item.key}-stock-qty">stock: ${item.val().stock}</span>
                                    <span style="font-size: 12px; color: gray; font-weight: 100">pack: ${item.val().packQty}</span>
                                </div>
                            
                                <div style="height: 20px; font-size: 16px; text-align: right; padding-right:4px; padding-top: 2px; flex: 1">
                                    Order:
                                    <b id="${item.key}-order-qty">${item.val().orderQty}</b>
                                </div>
                                
                                <div style="flex: 4; display: flex; flex-direction: row; gap: 8px">
                                    <button class="order-qty-control" onclick="changeOrdQty('${item.key}',false);checkQty('${item.key}')">-</button>
                                    <button class="order-qty-control" onclick="changeOrdQty('${item.key}',true);">+</button>
                                    <button class="order-qty-control" id="${item.key}-receive" onclick="receiveItem('${item.key}')" style="background-color: ${item.val().orderQty > 0 ? 'rgb(51, 153, 255)':'rgb(200,200,200)'}">0</button>
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
    if(Number(document.getElementById(item+"-order-qty").innerText) > 0){
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
                orderQty: Number(0)
            });
            document.getElementById(itemName+"-order-qty").innerHTML = 0
            document.getElementById(itemName+"-stock-qty").innerHTML = `stock: ${Number(currentStock) + Number(currentOrder)*Number(pack)}`
            checkQty(itemName)
        
        }
    )
    
}

function changeOrdQty(itemOBJ,increase){

    let itemName = itemOBJ

    get(child(ref(db),`/businesses/${business}/Items/${itemName}`)).then((item) => {
        let current = item.val().orderQty

        if(increase){
            update(ref(db,'businesses/'+business+'/Items/'+itemName),{
                orderQty: current+1
            });
            document.getElementById(itemName+"-order-qty").innerHTML = Number(document.getElementById(itemName+"-order-qty").innerHTML)+1
            checkQty(itemName)
        }
        if(!increase && Number(document.getElementById(itemName+"-order-qty").innerHTML)>0){
            update(ref(db,'businesses/'+business+'/Items/'+itemName),{
                orderQty: current-1
            });
            document.getElementById(itemName+"-order-qty").innerHTML = Number(document.getElementById(itemName+"-order-qty").innerHTML)-1
            checkQty(itemName)
        }
        }
    )
    
}

window.checkQty = checkQty;
window.changeOrdQty = changeOrdQty;
window.receiveItem = receiveItem;