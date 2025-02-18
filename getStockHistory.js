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
})
console.log('currentStock',CurrentStock)


Selector.addEventListener('change',()=>{
    getData(Selector.value)
    renderItemDetails(Selector.value)
})

window.ConsumosSorted
function getData(item){
    console.log(item)
    get(ref(db,`/businesses/${business}/Consumo/${item}`)).then(snapshot=>{
        update(ref(db, `/businesses/${business}/Consumo/${item}/${new Date()}`), 
            {
                stock: CurrentStock[item],
            }).then(()=>{
                Consumos = []; // Clear the array to avoid duplicates

                snapshot.forEach((record) => {
                    Consumos.push([new Date(record.key), record.val().stock]); // Add each record
                });
    
                window.ConsumosSorted = Consumos.sort((a, b) => a[0] - b[0]);    
                drawChart(ConsumosSorted);
                
        })
    }
    )}

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

function renderItemDetails(itemName){
    document.getElementById('products-window').innerHTML = ""
    get(child(ref(db),`/businesses/${business}/Items/${itemName}`)).then((item) => {
        document.getElementById('products-window').innerHTML += `
        <div class="item" id="${item.key}-card" style="background-color: ${item.val().stock>=item.val().minStock?'var(--primary-base-light)':'rgb(255, 238, 163);'};">
                        <div ondblclick="editProd('${item.key}')" style="margin: 6px; border-radius: 6px; display: flex; flex-direction: row; gap: 8px; flex: 1">
                            
                                <div class="wrap" style="flex:5; font-weight:600; font-size: 16px; color: Black; width: 100px; text-align: left; width: 60%; padding-left: 4px; display: flex; flex-direction: column; align-items: start;">
                                    <div style="height:20px; overflow: hidden" onclick="editItem('${item.key}')">
                                        ${String(item.key).replaceAll('_',' ')}
                                    </div>
                                    <span style="font-size: 12px; color: gray; font-weight: 100; magin-top: 2px;" id="${item.key}-stock-qty">stock: ${(Math.round(item.val().stock * 100) / 100).toFixed(0)}</span>
                                    <span style="font-size: 12px; color: gray; font-weight: 100">pack: ${item.val().packQty}</span>
                                </div>
                            
                                <div style="height: 20px; font-size: 16px; text-align: left; padding-right:0px; padding-top: 2px; flex: 1">
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
                    `
                    document.getElementById('products-window').innerHTML += `

                    <div class="item" id="${item.key}-card" style="background-color: ${item.val().stock>=item.val().minStock?'var(--primary-base-light)':'rgb(255, 238, 163);'};">
                        <div ondblclick="editProd('${item.key}')" style="margin: 6px; border-radius: 6px; display: flex; flex-direction: row; gap: 8px; flex: 1">
                            
                                <div class="wrap" style="flex:3; font-weight:600; font-size: 14px; color: Black; width: 100px; text-align: left; width: 60%; padding-left: 4px; display: flex; flex-direction: column; align-items: start; padding-top: 2px;">
                                    <div style="height:72px; overflow: hidden;" onclick="editItem('${item.key}')">
                                        ${String(item.key).replaceAll('_',' ')}
                                    </div>
                                    <div style="font-size: 10px; color: var(--primary-base-dark)">
                                        ${item.val().lastUpdate==undefined?'':item.val().lastUpdate}
                                    </div>
                                </div>

                                <div style="height: 100px; text-align: center; justify-content: center; font-size: 14px; padding-right:4px; padding-top: 2px; color: var(--primary-base-dark); flex: 1">
                                    Pack<br>
                                    <b style="heigh: 50px; font-size: 18px;" id="${item.key}-order-qty">${item.val().packQty}</b>
                                </div>

                                <div style="height: 100px; text-align: center; justify-content: center; font-size: 14px; padding-right:4px; padding-top: 2px; color: var(--primary-base-dark); flex: 1">
                                    Min<br>
                                    <b style="heigh: 50px; font-size: 18px;" id="${item.key}-order-qty">${item.val().minStock}</b>
                                </div>
                            
                                <div style="height: 100px; text-align: center; justify-content: center; font-size: 14px; padding-right:4px; padding-top: 2px; color: var(--primary-base-dark); flex: 1">
                                    Order<br>
                                    <b style="heigh: 50px; font-size: 18px;" id="${item.key}-order-qty">${item.val().orderQty}</b>
                                </div>
                                
                                <div style="height: 100px; text-align: center; justify-content: center; font-size: 14px; padding-right:4px; padding-top: 2px; flex: 1; font-weight: bold;">
                                    Stock<br>
                                    <input onchange="updateStock('${item.key}',this.value)" type="number" id="${item.key}-order-qty" style="margin: 0px; height: 10px; width: 50px; text-align: center; color: black; font-weight: bold;" value="${(Math.round(item.val().stock * 100) / 100).toFixed(2)}">
                                </div>
    
                            
                        </div>
                       
                    </div> 
                    `
    })
}


