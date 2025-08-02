//========================================
// Contenu de engine.js
//========================================

const APP_VERSION = "0.1.4"; // Version avec historique d'actions par joueur

//======================================================================
//  ÉTAT DE L'APPLICATION (STATE)
//======================================================================
let campaignData = {
    players: [],
    systems: [],
    isGalaxyGenerated: false,
    gatewayLinks: [],
    pendingNotifications: [],
    sessionLog: [] // MODIFIÉ : Remplace l'ancien actionLog global
};

let mapModal;
let worldModal;
let playerListView;
let playerDetailView;
let plagueManagementModal;
let pvpCombatModal; // NOUVEAU

let activePlayerIndex = -1;
let editingPlayerIndex = -1;
let editingUnitIndex = -1;
let currentlyViewedSystemId = null;
let mapViewingPlayerId = null;
let selectedSystemOnMapId = null; // NEW: Tracks selected system for map actions
let currentMapScale = 1;

let isPanning = false;
let wasDragged = false;
let startX, scrollLeftStart;
let startY, scrollTopStart;

const STEP_DISTANCE = 250;
const GALAXY_SIZE = 4;

//======================================================================
//  SYSTÈME DE NOTIFICATION, CONFIRMATION, LOG & MODALES
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

/**
 * MODIFIÉ : Enregistre une action dans l'historique personnel d'un joueur.
 * @param {string} playerId - L'ID du joueur pour qui enregistrer l'action.
 * @param {string} message - Le message à afficher dans le journal.
 * @param {string} type - Le type d'événement (ex: 'explore', 'conquest', 'alert').
 * @param {string} [icon='📜'] - L'icône emoji à afficher.
 */
function logAction(playerId, message, type, icon = '📜') {
    const player = campaignData.players.find(p => p.id === playerId);
    if (!player) {
        console.error(`Tentative de log pour un joueur inexistant: ${playerId}`);
        return;
    }

    const LOG_LIMIT = 500;
    const newEntry = {
        timestamp: new Date().toISOString(),
        message,
        type,
        icon
    };

    if (!player.actionLog) {
        player.actionLog = [];
    }

    player.actionLog.unshift(newEntry);

    if (player.actionLog.length > LOG_LIMIT) {
        player.actionLog = player.actionLog.slice(0, LOG_LIMIT);
    }

    // NOUVEAU : Enregistre une entrée de session générique
    const today = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD
    const sessionExists = campaignData.sessionLog.some(
        s => s.playerId === playerId && s.timestamp.startsWith(today)
    );

    if (!sessionExists) {
        campaignData.sessionLog.unshift({
            playerId: player.id,
            playerName: player.name,
            timestamp: new Date().toISOString()
        });
        if (campaignData.sessionLog.length > LOG_LIMIT * campaignData.players.length) {
             campaignData.sessionLog = campaignData.sessionLog.slice(0, 50);
        }
    }


    saveData();

    if (typeof renderActionLog === 'function') {
        renderActionLog();
    }
}

/**
 * NOUVELLE FONCTION : Enregistre une action pour TOUS les joueurs (ex: réinitialisation).
 */
