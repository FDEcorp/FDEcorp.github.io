import {set, get, update, remove, ref, child, getDatabase} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

let fromDateInput = document.getElementById('from-date')
let toDateInput = document.getElementById('to-date')
let salestotalDisp = document.getElementById('sales-total')
let salestotalDispCash = document.getElementById('sales-total-cash')
let salestotalDispCard = document.getElementById('sales-total-card')




fromDateInput.addEventListener('change',()=>{
    console.log(fromDateInput.value)
    getSales()
})

toDateInput.addEventListener('change',()=>{
    console.log(toDateInput.value)
    getSales()
})

function getSales(){
    salestotalDisp.innerText = 0 
    salestotalDispCash.innerText = 0
    salestotalDispCard.innerText = 0
    document.getElementById('sales-list').innerHTML = ''

    let business = localStorage.getItem('business')
    console.log("getting sales")
    let [year,month,day] = String(fromDateInput.value).split("-")
    console.log(year,month,day)
    get(child(ref(db),`/businesses/${business}/sales/${year}/${month}/${day}`)).then((Sales) => {
        (Sales).forEach((Sale)=>{
            console.log(Sale.val())
            document.getElementById('sales-list').innerHTML += `
                <li class="sale-record" id="${Sale.key}">
                    <div class="sale-time" style="flex: 3; text-align: left">${Sale.val().Time}</div>
                    <div class="sale-time" style="flex: 2; text-align: right">${Sale.val().Method}</div>

                    <div class="sale-total" style="flex: 1"> $ ${Sale.val().Total} </div>
                </li>
            `

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