function checkQty(item){
    console.log("checking qty")
    if(Number(document.getElementById(item+"-order-qty").value) > 0){
        document.getElementById(item+"-receive").style.backgroundColor = 'rgb(51, 153, 255)'
    }
    else{
        document.getElementById(item+"-receive").style.backgroundColor = 'rgb(200,200,200)'
    }
}

function receiveItem(itemOBJ){
    //increase inventory by order qty*qtypack
    let itemName = itemOBJ
    //reset order qty to 0
    get(child(ref(db),`/businesses/${business}/Items/${itemName}`)).then((item) => {
        let currentOrder = item.val().orderQty
        let currentStock = item.val().stock
        let pack = item.val().packQty

            update(ref(db,'businesses/'+business+'/Items/'+itemName),{
                stock: Number(currentStock) + Number(currentOrder)*Number(pack),
                orderQty: Number(0)
            }).then(()=>{
                renderItemDetails(itemName)
            });

            update(ref(db, `/businesses/${business}/Consumo/${itemName}/${new Date()}`), {
                stock: Number(currentStock) + Number(currentOrder)*Number(pack),
                delta: Number(currentOrder)*Number(pack),
            }); 

            document.getElementById(itemName+"-order-qty").value = 0;
            document.getElementById(itemName+"-stock-qty").innerHTML = `stock: ${Number(currentStock) + Number(currentOrder)*Number(pack)}`
            checkQty(itemName)
            
        
        }
    )
    
}

window.editItem = editItem;
function editItem(item){
    if(true){
        location.href = `ItemDetails.html?prod=${item}`
    }
}

function changeOrdQty(itemOBJ,increase){

    let itemName = itemOBJ

    get(child(ref(db),`/businesses/${business}/Items/${itemName}`)).then((item) => {
        let current = item.val().orderQty

        if(increase){
            update(ref(db,'businesses/'+business+'/Items/'+itemName),{
                orderQty: current+1
            }).then(()=>{
                renderItemDetails(itemName)
            });
            document.getElementById(itemName+"-order-qty").value++;
            checkQty(itemName)
        }
        if(!increase && Number(document.getElementById(itemName+"-order-qty").value)>0){
            update(ref(db,'businesses/'+business+'/Items/'+itemName),{
                orderQty: current-1
            }).then(()=>{
                renderItemDetails(itemName)
            });
            document.getElementById(itemName+"-order-qty").value--;
            checkQty(itemName)
        }
        }
    )
    
}

window.updateOrder = updateOrder;
function updateOrder(item,qty){
    update(ref(db,'businesses/'+business+'/Items/'+item),{
        orderQty: Number(qty),
        lastUpdate: String(new Date()).substring(0,11)+String(new Date()).substring(16,21),
    });
    alert('Updated')
}

window.updateStock = updateStock;
function updateStock(item,qty){
    update(ref(db,'businesses/'+business+'/Items/'+item),{
        stock: Number(qty),
        lastUpdate: String(new Date()).substring(0,11)+String(new Date()).substring(16,21),
    }).then(
        renderItemDetails(item)
    );
    alert('Updated')
}

window.checkQty = checkQty;
window.changeOrdQty = changeOrdQty;
window.receiveItem = receiveItem;