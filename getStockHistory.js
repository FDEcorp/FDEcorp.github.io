import {set, get, update, remove, ref, child, getDatabase }
from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";

let business = localStorage.getItem('business');

const url = new URL(location);
const itemParam = url.searchParams.get("prod");

// 🔹 Cache DOM
const DOM = {
    selector: document.getElementById('item-select'),
    fromDate: document.getElementById('from-date'),
    toDate: document.getElementById('to-date'),
    search: document.getElementById('search'),
    productsWindow: document.getElementById('products-window'),
    chart: document.getElementById('chart_div')
};

let Consumos = [];
let CurrentStock = {};

// 🔹 Default dates
const now = new Date();
const day = ("0" + now.getDate()).slice(-2);
const month = ("0" + (now.getMonth() + 1)).slice(-2);

const today = `${now.getFullYear()}-${month}-01`;
const start = `${now.getFullYear()}-${month}-${day}`;

DOM.fromDate.value = start;
DOM.toDate.value = start;

// 🔹 Load items
get(ref(db, `/businesses/${business}/Items`)).then(snapshot => {
    let optionsHTML = "";

    snapshot.forEach(item => {
        const key = item.key;
        const label = key.replaceAll('_', ' ');

        optionsHTML += `<option value="${key}">${label}</option>`;
        CurrentStock[key] = item.val().stock;
    });

    DOM.selector.innerHTML += optionsHTML;
});

// 🔹 Events
DOM.selector.addEventListener('change', () => {
    getData(DOM.selector.value);
    renderItemDetails(DOM.selector.value);
});
DOM.toDate.addEventListener('change', () => {
    getData(DOM.selector.value);
    renderItemDetails(DOM.selector.value);
});
DOM.fromDate.addEventListener('change', () => {
    getData(DOM.selector.value);
    renderItemDetails(DOM.selector.value);
});

DOM.search.addEventListener('click', () => {
    if (DOM.selector.value == "") {
        alert("Please select an item to view its history.");
        return;
    }
    renderItemDetails(DOM.selector.value);
});

window.ConsumosSorted;

// 🔹 Optimized getData
function getData(item) {
    if (!item) return;

    get(ref(db, `/businesses/${business}/Consumo/${item}`)).then(snapshot => {

        update(ref(db, `/businesses/${business}/Consumo/${item}/${Date.now()}`), {
            stock: CurrentStock[item],
        });

        const from = new Date(DOM.fromDate.value);
        const to = new Date(DOM.toDate.value);
        const noFilter = isNaN(from) && isNaN(to);

        const data = [];

        snapshot.forEach(record => {
            const date = new Date(record.key);

            if (noFilter || (date >= from && date <= to)) {
                data.push([date, record.val().stock]);
            }
        });

        window.ConsumosSorted = data.sort((a, b) => a[0] - b[0]);
        drawChart(window.ConsumosSorted);
    });
}

// 🔹 Google Charts
google.charts.load('current', { packages: ['corechart'] });

function drawChart(dataArray) {
    const data = [
        ['Date', 'Stock'], ...dataArray
    ];
    const dataTable = google.visualization.arrayToDataTable(data);

    const options = {
        title: 'Item Stock Over Time',
        chartArea: { left: 70, top: 50, width: '75%', height: '50%' },
        hAxis: { title: 'Date' },
        vAxis: { title: 'Stock' },
        legend: { position: 'bottom' },
        colors: ['#e24848'],
        areaOpacity: 0.3,
        lineWidth: 2,
        isStacked: true,
        interpolateNulls: false
    };

    const chart = new google.visualization.AreaChart(DOM.chart);
    chart.draw(dataTable, options);
}

