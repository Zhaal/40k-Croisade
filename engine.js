//========================================
// Contenu de engine.js
//========================================

const APP_VERSION = "0.1.1"; // Version avec correction de la logique d'amélioration

//======================================================================
//  ÉTAT DE L'APPLICATION (STATE)
//======================================================================
let campaignData = {
    players: [],
    systems: [],
    isGalaxyGenerated: false
};

let mapModal;
let worldModal;
let playerListView;
let playerDetailView;

let activePlayerIndex = -1;
let editingPlayerIndex = -1;
let editingUnitIndex = -1;
let currentlyViewedSystemId = null;
let mapViewingPlayerId = null;
let currentMapScale = 1;

let isPanning = false;
let wasDragged = false;
let startX, scrollLeftStart;
let startY, scrollTopStart;

const STEP_DISTANCE = 250;
const GALAXY_SIZE = 3;

//======================================================================
//  SYSTÈME DE NOTIFICATION, CONFIRMATION ET MODALES
//======================================================================

function showNotification(message, type = 'info', duration = 5000) {
    const notificationContainer = document.getElementById('notification-container');
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.innerHTML = message;

    notificationContainer.appendChild(notif);

    requestAnimationFrame(() => {
        notif.classList.add('show');
    });

    const hideNotif = () => {
        notif.classList.remove('show');
        notif.classList.add('hide');
        setTimeout(() => {
            notif.remove();
        }, 500);
    };

    const timer = setTimeout(hideNotif, duration);

    notif.addEventListener('click', () => {
        clearTimeout(timer);
        hideNotif();
    });
}

function showConfirm(title, text) {
    return new Promise(resolve => {
        const confirmModal = document.getElementById('confirm-modal');
        const confirmModalTitle = document.getElementById('confirm-modal-title');
        const confirmModalText = document.getElementById('confirm-modal-text');
        const confirmModalOkBtn = document.getElementById('confirm-modal-ok-btn');
        const confirmModalCancelBtn = document.getElementById('confirm-modal-cancel-btn');

        confirmModalTitle.textContent = title;
        confirmModalText.innerHTML = text;
        openModal(confirmModal);

        const closeAndResolve = (value) => {
            closeModal(confirmModal);
            resolve(value);
        };

        const okListener = () => closeAndResolve(true);
        const cancelListener = () => closeAndResolve(false);
        const closeBtnListener = () => closeAndResolve(false);

        confirmModalOkBtn.addEventListener('click', okListener, { once: true });
        confirmModalCancelBtn.addEventListener('click', cancelListener, { once: true });
        confirmModal.querySelector('.close-btn').addEventListener('click', closeBtnListener, { once: true });
    });
}

const openModal = (modal) => modal.classList.remove('hidden');
const closeModal = (modal) => modal.classList.add('hidden');

//========================================
// Contenu de systems
//========================================

