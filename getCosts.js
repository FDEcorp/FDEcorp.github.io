import {set, get, update, remove, ref, child, getDatabase, onValue} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

let business = localStorage.getItem('business')

let filterSelect = document.getElementById('cat-filter') 
let filterReset = document.getElementById('filter-reset') 
let prodSearch = document.getElementById('prod-search') 
let searchReset = document.getElementById('search-reset') 
let prodList = document.getElementById('items-window')

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



onValue(ref(db, `/businesses/${business}/Items`), (snapshot) => {
 renderItems()
});

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
                    <div id="${item.key}-card" style="margin:0; padding:0; height:30px;">
                        <div ondblclick="editProd('${item.key}')" style="display: flex; flex-direction: row; gap: 0px; flex: 1;">
                            
                                <div class="wrap" style="flex:3; font-weight:600; height: 30px; font-size: 14px; background-color:white; border:1px solid var(--primary-base-mid); border-right:0; color: Black; text-align: left; width: 60%; padding-left: 4px; align-items: center; align-content: center; justify-content: left; text-align: left;">
                                    <div style="overflow: hidden; height:20px;" onclick="editItem('${item.key}')">
                                        ${String(item.key).replaceAll('_',' ')}
                                    </div>
                                </div>

                                <div style="display:flex; text-align: center; justify-content: center; font-size: 14px; padding-right:0px; flex: 1; font-weight: bold;margin:0; border-right:0;">
                                    <input onchange="updatePack('${item.key}',this.value)" type="number" id="${item.key}-pack-qty" style="border-radius:0; margin: 0px; height: 14px; border-right:0; width: 80px; text-align: right; color: black; font-weight: bold;" value="${item.val().packQty}">
                                </div>
                                
                                <div style="display:flex; text-align: center; justify-content: center; font-size: 14px; padding-right:0px; 0px; flex: 1; font-weight: bold; margin:0;">
                                    <input onchange="updatePrice('${item.key}',this.value)" id="${item.key}-pack-price" style="border-radius:0; margin: 0px; height: 14px; width: 80px; text-align: right; color: black; font-weight: bold;" value="$ ${item.val().packPrice==undefined?0:item.val().packPrice}">
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
window.updateStock = updateStock;
function updateStock(item,qty){
    update(ref(db,'businesses/'+business+'/Items/'+item),{
        stock: Number(qty.replace(/[^0-9.]/g, '')),
        lastUpdate: String(new Date()).substring(0,11)+String(new Date()).substring(16,21),
    });
}
window.updatePack = updatePack;
function updatePack(item,qty){
    update(ref(db,'businesses/'+business+'/Items/'+item),{
        packQty: Number(qty.replace(/[^0-9.]/g, '')),
        lastUpdate: String(new Date()).substring(0,11)+String(new Date()).substring(16,21),
    });
}
window.updatePrice = updatePrice;
function updatePrice(item,price){
    update(ref(db,'businesses/'+business+'/Items/'+item),{
        packPrice: Number(price.replace(/[^0-9.]/g, '')),
        lastUpdate: String(new Date()).substring(0,11)+String(new Date()).substring(16,21),
    });
}
window.updateMin = updateMin;
function updateMin(item,qty){
    update(ref(db,'businesses/'+business+'/Items/'+item),{
        min: Number(qty.replace(/[^0-9.]/g, '')),
        lastUpdate: String(new Date()).substring(0,11)+String(new Date()).substring(16,21),
    });
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