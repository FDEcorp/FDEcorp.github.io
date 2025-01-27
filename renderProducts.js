import {set, get, update, remove, ref, child, getDatabase, onValue, query, orderByChild, equalTo} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

let business = localStorage.getItem('business')
let prodList = document.getElementById('products-window')
let orderList = document.getElementById('items-ordered-ul')
let orderTotalDisp = document.getElementById('subtotal-qty')

let month = String(new Date().getMonth()+1).padStart(2, '0')
let date = String(new Date()).split(" ")
let day = String(new Date().getDate()).padStart(2,'0')
let year = new Date().getFullYear()

window.order = {}
window.orderArr = []
window.total = 0

window.categorias = {}
window.catList = []
get(child(ref(db),`/businesses/${business}/Products`)).then((Products) => {
    Products.forEach(
        function(product){ 
            let categoria = String(product.val().category).toLowerCase()
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

let filterSelect = document.getElementById('cat-filter') 
let filterReset = document.getElementById('filter-reset') 
let prodSearch = document.getElementById('prod-search') 
let searchReset = document.getElementById('search-reset') 

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

window.registerSalesOnMemory = {}

window.checkIfSalesWritten = checkIfSalesWritten;
checkIfSalesWritten(year,month,day)

function checkIfSalesWritten(year,month,day){
    console.log(year,month,day)
    window.registerSalesOnDB = {}
    get(child(ref(db),`/businesses/${business}/sales/${year}/${month}/${day}`)).then((Sales) => {

        registerSalesOnDB = Sales.val()
        console.log('sales found in DB',registerSalesOnDB)

        Object.keys(registerSalesOnMemory).forEach(id=>{
            if(registerSalesOnDB[id] == undefined){
                console.log(id,'not found in BD',registerSalesOnDB[id])
                set(ref(db,'businesses/'+business+'/sales/'+year+"/"+month+"/"+day+'/'+ id),registerSalesOnMemory[id])
                deductInventory(registerSalesOnMemory[id].Items)
            }else{
                console.log(id,'found in DB',registerSalesOnDB[id].Total)
                delete registerSalesOnMemory[id];
                console.log(registerSalesOnMemory)
            }

        })
        console.log('pending to write',registerSalesOnMemory)
        localStorage.setItem(day,JSON.stringify(registerSalesOnMemory))
    })    
}

function registerSale(paymentMethod){
    if(total <= 0){
        return
    }
    let business = localStorage.getItem('business')
    let saleID = year+month+day+new Date().toTimeString().replace(/\D/g,''); 
    let TimeStamp = String(new Date()).substring(16,24);
    let sale_year = new Date().getFullYear();
    let sale_month = (new Date().getMonth()+1);
    let sale_day = String(new Date().getDate()).padStart(2,'0')

    set(ref(db,'businesses/'+business+'/sales/'+sale_year+"/"+sale_month+"/"+sale_day+'/'+ saleID),{
        Time: TimeStamp,
        Items: order,
        Total: total,
        Method: paymentMethod,
        Seller: localStorage.getItem('username')
    });
    
    registerSalesOnMemory = JSON.parse(localStorage.getItem(sale_day)) || {}
    registerSalesOnMemory[saleID] = {
        Time: TimeStamp,
        Items: order,
        Total: total,
        Method: paymentMethod,
        Seller: localStorage.getItem('username')
    }
    console.log('current sale', registerSalesOnMemory[saleID])
    localStorage.setItem(sale_day,JSON.stringify(registerSalesOnMemory))
    console.log(
        'sales registed in Memory',
        JSON.parse(localStorage.getItem(sale_day))
    )

    deductInventory(order)
    alert('Success')
    clearOrder()
    checkIfSalesWritten(sale_year,sale_month,sale_day)
}

window.deductInventory = deductInventory;

onValue(ref(db, `/businesses/${business}/Recipes`),(Recipes)=>{
    window.recipes = Recipes.val();
    console.log(recipes)
})

async function deductInventory(order) {
    try {
        for (const [orderKey, orderValue] of Object.entries(order)) {
            const productName = String(orderKey).split(' ')[0];
            const sku = String(orderKey).split(' ')[1];
            const qty = orderValue[0];
            const price = orderValue[1];

            if (!recipes[productName]) continue; // Skip if no recipe is found for the product

            for (const [variationKey, variationValue] of Object.entries(recipes[productName])) {
                if (variationKey === sku) {
                    for (const [itemName, itemDetails] of Object.entries(variationValue)) {
                        const cantidad = itemDetails.cantidad;

                        try {
                            // Fetch the current stock for all items
                            const ItemsSnapshot = await get(child(ref(db), `/businesses/${business}/Items/`));
                            const currentStock = ItemsSnapshot.val();
                            const currentItemStock = currentStock[itemName]?.stock || 0;

                            console.log(
                                `${productName}(${qty}): Deduciendo ${cantidad*qty} de ${itemName}, ` +
                                `actual stock es ${currentItemStock}: ${currentItemStock} - ${cantidad * qty} = ${currentItemStock>0?currentItemStock - cantidad * qty:0}`
                            );

                            // Update the stock for the current item
                            await update(ref(db, `/businesses/${business}/Items/${itemName}`), {
                                stock: currentItemStock>0?Number(currentItemStock) - Number(cantidad) * Number(qty):0,
                                lastUpdate: String(new Date()).substring(0,11)+String(new Date()).substring(16,21),
                            }); 

                        } catch (error) {
                            console.error(`Error updating stock for item ${itemName}:`, error);
                        }

                        // Optional: Add a delay between each item update
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }
            }
        }
    } catch (e) {
        console.error("An error occurred while deducting inventory:", e);
    }
}


function hideChangeCalc(){
    document.getElementById('change-calculator-pane').style.visibility = 'hidden'
    document.getElementById('pos-cont').style.opacity = '1'
}

function showChangeCalc(){
    if(total <= 0){
        return
    }
    document.getElementById('pos-cont').style.opacity = '0.2'
    document.getElementById('change-calculator-pane').style.visibility = 'visible'
    let listUl = document.getElementById('confirm-order-list')
    let totalDisp = document.getElementById('total-change-pane')
    totalDisp.innerText = total
    window.orderListArr = Object.entries(order)
    //console.log(orderListArr)

    let Options = orderListArr.map((item)=>
        `
        <li style="display: flex;">
            <div style="flex:2">${item[0]}</div>
            <div style="flex:1; text-align: right">${item[1][0]}x</div>
            <div style="flex:1; text-align: right">$ ${item[1][1]}</div>
        </li>
        `
    )

    listUl.innerHTML = String(Options).replaceAll(',','')
}

function calcChange(receivedBill){
    
    if(receivedBill > total){
    document.getElementById('change-ammount').innerText = Number(receivedBill) - Number(total) }
    else{
    document.getElementById('change-ammount').innerText =  "not enough"

    }
}

function clearOrder(){
    order = {}
    orderArr = []
    total = 0
    calcTotal()
    orderList.innerHTML = ''
}

function undoAdd(){
    window.latest = orderArr[orderArr.length-1]
    //check array for latest
    //console.log('latest added',latest);
    //if in object qty greater than 1, decrease by 1
    if(order[latest][0] > 1) {
        order[latest][0]--
        //console.log('minus one: ',order)
    }
    //if 1, remove from object
    else{
        delete order[latest]
        //console.log('removed',order)
    }
    //remove last element from array
    orderArr.pop()
    calcTotal()
    renderOrder()
}

function renderOrder(){
    orderList.innerHTML = ''

    Object.entries(order).forEach((itemOrdered)=>{
        let item = String(itemOrdered[0]).split(' ')[0];
        let qty = itemOrdered[1][0];
        let size = String(itemOrdered[0]).split(' ')[1];
        let price = String(itemOrdered[1][1])
        
        orderList.innerHTML +=`
        <li class="ordered-items">
            <div style="flex: 12; text-align: left;">${String(item).replaceAll('_',' ')} ${size}</div>                         
            <div style="flex: 2; text-align: left;">x${qty}</div>
            <div style="flex: 3; text-align: right; padding-right: 10px">$ ${price}</div>
        </li>
        `
    })
    
    
    orderTotalDisp.innerText = `$ ${total}`
}

function calcTotal(){
    hideChangeCalc()
    let sum = 0
    Object.values(order).forEach((prod)=>{
        let qty = prod[0]
        let price = prod[1]
        sum += qty*price
    })   
    total = sum
    renderOrder()
}

function addToOrder(itemsizeprice){
    hideChangeCalc()
    let [item,size,price] = String(itemsizeprice).split(' ')
    
    orderArr.push(item+' '+size)

    if(order[item+' '+size] == null){
        order[item+' '+size] =  [1,Number(price)]

    }
    else{
        order[item+' '+size] =  [order[item+' '+size][0]+1,Number(price)]
    }
    
    calcTotal()
}

function getSizes(product){
    let Size = product.val().Sizes
    
    window.test = Object.entries(Size)
    
    let Options = test.map((size,index)=>
        `
        <button class="size-button blue-bg" id="${product.key+'-'+index}" onclick="addToOrder('${product.key} ${Object.values(test[index][1])[1]} ${Object.values(test[index][1])[0]}')">
            ${Object.values(test[index][1])[1]}
        </button>
        `
    )
    return String(Options).replaceAll(',','')
}

function getPrices(product){
    let Size = product.val().Sizes

    console.log("sizes",product.key)
    window.test = Object.entries(Size)
   
    
    let Options = test.map((size,index)=>
        `
        <p style="padding: 0; margin: 0; display: inline;" id="${product.key+'-'+index}">
        $  ${Object.values(test[index][1])[0]}
        </p>
        `
    )
    return String(Options).replaceAll(',','')
}

const ProdRef = ref(db, `/businesses/${business}/Products`);
let myQuery = query(ProdRef, orderByChild("category"));

onValue(ref(db, `/businesses/${business}/Products`),()=>renderItems())

function renderItemsTEST(filter = 'all',productSearch=false){
    prodList.innerHTML = ''
    get(myQuery).then((Products) => {
        Products.forEach((product)=>{
            let image = Object.values(product.val())[2]

            if(filter == 'all' || (filter == product.val().category && productSearch==false) || (productSearch == true && String(product.key).toLowerCase().includes(String(prodSearch.value).trim().replaceAll(' ','_').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,"") ) )){
                prodList.innerHTML += `
                        <div class="product" id="${product.key}-card">
                            <div ondblclick="editProd('${product.key}')" style="height:70px; margin: 6px; border-radius: 6px; display: flex; flex-direction: row;" class="doubletap">
                                <div style="background-color:var(--primary-base-mid); background-image: url('${image}'); background-size: cover;background-position: center; width: 40%; border-radius: 8px"></div>
                                <div class="wrap" style="font-weight:600; font-size: 16px; color: var(--primary-black); width: 100px; text-align: left; width: 60%; padding-left: 8px; display: flex; flex-direction: column; align-items: start;">
                                <div style="height:50px; overflow: hidden" onclick="editProd('${product.key}')">
                                ${String(product.key).replaceAll('_',' ')}
                                </div>
                            
                                <span style="font-size: 10px; color: var(--primary-base-mid); font-weight: 800">Precios:</span>
                                <span style="font-size: 14px; color: var(--primary-base-mid); font-weight: 800" id="${product.key}-prices">${getPrices(product)}</span>
                                
                                </div>
                                
                            </div>
                        
                            <div style="display: flex; gap: 4px; padding: 6px; padding-top:0;" id="${product.key}">`+ 
                            getSizes(product)+
                                `
                            </div>
                        </div> 
                        `
            }

        })

    })
}

function renderItems(filter = 'all',productSearch=false){
    //console.log("filtrando por",filter)
    prodList.innerHTML = ''
    get(child(ref(db),`/businesses/${business}/Products/`)).then((Products) => {

        catList.forEach((cat) => {
            console.log(cat)
            Products.forEach(
                function(product){
                    
                    if(product.val().category == String(cat)){
                        
                        let image = Object.values(product.val())[2]
    
                        if(filter == 'all' || (filter == product.val().category && productSearch==false) || (productSearch == true && String(product.key).toLowerCase().includes(String(prodSearch.value).trim().replaceAll(' ','_').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,"") ) )){
                        try{
                            prodList.innerHTML += `
                        <div class="product" id="${product.key}-card">
                            <div ondblclick="editProd('${product.key}')" style="height:70px; margin: 6px; border-radius: 6px; display: flex; flex-direction: row;" class="doubletap">
                                <div style="background-color:var(--primary-base-mid); background-image: url('${image}'); background-size: cover;background-position: center; width: 40%; border-radius: 8px"></div>
                                <div class="wrap" style="font-weight:600; font-size: 16px; color: var(--primary-black); width: 100px; text-align: left; width: 60%; padding-left: 8px; display: flex; flex-direction: column; align-items: start;">
                                <div style="height:50px; overflow: hidden" onclick="editProd('${product.key}')">
                                ${String(product.key).replaceAll('_',' ')}
                                </div>
                            
                                <span style="font-size: 10px; color: var(--primary-base-mid); font-weight: 800">Precios:</span>
                                <span style="font-size: 14px; color: var(--primary-base-mid); font-weight: 800" id="${product.key}-prices">${getPrices(product)}</span>
                                
                                </div>
                                
                            </div>
                        
                            <div style="display: flex; gap: 4px; padding: 6px; padding-top:0;" id="${product.key}">`+ 
                            getSizes(product)+
                                `
                            </div>
                        </div> 
                        `
                        }catch(e){

                            }
                        
                    }
        
                
                    }
        
                }
        
                
            )
            //end of catList forEach
        
        })
    
        //end of GET
    })
}

renderItems()

function editProd(item){
    if(true){
        location.href = `ProductDetails.html?prod=${item}`
    }
}

window.undoAdd = undoAdd
window.editProd = editProd
window.addToOrder = addToOrder
window.clearOrder = clearOrder
window.registerSale = registerSale
window.hideChangeCalc = hideChangeCalc
window.calcChange = calcChange
window.showChangeCalc = showChangeCalc

window.pendingOrders = pendingOrders
window.newPendingOrder = newPendingOrder

function pendingOrders(){
    document.getElementById('pos-cont').style.opacity = '0.2'
    document.getElementById('subnav').style.opacity = '0.2'
    document.getElementById('filter-bar').style.opacity = '0.2'
    let business = localStorage.getItem('business')
    let saleID = year+month+day+new Date().toTimeString().replace(/\D/g,''); 
    let TimeStamp = String(new Date()).substring(16,24);
    let sale_year = new Date().getFullYear();
    let sale_month = (new Date().getMonth()+1);
    let sale_day = String(new Date().getDate()).padStart(2,'0')

    let total = 0
    Object.values(order).forEach((productpair)=>{
        total += productpair[0]*productpair[1]
    })

    console.log('sending to pending',order,total)
    document.getElementById('open-orders').innerHTML = ''

    get(child(ref(db),'businesses/'+business+'/pendingSales/'+sale_year+"/"+sale_month+"/"+sale_day)).then((pendingSales) => {
        pendingSales.forEach((sale)=>{
            document.getElementById('open-orders').innerHTML+=
            `
            <li style="margin-bottom: 4px;" id="${sale.key}">
                        <div style="display: flex; flex-direction: row; gap: 4px; height: 120px; border: 0px solid rgb(206, 206, 206); background-color: rgb(245, 245, 245); border-radius: 10px;">
                            <div style="flex: 2; text-align: left; padding: 10px;">
                                <div style="font-weight: bold;">${sale.val().Label}</div>
                                <ul style="background:var(--primary-base-light); color: var(--primary-base-dark); font-style: italic; height:68px; overflow: scroll; padding: 4px; margin-top: 4px; border-radius: 4px">
                                    ${String(Object.entries(sale.val().Items).map((item,qty)=>`<li>${String(item).split(',')[1]} - ${String(item).replaceAll('_',' ').split(',')[0]}</li>`)).replaceAll(',','')}
                                </ul>
                            </div>
                            <div style="flex: 1;text-align: right; padding: 10px; font-weight: bold;">
                                Total: <span style="font-weight:lighter;">$ ${sale.val().Total}</span>
                                <div style="text-align:center; border: 0px solid rgb(200,200,200); background:rgba(122, 122, 122, 0); color:rgb(240, 240, 240); padding: 6px; margin-top: 6px; border-radius: 4px; height: 20px"></div>
                                <div onclick="
                                pullPendingToCurrent(${sale.key});
                                " style="text-align:center; border: 0px solid rgb(200,200,200); background:var(--primary-red-soft); color:rgb(255, 255, 255); padding: 6px; margin-top: 6px; border-radius: 4px;">Abrir</div>
                            </div>
                        </div>
                    </li>
            `
        })
    })

    document.getElementById("pending-orders-pane").style.visibility = 'visible'
    
    
}
window.newPendingOrder = newPendingOrder;
window.registerNewPendingOrder = registerNewPendingOrder;
window.pullPendingToCurrent = pullPendingToCurrent;

function newPendingOrder(){
    document.getElementById('new-pending-order-pane').style.visibility = 'visible'
    document.getElementById('new-pending-order-pane').style.height = '108px'
}

function pullPendingToCurrent(id){
    let business = localStorage.getItem('business')
    let saleID = year+month+day+new Date().toTimeString().replace(/\D/g,''); 
    let TimeStamp = String(new Date()).substring(16,24);
    let sale_year = new Date().getFullYear();
    let sale_month = (new Date().getMonth()+1);
    let sale_day = String(new Date().getDate()).padStart(2,'0')
    console.log('pulling', id)
    get(child(ref(db),'businesses/'+business+'/pendingSales/'+sale_year+"/"+sale_month+"/"+sale_day+"/"+id)).then((sale) => {
        console.log(sale.key,sale.val().Items)
        order = sale.val().Items
        total = sale.val().Total
        console.log('order',order)
        renderOrder()
        closePendingPane()
        setTimeout(()=>{
            remove(child(ref(db),'businesses/'+business+'/pendingSales/'+sale_year+"/"+sale_month+"/"+sale_day+"/"+id))
        },1000)
    })
    
}

window.closePendingPane = closePendingPane

function closePendingPane(){
    document.getElementById('new-pending-order-pane').style.transition = '0s';
    document.getElementById('new-pending-order-pane').style.visibility = 'hidden';
                                document.getElementById('new-pending-order-pane').style.height = '0px';
                                document.getElementById('pending-orders-pane').style.visibility = 'hidden';
                                document.getElementById('pos-cont').style.opacity = '1'
                                document.getElementById('subnav').style.opacity = '1'
                                document.getElementById('filter-bar').style.opacity = '1'
}

function registerNewPendingOrder(){
    let business = localStorage.getItem('business')
    let saleID = year+month+day+new Date().toTimeString().replace(/\D/g,''); 
    let TimeStamp = String(new Date()).substring(16,24);
    let sale_year = new Date().getFullYear();
    let sale_month = (new Date().getMonth()+1);
    let sale_day = String(new Date().getDate()).padStart(2,'0')

    let total = 0
    Object.values(order).forEach((productpair)=>{
        total += productpair[0]*productpair[1]
    })

    console.log('sending to pending',order,total)
   

    if(total>0){

        document.getElementById('new-pending-order-pane').style.transition = '0.2s';
        document.getElementById('new-pending-order-pane').style.visibility = 'hidden';
        document.getElementById('new-pending-order-pane').style.transition = '1s';
        document.getElementById('new-pending-order-pane').style.height = '0px'

        set(ref(db,'businesses/'+business+'/pendingSales/'+sale_year+"/"+sale_month+"/"+sale_day+'/'+ saleID),{
            Time: TimeStamp,
            Items: order,
            Total: total,
            Seller: localStorage.getItem('username'),
            Label: document.getElementById('new-pending-order-label').value
        }).then(()=>{
            location.reload()
        }); 
    }else{
        console.log('orden vacia')
        location.reload()
    }
    
   
}