const SYSTEM_NAMES = [
    "Proxima Centauri", "Kepler-186f", "TRAPPIST-1", "Luyten b", "Gliese 581g", "Tau Ceti e",
    "Epsilon Eridani b", "Sirius", "Vega", "Arcturus", "Capella", "Rigel", "Betelgeuse", "Aldebaran",
    "Pollux", "Deneb", "Altair", "Fomalhaut", "Solaria", "Cryonia", "Pyralia", "Veridia", "Aquaria",
    "Nocturnus", "Aethelgard", "Helios Delta", "Terminus Est", "Orion's Folly", "Magellan Prime",
    "Andromeda's Tear", "The Cygnus Expanse", "Widow's Star", "The Ghoul Stars", "Segmentum Obscurus",
    "The Halo Zone", "Vostroya", "Krieg", "Cadia", "Fenris", "Baal", "Macragge", "Ultramar", "Ryza",
    "Stygies VIII", "Agripinaa", "Tallarn", "Valhalla", "Mordian", "Praetoria", "Catachan", "Zentha Prime", "Aquila Minor", "Draconis V", "Oblivion Reach", "Mythros", "Arcadia VII", "Nyx Verge", "Thorne’s Halo", "Icarion Delta", "Xerxes Core", "Ignis Major", "Tartarus Void", "Elara", "Nemoris", "Nova Vesta", "Zephyria", "Omicron Persei", "Lyonesse", "Galatia", "Cygna X", "Ilios", "Miridian Spire", "Volundr's Forge", "Azura Gate", "Delphinus", "Theta Crucis", "Hydra Expanse", "Ymir Station", "Abyssus", "Eidolon Reach", "Kassandros", "Erebus", "Aetherion", "Xanthe", "Virelia", "Nexus Prime", "Solitude IX", "Zarvax Omega", "Cerulean Rift", "Nova Centaur", "Echo Helix", "Sable Orbit", "Juno’s Rise", "Cryohex", "Ferron’s Edge", "Gorgon’s Reach", "Kronus II", "Midas Verge", "Numenor", "Nebulos","Astralis", "Bellatrix", "Calypso", "Dione Expanse", "Echo Prime", "Forgeworld Karth", "Gaia's Womb", "Halcyon Drift", "Icarus Reach", "Jareth’s Halo", "Kallista", "Lucent Verge", "Moros", "Nereid Prime", "Obscura", "Pandora's Wake", "Quantus", "Ragnar's Gate", "Selene",
    "Titania", "Umbriel", "Valkyrion", "Warden's Watch", "Xel'Tor", "Ythros Minor", "Zentha’s End",
    "Aegir", "Brimstone Hold", "Calytrix", "Dreadspire", "Emberfall", "Fury's Gate", "Geminus",
    "Horizon’s Edge", "Iridion", "Jovaris", "Kael'Thas", "Lunaris", "Morgana Drift", "Naraka",
    "Oberon", "Peregrine Station", "Quintessence", "Ravana", "Sanctis", "Talos Reach", "Ursae Majoris",
    
    "Vanir Hold", "Weyland Spire", "Xar’Kun", "Yavin Theta", "Zirak’Zul", "Ashen Cradle", "Borealis",
    "Cradle of Light", "Dagon’s Fall", "Eos Ascendant", "Frostheim", "Gaius Ultima", "Hekate Spiral",
    "Ilyria", "Jörmungandr", "Kelvin Drift", "Lorentis", "Meridian IX", "Nihilus Core", "Orcus Verge",
    "Pylon Sigma", "Quel’Danas", "Ruinhold", "Skoll’s Breath", "Thalassa", "Utopia’s End",
    "Vespera", "Whisper Field", "Xebec", "Ysera Expanse", "Zeroth Meridian",

    "Andros", "Borysthenes", "Cirrina Major", "Dactyl", "Elarion", "Fulgur’s Rift", "Galaxis Crown",
    "Horadrim Delta", "Iskar’s Flame", "Jacta Est", "Krynn", "Lysara", "Malakar", "Nysa", "Orlinos",
    "Pelagus", "Quorrum", "Runedar", "Sycorax", "Tyrranos", "Umbra", "Vornheim", "Wyrmhold", "Xirion",
    "Ygreth", "Zariel Reach", "Amasis", "Briareos", "Cenaris", "Dianthus", "Edelweiss Reach",
    "Farsight Theta", "Gethsemane", "Helleborus", "Ignivar", "Jasna’s Reach", "Karnath", "Lemuria",
    "Mistral", "Nadir Sector", "Onyx Drift", "Penumbra", "Qadim", "Ravenholdt", "Severus",
    
    "Talemspire", "Unaros", "Virellium", "Wanderlight", "Xorth Prime", "Yvenor", "Zephrael",
    "Axiom", "Blighthold", "Clytemnestra", "Dreadvault", "Eris Station", "Falx Magnus", "Golgotha",
    "Hyperion Expanse", "Isenhold", "Junctus", "Kharon’s Wake", "Lanx Minor", "Marnath", "Noxious Edge",
    "Ostra Nex", "Phobos Delta", "Quietude", "Ravager’s Maw", "Straylight", "Thorne’s Cradle",
    "Umbriel Verge", "Vesper Reach", "Wastrel’s Star", "Xenithum", "Ylgrast", "Zakarum",
    
    "Ashenforge", "Blackreach", "Calderis", "Dun’harra", "Eternis", "Frostgate", "Gildur’s Rest",
    "Hallowed Forge", "Infractus", "Juno Decline", "Koronus Span", "Lazareth", "Mirrorglade",
    "Neth’Kar", "Oblivium", "Pharexis", "Quirinus", "Redwake", "Sablethorn", "Tranquil Verge",
    "Ul’Zanith", "Vandrel Core", "Wyrmspire", "Xanadu", "Yaraxis", "Zeraphine"
];


//======================================================================
//  ANALYSE DE CONTRÔLE & STATUT (LOGIQUE CENTRALE)
//======================================================================

const getSystemControlInfo = (system) => {
    const controlBreakdown = {};
    const controllingPlayerIds = new Set();
    system.planets.forEach(planet => {
        const ownerId = planet.owner;
        if (ownerId !== 'neutral') {
            controllingPlayerIds.add(ownerId);
        }
        controlBreakdown[ownerId] = (controlBreakdown[ownerId] || 0) + 1;
    });
    return { controlBreakdown, controllingPlayerIds };
};

