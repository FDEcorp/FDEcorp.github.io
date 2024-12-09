import {set, get, update, remove, ref, child, getDatabase} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

if(Boolean(localStorage.getItem("admin"))==false){
    location.href = 'menu.html'
}

let fromDateInput = document.getElementById('from-date')
let toDateInput = document.getElementById('to-date')
let salestotalDisp = document.getElementById('sales-total')
let salestotalDispCash = document.getElementById('sales-total-cash')
let salestotalDispCard = document.getElementById('sales-total-card')
let business = localStorage.getItem('business')

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
toDateInput.value = today

setTimeout(()=>{
    getSales()
},'500')


get(child(ref(db),`/businesses/${business}/Products`)).then((Products) => {
    Products.forEach(
        function(product){
            if(product.val().category == undefined || product.val().category == ""){
                productCategories[product.key] = "unknown"
            }
            productCategories[product.key] = product.val().category
        })
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
    let averageArray = Object.values(salesbyDate)
    let avg = averageArray.reduce((acc, c) => acc + c, 0) / averageArray.length;
    console.log("prom:",avg)
    document.getElementById('average').innerText = avg;

    document.getElementById('est-mens').innerText = avg*30.43;
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

    drawChart()
    

    let [year,month,day] = String(fromDateInput.value).split("-")
    let [year2,month2,day2] = String(toDateInput.value).split("-")

    if(Number(year+month+day)>Number(year2+month2+day2)){
        console.log("fecha FROM debe ser MENOR a TO")
    }
    else{
        console.log("searching from: "+fromDateInput.value+" to:"+toDateInput.value)
    }

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

        get(child(ref(db),`/businesses/${business}/sales/${year}/${month}/`)).then((Sales) => {
            (Sales).forEach((Sale)=>{
                
                let Day = Sale.key
                Object.entries(Sale.val()).forEach((transaction)=>{
                    let saleID = String(transaction[0])
                    let saleYear = saleID.substring(0,4)
                    let saleMonth = saleID.substring(4,6)
                    let saleDay = Sale.key
                    let saleVal = transaction[1]
                    
                    if(Number(saleYear+saleMonth+saleDay)>=Number(year+month+day) && Number(saleYear+saleMonth+saleDay)<=Number(year2+month2+day2)){

                        document.getElementById('sales-list').innerHTML += `
                        <li class="sale-record" id="${saleID}">
                            <div class="sale-time" style="flex: 4; text-align: left">${saleDay}/${saleMonth}/${saleYear}</div>
                            <div class="sale-time" style="flex: 3; text-align: left">${saleVal.Time}</div>
                            <div class="sale-time" style="flex: 2; text-align: right">${saleVal.Method}</div>
                            <div class="sale-total" style="flex: 2"> $ ${saleVal.Total} </div>
                            <div class="sale-total" style="flex: 2" onclick="showSaleInfo('${saleID}','${saleDay}','${saleMonth}','${saleYear}')"> info </div>

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
                    datatoload4 = Object.keys(prodCatSumMoney).map((cat)=>[cat,prodCatSumMoney[cat]])

                    drawChart()
                })
                
            })
        })
    }

    if(month != month2){
        console.log("scanning in year record")
        get(child(ref(db),`/businesses/${business}/Cortes/${year}/`)).then((Year) => {
            (Year).forEach((Month)=>{
                if(Number(Month.key)>=Number(month) && Number(Month.key) <=month2){
                    Object.entries(Month.val()).forEach((corte)=>{

                        let Day = corte[0]

                        corte[1].forEach((corteRecord)=>{
                            let saleYear = year
                            let saleMonth = Month.key
                            let saleDay = corte[0]
                            let diff = corteRecord.diff
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

                            document.getElementById('cortes-list').innerHTML += `
                                <li class="corte-record" id="${corteRecord.TimeStamp}" stlye="flex-direction: row">
                                    <div style="display: flex; flex-direction: column; flex: 1; align-content: start">
                                        <div style="text-align: left; font-weight: 800">${Day}/${Month.key}/${year}</div>
                                        <div style="text-align: left; color: gray;">${corteRecord.TimeStamp}</div>
                                    </div>

                                    <div style="display: flex; flex-direction: column; flex: 4;">
                                        <div style="flex: 2; text-align: right"><b>Total:</b> $ ${corteRecord.total}</div>
                                        <div style="flex: 1; text-align: right"><b>Card: </b>$ ${corteRecord.card}</div>

                                        <div style="flex: 1; text-align: right"><b>Cash: </b>$ ${corteRecord.cash}</div>
                                        <div style="flex: 1; text-align: right; color: ${color}"><b>${diff}</b></div>

                                    </div>
                    
                                        
                                </li>
                                `
                        })


                    })
                }
            })


        })

        get(child(ref(db),`/businesses/${business}/sales/${year}/`)).then((Year) => {
            (Year).forEach((Month)=>{
                console.log(Month.key)

                if(Number(Month.key)>=Number(month) && Number(Month.key) <=month2){
                    Object.entries(Month.val()).forEach((Day)=>{
                        

                        if(Number(year+Month.key+String(Day[0]).padStart(2))>=Number(year+month+day) && Number(year+Month.key+String(Day[0]).padStart(2))<=Number(year2+month2+day2)){
                            console.log(Day[0],Day[1])

                            Object.entries(Day[1]).forEach((transaction)=>{
                                
                                let saleID = transaction[0]
                                let saleVal = transaction[1]
                                
                                document.getElementById('sales-list').innerHTML += `
                                <li class="sale-record" id="${saleID}">
                                    <div class="sale-time" style="flex: 4; text-align: left">${Day[0]}/${Month.key}/${year}</div>
                                    <div class="sale-time" style="flex: 3; text-align: left">${saleVal.Time}</div>
                                    <div class="sale-time" style="flex: 2; text-align: right">${saleVal.Method}</div>
                                    <div class="sale-total" style="flex: 2"> $ ${saleVal.Total} </div>
                                    <div class="sale-total" style="flex: 2" onclick="showSaleInfo('${saleID}','${Day[0]}','${Month.key}','${year}')"> info </div>

                                </li>
                                `

                                salesTotal += saleVal.Total
                                salestotalDisp.innerText = Number(salestotalDisp.innerText) + Number(saleVal.Total)
                                if(saleVal.Method == "cash"){
                                    salestotalDispCash.innerText = Number(salestotalDispCash.innerText) + Number(saleVal.Total)
                                }
                                else{
                                    salestotalDispCard.innerText = Number(salestotalDispCard.innerText) + Number(saleVal.Total)
                                }

                                groupByHour(saleVal.Time,saleVal.Total)
                                groupByDate(Day[0],Month.key,year,saleVal.Total)
                                getSaleItemsCat(saleVal.Items)
                                console.log(salesbyDate)
                                datatoload = Object.keys(salesbyHour).map((hour,amount) => [Number(hour), salesbyHour[hour]])
                                datatoload3 = Object.keys(salesbyDate).map((date,amount) => [new Date(String(date).split("/")[2],Number(String(date).split("/")[1])-1,String(date).split("/")[0]), salesbyDate[date]])
                                datatoload2 = Object.keys(prodCatSum).map((cat)=>[cat,prodCatSum[cat]])
                                datatoload4 = Object.keys(prodCatSumMoney).map((cat)=>[cat,prodCatSumMoney[cat]])

                                drawChart()

                            })

                        }



                    })
                }
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
    var data3 = new google.visualization.DataTable();
    var data4 = new google.visualization.DataTable();

    data.addColumn('number', 'Hora');
    data.addColumn('number', 'Sales'); 

    data2.addColumn('string', 'category');
    data2.addColumn('number', 'quantity');     

    data3.addColumn('date', 'Fecha');
    data3.addColumn('number', 'Sales');

    data4.addColumn('string', 'category');
    data4.addColumn('number', 'Sales');

    data.addRows(datatoload);
    data2.addRows(datatoload2);  
    data3.addRows(datatoload3);  
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
                    chartArea:{left:80,top:30,width:'70%',height:'70%'}
                };
    
     // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    var chart2 = new google.visualization.PieChart(document.getElementById('donutchart'));
    var chart3 = new google.visualization.ColumnChart(document.getElementById('chart_div2'));
    var chart4 = new google.visualization.PieChart(document.getElementById('donutchart2'));


    chart.draw(data, horariosOptions);
    chart2.draw(data2, categoryChartOptions);
    chart3.draw(data3, saleDatesOptions);
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
