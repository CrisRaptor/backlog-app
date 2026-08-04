//#region 1. Estado Global, Constantes y SVG
let backlogData = [];
let editingItemIndex = null;
let selectedCategories = new Set();

let hasUnsavedChanges = false;
let pendingSwitchIndex = null;
let currentEditCategories = [];
let editSearchTerm = "";

// Configuración de la API REST de GitHub
const GITHUB_CONFIG = {
    token: localStorage.getItem("github_token"),
    owner: "CrisRaptor",
    repo: "backlog-app",
    folder: "data"
};

// Iconos SVG personalizados para el Dashboard principal
const CARD_ICONS = {
    newQuest: `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
         <path fill-rule="evenodd" clip-rule="evenodd" d="M14.3675 2.15671C14.7781 2.01987 15.2219 2.01987 15.6325 2.15671L20.6325 3.82338C21.4491 4.09561 22 4.85988 22 5.72074V19.6126C22 20.9777 20.6626 21.9416 19.3675 21.5099L15 20.0541L9.63246 21.8433C9.22192 21.9801 8.77808 21.9801 8.36754 21.8433L3.36754 20.1766C2.55086 19.9044 2 19.1401 2 18.2792V4.38741C2 3.0223 3.33739 2.05836 4.63246 2.49004L9 3.94589L14.3675 2.15671ZM15 4.05408L9.63246 5.84326C9.22192 5.9801 8.77808 5.9801 8.36754 5.84326L4 4.38741V18.2792L9 19.9459L14.3675 18.1567C14.7781 18.0199 15.2219 18.0199 15.6325 18.1567L20 19.6126V5.72074L15 4.05408ZM13.2929 8.29288C13.6834 7.90235 14.3166 7.90235 14.7071 8.29288L15.5 9.08577L16.2929 8.29288C16.6834 7.90235 17.3166 7.90235 17.7071 8.29288C18.0976 8.6834 18.0976 9.31657 17.7071 9.70709L16.9142 10.5L17.7071 11.2929C18.0976 11.6834 18.0976 12.3166 17.7071 12.7071C17.3166 13.0976 16.6834 13.0976 16.2929 12.7071L15.5 11.9142L14.7071 12.7071C14.3166 13.0976 13.6834 13.0976 13.2929 12.7071C12.9024 12.3166 12.9024 11.6834 13.2929 11.2929L14.0858 10.5L13.2929 9.70709C12.9024 9.31657 12.9024 8.6834 13.2929 8.29288ZM6 16C6.55228 16 7 15.5523 7 15C7 14.4477 6.55228 14 6 14C5.44772 14 5 14.4477 5 15C5 15.5523 5.44772 16 6 16ZM9 12C9 12.5523 8.55228 13 8 13C7.44772 13 7 12.5523 7 12C7 11.4477 7.44772 11 8 11C8.55228 11 9 11.4477 9 12ZM11 12C11.5523 12 12 11.5523 12 11C12 10.4477 11.5523 9.99998 11 9.99998C10.4477 9.99998 10 10.4477 10 11C10 11.5523 10.4477 12 11 12Z"
      </svg>`,
    quests: `<svg viewBox="0 0 24 24" fill="currentColor">
         <path id="Shape" d="M10.75,1.5A2.25,2.25,0,0,1,13,3.75v9.028h1.5V3.75A3.75,3.75,0,0,0,10.75,0H.75a.75.75,0,0,0,0,1.5C1.669,1.5,2,1.831,2,2.75v11A3.75,3.75,0,0,0,5.75,17.5h8V16h-8A2.25,2.25,0,0,1,3.5,13.75v-11A3.392,3.392,0,0,0,3.285,1.5Z" transform="translate(4.25 3.25)"/>
         <path id="Shape-2" data-name="Shape" d="M7.765,17.5A3.294,3.294,0,0,0,10.738,16H7.754C9.307,16,10,15,10,12.749a.751.751,0,0,1,.751-.75h8a.751.751,0,0,1,.75.75v1a3.755,3.755,0,0,1-3.75,3.75ZM10.738,16H15.75A2.253,2.253,0,0,0,18,13.749V13.5H11.472A5.4,5.4,0,0,1,10.738,16ZM7,16.75A.72.72,0,0,1,7.749,16h0v1.5A.719.719,0,0,1,7,16.75ZM.75,5.5A.751.751,0,0,1,0,4.75v-2a2.75,2.75,0,1,1,5.5,0v2a.751.751,0,0,1-.75.75ZM1.5,2.75V4H4V2.75a1.25,1.25,0,1,0-2.5,0Z" transform="translate(2.25 3.25)"/>
      </svg>`,
    edit: `<svg viewBox="0 0 24 24" fill="currentColor">
         <path fill-rule="evenodd" clip-rule="evenodd" d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V7C19 7.55228 19.4477 8 20 8C20.5523 8 21 7.55228 21 7V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM22.1213 10.7071C20.9497 9.53553 19.0503 9.53553 17.8787 10.7071L16.1989 12.3869L11.2929 17.2929C11.1647 17.4211 11.0738 17.5816 11.0299 17.7575L10.0299 21.7575C9.94466 22.0982 10.0445 22.4587 10.2929 22.7071C10.5413 22.9555 10.9018 23.0553 11.2425 22.9701L15.2425 21.9701C15.4184 21.9262 15.5789 21.8353 15.7071 21.7071L20.5556 16.8586L22.2929 15.1213C23.4645 13.9497 23.4645 12.0503 22.2929 10.8787L22.1213 10.7071ZM18.3068 13.1074L19.2929 12.1213C19.6834 11.7308 20.3166 11.7308 20.7071 12.1213L20.8787 12.2929C21.2692 12.6834 21.2692 13.3166 20.8787 13.7071L19.8622 14.7236L18.3068 13.1074ZM16.8923 14.5219L18.4477 16.1381L14.4888 20.097L12.3744 20.6256L12.903 18.5112L16.8923 14.5219Z"    
      </svg>`,
    backlog: `<svg viewBox="0 0 24 24" fill="currentColor">
         <path d="M8 6L21 6.00078M8 12L21 12.0008M8 18L21 18.0007M3 6.5H4V5.5H3V6.5ZM3 12.5H4V11.5H3V12.5ZM3 18.5H4V17.5H3V18.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      </svg>`,
    settings: `<svg viewBox="0 0 24 24" fill="none">
<path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.2703 4.54104C14.2703 3.68995 13.5803 3 12.7292 3H11.2706C10.4195 3 9.72953 3.68995 9.72953 4.54104C9.72953 5.19575 9.30667 5.76411 8.73133 6.07658C8.64137 6.12544 8.55265 6.17624 8.46522 6.22895C7.90033 6.56948 7.19241 6.65124 6.6199 6.32367C5.87282 5.89621 4.92082 6.15129 4.48754 6.89501L3.78312 8.10415C3.35155 8.84495 3.60624 9.79549 4.35038 10.2213C4.92043 10.5474 5.2042 11.1992 5.19031 11.8558C5.1893 11.9037 5.18879 11.9518 5.18879 12C5.18879 12.0482 5.1893 12.0963 5.19032 12.1443C5.20421 12.8009 4.92043 13.4526 4.3504 13.7787C3.60628 14.2045 3.35159 15.155 3.78315 15.8958L4.48759 17.105C4.92086 17.8487 5.87286 18.1038 6.61993 17.6763C7.19243 17.3488 7.90034 17.4305 8.46523 17.7711C8.55266 17.8238 8.64138 17.8746 8.73133 17.9234C9.30667 18.2359 9.72953 18.8042 9.72953 19.459C9.72953 20.3101 10.4195 21 11.2706 21H12.7292C13.5803 21 14.2703 20.3101 14.2703 19.459C14.2703 18.8042 14.6931 18.2359 15.2685 17.9234C15.3584 17.8746 15.4471 17.8238 15.5346 17.7711C16.0994 17.4305 16.8074 17.3488 17.3799 17.6763C18.1269 18.1038 19.0789 17.8487 19.5122 17.105L20.2167 15.8958C20.6482 15.1551 20.3935 14.2045 19.6494 13.7788C19.0794 13.4526 18.7956 12.8009 18.8095 12.1443C18.8105 12.0963 18.811 12.0482 18.811 12C18.811 11.9518 18.8105 11.9037 18.8095 11.8558C18.7956 11.1992 19.0794 10.5474 19.6494 10.2213C20.3936 9.79548 20.6482 8.84494 20.2167 8.10414L19.5123 6.89501C19.079 6.15128 18.127 5.8962 17.3799 6.32366C16.8074 6.65123 16.0995 6.56948 15.5346 6.22894C15.4471 6.17624 15.3584 6.12543 15.2685 6.07658C14.6931 5.76411 14.2703 5.19575 14.2703 4.54104Z" stroke="currentColor" stroke-width="2"/>   </svg>`
};

