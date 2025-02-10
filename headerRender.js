document.getElementById('header').innerHTML = `
    <h1>
        <img src="fdeicon.png" height="24px" alt="">
        FDE: <span id="business" style="overflow: hidden;">${localStorage.getItem('business')}</span></h1>
    
    <div id="logout" onclick="location.href = 'https://checkout-three-ruddy.vercel.app/login'">Cerrar Sesión</div>
`