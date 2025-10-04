 // crud.js
document.addEventListener("DOMContentLoaded", () => {
    const apiURL = "http://172.22.168.64:3000/empresas"; // Cambia IP si es necesario

    const form = document.getElementById("empresaForm");
    const tabla = document.getElementById("tablaEmpresas");

    const nombreInput = document.getElementById("nombre");
    const sectorInput = document.getElementById("sector");
    const correoInput = document.getElementById("correo");
    const telefonoInput = document.getElementById("telefono");

    let editandoId = null;

    // Función para renderizar la tabla
    async function renderTabla() {
        try {
            const res = await fetch(apiURL);
            const empresas = await res.json();

            tabla.innerHTML = "";
            empresas.forEach((empresa) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${empresa.id}</td>
                    <td>${empresa.nombre}</td>
                    <td>${empresa.sector}</td>
                    <td>${empresa.correo}</td>
                    <td>${empresa.telefono}</td>
                    <td>
                        <button class="btn-eliminar" data-id="${empresa.id}">Eliminar</button>
                        <button class="btn-editar" data-id="${empresa.id}">Editar</button>
                    </td>
                `;
                tabla.appendChild(row);
            });

            agregarListenersBotones();
        } catch (error) {
            console.error("Error al cargar empresas:", error);
        }
    }

    // Agregar eventos a los botones generados dinámicamente
    function agregarListenersBotones() {
        document.querySelectorAll(".btn-eliminar").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                if (confirm("¿Estás seguro de eliminar esta empresa?")) {
                    try {
                        const res = await fetch(`${apiURL}/${id}`, { method: "DELETE" });
                        if (!res.ok) throw new Error("Error al eliminar");
                        renderTabla();
                    } catch (error) {
                        console.error("Error al eliminar:", error);
                        alert("No se pudo eliminar la empresa.");
                    }
                }
            });
        });

        document.querySelectorAll(".btn-editar").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                try {
                    const res = await fetch(`${apiURL}/${id}`);
                    const empresa = await res.json();

                    nombreInput.value = empresa.nombre;
                    sectorInput.value = empresa.sector;
                    correoInput.value = empresa.correo;
                    telefonoInput.value = empresa.telefono;

                    editandoId = id;
                } catch (error) {
                    console.error("Error al editar:", error);
                    alert("No se pudo cargar la empresa para editar.");
                }
            });
        });
    }

    // Enviar formulario (crear o actualizar)
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nuevaEmpresa = {
            nombre: nombreInput.value,
            sector: sectorInput.value,
            correo: correoInput.value,
            telefono: telefonoInput.value,
        };

        try {
            if (editandoId) {
                // Editar existente
                const res = await fetch(`${apiURL}/${editandoId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(nuevaEmpresa),
                });

                if (!res.ok) throw new Error("Error al editar");
                editandoId = null;
            } else {
                // Crear nuevo
                const res = await fetch(apiURL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(nuevaEmpresa),
                });

                if (!res.ok) throw new Error("Error al guardar");
            }

            form.reset();
            renderTabla();
        } catch (error) {
            console.error("Error al guardar o editar:", error);
            alert("Ocurrió un error al guardar los datos.");
        }
    });

    // Inicial
    renderTabla();
});
