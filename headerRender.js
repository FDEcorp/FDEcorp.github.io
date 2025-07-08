document.getElementById('header').innerHTML = `
    <h1>
        <img src="fdeicon.png" height="24px" alt="" id="icon">
        FDE: <span id="business" style="overflow: hidden;">${localStorage.getItem('business')}</span></h1>
    
    <div id="logout" onclick="location.href = 'https://checkout-three-ruddy.vercel.app/login'">Cerrar Sesión</div>
`
window.addEventListener("scroll", function () {
    let header = document.getElementById("header");
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    header.style.background = `rgba(0,0,0,${1 - Math.min(scrollTop / 500,0.4)})`


 });