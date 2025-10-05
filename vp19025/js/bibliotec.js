// Biblioteca Digital - Gestor de Libros
// CRUD contra: http://localhost:3000/libros

const URL_API = '/api/libros';
let libros = [];
let ordenPrecio = 0; // 0=original, 1=ascendente, -1=descendente

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', function() {
    cargarLibros();
    configurarEventos();
});

function configurarEventos() {
    // Formulario
    document.getElementById('formulario-libro').addEventListener('submit', guardarLibro);
    document.getElementById('boton-cancelar').addEventListener('click', resetearFormulario);
    
    // Filtros
    document.querySelectorAll('.checkboxes-genero input').forEach(checkbox => {
        checkbox.addEventListener('change', aplicarFiltros);
    });
    
    // Ordenamiento
    document.getElementById('encabezado-precio').addEventListener('click', alternarOrdenPrecio);
}

// --- OBTENER Y LISTAR LIBROS ---
function cargarLibros() {
    fetch(URL_API)
        .then(respuesta => {
            if (!respuesta.ok) throw new Error('Error en la red');
            return respuesta.json();
        })
        .then(datos => {
            libros = datos.map(libro => ({
                ...libro,
                precio: parseFloat(libro.precio) || 0,
                id: parseInt(libro.id) || libro.id
            }));
            mostrarLibros(libros);
            actualizarContador();
        })
        .catch(error => {
            console.error('Error obteniendo libros:', error);
            mostrarAlerta('Error al cargar los libros: ' + error.message, 'error');
        });
}

function mostrarLibros(listaLibros) {
    const cuerpoTabla = document.getElementById('cuerpo-tabla');
    cuerpoTabla.innerHTML = '';

    // Aplicar ordenamiento si es necesario
    let librosOrdenados = [...listaLibros];
    if (ordenPrecio === 1) {
        librosOrdenados.sort((a, b) => a.precio - b.precio);
    } else if (ordenPrecio === -1) {
        librosOrdenados.sort((a, b) => b.precio - a.precio);
    }

    librosOrdenados.forEach(libro => {
        const fila = document.createElement('tr');
        fila.className = `g-${libro.genero || 'ficcion'}`;

        fila.innerHTML = `
            <td class="id-libro">${libro.id}</td>
            <td class="celda-portada">
                <img src="${libro.portada || 'https://via.placeholder.com/80x100/2c3e50/ecf0f1?text=📚'}" 
                     alt="Portada de ${escaparHTML(libro.titulo)}" 
                     class="portada-libro" 
                     onclick="ampliarPortada('${libro.portada || ''}')">
            </td>
            <td class="precio-libro">€${Number(libro.precio).toFixed(2)}</td>
            <td class="titulo-libro">${escaparHTML(libro.titulo)}</td>
            <td class="autor-libro">${escaparHTML(libro.autor || '')}</td>
            <td class="sinopsis-libro">${escaparHTML(libro.descripcion || '')}</td>
            <td class="genero-libro">${obtenerIconoGenero(libro.genero)} ${escaparHTML(libro.genero || 'ficcion')}</td>
            <td class="acciones-libro">
                <button class="boton-editar" onclick="editarLibro(${libro.id})">
                    ✏️ Editar
                </button>
                <button class="boton-eliminar" onclick="eliminarLibro(${libro.id})">
                    🗑️ Eliminar
                </button>
            </td>
        `;
        cuerpoTabla.appendChild(fila);
    });

    actualizarEncabezadoPrecio();
}

function obtenerIconoGenero(genero) {
    const iconos = {
        'ficcion': '📖',
        'no-ficcion': '📚',
        'ciencia': '🔬',
        'historia': '🏛️',
        'fantasia': '🐉',
        'romance': '💖',
        'terror': '👻',
        'biografia': '👤'
    };
    return iconos[genero] || '📖';
}

// --- CRUD: GUARDAR Y ACTUALIZAR ---
function guardarLibro(evento) {
    evento.preventDefault();
    
    const idLibro = document.getElementById('id-libro').value;
    const datosLibro = {
        titulo: document.getElementById('titulo').value.trim(),
        autor: document.getElementById('autor').value.trim(),
        precio: parseFloat(document.getElementById('precio').value) || 0,
        descripcion: document.getElementById('descripcion').value.trim(),
        portada: document.getElementById('portada').value.trim(),
        genero: document.getElementById('genero').value
    };

    // Validaciones
    if (!datosLibro.titulo || !datosLibro.autor) {
        mostrarAlerta('El título y autor son obligatorios', 'advertencia');
        return;
    }

    if (datosLibro.precio < 0) {
        mostrarAlerta('El precio no puede ser negativo', 'advertencia');
        return;
    }

    if (!idLibro) {
        // CREAR NUEVO LIBRO
        crearLibro(datosLibro);
    } else {
        // ACTUALIZAR LIBRO EXISTENTE
        actualizarLibro(idLibro, datosLibro);
    }
}

function crearLibro(datosLibro) {
    // Generar ID incremental
    const nuevoId = obtenerSiguienteId();
    datosLibro.id = nuevoId;

    fetch(URL_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosLibro)
    })
    .then(respuesta => {
        if (!respuesta.ok) throw new Error('Error en la creación');
        return respuesta.json();
    })
    .then(libroCreado => {
        mostrarAlerta(`Libro "${libroCreado.titulo}" creado exitosamente (ID: ${libroCreado.id})`, 'exito');
        cargarLibros();
        resetearFormulario();
    })
    .catch(error => {
        console.error('Error creando libro:', error);
        mostrarAlerta('Error al crear el libro: ' + error.message, 'error');
    });
}

