//#region 1. Estado Global y Constantes
let backlogData = [];
let editingItemIndex = null;
let selectedCategories = new Set();

let hasUnsavedChanges = false;
let pendingSwitchIndex = null;
let currentEditCategories = [];
let editSearchTerm = "";

// --- CONFIGURACIÓN DE GITHUB API ---
const GITHUB_CONFIG = {
    token: localStorage.getItem("github_token"),
    owner: "CrisRaptor",
    repo: "backlog-app",
    folder: "data"
};

// SVGs personalizados para las tarjetas del panel principal
const CARD_ICONS = {
    // 1. New Quest: Cofre del tesoro
    newQuest: `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
         <path fill-rule="evenodd" clip-rule="evenodd" d="M14.3675 2.15671C14.7781 2.01987 15.2219 2.01987 15.6325 2.15671L20.6325 3.82338C21.4491 4.09561 22 4.85988 22 5.72074V19.6126C22 20.9777 20.6626 21.9416 19.3675 21.5099L15 20.0541L9.63246 21.8433C9.22192 21.9801 8.77808 21.9801 8.36754 21.8433L3.36754 20.1766C2.55086 19.9044 2 19.1401 2 18.2792V4.38741C2 3.0223 3.33739 2.05836 4.63246 2.49004L9 3.94589L14.3675 2.15671ZM15 4.05408L9.63246 5.84326C9.22192 5.9801 8.77808 5.9801 8.36754 5.84326L4 4.38741V18.2792L9 19.9459L14.3675 18.1567C14.7781 18.0199 15.2219 18.0199 15.6325 18.1567L20 19.6126V5.72074L15 4.05408ZM13.2929 8.29288C13.6834 7.90235 14.3166 7.90235 14.7071 8.29288L15.5 9.08577L16.2929 8.29288C16.6834 7.90235 17.3166 7.90235 17.7071 8.29288C18.0976 8.6834 18.0976 9.31657 17.7071 9.70709L16.9142 10.5L17.7071 11.2929C18.0976 11.6834 18.0976 12.3166 17.7071 12.7071C17.3166 13.0976 16.6834 13.0976 13.2929 12.7071L15.5 11.9142L14.7071 12.7071C14.3166 13.0976 13.6834 13.0976 13.2929 12.7071C12.9024 12.3166 12.9024 11.6834 13.2929 11.2929L14.0858 10.5L13.2929 9.70709C12.9024 9.31657 12.9024 8.6834 13.2929 8.29288ZM6 16C6.55228 16 7 15.5523 7 15C7 14.4477 6.55228 14 6 14C5.44772 14 5 14.4477 5 15C5 15.5523 5.44772 16 6 16ZM9 12C9 12.5523 8.55228 13 8 13C7.44772 13 7 12.5523 7 12C7 11.4477 7.44772 11 8 11C8.55228 11 9 11.4477 9 12ZM11 12C11.5523 12 12 11.5523 12 11C12 10.4477 11.5523 9.99998 11 9.99998C10.4477 9.99998 10 10.4477 10 11C10 11.5523 10.4477 12 11 12Z"
      </svg>`,

    // 2. Current Quest (quests): Pergamino abierto
    quests: `<svg viewBox="0 0 24 24" fill="currentColor">
         <path id="Shape" d="M10.75,1.5A2.25,2.25,0,0,1,13,3.75v9.028h1.5V3.75A3.75,3.75,0,0,0,10.75,0H.75a.75.75,0,0,0,0,1.5C1.669,1.5,2,1.831,2,2.75v11A3.75,3.75,0,0,0,5.75,17.5h8V16h-8A2.25,2.25,0,0,1,3.5,13.75v-11A3.392,3.392,0,0,0,3.285,1.5Z" transform="translate(4.25 3.25)"/>
         <path id="Shape-2" data-name="Shape" d="M7.765,17.5A3.294,3.294,0,0,0,10.738,16H7.754C9.307,16,10,15,10,12.749a.751.751,0,0,1,.751-.75h8a.751.751,0,0,1,.75.75v1a3.755,3.755,0,0,1-3.75,3.75ZM10.738,16H15.75A2.253,2.253,0,0,0,18,13.749V13.5H11.472A5.4,5.4,0,0,1,10.738,16ZM7,16.75A.72.72,0,0,1,7.749,16h0v1.5A.719.719,0,0,1,7,16.75ZM.75,5.5A.751.751,0,0,1,0,4.75v-2a2.75,2.75,0,1,1,5.5,0v2a.751.751,0,0,1-.75.75ZM1.5,2.75V4H4V2.75a1.25,1.25,0,1,0-2.5,0Z" transform="translate(2.25 3.25)"/>
      </svg>`,

    // 3. Editar: Lápiz de trazado
    edit: `<svg viewBox="0 0 24 24" fill="currentColor">
         <path fill-rule="evenodd" clip-rule="evenodd" d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V7C19 7.55228 19.4477 8 20 8C20.5523 8 21 7.55228 21 7V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM22.1213 10.7071C20.9497 9.53553 19.0503 9.53553 17.8787 10.7071L16.1989 12.3869L11.2929 17.2929C11.1647 17.4211 11.0738 17.5816 11.0299 17.7575L10.0299 21.7575C9.94466 22.0982 10.0445 22.4587 10.2929 22.7071C10.5413 22.9555 10.9018 23.0553 11.2425 22.9701L15.2425 21.9701C15.4184 21.9262 15.5789 21.8353 15.7071 21.7071L20.5556 16.8586L22.2929 15.1213C23.4645 13.9497 23.4645 12.0503 22.2929 10.8787L22.1213 10.7071ZM18.3068 13.1074L19.2929 12.1213C19.6834 11.7308 20.3166 11.7308 20.7071 12.1213L20.8787 12.2929C21.2692 12.6834 21.2692 13.3166 20.8787 13.7071L19.8622 14.7236L18.3068 13.1074ZM16.8923 14.5219L18.4477 16.1381L14.4888 20.097L12.3744 20.6256L12.903 18.5112L16.8923 14.5219Z"    
      </svg>`,

    // 4. Backlog: Lista con marcadores
    backlog: `<svg viewBox="0 0 24 24" fill="currentColor">
         <path d="M8 6L21 6.00078M8 12L21 12.0008M8 18L21 18.0007M3 6.5H4V5.5H3V6.5ZM3 12.5H4V11.5H3V12.5ZM3 18.5H4V17.5H3V18.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      </svg>`,

    // 5. Configuración: Engranaje
    settings: `<svg viewBox="0 0 24 24" fill="none">
<path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.2703 4.54104C14.2703 3.68995 13.5803 3 12.7292 3H11.2706C10.4195 3 9.72953 3.68995 9.72953 4.54104C9.72953 5.19575 9.30667 5.76411 8.73133 6.07658C8.64137 6.12544 8.55265 6.17624 8.46522 6.22895C7.90033 6.56948 7.19241 6.65124 6.6199 6.32367C5.87282 5.89621 4.92082 6.15129 4.48754 6.89501L3.78312 8.10415C3.35155 8.84495 3.60624 9.79549 4.35038 10.2213C4.92043 10.5474 5.2042 11.1992 5.19031 11.8558C5.1893 11.9037 5.18879 11.9518 5.18879 12C5.18879 12.0482 5.1893 12.0963 5.19032 12.1443C5.20421 12.8009 4.92043 13.4526 4.3504 13.7787C3.60628 14.2045 3.35159 15.155 3.78315 15.8958L4.48759 17.105C4.92086 17.8487 5.87286 18.1038 6.61993 17.6763C7.19243 17.3488 7.90034 17.4305 8.46523 17.7711C8.55266 17.8238 8.64138 17.8746 8.73133 17.9234C9.30667 18.2359 9.72953 18.8042 9.72953 19.459C9.72953 20.3101 10.4195 21 11.2706 21H12.7292C13.5803 21 14.2703 20.3101 14.2703 19.459C14.2703 18.8042 14.6931 18.2359 15.2685 17.9234C15.3584 17.8746 15.4471 17.8238 15.5346 17.7711C16.0994 17.4305 16.8074 17.3488 17.3799 17.6763C18.1269 18.1038 19.0789 17.8487 19.5122 17.105L20.2167 15.8958C20.6482 15.1551 20.3935 14.2045 19.6494 13.7788C19.0794 13.4526 18.7956 12.8009 18.8095 12.1443C18.8105 12.0963 18.811 12.0482 18.811 12C18.811 11.9518 18.8105 11.9037 18.8095 11.8558C18.7956 11.1992 19.0794 10.5474 19.6494 10.2213C20.3936 9.79548 20.6482 8.84494 20.2167 8.10414L19.5123 6.89501C19.079 6.15128 18.127 5.8962 17.3799 6.32366C16.8074 6.65123 16.0995 6.56948 15.5346 6.22894C15.4471 6.17624 15.3584 6.12543 15.2685 6.07658C14.6931 5.76411 14.2703 5.19575 14.2703 4.54104Z" stroke="currentColor" stroke-width="2"/>   </svg>`
};
//#endregion

