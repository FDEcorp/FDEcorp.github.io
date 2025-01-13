let currentRecipe = document.getElementById("current-recipe")
let availItems = document.getElementById("avail-items")
let availSkus = document.getElementById("avail-skus")
import {set, get, update, remove, ref, child, getDatabase} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 
let prodSelect = document.getElementById('product-select')

let business = localStorage.getItem('business')
let productSkus = {}

get(child(ref(db),`/businesses/${business}/Products/`)).then((Prods) => {
    Prods.forEach((product)=>{
        prodSelect.innerHTML += String(
        `
            <option value="${product.key}">${product.key}</option>
        ` 
        ).replaceAll('_',' ')

        productSkus[String(product.key).replaceAll('_',' ')] = Object.entries(product.val().Sizes)
    })
    console.log(productSkus)
})

get(child(ref(db),`/businesses/${business}/Items/`)).then((Items) => {
    Items.forEach(
        function(item){
            availItems.innerHTML += `
            <li id="${item.key}" style="background-color: white; padding-inline: 8px; width: auto; display: flex; flex-direction: row; gap: 8px; align-items: center; border: 0px solid rgb(220,220,220); border-radius: 10px;">
                    <div style="text-align: left; flex-grow: 1; font-weight: bold; padding-left: 4px;">${String(item.key).replaceAll('_',' ')}</div>
                    </div><div style="text-align: right; padding: 0px; width: 100px;"><input type="text" placeholder="Cantidad" style="height: 16px; width: 80px; border-radius: 6px; border: 0px; text-align: right;"></div>
                    <div style="width: 70px; text-align: right;"><button style="width: 30px; height: 30px; padding:0; padding-bottom:4px">+</button>
            </li>
            `

})})

prodSelect.addEventListener('change',()=>{
    getProdRecipe(prodSelect.value)
}) 

function getProdRecipe(product){
    console.log('searching recipe of',product)
    currentRecipe.innerHTML = ""
    availSkus.innerHTML = ""

    console.log(`${product} has ${productSkus[product].length} skus`)

    productSkus[product].forEach((size)=>{
        console.log(size[1].sizeLabel)
        availSkus.innerHTML += `
            <button onclick="updateSel('${product}','${size[1].sizeLabel}','${size[0]}')" class="sku-size" onfocus="document.getElementById('${size[1].sizeLabel}').style.background = 'rgb(237, 237, 237)'" onblur="document.getElementById('${size[1].sizeLabel}').style.background = 'rgb(255, 255, 255)'" id="${size[1].sizeLabel}">${size[1].sizeLabel}</button>
        `
    })
    
    

    
    
}


function updateSel(product,size,sku){
    currentRecipe.innerHTML = ""

    document.getElementById('selected-item').innerHTML = `${product} ${size}`

    get(child(ref(db),`/businesses/${business}/Recipes/${product}/${sku}`)).then((Product) => {
        if(Product.exists()){
            console.log(`recipe for ${product} found`)
        }
        else{
            console.log(`recipe for ${product} NOT found`)
        }
    })
}
window.updateSel = updateSel;