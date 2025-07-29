// galaxy.js

//======================================================================
//  GÉNÉRATION & LOGIQUE DE LA GALAXIE
//======================================================================

const getWeightedRandomPlanetType = () => {
    const types = [
        { name: "Monde Ruche", weight: 35 },
        { name: "Agri-monde", weight: 25 },
        { name: "Monde Sauvage", weight: 15 },
        { name: "Monde Mort", weight: 10 },
        { name: "Monde Forge", weight: 10 },
        { name: "Monde Saint (relique)", weight: 5 }
    ];

    const totalWeight = types.reduce((sum, type) => sum + type.weight, 0);
    let random = Math.random() * totalWeight;

    for (const type of types) {
        if (random < type.weight) {
            return type.name;
        }
        random -= type.weight;
    }
};

const getUniqueSystemName = (existingNames) => {
    const usedNames = existingNames || new Set();
    const availableNames = SYSTEM_NAMES.filter(name => !usedNames.has(name));
    if (availableNames.length === 0) {
        let fallbackName;
        let attempts = 0;
        do {
            fallbackName = `Secteur Inconnu ${Math.floor(Math.random() * 1000)}`;
            attempts++;
        } while (usedNames.has(fallbackName) && attempts < 100);
        return fallbackName;
    }
    return availableNames[Math.floor(Math.random() * availableNames.length)];
};

const generateRandomNPCSystem = (usedNames) => {
    const planetNames = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta"];
    const numPlanets = Math.floor(Math.random() * 6) + 3; // 3 à 8 planètes
    const defenseValues = [500, 1000, 1500, 2000];
    const planets = [];
    for (let i = 0; i < numPlanets; i++) {
        planets.push({
            id: crypto.randomUUID(), // Chaque planète a un ID unique
            type: getWeightedRandomPlanetType(),
            name: `${planetNames[i] || `Planète ${i + 1}`}`,
            owner: "neutral",
            defense: defenseValues[Math.floor(Math.random() * defenseValues.length)]
        });
    }
    return {
        id: crypto.randomUUID(),
        name: getUniqueSystemName(usedNames),
        owner: 'npc',
        planets: planets,
        connections: { up: null, down: null, left: null, right: null },
        probedConnections: { up: null, down: null, left: null, right: null },
        position: { x: 0, y: 0 }
    };
};

const generateGalaxy = () => {
    showNotification("Génération d'une nouvelle galaxie...", 'info');
    const newSystems = [];
    const usedNamesInGeneration = new Set();

    for (let y = 0; y < GALAXY_SIZE; y++) {
        for (let x = 0; x < GALAXY_SIZE; x++) {
            const system = generateRandomNPCSystem(usedNamesInGeneration);
            system.position = {
                x: x * STEP_DISTANCE + (STEP_DISTANCE / 2),
                y: y * STEP_DISTANCE + (STEP_DISTANCE / 2)
            };
            newSystems.push(system);
            usedNamesInGeneration.add(system.name);
        }
    }
    
    campaignData.systems = newSystems;
    campaignData.isGalaxyGenerated = true;
    showNotification(`Galaxie de <b>${newSystems.length}</b> systèmes PNJ créée.`, 'success');
};

/**
 * Vérifie s'il existe un chemin de systèmes contrôlés par le joueur jusqu'à son système d'origine.
 * @param {string} startSystemId - L'ID du système de départ de la vérification.
 * @param {string} playerId - L'ID du joueur effectuant la vérification.
 * @returns {boolean} - True si une ligne de ravitaillement existe, sinon false.
 */
