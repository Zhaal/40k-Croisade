//======================================================================
//  GÉNÉRATION & LOGIQUE DE LA GALAXIE
//======================================================================

const getWeightedRandomPlanetType = () => {
    const types = [
        { name: "Monde Ruche", weight: 38 },
        { name: "Agri-monde", weight: 25 },
        { name: "Monde Sauvage", weight: 15 },
        { name: "Monde Mort", weight: 10 },
        { name: "Monde Forge", weight: 10 },
        { name: "Monde Saint (relique)", weight: 2 }
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
 * CORRIGÉ : Vérifie s'il existe un chemin de systèmes SÉCURISÉS (sans ennemis) contrôlés par le joueur jusqu'à son système d'origine.
 * Une ligne de ravitaillement ne peut pas passer par des systèmes contestés ou par de simples connexions sondées.
 * @param {string} startSystemId - L'ID du système de départ de la vérification.
 * @param {string} playerId - L'ID du joueur effectuant la vérification.
 * @returns {boolean} - True si une ligne de ravitaillement existe, sinon false.
 */
const hasSupplyLine = (startSystemId, playerId) => {
    const player = campaignData.players.find(p => p.id === playerId);
    if (!player) return false;

    const homeSystemId = player.systemId;
    if (startSystemId === homeSystemId) return true;

    // --- DÉBUT DE LA CORRECTION ---
    // Vérification initiale : le système de départ doit être sécurisé
    const startSystem = campaignData.systems.find(s => s.id === startSystemId);
    if (!startSystem) return false;

    const isStartSystemControlled = startSystem.planets.some(p => p.owner === playerId);
    const hasEnemyInStartSystem = startSystem.planets.some(p => p.owner !== 'neutral' && p.owner !== playerId);

    if (!isStartSystemControlled || hasEnemyInStartSystem) {
        return false; // Impossible d'avoir une ligne de ravitaillement depuis un système non contrôlé ou contesté.
    }
    // --- FIN DE LA CORRECTION ---

    const queue = [startSystemId];
    const visited = new Set([startSystemId]);

    while (queue.length > 0) {
        const currentId = queue.shift();
        const currentSystem = campaignData.systems.find(s => s.id === currentId);
        if (!currentSystem) continue;

        const allNeighborIds = new Set();
        Object.values(currentSystem.connections).forEach(id => {
            if (id) allNeighborIds.add(id);
        });
        (campaignData.gatewayLinks || []).forEach(link => {
            if (link.systemId1 === currentId) allNeighborIds.add(link.systemId2);
            if (link.systemId2 === currentId) allNeighborIds.add(link.systemId1);
        });

        for (const neighborId of allNeighborIds) {
            if (visited.has(neighborId)) continue;
            
            const neighborSystem = campaignData.systems.find(s => s.id === neighborId);
            if (!neighborSystem) continue;

            // --- DÉBUT DE LA CORRECTION ---
            // Un maillon de la chaîne de ravitaillement doit être contrôlé ET non contesté.
            const isNeighborControlled = neighborSystem.planets.some(p => p.owner === playerId);
            const hasEnemyInNeighbor = neighborSystem.planets.some(p => p.owner !== 'neutral' && p.owner !== playerId);
            
            // On peut traverser le système natal même s'il est contesté (cas d'une invasion).
            if (neighborId !== homeSystemId && (!isNeighborControlled || hasEnemyInNeighbor)) {
                continue; // Ce maillon est invalide, on ne peut pas passer par là.
            }
            // --- FIN DE LA CORRECTION ---

            if (neighborId === homeSystemId) {
                return true; // Chemin trouvé !
            }

            visited.add(neighborId);
            queue.push(neighborId);
        }
    }

    return false; // Aucun chemin trouvé
};


// NEW ASYNC HELPER FUNCTION
const performProbe = async (sourceSystem, targetSystem, direction, viewingPlayer) => {
    const hasFreeProbe = viewingPlayer.freeProbes && viewingPlayer.freeProbes > 0;
    if (!hasFreeProbe && viewingPlayer.requisitionPoints < 1) {
        showNotification("Points de Réquisition ou Sondes Gratuites insuffisants !", 'warning');
        return false; // Indicate failure
    }

    let costMessage = "";
    if (hasFreeProbe) {
        viewingPlayer.freeProbes--;
        costMessage = "en utilisant une <b>Sonde Gratuite</b>";
    } else {
        viewingPlayer.requisitionPoints--;
        costMessage = "pour <b>1 PR</b>";
    }

    logAction(viewingPlayer.id, `<b>${viewingPlayer.name}</b> a envoyé une sonde vers un système inconnu ${costMessage}.`, 'explore', '🛰️');

    if (!viewingPlayer.probedSystemIds) viewingPlayer.probedSystemIds = [];
    if (!viewingPlayer.probedSystemIds.includes(targetSystem.id)) {
        viewingPlayer.probedSystemIds.push(targetSystem.id);
    }

    const hasEnemyPlanetInTarget = targetSystem.planets.some(
        p => p.owner !== 'neutral' && p.owner !== viewingPlayer.id
    );

    if (hasEnemyPlanetInTarget) {
        showNotification(`<b>Contact hostile détecté !</b> La sonde rapporte la présence d'une autre force de croisade.`, 'error', 8000);
        logAction(viewingPlayer.id, `Sonde de <b>${viewingPlayer.name}</b> a détecté une présence hostile dans un système voisin !`, 'alert', '⚠️');
        sourceSystem.probedConnections[direction] = { id: targetSystem.id, status: 'player_contact', timestamp: Date.now() };

        const oppositeDir = { up: 'down', down: 'up', left: 'right', right: 'left' }[direction];
        if (!targetSystem.probedConnections) targetSystem.probedConnections = { up: null, down: null, left: null, right: null };
        targetSystem.probedConnections[oppositeDir] = { id: sourceSystem.id, status: 'probe_detected', timestamp: Date.now() };

        const enemyPlayerIds = new Set(targetSystem.planets.map(p => p.owner).filter(o => o !== 'neutral' && o !== viewingPlayer.id));
        enemyPlayerIds.forEach(enemyId => {
            if (!campaignData.pendingNotifications) campaignData.pendingNotifications = [];
            campaignData.pendingNotifications.push({
                playerId: enemyId,
                message: `<b>ALERTE:</b> Des lectures énergétiques inhabituelles, typiques d'une sonde Augure, ont été détectées dans votre système <b>${targetSystem.name}</b> !`,
                type: 'warning'
            });
            logAction(enemyId, `Une sonde ennemie a été détectée dans votre système <b>${targetSystem.name}</b> !`, 'alert', '⚠️');
        });

    } else {
        showNotification(`<b>Résultat de la sonde :</b><br>Nouveau contact ! Vous avez découvert un système PNJ.`, 'info', 8000);
        logAction(viewingPlayer.id, `Sonde de <b>${viewingPlayer.name}</b> a découvert un système inconnu.`, 'explore', '📡');
        sourceSystem.probedConnections[direction] = { id: targetSystem.id, name: targetSystem.name, status: 'npc_contact', timestamp: Date.now() };
    }

    showNotification("Information enregistrée. Le système a été ajouté à vos cartes en tant que contact de sonde.", 'info', 8000);
    saveData();
    // The calling function will be responsible for UI updates like re-rendering the map
    return true; // Indicate success
}


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

    if (probedInfo && probedInfo.status !== 'probe_detected') {
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
            const probeSuccessful = await performProbe(currentSystem, discoveredSystem, direction, viewingPlayer);
            if (probeSuccessful) {
                if (activePlayerIndex === campaignData.players.findIndex(p => p.id === viewingPlayer.id) && !playerDetailView.classList.contains('hidden')) {
                    renderPlayerDetail();
                }
                updateExplorationArrows(currentSystem);
                showNotification(`Données de la sonde réactualisées.`, 'success');
            }
            return;
        }
    
        if (outcome === 'establish') {
            // ==========================================================
            // DEBUT DE LA CORRECTION : Re-vérification des conditions avant d'établir le lien
            // ==========================================================
            // Condition 1 : Doit contrôler au moins une planète dans le système de départ.
            const hasFriendlyPlanetInCurrent = currentSystem.planets.some(p => p.owner === viewingPlayer.id);
            if (!hasFriendlyPlanetInCurrent && currentSystem.owner !== viewingPlayer.id) {
                showNotification("Action impossible : vous devez contrôler au moins une planète dans ce système pour établir un lien.", 'warning', 8000);
                return;
            }
            
            // Condition 2 : Doit avoir une ligne de ravitaillement ininterrompue vers le système natal.
            if (!hasSupplyLine(currentSystem.id, viewingPlayer.id)) {
                showNotification("<b>Ligne de ravitaillement rompue !</b> Impossible d'établir un lien car ce système n'est plus connecté à votre bastion.", 'error', 8000);
                return;
            }
            // ==========================================================
            // FIN DE LA CORRECTION
            // ==========================================================

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
    
            logAction(viewingPlayer.id, `<b>${viewingPlayer.name}</b> a établi une connexion permanente entre <b>${currentSystem.name}</b> et <b>${discoveredSystem.name}</b>.`, 'info', '🔗');
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
                        logAction(viewingPlayer.id, `La position de <b>${viewingPlayer.name}</b> a été révélée à <b>${discoveredPlayer.name}</b> suite au contact.`, 'alert', '💥');
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
        const choice = await showRouteDiscoveryChoice(
            "Route non cartographiée détectée",
            `Vos scanners indiquent un couloir de navigation stable mais non cartographié vers le système <b>${discoveredSystem.name}</b>. Ce passage est déjà utilisé par d'autres flottes. Comment voulez-vous procéder ?`
        );
    
        if (choice === 'probe') {
            const probeSuccessful = await performProbe(currentSystem, discoveredSystem, direction, viewingPlayer);
            if (probeSuccessful) {
                if (activePlayerIndex === campaignData.players.findIndex(p => p.id === viewingPlayer.id) && !playerDetailView.classList.contains('hidden')) {
                    renderPlayerDetail();
                }
                updateExplorationArrows(currentSystem);
            }
        } else if (choice === 'map') {
            viewingPlayer.discoveredSystemIds.push(connectedSystemId);
            logAction(viewingPlayer.id, `<b>${viewingPlayer.name}</b> a cartographié une route existante vers le système <b>${discoveredSystem.name}</b>.`, 'info', '🗺️');
            saveData();
            renderPlanetarySystem(connectedSystemId);
            showNotification(`Nouvelle route cartographiée vers le système <b>${discoveredSystem.name}</b>.`, 'success');
        }
        return;
    }

    const explorationChoice = await showExplorationChoice(
        "Méthode d'Exploration",
        "Comment souhaitez-vous procéder ? Un saut à l'aveugle est gratuit mais risqué. L'envoi d'une sonde coûte 1 RP (ou 1 Sonde Gratuite) mais fournit des informations vitales avant de s'engager."
    );
    
    if (explorationChoice === 'probe') {
        const probeSuccessful = await performProbe(currentSystem, discoveredSystem, direction, viewingPlayer);
        if(probeSuccessful) {
            if (!playerDetailView.classList.contains('hidden')) renderPlayerDetail();
            updateExplorationArrows(currentSystem);
        }
    } else if (explorationChoice === 'blind_jump') {
        // MODIFICATION : Le contrôle de planète est maintenant vérifié ici.
        const hasFriendlyPlanetInCurrent = currentSystem.planets.some(p => p.owner === viewingPlayer.id);
        if (!hasFriendlyPlanetInCurrent && currentSystem.owner !== viewingPlayer.id) {
            showNotification("Vous devez contrôler au moins une planète dans ce système pour pouvoir effectuer un saut à l'aveugle.", 'warning');
            return;
        }

        showNotification("Saut à l'aveugle initié...", 'info', 3000);
        logAction(viewingPlayer.id, `<b>${viewingPlayer.name}</b> a initié un saut à l'aveugle depuis <b>${currentSystem.name}</b>.`, 'explore', '🚀');

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
            logAction(viewingPlayer.id, `CONTACT HOSTILE ! Le saut de <b>${viewingPlayer.name}</b> l'a mené au système <b>${discoveredSystem.name}</b>.`, 'combat', '💥');
            
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
            logAction(viewingPlayer.id, `Saut réussi ! <b>${viewingPlayer.name}</b> a découvert <b>${discoveredSystem.name}</b>.`, 'explore', '✅');
        }
        
        saveData();
        renderPlanetarySystem(discoveredSystem.id);
    }
};