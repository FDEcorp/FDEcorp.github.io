import {set, get, update, remove, ref, child} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

let item = document.getElementById('new-item-name')
let itemCat = document.getElementById('new-item-cat')
let itemImg = document.getElementById('new-item-img')

let numberOfOptions = document.getElementById('new-item-skus')
let submitButton = document.getElementById('add-item-button')

function uploadItem(){
    if(item.value ==""){return}
    let business = localStorage.getItem('business')
    
    for(let i=0; i < numberOfOptions.value; i++){
        let sizeName = document.getElementById('item-size-'+i).value
        let price = Number(String(document.getElementById('item-price-'+i).value).replace(/\D/g,''))

        console.log(
            item.value,
            String(sizeName).toUpperCase(),
            price
        )

        let itemName = String(item.value).trim().replaceAll(' ','_')

        update(ref(db,'businesses/'+business+'/Products/'+itemName+"/Sizes/"+i),{
           price: price,
           sizeLabel: sizeName
        });

        update(ref(db,'businesses/'+business+'/Products/'+itemName+"/"),{
            image: itemImg.value,
            category: String(itemCat.value).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,"")
         });
    }
}

submitButton.addEventListener('click',()=>{
    uploadItem()

    if(confirm("Registrado! Deseas agregar otro producto?")){
        setTimeout(() => {
            location.href = 'newProduct.html'
        }, "1000");
    }
    else{
        setTimeout(() => {
            location.href = 'pos.html'
        }, "1000");
    }
})