// Configuración global de la aplicación
let appSettings = JSON.parse(localStorage.getItem("app_settings")) || {
    gamesPerDayValid: 1
};

function saveAppSettings() {
    localStorage.setItem("app_settings", JSON.stringify(appSettings));
}

// Categorías con cuota por defecto = 1
const DEFAULT_ACTIVE_CATEGORIES = ["casual", "focus", "grindeo"];
//#endregion

//#region 2. Inicialización y Carga de Datos
document.addEventListener("DOMContentLoaded", async () => {
    await loadBacklogData();
    setupUnsavedWarning();
    updateSaveButtonIndicator();
    navigateTo("home");
});

async function loadBacklogData() {
    try {
        if (!GITHUB_CONFIG.token) {
            console.warn("⚠️ Atención: No se encontró 'github_token' en localStorage. Las peticiones a GitHub fallarán.");
        }
        console.log("Intentando obtener datos desde GitHub Remote...");

        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.folder}`,
            { headers: { Authorization: `token ${GITHUB_CONFIG.token}` } }
        );

        if (!response.ok) throw new Error(`Error en API GitHub: ${response.status}`);

        const files = await response.json();

        const jsonFiles = files
            .filter(f => f.name.endsWith(".json"))
            .sort((a, b) => b.name.localeCompare(a.name));

        if (jsonFiles.length === 0) throw new Error("No se encontraron archivos en /data");

        const latestFile = jsonFiles[0];
        const dataResponse = await fetch(latestFile.download_url);
        backlogData = await dataResponse.json();

        // Asegurar que todos los elementos tengan el atributo burnout por defecto si no lo tienen
        backlogData.forEach(item => {
            if (item.burnout === undefined) item.burnout = false;
        });

        localStorage.setItem("local_backup_data", JSON.stringify(backlogData));
        console.log(`✅ Carga exitosa desde GitHub: ${latestFile.name}`);

    } catch (error) {
        console.warn("⚠️ ERROR DE CONEXIÓN REMOTA CON GITHUB:", error.message);
        console.log("🔄 Buscando respaldo más reciente en local...");

        const localBackup = localStorage.getItem("local_backup_data");
        if (localBackup) {
            backlogData = JSON.parse(localBackup);
            console.log("✅ Datos cargados correctamente desde el almacenamiento local.");
        } else {
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

//#region 3. Persistencia Remota y Limpieza (GitHub API)
async function saveChangesToRemote() {
    const todayStr = new Date().toISOString().split("T")[0];
    const fileName = `${todayStr}.json`;
    const filePath = `${GITHUB_CONFIG.folder}/${fileName}`;

    const contentEncoded = btoa(unescape(encodeURIComponent(JSON.stringify(backlogData, null, 2))));

    try {
        let sha = null;
        const checkFile = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`,
            { headers: { Authorization: `token ${GITHUB_CONFIG.token}` } }
        );
        if (checkFile.ok) {
            const fileData = await checkFile.json();
            sha = fileData.sha;
        }

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
        updateSaveButtonIndicator(); // Restablece el aspecto del botón
        localStorage.setItem("local_backup_data", JSON.stringify(backlogData));

        await cleanupOldRemoteBackups();
        alert("¡Guardado remoto completado con éxito, Jefe!");

    } catch (error) {
        console.error("❌ Error al guardar en remoto:", error);
        alert("No se pudo conectar con GitHub. Se ha guardado una copia en la memoria local de la aplicación.");
        localStorage.setItem("local_backup_data", JSON.stringify(backlogData));
    }
}

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
            .sort((a, b) => b.name.localeCompare(a.name));

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

//#region 4. Control de Eventos de Salida
function setupUnsavedWarning() {
    window.addEventListener("beforeunload", (event) => {
        if (hasUnsavedChanges) {
            event.preventDefault();
            event.returnValue = "Tienes cambios sin guardar. ¿Seguro que deseas salir?";
        }
    });
}
//#endregion

