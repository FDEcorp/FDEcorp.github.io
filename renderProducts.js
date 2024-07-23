import {set, get, update, remove, ref, child, getDatabase} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 
 
/*
<div class="product">
<section style="background-color: rgb(202, 202, 202); height:60%; margin: 10px; border-radius: 6px;"></section>
<div style="display: flex; gap: 10px; padding: 10px; padding-top:0;">
    <button class="size-button">S</button>
    <button class="size-button">L</button>
</div>
</div> 
*/

let business = localStorage.getItem('business')
let prodList = document.getElementById('products-window')
let orderList = document.getElementById('items-ordered-ul')
let orderTotalDisp = document.getElementById('subtotal-qty')


window.order = {}
window.orderArr = []
window.total = 0

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
            <div style="flex: 5; text-align: left;">${String(item).replaceAll('_',' ')} ${size}</div>                         
            <div style="flex: 1; text-align: left;">x${qty}</div>
            <div style="flex: 2; text-align: left;">$ ${price}</div>
        </li>
        `
    })
    
    
    orderTotalDisp.innerText = `$ ${total}`
}

function calcTotal(){
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
        <button class="size-button" id="${product.key+'-'+index}" onclick="addToOrder('${product.key} ${Object.keys(test[index][1])} ${Object.values(Object.values(test)[index][1])[0].price}')">
            ${Object.keys(test[index][1])}
        </button>
        `
    )
    return String(Options).replaceAll(',','')
}

get(child(ref(db),`/businesses/${business}/Products/`)).then((Products) => {
    Products.forEach(
        function(product){
            
            let image = Object.values(product.val())[1]
            prodList.innerHTML += `
            <div class="product" id="${product.key}-card">
                <section ondblclick="removeItem('${product.key}')" style="background-color:rgb(200,200,200); background-image: linear-gradient(to top, rgba(255, 255, 255, 0), rgba(240, 240, 240, 1)),url('${image}'); background-size: cover;background-position: center; height:65%; margin: 6px; border-radius: 6px; display: flex; align-content: center; justify-content: center;">
                    <div style="font-weight:800; font-size:16px; color: Black; width: 100px; margin-top:10px">${String(product.key).replaceAll('_',' ')}<div>
                </section>

                <div style="display: flex; gap: 4px; padding: 6px; padding-top:0;" id="${product.key}">`+ 
                getSizes(product)+
                    `
                </div>
            </div> 
            `

        }

        
    )
})

function removeItem(item){
    if(confirm('¿Quieres eliminar este producto?')){
        alert('borrado')
        location.href = 'pos.html'
    }
}

window.undoAdd = undoAdd
window.removeItem = removeItem
window.addToOrder = addToOrder
window.clearOrder = clearOrder