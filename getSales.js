import {set, get, update, remove, ref, child, getDatabase} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

if(Boolean(localStorage.getItem("admin"))==false){
    location.href = 'menu.html'
}

let fromDateInput = document.getElementById('from-date')
let salestotalDisp = document.getElementById('sales-total')
let salestotalDispCash = document.getElementById('sales-total-cash')
let salestotalDispCard = document.getElementById('sales-total-card')
let business = localStorage.getItem('business')
let search = document.getElementById('search')

window.datatoload = []
window.datatoload2 = []
window.datatoload3 = []
window.datatoload4 = []
let productCategories = {}
window.prodCatSum = {}
window.prodCatSumMoney = {}

var now = new Date();
var dayForInput1 = ("0" + now.getDate()).slice(-2);
var dayForInput2 = ("0" + now.getDate()).slice(-2);
var monthForInput = ("0" + (now.getMonth() + 1)).slice(-2);
var today = now.getFullYear()+"-"+(monthForInput)+"-"+(dayForInput2) ;

var startofmonth = now.getFullYear()+"-"+(monthForInput)+"-01";

fromDateInput.value = today


get(child(ref(db),`/businesses/${business}/Products`)).then((Products) => {
    Products.forEach(
        function(product){
            if(product.val().category == undefined || product.val().category == ""){
                productCategories[product.key] = "unknown"
            }
            productCategories[product.key] = product.val().category
        })
})


search.addEventListener('click',()=>{
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
const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  
    // These options can be used to round to whole numbers.
    trailingZeroDisplay: 'stripIfInteger'   // This is probably what most people
                                            // want. It will only stop printing
                                            // the fraction when the input
                                            // amount is a round number (int)
                                            // already. If that's not what you
                                            // need, have a look at the options
                                            // below.
    //minimumFractionDigits: 0, // This suffices for whole numbers, but will
                                // print 2500.10 as $2,500.1
    //maximumFractionDigits: 0, // Causes 2500.99 to be printed as $2,501
  });

function groupByDate(day,month,year,amount){
    let date = `${day}/${month}/${year}`
    if(salesbyDate[date] == undefined){
        salesbyDate[date] = amount
    }else{
        salesbyDate[date] = salesbyDate[date] + amount
    }
    let averageArray = Object.values(salesbyDate)
    let avg = averageArray.reduce((acc, c) => acc + c, 0) / averageArray.length;
    console.log("prom:",avg)
    document.getElementById('average').innerText = avg.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    document.getElementById('est-mens').innerText = (avg*30.43).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      });
}

