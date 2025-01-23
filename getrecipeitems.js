let currentRecipe = document.getElementById("current-recipe")
let availItems = document.getElementById("avail-items")
let availSkus = document.getElementById("avail-skus")
import {set, get, update, remove, ref, child, getDatabase} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 
let prodSelect = document.getElementById('product-select')

let filterSelect = document.getElementById('cat-filter') 
let filterReset = document.getElementById('filter-reset') 
let prodSearch = document.getElementById('prod-search') 
let searchReset = document.getElementById('search-reset') 
window.categorias = {}
window.catList = []

let business = localStorage.getItem('business')
window.productSkus = {}

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
                    <div onclick="additemtorecipe('${item.key}')" style="width: 70px; text-align: right;"><button style="width: 30px; height: 30px; padding:0; padding-bottom:4px; background: rgb(255,96,96)">+</button>
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
    let qty =  Number(document.getElementById(item+'-input').value)
    if(qty==0 || qty==NaN){
        qty = 1;
    }
    
    set(ref(db,`/businesses/${business}/Recipes/${PROD[0]}/${PROD[1]}/${item}`),{
        cantidad: qty,
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
    
    console.log(productSkus[product])
    updateSel(product,productSkus[product][0][1].sizeLabel)

}

function updateSel(product,sku){
    currentRecipe.innerHTML = ""
    let productName = String(product).replaceAll(' ','_')
    window.selectedprodandsku = productName+"#"+sku
    console.log(selectedprodandsku)

    document.getElementById('selected-item').innerHTML = `${productName} ${sku}`

    get(child(ref(db),`/businesses/${business}/Recipes/${productName}/${sku}`)).then((Ingredients) => {
        if(Ingredients.exists()){
            console.log(`recipe for ${productName} found`)
            
            Ingredients.forEach((item)=>{
                currentRecipe.innerHTML += `
                <li style="margin-bottom: 4px;background-color: rgb(255, 255, 255); padding-inline: 8px; width: auto; display: flex; flex-direction: row; gap: 8px; align-items: center; border: 0px solid rgb(220,220,220); border-radius: 10px;">
                    <div style="text-align: left; flex-grow: 1; font-weight: bold; padding-left: 4px;">${String(item.key).replaceAll('_',' ')}</div>
                    
                    <div style="text-align: right; padding: 0px; width: 60px;">
                        <input id="${item.key}-qty-input" onchange="udpateItemQty('${productName}','${sku}','${item.key}',this.value)" type="text" value="${item.val().cantidad}" placeholder="Cantidad" style="height: 16px; width: 50px; border-radius: 6px; border: 0px; text-align: right;">
                    </div>
                    <div style="width: 100px; display: flex; flex-direction: row; gap: 4px; justify-content: right;">
                        <div onclick="addToAllVariants('${productName}','${item.key}')" style="width: 50px; background: rgb(5, 161, 233) ; color: white; height: 20px; border: 0px solid rgb(100,100,100); padding: 4px; border-radius: 8px">All Var</div>
                        <div onclick="udpateItemQty('${productName}','${sku}','${item.key}',0)" style="width: 20px; background: rgb(255, 96, 96) ;color: white;height: 20px; border: 0px solid rgb(100,100,100); padding: 4px; border-radius: 8px">x</div>
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
window.udpateItemQty = udpateItemQty;

function udpateItemQty(product,sku,item,newQty){
    if(newQty == 0){
        console.log('borrando articulo',item)
        remove(child(ref(db),`/businesses/${business}/Recipes/${product}/${sku}/${item}`)) 
    }else{
        console.log(product,item,newQty)
        set(ref(db,`/businesses/${business}/Recipes/${product}/${sku}/${item}`),{
            cantidad: newQty,
        })
    }
    updateSel(product,sku)
}
window.addToAllVariants = addToAllVariants;

function addToAllVariants(product,item){

    let qty = document.getElementById(item+'-qty-input').value
    let productName = String(product).replaceAll('_',' ')
    console.log(productName,item)
    productSkus[productName].forEach((size)=>{
        set(ref(db,`/businesses/${business}/Recipes/${product}/${size[1].sizeLabel}/${item}`),{
            cantidad: qty,
        })
    })

}
window.copyToMemory = copyToMemory
window.pasteFromMemory =pasteFromMemory

function copyToMemory(){
    let [prod,sku] = selectedprodandsku.split('#')
    let productName = String(prod).replaceAll(' ','_')
    
    get(child(ref(db),`/businesses/${business}/Recipes/${prod}/${sku}`)).then((Ingredients) => {
        let recipe = Ingredients.val()

        localStorage.recipe = JSON.stringify(recipe)
        console.log(productName,sku,recipe)
        alert(JSON.stringify(recipe))
    })
    
}

function pasteFromMemory(){
    let [prod,sku] = selectedprodandsku.split('#')
    let productName = String(prod).replaceAll(' ','_')
    let recipe = JSON.parse(localStorage.getItem('recipe'))
    set(ref(db,`/businesses/${business}/Recipes/${prod}/${sku}/`),recipe)
    updateSel(prod,sku)
}

filterSelect.addEventListener('change',()=>{
    availItems.innerHTML = ''
    prodSearch.value = ''
    renderItems(filterSelect.value)
})
filterReset.addEventListener('click',()=>{
    availItems.innerHTML = ''
    prodSearch.val = ''
    filterSelect.value = 'all'
    renderItems()
})

prodSearch.addEventListener('change',()=>{
    availItems.innerHTML = ''
    filterSelect.value = 'all'
    renderItems(prodSearch.value,true)
})
searchReset.addEventListener('click',()=>{
    availItems.innerHTML = ''
    filterSelect.value = 'all'
    prodSearch.value = ''
    renderItems()
})


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

function renderItems(filter = 'all',productSearch=false){

    availItems.innerHTML=""

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
                        availItems.innerHTML += `
            <li id="${item.key}" style="background-color: white; padding-inline: 8px; width: auto; display: flex; flex-direction: row; gap: 8px; align-items: center; border: 0px solid rgb(220,220,220); border-radius: 10px;">
                    <div style="text-align: left; flex-grow: 1; font-weight: bold; padding-left: 4px;">${String(item.key).replaceAll('_',' ')}</div>
                    </div><div style="text-align: right; padding: 0px; width: 100px;">
                        <input id="${item.key}-input" type="text" placeholder="Cantidad" style="height: 16px; width: 80px; border-radius: 6px; border: 0px; text-align: right;">
                    </div>
                    <div onclick="additemtorecipe('${item.key}')" style="width: 70px; text-align: right;"><button style="width: 30px; height: 30px; padding:0; padding-bottom:4px; background: rgb(255,96,96)">+</button>
            </li>
            `}
                    
                    }
                }
    
                

    
            }
    
            
        )
        })
    })
}