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


let db;
const DB_NAME = "EscuelaDB";
const DB_VERSION = 2;


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

    // Configurar el evento del formulario (en DOMContentLoaded)
document.getElementById('asignacionForm').addEventListener('submit', guardarAsignacion);
document.getElementById('asignacionesModal').addEventListener('shown.bs.modal', function() {
    cargarAsignaciones();
    cargarSelectsParaAsignaciones();
});
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

        // Crear object store para Asignaciones
    const asignacionesStore = db.createObjectStore("asignaciones", { keyPath: "id", autoIncrement: true });
    asignacionesStore.createIndex("docente_materia_curso", ["docenteId", "materiaId", "cursoId"], { unique: true });
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



function cargarSelectsParaAsignaciones() {
    cargarDocentesParaSelect();
    cargarMateriasParaSelect();
    cargarCursosParaSelect();
}

function cargarDocentesParaSelect() {
    const select = document.getElementById('asignacionDocente');
    select.innerHTML = '<option value="">Seleccione un docente</option>';
    
    const transaction = db.transaction(["docentes"], "readonly");
    const store = transaction.objectStore("docentes");
    const request = store.getAll();
    
    request.onsuccess = function() {
        request.result.forEach(docente => {
            const option = document.createElement('option');
            option.value = docente.id;
            option.textContent = `${docente.nombres} ${docente.paterno} ${docente.materno}`;
            select.appendChild(option);
        });
    };
}

function cargarMateriasParaSelect() {
    const select = document.getElementById('asignacionMateria');
    select.innerHTML = '<option value="">Seleccione una materia</option>';
    
    const transaction = db.transaction(["materias"], "readonly");
    const store = transaction.objectStore("materias");
    const request = store.getAll();
    
    request.onsuccess = function() {
        request.result.forEach(materia => {
            const option = document.createElement('option');
            option.value = materia.id;
            option.textContent = materia.nombre;
            select.appendChild(option);
        });
    };
}

function cargarCursosParaSelect() {
    const select = document.getElementById('asignacionCurso');
    select.innerHTML = '<option value="">Seleccione un curso</option>';
    
    const transaction = db.transaction(["cursos"], "readonly");
    const store = transaction.objectStore("cursos");
    const request = store.getAll();
    
    request.onsuccess = function() {
        request.result.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id;
            option.textContent = `${curso.nivel} ${curso.grado}° "${curso.paralelo}" (${curso.turno})`;
            select.appendChild(option);
        });
    };
}


function guardarAsignacion(e) {
    e.preventDefault();
    
    const asignacion = {
        docenteId: parseInt(document.getElementById('asignacionDocente').value),
        materiaId: parseInt(document.getElementById('asignacionMateria').value),
        cursoId: parseInt(document.getElementById('asignacionCurso').value),
        periodo: document.getElementById('asignacionPeriodo').value,
        fechaRegistro: new Date().toISOString()
    };
    
    const id = document.getElementById('asignacionId').value;
    const transaction = db.transaction(["asignaciones"], "readwrite");
    const store = transaction.objectStore("asignaciones");
    
    if (id) {
        asignacion.id = parseInt(id);
        const request = store.put(asignacion);
        
        request.onsuccess = function() {
            cargarAsignaciones();
            limpiarFormAsignacion();
        };
    } else {
        const request = store.add(asignacion);
        
        request.onsuccess = function() {
            cargarAsignaciones();
            limpiarFormAsignacion();
        };
    }
}

