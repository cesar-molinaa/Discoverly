
//IMPORTS

import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { db } from "./firebase.js";


//VARIABLES GENERALES

const nombreInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");

const registerBtn = document.getElementById("register-btn");
const mensaje = document.getElementById("register-message");




//FUNCIONES






//Detectar entregar formulario

if(registerBtn) {

    registerBtn.addEventListener("click", registrarUsuario);
}



//Registrar usuario


async function registrarUsuario(e){

    e.preventDefault();


    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;


    if (!nombre || !email || !password || !confirmPassword) {

    mensaje.textContent = "Completa todos los campos.";
    return;

    }


    if (password !== confirmPassword) {

    mensaje.textContent = "Las contraseñas no coinciden.";
    return;

    }



    try {

        const credenciales = await createUserWithEmailAndPassword(

        auth,
        email,
        password

        );


        await updateProfile(credenciales.user, {

            displayName: nombre

        });

        await credenciales.user.reload();


        await setDoc(doc(db, "usuarios", credenciales.user.uid), {

            nombre: nombre,

            email: email,

            foto: "",

            bio: "",

            fechaRegistro: Date.now()

        });

        console.log("Documento creado correctamente");

        window.location.href = "../index.html";



        mensaje.textContent = "¡Cuenta creada correctamente!";

    }

    catch(error){

    switch(error.code){

        case "auth/weak-password":
            mensaje.textContent = "La contraseña debe tener al menos 6 caracteres.";
            break;

        case "auth/email-already-in-use":
            mensaje.textContent = "Ese correo ya está registrado.";
            break;

        case "auth/invalid-email":
            mensaje.textContent = "Introduce un correo válido.";
            break;

        default:
            mensaje.textContent = "Ha ocurrido un error.";
            console.error(error);
    };


    }


    nombreInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
    confirmPasswordInput.value = "";

};