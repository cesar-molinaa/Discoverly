//IMPORTS

import { db, auth } from "./firebase.js";

import {
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { obtenerFecha } from "./create-post.js";
import { coloresCategorias } from "./index.js";



//VARIABLES GENERALES

const parametros = new URLSearchParams(window.location.search);

const id = parametros.get("id");

const likeBtn = document.getElementById("like-btn");
const likesCount = document.getElementById("likes-count");



//CARGAR POST CORESPONDIENTE EN GRANDE


async function cargarPost() {

    const referencia = doc(db, "publicaciones", id);

    const respuesta = await getDoc(referencia);


    if (!respuesta.exists()) {
        console.log("Ese post no existe");
        return;
    }
 
const post = { firebaseId: respuesta.id, ...respuesta.data() };



    const postUser = document.getElementById("post-user");
    const postUserPhoto = document.getElementById("post-user-photo");

    postUser.textContent = post.usuarioNombre || "Usuario";
    postUserPhoto.src = post.usuarioFoto || "../imgs/icons/user.png";

    postUser.addEventListener("click", () => {
        window.location.href = `profile.html?id=${post.usuarioId}`;
    });

    postUserPhoto.addEventListener("click", () => {
        window.location.href = `profile.html?id=${post.usuarioId}`;
    });



    document.getElementById("post-title").textContent = post.titulo;

    document.getElementById("post-date").textContent = obtenerFecha(post.fecha);

    const categoria = document.getElementById("post-category"); categoria.textContent = post.categoria; categoria.style.backgroundColor = coloresCategorias[post.categoria];

    document.getElementById("post-img").src = post.imagen;

    document.getElementById("post-description").textContent = post.explicacion;

    document.getElementById("post-long-description").textContent = post.explicacionLarga;

    likesCount.textContent = post.likes ? post.likes.length : 0;


    if (auth.currentUser &&
        post.likes.includes(auth.currentUser.uid)) {

        likeBtn.classList.add("liked");

    }


    likeBtn.addEventListener("click", async () => {


        if (!auth.currentUser) {

            window.location.href = "login.html";
            return;

        }

        const postRef = doc(db, "publicaciones", post.firebaseId);

        const yaHaDadoLike = post.likes.includes(auth.currentUser.uid);

        if (yaHaDadoLike) {

            await updateDoc(postRef, {
                likes: arrayRemove(auth.currentUser.uid)
            });

            post.likes = post.likes.filter(
                uid => uid !== auth.currentUser.uid
            );

            likeBtn.classList.remove("liked");

        } else {

            await updateDoc(postRef, {
                likes: arrayUnion(auth.currentUser.uid)
            });

            post.likes.push(auth.currentUser.uid);

            likeBtn.classList.add("liked");

        }

        likesCount.textContent = post.likes.length;

    });


}


cargarPost();



//BOTÓN ATRÁS


const buttonAtras = document.getElementById("button-atras");

if (buttonAtras) {

    buttonAtras.addEventListener("click", () => {

    if (history.length > 1) {
        history.back();
    } else {
        window.location.href = "posts.html";
    }
});
}