

//IMPORTS



import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";



//VARIABLES GENERALES

const headerUsername = document.getElementById("header-username");
const userSession = document.getElementById("user-session");




if (userSession) {

    userSession.addEventListener("click", () => {

        if (auth.currentUser) {

            window.location.href = "profile.html";

        } else {

            window.location.href = "login.html";

        }

    });

}




onAuthStateChanged(auth, async (user) => {

   if (!headerUsername) return;

    if (user) {

        headerUsername.textContent = user.displayName || "Usuario";
        const headerPhoto = document.getElementById("header-user");

if (headerPhoto) {

    const docSnap = await getDoc(doc(db, "usuarios", user.uid));

    if (docSnap.exists()) {

        const datos = docSnap.data();

        headerPhoto.src = datos.foto || "../imgs/default-user.png";

    }

}

    } else {

        headerUsername.textContent = "Invitado";
    }

});