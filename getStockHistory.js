import {set, get, update, remove, ref, child, getDatabase, onValue, query, orderByChild, equalTo} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

let business = localStorage.getItem('business')

var url = new URL(location);
var item = url.searchParams.get("prod");

// Reference to the specific item under Consumos
let consRef = ref(db, `/businesses/${business}/Consumo/${item}`);
let Consumos = [];
let Selector = document.getElementById('item-select')
let CurrentStock = {}

get(ref(db,`/businesses/${business}/Items`)).then(Items=>{
    Items.forEach(item=>{
        Selector.innerHTML += `<option value="${item.key}">${String(item.key).replaceAll('_',' ')}</option>`
        CurrentStock[item.key] = item.val().stock
    })
    
    Items.forEach(item=>{
        getData(item.key)
    })
})
console.log('currentStock',CurrentStock)


Selector.addEventListener('change',()=>{
    getData(Selector.value)
})

function getData(item){
    console.log(item)
    get(ref(db,`/businesses/${business}/Consumo/${item}`)).then(snapshot=>{
        update(ref(db, `/businesses/${business}/Consumo/${item}/${new Date()}`), 
            {
                stock: CurrentStock[item],
            })
            .then(()=>{
                Consumos = []; // Clear the array to avoid duplicates

                snapshot.forEach((record) => {
                    Consumos.push([new Date(record.key), record.val().stock]); // Add each record
                });
    
                let ConsumosSorted = Consumos.sort((a, b) => a[0] - b[0]);    
                drawChart(ConsumosSorted);
            }); 
        
            
        

})}

// Load the Google Charts API
google.charts.load('current', { packages: ['corechart'] });

function drawChart(dataArray) {
    // Add a header row for Google Charts
    const data = [['Date', 'Stock'], ...dataArray];

    // Convert to DataTable format
    const dataTable = google.visualization.arrayToDataTable(data);

    // Chart options
    const options = {
        title: 'Item Stock Over Time',
        chartArea:{left:70,top:50,width:'75%',height:'50%'},
        hAxis: { title: 'Date' },
        vAxis: { title: 'Stock' },
        legend: { position: 'bottom' },
        colors: ['#e24848'], // Custom color for the area
        areaOpacity: 0.3,
        lineWidth: 2,
        isStacked: true, // Enables step-like behavior
        interpolateNulls: false
    };

    // Draw the chart
    const chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
    chart.draw(dataTable, options);
}