//#region 5. Navegación y Enrutador SPA
async function navigateTo(viewName) {
    const container = document.getElementById("app-content");
    if (!container) return;

    switch (viewName) {
        case "home":
            container.innerHTML = renderHomeView();
            break;
        case "quests":
            container.innerHTML = await renderQuestsView();
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

//#region 6. Vista - Inicio (Dashboard)
function renderHomeView() {
    return `
        <h1 class="h3 mb-4 text-light fw-bold text-center">Panel Principal</h1>
        <div class="home-cards-grid">
            
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

//#region 7. Vista - Quests y Seguimiento
let loadedQuestsList = [];
let activeViewQuestIndex = null;

async function renderQuestsView() {
    const container = document.getElementById("app-content");

    if (loadedQuestsList.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary mb-3" role="status"></div>
                <h2 class="h5 text-light">Cargando Quests desde GitHub...</h2>
            </div>
        `;
        await fetchAllQuests();
    }

    if (activeViewQuestIndex !== null && loadedQuestsList[activeViewQuestIndex]) {
        return renderQuestDetailView(loadedQuestsList[activeViewQuestIndex]);
    }

    return renderQuestsMainDashboard();
}

async function fetchAllQuests() {
    loadedQuestsList = [];

    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/quests`,
            { headers: { Authorization: `token ${GITHUB_CONFIG.token}` } }
        );

        if (response.ok) {
            const files = await response.json();
            const jsonFiles = files.filter(f => f.name.endsWith(".json"));

            for (const file of jsonFiles) {
                try {
                    const res = await fetch(file.download_url);
                    if (res.ok) {
                        const qData = await res.json();
                        loadedQuestsList.push({ fileName: file.name, ...qData });
                    }
                } catch (e) {
                    console.warn("Error leyendo quest remota:", file.name, e);
                }
            }
        }
    } catch (error) {
        console.warn("No se pudo conectar con el directorio /quests/ de GitHub:", error);
    }

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("quests_")) {
            try {
                const localQ = JSON.parse(localStorage.getItem(key));
                const fileName = key.replace("quests_", "");
                if (!loadedQuestsList.some(q => q.fileName === fileName)) {
                    loadedQuestsList.push({ fileName, ...localQ });
                }
            } catch (e) {}
        }
    }

    loadedQuestsList.sort((a, b) => {
        const startA = a.date_range?.start || "";
        const startB = b.date_range?.start || "";
        return startB.localeCompare(startA);
    });
}

function renderQuestsMainDashboard() {
    const todayStr = new Date().toISOString().split("T")[0];

    const currentQuestIndex = loadedQuestsList.findIndex(q => {
        if (!q.date_range) return false;
        return todayStr >= q.date_range.start && todayStr <= q.date_range.end;
    });

    const currentQuest = currentQuestIndex !== -1 ? loadedQuestsList[currentQuestIndex] : null;

    return `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h1 class="h4 fw-bold text-light mb-0">Quests y Seguimiento</h1>
                <p class="text-secondary small mb-0">Consulta la quest activa o explora el histórico de misiones.</p>
            </div>
            <button class="btn btn-sm btn-outline-info" onclick="refreshQuestsList()">
                🔄 Recargar Quests
            </button>
        </div>

        <div class="card card-dark p-4 mb-4 border-primary shadow-lg position-relative overflow-hidden">
            <div class="d-flex justify-content-between align-items-center mb-3 border-bottom border-subtle-custom pb-2">
                <h2 class="h5 fw-bold text-primary mb-0 d-flex align-items-center gap-2">
                    <span>⚡</span> Quest Actual
                </h2>
                ${currentQuest ? '<span class="badge bg-success">Activa Ahora</span>' : '<span class="badge bg-secondary">Sin Quest Activa</span>'}
            </div>

            ${currentQuest ? `
                <div class="row align-items-center">
                    <div class="col-md-8 mb-3 mb-md-0">
                        <h3 class="h6 text-light fw-bold mb-1">
                            Rango: ${currentQuest.date_range.start} al ${currentQuest.date_range.end}
                        </h3>
                        <p class="text-secondary small mb-2">
                            Duración: <strong>${currentQuest.settings?.daysCount || currentQuest.days?.length || 0} días</strong> | Meta diaria: <strong>${currentQuest.settings?.gamesPerDayValid || 1} juego(s)</strong>
                        </p>
                        <div class="d-flex flex-wrap gap-1">
                            ${(currentQuest.settings?.selectedCategories || []).map(cat => `
                                <span class="badge badge-category">${capitalize(cat)}</span>
                            `).join('')}
                        </div>
                    </div>
                    <div class="col-md-4 text-md-end">
                        <button class="btn btn-primary fw-bold px-4 w-100 w-md-auto" onclick="openQuestDetail(${currentQuestIndex})">
                            👁️ Ver Quest Actual
                        </button>
                    </div>
                </div>
            ` : `
                <div class="text-center py-3">
                    <p class="text-secondary mb-3">No hay ninguna quest activa registrada para el día de hoy (${todayStr}).</p>
                    <button class="btn btn-outline-warning fw-bold" onclick="navigateTo('newQuest')">
                        🚀 Iniciar una Nueva Quest
                    </button>
                </div>
            `}
        </div>

        <div class="card card-dark p-4 border-subtle-custom shadow-sm">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h2 class="h5 fw-bold text-light mb-0 d-flex align-items-center gap-2">
                    <span>📜</span> Histórico de Quests (${loadedQuestsList.length})
                </h2>
            </div>

            ${loadedQuestsList.length === 0 ? `
                <p class="text-secondary fst-italic mb-0">No hay quests guardadas en el historial.</p>
            ` : `
                <div class="list-group list-group-flush bg-transparent">
                    ${loadedQuestsList.map((quest, idx) => `
                        <div class="list-group-item card-dark border-subtle-custom text-light mb-2 rounded d-flex justify-content-between align-items-center p-3">
                            <div>
                                <div class="d-flex align-items-center gap-2 mb-1">
                                    <h3 class="h6 fw-bold mb-0 text-light">
                                        Quest: ${quest.date_range?.start || 'S/F'} al ${quest.date_range?.end || 'S/F'}
                                    </h3>
                                    ${idx === currentQuestIndex ? '<span class="badge bg-success ms-2">Actual</span>' : ''}
                                </div>
                                <small class="text-secondary">
                                    Días: ${quest.settings?.daysCount || quest.days?.length || 0} | Meta: ${quest.settings?.gamesPerDayValid || 1} juego(s)/día
                                </small>
                            </div>
                            <button class="btn btn-sm btn-outline-light fw-bold" onclick="openQuestDetail(${idx})">
                                Ver Juegos ➔
                            </button>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

async function refreshQuestsList() {
    loadedQuestsList = [];
    activeViewQuestIndex = null;
    navigateTo('quests');
}

function openQuestDetail(index) {
    activeViewQuestIndex = index;
    navigateTo('quests');
}

function closeQuestDetail() {
    activeViewQuestIndex = null;
    navigateTo('quests');
}

function renderQuestDetailView(quest) {
    return `
        <div class="d-flex justify-content-between align-items-start mb-4 bg-dark p-3 rounded border border-subtle-custom position-relative">
            <div>
                <button class="btn btn-sm btn-outline-secondary mb-2" onclick="closeQuestDetail()">
                    ⬅️ Volver a Quests
                </button>
                <h1 class="h4 fw-bold text-light mb-1">
                    Misión: ${quest.date_range?.start} al ${quest.date_range?.end}
                </h1>
                <p class="text-secondary small mb-0">
                    ID: <code class="text-info">${quest.quest_id || quest.fileName}</code> | Solo lectura
                </p>
            </div>

            <div>
                <button class="btn btn-warning text-dark fw-bold btn-sm shadow-sm" onclick="inspectQuestHistory('${quest.date_range?.start}')">
                    📜 Ver Archivos History
                </button>
            </div>
        </div>

        <div class="row g-3">
            ${(quest.days || []).map((dayData, dIdx) => {
                const selectedTasks = (dayData.tasks || []).filter(t => t.selected);
                const mandatoryTasks = dayData.mandatoryTasks || [];

                return `
                    <div class="col-md-6 col-lg-4">
                        <div class="card card-dark h-100 p-3 border-subtle-custom shadow-sm">
                            <div class="d-flex justify-content-between align-items-center mb-2 border-bottom border-subtle-custom pb-2">
                                <h2 class="h6 fw-bold text-info mb-0">${dayData.label || `Día ${dIdx + 1}`}</h2>
                                <span class="badge bg-secondary">${selectedTasks.length} Juego(s)</span>
                            </div>

                            ${mandatoryTasks.length > 0 ? `
                                <div class="mb-2">
                                    <small class="text-warning fw-bold d-block mb-1" style="font-size: 0.7rem;">⚡ OBLIGATORIOS:</small>
                                    ${mandatoryTasks.map(m => `
                                        <div class="p-2 bg-dark-mandatory rounded mb-1 text-light small d-flex justify-content-between">
                                            <span>${m.name}</span>
                                            <span class="badge bg-warning text-dark">Obligatorio</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}

                            <small class="text-secondary fw-bold d-block mb-1" style="font-size: 0.7rem;">🎮 JUEGOS ELEGIDOS:</small>
                            ${selectedTasks.length > 0 ? selectedTasks.map(t => `
                                <div class="p-2 bg-dark border border-secondary rounded mb-1 text-light small d-flex justify-content-between align-items-center opacity-75">
                                    <span class="fw-bold">${t.name}</span>
                                    <span class="badge badge-category ms-1">${capitalize(t.slotCategory || t.category || '')}</span>
                                </div>
                            `).join('') : '<p class="text-secondary small fst-italic mb-0">Sin selección en este día.</p>'}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>

        <div class="modal fade" id="historyFilesModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content bg-dark text-light border-warning">
                    <div class="modal-header border-subtle-custom">
                        <h5 class="modal-title fw-bold text-warning d-flex align-items-center gap-2">
                            <span>📜</span> Archivos History Vinculados
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="history-modal-content">
                        <div class="text-center py-4">
                            <div class="spinner-border text-warning" role="status"></div>
                            <p class="text-secondary mt-2">Buscando archivos de historial en el repositorio...</p>
                        </div>
                    </div>
                    <div class="modal-footer border-subtle-custom">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function inspectQuestHistory(startDateStr) {
    if (!startDateStr) {
        alert("No se pudo identificar la fecha de inicio para buscar los archivos de historial, Jefe.");
        return;
    }

    const modalEl = new bootstrap.Modal(document.getElementById('historyFilesModal'));
    modalEl.show();

    const container = document.getElementById("history-modal-content");
    const initialFileName = `history_${startDateStr}.json`;
    const finalFileName = `history_${startDateStr}_final.json`;

    let initialData = null;
    let finalData = null;

    try {
        const resFinal = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/history/${finalFileName}`,
            { headers: { Authorization: `token ${GITHUB_CONFIG.token}` } }
        );
        if (resFinal.ok) {
            const dataFinal = await resFinal.json();
            finalData = JSON.parse(decodeURIComponent(escape(atob(dataFinal.content))));
        }
    } catch (e) {}

    try {
        const resInit = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/history/${initialFileName}`,
            { headers: { Authorization: `token ${GITHUB_CONFIG.token}` } }
        );
        if (resInit.ok) {
            const dataInit = await resInit.json();
            initialData = JSON.parse(decodeURIComponent(escape(atob(dataInit.content))));
        }
    } catch (e) {}

    if (!finalData) {
        const localFinal = localStorage.getItem(`history_history/${finalFileName}`) || localStorage.getItem(`history_${finalFileName}`);
        if (localFinal) finalData = JSON.parse(localFinal);
    }
    if (!initialData) {
        const localInit = localStorage.getItem(`history_history/${initialFileName}`) || localStorage.getItem(`history_${initialFileName}`);
        if (localInit) initialData = JSON.parse(localInit);
    }

    if (!initialData && !finalData) {
        container.innerHTML = `
            <div class="alert alert-danger mb-0">
                ⚠️ No se encontraron los archivos de historial (<code>${initialFileName}</code> ni <code>${finalFileName}</code>) para esta quest.
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <ul class="nav nav-tabs border-subtle-custom mb-3" id="historyTab" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active fw-bold" id="final-tab" data-bs-toggle="tab" data-bs-target="#tab-history-final" type="button" role="tab">
                    ✅ History Final (${finalFileName})
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link fw-bold" id="initial-tab" data-bs-toggle="tab" data-bs-target="#tab-history-initial" type="button" role="tab">
                    🎲 History Inicial (${initialFileName})
                </button>
            </li>
        </ul>

        <div class="tab-content" id="historyTabContent">
            <div class="tab-pane fade show active" id="tab-history-final" role="tabpanel">
                ${finalData ? `
                    <div class="mb-2 small text-secondary">
                        Estado: <span class="badge bg-success">${finalData.status || 'Accepted'}</span> | 
                        Fecha de aceptación: <strong>${finalData.accepted_at ? new Date(finalData.accepted_at).toLocaleString() : 'N/A'}</strong>
                    </div>
                    <pre class="bg-black text-success p-3 rounded border border-secondary" style="max-height: 350px; overflow-y: auto; font-size: 0.8rem;">${JSON.stringify(finalData, null, 2)}</pre>
                ` : `<p class="text-secondary fst-italic">Archivo ${finalFileName} no encontrado.</p>`}
            </div>

            <div class="tab-pane fade" id="tab-history-initial" role="tabpanel">
                ${initialData ? `
                    <div class="mb-2 small text-secondary">Configuración previa de la tirada (Roll):</div>
                    <pre class="bg-black text-info p-3 rounded border border-secondary" style="max-height: 350px; overflow-y: auto; font-size: 0.8rem;">${JSON.stringify(initialData, null, 2)}</pre>
                ` : `<p class="text-secondary fst-italic">Archivo ${initialFileName} no encontrado.</p>`}
            </div>
        </div>
    `;
}
//#endregion

//#region 8. Vista - Start New Quest
const savedQuestConfig = JSON.parse(localStorage.getItem("quest_last_config")) || {};

let newQuestState = {
    step: 'configure',
    daysCount: savedQuestConfig.daysCount || 7,
    gamesPerDayValid: savedQuestConfig.gamesPerDayValid || (appSettings.gamesPerDayValid || 1),
    useMandatory: savedQuestConfig.useMandatory !== undefined ? savedQuestConfig.useMandatory : true,
    selectedCategories: savedQuestConfig.selectedCategories || [],
    dayConfigs: savedQuestConfig.dayConfigs || {},
    generatedDays: [],
    activeDayIndex: 0,
    visitedDays: new Set()
};

function saveQuestConfig() {
    const configToSave = {
        daysCount: newQuestState.daysCount,
        gamesPerDayValid: newQuestState.gamesPerDayValid,
        useMandatory: newQuestState.useMandatory,
        selectedCategories: newQuestState.selectedCategories,
        dayConfigs: newQuestState.dayConfigs
    };
    localStorage.setItem("quest_last_config", JSON.stringify(configToSave));
}

function updateQuestGamesPerDayValid(val) {
    newQuestState.gamesPerDayValid = Math.max(1, parseInt(val, 10) || 1);
}

const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function renderNewQuestView() {
    if (newQuestState.step === 'configure') {
        return renderConfigureQuestStep();
    } else {
        return renderReviewQuestStep();
    }
}

function renderConfigureQuestStep() {
    const availableCategories = Array.from(
        new Set(backlogData.flatMap(item => item.categories || []))
    ).sort();

    if (newQuestState.selectedCategories.length === 0) {
        newQuestState.selectedCategories = [...availableCategories];
    }

    syncDayConfigs(availableCategories);

    return `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h1 class="h4 fw-bold text-light mb-0">Start New Quest</h1>
                <p class="text-secondary small mb-0">Configura los días, categorías y cuotas antes de generar.</p>
            </div>
            <button class="btn btn-primary fw-bold px-4" onclick="generateQuest()">
                🚀 Generar Quest
            </button>
        </div>

        <div class="card card-dark p-3 mb-4 shadow-sm border-subtle-custom">
            <h2 class="h6 fw-bold text-warning text-uppercase mb-3" style="letter-spacing: 0.5px;">Parámetros de la Quest</h2>
            
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label text-light fw-bold">📅 Días de la Quest</label>
                    <input type="number" class="form-control bg-dark text-light border-secondary" min="1" max="14" 
                        value="${newQuestState.daysCount}" onchange="updateQuestDays(this.value)">
                </div>

                <div class="col-md-6">
                    <label class="form-label text-light fw-bold">🎯 Meta diaria (Juegos a completar)</label>
                    <input type="number" class="form-control bg-dark text-light border-secondary" min="1" max="10" 
                        value="${newQuestState.gamesPerDayValid}" onchange="updateQuestGamesPerDayValid(this.value)">
                    <span class="text-secondary small">Mínimo de juegos a completar para marcar el día como válido.</span>
                </div>
            </div>
        </div>

        <div class="card card-dark p-3 mb-4 shadow-sm border-subtle-custom">
            <h2 class="h6 fw-bold text-warning text-uppercase mb-3" style="letter-spacing: 0.5px;">1. Ajustes Generales</h2>
            
            <div class="row g-3 align-items-center">
                <div class="col-md-4 d-flex align-items-center">
                    <div class="form-check form-switch mt-md-4">
                        <input class="form-check-input" type="checkbox" id="quest-mandatory-toggle" 
                            ${newQuestState.useMandatory ? 'checked' : ''} onchange="toggleQuestMandatory(this.checked)">
                        <label class="form-check-label text-light fw-bold small" for="quest-mandatory-toggle">
                            Utilizar elementos obligatorios
                        </label>
                    </div>
                </div>
            </div>

            <div class="mt-3 pt-3 border-top border-subtle-custom">
                <label class="form-label text-secondary small fw-bold d-block mb-2">Categorías activas</label>
                <div class="d-flex flex-wrap gap-2">
                    ${availableCategories.map(cat => {
                        const isSelected = newQuestState.selectedCategories.includes(cat);
                        return `
                            <button type="button" class="btn btn-sm ${isSelected ? "btn-primary" : "btn-outline-secondary"} rounded-pill" 
                                onclick="toggleQuestCategory('${cat}')">
                                ${isSelected ? '✓ ' : '+ '}${capitalize(cat)}
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>

        <div class="card card-dark p-3 mb-4 shadow-sm border-subtle-custom">
            <h2 class="h6 fw-bold text-info text-uppercase mb-3" style="letter-spacing: 0.5px;">2. Objetivos Diarios por Categoría</h2>
            ${newQuestState.selectedCategories.length === 0 ? `
                <p class="text-warning small fst-italic mb-0">Selecciona al menos una categoría arriba para continuar.</p>
            ` : `
                <div class="accordion" id="accordionQuestDays">
                    ${renderDailyScheduleAccordion()}
                </div>
            `}
        </div>
    `;
}

// Generación de Quest excluyendo elementos con burnout === true
async function generateQuest() {
    if (newQuestState.selectedCategories.length === 0) {
        alert("Por favor, selecciona al menos una categoría para poder generar la quest, Jefe.");
        return;
    }

    saveQuestConfig();

    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Pool de obligatorios pendientes (EXCLUYENDO BURNOUT)
    const mandatoryGames = backlogData.filter(g => g.mandatory && g.status !== "completed" && !g.burnout);

    // 2. Pool normal (EXCLUYENDO BURNOUT)
    const eligibleGames = backlogData.filter(item => {
        const matchesCategory = item.categories && item.categories.some(c => newQuestState.selectedCategories.includes(c));
        if (newQuestState.useMandatory && item.mandatory) return false;
        return matchesCategory && item.status !== "completed" && !item.burnout;
    });

    newQuestState.generatedDays = [];

    for (let i = 0; i < newQuestState.daysCount; i++) {
        const dayLabel = getDayLabel(i);
        const dayLimits = newQuestState.dayConfigs[dayLabel] || {};
        const mandatoryTasksForDay = [];
        const assignedGamesForDay = [];
        const usedGameNamesInDay = new Set();

        if (newQuestState.useMandatory) {
            mandatoryGames.forEach(g => {
                mandatoryTasksForDay.push({
                    name: g.name,
                    isMandatory: true,
                    categories: g.categories || [],
                    selected: true,
                    completed: false
                });
            });
        }

        newQuestState.selectedCategories.forEach(cat => {
            const rawQuota = dayLimits[cat];
            let limit = 0;

            if (rawQuota === "any") {
                limit = 999;
            } else {
                limit = parseInt(rawQuota, 10) || 0;
            }

            if (limit <= 0) return;

            const catGames = eligibleGames.filter(g => 
                g.categories && g.categories.includes(cat) && !usedGameNamesInDay.has(g.name)
            );

            if (catGames.length > 0) {
                const countToPick = Math.min(limit, catGames.length);
                const shuffled = [...catGames].sort(() => 0.5 - Math.random());
                const picked = shuffled.slice(0, countToPick);

                picked.forEach(g => {
                    usedGameNamesInDay.add(g.name);
                    assignedGamesForDay.push({
                        name: g.name,
                        slotCategory: cat,
                        isMandatory: false,
                        categories: g.categories || [cat],
                        selected: false,
                        completed: false
                    });
                });
            }
        });

        newQuestState.generatedDays.push({
            day: i + 1,
            label: dayLabel,
            mandatoryTasks: mandatoryTasksForDay,
            tasks: assignedGamesForDay
        });
    }

    const initialHistoryPayload = {
        configuracion: { ...newQuestState },
        opciones: newQuestState.generatedDays
    };

    const historyFileName = `history_${todayStr}.json`;
    await commitJsonFile(`history/${historyFileName}`, initialHistoryPayload, `Crear historial inicial: ${historyFileName}`);

    newQuestState.step = 'review';
    newQuestState.activeDayIndex = 0;
    newQuestState.visitedDays = new Set([0]);

    navigateTo('newQuest');
}

function renderReviewQuestStep() {
    const isQuestReady = areAllDaysValid();
    const validDaysCount = newQuestState.generatedDays.filter(d => isDayValid(d)).length;
    const activeDay = newQuestState.generatedDays[newQuestState.activeDayIndex];

    return `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h1 class="h4 fw-bold text-light mb-0">Revisión de Quest</h1>
                <p class="text-secondary small mb-0">Selecciona exactamente <strong>${newQuestState.gamesPerDayValid}</strong> juego(s) por día para validar la quest.</p>
            </div>
            <div class="d-flex gap-2">
                <button class="btn btn-outline-secondary btn-sm" onclick="resetToConfigure()">
                    ⚙️ Reconfigurar
                </button>
                <button class="btn ${isQuestReady ? 'btn-success' : 'btn-secondary'} fw-bold px-4" 
                    id="btn-accept-quest"
                    ${!isQuestReady ? 'disabled' : ''} 
                    onclick="acceptAndGenerateQuest()">
                    ${isQuestReady ? '✅ Aceptar Quest' : `🔒 Valida los días (${validDaysCount}/${newQuestState.daysCount})`}
                </button>
            </div>
        </div>

        <div class="mb-4">
            <label class="form-label text-secondary small fw-bold mb-2">Navegación de días:</label>
            <div class="d-flex overflow-auto gap-2 pb-2" style="scrollbar-width: thin;">
                ${newQuestState.generatedDays.map((day, idx) => {
                    const isActive = idx === newQuestState.activeDayIndex;
                    const isValid = isDayValid(day);
                    const selectedInDay = day.tasks.filter(t => t.selected).length;

                    let btnStyle = 'btn-outline-secondary';
                    if (isActive) {
                        btnStyle = 'btn-primary shadow-lg';
                    } else if (isValid) {
                        btnStyle = 'btn-outline-success';
                    }

                    return `
                        <button class="btn ${btnStyle} fw-bold text-nowrap px-3 py-2 d-flex align-items-center gap-2" 
                            onclick="selectReviewDay(${idx})">
                            <span>Día ${idx + 1}</span>
                            ${isValid 
                                ? '<span class="badge bg-success text-white rounded-circle" title="Día válido">✓</span>' 
                                : `<span class="badge bg-dark text-warning border border-warning" title="Seleccionados">${selectedInDay}/${newQuestState.gamesPerDayValid}</span>`
                            }
                        </button>
                    `;
                }).join('')}
            </div>
        </div>

        <div class="card card-dark p-3 mb-4 shadow-sm border-subtle-custom">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h2 class="h6 fw-bold text-info text-uppercase mb-0">${activeDay ? activeDay.label : ''}</h2>
                ${activeDay ? `
                    <span class="badge ${isDayValid(activeDay) ? 'bg-success' : 'bg-warning text-dark'} fw-bold">
                        ${isDayValid(activeDay) ? '✓ Día Válido' : `Seleccionados: ${activeDay.tasks.filter(t => t.selected).length} / ${newQuestState.gamesPerDayValid}`}
                    </span>
                ` : ''}
            </div>
            
            <div class="row g-3">
                ${renderDayTasksList(activeDay)}
            </div>
        </div>
    `;
}

function getSelectedGamesMap() {
    const map = new Map();
    newQuestState.generatedDays.forEach((dayData, dIdx) => {
        dayData.tasks.forEach(task => {
            if (task.selected) {
                map.set(task.name, dIdx + 1);
            }
        });
    });
    return map;
}

function renderDayTasksList(dayData) {
    if (!dayData) return '';

    const selectedMap = getSelectedGamesMap();
    const currentDayNum = newQuestState.activeDayIndex + 1;

    let html = '';

    if (newQuestState.useMandatory && dayData.mandatoryTasks && dayData.mandatoryTasks.length > 0) {
        html += `
            <div class="col-12 mb-3">
                <h4 class="h6 text-warning fw-bold border-bottom border-secondary pb-1">⚡ Tareas Obligatorias (Auto-seleccionadas, no consumen cuota)</h4>
                <div class="row g-2">
                    ${dayData.mandatoryTasks.map(mTask => `
                        <div class="col-md-6">
                            <div class="p-3 bg-dark-mandatory rounded d-flex justify-content-between align-items-center">
                                <div>
                                    <h3 class="h6 fw-bold text-light mb-0">${mTask.name}</h3>
                                    <span class="badge bg-warning text-dark mt-1">Obligatorio</span>
                                </div>
                                <span class="badge bg-success">✓ Auto-marcado</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    if (!dayData.tasks || dayData.tasks.length === 0) {
        return html + `<div class="col-12"><p class="text-secondary fst-italic">No hay opciones configuradas para este día.</p></div>`;
    }

    html += `<div class="col-12"><h4 class="h6 text-info fw-bold border-bottom border-secondary pb-1">🎮 Selección Normal del Día</h4></div>`;

    html += dayData.tasks.map((task, taskIdx) => {
        const isSelected = !!task.selected;
        const slotCat = task.slotCategory || task.category;
        const otherCats = (task.categories || []).filter(c => c.toLowerCase() !== slotCat.toLowerCase());

        const selectedOnDay = selectedMap.get(task.name);
        const isSelectedOnOtherDay = selectedOnDay !== undefined && selectedOnDay !== currentDayNum;

        let cardClass = "border-subtle-custom bg-dark";
        if (isSelected) {
            cardClass = "card-task-selected";
        } else if (isSelectedOnOtherDay) {
            cardClass = "border-secondary bg-dark opacity-50";
        }

        return `
            <div class="col-md-6">
                <div class="p-3 ${cardClass} rounded d-flex justify-content-between align-items-center transition-all">
                    <div>
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <h3 class="h6 fw-bold text-light mb-0">${task.name}</h3>
                            ${isSelected ? '<span class="badge bg-success">Seleccionado</span>' : ''}
                            ${isSelectedOnOtherDay ? `<span class="badge bg-danger">Ya elegido en Día ${selectedOnDay}</span>` : ''}
                        </div>
                        <div class="d-flex flex-wrap gap-1 align-items-center mt-1">
                            <span class="badge bg-warning text-dark fw-bold me-1 border border-warning">⭐ ${capitalize(slotCat)}</span>
                            ${otherCats.map(c => `<span class="badge badge-category me-1">${capitalize(c)}</span>`).join('')}
                        </div>
                    </div>
                    <div class="d-flex gap-2 align-items-center ms-2">
                        <button type="button" class="btn btn-sm btn-outline-warning" 
                            onclick="swapGameForTask(${newQuestState.activeDayIndex}, ${taskIdx}, '${slotCat}')">
                            🔄
                        </button>
                        <button type="button" 
                            class="btn btn-sm ${isSelected ? 'btn-success' : 'btn-outline-light'} fw-bold" 
                            ${isSelectedOnOtherDay && !isSelected ? 'disabled title="Juego ya seleccionado en otro día"' : ''}
                            onclick="toggleTaskSelection(${newQuestState.activeDayIndex}, ${taskIdx})">
                            ${isSelected ? '✓ Marcado' : (isSelectedOnOtherDay ? '🔒 Bloqueado' : '+ Seleccionar')}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return html;
}

function toggleTaskSelection(dayIdx, taskIdx) {
    const day = newQuestState.generatedDays[dayIdx];
    if (!day || !day.tasks[taskIdx]) return;

    const task = day.tasks[taskIdx];
    const selectedMap = getSelectedGamesMap();
    const selectedOnDay = selectedMap.get(task.name);

    if (!task.selected && selectedOnDay !== undefined && selectedOnDay !== (dayIdx + 1)) {
        alert(`El juego "${task.name}" ya ha sido seleccionado en el Día ${selectedOnDay}, Jefe.`);
        return;
    }

    task.selected = !task.selected;
    navigateTo('newQuest');
}

// Reemplazo de tarea excluyendo también burnout === true
function swapGameForTask(dayIdx, taskIdx, slotCategory) {
    const dayData = newQuestState.generatedDays[dayIdx];
    const currentTask = dayData.tasks[taskIdx];

    const gamesToday = new Set(dayData.tasks.map(t => t.name));

    const eligiblePool = backlogData.filter(g => {
        const matchesCat = g.categories && g.categories.includes(slotCategory);
        const matchesMandatory = newQuestState.useMandatory ? true : !g.mandatory;
        const isNotCompleted = g.status !== "completed";
        const isNotBurnout = !g.burnout; // EXCLUIR BURNOUT
        const notAssignedToday = !gamesToday.has(g.name) || g.name === currentTask.name;
        return matchesCat && matchesMandatory && isNotCompleted && isNotBurnout && notAssignedToday && g.name !== currentTask.name;
    });

    if (eligiblePool.length === 0) {
        alert(`No hay otros juegos en el backlog con la categoría "${slotCategory}" que no estén en burnout o asignados hoy, Jefe.`);
        return;
    }

    const newGame = eligiblePool[Math.floor(Math.random() * eligiblePool.length)];

    dayData.tasks[taskIdx] = {
        name: newGame.name,
        slotCategory: slotCategory,
        categories: newGame.categories || [slotCategory],
        completed: false
    };

    navigateTo('newQuest');
}

function selectReviewDay(idx) {
    newQuestState.activeDayIndex = idx;
    newQuestState.visitedDays.add(idx);
    navigateTo('newQuest');
}

function resetToConfigure() {
    newQuestState.step = 'configure';
    navigateTo('newQuest');
}

async function acceptAndGenerateQuest() {
    if (newQuestState.visitedDays.size < newQuestState.daysCount) {
        alert("Debes elegir/revisar cada día de la quest antes de finalizar la selección, Jefe.");
        return;
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + (newQuestState.daysCount - 1));

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    const questFileName = `quest_${startDateStr}_al_${endDateStr}.json`;
    const historyFinalFileName = `history_${startDateStr}_final.json`;

    const questPayload = {
        quest_id: `quest_${Date.now()}`,
        date_range: { start: startDateStr, end: endDateStr },
        settings: {
            daysCount: newQuestState.daysCount,
            gamesPerDayValid: newQuestState.gamesPerDayValid,
            useMandatory: newQuestState.useMandatory,
            selectedCategories: newQuestState.selectedCategories
        },
        days: newQuestState.generatedDays
    };

    const historyFinalPayload = {
        configuracion: {
            daysCount: newQuestState.daysCount,
            useMandatory: newQuestState.useMandatory,
            selectedCategories: newQuestState.selectedCategories,
            dayConfigs: newQuestState.dayConfigs,
            gamesPerDayValid: newQuestState.gamesPerDayValid
        },
        opciones: newQuestState.generatedDays,
        status: "accepted",
        accepted_at: new Date().toISOString()
    };

    await commitJsonFile(`quests/${questFileName}`, questPayload, `Crear quest finalizada: ${questFileName}`);
    await commitJsonFile(`history/${historyFinalFileName}`, historyFinalPayload, `Crear historial final: ${historyFinalFileName}`);

    alert(`¡Quest aceptada con éxito, Jefe!\n\nArchivos guardados correctamente:\n- ${questFileName}\n- ${historyFinalFileName}`);

    newQuestState.step = 'configure';
    newQuestState.visitedDays = new Set();
    navigateTo('quests');
}

async function commitJsonFile(filePath, payload, commitMessage) {
    const contentEncoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload, null, 2))));

    try {
        let sha = null;
        const checkFile = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`,
            { headers: { Authorization: `token ${GITHUB_CONFIG.token}` } }
        );

        if (checkFile.ok) {
            const fileData = await checkFile.json();
            sha = fileData.sha;
        }

        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `token ${GITHUB_CONFIG.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: commitMessage,
                    content: contentEncoded,
                    sha: sha || undefined
                })
            }
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

    } catch (error) {
        console.warn(`⚠️ Fallo en guardado remoto (${filePath}), creando backup en localStorage:`, error);
        localStorage.setItem(filePath.replace('/', '_'), JSON.stringify(payload));
    }
}

