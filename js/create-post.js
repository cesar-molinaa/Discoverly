/**IMPORTS */

import { addDoc, collection } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { db } from "./firebase.js";

import { coloresCategorias } from "./index.js";

import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";



//CARGAR IMAGEN DESDE CLOUDINARY PARA OCUPAR MENOS

export async function subirImagen(archivo) {

    const formData = new FormData();

    formData.append("file", archivo);
    formData.append("upload_preset", "Discoverly");

    const respuesta = await fetch(
        "https://api.cloudinary.com/v1_1/xaoiq5an/image/upload",
        {
            method: "POST",
            body: formData
        }
    );

    const datos = await respuesta.json();

    return datos.secure_url;
}





/**TEXTEAREA ADAPTABLE */

const textarea = document.querySelectorAll("textarea");
textarea.forEach(textarea => {

    textarea.addEventListener("input", () => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
})

});




/**CONTADOR PALABRAS TITULO - ACTUALIZAR PREVIEW TITULO*/

const titulo = document.getElementById("titulo");
const contadorTitulo = document.getElementById("contador-titulo");

if (titulo && contadorTitulo){

    titulo.addEventListener("input", () => {

    let caracteres = titulo.value.length;

    contadorTitulo.textContent = `${caracteres}/60`;

    contadorTitulo.classList.remove(
            "contador-normal",
            "contador-warning",
            "contador-danger"
        );

        if (caracteres >= 55) {
            contadorTitulo.classList.add("contador-danger");
        }
        else if (caracteres >= 40) {
            contadorTitulo.classList.add("contador-warning");
        }
        else {
            contadorTitulo.classList.add("contador-normal");
        }

        /**ACTUALIZAR PREVIEW */
        const previewTitulo = document.getElementById("preview-titulo");
        previewTitulo.textContent = titulo.value || "Título del Post";
})
}




/**CONTADOR PALABRAS EXPLICACION - ACTUALIZAR PREVIEW EXPLICACIÓN*/

const explicacion = document.getElementById("explicacion");
const contadorExplicacion = document.getElementById("contador-explicacion");


if (explicacion && contadorExplicacion){

    explicacion.addEventListener("input", () => {

    let caracteres = explicacion.value.length;

    contadorExplicacion.textContent = `${caracteres}/200`;

    contadorExplicacion.classList.remove(
            "contador-normal",
            "contador-warning",
            "contador-danger"
        );

        if (caracteres >= 180) {
            contadorExplicacion.classList.add("contador-danger");
        }
        else if (caracteres >= 150) {
            contadorExplicacion.classList.add("contador-warning");
        }
        else {
            contadorExplicacion.classList.add("contador-normal");
        }

        /**ACTUALIZAR PREVIEW */

        const previewExplicacion = document.getElementById("preview-explicacion");
        previewExplicacion.textContent = explicacion.value || "Exlicación del Descubrimiento";
})
}




/**CONTADOR PALABRAS EXPLICACION LARGA - ACTUALIZAR PREVIEW EXPLICACIÓN LARGA*/

const explicacionLarga = document.getElementById("explicacion-larga");
const contadorExplicacionLarga = document.getElementById("contador-explicacion-larga");


if (explicacionLarga && contadorExplicacionLarga){

    explicacionLarga.addEventListener("input", () => {

    let caracteres = explicacionLarga.value.length;

    contadorExplicacionLarga.textContent = `${caracteres}/600`;

    contadorExplicacionLarga.classList.remove(
            "contador-normal",
            "contador-warning",
            "contador-danger"
        );

        if (caracteres >= 550) {
            contadorExplicacionLarga.classList.add("contador-danger");
        }
        else if (caracteres >= 450) {
            contadorExplicacionLarga.classList.add("contador-warning");
        }
        else {
            contadorExplicacionLarga.classList.add("contador-normal");
        }

        /**ACTUALIZAR PREVIEW */

        const previewExplicacionLarga = document.getElementById("preview-explicacion-larga");
        previewExplicacionLarga.textContent = explicacionLarga.value || "Exlicación exhaustiva del Descubrimiento";
})
}




