let currentRecipe = document.getElementById("current-recipe")
let availItems = document.getElementById("avail-items")
let availSkus = document.getElementById("avail-skus")
import {set, get, update, remove, ref, child, getDatabase} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 
let prodSelect = document.getElementById('product-select')

let business = localStorage.getItem('business')
let productSkus = {}

window.selectedprodandsku = ""

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
                    </div><div style="text-align: right; padding: 0px; width: 100px;">
                        <input id="${item.key}-input" type="text" placeholder="Cantidad" style="height: 16px; width: 80px; border-radius: 6px; border: 0px; text-align: right;">
                    </div>
                    <div onclick="additemtorecipe('${item.key}')" style="width: 70px; text-align: right;"><button style="width: 30px; height: 30px; padding:0; padding-bottom:4px">+</button>
            </li>
            `

})})

prodSelect.addEventListener('change',()=>{
    getProdSkus(prodSelect.value)
}) 

window.additemtorecipe = additemtorecipe

function additemtorecipe(item){

    
    let PROD=String(selectedprodandsku).split('#')
    if(PROD[0] == 'undefined' || PROD[0] == undefined || PROD[0] == '' || PROD[0] == null){
        alert('debes seleccionar un producto y tamaño')
        return
    }

    console.log(`adding ${item} to ${PROD[0]} recipe`)
    set(ref(db,`/businesses/${business}/Recipes/${PROD[0]}/${PROD[1]}/${item}`),{
        cantidad: Number(document.getElementById(item+'-input').value),
    })
    document.getElementById(item+'-input').value = ''
    updateSel(PROD[0],PROD[1])
}

function getProdRecipe(product,sku){
    let productName = String(product).replaceAll(' ','_')
    console.log(`getting recipe for ${productName} at sku ${sku}`)
}

window.getProdRecipe = getProdRecipe
window.getProdSkus = getProdSkus

function getProdSkus(product){
    console.log('searching recipe of',product)
    currentRecipe.innerHTML = ""
    availSkus.innerHTML = ""

    console.log(`${product} has ${productSkus[product].length} skus`)

    productSkus[product].forEach((size)=>{
        availSkus.innerHTML += `
            <button id="${product}-${size[0]}" onclick="getProdRecipe('${product}','${size[0]}');updateSel('${product}','${size[1].sizeLabel}','${size[0]}');" class="sku-size" onfocus="document.getElementById('${product}-${size[0]}').style.background = 'rgb(237, 237, 237)'" onblur="document.getElementById('${product}-${size[0]}').style.background = 'rgb(255, 255, 255)'">${size[1].sizeLabel}</button>
        `
    })
    
    

    
    
}

function updateSel(product,sku){
    currentRecipe.innerHTML = ""
    let productName = String(product).replaceAll(' ','_')
    window.selectedprodandsku = productName+"#"+sku
    console.log(selectedprodandsku)

    document.getElementById('selected-item').innerHTML = `${product} ${sku}`

    get(child(ref(db),`/businesses/${business}/Recipes/${productName}/${sku}`)).then((Ingredients) => {
        if(Ingredients.exists()){
            console.log(`recipe for ${productName} found`)
            
            Ingredients.forEach((item)=>{
                currentRecipe.innerHTML += `
                <li style="background-color: transparent; padding-inline: 8px; width: auto; display: flex; flex-direction: row; gap: 8px; align-items: center; border: 0px solid rgb(220,220,220); border-radius: 10px;">
                    <div style="text-align: left; flex-grow: 1; font-weight: bold; padding-left: 4px;">${Strin(item.key).replaceAll('_',' ')}</div>
                    <div style="width: 30px;"></div>
                    <div style="text-align: right; padding: 0px; width: 120px;">
                        <input type="text" value="${item.val().cantidad}" placeholder="Cantidad" style="height: 16px; width: 100px; border-radius: 6px; border: 0px; text-align: right;">
                    </div>
                </li>
            `
            })


            
        }
        else{
            console.log(`recipe for ${product} NOT found`)
            

        }
    })
}
window.updateSel = updateSel;