function syncDayConfigs(availableCategories) {
    for (let i = 0; i < newQuestState.daysCount; i++) {
        const dayLabel = getDayLabel(i);
        if (!newQuestState.dayConfigs[dayLabel]) {
            newQuestState.dayConfigs[dayLabel] = {};
        }
        availableCategories.forEach(cat => {
            if (newQuestState.dayConfigs[dayLabel][cat] === undefined) {
                const isDefaultActive = DEFAULT_ACTIVE_CATEGORIES.includes(cat.toLowerCase());
                newQuestState.dayConfigs[dayLabel][cat] = isDefaultActive ? 1 : 0;
            }
        });
    }
}

function getDayLabel(index) {
    const today = new Date();
    const todayWeekdayIndex = (today.getDay() + 6) % 7; 
    const currentDayIndex = (todayWeekdayIndex + index) % 7;
    const dayName = WEEKDAYS[currentDayIndex];

    const targetDate = new Date();
    targetDate.setDate(today.getDate() + index);
    const dayOfMonth = String(targetDate.getDate()).padStart(2, '0');
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');

    return `Día ${index + 1} (${dayName} ${dayOfMonth}/${month})`;
}

function updateQuestDays(value) {
    const days = parseInt(value, 10);
    if (days >= 1 && days <= 14) {
        newQuestState.daysCount = days;
        navigateTo('newQuest');
    }
}

