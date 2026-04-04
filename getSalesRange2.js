import {get, ref, child} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

if (!Boolean(localStorage.getItem("admin"))) {
    location.href = "menu.html";
}

let fromDateInput = document.getElementById('from-date')
let toDateInput = document.getElementById('to-date')

let salestotalDisp = document.getElementById('sales-total')
let salestotalDispCash = document.getElementById('sales-total-cash')
let salestotalDispCard = document.getElementById('sales-total-card')
let dailySaleAverageDisp = document.getElementById('average')
let averageHour = document.getElementById('average-hour')
let estimatedMonthlyDisp = document.getElementById('est-mens')
let averageExcedentDisp = document.getElementById('average-excedent')
let sumMonthlyExcedent = document.getElementById('diff-mens')
let business = localStorage.getItem('business')

fromDateInput.value = new Date().toISOString().split('T')[0]
toDateInput.value = new Date().toISOString().split('T')[0]

const start = new Date(fromDateInput.value);
const end = new Date(toDateInput.value);

// Normalize time (avoid timezone hacks like +6h / +29h)
start.setHours(0, 0, 0, 0);
end.setHours(23, 59, 59, 999);

let totalExcedent = 0;
console.log("date range:", start, end)
window.datatoloadhours = []
window.datatoloaddays = []
//Search button Functionality
let Search = document.getElementById('search')

Search.addEventListener('click',()=>{
    let filteredMetrics = computeMetrics(window.dailyMetrics, fromDateInput.value, toDateInput.value);
    window.datatoloaddays = buildDataToLoadDays(window.dailyMetrics, fromDateInput.value, toDateInput.value);
    window.datatoloadhours = buildHourlyAverages(window.salesData, fromDateInput.value, toDateInput.value); 
    console.log("Filtered Metrics:", filteredMetrics);
    salestotalDisp.textContent = `${(Number(filteredMetrics.totalCash) + Number(filteredMetrics.totalCard)).toFixed(2)}`;
    salestotalDispCash.textContent = `${filteredMetrics.totalCash.toFixed(2)}`;
    salestotalDispCard.textContent = `${filteredMetrics.totalCard.toFixed(2)}`;
    estimatedMonthlyDisp.textContent = `${filteredMetrics.estimatedMonthly.toFixed(2)}`;
    sumMonthlyExcedent.textContent = `${filteredMetrics.totalExcedent.toFixed(2)}`;
    averageExcedentDisp.textContent = `${(Number(filteredMetrics.avgExcedentPerDay.toFixed(2))+Number(filteredMetrics.avgSalesPerDay.toFixed(2))).toFixed(2)}`;
    dailySaleAverageDisp.textContent = `${filteredMetrics.avgSalesPerDay.toFixed(2)}`;
    
    drawChart();

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
    document.getElementById('average-hour').innerHTML = Number(document.getElementById('average-hour').innerHTML).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            })
    
    document.getElementById('average').innerHTML = Number(document.getElementById('average').innerHTML).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            })
    document.getElementById('average-excedent').innerHTML = Number(document.getElementById('average-excedent').innerHTML).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            })
    document.getElementById('est-mens').innerHTML = Number(document.getElementById('est-mens').innerHTML).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            })

            document.getElementById('diff-mens').innerHTML = Number(document.getElementById('diff-mens').innerHTML).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            })
})

getData();
//Fectch sales data day by day
//Fetch cortes data day by day to get excedent

let excedent = {}

function getData() {
get(child(ref(db), `businesses/${business}/Cortes`)).then((snapshot) => {
    if (snapshot.exists()) {
        let cortes = snapshot.val();
        window.excedent = buildExcedentArray(cortes);   //get excedent array for chart
        window.dailyMetrics = buildDailyMetrics(cortes); //get daily metrics array for table

        console.log("Total Excedent:", excedent);
        console.log("Total Metrics:", dailyMetrics);
    } else {
        console.log("No cortes data available.");
    }
})
get(child(ref(db), `businesses/${business}/sales`)).then((snapshot) => {
    if (snapshot.exists()) {
        window.salesData = snapshot.val();

        console.log("Total Sales Data:", snapshot.val());
    } else {
        console.log("No sales data available.");
    }
})

}

function buildExcedentArray(cortes) {
    const result = [];

    for (const [year, months] of Object.entries(cortes || {})) {
        for (const [month, days] of Object.entries(months || {})) {
            for (const [day, cortesDelDia] of Object.entries(days || {})) {

                let dayTotal = 0;

                // Sum all cortes in the day
                for (const corte of Object.values(cortesDelDia || {})) {
                    dayTotal += Number(corte?.diff || 0);
                }

                // Format date: YYYY-MM-DD
                const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                result.push([formattedDate, dayTotal]);
            }
        }
    }

    // Sort by date (important)
    result.sort((a, b) => new Date(a[0]) - new Date(b[0]));
    console.log("Excedent Array:", result);
    return result;
}

