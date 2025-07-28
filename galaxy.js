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
    const hasEnemyPlanetInCurrent = currentSystem.planets.some(p => p.owner !== 'neutral' && p.owner !== viewingPlayer.id);
    if (hasEnemyPlanetInCurrent) {
        showNotification("<b>Blocus ennemi !</b> Vous ne pouvez pas explorer depuis ce système tant qu'une planète ennemie est présente.", 'error');
        return;
    }
    const hasFriendlyPlanetInCurrent = currentSystem.planets.some(p => p.owner === viewingPlayer.id);
    if (!hasFriendlyPlanetInCurrent && currentSystem.owner !== viewingPlayer.id) {
        showNotification("Vous devez contrôler au moins une planète dans ce système pour pouvoir explorer plus loin.", 'warning');
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

    if (probedInfo && probedInfo.status === 'player_contact') {
        const confirmed = await showConfirm(
            "Établir un Contact Hostile",
            `Vos sondes confirment la présence d'un autre joueur. Voulez-vous établir une connexion permanente ?<br><br><b>Attention :</b> Cette action est irréversible et révèlera immédiatement votre position à cet adversaire.`
        );

        if (confirmed) {
            currentSystem.connections[direction] = discoveredSystem.id;
            discoveredSystem.connections[oppositeDirection] = currentSystem.id;
            currentSystem.probedConnections[direction] = null;

            if (!viewingPlayer.discoveredSystemIds.includes(discoveredSystem.id)) {
                viewingPlayer.discoveredSystemIds.push(discoveredSystem.id);
            }

            const discoveredPlayer = campaignData.players.find(p => p.id === discoveredSystem.owner);
            if (discoveredPlayer) {
                if (!discoveredPlayer.discoveredSystemIds) discoveredPlayer.discoveredSystemIds = [];
                if (!discoveredPlayer.discoveredSystemIds.includes(currentSystem.id)) {
                    discoveredPlayer.discoveredSystemIds.push(currentSystem.id);
                    showNotification(`Le joueur <b>${discoveredPlayer.name}</b> a été alerté de votre présence.`, 'warning');
                }
            }
            
            saveData();
            showNotification(`Connexion établie vers le système hostile !`, 'success');
            renderPlanetarySystem(discoveredSystem.id);
        }
        return;
    }

    if (probedInfo) {
        const probedSystem = campaignData.systems.find(s => s.id === probedInfo.id);
        if (!probedSystem) {
            showNotification("Erreur: Le système sondé n'a pas été retrouvé.", 'error');
            currentSystem.probedConnections[direction] = null;
            saveData();
            updateExplorationArrows(currentSystem);
            return;
        }
        
        if (await showConfirm("Connexion PNJ", `Vous avez déjà sondé le système PNJ "<b>${probedInfo.name}</b>".<br>Voulez-vous établir une connexion permanente ?`)) {
            currentSystem.connections[direction] = probedSystem.id;
            probedSystem.connections[oppositeDirection] = currentSystem.id;
            currentSystem.probedConnections[direction] = null;
            
            if (!viewingPlayer.discoveredSystemIds.includes(probedSystem.id)) {
                viewingPlayer.discoveredSystemIds.push(probedSystem.id);
            }
            
            saveData();
            renderPlanetarySystem(probedSystem.id);
            showNotification(`Connexion établie avec ${probedSystem.name}`, 'success');
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

    const useProbe = await showConfirm("Méthode d'Exploration", "Envoyer une sonde (coût: 1 RP) ?<br><small>(Annuler pour un saut à l'aveugle standard, gratuit mais plus risqué)</small>");
    
    if (useProbe) {
        if (viewingPlayer.requisitionPoints < 1) {
            showNotification("Points de Réquisition insuffisants !", 'warning');
            return;
        }
        viewingPlayer.requisitionPoints--;
        
        const hasEnemyPlanetInTarget = discoveredSystem.planets.some(
            p => p.owner !== 'neutral' && p.owner !== viewingPlayer.id
        );

        if (hasEnemyPlanetInTarget) {
            showNotification(`<b>Contact hostile détecté !</b> La sonde rapporte la présence d'une autre force de croisade.`, 'error', 8000);
            currentSystem.probedConnections[direction] = { id: discoveredSystem.id, status: 'player_contact' };
        } else { 
            showNotification(`<b>Résultat de la sonde :</b><br>Nouveau contact ! Vous avez découvert le système PNJ "<b>${discoveredSystem.name}</b>".`, 'info', 8000);
            currentSystem.probedConnections[direction] = { id: discoveredSystem.id, name: discoveredSystem.name, status: 'npc_contact' };
        }

        showNotification("Information enregistrée. Cliquez à nouveau sur la flèche pour agir.", 'info', 8000);
        saveData();
        if (!playerDetailView.classList.contains('hidden')) renderPlayerDetail();
        updateExplorationArrows(currentSystem);
    } else {
        showNotification("Saut à l'aveugle initié...", 'info', 3000);

        currentSystem.connections[direction] = discoveredSystem.id;
        discoveredSystem.connections[oppositeDirection] = currentSystem.id;

        if (!viewingPlayer.discoveredSystemIds.includes(discoveredSystem.id)) {
            viewingPlayer.discoveredSystemIds.push(discoveredSystem.id);
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
                     console.log(`Player ${enemyPlayer.name} has been alerted to system ${currentSystem.name}`);
                }
            });
        } else {
            showNotification(`Saut à l'aveugle réussi ! Vous avez découvert le système PNJ "<b>${discoveredSystem.name}</b>".`, 'success', 8000);
        }
        
        saveData();
        renderPlanetarySystem(discoveredSystem.id);
    }
};