/**IMPORTS */


import { db, auth } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


import { obtenerFecha } from "./create-post.js";




//VARIABLES GENERALES


export const coloresCategorias = {
    tecnologia: "#3B82F6",
    ciencia: "#22D3EE",
    musica: "#EC4899",
    arte: "#A855F7",
    cocina: "#F59E0B",
    deportes: "#22C55E",
    videojuegos: "#8B5CF6",
    historia: "#D97706"
};



const postsGrid = document.querySelector(".posts-grid");



/**LOGO TE LLEVA AL INICIO */


const logo = document.getElementById("logo");

if(logo) {

    logo.addEventListener("click", () => {

        window.location.href = "index.html#hero"
    })
}



/** EFECTO SCROLL HEADER */

window.addEventListener("scroll", () => {

    const header = document.querySelector("header");

    if (window.scrollY > 20) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }

});




/**BOTÓN MENU */


const btnHamburguesa = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");


if(btnHamburguesa) {

    btnHamburguesa.addEventListener("click", () => {

        mobileMenu.classList.toggle("active");
        document.body.classList.toggle("no-scroll");
    });

    window.addEventListener("resize", () => {

    if (window.innerWidth > 768) {
        mobileMenu.classList.remove("active");
        document.body.classList.remove("no-scroll");
    }
    });


    document.querySelectorAll(".mobile menu a").forEach(link => {
        link.addEventListener("click", () => {

            mobileMenu.classList.remove("active");
            document.body.classList.remove("no-scroll");
        } );
    });

}






async function cargarPublicacionesDestacadas() {

    const snapshot = await getDocs(collection(db, "publicaciones"));

    let publicaciones = [];

    snapshot.forEach(doc => {

        publicaciones.push({
            firebaseId: doc.id,
            ...doc.data()
        });

    });

    publicaciones.sort((a, b) => {

        return b.likes.length - a.likes.length;

    });

    const destacadas = publicaciones.slice(0, 6);

    destacadas.forEach((post, index) => {



       const card = document.createElement("div");

        card.style.animationDelay = `${index * 0.1}s`;

        card.className = "post-card";

        console.log(post);

        card.innerHTML = `
        
        <div class="post-img">

            <span
                class="post-category"
                style="background-color:${coloresCategorias[post.categoria]}"
            >
                ${post.categoria.charAt(0).toUpperCase() + post.categoria.slice(1)}
            </span>

            <img src="${post.imagen}" alt="${post.titulo}">

        </div>

        <div class="post-content">

            <h2>${post.titulo}</h2>

            <p class="post-date">${obtenerFecha(post.fecha)}</p>

            <p>${post.explicacion}</p>

        </div>

        <div class="post-footer">

            <div class="user">

                <img
                
                    src="${post.usuarioFoto || "../imgs/icons/user.png"}"
                    alt="Usuario"
                >

                <div class="user-info">

                    <h4>${post.usuarioNombre || "Usuario"}</h4>

                </div>

            </div>
            <div class="reactions">

            <span class="like-btn"> ❤️ ${post.likes.length} </span>

            <span> 💬 ${post.comentarios}  </span>
            
            </div>

        </div>
    `;

    const likeBtn = card.querySelector(".like-btn");



    likeBtn.addEventListener("click", async (e) => {

        e.stopPropagation();

        if(!auth.currentUser){

            window.location.href = "login.html";
            return;

        }

        const postRef = doc(db, "publicaciones", post.firebaseId);
        const yaHaDadoLike = post.likes.includes(auth.currentUser.uid);

        if(yaHaDadoLike){

            await updateDoc(postRef, {

                likes: arrayRemove(auth.currentUser.uid)

            });

            post.likes = post.likes.filter(uid => uid !== auth.currentUser.uid);

        } else{

            await updateDoc(postRef, {

                likes: arrayUnion(auth.currentUser.uid)

            });

            post.likes.push(auth.currentUser.uid);

        }

        likeBtn.textContent = `❤️ ${post.likes.length}`;

    });



    postsGrid.style.opacity = "1";

    card.addEventListener("click", () => {

        window.location.href = `postBig.html?id=${post.firebaseId}`;

    });

    postsGrid.appendChild(card);

    if (!post.titulo || !post.imagen) return;

    });

    

};


cargarPublicacionesDestacadas();