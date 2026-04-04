// 1. TU CONFIGURACIÓN DE FIREBASE (Copia y pega la tuya aquí)
// 1. Configuración de tu Firebase (Asegúrate que estos datos coincidan con tu consola)
const firebaseConfig = {
    apiKey: "AIzaSyBoI8JmEQCiYd6CcZ6mzWcW394RKlbWc_o",
    authDomain: "sorteo-100.firebaseapp.com",
    projectId: "sorteo-100",
    storageBucket: "sorteo-100.firebasestorage.app",
    messagingSenderId: "137713988986",
    appId: "1:137713988986:web:380b74f6803569af7d12c3",
    measurementId: "G-S3VZ8PG06V",
    // PEGA AQUÍ LA URL DE TU IMAGEN:
    databaseURL: "https://sorteo-100-default-rtdb.firebaseio.com" 
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const contenedor = document.getElementById('contenedor-numeros');
const telefono = "543424494674"; // Pon tu número real aquí
const alias = "alpes.cero.duque.mp";

// 2. Escuchar la base de datos en tiempo real
database.ref('vendidos').on('value', (snapshot) => {
    const numerosComprados = snapshot.val() || [];
    renderizarTablero(numerosComprados);
});

function renderizarTablero(comprados) {
    contenedor.innerHTML = ""; // Limpiar antes de dibujar

    for (let i = 0; i < 100; i++) {
        const boton = document.createElement('div');
        boton.classList.add('numero-card');
        const numStr = i.toString().padStart(2, '0');
        boton.innerText = numStr;

        // Si el número está en la lista de vendidos de Firebase
        if (comprados.includes(i)) {
            boton.classList.add('vendido');
            boton.onclick = () => alert("Este número ya fue reservado.");
        } else {
            boton.onclick = () => confirmarCompra(i, numStr);
        }
        contenedor.appendChild(boton);
    }
}

function confirmarCompra(id, numStr) {
    const confirmar = confirm(`¿Quieres comprar el número ${numStr}?`);
    
    if (confirmar) {
        // Redirección a WhatsApp
        const mensaje = `Hola! Quiero el número ${numStr}. El valor es $1.000. Mi alias es ${alias}`;
        window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');

        // Guardar en Firebase (esto bloquea el número para todos)
        database.ref('vendidos').once('value', (snapshot) => {
            let actual = snapshot.val() || [];
            if (!actual.includes(id)) {
                actual.push(id);
                database.ref('vendidos').set(actual);
            }
        });
    }
}