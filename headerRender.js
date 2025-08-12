document.getElementById('header').innerHTML = `
    <h1>
        <img src="fdeicon.png" height="24px" alt="" id="icon">
        FDE: <span id="business" style="overflow: hidden;">${localStorage.getItem('business')}</span></h1>
    
    <div id="logout" onclick="location.href = 'https://checkout-three-ruddy.vercel.app/login'">Cerrar Sesión</div>
`
let header = document.getElementById("header");
header.style.width = `${window.innerWidth - 80}px`
if(window.innerWidth<=600){
header.style.width = `${window.innerWidth - 70}px`
}

    window.addEventListener("scroll", function () {
    let header = document.getElementById("header");
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    

    header.style.opacity = `${1 - Math.min(scrollTop / 50,1)}`
    console.log(scrollTop)
    if(scrollTop>=50){
        header.style.visibility = 'hidden'
    }
    else{
        header.style.visibility = 'visible'
    }

        try{
            
            let prodWindow = document.getElementById("products-window");
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            prodWindow.style.height = `${(1 + Math.min(scrollTop / 20,1))*70}dvh`
            console.log("trying to adjust to 70*1+",Math.min(scrollTop / 20,1))
        }
        catch(e){

        }
 });
