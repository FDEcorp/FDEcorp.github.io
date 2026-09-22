document.getElementById('business').innerText = localStorage.getItem('business')
document.getElementById('datetime').innerText = String(new Date()).split('GMT')[0]

let order = Object.entries(JSON.parse(localStorage.getItem('print')))
console.log(order)
let total = 0;

let ordermap = order.map((prod)=>{
document.getElementById('order').innerHTML += 
`<div style="display: flex; flex-direction: row; gap: 10px; font-size: 22px;">
    <div style="flex:5; text-align:left;">${prod[0].replaceAll('_',' ')}</div>
    <div style="flex:1">x${prod[1][0]}</div>
    <div style="flex:1; text-align: right;">$ ${prod[1][1]}</div>
</div>`
total+=Number(prod[1][0])*Number(prod[1][1])

}
)

document.getElementById('total').innerText = total

console.log(ordermap)

window.onload = function() {
  window.print();
};


