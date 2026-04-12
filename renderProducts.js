import {set, get, update, remove, ref, child, getDatabase, onValue, query, orderByChild, equalTo} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

let business = localStorage.getItem('business')
let prodList = document.getElementById('products-window')
let orderList = document.getElementById('items-ordered-ul')
let orderTotalDisp = document.getElementById('subtotal-qty')

let cashPercentage = document.getElementById('cash-percentage')
let cashToPay = document.getElementById('cash-to-pay')
let cardToPay = document.getElementById('card-to-pay')

orderTotalDisp.addEventListener('change',()=>{
    cashToPay.value = Number(String(orderTotalDisp.innerText).split(' ')[1])
})

cashPercentage.addEventListener('change',()=>{
    cashToPay.value = Math.round( Number(String(orderTotalDisp.innerText).split(' ')[1])*Number(cashPercentage.value)/100 )
    cardToPay.value = Number(String(orderTotalDisp.innerText).split(' ')[1]) - Number(cashToPay.value)
    console.log(`Total: ${String(orderTotalDisp.innerText).split(' ')[1]} - CashPercentage: ${cashPercentage.value} %`)
    document.getElementById('change-ammount').innerText = ""

})

cashToPay.addEventListener('change',()=>{
    if(cashToPay.value > Number(String(orderTotalDisp.innerText).split(' ')[1])){
        cashToPay.value = Number(String(orderTotalDisp.innerText).split(' ')[1])
    }
    cardToPay.value = Number(String(orderTotalDisp.innerText).split(' ')[1]) - Number(cashToPay.value)
    cashPercentage.value = 100*Number(cashToPay.value) / Number(String(orderTotalDisp.innerText).split(' ')[1])
    document.getElementById('change-ammount').innerText = ""
})
cardToPay.addEventListener('change',()=>{
    if(cardToPay.value > Number(String(orderTotalDisp.innerText).split(' ')[1])){
        cardToPay.value = Number(String(orderTotalDisp.innerText).split(' ')[1])
    }
    cashToPay.value = Number(String(orderTotalDisp.innerText).split(' ')[1]) - Number(cardToPay.value)
    cashPercentage.value = 100*Number(cashToPay.value) / Number(String(orderTotalDisp.innerText).split(' ')[1])
    document.getElementById('change-ammount').innerText = ""

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
console.log('checking sales on load')
checkIfSalesWritten(new Date().getFullYear(),String(new Date().getMonth()+1),day)

window.renderItems = renderItems;

function checkIfSalesWritten(year,month,day){
    registerSalesOnMemory = JSON.parse(localStorage.getItem(day))
    if(registerSalesOnMemory == null){
        return
    }
    console.log('pending to write',registerSalesOnMemory)
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
    
    registerSalesOnMemory = JSON.parse(localStorage.getItem(sale_day))
    if(registerSalesOnMemory == null){
        registerSalesOnMemory = {}
    }
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
    clearOrder()
    checkIfSalesWritten(sale_year,sale_month,sale_day)
}
window.registerSaleMixed = registerSaleMixed;
function registerSaleMixed(){
    if(total <= 0){
        return
    }
    let business = localStorage.getItem('business')
    let saleID = year+month+day+new Date().toTimeString().replace(/\D/g,''); 
    let TimeStamp = String(new Date()).substring(16,24);
    let sale_year = new Date().getFullYear();
    let sale_month = (new Date().getMonth()+1);
    let sale_day = String(new Date().getDate()).padStart(2,'0')
    let totalcard = Number(cardToPay.value)
    let totalcash = Number(cashToPay.value)

    registerSalesOnMemory = JSON.parse(localStorage.getItem(sale_day))
    if(registerSalesOnMemory == null){
        registerSalesOnMemory = {}
    }

    if(totalcash>0 && totalcard>0){
        console.log('chargin mixed')
        set(ref(db,'businesses/'+business+'/sales/'+sale_year+"/"+sale_month+"/"+sale_day+'/'+ `${saleID}-cash`),{
            Time: TimeStamp,
            Items: order,
            Total: totalcash,
            Method: "cash",
            Seller: localStorage.getItem('username')
        });
        set(ref(db,'businesses/'+business+'/sales/'+sale_year+"/"+sale_month+"/"+sale_day+'/'+ `${saleID}-card`),{
            Time: TimeStamp,
            Total: totalcard,
            Method: "card",
            Seller: localStorage.getItem('username')
        });
        registerSalesOnMemory[saleID+"-cash"] = {
            Time: TimeStamp,
            Items: order,
            Total: totalcash,
            Method: "cash",
            Seller: localStorage.getItem('username')
        }
        registerSalesOnMemory[saleID+"-card"] = {
            Time: TimeStamp,
            Total: totalcard,
            Method: "card",
            Seller: localStorage.getItem('username')
        }
        localStorage.setItem(sale_day,JSON.stringify(registerSalesOnMemory))
        console.log(
            'sales registed in Memory',
            JSON.parse(localStorage.getItem(sale_day))
        )
        checkIfSalesWritten(sale_year,sale_month,sale_day)

    }
    if(totalcash>0 && totalcard == 0){
        console.log('chargin only cash')
        set(ref(db,'businesses/'+business+'/sales/'+sale_year+"/"+sale_month+"/"+sale_day+'/'+ `${saleID}`),{
            Time: TimeStamp,
            Items: order,
            Total: totalcash,
            Method: "cash",
            Seller: localStorage.getItem('username')
        });

        registerSalesOnMemory[saleID] = {
            Time: TimeStamp,
            Items: order,
            Total: totalcash,
            Method: "cash",
            Seller: localStorage.getItem('username')
        }

        localStorage.setItem(sale_day,JSON.stringify(registerSalesOnMemory))
        console.log(
            'sales registed in Memory',
            JSON.parse(localStorage.getItem(sale_day))
        )
        checkIfSalesWritten(sale_year,sale_month,sale_day)

    }
    if(totalcard>0 && totalcash == 0){
        console.log('chargin only card')
        set(ref(db,'businesses/'+business+'/sales/'+sale_year+"/"+sale_month+"/"+sale_day+'/'+ `${saleID}`),{
            Time: TimeStamp,
            Items: order,
            Total: totalcard,
            Method: "card",
            Seller: localStorage.getItem('username')
        });
        registerSalesOnMemory[saleID] = {
            Time: TimeStamp,
            Items: order,
            Total: totalcard,
            Method: "card",
            Seller: localStorage.getItem('username')
        }
        localStorage.setItem(sale_day,JSON.stringify(registerSalesOnMemory))
        console.log(
            'sales registed in Memory',
            JSON.parse(localStorage.getItem(sale_day))
        )
        checkIfSalesWritten(sale_year,sale_month,sale_day)

    }
    
    
   

    deductInventory(order)
    clearOrder()
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
                
                            }); 
                            await update(ref(db, `/businesses/${business}/Consumo/${itemName}/${new Date()}`), {
                                stock: currentItemStock>0?Number(currentItemStock) - Number(cantidad) * Number(qty):0,
                                delta: -Number(cantidad) * Number(qty),
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

function showChangeCalc(method){
    document.getElementById('change-ammount').innerText = ""

    if(total <= 0){
        return
    }
    if(method == 'cash'){
        cashToPay.value = Number(String(orderTotalDisp.innerText).split(' ')[1])
        cardToPay.value = 0
        cashPercentage.value = 100
    }
    if(method == 'card'){
        cardToPay.value = Number(String(orderTotalDisp.innerText).split(' ')[1])
        cashToPay.value = 0
        cashPercentage.value = 0
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
    
    if(receivedBill > Number(cashToPay.value)){
    document.getElementById('change-ammount').innerText = Number(receivedBill) - Number(cashToPay.value) }
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
            <div style="flex: 11; text-align: left;">${String(item).replaceAll('_',' ')} ${size}</div>                         
            <div style="flex: 1; text-align: left;">x${qty}</div>
            <div style="flex: 5; text-align: right; padding-right: 10px">$ ${price}</div>
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
    
                        if(filter == 'all' || (productSearch == true && String(product.key).toLowerCase().includes(String(prodSearch.value).trim().replaceAll(' ','_').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,"") ) ) || (productSearch == true && String(product.val().category).toLowerCase().includes(String(prodSearch.value).trim().replaceAll(' ','_').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,"") ) ) || (filter == product.val().category && productSearch==false) || (productSearch == true && String(product.key).toLowerCase().includes(String(prodSearch.value).trim().replaceAll(' ','_').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,"") ) )){
                        try{
                            prodList.innerHTML += `
                        <div tabindex="-1" class="product" id="${product.key}-card" onblur="hideItemMenu('${product.key}')">
                            <div  onclick="displayItemMenu('${product.key}')" style="height:70px; margin: 6px; border-radius: 6px; display: flex; flex-direction: row;" class="doubletap">
                                <div style="background-color:var(--primary-base-mid); background-image: url('${image}'); background-size: cover;background-position: center; width: 40%; border-radius: 8px"></div>
                                
                                <div  style="width: 0px; background-color: white; box-shadow: 0px 2px 4px rgba(0,0,0,0.2); border-radius: 0px; padding: 0px; z-index: 100;">
                                        <div id="${product.key}-menu" style="transform: translateX(-54px); font-size: 16px; background-color: #fdfdfd; font-weight: 500; color: black; padding: 10px; cursor: pointer; width: 130px; border-radius: 8px; visibility: hidden; box-shadow: 0px 2px 4px rgba(0,0,0,0.2);" onclick="displayItemMenu('${product.key}')" >
                                            <div style="text-align: left; font-size: 16px; flex:1; font-weight: bold; padding: 10px; border-bottom: 1px solid #eee; margin-bottom: 12px;">
                                                <b>${String(product.key).replaceAll('_',' ')}</b>
                                            </div>
                                            <div style="height: 0px;"></div>
                                         

                                            <p style="margin: 0; display:flex; padding: 10px; padding-inline: 8px; text-align: left; align-content: center; gap: 8px; border-radius: 4px; background-color: #f8f8f8; border: 0px solid #bbb; box-shadow: 0px 2px 4px rgba(124, 124, 124, 0.2);" onclick="editProd('${product.key}')">
                                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 72 72">
                                                <path d="M38.406 22.234l11.36 11.36L28.784 54.576l-12.876 4.307c-1.725.577-3.367-1.065-2.791-2.79l4.307-12.876L38.406 22.234zM41.234 19.406l5.234-5.234c1.562-1.562 4.095-1.562 5.657 0l5.703 5.703c1.562 1.562 1.562 4.095 0 5.657l-5.234 5.234L41.234 19.406z"></path>
                                            </svg>
                                            Editar Producto</p>

                                            <p style="margin: 0; padding: 10px; display:flex; gap: 8px; padding-inline:8px; text-align: left; border-radius: 4px; background-color: #f8f8f8; border: 0px solid #bbb; margin-top: 8px; box-shadow: 0px 2px 4px rgba(124,124,124,0.2);" onclick="itemHistory('${product.key}')">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22 7L14.1314 14.8686C13.7354 15.2646 13.5373 15.4627 13.309 15.5368C13.1082 15.6021 12.8918 15.6021 12.691 15.5368C12.4627 15.4627 12.2646 15.2646 11.8686 14.8686L9.13137 12.1314C8.73535 11.7354 8.53735 11.5373 8.30902 11.4632C8.10817 11.3979 7.89183 11.3979 7.69098 11.4632C7.46265 11.5373 7.26465 11.7354 6.86863 12.1314L2 17M22 7H15M22 7V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                            Ver Ventas</p>

                                        </div>
                                </div>
                                
                                <div class="wrap" style="font-weight:600; font-size: 16px; color: var(--primary-black); width: 100px; text-align: left; width: 60%; padding-left: 8px; display: flex; flex-direction: column; align-items: start;">
                                
                                <div style="height:50px; overflow: hidden" onclick="displayItemMenu('${product.key}')">
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

function calcPaymentSplit(){

}

let shortcutBar = document.getElementById('shortcuts-bar') 
shortcutButtonRender()

function shortcutButtonRender(){
    shortcutBar.innerHTML = `
            <button id="edit-shortcut" class="shortcut-edit-button" onclick="editShortcuts()">
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" opacity="0.9" style="filter: invert(1);" width="20" height="20" viewBox="0 0 48 48">
                <path d="M38.657 18.536l2.44-2.44c2.534-2.534 2.534-6.658 0-9.193-1.227-1.226-2.858-1.9-4.597-1.9s-3.371.675-4.597 1.901l-2.439 2.439L38.657 18.536zM27.343 11.464L9.274 29.533c-.385.385-.678.86-.848 1.375L5.076 41.029c-.179.538-.038 1.131.363 1.532C5.726 42.847 6.108 43 6.5 43c.158 0 .317-.025.472-.076l10.118-3.351c.517-.17.993-.463 1.378-.849l18.068-18.068L27.343 11.464z"></path>
                </svg>
            </button>
            `
    console.log('rendering shortcuts')

    get(child(ref(db),`/users/${localStorage.getItem('USER')}/shortcuts/`)).then((ShortCuts) => {
        console.log(ShortCuts.size)
        ShortCuts.forEach((shortcut)=>{
            shortcutBar.innerHTML += `
            <button class="shortcut-button" id="shortcut-${shortcut.key}" onclick="document.getElementById('prod-search').value = '${shortcut.val()}'; renderItems('${shortcut.val()}',true);"> ${shortcut.val()} </button>
            `
            console.log(shortcut.val())
        })
        if(ShortCuts.size <= 3){
            for(let i = 0; i < 3 - ShortCuts.size; i++){
            shortcutBar.innerHTML += `
                <button class="shortcut-unset-button" onclick="addShortcut()"> + Atajo </button>
                `}
        }
    })
   
}

function createBusiness(business){
    if(business == null || business.trim() === '') {
        alert('Nombre de negocio inválido. Por favor, inténtalo de nuevo.')
        return;
    }
    set(ref(db,'businesses/'+business),{'sales':''}).then(()=>{
        console.log('business created')
    })
}

window.createBusiness = createBusiness;

function addShortcut(){
    window.availableShortcuts = {
        0: '',
        1: '',
        2: ''
    }

    get(child(ref(db),`/users/${localStorage.getItem('USER')}/shortcuts/`)).then((ShortCuts) => {
            let newShortcutID = ShortCuts.size; // Use the current size as the new ID
            if(ShortCuts.size >= 3){
                alert('Has alcanzado el máximo de atajos (3). Elimina uno existente para agregar uno nuevo.')
                return;
            }

            ShortCuts.forEach((shortcut)=>{
                window.availableShortcuts[shortcut.key] = shortcut.val();
            })

            // Find the first available ID
            for(let i = 0; i < 3; i++){
                if(window.availableShortcuts[i] === ''){
                    newShortcutID = i;
                    break;
                }
            }

            let shortcutName = prompt('Ingrese el nombre del producto o categoria a agregar como atajo. (Puede ser parcial para abarcar un mayor numero de articulos.)')
            if(shortcutName == null || shortcutName.trim() === ''){
                alert('Nombre de atajo inválido. Por favor, inténtalo de nuevo.')
                return;
            }
            set(ref(db,`/users/${localStorage.getItem('USER')}/shortcuts/${newShortcutID}`), shortcutName).then(()=>{
                console.log('shortcut added')
                shortcutButtonRender()
            })
    });
    
    
   
}

window.editShortcuts = editShortcuts;
window.addShortcut = addShortcut;
window.editShortcutsMode = false;

function editShortcuts(){
    window.editShortcutsMode = !window.editShortcutsMode;


    if(window.editShortcutsMode){
        shortcutBar.innerHTML = `
            <button id="edit-shortcut" class="shortcut-edit-button" onclick="editShortcuts()">
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" opacity="0.9" style="filter: invert(1);" width="20" height="20" viewBox="0 0 48 48">
                <path d="M38.657 18.536l2.44-2.44c2.534-2.534 2.534-6.658 0-9.193-1.227-1.226-2.858-1.9-4.597-1.9s-3.371.675-4.597 1.901l-2.439 2.439L38.657 18.536zM27.343 11.464L9.274 29.533c-.385.385-.678.86-.848 1.375L5.076 41.029c-.179.538-.038 1.131.363 1.532C5.726 42.847 6.108 43 6.5 43c.158 0 .317-.025.472-.076l10.118-3.351c.517-.17.993-.463 1.378-.849l18.068-18.068L27.343 11.464z"></path>
                </svg>
            </button>
            `
    console.log('rendering shortcuts')

    get(child(ref(db),`/users/${localStorage.getItem('USER')}/shortcuts/`)).then((ShortCuts) => {
        console.log(ShortCuts.size)
        ShortCuts.forEach((shortcut)=>{
            shortcutBar.innerHTML += `
            <button class="shortcut-edit-mode" id="shortcut-${shortcut.key}" onclick="editShortcut('${shortcut.key}')"> ${shortcut.val()} </button>
            `
            console.log(shortcut.val())
        })
        if(ShortCuts.size <= 3){
            for(let i = 0; i < 3 - ShortCuts.size; i++){
            shortcutBar.innerHTML += `
                <button class="shortcut-unset-button" onclick="addShortcut()"> + Atajo </button>
                `}
        }
    })
    }
    else{
        shortcutButtonRender()
    }
    
}

function editShortcut(id){
    let newValue = prompt('ingrese el nuevo valor del atajo. Deje vacio para eliminarlo')
        
        if(newValue == ''){
            remove(ref(db,`/users/${localStorage.getItem('USER')}/shortcuts/${id}`)).then(()=>{
                console.log('shortcut removed')
                editShortcuts()
            })
        }else{
            set(ref(db,`/users/${localStorage.getItem('USER')}/shortcuts/${id}`), newValue).then(()=>{
                console.log('shortcut updated')
                editShortcuts()
            })
        }
    
}

window.editShortcut = editShortcut;

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

window.itemHistory = itemHistory;

function itemHistory(item){
    let business = localStorage.getItem('business')
    let historyList = 0
    get(child(ref(db),`/businesses/${business}/sales/`)).then((year) => {
        year.forEach((month)=>{
            month.forEach((day)=>{
                day.forEach((sale)=>{   
                    Object.entries(sale.val().Items).forEach((saleItem)=>{
                        if(String(saleItem[0]).split(' ')[0] == item){
                            historyList += Number(saleItem[0]).split(' ')[1]
                        }
                    })
                })    
            })
        })
        alert(`En total se han vendido ${historyList} unidades de ${String(item).split(' ')[0].replaceAll('_',' ')}`)
    })
}                                                     