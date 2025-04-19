document.addEventListener('DOMContentLoaded', function() {
    
    const purpleButtons = document.querySelectorAll('.btn-purple');
    purpleButtons.forEach(btn => {
        btn.classList.add('btn');
        btn.style.backgroundColor = '#9b59b6';
        btn.style.borderColor = '#9b59b6';
        btn.style.color = 'white';
        
        btn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#8e44ad';
            this.style.borderColor = '#8e44ad';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#9b59b6';
            this.style.borderColor = '#9b59b6';
        });
    });
});


// Variables globales para la base de datos
let db;
const DB_NAME = "EscuelaDB";
const DB_VERSION = 1;

// Inicializar la base de datos al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    initDB();
    
    // Configurar eventos de los formularios
    document.getElementById('docenteForm').addEventListener('submit', guardarDocente);
    document.getElementById('estudianteForm').addEventListener('submit', guardarEstudiante);
    document.getElementById('materiaForm').addEventListener('submit', guardarMateria);
    document.getElementById('cursoForm').addEventListener('submit', guardarCurso);
    
    // Cargar datos al abrir los modales
    document.getElementById('docentesModal').addEventListener('shown.bs.modal', cargarDocentes);
    document.getElementById('estudiantesModal').addEventListener('shown.bs.modal', cargarEstudiantes);
    document.getElementById('materiasModal').addEventListener('shown.bs.modal', cargarMaterias);
    document.getElementById('cursosModal').addEventListener('shown.bs.modal', cargarCursos);
});

// Inicializar la base de datos
function initDB() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = function(event) {
        console.error("Error al abrir la base de datos:", event.target.error);
    };
    
    request.onsuccess = function(event) {
        db = event.target.result;
        console.log("Base de datos abierta con éxito");
    };
    
    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        
        // Crear object store para Docentes
        const docentesStore = db.createObjectStore("docentes", { keyPath: "id", autoIncrement: true });
        docentesStore.createIndex("carnet", "carnet", { unique: true });
        
        // Crear object store para Estudiantes
        const estudiantesStore = db.createObjectStore("estudiantes", { keyPath: "id", autoIncrement: true });
        estudiantesStore.createIndex("codigoRude", "codigoRude", { unique: true });
        estudiantesStore.createIndex("carnet", "carnet", { unique: true });
        
        // Crear object store para Materias
        const materiasStore = db.createObjectStore("materias", { keyPath: "id", autoIncrement: true });
        materiasStore.createIndex("codigo", "codigo", { unique: true });
        
        // Crear object store para Cursos
        const cursosStore = db.createObjectStore("cursos", { keyPath: "id", autoIncrement: true });
        cursosStore.createIndex("grado_paralelo", ["grado", "paralelo"], { unique: true });
        
        console.log("Estructura de la base de datos creada");
    };
}

// Funciones CRUD para Docentes
function guardarDocente(e) {
    e.preventDefault();
    
    const docente = {
        carnet: document.getElementById('docenteCarnet').value,
        paterno: document.getElementById('docentePaterno').value,
        materno: document.getElementById('docenteMaterno').value,
        nombres: document.getElementById('docenteNombres').value,
        cargo: document.getElementById('docenteCargo').value,
        fechaRegistro: new Date().toISOString(),
        fechaModificacion: new Date().toISOString(),
        estado: document.getElementById('docenteEstado').value,
        observacion: document.getElementById('docenteObservacion').value
    };
    
    const id = document.getElementById('docenteId').value;
    const transaction = db.transaction(["docentes"], "readwrite");
    const store = transaction.objectStore("docentes");
    
    if (id) {
        docente.id = parseInt(id);
        const request = store.put(docente);
        
        request.onsuccess = function() {
            cargarDocentes();
            limpiarFormDocente();
        };
    } else {
        const request = store.add(docente);
        
        request.onsuccess = function() {
            cargarDocentes();
            limpiarFormDocente();
        };
    }
}