function cargarAsignaciones() {
    const transaction = db.transaction(["asignaciones"], "readonly");
    const store = transaction.objectStore("asignaciones");
    const request = store.getAll();
    
    request.onsuccess = function() {
        const asignaciones = request.result;
        const tbody = document.getElementById('asignacionesTableBody');
        tbody.innerHTML = '';
        
        if (asignaciones.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay asignaciones registradas</td></tr>';
            return;
        }
        
        
        Promise.all([
            obtenerNombresDocentes(asignaciones),
            obtenerNombresMaterias(asignaciones),
            obtenerNombresCursos(asignaciones)
        ]).then(([docentesMap, materiasMap, cursosMap]) => {
            asignaciones.forEach(asignacion => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${docentesMap.get(asignacion.docenteId) || 'Desconocido'}</td>
                    <td>${materiasMap.get(asignacion.materiaId) || 'Desconocida'}</td>
                    <td>${cursosMap.get(asignacion.cursoId) || 'Desconocido'}</td>
                    <td>${asignacion.periodo}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="editarAsignacion(${asignacion.id})">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarAsignacion(${asignacion.id})">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        });
    };
}


function obtenerNombresDocentes(asignaciones) {
    return new Promise((resolve) => {
        const docentesIds = [...new Set(asignaciones.map(a => a.docenteId))];
        const docentesMap = new Map();
        
        if (docentesIds.length === 0) {
            resolve(docentesMap);
            return;
        }
        
        const transaction = db.transaction(["docentes"], "readonly");
        const store = transaction.objectStore("docentes");
        
        docentesIds.forEach(id => {
            const request = store.get(id);
            request.onsuccess = function() {
                const docente = request.result;
                if (docente) {
                    docentesMap.set(id, `${docente.nombres} ${docente.paterno} ${docente.materno}`);
                }
                
                // Verificar si hemos terminado
                if (docentesMap.size === docentesIds.length) {
                    resolve(docentesMap);
                }
            };
        });
    });
}

function obtenerNombresMaterias(asignaciones) {
    return new Promise((resolve) => {
        const materiasIds = [...new Set(asignaciones.map(a => a.materiaId))];
        const materiasMap = new Map();
        
        if (materiasIds.length === 0) {
            resolve(materiasMap);
            return;
        }
        
        const transaction = db.transaction(["materias"], "readonly");
        const store = transaction.objectStore("materias");
        
        materiasIds.forEach(id => {
            const request = store.get(id);
            request.onsuccess = function() {
                const materia = request.result;
                if (materia) {
                    materiasMap.set(id, materia.nombre);
                }
                
                if (materiasMap.size === materiasIds.length) {
                    resolve(materiasMap);
                }
            };
        });
    });
}

function obtenerNombresCursos(asignaciones) {
    return new Promise((resolve) => {
        const cursosIds = [...new Set(asignaciones.map(a => a.cursoId))];
        const cursosMap = new Map();
        
        if (cursosIds.length === 0) {
            resolve(cursosMap);
            return;
        }
        
        const transaction = db.transaction(["cursos"], "readonly");
        const store = transaction.objectStore("cursos");
        
        cursosIds.forEach(id => {
            const request = store.get(id);
            request.onsuccess = function() {
                const curso = request.result;
                if (curso) {
                    cursosMap.set(id, `${curso.nivel} ${curso.grado}° "${curso.paralelo}" (${curso.turno})`);
                }
                
                if (cursosMap.size === cursosIds.length) {
                    resolve(cursosMap);
                }
            };
        });
    });
}

function editarAsignacion(id) {
    const transaction = db.transaction(["asignaciones"], "readonly");
    const store = transaction.objectStore("asignaciones");
    const request = store.get(id);
    
    request.onsuccess = function() {
        const asignacion = request.result;
        
        document.getElementById('asignacionId').value = asignacion.id;
        document.getElementById('asignacionDocente').value = asignacion.docenteId;
        document.getElementById('asignacionMateria').value = asignacion.materiaId;
        document.getElementById('asignacionCurso').value = asignacion.cursoId;
        document.getElementById('asignacionPeriodo').value = asignacion.periodo;
    };
}

function eliminarAsignacion(id) {
    if (confirm('¿Está seguro de eliminar esta asignación?')) {
        const transaction = db.transaction(["asignaciones"], "readwrite");
        const store = transaction.objectStore("asignaciones");
        const request = store.delete(id);
        
        request.onsuccess = function() {
            cargarAsignaciones();
        };
    }
}

function limpiarFormAsignacion() {
    document.getElementById('asignacionForm').reset();
    document.getElementById('asignacionId').value = '';
}