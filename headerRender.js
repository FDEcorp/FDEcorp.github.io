function updateHeader() {
    const header = document.getElementById("header");
}

let meta = document.querySelector('meta[name="theme-color"]');

if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
}

meta.content = '#1c1c1c';

function renderHeader() {
    document.getElementById("header").innerHTML = `
        <h1 id="header-title" tabindex="-1" style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex:1; margin: 0; padding: 0;">
            <img src="fdeicon.png" height="24px" alt="" id="icon">
            FDE: <span id="business" style="overflow: hidden;">
                ${localStorage.getItem("business") || ""}
            </span>
        </h1>

        <div id="logout" style="flex: 1; text-align: right;">
            Cerrar Sesión
        </div>
    `;

    document.getElementById("header-title").addEventListener("click", () => {
        location.href = "menu.html";
    });

    document.getElementById("icon").addEventListener("click", () => {
        location.href = "menu.html";
    });

    document.getElementById("logout").addEventListener("click", () => {
        location.href = "https://checkout-three-ruddy.vercel.app/login";
    });

    updateHeader();
}

// Initial render
renderHeader();

// Adjust width whenever viewport size changes
window.addEventListener("resize", updateHeader);

// Existing scroll behavior
window.addEventListener("scroll", () => {
    const header = document.getElementById("header");
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    header.style.opacity = `${1 - Math.min(scrollTop / 50, 1)}`;

    if (scrollTop >= 50) {
        header.style.visibility = "hidden";
    } else {
        header.style.visibility = "visible";
    }

    const prodWindow = document.getElementById("products-window");

    if (prodWindow) {
        prodWindow.style.height = `${
            (1 + Math.min(scrollTop / 20, 1)) * 70
        }dvh`;
    }
});