/**SINCRONIZAR CATEGORIAS TEMPLATE-PREVIEW */
const categoria = document.getElementById("categoria");


if(categoria) {

    categoria.addEventListener("change", () => {

    const previewCategoria = document.getElementById("preview-categoria");

        previewCategoria.textContent = categoria.options[categoria.selectedIndex].text || "Categoría";

        previewCategoria.style.backgroundColor = coloresCategorias[categoria.value] || "#3B82F6";
})

}



//SINCRONIZAR USUARIO CREADOR


const previewUser = document.getElementById("preview-user");


onAuthStateChanged(auth, (user)=>{


    if(user && previewUser){

        previewUser.textContent = user.displayName;

    }


});



/**SINCRONIZAR IMG TEMPLATE - PREVIEW */

const inputImg = document.getElementById("img");
const previewImg = document.getElementById("preview-img");


if(inputImg && previewImg) {

    inputImg.addEventListener("change", () => {

    const archivo = inputImg.files[0];

    if (!archivo) return;
    const lector = new FileReader();

    lector.onload = function (e) {

        previewImg.src = e.target.result;
    };

    lector.readAsDataURL(archivo);
})
}





/**OBLIGATORIEDAD ELEMENTOS AL ENTREGAR FORMULARIO - GUARDAR NUEVO POST EN FIREBASE*/

const imagen = document.getElementById("img");
const formMessage = document.getElementById("form-message");


const formularioPost = document.getElementById("post-form");

if(formularioPost) {

    formularioPost.addEventListener("submit", async (e) => {


    e.preventDefault();

    formMessage.textContent = "";
    formMessage.classList.remove("form-error", "form-success");

    if (titulo.value.trim() === "") {
        formMessage.textContent = "❌ Debes escribir un título";
        formMessage.classList.add("form-error");
        return;
    }

    if (categoria.value === "") {
        formMessage.textContent = "❌ Debes elegir una categoría";
        formMessage.classList.add("form-error");
        return;
    }

    if (imagen.files.length === 0) {
        formMessage.textContent = "❌ Debes elegir una imagen";
        formMessage.classList.add("form-error");
        return;
    }

    if (explicacion.value.trim() === "") {
        formMessage.textContent = "❌ Debes escribir una explicación.";
        formMessage.classList.add("form-error");
        return;
    }

    const imageUrl = await subirImagen(imagen.files[0]);

    const usuario = auth.currentUser;


    const newPost = {

        id: Date.now(),

        titulo: titulo.value,
        categoria: categoria.value,
        explicacion: explicacion.value,
        explicacionLarga: explicacionLarga.value,

        imagen: imageUrl,

        fecha: Date.now(),

        likes: [],
        comentarios: 0,

        usuarioId: usuario ? usuario.uid : null,
        usuarioNombre: usuario ? usuario.displayName : "Usuario desconocido",
        usuarioFoto: usuario ? usuario.photoURL : "../imgs/icons/user.png"
    }


    await addDoc(
    collection(db, "publicaciones"),
    newPost
);


 


    formMessage.textContent = "✔ Publicación creada correctamente.";
    formMessage.classList.add("form-success");

    setTimeout( () => {
        window.location.href = "posts.html";
    }, 1000);
})

}






//GUARDAR FECHA DE CREACIÓN DEL POST


function tiempo(cantidad, unidad) {

    if (cantidad === 1) {
        return `Hace 1 ${unidad}`;
    }

    return `Hace ${cantidad} ${unidad}s`;

}

export function obtenerFecha(fechaPublicacion) {

    const ahora = Date.now();

    const diferencia = ahora - fechaPublicacion;

    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const meses = Math.floor(dias / 30);
    const años = Math.floor(meses / 12);

    if (segundos < 60) return tiempo(segundos, "segundo");

    if (minutos < 60) return tiempo(minutos, "minuto");

    if (horas < 24) return tiempo(horas, "hora");

    if (dias < 30) return tiempo(dias, "día");

    if (meses < 12) return tiempo(meses, "mes");

    return tiempo(años, "año");

}