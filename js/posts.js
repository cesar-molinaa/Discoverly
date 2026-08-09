//IMPORTS 

import { db, auth} from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { obtenerFecha } from "./create-post.js";
import { coloresCategorias } from "./index.js";


//VARIABLES GENERALES

let publicaciones = [];

const postsGrid = document.getElementById("posts-grid");


const loader = document.getElementById("loader");

const noResults = document.getElementById("no-results");



//CARGAR LAS PUBLICACIONES DE FIREBASE Y METERLAS EN PUBLICACIONES[]

async function cargarPublicaciones() {

    const snapshot = await getDocs(collection(db, "publicaciones"));

    publicaciones = [];

    snapshot.forEach(doc => {

        publicaciones.push({ firebaseId: doc.id, ...doc.data() });


    });

    mostrarPublicaciones(publicaciones);

}

cargarPublicaciones();



//MOSTRAR PUBLICACIONES EN EL GRID


function mostrarPublicaciones(publicacionesAMostrar) {

   postsGrid.innerHTML = "";

    if(publicacionesAMostrar.length === 0){

        noResults.classList.add("mostrar");

    }else{

        noResults.classList.remove("mostrar");



    publicacionesAMostrar.forEach((post, index )=> {

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

            <div class="user post-user">

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



    const user = card.querySelector(".post-user");

    user.addEventListener("click", (e) => {

        e.stopPropagation();

        window.location.href = `profile.html?uid=${post.usuarioId}`;

    });




    actualizarContador(publicacionesAMostrar.length);

    postsGrid.appendChild(card);

    loader.classList.add("oculto");

    postsGrid.style.opacity = "1";

    card.addEventListener("click", () => {

        window.location.href = `postBig.html?id=${post.firebaseId}`;

    });


    if (!post.titulo || !post.imagen) return;

    });

};
};


//FILTRAR PUBLICACIONES

function filtrarPublicaciones() {

    const categoriaSeleccionada = document.getElementById("filter-category").value;

    const textoBusqueda = document.getElementById("search-input").value.toLowerCase();

    const ordenSeleccionado = document.getElementById("order-filter").value;

    const fechaSeleccionada = document.getElementById("filter-date").value;



    const publicacionesFiltradas = publicaciones.filter(post => {


    const coincideCategoria = categoriaSeleccionada === "all" || post.categoria === categoriaSeleccionada;

    const coincideBusqueda = textoBusqueda === "" || post.titulo.toLowerCase().includes(textoBusqueda) || post.explicacion.toLowerCase().includes(textoBusqueda) || post.categoria.toLowerCase().includes(textoBusqueda) || post.usuarioNombre.toLowerCase().includes(textoBusqueda);



    const ahora = Date.now();


    let coincideFecha = true;


    if(fechaSeleccionada === "today") {

        coincideFecha = post.fecha >= ahora - (24 * 60 * 60 * 1000);

    }


    if(fechaSeleccionada === "week") {

        coincideFecha = post.fecha >= ahora - (7 * 24 * 60 * 60 * 1000);

    }


    if(fechaSeleccionada === "month") {

        coincideFecha = post.fecha >= ahora - (30 * 24 * 60 * 60 * 1000);

    }


    return coincideCategoria && coincideBusqueda && coincideFecha;

    });


    if (ordenSeleccionado === "recientes") {

        publicacionesFiltradas.sort((a, b) => {

            return b.fecha - a.fecha;

        });
    }

    if (ordenSeleccionado === "antiguos") {

    publicacionesFiltradas.sort((a, b) => {

        return a.fecha - b.fecha;
    });

    }

    if (ordenSeleccionado === "likes") {

    publicacionesFiltradas.sort((a, b) => {

        return b.likes.length - a.likes.length;

    });

    }


    mostrarPublicaciones(publicacionesFiltradas);

}


//DETECTA EL FILTRO POR CATEGORIAS Y LO APLICA A LOS POSTS

const filtroCategoria = document.getElementById("filter-category");

if (filtroCategoria) {

    filtroCategoria.addEventListener("change", () => {

        filtrarPublicaciones();

    });

}


//DETECTA EL FILTRO DEL BUSCADOR Y LO APLICA A LOS POSTS

const buscador = document.getElementById("search-input");

if(buscador) {

    buscador.addEventListener("input", () => {

    aplicarFiltrosConAnimacion();

});

}



//DETECTA EL FILTRO DE ORDEN Y LO APLICA A LOS POSTS

const orden = document.getElementById("order-filter");

if (orden) {

    orden.addEventListener("change", () => {

        aplicarFiltrosConAnimacion();

    });

}


//DETECTA EL FILTRO DE FECHA Y LO APLICA A LOS POSTS

const filtroFecha = document.getElementById("filter-date");


if(filtroFecha){

    filtroFecha.addEventListener("change", () => {

        aplicarFiltrosConAnimacion();

    });

}



//ACTUALIZA CONTADOR DE PUBLICACIONES



function actualizarContador(cantidad) {

    const contador = document.getElementById("publicaciones-found");


    if (!contador) return;


    if (cantidad === 1) {

        contador.textContent = "1 publicación encontrada";

    } else {

        contador.textContent = `${cantidad} publicaciones encontradas`;

    }

}



//ANIMACION DESAPARECER PUBLICACIONES



function aplicarFiltrosConAnimacion() {

    postsGrid.classList.add("ocultar-posts");

    setTimeout(() => {

        filtrarPublicaciones();

        postsGrid.classList.remove("ocultar-posts");

    }, 200);

}




//BOTÓN FILTROS RESPONSIVE

const botonFiltros = document.getElementById("btn-filtros");

const filtros = document.querySelector(".filters");

console.log(botonFiltros);
console.log(filtros);

if(botonFiltros){

    botonFiltros.addEventListener("click", ()=>{

            console.log("CLICK");

        filtros.classList.toggle("activo");


    if(filtros.classList.contains("activo")){

        botonFiltros.textContent = "Ocultar filtros";

    }else{

        botonFiltros.textContent = "Mostrar filtros";

    }

    });

}

window.addEventListener("resize", () => {

    if (window.innerWidth > 1555) {

        filtros.classList.remove("activo");
        botonFiltros.textContent = "Mostrar filtros";

    }

});