const getSystemStatusForPlayer = (system, viewingPlayerId) => {
    const { controllingPlayerIds } = getSystemControlInfo(system);
    const otherPlayersInSystem = new Set(controllingPlayerIds);
    otherPlayersInSystem.delete(viewingPlayerId);

    if (otherPlayersInSystem.size > 0) return { status: 'hostile', text: 'Présence Ennemie' };
    if (controllingPlayerIds.has(viewingPlayerId)) return { status: 'friendly', text: 'Contrôlé par vous' };
    if (controllingPlayerIds.size === 0) return { status: 'neutral', text: 'Neutre' };
    return { status: 'hostile', text: 'Contrôlé par Ennemi' };
};

const getReachableSystemsForPlayer = (playerId) => {
    const player = campaignData.players.find(p => p.id === playerId);
    if (!player) {
        return new Set();
    }
    
    if (!player.discoveredSystemIds) {
        player.discoveredSystemIds = [player.systemId];
    }

    return new Set(player.discoveredSystemIds);
};

const isPlayerDiscoverable = (playerId) => {
    const player = campaignData.players.find(p => p.id === playerId);
    if (!player) return false;
    const homeSystem = campaignData.systems.find(s => s.id === player.systemId);
    return homeSystem && !!homeSystem.position;
};

const getRankFromXp = (xp) => {
    if (xp >= 51) return 'Légendaire';
    if (xp >= 31) return 'Héroïque';
    if (xp >= 16) return 'Aguerri';
    if (xp >= 6) return 'Éprouvé';
    return 'Paré au Combat';
};

const findUndiscoveredNpcSystem = () => {
    const allDiscoveredIdsByPlayers = new Set();
    campaignData.players.forEach(player => {
        if (player.discoveredSystemIds) {
            player.discoveredSystemIds.forEach(id => allDiscoveredIdsByPlayers.add(id));
        } else if (player.systemId) {
            allDiscoveredIdsByPlayers.add(player.systemId);
        }
    });

    const candidates = campaignData.systems.filter(system =>
        system.owner === 'npc' && !allDiscoveredIdsByPlayers.has(system.id) && system.position
    );
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
};

const placePlayerSystemOnMap = async (playerId) => {
    const player = campaignData.players.find(p => p.id === playerId);
    if (!player) return;

    const playerSystem = campaignData.systems.find(s => s.id === player.systemId);
    if (!playerSystem || playerSystem.position) return;

    const allPlanetsControlled = playerSystem.planets.every(p => p.owner === playerId);
    if (!allPlanetsControlled) return;
    
    const joinMap = await showConfirm(`Félicitations, ${player.name} !`, "Vous avez unifié votre système natal. Voulez-vous maintenant rejoindre la carte galactique principale ?");
    if (!joinMap) return;

    const targetNpcSystem = findUndiscoveredNpcSystem();
    if (!targetNpcSystem) {
        showNotification("Impossible de trouver un système PNJ non découvert pour établir une tête de pont. La galaxie est peut-être trop encombrée.", 'error', 8000);
        return;
    }

    const oldConnections = { ...targetNpcSystem.connections };
    const oldPosition = { ...targetNpcSystem.position };

    for (const dir in oldConnections) {
        const neighborId = oldConnections[dir];
        if (neighborId) {
            const neighborSystem = campaignData.systems.find(s => s.id === neighborId);
            if (neighborSystem) {
                const oppositeDir = { up: 'down', down: 'up', left: 'right', right: 'left' }[dir];
                if (neighborSystem.connections) {
                   neighborSystem.connections[oppositeDir] = playerSystem.id;
                }
                const neighborOwner = campaignData.players.find(p => p.discoveredSystemIds && p.discoveredSystemIds.includes(neighborId));
                if(neighborOwner && !neighborOwner.discoveredSystemIds.includes(playerSystem.id)) {
                    neighborOwner.discoveredSystemIds.push(playerSystem.id);
                }
            }
        }
    }
    
    playerSystem.position = oldPosition;
    playerSystem.connections = oldConnections;
    playerSystem.name = `${player.name}'s Bastion`;
    
    Object.values(oldConnections).forEach(id => {
        if(id && !player.discoveredSystemIds.includes(id)) {
            player.discoveredSystemIds.push(id);
        }
    });

    const npcSystemIndex = campaignData.systems.findIndex(s => s.id === targetNpcSystem.id);
    if (npcSystemIndex > -1) {
        campaignData.systems.splice(npcSystemIndex, 1);
    }

    showNotification("<b>Tête de pont établie !</b> Votre système est maintenant connecté à la carte galactique. Vous pouvez explorer !", 'success', 8000);
    saveData();
    renderPlayerList();
    if (!mapModal.classList.contains('hidden')) renderGalacticMap();
    if (!worldModal.classList.contains('hidden') && currentlyViewedSystemId === playerSystem.id) renderPlanetarySystem(playerSystem.id);
};