function buildHourlyAverages(sales, fromDate, toDate) {
    const start = new Date(fromDate);
    const end = new Date(toDate);

    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);

    const hourly = {}; 
    // { hour: { total: number, days: Set<string> } }

    let globalTotal = 0;

    for (const [year, months] of Object.entries(sales || {})) {
        for (const [month, days] of Object.entries(months || {})) {
            for (const [day, transactions] of Object.entries(days || {})) {

                const currentDate = new Date(year, month - 1, Number(day-1));
                if (currentDate < start || currentDate > end) continue;

                const dateKey = `${year}-${month}-${day}`;

                for (const tx of Object.values(transactions || {})) {
                    if (!tx?.Time || !tx?.Total) continue;

                    const hour = Number(tx.Time.split(':')[0]);

                    if (!hourly[hour]) {
                        hourly[hour] = {
                            total: 0,
                            days: new Set()
                        };
                    }

                    hourly[hour].total += Number(tx.Total);
                    hourly[hour].days.add(dateKey);

                    globalTotal += Number(tx.Total);
                }
            }
        }
    }

    // Build result with correct averages
    const result = [];

    let sumOfHourlyAverages = 0;
    let hoursWithData = 0;

    for (const [hour, data] of Object.entries(hourly)) {
        const daysUsed = data.days.size;

        if (!daysUsed) continue;

        const avgAtHour = data.total / daysUsed;

        sumOfHourlyAverages += avgAtHour;
        hoursWithData++;

        result.push([
            Number(hour),
            avgAtHour,
            0 // placeholder for now
        ]);
    }

    // Global average ONLY across hours with data
    const avgAllHours = hoursWithData
        ? sumOfHourlyAverages / hoursWithData
        : 0;

    // Fill global average
    for (const row of result) {
        row[2] = avgAllHours;
    }

    // Sort by hour
    result.sort((a, b) => a[0] - b[0]);
    averageHour.textContent = avgAllHours.toFixed(2);
    return result;
}

function buildDailyMetrics(cortes) {
    const result = [];

    for (const [year, months] of Object.entries(cortes || {})) {
        for (const [month, days] of Object.entries(months || {})) {
            for (const [day, cortesDelDia] of Object.entries(days || {})) {

                let sumTotals = 0;
                let sumExcedent = 0;
                let sumCash = 0;
                let sumCard = 0;

                for (const corte of Object.values(cortesDelDia || {})) {
                    sumTotals += Number(corte?.total || 0);
                    sumExcedent += Number(corte?.diff || 0);
                    sumCash += Number(corte?.cash || 0);
                    sumCard += Number(corte?.card || 0);
                }

                const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                result.push([
                    date,
                    sumTotals,
                    sumExcedent,
                    sumTotals + sumExcedent,
                    sumCash,
                    sumCard
                ]);
            }
        }
    }

    // Sort by date
    result.sort((a, b) => new Date(a[0]) - new Date(b[0]));

    return result;
}

function computeMetrics(data, fromDate, toDate) {
    const start = new Date(fromDate);
    const end = new Date(toDate);

    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);

    let totalCash = 0;
    let totalCard = 0;
    let totalExcedent = 0;
    let totalSales = 0;

    let daysCount = 0;

    for (const row of data) {
        const [date, total, excedent, totalPlusExcedent, cash, card] = row;

        const current = new Date(date);

        if (current < start || current > end) continue;

        totalCash += cash;
        totalCard += card;
        totalExcedent += excedent;
        totalSales += total;

        daysCount++;
    }

    // Avoid division by 0
    const avgSalesPerDay = daysCount ? totalSales / daysCount : 0;
    const avgExcedentPerDay = daysCount ? totalExcedent / daysCount : 0;

    // Days in month (based on "to" date)
    const year = end.getFullYear();
    const month = end.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const estimatedMonthly =
        (avgSalesPerDay + avgExcedentPerDay) * daysInMonth;

    

    return {
        totalCash,
        totalCard,
        totalExcedent,
        avgSalesPerDay,
        avgExcedentPerDay,
        estimatedMonthly
    };
}

//chart functionality

function buildDataToLoadDays(data, fromDate, toDate) {
    const start = new Date(fromDate);
    const end = new Date(toDate);

    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);

    let totalSales = 0;
    let totalExcedent = 0;
    let daysCount = 0;

    const filtered = [];

    // First pass: filter + accumulate
    for (const row of data) {
        const [date, total, excedent, totalPlusExcedent] = row;

        const current = new Date(date);
        if (current < start || current > end) continue;

        totalSales += total;
        totalExcedent += excedent;
        daysCount++;

        filtered.push(row);
    }

    // Averages
    const avgSalesPerDay = daysCount ? totalSales / daysCount : 0;
    const avgWithExcedent = daysCount
        ? (totalSales + totalExcedent) / daysCount
        : 0;

    // Second pass: build final array
    const result = filtered.map(([date, total, excedent, totalPlusExcedent]) => {
        return [
            new Date(date),
            total,
            avgSalesPerDay,
            totalPlusExcedent,
            avgWithExcedent
        ];
    });

    // Already sorted if your source was sorted, but just in case:
    result.sort((a, b) => new Date(a[0]) - new Date(b[0]));

    return result;
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

    data.addRows(datatoloadhours);
    data3.addRows(datatoloaddays);  

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
                    chartArea:{left:70,top:10,width:'75%',height:'60%'},
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
            1,2,3,4]);   

    chart.draw(view, horariosOptions);
    chart3.draw(view3, saleDatesOptions);

    }, "100");
}


function daysInMonth (month, year) {
    return new Date(year, month, 0).getDate();
}

window.daysInMonth = daysInMonth