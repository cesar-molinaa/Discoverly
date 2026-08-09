

//IMPORTS

import { auth, db } from "./firebase.js";



import { coloresCategorias } from "./index.js";
import {
    obtenerFecha,
    subirImagen
} from "./create-post.js";


import {
    onAuthStateChanged,
    updateProfile,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";





import {
    doc,
    getDoc,
    updateDoc,
    collection,
    getDocs,
    query,
    where,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


//VARIABLES GENERALES

const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const profilePhoto = document.getElementById("profile-photo");
const profileBio = document.getElementById("profile-bio");


const profilePostsGrid = document.getElementById("profile-posts-grid");





const editProfileBtn = document.getElementById("edit-profile-btn");

const modal = document.getElementById("edit-profile-modal");

const cancelEditBtn = document.getElementById("cancel-edit-btn");

const saveEditBtn = document.getElementById("save-edit-btn");

const editName = document.getElementById("edit-name");

const editBio = document.getElementById("edit-bio");

const editPhoto = document.getElementById("edit-photo");

const editPhotoPreview = document.getElementById("edit-photo-preview");


let datosUsuario = null;


const logoutBtn = document.getElementById("logout-btn");



const params = new URLSearchParams(window.location.search);
const perfilUid = params.get("id");


const profilePostsTitle = document.getElementById("profile-posts-title");


//RELLENAR PROFILE CON LOS DATOS DE USUARIO

onAuthStateChanged(auth, async (user) => {

    // ESTAMOS VIENDO EL PERFIL DE OTRA PERSONA
    if (perfilUid) {

        await cargarPerfil(perfilUid);

        editProfileBtn.style.display = "none";
        logoutBtn.style.display = "none";
        profileEmail.style.display = "none";
        profilePostsTitle.textContent = "Publicaciones";

        return;
    }


    // ESTAMOS VIENDO NUESTRO PROPIO PERFIL
    if (!user) {

        window.location.href = "login.html";
        return;

    }

    await cargarPerfil(user.uid);

});




async function cargarPerfil(uid) {

    const docRef = doc(db, "usuarios", uid);

    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {

        profileName.textContent = "Usuario no encontrado";
        profileEmail.style.display = "none";
        profileBio.textContent = "";

        return;

    }

    const datos = docSnap.data();

    datosUsuario = datos;

    profileName.textContent = datos.nombre || "Usuario";

    profileEmail.textContent = datos.email || "";

    profileBio.textContent = datos.bio || "Sin biografía.";

    if (datos.foto) {

        profilePhoto.src = datos.foto;

    } else {

        profilePhoto.src = "../imgs/default-user.png";

    }

    await cargarMisPublicaciones(uid);

}



//CARGAR POSTS DEL USUARIO


async function cargarMisPublicaciones(uid){

    const snapshot = await getDocs(collection(db, "publicaciones"));

    const misPublicaciones = [];

    snapshot.forEach(doc => {

        const post = {
            firebaseId: doc.id,
            ...doc.data()
        };

        if(post.usuarioId === uid){

            misPublicaciones.push(post);

        }

    });


    if(misPublicaciones.length === 0){

        profilePostsGrid.innerHTML = `
            <p class="profile-empty">
                Todavía no has publicado nada.
            </p>
        `;

        return;

    }


    profilePostsGrid.innerHTML = "";


    misPublicaciones.forEach((post, index) => {

        const card = document.createElement("div");

        card.className = "post-card";

        card.style.animationDelay = `${index * 0.1}s`;


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

                    <span class="like-btn">
                        ❤️ ${post.likes.length}
                    </span>

                    <span>
                        💬 ${post.comentarios}
                    </span>
                    
                </div>

            </div>
        `;


        card.addEventListener("click", () => {

            window.location.href = `postBig.html?id=${post.firebaseId}`;

        });


        profilePostsGrid.appendChild(card);

    });

}


//ABRIR EDITAR PERFIL

editProfileBtn.addEventListener("click", ()=>{


    editName.value = datosUsuario.nombre || "";

    editBio.value = datosUsuario.bio || "";

    if(datosUsuario.foto){

        editPhotoPreview.src = datosUsuario.foto;

    }else{

        editPhotoPreview.src = "../imgs/icons/user.png";

    }

    modal.classList.add("activo");

});



//CERRAR EDITAR PERFIL

cancelEditBtn.addEventListener("click", ()=>{

    modal.classList.remove("activo");

});


//CAMBIAR FTO PERFIL

editPhoto.addEventListener("change", () => {

    const archivo = editPhoto.files[0];

    if(!archivo) return;

    const lector = new FileReader();

    lector.onload = (e) => {

        editPhotoPreview.src = e.target.result;

    };

    lector.readAsDataURL(archivo);

});


//BOTON QUE GUARDA CAMBIOS DEL PERFIL

saveEditBtn.addEventListener("click", guardarCambios);


//GUARDAR CAMBIOS DE EDITAR PERFIL

async function guardarCambios(){

    try{

        let fotoUrl = datosUsuario.foto;

        // Si el usuario ha elegido una foto nueva
        if(editPhoto.files.length > 0){

            fotoUrl = await subirImagen(editPhoto.files[0]);

        }

        // Actualizar Firestore
        await updateDoc(doc(db, "usuarios", auth.currentUser.uid), {

            nombre: editName.value.trim(),

            bio: editBio.value.trim(),

            foto: fotoUrl

        });


        const publicacionesQuery = query(
            collection(db, "publicaciones"),
            where("usuarioId", "==", auth.currentUser.uid)
        );

        const snapshot = await getDocs(publicacionesQuery);

        const batch = writeBatch(db);

        snapshot.forEach((documento) => {

            batch.update(documento.ref, {

                usuarioNombre: editName.value.trim(),
                usuarioFoto: fotoUrl

            });

        });

        await batch.commit();

        // Actualizar Authentication
        await updateProfile(auth.currentUser, {

            displayName: editName.value.trim(),

            photoURL: fotoUrl

        });

        // Actualizar datos guardados en memoria
        datosUsuario.nombre = editName.value.trim();
        datosUsuario.bio = editBio.value.trim();
        datosUsuario.foto = fotoUrl;

        // Actualizar la interfaz
        profileName.textContent = datosUsuario.nombre;
        profileBio.textContent = datosUsuario.bio || "Sin biografía.";

        if(fotoUrl){

            profilePhoto.src = fotoUrl;

        }

        modal.classList.remove("activo");

    }

    catch(error){

        console.error(error);

        alert("Ha ocurrido un error al guardar el perfil.");

    }

    const headerUsername = document.getElementById("header-username");

    if(headerUsername){

        headerUsername.textContent = datosUsuario.nombre;

    }

    const headerPhoto = document.getElementById("header-user");

    if(headerPhoto){

        headerPhoto.src = datosUsuario.foto || "../imgs/default-user.png";

    }

}



if (logoutBtn) {

    logoutBtn.addEventListener("click", cerrarSesion);

}


async function cerrarSesion() {

    try {

        await signOut(auth);

        window.location.href = "../index.html";

    } catch (error) {

        console.error(error);
        alert("No se pudo cerrar la sesión.");

    }

}