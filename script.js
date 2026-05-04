// 1. CONFIGURACIÓN DE FIREBASE (Mantén tus datos aquí)
const firebaseConfig = {
    // ... tus datos de apiKey, etc.
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// USAMOS UN EVENTO PARA ASEGURARNOS QUE EL HTML CARGÓ
window.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('contenedor-numeros');
    const telefono = "543424494674"; 
    const alias = " ESTE ES MI ALIAS: alpes .cero .duque .mp";

    let seleccionados = [];

    // 2. Escuchar la base de datos
    database.ref('vendidos').on('value', (snapshot) => {
        const numerosComprados = snapshot.val() || [];
        // Pasamos el contenedor como argumento para que la función lo encuentre siempre
        renderizarTablero(numerosComprados, contenedor, seleccionados);
    });
});

function renderizarTablero(comprados) {
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
            // Si el número ya está en nuestra selección temporal, lo pintamos
            if (seleccionados.includes(i)) {
                boton.classList.add('seleccionado'); // Asegúrate de tener este estilo en tu CSS
                boton.style.backgroundColor = "#ffc107"; // Color amarillo de selección
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
        // Si ya estaba, lo quitamos
        seleccionados.splice(index, 1);
        elemento.style.backgroundColor = ""; // Vuelve al color original
        elemento.classList.remove('seleccionado');
    } else {
        // Si no estaba, lo agregamos
        seleccionados.push(id);
        elemento.style.backgroundColor = "#ffc107"; // Color amarillo de "marcado"
        elemento.classList.add('seleccionado');
    }
    actualizarBotonFlotante();
}

// Crea o actualiza un botón para finalizar la compra
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
    const total = seleccionados.length * 4000;

    const confirmar = confirm(`¿Quieres comprar los números: ${listaNumeros}?\nTotal: $${total}`);
    
    if (confirmar) {
        // Redirección a WhatsApp con todos los números
        const mensaje = `¡Hola! Quiero los números: ${listaNumeros}. Total a pagar: $${total}. Envia el comprovante con tu nombre, gracias por tu compra!!! Mucha suerte!!!! ${alias}`;
        window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');

        // Guardar todos en Firebase
        database.ref('vendidos').once('value', (snapshot) => {
            let actual = snapshot.val() || [];
            
            seleccionados.forEach(num => {
                if (!actual.includes(num)) {
                    actual.push(num);
                }
            });

            database.ref('vendidos').set(actual).then(() => {
                seleccionados = []; // Limpiamos la selección tras la compra
                alert("Reserva enviada con éxito.");
            });
        });
    }
}