//#region 2. Inicialización y Carga de Datos
document.addEventListener("DOMContentLoaded", async () => {
    await loadBacklogData();
    setupUnsavedWarning();
    navigateTo("home");
});

async function loadBacklogData() {
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    try {
        if (!GITHUB_CONFIG.token) {
            console.warn("⚠️ Atención: No se encontró 'github_token' en localStorage. Las peticiones a GitHub fallarán.");
        }
        console.log("Intentando obtener datos desde GitHub Remote...");

        // 1. Pedir el listado de archivos en la carpeta /data de GitHub
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.folder}`,
            { headers: { Authorization: `token ${GITHUB_CONFIG.token}` } }
        );

        if (!response.ok) throw new Error(`Error en API GitHub: ${response.status}`);

        const files = await response.json();

        // Filtrar solo los JSONs y ordenarlos por fecha (los nombres YYYY-MM-DD.json se ordenan de forma natural)
        const jsonFiles = files
            .filter(f => f.name.endsWith(".json"))
            .sort((a, b) => b.name.localeCompare(a.name));

        if (jsonFiles.length === 0) throw new Error("No se encontraron archivos en /data");

        // Descargar el archivo más reciente (el primero tras el sort descendente)
        const latestFile = jsonFiles[0];
        const dataResponse = await fetch(latestFile.download_url);
        backlogData = await dataResponse.json();

        // Guardar copia local de emergencia en el navegador
        localStorage.setItem("local_backup_data", JSON.stringify(backlogData));
        console.log(`✅ Carga exitosa desde GitHub: ${latestFile.name}`);

    } catch (error) {
        // SI FALLA LA CONEXIÓN REMOTA:
        console.warn("⚠️ ERROR DE CONEXIÓN REMOTA CON GITHUB:", error.message);
        console.log("🔄 Buscando respaldo más reciente en local...");

        // Intentar recuperar del localStorage o pedir archivo diario local
        const localBackup = localStorage.getItem("local_backup_data");
        if (localBackup) {
            backlogData = JSON.parse(localBackup);
            console.log("✅ Datos cargados correctamente desde el almacenamiento local.");
        } else {
            // Intentar cargar el data.json por defecto de la raíz
            try {
                const fallbackResponse = await fetch("data.json");
                backlogData = await fallbackResponse.json();
                console.log("✅ Carga fallback desde data.json raíz exitosa.");
            } catch (e) {
                console.error("❌ No se pudieron recuperar datos locales.", e);
            }
        }
    }
}
//#endregion

//#region Guardado Remoto y Limpieza Automática
async function saveChangesToRemote() {
    const todayStr = new Date().toISOString().split("T")[0];
    const fileName = `${todayStr}.json`;
    const filePath = `${GITHUB_CONFIG.folder}/${fileName}`;

    const contentEncoded = btoa(unescape(encodeURIComponent(JSON.stringify(backlogData, null, 2))));

    try {
        // A. Obtener SHA del archivo si ya existe hoy (necesario para sobrescribir en GitHub API)
        let sha = null;
        const checkFile = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`,
            { headers: { Authorization: `token ${GITHUB_CONFIG.token}` } }
        );
        if (checkFile.ok) {
            const fileData = await checkFile.json();
            sha = fileData.sha;
        }

        // B. Subir/Actualizar archivo en GitHub
        const saveResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `token ${GITHUB_CONFIG.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: `Auto-backup backlog: ${fileName}`,
                    content: contentEncoded,
                    sha: sha || undefined
                })
            }
        );

        if (!saveResponse.ok) throw new Error(`HTTP Error ${saveResponse.status}`);

        console.log(`✅ Guardado con éxito en remoto: ${filePath}`);
        hasUnsavedChanges = false;
        localStorage.setItem("local_backup_data", JSON.stringify(backlogData));

        // C. Ejecutar limpieza para mantener SOLO los 7 JSONs más recientes
        await cleanupOldRemoteBackups();

        alert("¡Guardado remoto completado con éxito, Jefe!");

    } catch (error) {
        console.error("❌ Error al guardar en remoto:", error);
        alert("No se pudo conectar con GitHub. Se ha guardado una copia en la memoria local de la aplicación.");
        localStorage.setItem("local_backup_data", JSON.stringify(backlogData));
    }
}

// Mantiene exactamente los 7 archivos más recientes en la carpeta /data del repositorio
async function cleanupOldRemoteBackups() {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.folder}`,
            { headers: { Authorization: `token ${GITHUB_CONFIG.token}` } }
        );
        if (!response.ok) return;

        const files = await response.json();
        const jsonFiles = files
            .filter(f => f.name.endsWith(".json"))
            .sort((a, b) => b.name.localeCompare(a.name)); // Más recientes primero

        // Si hay más de 7 archivos, eliminar los sobrantes (los más antiguos)
        if (jsonFiles.length > 7) {
            const filesToDelete = jsonFiles.slice(7);

            for (const file of filesToDelete) {
                await fetch(
                    `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${file.path}`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `token ${GITHUB_CONFIG.token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            message: `Limpieza automática: eliminando respaldo antiguo ${file.name}`,
                            sha: file.sha
                        })
                    }
                );
                console.log(`🗑️ Eliminado respaldo antiguo en remoto: ${file.name}`);
            }
        }
    } catch (error) {
        console.warn("No se pudo completar la limpieza de respaldos antiguos:", error);
    }
}
//#endregion

//#region Eventos de Salida y Notificación
function setupUnsavedWarning() {
    // Advertir al usuario al cerrar la pestaña si hay cambios sin guardar
    window.addEventListener("beforeunload", (event) => {
        if (hasUnsavedChanges) {
            event.preventDefault();
            event.returnValue = "Tienes cambios sin guardar. ¿Seguro que deseas salir?";
        }
    });
}
//#endregion

//#region 3. Enrutador SPA y Navegación
function navigateTo(viewName) {
    const container = document.getElementById("app-content");
    if (!container) return;

    switch (viewName) {
        case "home":
            container.innerHTML = renderHomeView();
            break;
        case "quests":
            container.innerHTML = renderQuestsView();
            break;
        case "newQuest":
            container.innerHTML = renderNewQuestView();
            break;
        case "edit":
            container.innerHTML = renderEditView();
            break;
        case "backlog":
            container.innerHTML = renderBacklogView();
            break;
        case "settings":
            container.innerHTML = renderSettingsView();
            break;
        default:
            container.innerHTML = renderHomeView();
    }
}
//#endregion

//#region 4. Vista - Inicio (Dashboard)
function renderHomeView() {
    return `
        <h1 class="h3 mb-4 text-light fw-bold text-center">Panel Principal</h1>
        <div class="home-cards-grid">
            
            <!-- 1. New Quest -->
            <div>
                <button class="btn btn-outline-light card-dark home-card p-3 w-100 text-start" onclick="navigateTo('newQuest')">
                    <div>
                        <span class="badge badge-dark-subtle text-warning fw-bold">01</span>
                    </div>
                    <div class="card-icon-box text-warning">
                        ${CARD_ICONS.newQuest}
                    </div>
                    <div>
                        <h2 class="h4 fw-bold text-light mb-1">New Quest</h2>
                        <p class="text-secondary mb-0">Lanzar Content Roll.</p>
                    </div>
                </button>
            </div>

            <!-- 2. Current Quest -->
            <div>
                <button class="btn btn-outline-light card-dark home-card p-3 w-100 text-start" onclick="navigateTo('quests')">
                    <div>
                        <span class="badge badge-dark-subtle text-success fw-bold">02</span>
                    </div>
                    <div class="card-icon-box text-success">
                        ${CARD_ICONS.quests}
                    </div>
                    <div>
                        <h2 class="h4 fw-bold text-light mb-1">Current Quest</h2>
                        <p class="text-secondary mb-0">Revisar quest e historial.</p>
                    </div>
                </button>
            </div>

            <!-- 3. Editar -->
            <div>
                <button class="btn btn-outline-light card-dark home-card p-3 w-100 text-start" onclick="navigateTo('edit')">
                    <div>
                        <span class="badge badge-dark-subtle text-primary fw-bold">03</span>
                    </div>
                    <div class="card-icon-box text-primary">
                        ${CARD_ICONS.edit}
                    </div>
                    <div>
                        <h2 class="h4 fw-bold text-light mb-1">Editar</h2>
                        <p class="text-secondary mb-0">Añadir o editar juegos.</p>
                    </div>
                </button>
            </div>

            <!-- 4. Backlog -->
            <div>
                <button class="btn btn-outline-light card-dark home-card p-3 w-100 text-start" onclick="navigateTo('backlog')">
                    <div>
                        <span class="badge badge-dark-subtle text-info fw-bold">04</span>
                    </div>
                    <div class="card-icon-box text-info">
                        ${CARD_ICONS.backlog}
                    </div>
                    <div>
                        <h2 class="h4 fw-bold text-light mb-1">Backlog</h2>
                        <p class="text-secondary mb-0">Ver lista completa.</p>
                    </div>
                </button>
            </div>

            <!-- 5. Config -->
            <div>
                <button class="btn btn-outline-light card-dark home-card p-3 w-100 text-start" onclick="navigateTo('settings')">
                    <div>
                        <span class="badge badge-dark-subtle text-secondary fw-bold">05</span>
                    </div>
                    <div class="card-icon-box text-secondary">
                        ${CARD_ICONS.settings}
                    </div>
                    <div>
                        <h2 class="h4 fw-bold text-light mb-1">Config</h2>
                        <p class="text-secondary mb-0">Burnout y opciones.</p>
                    </div>
                </button>
            </div>

        </div>
    `;
}
//#endregion

//#region 5. Vista - [1] Quests y Seguimiento
function renderQuestsView() {
    return `<h1 class="h4 mb-2 fw-bold">Quests y Seguimiento</h1><p class="text-secondary small">Visualizador de Quest activa e Historial.</p>`;
}
//#endregion

//#region 6. Vista - [2] Start New Quest (Generador)
function renderNewQuestView() {
    return `<h1 class="h4 mb-2 fw-bold">Start New Quest</h1><p class="text-secondary small">Ajustes del roll: Días, categorías y obligatorios.</p>`;
}
//#endregion

//#region 7. Vista - [3] Editar Elementos (CRUD)
function renderEditView() {
    return `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h1 class="h4 fw-bold text-light mb-0">Gestión de Elementos</h1>
                <p class="text-secondary small mb-0">Haz clic en cualquier elemento para editarlo o eliminarlo.</p>
            </div>
            <button class="btn btn-success fw-bold d-flex align-items-center gap-2" onclick="attemptOpenEditForm(null)">
                <span>+</span> Añadir Nuevo
            </button>
        </div>

        <!-- Buscador -->
        <input type="text" id="edit-search-input" class="form-control bg-dark text-light border-secondary mb-4" placeholder="🔍 Buscar elemento por nombre..." oninput="filterEditList(this.value)" value="${editSearchTerm}">

        <!-- Panel Formulario Desplegable Superior -->
        <div id="edit-form-panel" class="card card-dark p-3 mb-4 d-none border-primary shadow-lg">
            <div class="d-flex justify-content-between align-items-center mb-3 border-bottom border-subtle-custom pb-2">
                <h2 class="h5 text-light fw-bold mb-0" id="form-panel-title">Editar Elemento</h2>
                <button type="button" class="btn-close btn-close-white" onclick="attemptCloseEditForm()"></button>
            </div>

            <form id="crud-item-form" onsubmit="saveItemChanges(event)">
                <div class="row g-3">
                    <!-- Nombre (Ancho reducido) -->
                    <div class="col-md-3">
                        <label class="form-label text-secondary small fw-bold">Nombre</label>
                        <input type="text" id="form-item-name" class="form-control bg-dark text-light border-secondary" required placeholder="Ej: Elden Ring" oninput="markAsDirty()">
                    </div>

                    <!-- Nombre Imagen (Ancho reducido) -->
                    <div class="col-md-3">
                        <label class="form-label text-secondary small fw-bold">Imagen (img_name)</label>
                        <input type="text" id="form-item-img" class="form-control bg-dark text-light border-secondary" placeholder="Ej: elden_ring.jpg" oninput="markAsDirty()">
                    </div>

                    <!-- Estado (Status fijo) -->
                    <div class="col-md-3">
                        <label class="form-label text-secondary small fw-bold">Estado</label>
                        <select id="form-item-status" class="form-select bg-dark text-light border-secondary" required onchange="markAsDirty()">
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="dropped">Dropped</option>
                        </select>
                    </div>

                    <!-- Mandatory Toggle (Adaptado al hueco restante) -->
                    <div class="col-md-3 d-flex align-items-center">
                        <div class="form-check form-switch mt-md-4">
                            <input class="form-check-input" type="checkbox" role="switch" id="form-item-mandatory" onchange="markAsDirty()">
                            <label class="form-check-label text-light fw-bold small" for="form-item-mandatory">Obligatorio</label>
                        </div>
                    </div>

                    <!-- Sistema Avanzado de Categorías -->
                    <div class="col-12 mt-4 border-top border-subtle-custom pt-3">
                        <label class="form-label text-secondary small fw-bold">Categorías del elemento</label>
                        
                        <!-- Input para añadir custom -->
                        <input type="text" id="form-item-category-input" class="form-control bg-dark text-light border-secondary mb-2" placeholder="Escribe una categoría y presiona Enter..." onkeydown="handleCategoryEnter(event)">
                        
                        <!-- Categorías actuales del elemento -->
                        <div id="current-categories-container" class="d-flex flex-wrap gap-2 mb-3 min-h-30">
                            <!-- Se rellena con JS -->
                        </div>

                        <small class="text-secondary d-block mb-1" style="font-size: 0.75rem;">Sugerencias (haz clic para añadir):</small>
                        <!-- Categorías sugeridas (no incluidas) -->
                        <div id="suggested-categories-container" class="d-flex flex-wrap gap-2">
                            <!-- Se rellena con JS -->
                        </div>
                    </div>
                </div>

                <!-- Botones de Acción -->
                <div class="d-flex justify-content-between align-items-center mt-4 pt-2 border-top border-subtle-custom">
                    <div>
                        <button type="button" id="btn-delete-item" class="btn btn-outline-danger d-none" onclick="confirmDeleteItem()">
                            🗑️ Borrar
                        </button>
                    </div>
                    <div class="d-flex gap-2">
                        <button type="button" class="btn btn-secondary" onclick="attemptCloseEditForm()">Cancelar</button>
                        <button type="submit" class="btn btn-primary fw-bold">Guardar Cambios</button>
                    </div>
                </div>
            </form>
        </div>

        <!-- Listado de Elementos (Estilo Tags/Grid) -->
        <div class="d-flex flex-wrap gap-2" id="items-name-list">
            ${generateEditListHTML()}
        </div>

        <!-- Modal de Confirmación de Borrado -->
        <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content bg-dark text-light border-secondary">
                    <div class="modal-header border-subtle-custom">
                        <h5 class="modal-title fw-bold text-danger">Confirmar Borrado</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="delete-modal-body">
                        ¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.
                    </div>
                    <div class="modal-footer border-subtle-custom">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-danger" onclick="executeDeleteItem()">Sí, Eliminar</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de Cambios sin Guardar -->
        <div class="modal fade" id="unsavedChangesModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content bg-dark text-light border-secondary">
                    <div class="modal-header border-subtle-custom">
                        <h5 class="modal-title fw-bold text-warning">Cambios sin guardar</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        Has modificado este elemento. Si cambias ahora o cancelas, perderás los cambios. ¿Qué deseas hacer?
                    </div>
                    <div class="modal-footer border-subtle-custom">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Seguir con el elemento</button>
                        <button type="button" class="btn btn-danger" onclick="forceSwitchItem()">Descartar cambios y salir</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Generar HTML de la lista filtrada
function generateEditListHTML() {
    const term = editSearchTerm.toLowerCase();
    return backlogData.map((item, index) => {
        if (term && !item.name.toLowerCase().includes(term)) return '';
        const isActive = editingItemIndex === index ? 'border-primary bg-primary text-white' : 'border-subtle-custom text-light bg-transparent';

        return `
            <button type="button" class="btn btn-sm btn-edit-grid d-flex align-items-center gap-2 ${isActive}" onclick="attemptOpenEditForm(${index})">
                <span class="fw-bold">${item.name}</span>
            </button>
        `;
    }).join('');
}

// Filtrar lista al escribir
function filterEditList(term) {
    editSearchTerm = term;
    document.getElementById("items-name-list").innerHTML = generateEditListHTML();
}

// Indicar que el formulario ha sido modificado
function markAsDirty() {
    hasUnsavedChanges = true;
}

// Intentar abrir el formulario (verifica si hay cambios)
function attemptOpenEditForm(index) {
    if (editingItemIndex === index) return; // Ya está abierto

    if (hasUnsavedChanges) {
        pendingSwitchIndex = index;
        const unsavedModal = new bootstrap.Modal(document.getElementById('unsavedChangesModal'));
        unsavedModal.show();
    } else {
        openEditForm(index);
    }
}

// Intentar cerrar el formulario
function attemptCloseEditForm() {
    if (hasUnsavedChanges) {
        pendingSwitchIndex = "CLOSE";
        const unsavedModal = new bootstrap.Modal(document.getElementById('unsavedChangesModal'));
        unsavedModal.show();
    } else {
        closeEditForm();
    }
}

// Forzar el cambio tras confirmar en el Modal
function forceSwitchItem() {
    const modalEl = document.getElementById('unsavedChangesModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();

    hasUnsavedChanges = false;

    if (pendingSwitchIndex === "CLOSE") {
        closeEditForm();
    } else {
        openEditForm(pendingSwitchIndex);
    }
}

// Abrir formulario real
function openEditForm(index) {
    editingItemIndex = index;
    hasUnsavedChanges = false;
    currentEditCategories = [];

    const panel = document.getElementById("edit-form-panel");
    const title = document.getElementById("form-panel-title");
    const deleteBtn = document.getElementById("btn-delete-item");

    panel.classList.remove("d-none");

    // Refrescar estado activo en la lista
    document.getElementById("items-name-list").innerHTML = generateEditListHTML();

    if (index !== null && backlogData[index]) {
        // Modo Edición
        const item = backlogData[index];
        title.textContent = `Editar: ${item.name}`;
        document.getElementById("form-item-name").value = item.name || "";
        document.getElementById("form-item-img").value = item.img_name || "";
        document.getElementById("form-item-status").value = item.status || "pending";
        document.getElementById("form-item-mandatory").checked = !!item.mandatory;
        currentEditCategories = [...(item.categories || [])];
        deleteBtn.classList.remove("d-none");
    } else {
        // Modo Creación
        title.textContent = "Añadir Nuevo Elemento";
        document.getElementById("crud-item-form").reset();
        document.getElementById("form-item-status").value = "pending";
        deleteBtn.classList.add("d-none");
    }

    renderCategoriesInteractive();
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Lógica para añadir categorías pulsando Enter
function handleCategoryEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Evitar enviar el formulario
        const input = document.getElementById("form-item-category-input");
        const newCat = input.value.trim().toLowerCase();

        if (newCat && !currentEditCategories.includes(newCat)) {
            currentEditCategories.push(newCat);
            markAsDirty();
            renderCategoriesInteractive();
        }
        input.value = "";
    }
}

function removeEditCategory(cat) {
    currentEditCategories = currentEditCategories.filter(c => c !== cat);
    markAsDirty();
    renderCategoriesInteractive();
}

function addSuggestedCategory(cat) {
    if (!currentEditCategories.includes(cat)) {
        currentEditCategories.push(cat);
        markAsDirty();
        renderCategoriesInteractive();
    }
}

// Renderizar las cajitas de categorías actuales y sugerencias
function renderCategoriesInteractive() {
    const allUniqueCategories = Array.from(new Set(backlogData.flatMap(item => item.categories || []))).sort();

    // Categorías actuales
    const currentContainer = document.getElementById("current-categories-container");
    currentContainer.innerHTML = currentEditCategories.length > 0
        ? currentEditCategories.map(cat => `
            <span class="badge bg-primary fs-6 d-flex align-items-center gap-1">
                ${cat} <span class="cursor-pointer text-light ms-1" onclick="removeEditCategory('${cat}')">&times;</span>
            </span>`).join('')
        : `<span class="text-secondary small fst-italic">Sin categorías añadidas</span>`;

    // Sugerencias (excluyendo las ya añadidas)
    const suggestedContainer = document.getElementById("suggested-categories-container");
    const suggestions = allUniqueCategories.filter(c => !currentEditCategories.includes(c));

    suggestedContainer.innerHTML = suggestions.length > 0
        ? suggestions.map(cat => `
            <span class="badge badge-category cursor-pointer fs-6" onclick="addSuggestedCategory('${cat}')">
                + ${cat}
            </span>`).join('')
        : `<span class="text-secondary small fst-italic">No hay más sugerencias disponibles</span>`;
}

function closeEditForm() {
    editingItemIndex = null;
    hasUnsavedChanges = false;
    document.getElementById("edit-form-panel").classList.add("d-none");
    document.getElementById("items-name-list").innerHTML = generateEditListHTML();
}

function saveItemChanges(event) {
    event.preventDefault();

    const name = document.getElementById("form-item-name").value.trim();
    const img_name = document.getElementById("form-item-img").value.trim();
    const status = document.getElementById("form-item-status").value.trim();
    const mandatory = document.getElementById("form-item-mandatory").checked;

    const newItemData = {
        name,
        img_name,
        categories: [...currentEditCategories],
        status,
        mandatory
    };

    if (editingItemIndex !== null) {
        backlogData[editingItemIndex] = newItemData;
    } else {
        backlogData.unshift(newItemData);
    }

    hasUnsavedChanges = false;
    closeEditForm();
    navigateTo('edit'); // Recargar vista
}

function confirmDeleteItem() {
    if (editingItemIndex === null) return;
    const item = backlogData[editingItemIndex];
    document.getElementById("delete-modal-body").textContent = `¿Estás seguro de que deseas eliminar "${item.name}"?`;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    deleteModal.show();
}

function executeDeleteItem() {
    if (editingItemIndex !== null) {
        backlogData.splice(editingItemIndex, 1);
        const modalEl = document.getElementById('deleteConfirmModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        hasUnsavedChanges = false;
        closeEditForm();
        navigateTo('edit');
    }
}
//#endregion

//#region 8. Vista - [4] Mostrar Backlog
function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderBacklogView() {
    const allCategories = Array.from(
        new Set(backlogData.flatMap(item => item.categories || []))
    ).sort();

    const filterButtonsHTML = allCategories.map(cat => {
        const isActive = selectedCategories.has(cat) ? "active" : "";
        return `
            <button 
                class="btn btn-sm btn-category-filter rounded-pill me-1 mb-1 ${isActive}"
                onclick="toggleCategoryFilter('${cat}')"
            >
                ${capitalize(cat)}
            </button>
        `;
    }).join("");

    return `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <h1 class="h4 fw-bold mb-0">Mi Backlog</h1>
            ${selectedCategories.size > 0 ? `
                <button class="btn btn-sm btn-link text-secondary text-decoration-none p-0" onclick="clearCategoryFilters()">
                    Limpiar Filtros (${selectedCategories.size})
                </button>
            ` : ''}
        </div>

        <!-- Filtros compactos -->
        <div class="mb-3 p-2 card-dark rounded">
            <small class="text-secondary d-block mb-1 text-uppercase fw-bold" style="font-size: 0.7rem;">Filtrar por Categoría:</small>
            <div class="d-flex flex-wrap">
                ${filterButtonsHTML}
            </div>
        </div>

        <!-- Secciones compactas por Estado -->
        <div class="d-flex flex-column gap-2">
    ${renderStatusSection("Pending", "text-primary", "card-status-pending")}
    ${renderStatusSection("Dropped", "text-danger", "card-status-inactive")}
    ${renderStatusSection("Completed", "text-success", "card-status-complete")}
</div>
    `;
}

function renderStatusSection(statusName, textColorClass, cardBorderClass) {
    const filteredGames = backlogData.filter(game => {
        const matchStatus = (game.status || "").toLowerCase() === statusName.toLowerCase();
        const matchCategory = selectedCategories.size === 0 ||
            game.categories.some(cat => selectedCategories.has(cat));

        return matchStatus && matchCategory;
    });

    const sectionId = `collapse-status-${statusName.toLowerCase()}`;

    const cardsHTML = filteredGames.map(game => {
        const categoriesBadges = game.categories
            .map(cat => `<span class="badge badge-category me-1">${capitalize(cat)}</span>`)
            .join("");

        const mandatoryBadge = game.mandatory
            ? `<span class="badge bg-warning text-dark me-1" style="font-size: 0.65rem;">Obligatorio</span>`
            : "";

        return `
            <div class="col-sm-6 col-md-4 col-xl-3">
                <div class="card card-dark h-100 p-2 px-3 ${cardBorderClass}">
                    <div class="card-body p-0">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <h2 class="h6 card-title fw-bold text-light mb-0 text-truncate" title="${game.name}">${game.name}</h2>
                            ${mandatoryBadge}
                        </div>
                        <div class="mt-1">
                            ${categoriesBadges}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    return `
        <div class="border-bottom border-subtle-custom pb-2">
            <button 
                class="status-header-btn d-flex justify-content-between align-items-center" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#${sectionId}" 
                aria-expanded="true" 
                aria-controls="${sectionId}"
            >
                <div class="d-flex align-items-center gap-2">
                    <span class="fs-5 fw-bold ${textColorClass}">${statusName}</span>
                    <span class="badge bg-secondary rounded-pill" style="font-size: 0.75rem;">${filteredGames.length}</span>
                </div>
                <small class="text-secondary" style="font-size: 0.75rem;">&#9660; Plegar / Desplegar</small>
            </button>

            <div class="collapse show mt-2" id="${sectionId}">
                ${filteredGames.length > 0
            ? `<div class="row g-2">${cardsHTML}</div>`
            : `<p class="text-secondary small fst-italic mb-0" style="font-size: 0.8rem;">No hay elementos en este estado.</p>`
        }
            </div>
        </div>
    `;
}

function toggleCategoryFilter(category) {
    if (selectedCategories.has(category)) {
        selectedCategories.delete(category);
    } else {
        selectedCategories.add(category);
    }
    document.getElementById("app-content").innerHTML = renderBacklogView();
}

function clearCategoryFilters() {
    selectedCategories.clear();
    document.getElementById("app-content").innerHTML = renderBacklogView();
}
//#endregion

//#region 9. Vista - [5] Configuración y Burnout
function renderSettingsView() {
    return `<h1 class="h4 mb-2 fw-bold">Configuración y Burnout</h1><p class="text-secondary small">Ajuste de parámetros generales.</p>`;
}
//#endregion