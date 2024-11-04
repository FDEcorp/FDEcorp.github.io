import {set, get, update, remove, ref, child, getDatabase} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

let fromDateInput = document.getElementById('from-date')
let toDateInput = document.getElementById('to-date')
let salestotalDisp = document.getElementById('sales-total')
let salestotalDispCash = document.getElementById('sales-total-cash')
let salestotalDispCard = document.getElementById('sales-total-card')
let business = localStorage.getItem('business')
let datatoload = []
let datatoload2 = []
let productCategories = {}
let prodCatSum = {}


get(child(ref(db),`/businesses/${business}/Products`)).then((Products) => {
    Products.forEach(
        function(product){
            if(product.val().category == undefined || product.val().category == ""){
                productCategories[product.key] = "unknown"
            }
            productCategories[product.key] = product.val().category
        })
        console.log(productCategories)
})


fromDateInput.addEventListener('change',()=>{
    getSales()
})

toDateInput.addEventListener('change',()=>{
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
    datatoload2 = []
    salesbyHour = {}
    prodCatSum = {}

    drawChart()
    drawChart2()


    console.log("getting sales")
    let [year,month,day] = String(fromDateInput.value).split("-")
    get(child(ref(db),`/businesses/${business}/sales/${year}/${month}/${day}`)).then((Sales) => {
        (Sales).forEach((Sale)=>{
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
            getSaleItemsCat(Sale.val().Items)
            
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
        datatoload2 = Object.keys(prodCatSum).map((cat)=>[cat,prodCatSum[cat]])

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
    setTimeout(() => {
    
     // Create the data table.
    var data = new google.visualization.DataTable();
    var data2 = new google.visualization.DataTable();
    data.addColumn('number', 'Hora');
    data.addColumn('number', 'Sales');     
    data2.addColumn('string', 'category');
    data2.addColumn('number', 'quantity');       
    
    data.addRows(datatoload);
    data2.addRows(datatoload2);  

     // Set chart options
    var options = {
                    'height':'260',
                    'bar': {groupWidth: "20"},
                    'legend': { position: "none" },
                    'vAxis': {format:"$ ",minValue: 1, maxValue: 0, gridlines: {
                        count: 10
                    }},
                    'hAxis': {format:"",minValue: 8, maxValue: 24, gridlines: {
                        count: 12
                    }}
                };

    var options2 = {
                    pieHole: 0.4,
                };
    
     // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    var chart2 = new google.visualization.PieChart(document.getElementById('donutchart'));

    chart.draw(data, options);
    chart2.draw(data2, options2);
    }, "500");
    
    
}

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

function drawChart2() {
    setTimeout(() => {
    
     // Create the data table.
    var data2 = new google.visualization.DataTable();
    data2.addColumn('string', 'category');
    data2.addColumn('number', 'quantity');       
    data2.addRows(datatoload2);

     // Set chart options
    var options2 = {
        title: 'Sales by Category',
        pieHole: 0.4,
    };
    
    var chart2 = new google.visualization.PieChart(document.getElementById('donutchart'));

    chart2.draw(data2, options2);
    }, "500");
    
    
}