function getSales(){
    salestotalDisp.innerText = 0 
    salestotalDispCash.innerText = 0
    salestotalDispCard.innerText = 0
    let salesTotal = 0

    document.getElementById('sales-list').innerHTML = ''
    document.getElementById('cortes-list').innerHTML = ''

    datatoload = []
    datatoload2 = []
    salesbyHour = {}
    prodCatSum = {}
    prodCatSumMoney = {}
    salesbyDate = {}
    
    let [year,month,day] = String(fromDateInput.value).split("-")
    let [year2,month2,day2] = String(fromDateInput.value).split("-")

    if(month == month2){
        console.log("scanning in month record")

        get(child(ref(db),`/businesses/${business}/Cortes/${year}/${month}/`)).then((Cortes) => {
            (Cortes).forEach((corte)=>{

                let Day = corte.key
                Object.entries(corte.val()).forEach((corteRec)=>{

                    console.log(corte.key)
                    let saleYear = year
                    let saleMonth = month
                    let saleDay = corte.key
                    let diff = corteRec[1].diff
                 
                    if(diff == undefined){
                        diff = 0;
                    }
                    let color = 'rgb(150,150,150)'
                            if(diff > 0){
                                color = 'rgba(0,155,0,0.5)'
                                diff = `+ ${diff}`
                            }
                            if(diff < 0){
                                color = 'rgba(255,0,0,0.5)'
                                diff = `- ${diff}`
                            }
                            

                    if(Number(saleYear+saleMonth+saleDay)>=Number(year+month+day) && Number(saleYear+saleMonth+saleDay)<=Number(year2+month2+day2)){
                        document.getElementById('cortes-list').innerHTML += `
                        <li class="corte-record" id="${corteRec[0]}" stlye="flex-direction: row">
                            <div style="display: flex; flex-direction: column; flex: 1; align-content: start">
                                <div style="text-align: left; font-weight: 800">${Day}/${month}/${year}</div>
                                <div style="text-align: left; color: gray;">${corteRec[1].TimeStamp}</div>
                            </div>

                            <div style="display: flex; flex-direction: column; flex: 4;">
                                <div style="flex: 2; text-align: right"><b>Total:</b> $ ${corteRec[1].total}</div>
                                <div style="flex: 1; text-align: right"><b>Card: </b> $ ${corteRec[1].card}</div>
                                <div style="flex: 1; text-align: right"><b>Cash: </b>$ ${corteRec[1].cash}</div>
                                <div style="flex: 1; text-align: right; color: ${color}"><b>${diff}</b></div>
                            </div>
            
                                
                        </li>
                        `
                    }
                    


                })
            })

        })


        get(child(ref(db),`/businesses/${business}/sales/${year}/${month}/${day}`)).then((Sales) => {
            (Sales).forEach((transaction)=>{
                let saleID = transaction.key
                let saleYear = saleID.substring(0,4)
                let saleMonth = saleID.substring(4,6)
    
                let saleVal = transaction.val()

                document.getElementById('sales-list').innerHTML += `
                        <li class="sale-record" id="${saleID}">
                            <div class="sale-time" style="flex: 4; text-align: left">${day}/${saleMonth}/${saleYear}</div>
                            <div class="sale-time" style="flex: 3; text-align: left">${saleVal.Time}</div>
                            <div class="sale-time" style="flex: 2; text-align: right">${saleVal.Method}</div>
                            <div class="sale-total" style="flex: 2"> $ ${saleVal.Total} </div>
                            <div class="sale-total" style="flex: 2" onclick="showSaleInfo('${saleID}','${day}','${saleMonth}','${saleYear}')"> info </div>

                        </li>
                        `
                salesTotal += saleVal.Total
    
                groupByHour(saleVal.Time,saleVal.Total)
                groupByDate(day,saleMonth,saleYear,saleVal.Total)
                getSaleItemsCat(saleVal.Items)
                        
                salestotalDisp.innerText = Number(salestotalDisp.innerText) + Number(saleVal.Total)
                        
                if(saleVal.Method == "cash"){
                    salestotalDispCash.innerText = Number(salestotalDispCash.innerText) + Number(saleVal.Total)
                }
                else{
                    salestotalDispCard.innerText = Number(salestotalDispCard.innerText) + Number(saleVal.Total)
                }
                datatoload = Object.keys(salesbyHour).map((hour,amount) => [Number(hour), salesbyHour[hour]])
                datatoload2 = Object.keys(prodCatSum).map((cat)=>[cat,prodCatSum[cat]])
                datatoload4 = Object.keys(prodCatSumMoney).map((cat)=>[cat,prodCatSumMoney[cat]])
                drawChart()


            })
        })


    }


}

function showSaleInfo(saleID,saleDay,saleMonth,saleYear){
    document.getElementById('saleDetails-list').innerHTML = ''
    document.getElementById('sale-details').style.visibility = 'visible'
    console.log(saleID)
    document.getElementById('saleDetails-id').innerText = saleID
    
    get(child(ref(db),`/businesses/${business}/sales/${saleYear}/${saleMonth}/${saleDay}/${saleID}`)).then((sale) => {
        console.log(sale.val().Items)
        document.getElementById('saleDetails-time').innerText = sale.val().Time;

        document.getElementById('saleDetails-method').innerText = sale.val().Method;
        document.getElementById('saleDetails-monto').innerText = sale.val().Total;
        
        document.getElementById('saleDetails-list').innerHTML += String(Object.entries(sale.val().Items).map(
            (item,quant)=>`<li>${String(item).split(',')[0]} x ${String(item).split(',')[1]} @ $ ${String(item).split(',')[2]}</li>`
        )).replaceAll(',','').replaceAll('_',' ')

    })
    
    
}