const hasSupplyLine = (startSystemId, playerId) => {
    const player = campaignData.players.find(p => p.id === playerId);
    if (!player) return false;
    
    const homeSystemId = player.systemId;
    if (startSystemId === homeSystemId) return true; // On peut toujours agir depuis son système natal

    const queue = [startSystemId];
    const visited = new Set([startSystemId]);

    while (queue.length > 0) {
        const currentId = queue.shift();
        const currentSystem = campaignData.systems.find(s => s.id === currentId);

        if (!currentSystem) continue;

        // Étape 1 : Récupérer les connexions normales
        const neighborIds = Object.values(currentSystem.connections).filter(id => id !== null);
        
        // Étape 2 : AJOUTER les connexions via portail (gateway)
        (campaignData.gatewayLinks || []).forEach(link => {
            if (link.systemId1 === currentId) {
                neighborIds.push(link.systemId2);
            }
            if (link.systemId2 === currentId) {
                neighborIds.push(link.systemId1);
            }
        });

        for (const neighborId of neighborIds) {
            if (visited.has(neighborId)) continue;
            
            const neighborSystem = campaignData.systems.find(s => s.id === neighborId);
            if (!neighborSystem) continue;

            // La ligne est coupée si le système voisin n'est pas contrôlé par le joueur
            const isControlledByPlayer = neighborSystem.planets.some(p => p.owner === playerId);
            if (!isControlledByPlayer) {
                continue; // Ne pas explorer plus loin via ce chemin
            }

            if (neighborId === homeSystemId) {
                return true; // Chemin trouvé !
            }

            visited.add(neighborId);
            queue.push(neighborId);
        }
    }

    return false; // Aucun chemin trouvé
};


