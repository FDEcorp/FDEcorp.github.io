import {set, get, update, remove, ref, child, getDatabase} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

function setCorte(){
    let EfectivoEnCaja = prompt("Ingresa cuanto efectivo hay en caja:")

    if(EfectivoEnCaja == "" || EfectivoEnCaja == null){
        alert("Favor de ingresar cuanto hay en caja")
        return
    }
    else{
        registerCorte(EfectivoEnCaja)
    }

}

function registerCorte(EfectivoEnCaja) {
    let business = localStorage.getItem('business')
    let TimeStamp = String(new Date()).substring(16,24);
    let year = new Date().getFullYear();
    let month = (new Date().getMonth()+1);
    let day = String(new Date().getDate()).padStart(2,'0')

    let previousCash = 0
    let previousCard = 0
    let previousTotal = 0

    let prodCatSum = {}

    get(child(ref(db),`/businesses/${business}/Cortes/${year}/${month}/${day}`)).then((Cortes) => {
        let index = 0;
        if(!Cortes.exists()){
            console.log("no records")
        }
        


        Cortes.forEach((corte)=>{
            console.log(index,corte.val())
            previousCard += corte.val().card
            previousCash += corte.val().cash
            previousTotal += corte.val().total

            index ++;
        })

        get(child(ref(db),`/businesses/${business}/sales/${year}/${month}/${day}`)).then((Sales) => {
            let totalSUM = 0
            let cashSUM = 0
            let cardSUM = 0
            let index2 = 0
            console.log('number of sales: ',Sales,Sales.size)
            window.sale = Sales
            Sales.forEach((sale)=>{
                totalSUM = totalSUM + sale.val().Total

                if(sale.val().Method == "cash"){
                    cashSUM = cashSUM + sale.val().Total
                }else{
                    cardSUM = cardSUM + sale.val().Total
                }
                
                index2++

                if(index2 == Sales.size){
                    set(ref(db,'businesses/'+business+'/Cortes/'+year+"/"+month+"/"+day+'/'+ index),{
                        card:cardSUM-previousCard,
                        cash:cashSUM-previousCash,
                        total:totalSUM-previousTotal,
                        cashReal: EfectivoEnCaja,
                        diff: EfectivoEnCaja-(cashSUM-previousCash),
                        TimeStamp: String(new Date()).substring(16,24)
                    })
                    alert(`Corte ${index}: ${String(new Date()).substring(16,24)} \n
                        cash: ${cashSUM-previousCash}
                        cash en caja: ${EfectivoEnCaja}
                        differencia de efectivo: ${EfectivoEnCaja - (cashSUM-previousCash)}
                        \n
                        card: ${cardSUM-previousCard}
                        Total: ${totalSUM-previousTotal}
                        `)
                }
                
            })

                
        
        
        })

       
        

        
    })
    

    //get corte for todays date, if no record exists, create record 0
    
    //if exists create n+1 record
        //for each corte record get sum of total, sum of cash, sum of card

    //get sum of all sales and subtract previous cortes sum

    //set values at n+1 record

}

window.setCorte = setCorte
window.registerCorte = registerCorte


function getSaleItemsCat(saleItems){
    Object.entries(saleItems).forEach((item)=>{
        let itemName = String(item[0]).split(" ")[0]
        let qty = item[1][0]
        let cat = productCategories[itemName]

        if(prodCatSum[cat]==undefined){
            prodCatSum[cat] = Number(qty)
        }
        else{
            prodCatSum[cat] = Number(prodCatSum[cat])+Number(qty)
        }
    })
    //let item = String(Object.entries(saleItems)[0]).split(" ")[0]
    //let qty = Object.entries(saleItems)[0][1]
    //console.log("items in order:",item,qty)
}