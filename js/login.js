
// IMPORTS

import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// VARIABLES GENERALES

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const loginBtn = document.getElementById("login-btn");
const mensaje = document.getElementById("login-message");



onAuthStateChanged(auth, (user) => {

    if (user) {

        window.location.href = "index.html";

    }

});



// DETECTAR ENVÍO DEL FORMULARIO

if (loginBtn) {

    loginBtn.addEventListener("click", iniciarSesion);

}


// INICIAR SESIÓN

async function iniciarSesion(e) {

    e.preventDefault();

        console.log("Botón pulsado");

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    console.log(email, password);

    if (!email || !password) {

        mensaje.textContent = "Completa todos los campos.";
        return;

    }

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        mensaje.textContent = "¡Has iniciado sesión!";

        console.log("Sesión iniciada");


        emailInput.value = "";
        passwordInput.value = "";

    } catch (error) {

        console.error("ERROR FIREBASE:", error);

        switch (error.code) {

            case "auth/invalid-credential":
                mensaje.textContent = "Correo o contraseña incorrectos.";
                break;

            case "auth/invalid-email":
                mensaje.textContent = "El correo no es válido.";
                break;

            default:
                mensaje.textContent = "Ha ocurrido un error.";
                console.error(error);

        }

    }

}