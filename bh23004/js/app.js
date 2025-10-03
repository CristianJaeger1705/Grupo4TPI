const API_BASE = "/api";

const currentPage = location.pathname.includes("noticias")
  ? "noticias"
  : "herramientas";

if (currentPage === "noticias") {
  document
    .getElementById("noticia-form")
    .addEventListener("submit", submitNoticia);
  document
    .getElementById("noticia-cancel")
    .addEventListener("click", resetNoticiaForm);
  loadNoticias();
}

if (currentPage === "herramientas") {
  document
    .getElementById("herramienta-form")
    .addEventListener("submit", submitHerramienta);
  document
    .getElementById("herramienta-cancel")
    .addEventListener("click", resetHerramientaForm);
  loadHerramientas();
}

function showMessage(elId, text, isError = false) {
  const el = document.getElementById(elId);
  el.textContent = text;
  el.classList.remove("error", "ok");
  el.classList.add(isError ? "error" : "ok");
  el.style.display = "block";
  setTimeout(() => {
    el.style.display = "none";
  }, 3500);
}

async function loadNoticias() {
  try {
    const res = await fetch(`${API_BASE}/noticias`);
    const data = await res.json();
    const tbody = document.querySelector("#tabla-noticias tbody");
    tbody.innerHTML = "";
    data.forEach((n) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="display:none;">${n.id}</td>
        <td>${escapeHtml(n.titulo)}</td>
        <td>${escapeHtml(n.contenido)}</td>
        <td>
          <button class="action-btn edit" onclick="editNoticia('${n.id}')">Editar</button>
          <button class="action-btn delete" onclick="deleteNoticia('${n.id}')">Borrar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    showMessage(
      "noticia-mensaje",
      "Error cargando noticias: " + err.message,
      true,
    );
  }
}

async function submitNoticia(e) {
  e.preventDefault();
  const id = document.getElementById("noticia-id").value;
  const titulo = document.getElementById("noticia-titulo").value.trim();
  const contenido = document.getElementById("noticia-contenido").value.trim();
  if (!titulo || !contenido) {
    showMessage("noticia-mensaje", "Rellena todos los campos", true);
    return;
  }

  try {
    if (id) {
      const payload = { id: Number(id), titulo, contenido };
      const res = await fetch(`${API_BASE}/noticias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      showMessage("noticia-mensaje", "Noticia actualizada");
    } else {
      const payload = { titulo, contenido };
      const res = await fetch(`${API_BASE}/noticias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al crear");
      showMessage("noticia-mensaje", "Noticia creada");
    }
    resetNoticiaForm();
    loadNoticias();
  } catch (err) {
    showMessage("noticia-mensaje", "Error: " + err.message, true);
  }
}

function resetNoticiaForm() {
  document.getElementById("noticia-id").value = "";
  document.getElementById("noticia-titulo").value = "";
  document.getElementById("noticia-contenido").value = "";
  document.getElementById("noticia-submit").textContent = "Crear noticia";
}

async function editNoticia(id) {
  try {
    const res = await fetch(`${API_BASE}/noticias/${id}`);
    if (!res.ok) throw new Error("No encontrado");
    const n = await res.json();
    document.getElementById("noticia-id").value = n.id;
    document.getElementById("noticia-titulo").value = n.titulo;
    document.getElementById("noticia-contenido").value = n.contenido;
    document.getElementById("noticia-submit").textContent = "Guardar cambios";
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    showMessage(
      "noticia-mensaje",
      "Error al cargar noticia: " + err.message,
      true,
    );
  }
}

async function deleteNoticia(id) {
  if (!confirm("¿Seguro desea borrar esta noticia?")) return;
  try {
    const res = await fetch(`${API_BASE}/noticias/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("No se pudo borrar");
    showMessage("noticia-mensaje", "Noticia eliminada");
    loadNoticias();
  } catch (err) {
    showMessage("noticia-mensaje", "Error: " + err.message, true);
  }
}

async function loadHerramientas() {
  try {
    const res = await fetch(`${API_BASE}/herramientas`);
    const data = await res.json();
    const tbody = document.querySelector("#tabla-herramientas tbody");
    tbody.innerHTML = "";
    data.forEach((h) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="display:none;">${h.id}</td>
        <td>${escapeHtml(h.nombre)}</td>
        <td>${escapeHtml(h.descripcion)}</td>
        <td>
          <button class="action-btn edit" onclick="editHerramienta('${h.id}')">Editar</button>
          <button class="action-btn delete" onclick="deleteHerramienta('${h.id}')">Borrar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    showMessage(
      "herramienta-mensaje",
      "Error cargando herramientas: " + err.message,
      true,
    );
  }
}

async function submitHerramienta(e) {
  e.preventDefault();
  const id = document.getElementById("herramienta-id").value;
  const nombre = document.getElementById("herramienta-nombre").value.trim();
  const descripcion = document
    .getElementById("herramienta-descripcion")
    .value.trim();
  if (!nombre || !descripcion) {
    showMessage("herramienta-mensaje", "Rellena todos los campos", true);
    return;
  }

  try {
    if (id) {
      const payload = { id: Number(id), nombre, descripcion };
      const res = await fetch(`${API_BASE}/herramientas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      showMessage("herramienta-mensaje", "Herramienta actualizada");
    } else {
      const payload = { nombre, descripcion };
      const res = await fetch(`${API_BASE}/herramientas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al crear");
      showMessage("herramienta-mensaje", "Herramienta creada");
    }
    resetHerramientaForm();
    loadHerramientas();
  } catch (err) {
    showMessage("herramienta-mensaje", "Error: " + err.message, true);
  }
}

function resetHerramientaForm() {
  document.getElementById("herramienta-id").value = "";
  document.getElementById("herramienta-nombre").value = "";
  document.getElementById("herramienta-descripcion").value = "";
  document.getElementById("herramienta-submit").textContent =
    "Crear herramienta";
}

async function editHerramienta(id) {
  try {
    const res = await fetch(`${API_BASE}/herramientas/${id}`);
    if (!res.ok) throw new Error("No encontrado");
    const h = await res.json();
    document.getElementById("herramienta-id").value = h.id;
    document.getElementById("herramienta-nombre").value = h.nombre;
    document.getElementById("herramienta-descripcion").value = h.descripcion;
    document.getElementById("herramienta-submit").textContent =
      "Guardar cambios";
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    showMessage(
      "herramienta-mensaje",
      "Error al cargar herramienta: " + err.message,
      true,
    );
  }
}

async function deleteHerramienta(id) {
  if (!confirm("¿Seguro desea borrar esta herramienta?")) return;
  try {
    const res = await fetch(`${API_BASE}/herramientas/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("No se pudo borrar");
    showMessage("herramienta-mensaje", "Herramienta eliminada");
    loadHerramientas();
  } catch (err) {
    showMessage("herramienta-mensaje", "Error: " + err.message, true);
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        m
      ],
  );
}