// 🔹 Optimized render
function renderItemDetails(itemName) {
    DOM.productsWindow.innerHTML = "";

    get(child(ref(db), `/businesses/${business}/Items/${itemName}`)).then(item => {

        const val = item.val();
        const key = item.key;
        const label = key.replaceAll('_', ' ');

        const stockRounded = (Math.round(val.stock * 100) / 100).toFixed(0);
        const stockPrecise = (Math.round(val.stock * 100) / 100).toFixed(2);

        const bgColor = val.stock >= val.minStock ?
            'var(--primary-base-light)' :
            'rgb(255, 238, 163)';

        let html = "";

        html += `
        <div class="item" id="${item.key}-card" style="background-color: ${item.val().stock>=item.val().minStock?'var(--primary-base-light)':'rgb(255, 238, 163);'};"> 
            <div ondblclick="editProd('${item.key}')" style="margin: 6px; border-radius: 6px; display: flex; flex-direction: row; gap: 8px; flex: 1"> 
                <div class="wrap" style="flex:5; font-weight:600; font-size: 16px; color: Black; width: 100px; text-align: left; width: 60%; padding-left: 4px; display: flex; flex-direction: column; align-items: start;"> 
                    <div style="height:20px; overflow: hidden" onclick="editItem('${item.key}')"> ${String(item.key).replaceAll('_',' ')} </div> 
                    <span style="font-size: 12px; color: gray; font-weight: 100; magin-top: 2px;" id="${item.key}-stock-qty">stock: ${(Math.round(item.val().stock * 100) / 100).toFixed(0)}</span> 
                    <span style="font-size: 12px; color: gray; font-weight: 100">pack: ${item.val().packQty}</span> </div> <div style="height: 20px; font-size: 16px; text-align: left; padding-right:0px; padding-top: 2px; flex: 1">
                    <p style="padding: 0; margin:0; font-size: 10px; font-weight: bold;">Order:</p> 
                    <input onchange="updateOrder('${item.key}',this.value)" type="number" id="${item.key}-order-qty" style="margin: 0px; height: 14px; width: 30px; text-align: center; color: black; font-weight: bold;" value="${(Math.round(item.val().orderQty * 100) / 100).toFixed(0)}"> 
                </div> 
                
                <div style="flex: 4; display: flex; flex-direction: row; gap: 8px"> 
                    <button class="order-qty-control" onclick="changeOrdQty('${item.key}',false);checkQty('${item.key}')">-</button> 
                    <button class="order-qty-control" onclick="changeOrdQty('${item.key}',true);">+</button> 
                    <button class="order-qty-control" id="${item.key}-receive" onclick="receiveItem('${item.key}')" style="background-color: ${item.val().orderQty > 0 ? 'var(--primary-blue)':'var(--primary-base-mid)'}; font-weight: bold; font-size: 18x; padding-top: 0px;">↓</button> 
                </div> 
            </div> 
        </div>
        `;

        html += `
        <div class="item" id="${item.key}-card" style="background-color: ${item.val().stock>=item.val().minStock?'var(--primary-base-light)':'rgb(255, 238, 163);'};"> 
            <div ondblclick="editProd('${item.key}')" style="margin: 6px; border-radius: 6px; display: flex; flex-direction: row; gap: 8px; flex: 1"> 
                <div class="wrap" style="flex:3; font-weight:600; font-size: 14px; color: Black; width: 100px; text-align: left; width: 60%; padding-left: 4px; display: flex; flex-direction: column; align-items: start; padding-top: 2px;"> 
                    <div style="height:72px; overflow: hidden;" onclick="editItem('${item.key}')"> ${String(item.key).replaceAll('_',' ')} </div> 
                    <div style="font-size: 10px; color: var(--primary-base-dark)"> ${item.val().lastUpdate==undefined?'':item.val().lastUpdate} </div> </div> 
                <div style="height: 100px; text-align: center; justify-content: center; font-size: 14px; padding-right:4px; padding-top: 2px; color: var(--primary-base-dark); flex: 1"> Pack<br> <b style="heigh: 50px; font-size: 18px;" id="${item.key}-order-qty">${item.val().packQty}</b> </div> 
                <div style="height: 100px; text-align: center; justify-content: center; font-size: 14px; padding-right:4px; padding-top: 2px; color: var(--primary-base-dark); flex: 1"> Min<br> <b style="heigh: 50px; font-size: 18px;" id="${item.key}-order-qty">${item.val().minStock}</b> </div> 
                <div style="height: 100px; text-align: center; justify-content: center; font-size: 14px; padding-right:4px; padding-top: 2px; color: var(--primary-base-dark); flex: 1"> Order<br> <b style="heigh: 50px; font-size: 18px;" id="${item.key}-order-qty">${item.val().orderQty}</b> </div> 
                <div style="height: 100px; text-align: center; justify-content: center; font-size: 14px; padding-right:4px; padding-top: 2px; flex: 1; font-weight: bold;"> Stock<br> 
                    <input onchange="updateStock('${item.key}',this.value)" type="number" id="${item.key}-order-qty" style="margin: 0px; height: 10px; width: 50px; text-align: center; color: black; font-weight: bold;" value="${(Math.round(item.val().stock * 100) / 100).toFixed(2)}"> 
                </div> 
            </div> 
        </div>
        `;

        DOM.productsWindow.innerHTML = html;
    });
}

// 🔹 Helpers
function checkQty(item) {
    const val = Number(document.getElementById(item + "-order-qty").value);
    document.getElementById(item + "-receive").style.backgroundColor =
        val > 0 ? 'rgb(51,153,255)' : 'rgb(200,200,200)';
}

function receiveItem(itemName) {
    get(child(ref(db), `/businesses/${business}/Items/${itemName}`)).then(item => {

        const v = item.val();
        const newStock = Number(v.stock) + Number(v.orderQty) * Number(v.packQty);
        const delta = Number(v.orderQty) * Number(v.packQty);

        update(ref(db, 'businesses/' + business + '/Items/' + itemName), {
            stock: newStock,
            orderQty: 0
        }).then(() => renderItemDetails(itemName));

        update(ref(db, `/businesses/${business}/Consumo/${itemName}/${Date.now()}`), {
            stock: newStock,
            delta: delta,
        });

        document.getElementById(itemName + "-order-qty").value = 0;
        document.getElementById(itemName + "-stock-qty").innerHTML = `stock: ${newStock}`;
        checkQty(itemName);
    });
}

function changeOrdQty(itemName, increase) {
    const input = document.getElementById(itemName + "-order-qty");
    let current = Number(input.value);

    if (increase) current++;
    else if (current > 0) current--;

    update(ref(db, 'businesses/' + business + '/Items/' + itemName), {
        orderQty: current
    }).then(() => renderItemDetails(itemName));

    input.value = current;
    checkQty(itemName);
}

function updateOrder(item, qty) {
    update(ref(db, 'businesses/' + business + '/Items/' + item), {
        orderQty: Number(qty),
        lastUpdate: new Date().toLocaleString()
    });
    alert('Updated');
}

function updateStock(item, qty) {
    update(ref(db, 'businesses/' + business + '/Items/' + item), {
        stock: Number(qty),
        lastUpdate: new Date().toLocaleString()
    }).then(() => renderItemDetails(item));

    alert('Updated');
}

function editItem(item) {
    location.href = `ItemDetails.html?prod=${item}`;
}

// 🔹 expose globals
window.checkQty = checkQty;
window.changeOrdQty = changeOrdQty;
window.receiveItem = receiveItem;
window.updateOrder = updateOrder;
window.updateStock = updateStock;
window.editItem = editItem;