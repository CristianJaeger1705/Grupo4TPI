const API = "/api/marcas";
const lista = document.getElementById("listaMarcas");
const form = document.getElementById("formMarca");
let marcaEditandoId = null; 

async function cargarMarcas() {
  lista.innerHTML = "";
  try {
    const res = await fetch(API);
    const marcas = await res.json();
    marcas.forEach(m => {
      const li = document.createElement("li");
      li.textContent = `${m.nombre} (${m.pais})`;
      
      // Botón editar
      const btnEditar = document.createElement("button");
      btnEditar.textContent = "✏️";
      btnEditar.title = "Editar marca";
      btnEditar.addEventListener("click", () => {
        document.getElementById("nombre").value = m.nombre;
        document.getElementById("pais").value = m.pais;
        marcaEditandoId = m.id; 
      });

      // Botón eliminar
      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "🗑️";
      btnEliminar.title = "Eliminar marca";
      btnEliminar.addEventListener("click", async () => {
        if (confirm(`¿Estás seguro de eliminar la marca ${m.nombre}?`)) {
          await fetch(`${API}/${m.id}`, { method: "DELETE" });
          cargarMarcas();
        }
      });

      li.appendChild(btnEditar);
      li.appendChild(btnEliminar);
      lista.appendChild(li);
    });
  } catch (err) {
    console.error("Error cargando marcas:", err);
  }
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const pais = document.getElementById("pais").value.trim();
  if (!nombre || !pais) return alert("Complete todos los campos.");

  try {
    if (marcaEditandoId) {
      // Editar marca existente
      await fetch(`${API}/${marcaEditandoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, pais })
      });
      marcaEditandoId = null; 
    } else {
      // Agregar nueva marca
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, pais }) 
      });
    }
    form.reset();
    cargarMarcas();
  } catch (err) {
    console.error("Error agregando o editando marca:", err);
  }
});

// Cargar marcas al inicio
cargarMarcas();