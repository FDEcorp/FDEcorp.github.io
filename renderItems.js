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
    orderTotal.innerText = 0
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
                        console.log(item.val().orderQty||0,item.val().packPrice||0,Number(item.val().orderQty||0)*Number(item.val().packPrice||0))
                       
                        orderTotal.innerText = Math.round(Number(orderTotal.innerText) + Number(item.val().orderQty||0) * Number(item.val().packPrice||0)).toFixed(2)
                        prodList.innerHTML += `
                    <div class="item" id="${item.key}-card" tabindex="-1" style="background-color: ${item.val().stock>=item.val().minStock?'var(--primary-base-light)':'rgb(255, 238, 163);'};" onblur="hideItemMenu('${item.key}')">
                        <div ondblclick="editProd('${item.key}')" style="margin: 6px; border-radius: 6px; display: flex; flex-direction: row; gap: 8px; flex: 1">
                            
                                <div class="wrap" style="flex:5; font-weight:600; font-size: 16px; color: Black; width: 100px; flex-grow: 1; text-align: left; width: 60%; padding-left: 6px; display: flex; flex-direction: column; align-items: center; align-content: center;"  >
                                    <div style=" width: 30vw; overflow: wrap; align-self: center; height: 20px; padding-top: 14px;" onclick="displayItemMenu('${item.key}')">
                                        ${String(item.key).replaceAll('_',' ')}
                                    </div>
                                    
                                </div>
                            
                                <div style="width: 0px; background-color: white; box-shadow: 0px 2px 4px rgba(0,0,0,0.2); border-radius: 0px; padding: 0px; z-index: 100;">
                                    
                                        <div id="${item.key}-menu" style="font-size: 16px; background-color: #fdfdfd; font-weight: 500; color: black; padding: 10px; cursor: pointer; width: 180px; border-radius: 8px; visibility: hidden; box-shadow: 0px 2px 4px rgba(0,0,0,0.2);" onclick="displayItemMenu('${item.key}')" >
                                            
                                            <div style="text-align: left; font-size: 18px; flex:1; font-weight: bold; padding: 10px; border-bottom: 1px solid #eee; margin-bottom: 12px;">
                                                <b>${String(item.key).replaceAll('_',' ')}</b>
                                            </div>
                                                
                                            <div style="display: flex; flex-direction: row; gap: 12px; align-items: center; justify-content: center; text-align: center;">
                                                <did style="display: flex; flex-direction: column; gap: 4px; margin-botton: 4px; align-items: center; text-align: center; justify-content: left; align-content: left; alignt-items: left;">
                                                    <span style="font-size: 14px; color: gray; font-weight: 200; flex:1; padding: 4px; padding-inline: 4px;" id="${item.key}-stock-qty">stock: ${(Math.round(item.val().stock * 100) / 100).toFixed(0)}</span>
                                                    <span style="font-size: 14px; color: gray; font-weight: 200; flex:1; padding: 4px; padding-inline: 4px;">pack: ${item.val().packQty}</span>
                                                </did>
                        
                                                <div style="display: flex; flex-direction: column; gap: 4px; margin-botton: 4px; align-items: center; text-align: center; align-content: center; border-left: 1px solid #eee; padding-left: 8px;">
                                                    <span style="font-size: 14px; color: gray; font-weight: 200; padding: 4px;">${item.val().lastUpdate.split(' ')[0] + ' ' + item.val().lastUpdate.split(' ')[1] + ' ' + item.val().lastUpdate.split(' ')[2]}</span>
                                                    <span style="font-size: 14px; color: gray; font-weight: 200; padding: 4px;">${item.val().lastUpdate.split(' ')[3]}</span>
                                                </div>
                                
                                            </div>
                                            <div style="height: 20px;"></div>
                                         

                                            <p style="margin: 0; display:flex; padding: 10px; padding-inline: 8px; text-align: left; align-content: center; gap: 8px; border-radius: 4px; background-color: #f8f8f8; border: 0px solid #bbb; box-shadow: 0px 2px 4px rgba(124, 124, 124, 0.2);" onclick="editItem('${item.key}')">
                                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 72 72">
                                                <path d="M38.406 22.234l11.36 11.36L28.784 54.576l-12.876 4.307c-1.725.577-3.367-1.065-2.791-2.79l4.307-12.876L38.406 22.234zM41.234 19.406l5.234-5.234c1.562-1.562 4.095-1.562 5.657 0l5.703 5.703c1.562 1.562 1.562 4.095 0 5.657l-5.234 5.234L41.234 19.406z"></path>
                                            </svg>
                                            Editar Articulo</p>

                                            <p style="margin: 0; padding: 10px; display:flex; gap: 8px; padding-inline:8px; text-align: left; border-radius: 4px; background-color: #f8f8f8; border: 0px solid #bbb; margin-top: 8px; box-shadow: 0px 2px 4px rgba(124,124,124,0.2);" onclick="itemHistory('${item.key}')">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22 7L14.1314 14.8686C13.7354 15.2646 13.5373 15.4627 13.309 15.5368C13.1082 15.6021 12.8918 15.6021 12.691 15.5368C12.4627 15.4627 12.2646 15.2646 11.8686 14.8686L9.13137 12.1314C8.73535 11.7354 8.53735 11.5373 8.30902 11.4632C8.10817 11.3979 7.89183 11.3979 7.69098 11.4632C7.46265 11.5373 7.26465 11.7354 6.86863 12.1314L2 17M22 7H15M22 7V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                            Ver Consumo</p>

                                        </div>
                                </div>

                                <div style="height: 20px; font-size: 16px; text-align: left; padding-right:0px; padding-top: 2px; width: 50px">
                                    <p style="padding: 0; margin:0; font-size: 10px; font-weight: bold;">Order:</p>
                                    <input onchange="updateOrder('${item.key}',this.value)" type="number" id="${item.key}-order-qty" style="margin: 0px; height: 14px; width: 30px; text-align: center; color: black; font-weight: bold;" value="${(Math.round(item.val().orderQty * 100) / 100).toFixed(0)}">
                                </div>

                                <div style="flex: 2; display: flex; flex-direction: row; gap: 8px; width: 100px; justify-content: flex-end; padding-right: 4px;">
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

window.itemHistory = itemHistory;
function itemHistory(item){
    if(true){
        location.href = `stockhistory.html?prod=${item}`
    }
}

window.displayItemMenu = displayItemMenu;
function displayItemMenu(item){
    let menu = document.getElementById(item+"-menu")
    console.log("displaying menu for ",item)
    menu.style.transition = '0.5s'
    menu.style.visibility = 'visible';

}


window.hideItemMenu = hideItemMenu;
function hideItemMenu(item){
    let menu = document.getElementById(item+"-menu")
    console.log("hiding menu for ",item)
    menu.style.transition = '0s'
    menu.style.visibility = 'hidden';
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
    });
    alert('Updated')
}

window.checkQty = checkQty;
window.changeOrdQty = changeOrdQty;
window.receiveItem = receiveItem;

