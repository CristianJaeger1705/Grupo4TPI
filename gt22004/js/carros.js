const API = "/api/carros";
const API_MARCAS = "/api/marcas";
const lista = document.getElementById("listaCarros");
const form = document.getElementById("formCarro");
let carroEditandoId = null; 

async function cargarCarros() {
  lista.innerHTML = "";
  try {
    const res = await fetch(API);
    const carros = await res.json();
    carros.forEach(c => {
      const li = document.createElement("li");
      
      
      li.textContent = `${c.marca} ${c.modelo} (${c.anio}) - ${c.tipo}`;
      
      // Botón editar
      const btnEditar = document.createElement("button");
      btnEditar.textContent = "✏️";
      btnEditar.title = "Editar carro";
      btnEditar.addEventListener("click", () => {
        document.getElementById("marca").value = c.marca;
        document.getElementById("modelo").value = c.modelo;
        document.getElementById("anio").value = c.anio;
        document.getElementById("tipo").value = c.tipo;
        carroEditandoId = c.id; 
      });

      // Botón eliminar
      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "🗑️";
      btnEliminar.title = "Eliminar carro";
      btnEliminar.addEventListener("click", async () => {
        if (confirm(`¿Estás seguro de eliminar el ${c.marca} ${c.modelo}?`)) {
          await fetch(`${API}/${c.id}`, { method: "DELETE" });
          cargarCarros();
        }
      });

      li.appendChild(btnEditar);
      li.appendChild(btnEliminar);
      lista.appendChild(li);
    });
  } catch (err) {
    console.error("Error cargando carros:", err);
  }
}
async function cargarMarcas() {
  const selectMarca = document.getElementById("marca");
  try {
    const res = await fetch(API_MARCAS);
    const marcas = await res.json();

    // Limpiar opciones y agregar por defecto
    selectMarca.innerHTML = `<option value="">🏭 Seleccione la marca</option>`;

    // Insertar marcas dinámicamente
    marcas.forEach(m => {
      const option = document.createElement("option");
      option.value = m.nombre; // depende de tu API (puede ser m.id)
      option.textContent = m.nombre;
      selectMarca.appendChild(option);
    });
  } catch (err) {
    console.error("Error cargando marcas:", err);
  }
}
form.addEventListener("submit", async e => {
  e.preventDefault();
  const marca = document.getElementById("marca").value.trim();
  const modelo = document.getElementById("modelo").value.trim();
  const anio = parseInt(document.getElementById("anio").value);
  const tipo = document.getElementById("tipo").value.trim();
  
  // Validaciones
  if (!marca || !modelo || !anio || !tipo) {
    return alert("Complete todos los campos.");
  }
  
  if (anio < 1900 || anio > 2030) {
    return alert("El año debe estar entre 1900 y 2030.");
  }

  try {
    const carroData = { marca, modelo, anio, tipo };
    
    if (carroEditandoId) {
      // Editar carro existente
      await fetch(`${API}/${carroEditandoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carroData)
      });
      carroEditandoId = null; 
    } else {
      // Agregar nuevo carro
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carroData) 
      });
    }
    form.reset();
    cargarCarros();
  } catch (err) {
    console.error("Error agregando o editando carro:", err);
  }
});

// Cargar carros al inicio
cargarCarros();
cargarMarcas();