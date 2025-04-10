document.addEventListener('DOMContentLoaded', function() {
    // Seleccionar todos los botones que abren modales
    const modalBtns = document.querySelectorAll('.modal-btn');
    const modals = document.querySelectorAll('.modal');
    const closeBtns = document.querySelectorAll('.close-modal');
    
    // Función para abrir modal
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Previene el scroll
    }
    
    // Función para cerrar modal
    function closeModal() {
        modals.forEach(modal => {
            modal.classList.remove('show');
        });
        document.body.style.overflow = 'auto'; // Restaura el scroll
    }
    
    // Asignar eventos a los botones
    modalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            openModal(modalId);
        });
    });
    
    // Cerrar al hacer clic en la X
    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Cerrar al hacer clic fuera del modal
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    });
    
    // Cerrar con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});