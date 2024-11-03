import {set, get, update, remove, ref, child, getDatabase} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

let fromDateInput = document.getElementById('from-date')
let toDateInput = document.getElementById('to-date')
let salestotalDisp = document.getElementById('sales-total')
let salestotalDispCash = document.getElementById('sales-total-cash')
let salestotalDispCard = document.getElementById('sales-total-card')

let datatoload = []



fromDateInput.addEventListener('change',()=>{
    console.log(fromDateInput.value)
    getSales()
})

toDateInput.addEventListener('change',()=>{
    console.log(toDateInput.value)
    getSales()
})

window.salesbyHour = {}

function groupByHour(time,amount){
    let [hours,minutes,seconds] = String(time).split(":")
    let years = 2024
    let day = 2
    let monthIndex = 10

    if(salesbyHour[hours]==undefined){
        salesbyHour[hours] = Number(amount)
    }
    else{
        salesbyHour[hours] = Number(salesbyHour[hours]) + amount
    }

}

function getSales(){
    salestotalDisp.innerText = 0 
    salestotalDispCash.innerText = 0
    salestotalDispCard.innerText = 0
    let salesTotal = 0
    document.getElementById('sales-list').innerHTML = ''
    datatoload = []

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
            salesTotal += Sale.val().Total
            let years = Sale.key.substring(0,4)
            let monthIndex = Number(Sale.key.substring(4,6))-1
            let day = Sale.key.substring(6,8)
            let hours = Sale.val().Time.substring(0,2)
            let minutes = Sale.val().Time.substring(3,5)
            let seconds = Sale.val().Time.substring(6,8)
           
            groupByHour(Sale.val().Time,Sale.val().Total)
            
            salestotalDisp.innerText = Number(salestotalDisp.innerText) + Number(Sale.val().Total)
            if(Sale.val().Method == "cash"){
                salestotalDispCash.innerText = Number(salestotalDispCash.innerText) + Number(Sale.val().Total)
            }
            else{
                salestotalDispCard.innerText = Number(salestotalDispCard.innerText) + Number(Sale.val().Total)

            }
        })
        //update date to load
        datatoload = Object.keys(salesbyHour).map((hour,amount) => [Number(hour), salesbyHour[hour]])
        console.log("data",datatoload)
        //datatoload.push([new Date(years, monthIndex, day, hours, minutes, seconds), amount])
        drawChart()
    })
    
    
}


 // Load the Visualization API and the piechart package.
 google.charts.load('current', {'packages':['bar']});
 google.charts.load('current', {'packages':['corechart']});
 google.charts.load('current', {'packages':['table']});
 // Set a callback to run when the Google Visualization API is loaded.
 google.charts.setOnLoadCallback(drawChart);


function drawChart() {
    console.log(datatoload)
    setTimeout(() => {
    
     // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'Hora');
    data.addColumn('number', 'Sales');       
    data.addRows(datatoload);
    
     // Set chart options
    var options = {
                    'height':'300',
                    'width':`${window.innerWidth}`,
                    'bar': {groupWidth: "95%"},
                    'legend': { position: "none" },
                };
    
     // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));

     
    chart.draw(data, options);
    }, "1000");
    
    
}