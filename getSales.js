import {set, get, update, remove, ref, child, getDatabase} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

let fromDateInput = document.getElementById('from-date')
let toDateInput = document.getElementById('to-date')
let salestotalDisp = document.getElementById('sales-total')
let salestotalDispCash = document.getElementById('sales-total-cash')
let salestotalDispCard = document.getElementById('sales-total-card')
let business = localStorage.getItem('business')
let datatoload = []
let datatoload2 = []
let datatoload3 = []
let productCategories = {}
let prodCatSum = {}

fromDateInput.value = new Date()
toDateInput.value = new Date()

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
    if(toDateInput.value == ""){
        toDateInput.value = fromDateInput.value
    }
    getSales()
})

toDateInput.addEventListener('change',()=>{
    getSales()
})

window.salesbyHour = {}
window.salesbyDate = {}

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

function groupByDate(day,month,year,amount){
    let date = `${day}/${month}/${year}`
    if(salesbyDate[date] == undefined){
        salesbyDate[date] = amount
    }else{
        salesbyDate[date] = salesbyDate[date] + amount
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
    salesbyDate = {}

    drawChart()
    
    console.log("getting sales in range")

    let [year,month,day] = String(fromDateInput.value).split("-")
    let [year2,month2,day2] = String(toDateInput.value).split("-")

    if(Number(year+month+day)>Number(year2+month2+day2)){
        console.log("fecha FROM debe ser MENOR a TO")
    }
    else{
        console.log("searching from: "+fromDateInput.value+" to:"+toDateInput.value)
    }

    if(month == month2){
        get(child(ref(db),`/businesses/${business}/sales/${year}/${month}/`)).then((Sales) => {
            (Sales).forEach((Sale)=>{
                let Day = Sale.key
                Object.entries(Sale.val()).forEach((transaction)=>{
                    let saleID = String(transaction[0])
                    let saleYear = saleID.substring(0,4)
                    let saleMonth = saleID.substring(4,6)
                    let saleDay = saleID.substring(6,8)
                    let saleVal = transaction[1]
                    
                    if(Number(saleYear+saleMonth+saleDay)>=Number(year+month+day) && Number(saleYear+saleMonth+saleDay)<=Number(year2+month2+day2)){
                        console.log(saleID,`${saleYear}/${saleMonth}/${saleDay}`,saleVal.Total)

                        document.getElementById('sales-list').innerHTML += `
                        <li class="sale-record" id="${saleID}">
                            <div class="sale-time" style="flex: 4; text-align: left">${saleDay}/${saleMonth}/${saleYear}</div>
                            <div class="sale-time" style="flex: 3; text-align: left">${saleVal.Time}</div>
                            <div class="sale-time" style="flex: 2; text-align: right">${saleVal.Method}</div>

                            <div class="sale-total" style="flex: 2"> $ ${saleVal.Total} </div>
                        </li>
                        `
                        salesTotal += saleVal.Total

                        let years = saleID.substring(0,4)
                        let monthIndex = Number(saleID.substring(4,6))-1
                        let day = saleID.substring(6,8)
                        let hours = saleVal.Time.substring(0,2)
                        let minutes = saleVal.Time.substring(3,5)
                        let seconds = saleVal.Time.substring(6,8)
                    
                        groupByHour(saleVal.Time,saleVal.Total)
                        groupByDate(saleDay,saleMonth,saleYear,saleVal.Total)
                        getSaleItemsCat(saleVal.Items)
                        
                        salestotalDisp.innerText = Number(salestotalDisp.innerText) + Number(saleVal.Total)
                        if(saleVal.Method == "cash"){
                            salestotalDispCash.innerText = Number(salestotalDispCash.innerText) + Number(saleVal.Total)
                        }
                        else{
                            salestotalDispCard.innerText = Number(salestotalDispCard.innerText) + Number(saleVal.Total)
                        }

                    }

                    datatoload = Object.keys(salesbyHour).map((hour,amount) => [Number(hour), salesbyHour[hour]])
                    datatoload3 = Object.keys(salesbyDate).map((date,amount) => [new Date(String(date).split("/")[2],Number(String(date).split("/")[1])-1,String(date).split("/")[0]), salesbyDate[date]])
                    datatoload2 = Object.keys(prodCatSum).map((cat)=>[cat,prodCatSum[cat]])
                    
                    drawChart()
                })
                
            })
            console.log("sales by date:",salesbyDate)
        })
    }


    
    
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
    var data3 = new google.visualization.DataTable();
    data.addColumn('number', 'Hora');
    data.addColumn('number', 'Sales'); 

    data2.addColumn('string', 'category');
    data2.addColumn('number', 'quantity');     

    data3.addColumn('date', 'Fecha');
    data3.addColumn('number', 'Sales');

    data.addRows(datatoload);
    data2.addRows(datatoload2);  
    data3.addRows(datatoload3);  

     // Set chart options
    var horariosOptions = {
                    'height':'280',
                    'colors': ['#e24848'],
                    'width': Number(document.documentElement.clientWidth)*1.1 < 430 ? document.documentElement.clientWidth*1.1:'430',
                    'bar': {groupWidth: "20"},
                    'legend': { position: "none" },
                    'vAxis': {format:"$ ",minValue: 1, maxValue: 0, gridlines: {
                        count: 5,
                    },
                    baselineColor: '#fff',
                    gridlineColor: '#eee',
                    },
                    'hAxis': {format:"",minValue: 8, maxValue: 24, gridlines: {
                        count: 12,
                    
                    },
                    baselineColor: '#fff',
                    gridlineColor: '#fff',},
                };

    var categoryChartOptions = {
                    pieHole: 0.4,
                    height: '300',
                    colors: ['#e24848','#e06161','#e97272','#e88c8c','#f09e9e','#f1b7b7','#f7caca','#f9e1e1','#fef6f6','#fefafa'],
                    'width': Number(document.documentElement.clientWidth)*1.1 < 430 ? document.documentElement.clientWidth*1.1:'430',
                    pieStartAngle: 270,
                    'vAxis': {
                    baselineColor: '#fff',
                    gridlineColor: '#eee',
                    },
                    'pointSize': 20,
                };

    var saleDatesOptions = {
                    'height':'260',
                    'colors': ['#e24848'],
                    'width': Number(document.documentElement.clientWidth)*1.1 < 430 ? document.documentElement.clientWidth*1.1:'430',
                    'legend': { position: "none" },
                    'lineWidth':3.5,
                    'vAxis': {
                        format:"$ ",
                        minValue: 0,
                        baselineColor: '#fff',
                        gridlineColor: '#eee',},
                    'hAxis':{
                        baselineColor: '#fff',
                        gridlineColor: '#fff',
                    }
                };
    
     // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    var chart2 = new google.visualization.PieChart(document.getElementById('donutchart'));
    var chart3 = new google.visualization.LineChart(document.getElementById('chart_div2'));

    chart.draw(data, horariosOptions);
    chart2.draw(data2, categoryChartOptions);
    chart3.draw(data3, saleDatesOptions);
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
