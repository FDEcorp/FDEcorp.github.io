import {set, get, update, remove, ref, child, getDatabase} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

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

let categorias = {}

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
    console.log(categorias)
    document.getElementById('cat-filter').innerHTML += Object.keys(categorias).map((cat)=>`<option value="${cat}">${cat}</option>`)
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

    alert('Success')
    clearOrder()
}

function hideChangeCalc(){
    document.getElementById('change-calculator-pane').style.visibility = 'hidden'
}

function showChangeCalc(){
    if(total <= 0){
        return
    }
    document.getElementById('change-calculator-pane').style.visibility = 'visible'
    let listUl = document.getElementById('confirm-order-list')
    let totalDisp = document.getElementById('total-change-pane')
    totalDisp.innerText = total
    window.orderListArr = Object.entries(order)
    console.log(orderListArr)

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
    console.log('latest added',latest);
    //if in object qty greater than 1, decrease by 1
    if(order[latest][0] > 1) {
        order[latest][0]--
        console.log('minus one: ',order)
    }
    //if 1, remove from object
    else{
        delete order[latest]
        console.log('removed',order)
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
        <button class="size-button" id="${product.key+'-'+index}" onclick="addToOrder('${product.key} ${Object.values(test[index][1])[1]} ${Object.values(test[index][1])[0]}')">
            ${Object.values(test[index][1])[1]}
        </button>
        `
    )
    return String(Options).replaceAll(',','')
}

function getPrices(product){
    let Size = product.val().Sizes
    
    window.test = Object.entries(Size)
    console.log("sizes",product.val(),test)
    
    let Options = test.map((size,index)=>
        `
        <p style="padding: 0; margin: 0; display: inline;" id="${product.key+'-'+index}">
        $  ${Object.values(test[index][1])[0]}
        </p>
        `
    )
    return String(Options).replaceAll(',','')
}

function renderItems(filter = 'all',productSearch=false){
    console.log("filtrando por",filter)
    get(child(ref(db),`/businesses/${business}/Products/`)).then((Products) => {
        Products.forEach(
            function(product){
                
                console.log(product.key,product.val().Sizes)
    
                let image = Object.values(product.val())[2]
                console.log(image)

                if(filter == 'all' || (filter == product.val().category && productSearch==false) || (productSearch == true && String(product.key).toLowerCase().includes(String(prodSearch.value).trim().replaceAll(' ','_').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,"") ) )){


                prodList.innerHTML += `
                <div class="product" id="${product.key}-card">
                    <div ondblclick="editProd('${product.key}')" style="height:70px; margin: 6px; border-radius: 6px; display: flex; flex-direction: row;" class="doubletap">
                        <div style="background-color:rgb(200,200,200); background-image: url('${image}'); background-size: cover;background-position: center; width: 40%; border-radius: 8px"></div>
                        <div class="wrap" style="font-weight:600; font-size: 16px; color: Black; width: 100px; text-align: left; width: 60%; padding-left: 8px; display: flex; flex-direction: column; align-items: start;">
                        <div style="height:50px; overflow: hidden" onclick="editProd('${product.key}')">
                        ${String(product.key).replaceAll('_',' ')}
                        </div>
                      
                        <span style="font-size: 10px; color: rgb(150,150,150); font-weight: 800">Precios:</span>
                        <span style="font-size: 14px; color: rgb(150,150,150); font-weight: 800" id="${product.key}-prices">${getPrices(product)}</span>
                        
                        </div>
                        
                    </div>
                   
                    <div style="display: flex; gap: 4px; padding: 6px; padding-top:0;" id="${product.key}">`+ 
                    getSizes(product)+
                        `
                    </div>
                </div> 
                `
                }
    
            }
    
            
        )
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