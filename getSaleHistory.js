import {set, get, update, remove, ref, child, getDatabase }
from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";

let business = localStorage.getItem('business');



// 🔹 Cache DOM
const DOM = {
    selector: document.getElementById('item-select'),
    fromDate: document.getElementById('from-date'),
    toDate: document.getElementById('to-date'),
    search: document.getElementById('search'),
    //productsWindow: document.getElementById('products-window'),
    chart: document.getElementById('chart_div')
};

const url = new URL(location);
const itemParam = url.searchParams.get("prod");
console.log("Item param:", itemParam);



let Consumos = [];
let CurrentStock = {};

// 🔹 Default dates
const now = new Date();
const day = ("0" + now.getDate()).slice(-2);
const month = ("0" + (now.getMonth() + 1)).slice(-2);

const today = `${now.getFullYear()}-${month}-01`;
const start = `${now.getFullYear()}-${month}-${day}`;

DOM.fromDate.value = today;
DOM.toDate.value = start;

// 🔹 Load items
get(ref(db, `/businesses/${business}/Products`)).then(snapshot => {
    let optionsHTML = "";

    snapshot.forEach(item => {
        const key = item.key;
        const label = key.replaceAll('_', ' ');

        optionsHTML += `<option value="${key}">${label}</option>`;
        CurrentStock[key] = item.val().stock;
    });

    DOM.selector.innerHTML += optionsHTML;

    if (!itemParam) {
        console.log("No item specified. Redirecting to main page.");
    } else {
        DOM.selector.value = itemParam;
        getData(DOM.selector.value);
        //renderItemDetails(DOM.selector.value);
    }
});

// 🔹 Events
DOM.selector.addEventListener('change', () => {
    getData(DOM.selector.value);
    //renderItemDetails(DOM.selector.value);
});
DOM.toDate.addEventListener('change', () => {
    //getData(DOM.selector.value);
    //renderItemDetails(DOM.selector.value);
});
DOM.fromDate.addEventListener('change', () => {
    //getData(DOM.selector.value);
    //renderItemDetails(DOM.selector.value);
});

DOM.search.addEventListener('click', () => {
    if (DOM.selector.value == "") {
        alert("Please select an item to view its history.");
        return;
    }
    
    getData(DOM.selector.value);
    //renderItemDetails(DOM.selector.value);
});

window.ConsumosSorted;




// 🔹 Optimized getData
function getData(item) {
    if (!item) return;
    let business = localStorage.getItem('business')
    let historyList = 0
    let itemsalesbydate = {}

    get(child(ref(db),`/businesses/${business}/sales/`)).then((sales) => {
        sales.forEach((year)=>{
            console.log('checking year',new Date(DOM.fromDate.value+ "T00:00:00").getFullYear(),new Date(DOM.toDate.value+"T23:59:59").getFullYear(),year.key)
            
            if(Number(year.key) >= Number(new Date(DOM.fromDate.value+ "T00:00:00").getFullYear()) ){
                console.log('checking this year',year.key)
                year.forEach((month)=>{
                month.forEach((day)=>{     
                day.forEach((sale)=>{  

                    //console.log('checking sale',sale.key,sale.val().Items)

                    if(sale.val().Items != null && sale.val().Items != undefined){
                        Object.entries(sale.val().Items).forEach((saleItem)=>{
                        console.log(saleItem[0],saleItem[1][0])

                        if(new Date(sale.key.substring(0, 4)+"-"+sale.key.substring(4, 6)+"-"+sale.key.substring(6, 8)) >= new Date(DOM.fromDate.value+ "T00:00:00") && new Date(sale.key.substring(0, 4)+"-"+sale.key.substring(4, 6)+"-"+sale.key.substring(6, 8)) <= new Date(DOM.toDate.value+"T23:59:59")){    
                            if(String(saleItem[0]).split(' ')[0] == item){
                                historyList += Number(saleItem[1][0])
                                if(itemsalesbydate[sale.key.substring(0, 4)+"/"+sale.key.substring(4, 6)+"/"+sale.key.substring(6, 8)] != null){
                                    itemsalesbydate[sale.key.substring(0, 4)+"/"+sale.key.substring(4, 6)+"/"+sale.key.substring(6, 8)] += Number(saleItem[1][0])
                                }
                                else{       
                                itemsalesbydate[sale.key.substring(0, 4)+"/"+sale.key.substring(4, 6)+"/"+sale.key.substring(6, 8)] = saleItem[1][0]
                                }
                            }
                        }
                    })
                    }
                    
                    
                    }) 
                }) 
                    
                
            })
            }
            else{console.log('skipping year',year.key)}

            
        })
        let data = fillMissingDatesInRange(Object.entries(itemsalesbydate).map((entry)=>[entry[0],entry[1]]), DOM.fromDate.value+"T00:00:00", DOM.toDate.value+"T23:59:59")
       
        const sum = data.reduce((acc, curr) => acc + curr[1], 0);
        document.getElementById('total').innerText = ` ${sum} unidades`
        document.getElementById('avg').innerText = ` ${(sum / Object.entries(data).length).toFixed(2)} unidades/día`
        drawChart(data)
        console.log(item.split(' ')[0],itemsalesbydate)
        //alert(`En total se han vendido ${historyList} unidades de ${String(item).split(' ')[0].replaceAll('_',' ')} \n\nVentas por dia:\n ${String(Object.entries(itemsalesbydate).reverse().map((entry)=>`${entry[0]}: ${entry[1]} unidades`).join('\n'))}      `)
    })

    
}

