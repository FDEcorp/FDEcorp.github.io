import {set, get, update, remove, ref, child, getDatabase} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 
let business = localStorage.getItem('business')
let ProductSelect = document.getElementById('product-select')
let ProductSave = document.getElementById('save-button')
let prodDetail = {}
let skuList =  document.getElementById('sku-list')

get(child(ref(db),`/businesses/${business}/Products`)).then((Products) => {
    Products.forEach(
        function(product){
           ProductSelect.innerHTML += `
            <option value="${product.key}">${String(product.key).replaceAll("_"," ")}</option>
           `
        })
})

ProductSelect.addEventListener('change',()=>{
    getDetails(ProductSelect.value)
})

function getDetails(selected){
    get(child(ref(db),`/businesses/${business}/Products/${selected}`)).then((selected) => {
        console.log(selected.val())

        document.getElementById('prod-cat').value = selected.val().category
        document.getElementById('prod-img').value = selected.val().image
        let numberOfSkus = selected.val().Sizes
        document.getElementById('prod-skus').value = numberOfSkus.length

        document.getElementById('prod-skus').addEventListener('change',()=>{
            skuList.innerHTML = ''
            let numberOfOptions = document.getElementById('prod-skus').value
            for (let i = 0; i < numberOfOptions; i++) {
                skuList.innerHTML += `f
                <div style="display: flex; flex-direction: row; gap: 0px;">
                    <input type="text" id="item-size-${i}" style="width: 50px" placeholder="Tamaño">
                    <input type="text" id="item-price-${i}" style="width: 125px" placeholder="Precio">
                </div>
                `
            }
        })
        
        console.log(numberOfSkus.length)

        
        skuList.innerHTML = ""

        let Sizes = Object.entries(selected.val().Sizes)

        Sizes.forEach((size)=>{
            console.log(Object.values(size[1]))
            
            skuList.innerHTML += `
                    <div style="display: flex; flex-direction: row; gap: 0px;">
                        <input type="text" id="item-size-${size[0]}" style="width: 50px" placeholder="Tamaño" value="${Object.values(size[1])[1]}">
                        <input type="text" id="item-price-${size[0]}" style="width: 125px" placeholder="Precio" value="${Object.values(size[1])[0]}">
                    </div>
                    `
        })
                

    })
}

document.getElementById('inc-skus').addEventListener('click',()=>{
    skuList.innerHTML = ''
    let numberOfOptions = document.getElementById('prod-skus').value
    for (let i = 0; i < numberOfOptions; i++) {
        skuList.innerHTML += `
        <div style="display: flex; flex-direction: row; gap: 0px;">
            <input type="text" id="item-size-${i}" style="width: 50px" placeholder="Tamaño">
            <input type="text" id="item-price-${i}" style="width: 125px" placeholder="Precio">
        </div>
        `
    }
})

document.getElementById('dec-skus').addEventListener('click',()=>{
    skuList.innerHTML = ''
    let numberOfOptions = document.getElementById('prod-skus').value
    for (let i = 0; i < numberOfOptions; i++) {
        skuList.innerHTML += `
        <div style="display: flex; flex-direction: row; gap: 0px;">
            <input type="text" id="item-size-${i}" style="width: 50px" placeholder="Tamaño">
            <input type="text" id="item-price-${i}" style="width: 125px" placeholder="Precio">
        </div>
        `
    }
})

ProductSave.addEventListener('click',()=>{
    updateItem()
})

document.getElementById('delete-product').addEventListener('click',()=>{
    deleteItem()
})


function deleteItem(){
    let item = document.getElementById('product-select')
    if(item.value==""){return}
    
    if(confirm('¿Seguro que deseas eliminar '+ item.value + '?')){
        remove(child(ref(db),`businesses/${business}/Products/${item.value}`))
        setTimeout(()=>{
            location.href = 'ProductDetails.html'
        },'1000')
    }
}

function updateItem(){
    let business = localStorage.getItem('business')
    
    for(let i=0; i < document.getElementById('prod-skus').value; i++){
        let sizeName = document.getElementById('item-size-'+i).value
        let price = document.getElementById('item-price-'+i).value

        let item = document.getElementById('product-select')
        let itemName = String(item.value).trim().replaceAll(' ','_')

        remove(child(ref(db),`businesses/${business}/Products/${itemName}/Sizes`))

        setTimeout(() => {
            update(ref(db,'businesses/'+business+'/Products/'+itemName+"/Sizes/"+i),{
                price: price,
                sizeLabel: sizeName
             });
     
             update(ref(db,'businesses/'+business+'/Products/'+itemName+"/"),{
                 image: document.getElementById('prod-img').value,
                 category: String(document.getElementById('prod-cat').value).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,"")
              });

        }, "800");

        
    }
    setTimeout(()=>{
        if(confirm("Product modificado, Deseas regresar a Menu?")){
            location.href = 'menu.html'
          }
        else{
            location.href = 'ProductDetails.html'
        }
    },'1000')
    
}

window.getDetails = getDetails
