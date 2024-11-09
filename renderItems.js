import {set, get, update, remove, ref, child, getDatabase} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

let business = localStorage.getItem('business')

let filterSelect = document.getElementById('cat-filter') 
let filterReset = document.getElementById('filter-reset') 
let prodSearch = document.getElementById('prod-search') 
let searchReset = document.getElementById('search-reset') 
let prodList = document.getElementById('products-window')

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

let categorias = {}

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
    console.log(categorias)
    document.getElementById('cat-filter').innerHTML += Object.keys(categorias).map((cat)=>`<option value="${cat}">${cat}</option>`)
})

renderItems()

function renderItems(filter = 'all',productSearch=false){

    prodList.innerHTML=""
    console.log("filtrando por",filter)
    get(child(ref(db),`/businesses/${business}/Items/`)).then((Items) => {
        Items.forEach(
            function(item){
                
                console.log(item.key,item.val().Sizes)
    
                let image = Object.values(item.val())[2]
                console.log(image)

                if(filter == 'all' || (filter == item.val().category && productSearch==false) || (productSearch == true && String(item.key).toLowerCase().includes(String(prodSearch.value).trim().replaceAll(' ','_').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,"") ) )){


                prodList.innerHTML += `
                <div class="item" id="${item.key}-card">
                    <div ondblclick="editProd('${item.key}')" style="margin: 6px; border-radius: 6px; display: flex; flex-direction: row; gap: 8px; flex: 1">
                        
                            <div class="wrap" style="flex:5; font-weight:600; font-size: 16px; color: Black; width: 100px; text-align: left; width: 60%; padding-left: 4px; display: flex; flex-direction: column; align-items: start;">
                                <div style="height:30px; overflow: hidden" onclick="editProd('${item.key}')">
                                ${String(item.key).replaceAll('_',' ')}
                                </div>
                      
                                <span style="font-size: 16px; color: gray; font-weight: 100">${item.val().category}</span>
                            </div>
                        
                            <div style="height: 20px; font-size: 16px; text-align: right; padding-right:4px; padding-top: 2px; flex: 1">
                                Order:
                                <b id="${item.key}-order-qty">${item.val().orderQty}</b>
                            </div>
                            
                            <div style="flex: 4; display: flex; flex-direction: row; gap: 8px">
                                <button class="order-qty-control" onclick="changeOrdQty('${item.key}',false)">-</button>
                                <button class="order-qty-control" onclick="changeOrdQty('${item.key}',true)">+</button>
                                <button class="order-qty-control" onclick="changeOrdQty('${item.key}',true)" style="background-color: ${item.val().orderQty > 0 ? 'rgb(120,160,140)':'rgb(200,200,200)'}">+</button>
                            </div>

                        
                    </div>
                   
                </div> 
                `
                }

    
            }
    
            
        )
    })
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
        }
        if(!increase && Number(document.getElementById(itemName+"-order-qty").innerHTML)>0){
            update(ref(db,'businesses/'+business+'/Items/'+itemName),{
                orderQty: current-1
            });
            document.getElementById(itemName+"-order-qty").innerHTML = Number(document.getElementById(itemName+"-order-qty").innerHTML)-1
        }
        }
    )
    
}

window.changeOrdQty = changeOrdQty;