//======================================================================
//  GESTION DES DONNÉES (LOCALSTORAGE & JSON)
//======================================================================

const saveData = () => {
    try {
        localStorage.setItem('nexusCrusadeData', JSON.stringify(campaignData));
    } catch (error) {
        console.error("Erreur lors de la sauvegarde des données : ", error);
        showNotification("Erreur de sauvegarde ! L'espace de stockage local est peut-être plein.", 'error');
    }
};

const loadData = () => {
    const data = localStorage.getItem('nexusCrusadeData');
    if (data) {
        try {
            campaignData = JSON.parse(data);
        } catch (error) {
            console.error("Erreur lors du chargement des données : ", error);
            showNotification("Les données de campagne sont corrompues et n'ont pas pu être chargées.", 'error');
            return;
        }
    }

    // --- Logique de migration des anciennes versions ---
    let dataWasModified = false;
    if (!campaignData.players) campaignData.players = [];
    if (!campaignData.systems) campaignData.systems = [];

    if (campaignData.isGalaxyGenerated === undefined) {
        campaignData.isGalaxyGenerated = false;
        dataWasModified = true;
    }
    
    // Fonction de migration pour les anciens systèmes de découverte
    const oldGetReachableSystems = (startSystemId) => {
        const reachable = new Set();
        if (!startSystemId) return reachable;

        const playerSystem = campaignData.systems.find(s => s.id === startSystemId);
        if (!playerSystem || !playerSystem.position) {
            reachable.add(startSystemId);
            return reachable;
        }
        const queue = [startSystemId];
        reachable.add(startSystemId);
        while (queue.length > 0) {
            const currentId = queue.shift();
            const currentSystem = campaignData.systems.find(s => s.id === currentId);
            if (currentSystem && currentSystem.connections) {
                Object.values(currentSystem.connections).forEach(connectedId => {
                    if (connectedId && !reachable.has(connectedId)) {
                        reachable.add(connectedId);
                        queue.push(connectedId);
                    }
                });
            }
        }
        return reachable;
    };

    campaignData.players.forEach(player => {
        if (player.discoveredSystemIds === undefined) {
            const visibleSystems = oldGetReachableSystems(player.systemId);
            player.discoveredSystemIds = Array.from(visibleSystems);
            dataWasModified = true;
            console.log(`Migration des systèmes découverts pour le joueur ${player.name}`);
        }
        if (player.sombrerochePoints === undefined) {
            player.sombrerochePoints = 0;
            dataWasModified = true;
        }
        if (player.upgradeSupplyCost === undefined) {
            player.upgradeSupplyCost = 0;
            dataWasModified = true;
        }
        // NOUVEAU : Migration pour les points de Biomasse
        if (player.faction === 'Tyranids' && player.biomassPoints === undefined) {
            player.biomassPoints = 0;
            dataWasModified = true;
            console.log(`Migration: Ajout de biomassPoints pour le joueur Tyranide ${player.name}`);
        }
    });

    campaignData.systems.forEach(system => {
        if (!system.probedConnections) {
            system.probedConnections = { up: null, down: null, left: null, right: null };
            dataWasModified = true;
        }
        if (!system.connections) {
            system.connections = { up: null, down: null, left: null, right: null };
            dataWasModified = true;
        }
    });

    if (dataWasModified) {
        saveData();
    }

    // --- Notification de mise à jour ---
    const lastVersion = localStorage.getItem('nexusCrusadeVersion');
    if (lastVersion !== APP_VERSION) {
        setTimeout(() => {
            showNotification(
                `<b>Mise à jour v${APP_VERSION} !</b> La logique des coûts d'amélioration est corrigée.`,
                'info',
                10000
            );
        }, 500);
        localStorage.setItem('nexusCrusadeVersion', APP_VERSION);
    }
};

const handleExport = () => {
    const dataStr = JSON.stringify(campaignData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-crusade-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification("Exportation de la campagne initiée.", 'success');
};

const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData && Array.isArray(importedData.players)) {
                if (await showConfirm("Confirmation d'importation", "Importer ce fichier écrasera les données actuelles de la campagne. Êtes-vous sûr de vouloir continuer ?")) {
                    campaignData = importedData;
                    loadData(); // Relance loadData pour appliquer les migrations si besoin
                    saveData();
                    renderPlayerList();
                    switchView('list');
                    showNotification("Importation réussie !", 'success');
                }
            } else {
                showNotification("Le fichier sélectionné n'est pas un fichier de campagne valide.", 'error');
            }
        } catch (error) {
            showNotification("Erreur lors de la lecture du fichier : " + error.message, 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = null; // Permet de réimporter le même fichier
};