function logGlobalAction(message, type, icon = '💥') {
    campaignData.players.forEach(player => {
        logAction(player.id, message, type, icon);
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

function showPasswordConfirm(title, text) {
    return new Promise(resolve => {
        const confirmModal = document.getElementById('password-confirm-modal');
        const confirmModalTitle = document.getElementById('password-confirm-modal-title');
        const confirmModalText = document.getElementById('password-confirm-modal-text');
        const confirmModalInput = document.getElementById('password-confirm-input');
        const confirmModalOkBtn = document.getElementById('password-confirm-modal-ok-btn');
        const confirmModalCancelBtn = document.getElementById('password-confirm-modal-cancel-btn');

        confirmModalTitle.textContent = title;
        confirmModalText.innerHTML = text;
        confirmModalInput.value = ''; // Clear previous input
        openModal(confirmModal);

        const closeAndResolve = (value) => {
            closeModal(confirmModal);
            // Clean up listeners
            confirmModalOkBtn.removeEventListener('click', okListener);
            confirmModalCancelBtn.removeEventListener('click', cancelListener);
            confirmModal.querySelector('.close-btn').removeEventListener('click', cancelListener);
            confirmModalInput.removeEventListener('keydown', keydownListener);
            resolve(value);
        };

        const okListener = () => {
            if (confirmModalInput.value.toLowerCase() === 'warp') {
                closeAndResolve(true);
            } else {
                showNotification('Mot de passe incorrect.', 'error');
                // Don't close the modal, let the user try again.
            }
        };
        
        const cancelListener = () => closeAndResolve(false);

        const keydownListener = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                okListener();
            }
        };

        confirmModalOkBtn.addEventListener('click', okListener);
        confirmModalCancelBtn.addEventListener('click', cancelListener);
        confirmModal.querySelector('.close-btn').addEventListener('click', cancelListener);
        confirmModalInput.addEventListener('keydown', keydownListener);

        // Focus the input field when the modal opens
        setTimeout(() => confirmModalInput.focus(), 100);
    });
}


function showExplorationChoice(title, text) {
    return new Promise(resolve => {
        const choiceModal = document.getElementById('exploration-choice-modal');
        const choiceTitle = document.getElementById('exploration-choice-title');
        const choiceText = document.getElementById('exploration-choice-text');
        const cancelBtn = document.getElementById('exploration-choice-cancel-btn');
        const blindJumpBtn = document.getElementById('exploration-choice-blind-jump-btn');
        const probeBtn = document.getElementById('exploration-choice-probe-btn');

        choiceTitle.textContent = title;
        choiceText.innerHTML = text;
        openModal(choiceModal);

        const closeAndResolve = (value) => {
            closeModal(choiceModal);
            cancelBtn.removeEventListener('click', cancelListener);
            blindJumpBtn.removeEventListener('click', blindJumpListener);
            probeBtn.removeEventListener('click', probeListener);
            choiceModal.querySelector('.close-btn').removeEventListener('click', cancelListener);
            resolve(value);
        };

        const cancelListener = () => closeAndResolve('cancel');
        const blindJumpListener = () => closeAndResolve('blind_jump');
        const probeListener = () => closeAndResolve('probe');

        cancelBtn.addEventListener('click', cancelListener, { once: true });
        blindJumpBtn.addEventListener('click', blindJumpListener, { once: true });
        probeBtn.addEventListener('click', probeListener, { once: true });
        choiceModal.querySelector('.close-btn').addEventListener('click', cancelListener, { once: true });
    });
}

function showRouteDiscoveryChoice(title, text) {
    return new Promise(resolve => {
        const choiceModal = document.getElementById('route-discovery-choice-modal');
        const choiceTitle = document.getElementById('route-discovery-choice-title');
        const choiceText = document.getElementById('route-discovery-choice-text');
        const cancelBtn = document.getElementById('route-discovery-choice-cancel-btn');
        const mapBtn = document.getElementById('route-discovery-choice-map-btn');
        const probeBtn = document.getElementById('route-discovery-choice-probe-btn');

        choiceTitle.textContent = title;
        choiceText.innerHTML = text;
        openModal(choiceModal);

        const closeAndResolve = (value) => {
            closeModal(choiceModal);
            // No need to remove listeners if using { once: true }
            resolve(value);
        };

        const cancelListener = () => closeAndResolve('cancel');
        const mapListener = () => closeAndResolve('map');
        const probeListener = () => closeAndResolve('probe');

        cancelBtn.addEventListener('click', cancelListener, { once: true });
        mapBtn.addEventListener('click', mapListener, { once: true });
        probeBtn.addEventListener('click', probeListener, { once: true });
        choiceModal.querySelector('.close-btn').addEventListener('click', cancelListener, { once: true });
    });
}


function showProbeActionChoice(title, text, timerText) {
    return new Promise(resolve => {
        const choiceModal = document.getElementById('probe-action-modal');
        const choiceTitle = document.getElementById('probe-action-title');
        const choiceText = document.getElementById('probe-action-text');
        const choiceTimer = document.getElementById('probe-action-timer');
        const cancelBtn = document.getElementById('probe-action-cancel-btn');
        const establishBtn = document.getElementById('probe-action-establish-btn');
        const rescanBtn = document.getElementById('probe-action-rescan-btn');

        choiceTitle.textContent = title;
        choiceText.innerHTML = text;
        choiceTimer.textContent = timerText;
        openModal(choiceModal);

        const closeAndResolve = (value) => {
            closeModal(choiceModal);
            cancelBtn.removeEventListener('click', cancelListener);
            establishBtn.removeEventListener('click', establishListener);
            rescanBtn.removeEventListener('click', rescanListener);
            choiceModal.querySelector('.close-btn').removeEventListener('click', cancelListener);
            resolve(value);
        };

        const cancelListener = () => closeAndResolve('cancel');
        const establishListener = () => closeAndResolve('establish');
        const rescanListener = () => closeAndResolve('rescan');

        cancelBtn.addEventListener('click', cancelListener, { once: true });
        establishBtn.addEventListener('click', establishListener, { once: true });
        rescanBtn.addEventListener('click', rescanListener, { once: true });
        choiceModal.querySelector('.close-btn').addEventListener('click', cancelListener, { once: true });
    });
}

function showUnitChoiceModal(title, text, unitList) {
    return new Promise(resolve => {
        const modal = document.getElementById('unit-choice-modal');
        const modalTitle = document.getElementById('unit-choice-modal-title');
        const modalText = document.getElementById('unit-choice-modal-text');
        const select = document.getElementById('unit-choice-select');
        const okBtn = document.getElementById('unit-choice-ok-btn');
        const cancelBtn = document.getElementById('unit-choice-cancel-btn');
        const closeBtn = modal.querySelector('.close-btn');

        modalTitle.textContent = title;
        modalText.innerHTML = text;
        
        // Vider et remplir la liste déroulante
        select.innerHTML = '';
        if (unitList && unitList.length > 0) {
            unitList.forEach(unit => {
                const option = document.createElement('option');
                option.value = unit.id; // Utiliser l'ID unique de l'unité
                option.textContent = `${unit.name} (XP: ${unit.xp || 0})`;
                select.appendChild(option);
            });
            okBtn.disabled = false;
        } else {
            select.innerHTML = '<option disabled>Aucune cible éligible trouvée.</option>';
            okBtn.disabled = true;
        }
        
        openModal(modal);

        const closeAndResolve = (value) => {
            closeModal(modal);
            // Nettoyer les écouteurs d'événements pour éviter les doublons
            okBtn.removeEventListener('click', okListener);
            cancelBtn.removeEventListener('click', cancelListener);
            closeBtn.removeEventListener('click', cancelListener);
            resolve(value);
        };

        const okListener = () => closeAndResolve(select.value);
        const cancelListener = () => closeAndResolve(null);

        okBtn.addEventListener('click', okListener, { once: true });
        cancelBtn.addEventListener('click', cancelListener, { once: true });
        closeBtn.addEventListener('click', cancelListener, { once: true });
    });
}

const openModal = (modal) => modal.classList.remove('hidden');
const closeModal = (modal) => modal.classList.add('hidden');

function displayPendingNotifications() {
    if (!mapViewingPlayerId) return;

    const notificationsForPlayer = (campaignData.pendingNotifications || []).filter(notif => notif.playerId === mapViewingPlayerId);

    if (notificationsForPlayer.length > 0) {
        setTimeout(() => {
            notificationsForPlayer.forEach(notif => {
                showNotification(notif.message, notif.type || 'warning', 12000);
            });

            campaignData.pendingNotifications = campaignData.pendingNotifications.filter(notif => notif.playerId !== mapViewingPlayerId);
            saveData();
        }, 1000);
    }
}


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
    
    const visibleIds = new Set(player.discoveredSystemIds || [player.systemId]);
    (player.probedSystemIds || []).forEach(id => visibleIds.add(id));
    
    return visibleIds;
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

const calculateDetachmentUpgradeCost = (player) => {
    if (!player || !player.units) {
        return 0;
    }
    return (player.units || []).reduce((total, unit) => {
        const unitUpgradesCost = (unit.detachmentUpgrades || []).reduce((subTotal, upgrade) => {
            return subTotal + (upgrade.cost || 0);
        }, 0);
        return total + unitUpgradesCost;
    }, 0);
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
    logAction(player.id, `<b>${player.name}</b> a connecté son système natal à la carte galactique.`, 'conquest', '🌍');
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

// =====================================================================
// CORRECTION : SÉPARATION DE LA LOGIQUE DE CHARGEMENT ET DE MIGRATION
// =====================================================================

/**
 * Charge les données de la campagne uniquement depuis le localStorage.
 */
const loadDataFromStorage = () => {
    const data = localStorage.getItem('nexusCrusadeData');
    if (data) {
        try {
            campaignData = JSON.parse(data);
        } catch (error) {
            console.error("Erreur lors du chargement des données depuis le localStorage : ", error);
            showNotification("Les données de campagne locales sont corrompues et n'ont pas pu être chargées.", 'error');
        }
    }
};

/**
 * Vérifie et met à jour la structure de l'objet `campaignData` global
 * pour assurer la compatibilité avec les versions plus récentes.
 */
const migrateData = () => {
    let dataWasModified = false;

    // Initialisations de base si les clés manquent
    if (!campaignData.players) campaignData.players = [];
    if (!campaignData.systems) campaignData.systems = [];
    if (!campaignData.gatewayLinks) {
        campaignData.gatewayLinks = [];
        dataWasModified = true;
    }
    if (campaignData.isGalaxyGenerated === undefined) {
        campaignData.isGalaxyGenerated = false;
        dataWasModified = true;
    }
    if (campaignData.pendingNotifications === undefined) {
        campaignData.pendingNotifications = [];
        dataWasModified = true;
    }
    if (campaignData.actionLog) { // Migration de l'ancien historique global
        delete campaignData.actionLog;
        dataWasModified = true;
    }
    if (campaignData.sessionLog === undefined) {
        campaignData.sessionLog = [];
        dataWasModified = true;
    }

    // Ancienne fonction pour la compatibilité de `discoveredSystemIds`
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

    // Migration par joueur
    campaignData.players.forEach(player => {
        if (player.actionLog === undefined) {
            player.actionLog = [];
            dataWasModified = true;
        }
        if (player.battles === undefined) {
            player.battles = { wins: 0, losses: 0, npcGames: 0 };
            dataWasModified = true;
        }
        if (player.freeProbes === undefined) {
            player.freeProbes = 0;
            dataWasModified = true;
        }
        (player.units || []).forEach(unit => {
            if (unit.detachmentUpgrades === undefined) {
                unit.detachmentUpgrades = [];
                dataWasModified = true;
            }
        });
        if (player.probedSystemIds === undefined) {
            player.probedSystemIds = [];
            dataWasModified = true;
        }
        if (player.discoveredSystemIds === undefined) {
            const visibleSystems = oldGetReachableSystems(player.systemId);
            player.discoveredSystemIds = Array.from(visibleSystems);
            dataWasModified = true;
        }
        // Migrations spécifiques aux factions
        if (player.faction === 'Death Guard' && typeof player.deathGuardData === 'undefined') {
            player.deathGuardData = {
                contagionPoints: player.contagionPoints || 0,
                pathogenPower: 1,
                corruptedPlanetIds: [], 
                plagueStats: { reproduction: 1, survival: 1, adaptability: 1 }
            };
            delete player.contagionPoints;
            dataWasModified = true;
        }
        if (player.faction === 'Adepta Sororitas' && player.sainthood === undefined) {
            initializeSororitasData(player); // Utilise la fonction d'initialisation
            dataWasModified = true;
        }
        // ====================== DÉBUT DE LA CORRECTION TYRANIDE ======================
        if (player.faction === 'Tyranids' && player.tyranidData === undefined) {
            // Sauvegarde de l'ancienne valeur si elle existe
            const oldBiomass = player.biomassPoints || 0; 
            
            // Initialisation de la nouvelle structure de données complète
            initializeTyranidData(player); 
            
            // Restauration de l'ancienne valeur dans la nouvelle structure
            player.tyranidData.biomassPoints = oldBiomass;
            
            // Suppression de l'ancienne clé pour garder les données propres
            delete player.biomassPoints; 
            
            dataWasModified = true;
        }
        // ====================== FIN DE LA CORRECTION TYRANIDE ======================
    });

    // Migration par système
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
        saveData(); // Sauvegarde les données migrées si des changements ont eu lieu
    }

    const lastVersion = localStorage.getItem('nexusCrusadeVersion');
    if (lastVersion !== APP_VERSION) {
        setTimeout(() => {
            showNotification(
                `<b>Mise à jour v${APP_VERSION} !</b> L'historique est désormais personnel à chaque joueur.`,
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

/**
 * CORRIGÉ : Gère l'importation d'un fichier JSON.
 * N'appelle plus `loadData` qui écrasait les données importées.
 */
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
                    migrateData(); // CORRECTION: Appelle la migration sur les données importées
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
    event.target.value = null; // Permet de ré-importer le même fichier
};