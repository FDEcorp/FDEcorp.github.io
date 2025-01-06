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

window.avgperhour = 0;
window.avgperdate = 0;
window.daysEval = 0;

var now = new Date();
var dayForInput1 = ("0" + now.getDate()).slice(-2);
var dayForInput2 = ("0" + now.getDate()).slice(-2);
var monthForInput = ("0" + (now.getMonth() + 1)).slice(-2);
var today = now.getFullYear()+"-"+(monthForInput)+"-"+(dayForInput2) ;

fromDateInput.value = today
toDateInput.value = today

let Search = document.getElementById('search')

Search.addEventListener('click',()=>{
    getSales()
})

fromDateInput.addEventListener('change',()=>{
    //getSales()
})


toDateInput.addEventListener('change',()=>{
   //getSales()
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


    let averageArray = Object.values(salesbyHour)
    let avg = averageArray.reduce((acc, c) => acc + c, 0) / averageArray.length;
    window.avgperhour = avg;

    document.getElementById('average-hour').innerText = (avgperhour/daysEval).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    })
    
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
    let avg = averageArray.reduce((acc, c) => acc + c, 0) / daysEval;

    window.avgperdate = avg;
    window.latestDate = Object.keys(salesbyDate)

    document.getElementById('average').innerText = avg.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    })

    let numdays = daysInMonth(Number(month),Number(year))

    document.getElementById('est-mens').innerText = (avg*numdays).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });

}

getSales()

function getExcendts(){
    document.getElementById('diff-mens').innerText = (0).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    }); 

    window.diffsbydate = {}
    let year;
    let month;
    let day;
    [year,month,day]=String(fromDateInput.value).split('-')

    let Time1 = new Date(fromDateInput.value).getTime()+(1000 * 60 * 60 * 6)
    let Time2 = new Date(toDateInput.value).getTime()+(1000 * 60 * 60 * 29)

    let startDate = new Date(Time1)
    let endDate = new Date(Time2)
    let current = Time1

    get(child(ref(db),`/businesses/${business}/Cortes/${year}/${Number(month)}/`)).then((Cortes) => {
        console.log("api response",Cortes.val())
        window.cortestest = Cortes.val();

        while(current<=Time2){
            let currentDay = String(new Date(current).getDate()).padStart(2,'0')
                diffsbydate[currentDay] = 0; 

                if(cortestest[currentDay]!= undefined && cortestest[currentDay]!= null){
                    Object.entries(cortestest[currentDay]).forEach((corte)=>{
                        
                        diffsbydate[currentDay] =  Number(diffsbydate[currentDay]) + Number(corte[1].diff)
                        
                    })
                }
            
            current = current+(1000 * 60 * 60 * 24)         
        }

        window.diffsbydateArr = Object.values(diffsbydate).sort((a, b) => a[0] - b[0])
        console.log(diffsbydate)

        let sumExcedent = Object.values(diffsbydate).sort((a, b) => a[0] - b[0]).reduce((acc, c) => acc + c, 0) ;
        
        document.getElementById('diff-mens').innerText = (sumExcedent).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });   
    })
}


