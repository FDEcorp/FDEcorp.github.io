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

var now = new Date();
var dayForInput1 = ("0" + now.getDate()).slice(-2);
var dayForInput2 = ("0" + now.getDate()).slice(-2);
var monthForInput = ("0" + (now.getMonth() + 1)).slice(-2);
var today = now.getFullYear()+"-"+(monthForInput)+"-"+(dayForInput2) ;

var startofmonth = now.getFullYear()+"-"+(monthForInput)+"-01";

fromDateInput.value = today
toDateInput.value = today

let Search = document.getElementById('search')

Search.addEventListener('click',()=>{
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
    window.latestDate = Object.keys(salesbyDate)
    console.log("prom:",latestDate[latestDate.length-1],avg)
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
                    drawChart()
                })
                
            })
            drawChart()
            alert("Done Fetching! 1")  
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
            drawChart()            
            alert("Done Fetching! 2") 
        
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
                                console.log(salesbyDate)
                                datatoload = Object.keys(salesbyHour).map((hour,amount) => [Number(hour), salesbyHour[hour]])
                                datatoload3 = Object.keys(salesbyDate).map((date,amount) => [new Date(String(date).split("/")[2],Number(String(date).split("/")[1])-1,String(date).split("/")[0]), salesbyDate[date]])
                            })
                            
                        }



                    })
                }
            })
            drawChart()
            alert("Done Fetching! 3")  
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
    var data3 = new google.visualization.DataTable();

    data.addColumn('number', 'Hora');
    data.addColumn('number', 'Sales'); 

    data3.addColumn('date', 'Fecha');
    data3.addColumn('number', 'Sales');

    data.addRows(datatoload);
    data3.addRows(datatoload3);  

    var formatter = new google.visualization.NumberFormat({
        prefix: '$',     // Add a dollar sign as a prefix
        groupingSymbol: ',' // Use a comma as the thousands separator
      });

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
                    'hAxis': {format:"",minValue: 8, maxValue: 24, gridlines: {
                        count: 12,
                    
                    },
                    baselineColor: '#fff',
                    gridlineColor: '#fff',},
                    alwaysOutside: false
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
    var chart3 = new google.visualization.ColumnChart(document.getElementById('chart_div2'));

    var view = new google.visualization.DataView(data);

    view.setColumns([0, //The "descr column"
        1, //Downlink column
        {
            calc: "stringify",
            sourceColumn: 1, // Create an annotation column with source column "1"
            type: "string",
            role: "annotation"
        }]);   
        
        var view3 = new google.visualization.DataView(data3);

        view3.setColumns([0, //The "descr column"
            1, //Downlink column
            {
                calc: "stringify",
                sourceColumn: 1, // Create an annotation column with source column "1"
                type: "string",
                role: "annotation",
                alwaysOutside: false,
                fontSize: "8px"
            }]);   

    chart.draw(view, horariosOptions);
    chart3.draw(view3, saleDatesOptions);
    }, "500");
    
    
}