function toggleQuestMandatory(checked) {
    newQuestState.useMandatory = checked;
}

function toggleQuestCategory(cat) {
    if (newQuestState.selectedCategories.includes(cat)) {
        newQuestState.selectedCategories = newQuestState.selectedCategories.filter(c => c !== cat);
    } else {
        newQuestState.selectedCategories.push(cat);
    }
    navigateTo('newQuest');
}

function renderDailyScheduleAccordion() {
    let html = "";
    for (let i = 0; i < newQuestState.daysCount; i++) {
        const dayLabel = getDayLabel(i);
        const collapseId = `collapseDay_${i}`;

        html += `
            <div class="accordion-item bg-dark border-subtle-custom text-light mb-2 rounded">
                <h2 class="accordion-header" id="heading_${i}">
                    <button class="accordion-button bg-dark text-light border-0 shadow-none ${i !== 0 ? 'collapsed' : ''}" 
                        type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}">
                        <strong class="text-primary me-2">${dayLabel}</strong>
                    </button>
                </h2>
                <div id="${collapseId}" class="accordion-collapse collapse ${i === 0 ? 'show' : ''}" data-bs-parent="#accordionQuestDays">
                    <div class="accordion-body border-top border-subtle-custom pt-3">
                        <div class="d-flex justify-content-end mb-2">
                            <button type="button" class="btn btn-sm btn-outline-info" onclick="applyDayToAll('${dayLabel}')">
                                📋 Aplicar esta configuración a todos los días
                            </button>
                        </div>
                        <div class="row g-2">
                            ${newQuestState.selectedCategories.map(cat => {
                                const currentVal = newQuestState.dayConfigs[dayLabel]?.[cat] ?? "any";
                                return `
                                    <div class="col-md-6 col-lg-4">
                                        <div class="p-2 card-dark border-subtle-custom rounded d-flex justify-content-between align-items-center">
                                            <span class="badge badge-category fs-6">${capitalize(cat)}</span>
                                            <select class="form-select form-select-sm bg-dark text-light border-secondary" style="width: auto;"
                                                onchange="updateCategoryQuota('${dayLabel}', '${cat}', this.value)">
                                                <option value="any" ${currentVal === "any" ? 'selected' : ''}>Cualquier cantidad</option>
                                                <option value="0" ${currentVal === 0 || currentVal === "0" ? 'selected' : ''}>0 juegos</option>
                                                <option value="1" ${currentVal === 1 || currentVal === "1" ? 'selected' : ''}>1 juego</option>
                                                <option value="2" ${currentVal === 2 || currentVal === "2" ? 'selected' : ''}>2 juegos</option>
                                                <option value="3" ${currentVal === 3 || currentVal === "3" ? 'selected' : ''}>3 juegos</option>
                                            </select>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    return html;
}

function updateCategoryQuota(dayLabel, category, value) {
    if (!newQuestState.dayConfigs[dayLabel]) {
        newQuestState.dayConfigs[dayLabel] = {};
    }
    newQuestState.dayConfigs[dayLabel][category] = value === "any" ? "any" : parseInt(value, 10);
}

function applyDayToAll(sourceDayLabel) {
    const sourceConfig = { ...newQuestState.dayConfigs[sourceDayLabel] };
    for (let i = 0; i < newQuestState.daysCount; i++) {
        const targetDayLabel = getDayLabel(i);
        newQuestState.dayConfigs[targetDayLabel] = { ...sourceConfig };
    }
    navigateTo('newQuest');
    alert(`¡Configuración de ${sourceDayLabel} duplicada en todos los días!`);
}

function isDayValid(dayData) {
    if (!dayData || !dayData.tasks) return false;
    const selectedCount = dayData.tasks.filter(t => t.selected).length;
    return selectedCount === newQuestState.gamesPerDayValid;
}

function areAllDaysValid() {
    if (!newQuestState.generatedDays || newQuestState.generatedDays.length === 0) return false;
    return newQuestState.generatedDays.every(day => isDayValid(day));
}
//#endregion

//#region 9. Vista - Gestión y CRUD de Elementos
function renderEditView() {
    return `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h1 class="h4 fw-bold text-light mb-0">Gestión de Elementos</h1>
                <p class="text-secondary small mb-0">Haz clic en cualquier elemento para editarlo, marcar burnout o eliminarlo.</p>
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
                    <!-- Nombre -->
                    <div class="col-md-3">
                        <label class="form-label text-secondary small fw-bold">Nombre</label>
                        <input type="text" id="form-item-name" class="form-control bg-dark text-light border-secondary" required placeholder="Ej: Elden Ring" oninput="markAsDirty()">
                    </div>

                    <!-- Nombre Imagen -->
                    <div class="col-md-3">
                        <label class="form-label text-secondary small fw-bold">Imagen (img_name)</label>
                        <input type="text" id="form-item-img" class="form-control bg-dark text-light border-secondary" placeholder="Ej: elden_ring.jpg" oninput="markAsDirty()">
                    </div>

                    <!-- Estado -->
                    <div class="col-md-2">
                        <label class="form-label text-secondary small fw-bold">Estado</label>
                        <select id="form-item-status" class="form-select bg-dark text-light border-secondary" required onchange="markAsDirty()">
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="dropped">Dropped</option>
                        </select>
                    </div>

                    <!-- Mandatory Switch -->
                    <div class="col-md-2 d-flex align-items-center">
                        <div class="form-check form-switch mt-md-4">
                            <input class="form-check-input" type="checkbox" role="switch" id="form-item-mandatory" onchange="markAsDirty()">
                            <label class="form-check-label text-light fw-bold small" for="form-item-mandatory">Obligatorio</label>
                        </div>
                    </div>

                    <!-- Burnout Switch / Botón en el CRUD -->
                    <div class="col-md-2 d-flex align-items-center">
                        <div class="form-check form-switch mt-md-4">
                            <input class="form-check-input" type="checkbox" role="switch" id="form-item-burnout" onchange="markAsDirty()">
                            <label class="form-check-label text-warning fw-bold small" for="form-item-burnout">🔥 Burnout</label>
                        </div>
                    </div>

                    <!-- Sistema Avanzado de Categorías -->
                    <div class="col-12 mt-4 border-top border-subtle-custom pt-3">
                        <label class="form-label text-secondary small fw-bold">Categorías del elemento</label>
                        
                        <input type="text" id="form-item-category-input" class="form-control bg-dark text-light border-secondary mb-2" placeholder="Escribe una categoría y presiona Enter..." onkeydown="handleCategoryEnter(event)">
                        
                        <div id="current-categories-container" class="d-flex flex-wrap gap-2 mb-3 min-h-30"></div>

                        <small class="text-secondary d-block mb-1" style="font-size: 0.75rem;">Sugerencias (haz clic para añadir):</small>
                        <div id="suggested-categories-container" class="d-flex flex-wrap gap-2"></div>
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
        <div class="edit-cards-grid" id="items-name-list">
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

function generateEditListHTML() {
    const term = editSearchTerm.toLowerCase();

    const sortedItems = backlogData
        .map((item, index) => ({ item, originalIndex: index }))
        .sort((a, b) => a.item.name.localeCompare(b.item.name, 'es', { sensitivity: 'base' }));

    return sortedItems.map(({ item, originalIndex }) => {
        if (term && !item.name.toLowerCase().includes(term)) return '';
        
        const isActive = editingItemIndex === originalIndex 
            ? 'btn-primary text-white border-primary' 
            : 'btn-outline-secondary text-light border-subtle-custom';

        return `
            <button type="button" class="btn btn-sm btn-edit-grid d-flex align-items-center justify-content-center ${isActive}" onclick="attemptOpenEditForm(${originalIndex})" title="${item.name}">
                <span class="fw-bold text-truncate">${item.burnout ? '🔥 ' : ''}${item.name}</span>
            </button>
        `;
    }).join('');
}

function filterEditList(term) {
    editSearchTerm = term;
    document.getElementById("items-name-list").innerHTML = generateEditListHTML();
}

function markAsDirty() {
    hasUnsavedChanges = true;
    updateSaveButtonIndicator();
}

function attemptOpenEditForm(index) {
    if (editingItemIndex === index) return;

    if (hasUnsavedChanges) {
        pendingSwitchIndex = index;
        const unsavedModal = new bootstrap.Modal(document.getElementById('unsavedChangesModal'));
        unsavedModal.show();
    } else {
        openEditForm(index);
    }
}

function attemptCloseEditForm() {
    if (hasUnsavedChanges) {
        pendingSwitchIndex = "CLOSE";
        const unsavedModal = new bootstrap.Modal(document.getElementById('unsavedChangesModal'));
        unsavedModal.show();
    } else {
        closeEditForm();
    }
}

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

function openEditForm(index) {
    editingItemIndex = index;
    hasUnsavedChanges = false;
    currentEditCategories = [];

    const panel = document.getElementById("edit-form-panel");
    const title = document.getElementById("form-panel-title");
    const deleteBtn = document.getElementById("btn-delete-item");

    panel.classList.remove("d-none");

    document.getElementById("items-name-list").innerHTML = generateEditListHTML();

    if (index !== null && backlogData[index]) {
        const item = backlogData[index];
        title.textContent = `Editar: ${item.name}`;
        document.getElementById("form-item-name").value = item.name || "";
        document.getElementById("form-item-img").value = item.img_name || "";
        document.getElementById("form-item-status").value = item.status || "pending";
        document.getElementById("form-item-mandatory").checked = !!item.mandatory;
        document.getElementById("form-item-burnout").checked = !!item.burnout;
        currentEditCategories = [...(item.categories || [])];
        deleteBtn.classList.remove("d-none");
    } else {
        title.textContent = "Añadir Nuevo Elemento";
        document.getElementById("crud-item-form").reset();
        document.getElementById("form-item-status").value = "pending";
        document.getElementById("form-item-mandatory").checked = false;
        document.getElementById("form-item-burnout").checked = false;
        deleteBtn.classList.add("d-none");
    }

    renderCategoriesInteractive();
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function handleCategoryEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
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

function renderCategoriesInteractive() {
    const allUniqueCategories = Array.from(new Set(backlogData.flatMap(item => item.categories || []))).sort();

    const currentContainer = document.getElementById("current-categories-container");
    currentContainer.innerHTML = currentEditCategories.length > 0
        ? currentEditCategories.map(cat => `
            <span class="badge bg-primary fs-6 d-flex align-items-center gap-1">
                ${cat} <span class="cursor-pointer text-light ms-1" onclick="removeEditCategory('${cat}')">&times;</span>
            </span>`).join('')
        : `<span class="text-secondary small fst-italic">Sin categorías añadidas</span>`;

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

async function saveItemChanges(event) {
    event.preventDefault();

    const name = document.getElementById("form-item-name").value.trim();
    const img_name = document.getElementById("form-item-img").value.trim();
    const status = document.getElementById("form-item-status").value.trim();
    const mandatory = document.getElementById("form-item-mandatory").checked;
    const burnout = document.getElementById("form-item-burnout").checked;

    const newItemData = {
        name,
        img_name,
        categories: [...currentEditCategories],
        status,
        mandatory,
        burnout
    };

    if (editingItemIndex !== null) {
        backlogData[editingItemIndex] = newItemData;
    } else {
        backlogData.unshift(newItemData);
    }

    hasUnsavedChanges = false;
    closeEditForm();

    await saveChangesToRemote();
    navigateTo('edit');
}

function confirmDeleteItem() {
    if (editingItemIndex === null) return;
    const item = backlogData[editingItemIndex];
    document.getElementById("delete-modal-body").textContent = `¿Estás seguro de que deseas eliminar "${item.name}"?`;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    deleteModal.show();
}

async function executeDeleteItem() {
    if (editingItemIndex !== null) {
        backlogData.splice(editingItemIndex, 1);
        const modalEl = document.getElementById('deleteConfirmModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        hasUnsavedChanges = false;
        closeEditForm();

        await saveChangesToRemote();
        navigateTo('edit');
    }
}
//#endregion

//#region 10. Vista - Visualizador de Backlog
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

        <div class="mb-3 p-2 card-dark rounded">
            <small class="text-secondary d-block mb-1 text-uppercase fw-bold" style="font-size: 0.7rem;">Filtrar por Categoría:</small>
            <div class="d-flex flex-wrap">
                ${filterButtonsHTML}
            </div>
        </div>

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

        const burnoutBadge = game.burnout
            ? `<span class="badge bg-danger text-light me-1" style="font-size: 0.65rem;">🔥 Burnout</span>`
            : "";

        return `
            <div class="col-sm-6 col-md-4 col-xl-3">
                <div class="card card-dark h-100 p-2 px-3 ${cardBorderClass}">
                    <div class="card-body p-0">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <h2 class="h6 card-title fw-bold text-light mb-0 text-truncate" title="${game.name}">${game.name}</h2>
                            <div>
                                ${burnoutBadge}
                                ${mandatoryBadge}
                            </div>
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
                class="status-header-btn w-100 d-flex justify-content-between align-items-center" 
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

//#region 11. Vista - Configuración y Burnout
function renderSettingsView() {
    const burnoutItems = backlogData
        .map((item, index) => ({ item, originalIndex: index }))
        .filter(({ item }) => item.burnout === true);

    return `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h1 class="h4 fw-bold text-light mb-0">Configuración y Opciones</h1>
                <p class="text-secondary small mb-0">Ajusta los parámetros globales de la aplicación, gestión de burnout y sincronización.</p>
            </div>
        </div>

        <!-- SECCIÓN BURNOUT -->
        <div class="card card-dark p-3 mb-4 border-subtle-custom shadow-sm">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h2 class="h6 fw-bold text-warning text-uppercase mb-0 d-flex align-items-center gap-2">
                    <span>🔥</span> Elementos en Burnout (${burnoutItems.length})
                </h2>
            </div>
            <p class="text-secondary small mb-3">
                Los elementos con la marca de burnout activa quedan excluidos al generar quests. Haz clic en el icono 🔥 de un elemento para desmarcarlo y cambiar su valor a <code>false</code>.
            </p>

            ${burnoutItems.length === 0 ? `
                <div class="p-3 bg-dark rounded border border-subtle-custom text-center">
                    <p class="text-secondary small mb-0 fst-italic">No hay elementos marcados como burnout actualmente.</p>
                </div>
            ` : `
                <div class="row g-2">
                    ${burnoutItems.map(({ item, originalIndex }) => `
                        <div class="col-sm-6 col-md-4 col-lg-3">
                            <div class="p-2 card-dark border border-warning rounded d-flex justify-content-between align-items-center">
                                <div class="text-truncate me-2">
                                    <span class="fw-bold text-light small d-block text-truncate" title="${item.name}">${item.name}</span>
                                    <span class="badge badge-category" style="font-size: 0.65rem;">${item.status || 'pending'}</span>
                                </div>
                                <button type="button" class="btn btn-sm btn-outline-warning p-1 border-0 fs-5" 
                                    title="Desmarcar burnout (cambiar a false)" 
                                    onclick="toggleBurnoutItem(${originalIndex})">
                                    🔥
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>

        <!-- SINCRONIZACIÓN MANUAL -->
        <div class="card card-dark p-3 mb-4 border-subtle-custom shadow-sm">
            <h2 class="h6 fw-bold text-info text-uppercase mb-3">Sincronización Manual</h2>
            <p class="text-secondary small mb-3">Forzar el guardado del backlog actual directamente en el repositorio de GitHub.</p>
            <div>
                <button class="btn btn-primary fw-bold" onclick="saveChangesToRemote()">
                    ☁️ Sincronizar Backlog con GitHub
                </button>
            </div>
        </div>
    `;
}

// Función para cambiar el valor de burnout de true a false al pulsar el icono en Configuración
function toggleBurnoutItem(index) {
    if (backlogData[index] !== undefined) {
        backlogData[index].burnout = !backlogData[index].burnout;
        markAsDirty();
        navigateTo('settings');
    }
}

function updateGlobalGamesPerDay(val) {
    appSettings.gamesPerDayValid = Math.max(1, parseInt(val, 10) || 1);
    saveAppSettings();
}
//#endregion

//#region 12. Funciones Auxiliares y Helpers
function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateSaveButtonIndicator() {
    const saveBtn = document.getElementById("btn-save-remote");
    if (!saveBtn) return;

    if (hasUnsavedChanges) {
        saveBtn.innerHTML = `☁️ Guardar en Remoto <span class="badge bg-warning text-dark border border-dark rounded-circle ms-1 p-1" title="Tienes cambios pendientes por guardar">●</span>`;
        saveBtn.classList.remove("btn-outline-success");
        saveBtn.classList.add("btn-warning", "text-dark");
    } else {
        saveBtn.innerHTML = `☁️ Guardar en Remoto`;
        saveBtn.classList.remove("btn-warning", "text-dark");
        saveBtn.classList.add("btn-outline-success");
    }
}
//#endregion