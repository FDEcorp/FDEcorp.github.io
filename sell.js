import {set, get, update, remove, ref, child, getDatabase} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

function setCorte() {
    let business = localStorage.getItem('business')
    let TimeStamp = String(new Date()).substring(16,24);
    let year = new Date().getFullYear();
    let month = (new Date().getMonth()+1);
    let day = String(new Date().getDate()).padStart(2,'0')

    let previousCash = 0
    let previousCard = 0
    let previousTotal = 0

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
                        TimeStamp: String(new Date()).substring(16,24)
                    })
                    alert(`Corte: \n\n
                        cash: ${cashSUM-previousCash}
                        card: ${cardSUM-previousCard}
                        total: ${totalSUM-previousTotal}
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