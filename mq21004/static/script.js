document.getElementById("contact-form").addEventListener("submit", function(e) {
    e.preventDefault();
    alert("✅ Tu mensaje ha sido enviado correctamente.");
    this.reset();
});
