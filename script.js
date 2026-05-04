// 1. CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyBoI8JmEQCiYd6CcZ6mzWcW394RKlbWc_o",
    authDomain: "sorteo-100.firebaseapp.com",
    projectId: "sorteo-100",
    storageBucket: "sorteo-100.firebasestorage.app",
    messagingSenderId: "137713988986",
    appId: "1:137713988986:web:380b74f6803569af7d12c3",
    measurementId: "G-S3VZ8PG06V",
    databaseURL: "https://sorteo-100-default-rtdb.firebaseio.com" 
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Variables globales
let contenedor; 
const telefono = "543424494674"; 
const alias = "A este ALIAS:(alpes .cero .duque .mp), asi queda tu pago registrado para reclamar tu premio, gracias por tu colaboración.";
let seleccionados = [];




// ESPERAR A QUE EL HTML ESTÉ TOTALMENTE CARGADO
window.addEventListener('DOMContentLoaded', () => {
    // RECIÉN AQUÍ buscamos el contenedor
    contenedor = document.getElementById('contenedor-numeros');

    
    
    
    
    
    
    // Escuchar la base de datos en tiempo real
    database.ref('vendidos').on('value', (snapshot) => {
        const numerosComprados = snapshot.val() || [];
        renderizarTablero(numerosComprados);
    });
});

function renderizarTablero(comprados) {
    if (!contenedor) return; 
    contenedor.innerHTML = ""; 

    for (let i = 0; i < 100; i++) {
        const boton = document.createElement('div');
        boton.classList.add('numero-card');
        const numStr = i.toString().padStart(2, '0');
        boton.innerText = numStr;

        if (comprados.includes(i)) {
            boton.classList.add('vendido');
            boton.onclick = () => alert("Este número ya fue reservado.");
        } else {
            if (seleccionados.includes(i)) {
                boton.classList.add('seleccionado');
                boton.style.backgroundColor = "#ffc107"; 
            }
            boton.onclick = () => alternarSeleccion(i, boton);
        }
        contenedor.appendChild(boton);
    }
    actualizarBotonFlotante();
}

function alternarSeleccion(id, elemento) {
    const index = seleccionados.indexOf(id);
    if (index > -1) {
        seleccionados.splice(index, 1);
        elemento.style.backgroundColor = ""; 
        elemento.classList.remove('seleccionado');
    } else {
        seleccionados.push(id);
        elemento.style.backgroundColor = "#ffc107"; 
        elemento.classList.add('seleccionado');
    }
    actualizarBotonFlotante();
}

function actualizarBotonFlotante() {
    let btnComprar = document.getElementById('btn-confirmar-multi');
    if (seleccionados.length > 0) {
        if (!btnComprar) {
            btnComprar = document.createElement('button');
            btnComprar.id = 'btn-confirmar-multi';
            btnComprar.style.cssText = "position:fixed; bottom:20px; right:20px; padding:15px 25px; background:#25d366; color:white; border:none; border-radius:50px; font-weight:bold; cursor:pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3); z-index:1000;";
            document.body.appendChild(btnComprar);
        }
        btnComprar.innerText = `Comprar ${seleccionados.length} número(s)`;
        btnComprar.onclick = finalizarCompraMultiple;
        btnComprar.style.display = "block";
    } else if (btnComprar) {
        btnComprar.style.display = "none";
    }
}

function finalizarCompraMultiple() {
    const listaNumeros = seleccionados.map(n => n.toString().padStart(2, '0')).join(', ');
    const total = seleccionados.length * 10000; // ACTUALIZADO A 6000

    const confirmar = confirm(`¿Quieres comprar los números: ${listaNumeros}?\nTotal: $${total}`);
    if (confirmar) {
        const mensaje = `Este Mensaje es Generado automaticamente para registrar tus números elegidos: ${listaNumeros}. Total a pagar: $${total}. Envía el comprobante con tu nombre. ${alias}`;
        window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');

        database.ref('vendidos').once('value', (snapshot) => {
            let actual = snapshot.val() || [];
            seleccionados.forEach(num => {
                if (!actual.includes(num)) actual.push(num);
            });

            database.ref('vendidos').set(actual).then(() => {
                seleccionados = []; 
                alert("Reserva enviada con éxito.");
                actualizarBotonFlotante();
            });
        });
    }
}