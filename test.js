import {set, get, update, remove, ref, child, getDatabase, onValue, query, orderByChild, equalTo} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 

let business = localStorage.getItem('business');


// References
const itemsRef = ref(db, `/businesses/${business}/Items`);
renderItems()
// Conditionally build the query
function renderItems(){

// Get the URL parameter
const params = new URLSearchParams(window.location.search);
const filter = params.get("Filter"); // Retrieves the "Filter" parameter, e.g., "tapas"
    document.getElementById('main-cont').innerHTML = ""
    let myQuery;
    if (filter) {
        // If a filter is provided, query items with the specific category
        myQuery = query(itemsRef, orderByChild("category"), equalTo(filter));
    } else {
        // If no filter is provided, query all items
        myQuery = query(itemsRef, orderByChild("category"));
    }
    
    // Query Data
    get(myQuery).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((item) => {
                document.getElementById('main-cont').innerHTML += `${item.key} ${item.val().category}<br>`;
            });
        } else {
            document.getElementById('main-cont').innerHTML = "No items found.";
        }
    }).catch((error) => {
        console.error("Error fetching data:", error);
    });
    
}
// Get the filter input element
const filterInput = document.getElementById("filter-input");

// Add an event listener for the 'input' event
filterInput.addEventListener("change", (event) => {
    const filterValue = event.target.value;

    // Get the current URL
    const url = new URL(window.location);

    if (filterValue) {
        // Set or update the "Filter" parameter
        url.searchParams.set("Filter", filterValue);
    } else {
        // Remove the "Filter" parameter if input is empty
        url.searchParams.delete("Filter");
    }

    // Update the URL in the browser without reloading
    window.history.replaceState({}, "", url);
    renderItems()
});