function actualizarLibro(id, datosLibro) {
    datosLibro.id = parseInt(id);

    fetch(`${URL_API}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosLibro)
    })
    .then(respuesta => {
        if (!respuesta.ok) throw new Error('Error en la actualización');
        return respuesta.json();
    })
    .then(() => {
        mostrarAlerta(`Libro "${datosLibro.titulo}" actualizado exitosamente`, 'exito');
        cargarLibros();
        resetearFormulario();
    })
    .catch(error => {
        console.error('Error actualizando libro:', error);
        mostrarAlerta('Error al actualizar el libro: ' + error.message, 'error');
    });
}

function editarLibro(id) {
    const libro = libros.find(l => l.id == id);
    if (!libro) {
        mostrarAlerta('Libro no encontrado', 'error');
        return;
    }

    // Llenar formulario con datos del libro
    document.getElementById('id-libro').value = libro.id;
    document.getElementById('titulo').value = libro.titulo;
    document.getElementById('autor').value = libro.autor || '';
    document.getElementById('precio').value = libro.precio;
    document.getElementById('descripcion').value = libro.descripcion || '';
    document.getElementById('portada').value = libro.portada || '';
    document.getElementById('genero').value = libro.genero || 'ficcion';

    // Actualizar interfaz
    document.getElementById('titulo-formulario').textContent = `✏️ Editando: ${libro.titulo}`;
    document.getElementById('boton-guardar').innerHTML = '💾 Actualizar Libro';
    
    // Scroll al formulario
    document.getElementById('seccion-formulario').scrollIntoView({ 
        behavior: 'smooth' 
    });

    mostrarAlerta(`Editando libro: "${libro.titulo}"`, 'info');
}

function eliminarLibro(id) {
    const libro = libros.find(l => l.id == id);
    if (!libro) {
        mostrarAlerta('Libro no encontrado', 'error');
        return;
    }

    if (!confirm(`¿Estás seguro de que quieres eliminar el libro "${libro.titulo}"?`)) {
        return;
    }

    fetch(`${URL_API}/${id}`, {
        method: 'DELETE'
    })
    .then(respuesta => {
        if (respuesta.ok || respuesta.status === 200) {
            mostrarAlerta(`Libro "${libro.titulo}" eliminado exitosamente`, 'exito');
            cargarLibros();
        } else if (respuesta.status === 404) {
            mostrarAlerta('El libro no existe en el servidor', 'error');
        } else {
            throw new Error('Error en el servidor');
        }
    })
    .catch(error => {
        console.error('Error eliminando libro:', error);
        mostrarAlerta('Error al eliminar el libro: ' + error.message, 'error');
    });
}

// --- FUNCIONALIDADES AUXILIARES ---
function obtenerSiguienteId() {
    if (libros.length === 0) return 1;
    
    const idsNumericos = libros
        .map(libro => parseInt(libro.id))
        .filter(id => !isNaN(id));
    
    if (idsNumericos.length === 0) return 1;
    
    return Math.max(...idsNumericos) + 1;
}

function alternarOrdenPrecio() {
    ordenPrecio = ordenPrecio === 1 ? -1 : 1;
    mostrarLibros(libros);
}

function actualizarEncabezadoPrecio() {
    const encabezado = document.getElementById('encabezado-precio');
    let texto = 'Precio ($)';
    let color = '';
    
    if (ordenPrecio === 1) {
        texto = 'Precio ($) ↑';
        color = '#27ae60';
    } else if (ordenPrecio === -1) {
        texto = 'Precio ($) ↓';
        color = '#e74c3c';
    }
    
    encabezado.textContent = texto;
    encabezado.style.color = color;
}

function aplicarFiltros() {
    // Los filtros se aplican via CSS con las clases de género
    // Esta función asegura que se recargue la visualización
    mostrarLibros(libros);
}

function resetearFormulario() {
    document.getElementById('formulario-libro').reset();
    document.getElementById('id-libro').value = '';
    document.getElementById('titulo-formulario').textContent = '📖 Agregar Nuevo Libro';
    document.getElementById('boton-guardar').innerHTML = '💾 Guardar Libro';
}

function ampliarPortada(urlPortada) {
    if (urlPortada && urlPortada !== 'https://via.placeholder.com/80x100/2c3e50/ecf0f1?text=📚') {
        window.open(urlPortada, '_blank');
    } else {
        mostrarAlerta('No hay portada disponible para este libro', 'info');
    }
}

function actualizarContador() {
    const contador = document.getElementById('contador-total');
    contador.textContent = `Total: ${libros.length} libro${libros.length !== 1 ? 's' : ''}`;
}

// --- UTILITARIOS ---
function escaparHTML(texto) {
    const mapa = { 
        '&': '&amp;', 
        '<': '&lt;', 
        '>': '&gt;', 
        '"': '&quot;', 
        "'": '&#039;' 
    };
    return String(texto || '').replace(/[&<>"']/g, caracter => mapa[caracter]);
}

function mostrarAlerta(mensaje, tipo = 'info') {
    const estilos = {
        exito: { background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
        error: { background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' },
        advertencia: { background: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' },
        info: { background: '#d1ecf1', color: '#0c5460', border: '1px solid #bee5eb' }
    };

    const estilo = estilos[tipo] || estilos.info;
    
    // Crear alerta temporal
    const alerta = document.createElement('div');
    alerta.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
        max-width: 400px;
        background: ${estilo.background};
        color: ${estilo.color};
        border: ${estilo.border};
    `;
    alerta.textContent = mensaje;
    
    document.body.appendChild(alerta);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        alerta.style.opacity = '0';
        alerta.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (alerta.parentNode) {
                alerta.parentNode.removeChild(alerta);
            }
        }, 300);
    }, 5000);
}