// 🔹 Google Charts
google.charts.load('current', { packages: ['corechart'] });

function drawChart(dataArray) {
    const data = [
        ['Date', 'Sales'], ...dataArray
    ];
    const dataTable = google.visualization.arrayToDataTable(data);

    const options = {
        title: 'Item Sales Over Time',
        chartArea: { left: 70, top: 50, width: '75%', height: '50%' },
        hAxis: { title: 'Date' },
        vAxis: { title: 'Sales' },
        legend: { position: 'none' },
        trendlines: { 0: { type: 'polynomial',degree: 5, color: '#00baf2', lineWidth: 2, opacity: 0.7 } },
        colors: ['#e24848'],
        areaOpacity: 0.3,
        lineWidth: 2,
        isStacked: true,
        interpolateNulls: false
    };

    const chart = new google.visualization.ColumnChart(DOM.chart);
    chart.draw(dataTable, options);
}

window.fillMissingDatesInRange = fillMissingDatesInRange;
function fillMissingDatesInRange(data, fromDate, toDate) {
    const map = new Map();

    // Store existing data (grouped by day)
    data.forEach(([date, value]) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        map.set(d.getTime(), value);
    });

    const result = [];

    const current = new Date(fromDate);
    current.setHours(0, 0, 0, 0);

    const end = new Date(toDate);
    end.setHours(0, 0, 0, 0);

    while (current <= end) {
        const time = current.getTime();

        result.push([
            new Date(current),
            map.get(time) ?? 0 // 👈 fill missing days with 0
        ]);

        current.setDate(current.getDate() + 1);
    }

    return result;
}

function fillMissingDates(data) {
    if (!data.length) return [];

    // Convert to Date objects and sort
    const parsed = data.map(([d, v]) => [new Date(d), v])
                       .sort((a, b) => a[0] - b[0]);

    const result = [];

    let current = new Date(parsed[0][0]);
    const end = new Date(parsed[parsed.length - 1][0]);

    let i = 0;

    while (current <= end) {
        const currentTime = current.getTime();
        const dataTime = parsed[i]?.[0].getTime();

        if (dataTime === currentTime) {
            result.push([new Date(current), parsed[i][1]]);
            i++;
        } else {
            result.push([new Date(current), 0]); // 👈 fill missing day
        }

        // move to next day
        current.setDate(current.getDate() + 1);
    }

    return result;
}