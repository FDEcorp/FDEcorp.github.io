document.getElementById('header').innerHTML = `
    <h1>
        <img src="../fdeicon.png" height="24px" alt="">
        FDE: <span id="business">${localStorage.getItem('business')}</span></h1>
    
    <div id="logout" onclick="location.href = 'index.html'">Cerrar Sesión</div>
`