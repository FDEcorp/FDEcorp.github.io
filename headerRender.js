document.getElementById('header').innerHTML = `
    <h1 style="width: 80vw;">
        <img src="fdeicon.png" height="24px" alt="">
        FDE: <span id="business" style="overflow: hidden;">${localStorage.getItem('business')}</span></h1>
    
    <div id="logout" onclick="location.href = 'index.html'">Cerrar Sesión</div>
`