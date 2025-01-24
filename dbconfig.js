//Import all JS dependencies and config database
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {getDatabase} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js"; 


const firebaseConfig = {
    apiKey: "AIzaSyDAbNF2Ic7TsuWlR6e3-VwP9nQxcSIt4pc",
    authDomain: "fde-erp.firebaseapp.com",
    databaseURL: "https://fde-erp-default-rtdb.firebaseio.com",
    projectId: "fde-erp",
    storageBucket: "fde-erp.appspot.com",
    messagingSenderId: "718556271008",
    appId: "1:718556271008:web:c9aaf308fad668ae0014c5",
    measurementId: "G-62P8017H4W"
  };

  const app = initializeApp(firebaseConfig);


  // Initialize Realtime Database and get a reference to the service
  window.db = getDatabase(app);
