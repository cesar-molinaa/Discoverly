

//IMPORTS



import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";


const rutaHTML = window.location.pathname.includes("/html/")
    ? ""
    : "html/";


//VARIABLES GENERALES

const headerUsername = document.getElementById("header-username");
const userSession = document.getElementById("user-session");





const createPostBtn = document.getElementById("btn-create-post");
const createPostBtnHeader = document.getElementById("publicar-btn");





function irACrearPublicacion() {

    if (auth.currentUser) {

        window.location.href = `${rutaHTML}html/create-post.html`;

    } else {

        window.location.href = `${rutaHTML}login.html`;

    }

}



if (createPostBtn) {
    createPostBtn.addEventListener("click", irACrearPublicacion);
}

if (createPostBtnHeader) {
    createPostBtnHeader.addEventListener("click", irACrearPublicacion);
}





if (userSession) {

    userSession.addEventListener("click", () => {

        if (auth.currentUser) {

            window.location.href = `${rutaHTML}profile.html`;

        } else {

            window.location.href = `${rutaHTML}login.html`;

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

        headerPhoto.src = datos.foto || `${rutaImagenes}default-user.png`;

    }

}

    } else {

        headerUsername.textContent = "Invitado";
    }

});