const handleExploration = async (direction) => {
    const currentSystem = campaignData.systems.find(s => s.id === currentlyViewedSystemId);
    if (!currentSystem) return;

    const viewingPlayer = campaignData.players.find(p => p.id === mapViewingPlayerId);
    if (!viewingPlayer) {
        showNotification("Erreur : Impossible de trouver le joueur actif pour l'exploration.", 'error');
        return;
    }

    const connectedSystemId = currentSystem.connections[direction];
    const oppositeDirection = { up: 'down', down: 'up', left: 'right', right: 'left' }[direction];

    if (connectedSystemId && viewingPlayer.discoveredSystemIds.includes(connectedSystemId)) {
        renderPlanetarySystem(connectedSystemId);
        return;
    }

    if (!currentSystem.position) {
        showNotification("Vous devez d'abord conquérir votre système natal pour rejoindre la carte galactique.", 'warning', 6000);
        return;
    }

    // Identifie les ID de tous les autres joueurs
    const otherPlayerIds = campaignData.players
        .map(p => p.id)
        .filter(id => id !== viewingPlayer.id);
    // Vérifie si une planète dans le système actuel appartient à un autre joueur
    const hasEnemyPlanetInCurrent = currentSystem.planets.some(p => otherPlayerIds.includes(p.owner));

    if (hasEnemyPlanetInCurrent) {
        showNotification("<b>Blocus ennemi !</b> Vous ne pouvez pas explorer depuis ce système tant qu'une planète ennemie est présente.", 'error');
        return;
    }
    const hasFriendlyPlanetInCurrent = currentSystem.planets.some(p => p.owner === viewingPlayer.id);
    if (!hasFriendlyPlanetInCurrent && currentSystem.owner !== viewingPlayer.id) {
        showNotification("Vous devez contrôler au moins une planète dans ce système pour pouvoir explorer plus loin.", 'warning');
        return;
    }
    
    // Nouvelle vérification de la ligne de ravitaillement
    if (!hasSupplyLine(currentSystem.id, viewingPlayer.id)) {
        showNotification("<b>Ligne de ravitaillement rompue !</b> Impossible d'explorer depuis ce système car il n'est pas connecté à votre bastion par une chaîne de systèmes contrôlés.", 'error', 8000);
        return;
    }

    const parentPos = currentSystem.position;
    const targetPos = { x: parentPos.x, y: parentPos.y };
    if (direction === 'up') targetPos.y -= STEP_DISTANCE;
    else if (direction === 'down') targetPos.y += STEP_DISTANCE;
    else if (direction === 'left') targetPos.x -= STEP_DISTANCE;
    else if (direction === 'right') targetPos.x += STEP_DISTANCE;

    const discoveredSystem = campaignData.systems.find(s => s.position && s.position.x === targetPos.x && s.position.y === targetPos.y);

    if (!discoveredSystem) {
        showNotification("Vous avez atteint le bord de l'espace connu.", 'info');
        return;
    }

    const probedInfo = currentSystem.probedConnections ? currentSystem.probedConnections[direction] : null;

    if (probedInfo) {
        // Calculate time since last probe
        const now = Date.now();
        const lastProbeTime = probedInfo.timestamp || now; // Fallback for old saves
        const elapsedMs = now - lastProbeTime;
        const days = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((elapsedMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
        const timerText = `Dernière sonde envoyée il y a : ${days} jour(s), ${hours}h, ${minutes}min.`;
    
        const title = probedInfo.status === 'player_contact' ? "Établir un Contact Hostile" : "Confirmer la Connexion";
        const mainText = probedInfo.status === 'player_contact' 
            ? `Vos sondes confirment la présence d'un autre joueur. Voulez-vous établir une connexion permanente ?<br><br><b>Attention :</b> Cette action est irréversible et révèlera immédiatement votre position à cet adversaire.`
            : `Vous avez sondé le système. Voulez-vous établir une connexion permanente ?`;
        
        const outcome = await showProbeActionChoice(title, mainText, timerText);
    
        if (outcome === 'cancel') {
            return;
        }
    
        if (outcome === 'rescan') {
            if (viewingPlayer.requisitionPoints < 1) {
                showNotification("Points de Réquisition insuffisants pour relancer une sonde (1 RP requis).", 'warning');
                return;
            }
            viewingPlayer.requisitionPoints--;
            probedInfo.timestamp = Date.now();
            saveData();
    
            if (activePlayerIndex === campaignData.players.findIndex(p => p.id === viewingPlayer.id) && !playerDetailView.classList.contains('hidden')) {
                renderPlayerDetail();
            }
            
            showNotification(`Sonde relancée vers le système. Informations temporelles mises à jour.`, 'info');
            updateExplorationArrows(currentSystem);
            return;
        }
    
        if (outcome === 'establish') {
            currentSystem.connections[direction] = discoveredSystem.id;
            discoveredSystem.connections[oppositeDirection] = currentSystem.id;
            currentSystem.probedConnections[direction] = null;
    
            if (!viewingPlayer.discoveredSystemIds.includes(discoveredSystem.id)) {
                viewingPlayer.discoveredSystemIds.push(discoveredSystem.id);
            }
            
            if (viewingPlayer.probedSystemIds) {
                const index = viewingPlayer.probedSystemIds.indexOf(discoveredSystem.id);
                if (index > -1) viewingPlayer.probedSystemIds.splice(index, 1);
            }
    
            if (probedInfo.status === 'player_contact') {
                const discoveredPlayer = campaignData.players.find(p => p.id === discoveredSystem.owner);
                if (discoveredPlayer) {
                    if (!discoveredPlayer.discoveredSystemIds.includes(currentSystem.id)) {
                        discoveredPlayer.discoveredSystemIds.push(currentSystem.id);
                         if (!campaignData.pendingNotifications) campaignData.pendingNotifications = [];
                         campaignData.pendingNotifications.push({
                            playerId: discoveredPlayer.id,
                            message: `<b>CONNEXION ÉTABLIE:</b> Une flotte du joueur <b>${viewingPlayer.name}</b> a établi un lien permanent avec votre système <b>${discoveredSystem.name}</b> !`,
                            type: 'error'
                        });
                        showNotification(`Le joueur <b>${discoveredPlayer.name}</b> a été alerté de votre présence.`, 'warning');
                    }
                }
            }
            
            saveData();
            showNotification(`Connexion établie vers le système ${discoveredSystem.name} !`, 'success');
            renderPlanetarySystem(discoveredSystem.id);
        }
        return;
    }

    if (connectedSystemId && !viewingPlayer.discoveredSystemIds.includes(connectedSystemId)) { 
        const confirmDiscovery = await showConfirm(
            "Découverte de Route",
            `Vos scanners indiquent une route de saut stable mais non cartographiée vers le système <b>${discoveredSystem.name}</b>. Voulez-vous suivre ce chemin et l'ajouter à vos cartes ?`
        );
        if (confirmDiscovery) {
            viewingPlayer.discoveredSystemIds.push(connectedSystemId);
            saveData();
            renderPlanetarySystem(connectedSystemId);
            showNotification(`Nouvelle route cartographiée vers le système <b>${discoveredSystem.name}</b>.`, 'success');
        }
        return;
    }

    const explorationChoice = await showExplorationChoice(
        "Méthode d'Exploration",
        "Comment souhaitez-vous procéder ? Un saut à l'aveugle est gratuit mais risqué. L'envoi d'une sonde coûte 1 RP mais fournit des informations vitales avant de s'engager."
    );
    
    if (explorationChoice === 'probe') {
        if (viewingPlayer.requisitionPoints < 1) {
            showNotification("Points de Réquisition insuffisants !", 'warning');
            return;
        }
        viewingPlayer.requisitionPoints--;
        
        if (!viewingPlayer.probedSystemIds) viewingPlayer.probedSystemIds = [];
        if (!viewingPlayer.probedSystemIds.includes(discoveredSystem.id)) {
            viewingPlayer.probedSystemIds.push(discoveredSystem.id);
        }
        
        const hasEnemyPlanetInTarget = discoveredSystem.planets.some(
            p => p.owner !== 'neutral' && p.owner !== viewingPlayer.id
        );

        if (hasEnemyPlanetInTarget) {
            showNotification(`<b>Contact hostile détecté !</b> La sonde rapporte la présence d'une autre force de croisade.`, 'error', 8000);
            currentSystem.probedConnections[direction] = { id: discoveredSystem.id, status: 'player_contact', timestamp: Date.now() };

            const oppositeDir = { up: 'down', down: 'up', left: 'right', right: 'left' }[direction];
            if (!discoveredSystem.probedConnections) discoveredSystem.probedConnections = { up: null, down: null, left: null, right: null };
            discoveredSystem.probedConnections[oppositeDir] = { id: currentSystem.id, status: 'probe_detected', timestamp: Date.now() };

            const enemyPlayerIds = new Set(discoveredSystem.planets.map(p => p.owner).filter(o => o !== 'neutral' && o !== viewingPlayer.id));
            enemyPlayerIds.forEach(enemyId => {
                if (!campaignData.pendingNotifications) campaignData.pendingNotifications = [];
                campaignData.pendingNotifications.push({
                    playerId: enemyId,
                    message: `<b>ALERTE:</b> Des lectures énergétiques inhabituelles, typiques d'une sonde Augure, ont été détectées dans votre système <b>${discoveredSystem.name}</b> !`,
                    type: 'warning'
                });
            });

        } else { 
            showNotification(`<b>Résultat de la sonde :</b><br>Nouveau contact ! Vous avez découvert le système PNJ "<b>${discoveredSystem.name}</b>".`, 'info', 8000);
            currentSystem.probedConnections[direction] = { id: discoveredSystem.id, name: discoveredSystem.name, status: 'npc_contact', timestamp: Date.now() };
        }

        showNotification("Information enregistrée. Le système a été ajouté à vos cartes en tant que contact de sonde.", 'info', 8000);
        saveData();
        if (!playerDetailView.classList.contains('hidden')) renderPlayerDetail();
        if (!mapModal.classList.contains('hidden')) renderGalacticMap();
        updateExplorationArrows(currentSystem);

    } else if (explorationChoice === 'blind_jump') {
        showNotification("Saut à l'aveugle initié...", 'info', 3000);

        currentSystem.connections[direction] = discoveredSystem.id;
        discoveredSystem.connections[oppositeDirection] = currentSystem.id;

        if (!viewingPlayer.discoveredSystemIds.includes(discoveredSystem.id)) {
            viewingPlayer.discoveredSystemIds.push(discoveredSystem.id);
        }

        if (viewingPlayer.probedSystemIds) {
            const index = viewingPlayer.probedSystemIds.indexOf(discoveredSystem.id);
            if (index > -1) viewingPlayer.probedSystemIds.splice(index, 1);
        }

        const hasEnemyInTarget = discoveredSystem.planets.some(p => p.owner !== 'neutral' && p.owner !== viewingPlayer.id);

        if (hasEnemyInTarget) {
            showNotification(`<b>Contact hostile !</b> Le saut à l'aveugle vous a mené dans le système <b>${discoveredSystem.name}</b>. Votre arrivée a été détectée !`, 'error', 8000);
            
            const enemyPlayerIds = new Set(discoveredSystem.planets.map(p => p.owner).filter(o => o !== 'neutral' && o !== viewingPlayer.id));
            enemyPlayerIds.forEach(enemyId => {
                const enemyPlayer = campaignData.players.find(p => p.id === enemyId);
                if (enemyPlayer && !enemyPlayer.discoveredSystemIds.includes(currentSystem.id)) {
                     if (!enemyPlayer.discoveredSystemIds) enemyPlayer.discoveredSystemIds = [];
                     enemyPlayer.discoveredSystemIds.push(currentSystem.id);
                }
            });
        } else {
            showNotification(`Saut à l'aveugle réussi ! Vous avez découvert le système PNJ "<b>${discoveredSystem.name}</b>".`, 'success', 8000);
        }
        
        saveData();
        renderPlanetarySystem(discoveredSystem.id);
    }
};