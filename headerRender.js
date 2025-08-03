document.getElementById('header').innerHTML = `
    <h1>
        <img src="fdeicon.png" height="24px" alt="" id="icon">
        FDE: <span id="business" style="overflow: hidden;">${localStorage.getItem('business')}</span></h1>
    
    <div id="logout" onclick="location.href = 'https://checkout-three-ruddy.vercel.app/login'">Cerrar Sesión</div>
`

window.addEventListener("scroll", function () {
    let header = document.getElementById("header");
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    header.style.opacity = `${1 - Math.min(scrollTop / 50,1)}`


        try{
            
            let prodWindow = document.getElementById("products-window");
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            prodWindow.style.height = `${(1 + Math.min(scrollTop / 50,1))*50}vh`
            console.log("trying to adjust to 70*1+",Math.min(scrollTop / 50,0.7))
        }
        catch(e){

        }
 });