window.showSaleInfo = showSaleInfo

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
    var data4 = new google.visualization.DataTable();

    data.addColumn('number', 'Hora');
    data.addColumn('number', 'Sales'); 

    data2.addColumn('string', 'category');
    data2.addColumn('number', 'quantity');     


    data4.addColumn('string', 'category');
    data4.addColumn('number', 'Sales');

    data.addRows(datatoload);
    data2.addRows(datatoload2);  
    data4.addRows(datatoload4);  

    var formatter = new google.visualization.NumberFormat({
        prefix: '$',     // Add a dollar sign as a prefix
        groupingSymbol: ',' // Use a comma as the thousands separator
      });

    formatter.format(data4, 1); // Format the second column (index 1)

     // Set chart options
    var horariosOptions = {
                    'height':'280',
                    'colors': ['#e24848'],
                    'width': Number(document.documentElement.clientWidth)*1.1 < 430 ? document.documentElement.clientWidth*1.1:'430',
                    'bar': {groupWidth: "30"},
                    'legend': { position: "none" },
                    'vAxis': {format:"$ ",minValue: 1, maxValue: 0, gridlines: {
                        count: 5,
                    },
                    baselineColor: '#fff',
                    gridlineColor: '#eee',
                    },
                    'hAxis': {format:"",
                    baselineColor: '#fff',
                    gridlineColor: '#fff',},
                    alwaysOutside: false
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
                    legend: {
                        position: 'labeled',
                        labeledValueText: 'both',
                        textStyle: {
                            color: 'red', 
                            fontSize: 14
                        },
                    }, 
                    chartArea:{left:25,top:0,width:'80%',height:'50%'},
                    'vAxis': {format:"$ "}
                };

                var categoryChartOptions2 = {
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
                    legend: {
                        position: 'labeled',
                        labeledValueText: 'both',
                        format: "$",
                        textStyle: {
                            color: 'red', 
                            fontSize: 14
                        },
                       
                    }, 
                    chartArea:{left:25,top:0,width:'80%',height:'50%'}
                };

    var saleDatesOptions = {
                    'height':'260',
                    'colors': ['#e24848'],
                    'width': Number(document.documentElement.clientWidth)*1.1 < 430 ? document.documentElement.clientWidth*1.1:'430',
                    'legend': { position: "none" },
                    'bar': {groupWidth: "20"},
                    'vAxis': {
                        format:"$ ",
                        minValue: 0,
                        baselineColor: '#fff',
                        gridlineColor: '#eee',},
                    'hAxis':{
                        baselineColor: '#fff',
                        gridlineColor: '#fff',
                    }, 
                    chartArea:{left:70,top:30,width:'60%',height:'70%'}
                };
    
     // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    var chart2 = new google.visualization.PieChart(document.getElementById('donutchart'));
    var chart4 = new google.visualization.PieChart(document.getElementById('donutchart2'));

    var view = new google.visualization.DataView(data);

    view.setColumns([0, //The "descr column"
        1, //Downlink column
        {
            calc: "stringify",
            sourceColumn: 1, // Create an annotation column with source column "1"
            type: "string",
            role: "annotation"
        }]);   
        

        

    chart.draw(view, horariosOptions);
    chart2.draw(data2, categoryChartOptions);
    chart4.draw(data4, categoryChartOptions2);
    }, "500");
    
    
}

function getSaleItemsCat(saleItems){
    Object.entries(saleItems).forEach((item)=>{
        let itemName = String(item[0]).split(" ")[0]
        let qty = item[1][0]
        let value = item[1][1]
        console.log("check this",item[1][0],item[1][1])
        let cat = productCategories[itemName]

        if(prodCatSum[cat]==undefined){
            prodCatSum[cat] = Number(qty)
        }
        else{
            prodCatSum[cat] = Number(prodCatSum[cat])+Number(qty)
        }

        if(prodCatSumMoney[cat]==undefined){
            prodCatSumMoney[cat] = Number(qty)*Number(value)
        }
        else{
            prodCatSumMoney[cat] = Number(prodCatSumMoney[cat])+Number(qty)*Number(value)
        }
    })
    //let item = String(Object.entries(saleItems)[0]).split(" ")[0]
    //let qty = Object.entries(saleItems)[0][1]
    //console.log("items in order:",item,qty)
}