function getSales(){
    salestotalDisp.innerText = 0 
    salestotalDispCash.innerText = 0
    salestotalDispCard.innerText = 0
    let salesTotal = 0
    datatoload = []
    datatoload2 = []
    salesbyHour = {}
    salesbyDate = {}
    
    let Time1 = new Date(fromDateInput.value).getTime()
    let Time2 = new Date(toDateInput.value).getTime()
    let TimeDiff = Number(Time2)-Number(Time1)
    let DaysDiff = Math.round(Number(TimeDiff)/(1000 * 60 * 60 * 24))+1
    daysEval = DaysDiff


    let [year,month,day] = String(fromDateInput.value).split("-")
    let [year2,month2,day2] = String(toDateInput.value).split("-")

    if(month != month2){
        get(child(ref(db),`/businesses/${business}/sales/${year}/`)).then((Sales) => {

            window.test = Sales
            //TODO: for loop from START date to END date, if data doesnt exist add saleTotal record of 0 for correct graph
            let startDate = new Date(fromDateInput.value)
            let endDate = new Date(toDateInput.value)
            let current = startDate

            let startMonth= new Date(fromDateInput.value).getMonth()+1
            let endMonth = new Date(toDateInput.value).getMonth()+1
            let currentMonth = startMonth

            while(currentMonth<=endMonth){
                    currentMonth++
                    let evalMonth = String(currentMonth).padStart(2,'0')
                
                    while (current<=endDate) {
                        current = new Date(new Date(current).getTime()+(1000 * 60 * 60 * 24))
                        
                        let currentDay = String(new Date(current).getDate()).padStart(2,'0')
                        let currentMonth = String(new Date(current).getMonth()+1).padStart(2,'0')
                        let currentYear = String(new Date(current).getFullYear()).padStart(2,'0')
                        let salesData;
                        groupByDate(currentDay,currentMonth,currentYear,Number(0))

                        try { 
                            //if no data
                            salesData = Sales.val()[currentMonth][currentDay]  
                        } catch (error) {
                            groupByDate(currentDay,currentMonth,currentYear,Number(0))
                        }
                        
                        if(salesData == undefined){
                        }else{
                            Object.entries(salesData).forEach((transaction)=>{
                                let saleID = String(transaction[0])
                                let saleYear = saleID.substring(0,4)
                                let saleMonth = saleID.substring(4,6)
                                let saleDay = currentDay
                                let saleVal = transaction[1]
            
                                if(Number(saleYear+saleMonth+saleDay)>=Number(year+month+day) && Number(saleYear+saleMonth+saleDay)<=Number(year2+month2+day2)){
            
                                    salesTotal += saleVal.Total
            
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
                            
                            })
                        }
                    }
            }   

            getExcendts()
            console.log("mode 1")

            datatoload= datatoload.sort((a, b) => a[0] - b[0])
            datatoload = datatoload.map(subarray => [...subarray, avgperhour]);
            datatoload = datatoload.map(subarray => [subarray[0], Math.round(subarray[1] / daysEval), Math.round(subarray[2] / daysEval)]);
    
            datatoload3=datatoload3.sort((a, b) => a[0] - b[0])
                
            datatoload3 = datatoload3.map(subarray2 => [...subarray2, subarray2[1], avgperdate, 0]);
    
            drawChart()

            document.getElementById('sales-total').innerHTML = Number(document.getElementById('sales-total').innerHTML).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            })
    
            document.getElementById('sales-total-cash').innerHTML = Number(document.getElementById('sales-total-cash').innerHTML).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            })
    
            document.getElementById('sales-total-card').innerHTML = Number(document.getElementById('sales-total-card').innerHTML).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            })
            document.getElementById('average').innerText += ` (${daysEval} days)`
    
            })
    }

    if(month == month2){
        getExcendts()
        get(child(ref(db),`/businesses/${business}/sales/${year}/${Number(month)}/`)).then((Sales) => {
            //TODO: for loop from START date to END date, if data doesnt exist add saleTotal record of 0 for correct graph
            let startDate = new Date(fromDateInput.value)
            let endDate = new Date(toDateInput.value)
            let current = startDate
            
            while (current<=endDate) {
                current = new Date(new Date(current).getTime()+(1000 * 60 * 60 * 24))
                let currentDay = String(new Date(current).getDate()).padStart(2,'0')
                let currentMonth = String(new Date(current).getMonth()+1).padStart(2,'0')
                let currentYear = String(new Date(current).getFullYear()).padStart(2,'0')

                let salesData = Sales.val()[currentDay]

                if(salesData == undefined){
                    groupByDate(currentDay,currentMonth,currentYear,Number(0))
                }else{
                    Object.entries(salesData).forEach((transaction)=>{
                        let saleID = String(transaction[0])
                        let saleYear = saleID.substring(0,4)
                        let saleMonth = saleID.substring(4,6)
                        let saleDay = currentDay
                        let saleVal = transaction[1]
    
                        if(Number(saleYear+saleMonth+saleDay)>=Number(year+month+day) && Number(saleYear+saleMonth+saleDay)<=Number(year2+month2+day2)){
    
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
                    
                    })
                }

                
            }

            
            console.log("mode 2")

            datatoload= datatoload.sort((a, b) => a[0] - b[0])
            datatoload = datatoload.map(subarray => [...subarray, avgperhour]);
            datatoload = datatoload.map(subarray => [subarray[0], Math.round(subarray[1] / daysEval), Math.round(subarray[2] / daysEval)]);

            datatoload3=datatoload3.sort((a, b) => a[0] - b[0])
            datatoload3 = datatoload3.map((subarray2) => [...subarray2, avgperdate, subarray2[1]+diffsbydate[String(new Date(subarray2[0]).getDate()).padStart(2,'0')]]);
            
            let realsAvg = datatoload3.map(subarray=>subarray[3]).reduce((acc, c) => acc + c, 0)/datatoload3.length 
            datatoload3 = datatoload3.map((subarray2) => [...subarray2,realsAvg])
            console.log(datatoload3)

            drawChart()

            document.getElementById('sales-total').innerHTML = Number(document.getElementById('sales-total').innerHTML).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            })

            document.getElementById('sales-total-cash').innerHTML = Number(document.getElementById('sales-total-cash').innerHTML).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            })

            document.getElementById('sales-total-card').innerHTML = Number(document.getElementById('sales-total-card').innerHTML).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            })
            document.getElementById('average').innerText += ` (${daysEval} days)`
            document.getElementById('est-mens').innerText += ` (${daysInMonth(month,year)} days)`

            let numdays = daysInMonth(Number(month),Number(year))

            document.getElementById('est-mens').innerText += `
            ${
                (realsAvg*numdays).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                })
            } (c/Prom de Vta + Sup)
            `
            

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
    var data3 = new google.visualization.DataTable();

    data.addColumn('number', 'Hora');
    data.addColumn('number', 'Sales'); 
    data.addColumn('number', 'Avg'); 

    data3.addColumn('date', 'Fecha');
    data3.addColumn('number', 'Sales');
    data3.addColumn('number', 'Sales Avg');
    data3.addColumn('number', 'Sales + Excedent');
    data3.addColumn('number', 'Real Avg');

    data.addRows(datatoload);
    data3.addRows(datatoload3);  

    var formatter = new google.visualization.NumberFormat({
        prefix: '$',     // Add a dollar sign as a prefix
        groupingSymbol: ',' // Use a comma as the thousands separator
      });

     // Set chart options
    var horariosOptions = {
                    'height':'280',
                    'colors': ['#e24848','#f0b400'],
                    'width': Number(document.documentElement.clientWidth) < 430 ? '380':document.documentElement.clientWidth*0.5,
                    'bar': {groupWidth: "30"},
                    'legend': { position: "none" },
                    'vAxis': {format:"$ ",minValue: 1, maxValue: 0, gridlines: {
                        count: 10,
                    },
                    baselineColor: '#fff',
                    gridlineColor: '#eee',
                    },
                    'hAxis': {format:"",
                        gridlines: {
                            count: 10,},
                    baselineColor: '#eee',
                    gridlineColor: '#eee',},
                    chartArea:{left:70,top:30,width:'75%',height:'60%'},
                    alwaysOutside: false,
                    series: {
                        0: { type: 'bars' }, // First series as AreaChart
                        1: { type: 'line' }  // Second series as LineChart
                    },
                    animation:{
                        duration: 1000,
                        easing: 'in',
                    },
                };

    var saleDatesOptions = {
                    'height':'260',
                    'colors': ['#f0b400','#f0b400','#e24848','#e24848'],
                    'width': Number(document.documentElement.clientWidth) < 430 ? '380':document.documentElement.clientWidth*0.5,
                    'legend': { position: "none" },
                    'bar': {groupWidth: "20"},
                    'vAxis': {
                        format:"$ ",
                        minValue: 0,
                        gridlines: {
                            count: 10
                        },
                        baselineColor: '#fff',
                        gridlineColor: '#eee',},
                    'hAxis':{ 
                        gridlines: {
                        count: 5,},
                        baselineColor: '#fff',
                        gridlineColor: '#ddd',
                    }, 
                    chartArea:{left:70,top:10,width:'75%',height:'60%'},
                    
                    series: {
                        0: { type: 'area' }, // First series as AreaChart
                        1: { type: 'line' }, // First series as AreaChart
                        2: { type: 'area' },  // Second series as LineChart
                        3: { type: 'line' }  // Second series as LineChart
                    },
                    animation:{
                        duration: 1000,
                        easing: 'in',
                    },

                };
    
     // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
    var chart3 = new google.visualization.ComboChart(document.getElementById('chart_div2'));
    var view = new google.visualization.DataView(data);


    view.setColumns([0, //The "descr column"
        1, //Downlink column
        {
            calc: "stringify",
            sourceColumn: 1, // Create an annotation column with source column "1"
            type: "string",
            role: "annotation"
        },2]);   
        
        var view3 = new google.visualization.DataView(data3);

        view3.setColumns([0, //The "descr column"
            1, //Downlink column
            /*{
                calc: "stringify",
                sourceColumn: 1, // Create an annotation column with source column "1"
                type: "string",
                role: "annotation",
                alwaysOutside: false,
                fontSize: "8px"
            },*/
            2,3,4]);   

    chart.draw(view, horariosOptions);
    chart3.draw(view3, saleDatesOptions);

    }, "100");
}


function daysInMonth (month, year) {
    return new Date(year, month, 0).getDate();
}

window.daysInMonth = daysInMonth