function cargarDocentes() {
    const transaction = db.transaction(["docentes"], "readonly");
    const store = transaction.objectStore("docentes");
    const request = store.getAll();
    
    request.onsuccess = function() {
        const docentes = request.result;
        const tbody = document.getElementById('docentesTableBody');
        tbody.innerHTML = '';
        
        docentes.forEach(docente => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${docente.carnet}</td>
                <td>${docente.paterno}</td>
                <td>${docente.materno}</td>
                <td>${docente.nombres}</td>
                <td>${docente.cargo}</td>
                <td>${docente.estado}</td>
                <td>${docente.observacion || ''}</td>
                <td>${new Date(docente.fechaRegistro).toLocaleDateString()}</td>
                <td>${new Date(docente.fechaModificacion).toLocaleDateString()}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="editarDocente(${docente.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarDocente(${docente.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };
}

function editarDocente(id) {
    const transaction = db.transaction(["docentes"], "readonly");
    const store = transaction.objectStore("docentes");
    const request = store.get(id);
    
    request.onsuccess = function() {
        const docente = request.result;
        
        document.getElementById('docenteId').value = docente.id;
        document.getElementById('docenteCarnet').value = docente.carnet;
        document.getElementById('docentePaterno').value = docente.paterno;
        document.getElementById('docenteMaterno').value = docente.materno;
        document.getElementById('docenteNombres').value = docente.nombres;
        document.getElementById('docenteCargo').value = docente.cargo;
        document.getElementById('docenteEstado').value = docente.estado;
        document.getElementById('docenteObservacion').value = docente.observacion;
    };
}

function eliminarDocente(id) {
    if (confirm('¿Está seguro de eliminar este docente?')) {
        const transaction = db.transaction(["docentes"], "readwrite");
        const store = transaction.objectStore("docentes");
        const request = store.delete(id);
        
        request.onsuccess = function() {
            cargarDocentes();
        };
    }
}

function limpiarFormDocente() {
    document.getElementById('docenteForm').reset();
    document.getElementById('docenteId').value = '';
}

// Funciones CRUD para Estudiantes
function guardarEstudiante(e) {
    e.preventDefault();
    
    const estudiante = {
        codigoRude: document.getElementById('estudianteCodigoRude').value,
        carnet: document.getElementById('estudianteCarnet').value,
        paterno: document.getElementById('estudiantePaterno').value,
        materno: document.getElementById('estudianteMaterno').value,
        nombres: document.getElementById('estudianteNombres').value,
        fechaNacimiento: document.getElementById('estudianteFechaNacimiento').value,
        estadoMatricula: document.getElementById('estudianteEstadoMatricula').value,
        obsSegip: document.getElementById('estudianteObsSegip').value
    };
    
    const id = document.getElementById('estudianteId').value;
    const transaction = db.transaction(["estudiantes"], "readwrite");
    const store = transaction.objectStore("estudiantes");
    
    if (id) {
        estudiante.id = parseInt(id);
        const request = store.put(estudiante);
        
        request.onsuccess = function() {
            cargarEstudiantes();
            limpiarFormEstudiante();
        };
    } else {
        const request = store.add(estudiante);
        
        request.onsuccess = function() {
            cargarEstudiantes();
            limpiarFormEstudiante();
        };
    }
}

function cargarEstudiantes() {
    const transaction = db.transaction(["estudiantes"], "readonly");
    const store = transaction.objectStore("estudiantes");
    const request = store.getAll();
    
    request.onsuccess = function() {
        const estudiantes = request.result;
        const tbody = document.getElementById('estudiantesTableBody');
        tbody.innerHTML = '';
        
        estudiantes.forEach(estudiante => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${estudiante.codigoRude}</td>
                <td>${estudiante.carnet}</td>
                <td>${estudiante.paterno}</td>
                <td>${estudiante.materno}</td>
                <td>${estudiante.nombres}</td>
                <td>${estudiante.fechaNacimiento}</td>
                <td>${estudiante.estadoMatricula}</td>
                <td>${estudiante.obsSegip || ''}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="editarEstudiante(${estudiante.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarEstudiante(${estudiante.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };
}

function editarEstudiante(id) {
    const transaction = db.transaction(["estudiantes"], "readonly");
    const store = transaction.objectStore("estudiantes");
    const request = store.get(id);
    
    request.onsuccess = function() {
        const estudiante = request.result;
        
        document.getElementById('estudianteId').value = estudiante.id;
        document.getElementById('estudianteCodigoRude').value = estudiante.codigoRude;
        document.getElementById('estudianteCarnet').value = estudiante.carnet;
        document.getElementById('estudiantePaterno').value = estudiante.paterno;
        document.getElementById('estudianteMaterno').value = estudiante.materno;
        document.getElementById('estudianteNombres').value = estudiante.nombres;
        document.getElementById('estudianteFechaNacimiento').value = estudiante.fechaNacimiento;
        document.getElementById('estudianteEstadoMatricula').value = estudiante.estadoMatricula;
        document.getElementById('estudianteObsSegip').value = estudiante.obsSegip;
    };
}

function eliminarEstudiante(id) {
    if (confirm('¿Está seguro de eliminar este estudiante?')) {
        const transaction = db.transaction(["estudiantes"], "readwrite");
        const store = transaction.objectStore("estudiantes");
        const request = store.delete(id);
        
        request.onsuccess = function() {
            cargarEstudiantes();
        };
    }
}

function limpiarFormEstudiante() {
    document.getElementById('estudianteForm').reset();
    document.getElementById('estudianteId').value = '';
}

// Funciones CRUD para Materias
function guardarMateria(e) {
    e.preventDefault();
    
    const materia = {
        nombre: document.getElementById('materiaNombre').value,
        codigo: document.getElementById('materiaCodigo').value
    };
    
    const id = document.getElementById('materiaId').value;
    const transaction = db.transaction(["materias"], "readwrite");
    const store = transaction.objectStore("materias");
    
    if (id) {
        materia.id = parseInt(id);
        const request = store.put(materia);
        
        request.onsuccess = function() {
            cargarMaterias();
            limpiarFormMateria();
        };
    } else {
        const request = store.add(materia);
        
        request.onsuccess = function() {
            cargarMaterias();
            limpiarFormMateria();
        };
    }
}

function cargarMaterias() {
    const transaction = db.transaction(["materias"], "readonly");
    const store = transaction.objectStore("materias");
    const request = store.getAll();
    
    request.onsuccess = function() {
        const materias = request.result;
        const tbody = document.getElementById('materiasTableBody');
        tbody.innerHTML = '';
        
        materias.forEach(materia => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${materia.codigo}</td>
                <td>${materia.nombre}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="editarMateria(${materia.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarMateria(${materia.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };
}

function editarMateria(id) {
    const transaction = db.transaction(["materias"], "readonly");
    const store = transaction.objectStore("materias");
    const request = store.get(id);
    
    request.onsuccess = function() {
        const materia = request.result;
        
        document.getElementById('materiaId').value = materia.id;
        document.getElementById('materiaNombre').value = materia.nombre;
        document.getElementById('materiaCodigo').value = materia.codigo;
    };
}

function eliminarMateria(id) {
    if (confirm('¿Está seguro de eliminar esta materia?')) {
        const transaction = db.transaction(["materias"], "readwrite");
        const store = transaction.objectStore("materias");
        const request = store.delete(id);
        
        request.onsuccess = function() {
            cargarMaterias();
        };
    }
}

function limpiarFormMateria() {
    document.getElementById('materiaForm').reset();
    document.getElementById('materiaId').value = '';
}

// Funciones CRUD para Cursos
function guardarCurso(e) {
    e.preventDefault();
    
    const curso = {
        turno: document.getElementById('cursoTurno').value,
        nivel: document.getElementById('cursoNivel').value,
        grado: parseInt(document.getElementById('cursoGrado').value),
        paralelo: document.getElementById('cursoParalelo').value
    };
    
    const id = document.getElementById('cursoId').value;
    const transaction = db.transaction(["cursos"], "readwrite");
    const store = transaction.objectStore("cursos");
    
    if (id) {
        curso.id = parseInt(id);
        const request = store.put(curso);
        
        request.onsuccess = function() {
            cargarCursos();
            limpiarFormCurso();
        };
    } else {
        const request = store.add(curso);
        
        request.onsuccess = function() {
            cargarCursos();
            limpiarFormCurso();
        };
    }
}

function cargarCursos() {
    const transaction = db.transaction(["cursos"], "readonly");
    const store = transaction.objectStore("cursos");
    const request = store.getAll();
    
    request.onsuccess = function() {
        const cursos = request.result;
        const tbody = document.getElementById('cursosTableBody');
        tbody.innerHTML = '';
        
        cursos.forEach(curso => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${curso.turno}</td>
                <td>${curso.nivel}</td>
                <td>${curso.grado}</td>
                <td>${curso.paralelo}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="editarCurso(${curso.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarCurso(${curso.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };
}

function editarCurso(id) {
    const transaction = db.transaction(["cursos"], "readonly");
    const store = transaction.objectStore("cursos");
    const request = store.get(id);
    
    request.onsuccess = function() {
        const curso = request.result;
        
        document.getElementById('cursoId').value = curso.id;
        document.getElementById('cursoTurno').value = curso.turno;
        document.getElementById('cursoNivel').value = curso.nivel;
        document.getElementById('cursoGrado').value = curso.grado;
        document.getElementById('cursoParalelo').value = curso.paralelo;
    };
}

function eliminarCurso(id) {
    if (confirm('¿Está seguro de eliminar este curso?')) {
        const transaction = db.transaction(["cursos"], "readwrite");
        const store = transaction.objectStore("cursos");
        const request = store.delete(id);
        
        request.onsuccess = function() {
            cargarCursos();
        };
    }
}

function limpiarFormCurso() {
    document.getElementById('cursoForm').reset();
    document.getElementById('cursoId').value = '';
}