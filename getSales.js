import {set, get, update, remove, ref, child, getDatabase} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

let fromDateInput = document.getElementById('from-date')
let toDateInput = document.getElementById('to-date')
let salestotalDisp = document.getElementById('sales-total')
let salestotalDispCash = document.getElementById('sales-total-cash')
let salestotalDispCard = document.getElementById('sales-total-card')

salestotalDisp.innerText = 0 
salestotalDispCash.innerText = 0
salestotalDispCard.innerText = 0


fromDateInput.addEventListener('change',()=>{
    console.log(fromDateInput.value)
    getSales()
})

toDateInput.addEventListener('change',()=>{
    console.log(toDateInput.value)
    getSales()
})

function getSales(){
    let business = localStorage.getItem('business')
    console.log("getting sales")
    let [year,month,day] = String(fromDateInput.value).split("-")
    console.log(year,month,day)
    get(child(ref(db),`/businesses/${business}/sales/${year}/${month}/${day}`)).then((Sales) => {
        (Sales).forEach((Sale)=>{
            console.log(Sale.val())
            salestotalDisp.innerText = Number(salestotalDisp.innerText) + Number(Sale.val().Total)
            if(Sale.val().Method == "cash"){
                salestotalDispCash.innerText = Number(salestotalDispCash.innerText) + Number(Sale.val().Total)
            }
            else{
                salestotalDispCard.innerText = Number(salestotalDispCard.innerText) + Number(Sale.val().Total)

            }
        })
    })
}

