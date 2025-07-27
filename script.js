document.addEventListener('DOMContentLoaded', () => {

    //======================================================================
    //  ÉLÉMENTS DU DOM
    //======================================================================
    const playerListView = document.getElementById('player-list-view');
    const playerDetailView = document.getElementById('player-detail-view');
    const playerListDiv = document.getElementById('player-list');

    const addPlayerBtn = document.getElementById('add-player-btn');
    const playerModal = document.getElementById('player-modal');
    const playerForm = document.getElementById('player-form');
    const playerModalTitle = document.getElementById('player-modal-title');

    const unitModal = document.getElementById('unit-modal');
    const unitForm = document.getElementById('unit-form');
    const unitModalTitle = document.getElementById('unit-modal-title');

    const worldModal = document.getElementById('world-modal');
    const systemContainer = document.getElementById('system-container');
    const planetarySystemDiv = document.getElementById('planetary-system');
    const planetTypeModal = document.getElementById('planet-type-modal');
    const planetTypeForm = document.getElementById('planet-type-form');

    const backToListBtn = document.getElementById('back-to-list-btn');
    const backToSystemBtn = document.getElementById('back-to-system-btn');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    const resetCampaignBtn = document.getElementById('reset-campaign-btn');

    const mapModal = document.getElementById('map-modal');
    const mapContainer = document.getElementById('galactic-map-container');


    //======================================================================
    //  ÉTAT DE L'APPLICATION (STATE)
    //======================================================================
    let campaignData = {
        players: [],
        systems: []
    };

    let activePlayerIndex = -1;
    let editingPlayerIndex = -1;
    let editingUnitIndex = -1;
    let currentlyViewedSystemId = null;
    let mapViewingPlayerId = null; // MODIFICATION : ID du joueur pour le PdV de la carte, maintenant utilisé de façon centrale
    let currentMapScale = 1;

    let isPanning = false;
    let wasDragged = false;
    let startX, scrollLeftStart;
    let startY, scrollTopStart;

    //======================================================================
    //  GESTION DES DONNÉES (LOCALSTORAGE & JSON)
    //======================================================================
    const saveData = () => {
        localStorage.setItem('nexusCrusadeData', JSON.stringify(campaignData));
    };

    const loadData = () => {
        const data = localStorage.getItem('nexusCrusadeData');
        if (!data) return;

        campaignData = JSON.parse(data);

        // Data migration logic...
        let dataWasMigrated = false;
        if (campaignData.systems) {
            campaignData.systems.forEach(system => {
                if (!system.connections) {
                    system.connections = { up: null, down: null, left: null, right: null };
                    dataWasMigrated = true;
                }
            });
        }
        if (!campaignData.systems) {
            campaignData.systems = [];
            campaignData.players.forEach((player, index) => {
                if (player.planets && !player.systemId) {
                    const newSystemId = crypto.randomUUID();
                    const newSystem = {
                        id: newSystemId,
                        name: `${player.name}'s Home System`,
                        owner: player.id || index,
                        planets: player.planets,
                        connections: { up: null, down: null, left: null, right: null }
                    };
                    campaignData.systems.push(newSystem);
                    player.systemId = newSystemId;
                    delete player.planets;
                    dataWasMigrated = true;
                }
            });
        }
        if (dataWasMigrated) { saveData(); }
    };

    exportBtn.addEventListener('click', () => {
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
    });

    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (importedData && Array.isArray(importedData.players)) {
                    if (confirm("Importer ce fichier écrasera les données actuelles. Continuer ?")) {
                        campaignData = importedData;
                        loadData();
                        saveData();
                        renderPlayerList();
                        switchView('list');
                        alert("Importation réussie !");
                    }
                } else { alert("Fichier JSON invalide."); }
            } catch (error) { alert("Erreur lors de la lecture du fichier : " + error.message); }
        };
        reader.readAsText(file);
        event.target.value = null;
    });

    //======================================================================
    //  ANALYSE DE CONTRÔLE & STATUT (LOGIQUE CENTRALE)
    //======================================================================

    /**
     * Analyse un système pour déterminer quels joueurs contrôlent des planètes à l'intérieur.
     * @param {object} system - L'objet système à analyser.
     * @returns {object} Un objet contenant les ID des joueurs et le détail du contrôle.
     */
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

        return {
            controlBreakdown,
            controllingPlayerIds,
        };
    };

    /**
     * Détermine le statut d'un système (ami, hostile, neutre) du point de vue d'un joueur donné.
     * @param {object} system - Le système à évaluer.
     * @param {string} viewingPlayerId - L'ID du joueur qui "regarde".
     * @returns {{status: string, text: string}} - Le statut ('friendly', 'hostile', 'neutral') et un texte descriptif.
     */
    const getSystemStatusForPlayer = (system, viewingPlayerId) => {
        const { controllingPlayerIds } = getSystemControlInfo(system);
        
        const otherPlayersInSystem = new Set(controllingPlayerIds);
        otherPlayersInSystem.delete(viewingPlayerId);

        if (otherPlayersInSystem.size > 0) {
            return { status: 'hostile', text: 'Présence Ennemie' };
        }
        
        if (controllingPlayerIds.has(viewingPlayerId)) {
            return { status: 'friendly', text: 'Contrôlé par vous' };
        }
        
        if (controllingPlayerIds.size === 0) {
            return { status: 'neutral', text: 'Neutre' };
        }
        
        // Fallback, ne devrait pas être atteint dans la logique normale
        return { status: 'neutral', text: 'Inconnu' };
    };

    /**
     * NOUVEAU : Calcule tous les systèmes accessibles depuis un point de départ (Brouillard de Guerre)
     * @param {string} startSystemId - L'ID du système de départ.
     * @returns {Set<string>} Un Set contenant les ID de tous les systèmes accessibles.
     */
    const getReachableSystems = (startSystemId) => {
        const reachable = new Set();
        if (!startSystemId) return reachable;

        const queue = [startSystemId];
        reachable.add(startSystemId);

        while (queue.length > 0) {
            const currentId = queue.shift();
            const currentSystem = campaignData.systems.find(s => s.id === currentId);
            if (currentSystem) {
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
    
    /**
     * NOUVEAU : Vérifie si un joueur est "découvrable" par d'autres joueurs lors de l'exploration.
     * Pour être découvrable, un joueur doit avoir sécurisé son système de départ ET avoir déjà exploré au moins une fois.
     * @param {string} playerId - L'ID du joueur à vérifier.
     * @returns {boolean} - True si le joueur est découvrable, sinon false.
     */
    const isPlayerDiscoverable = (playerId) => {
        const player = campaignData.players.find(p => p.id === playerId);
        if (!player) return false;

        const homeSystem = campaignData.systems.find(s => s.id === player.systemId);
        if (!homeSystem) return false;

        // Condition 1: Le joueur doit contrôler toutes les planètes de son système.
        const controlsHomeSystem = homeSystem.planets.every(p => p.owner === playerId);
        if (!controlsHomeSystem) {
            return false; // Pas découvrable s'il n'a pas conquis son propre système.
        }

        // Condition 2: Le joueur doit avoir au moins une connexion sortante depuis son système.
        const hasExplored = Object.values(homeSystem.connections).some(connId => connId !== null);
        if (!hasExplored) {
            return false; // Pas découvrable s'il n'a jamais quitté son système.
        }

        // Si les deux conditions sont remplies, le joueur est découvrable.
        return true;
    };


    //======================================================================
    //  LOGIQUE DE RENDU (AFFICHAGE)
    //======================================================================
    const switchView = (view) => {
        if (view === 'detail') {
            playerListView.classList.add('hidden');
            playerDetailView.classList.remove('hidden');
        } else { // 'list'
            playerListView.classList.remove('hidden');
            playerDetailView.classList.add('hidden');
            activePlayerIndex = -1;
            backToSystemBtn.classList.add('hidden');
        }
    };

    const renderPlayerList = () => {
        playerListDiv.innerHTML = '';
        if (campaignData.players.length === 0) {
            playerListDiv.innerHTML = `<p>Aucun joueur pour le moment. Ajoutez-en un pour commencer !</p>`;
            return;
        }

        campaignData.players.forEach((player, index) => {
            const card = document.createElement('div');
            card.className = 'player-card';
            card.innerHTML = `
                <h3 class="player-name-link" data-index="${index}">${player.name}</h3>
                <p>${player.faction || 'Faction non spécifiée'}</p>
                <div class="player-card-actions">
                    <button class="btn-secondary edit-player-btn" data-index="${index}">Modifier</button>
                    <button class="btn-danger delete-player-btn" data-index="${index}">Supprimer</button>
                    <button class="btn-secondary world-btn" data-index="${index}">Système</button>
                </div>
            `;
            playerListDiv.appendChild(card);
        });
    };

    const renderPlayerDetail = () => {
        if (activePlayerIndex === -1) return;
        const player = campaignData.players[activePlayerIndex];

        document.getElementById('player-name-display').textContent = player.name;
        document.getElementById('player-faction-display').textContent = player.faction;
        document.getElementById('crusade-faction').value = player.crusadeFaction || '';
        document.getElementById('pr-points').textContent = player.requisitionPoints;
        document.getElementById('supply-limit').value = player.supplyLimit;

        const battleTally = (player.battles.wins || 0) + (player.battles.draws || 0) + (player.battles.losses || 0);
        document.getElementById('battle-tally').textContent = battleTally;
        document.getElementById('wins').textContent = player.battles.wins || 0;
        document.getElementById('draws').textContent = player.battles.draws || 0;
        document.getElementById('losses').textContent = player.battles.losses || 0;

        document.getElementById('goals-notes').value = player.goalsNotes || '';

        renderOrderOfBattle();
    };

    const getRankFromXp = (xp) => {
        if (xp >= 101) return 'Légendaire';
        if (xp >= 51) return 'Héroïque';
        if (xp >= 16) return 'Aguerri';
        if (xp >= 6) return 'Endurci';
        return 'Bleusaille';
    };

    const renderOrderOfBattle = () => {
        const player = campaignData.players[activePlayerIndex];
        const tbody = document.getElementById('units-tbody');
        tbody.innerHTML = '';
        let supplyUsed = 0;

        (player.units || []).forEach((unit, index) => {
            supplyUsed += unit.powerRating;
            const rank = getRankFromXp(unit.xp);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${unit.name}</td>
                <td>${unit.role}</td>
                <td>${unit.powerRating}</td>
                <td>${unit.crusadePoints || 0}</td>
                <td>${unit.xp}</td>
                <td>${rank}</td>
                <td>
                    <button class="btn-secondary edit-unit-btn" data-index="${index}">Détails</button>
                    <button class="btn-danger delete-unit-btn" data-index="${index}">Supprimer</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        document.getElementById('supply-used').textContent = supplyUsed;
    };

    const renderPlanetarySystem = (systemId) => {
        const system = campaignData.systems.find(s => s.id === systemId);
        if (!system) return;

        currentlyViewedSystemId = systemId;
        planetarySystemDiv.innerHTML = '';

        const sun = document.createElement('div');
        sun.className = 'sun';
        planetarySystemDiv.appendChild(sun);

        const systemSize = planetarySystemDiv.clientWidth;
        if (systemSize === 0) return;

        const center = systemSize / 2;
        const orbitRadiiFactors = [0.18, 0.26, 0.34, 0.42, 0.50];

        system.planets.forEach((_, index) => {
            const orbitIndex = Math.min(index, orbitRadiiFactors.length - 1);
            const pathRadius = center * orbitRadiiFactors[orbitIndex];
            const orbitDiv = document.createElement('div');
            orbitDiv.className = 'orbit';
            orbitDiv.style.width = `${pathRadius * 2}px`;
            orbitDiv.style.height = `${pathRadius * 2}px`;
            planetarySystemDiv.appendChild(orbitDiv);
        });

        const planetElements = [];
        system.planets.forEach((planet, index) => {
            const orbitIndex = Math.min(index, orbitRadiiFactors.length - 1);
            const pathRadius = center * orbitRadiiFactors[orbitIndex];
            const angle = (2 * Math.PI / Math.max(system.planets.length, 1)) * index - (Math.PI / 2);

            const wrapperDiv = document.createElement('div');
            wrapperDiv.className = 'planet-wrapper';

            const planetDiv = document.createElement('div');
            planetDiv.className = 'planet';
            planetDiv.dataset.type = planet.type;
            planetDiv.dataset.owner = planet.owner;
            planetDiv.dataset.systemId = systemId;
            planetDiv.dataset.planetIndex = index;
            // AJOUT: Appliquer la classe 'friendly-planet' si la planète appartient au joueur qui regarde
            if (planet.owner === mapViewingPlayerId) {
                planetDiv.classList.add('friendly-planet');
            }
            planetDiv.textContent = planet.name.substring(0, 3).toUpperCase();

            const labelDiv = document.createElement('div');
            labelDiv.className = 'planet-label';

            let ownerName = '';
            let planetTitle = `${planet.name} - ${planet.type}`;

            if (planet.owner === 'neutral') {
                planetTitle += ` (Défense PNJ: ${planet.defense || 0} pts)`;
            } else {
                const ownerPlayer = campaignData.players.find(p => p.id === planet.owner);
                if (ownerPlayer) {
                    ownerName = ownerPlayer.name;
                    planetTitle += ` (${ownerName})`;
                }
            }
            planetDiv.title = planetTitle;
            labelDiv.textContent = ownerName;

            wrapperDiv.appendChild(planetDiv);
            wrapperDiv.appendChild(labelDiv);

            const planetDiameterPixels = systemSize * 0.08;
            planetDiv.style.width = `${planetDiameterPixels}px`;
            planetDiv.style.height = `${planetDiameterPixels}px`;

            const x = center + pathRadius * Math.cos(angle) - (planetDiameterPixels / 2);
            const y = center + pathRadius * Math.sin(angle) - (planetDiameterPixels / 2);

            wrapperDiv.style.left = `${x}px`;
            wrapperDiv.style.top = `${y}px`;

            planetElements.push(wrapperDiv);
        });

        planetElements.forEach(p => planetarySystemDiv.appendChild(p));
        document.getElementById('world-modal-title').textContent = `Système : ${system.name}`;

        updateExplorationArrows(system);
    };

    const renderGalacticMap = () => {
        mapContainer.innerHTML = '';
        const playerViewSelect = document.getElementById('map-player-view-select');
        const viewingPlayer = campaignData.players.find(p => p.id === mapViewingPlayerId);

        // Peupler et définir la valeur du sélecteur de joueur
        playerViewSelect.innerHTML = '';
        campaignData.players.forEach(player => {
            const option = document.createElement('option');
            option.value = player.id;
            option.textContent = player.name;
            playerViewSelect.appendChild(option);
        });
        
        if (viewingPlayer) {
            playerViewSelect.value = mapViewingPlayerId;
        } else if (campaignData.players.length > 0) {
            mapViewingPlayerId = campaignData.players[0].id;
            playerViewSelect.value = mapViewingPlayerId;
        }

        // NOUVEAU : Logique de Brouillard de Guerre
        const playerSystemId = viewingPlayer ? viewingPlayer.systemId : null;
        const visibleSystemIds = getReachableSystems(playerSystemId);
        const systemsToDisplay = campaignData.systems.filter(s => visibleSystemIds.has(s.id));

        if (systemsToDisplay.length === 0) {
            mapContainer.innerHTML = '<p style="text-align: center; padding-top: 50px;">Aucun système découvert.</p>';
            return;
        }
        
        const viewport = document.createElement('div');
        viewport.className = 'map-viewport';
        viewport.style.transform = `scale(${currentMapScale})`;
        mapContainer.appendChild(viewport);
        
        // --- Logique de positionnement ---
        const systemPositions = new Map();
        const placedSystems = new Set();
        const STEP_DISTANCE = 250;
        
        const placeSystem = (system, x, y) => {
            if (!system || placedSystems.has(system.id) || !visibleSystemIds.has(system.id)) return;
            systemPositions.set(system.id, { x, y });
            placedSystems.add(system.id);
            Object.entries(system.connections).forEach(([direction, connectedId]) => {
                if (connectedId) {
                    const connectedSystem = campaignData.systems.find(s => s.id === connectedId);
                    let newX = x, newY = y;
                    if (direction === 'up') newY -= STEP_DISTANCE;
                    else if (direction === 'down') newY += STEP_DISTANCE;
                    else if (direction === 'left') newX -= STEP_DISTANCE;
                    else if (direction === 'right') newX += STEP_DISTANCE;
                    placeSystem(connectedSystem, newX, newY);
                }
            });
        };
        
        const startSystem = campaignData.systems.find(s => s.id === currentlyViewedSystemId) || systemsToDisplay[0];
        placeSystem(startSystem, viewport.clientWidth / 2, viewport.clientHeight / 2);
        
        systemsToDisplay.forEach((sys, i) => {
            if (!placedSystems.has(sys.id)) {
                 placeSystem(sys, (viewport.clientWidth / 2) + (i % 5) * STEP_DISTANCE, (viewport.clientHeight / 2) + Math.floor(i / 5) * STEP_DISTANCE);
            }
        });
        
        // Dessiner les connexions
        const drawnConnections = new Set();
        systemsToDisplay.forEach(system => {
            const pos1 = systemPositions.get(system.id);
            if (!pos1) return;
            Object.values(system.connections).forEach(connectedId => {
                if (connectedId && visibleSystemIds.has(connectedId)) { // Ne dessine que les connexions visibles
                    const key = [system.id, connectedId].sort().join('-');
                    if (drawnConnections.has(key)) return;
                    const pos2 = systemPositions.get(connectedId);
                    if (pos2) {
                        const line = document.createElement('div');
                        line.className = 'connection-line';
                        const deltaX = pos2.x - pos1.x;
                        const deltaY = pos2.y - pos1.y;
                        const distance = Math.hypot(deltaX, deltaY);
                        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
                        line.style.left = `${pos1.x}px`;
                        line.style.top = `${pos1.y}px`;
                        line.style.width = `${distance}px`;
                        line.style.transform = `rotate(${angle}deg)`;
                        viewport.appendChild(line);
                        drawnConnections.add(key);
                    }
                }
            });
        });
        
        // Créer les noeuds de système
        for (const [systemId, pos] of systemPositions.entries()) {
            const system = systemsToDisplay.find(s => s.id === systemId);
            const node = document.createElement('div');
            node.className = 'system-node';
            node.dataset.systemId = system.id;
        
            const { status, text } = getSystemStatusForPlayer(system, mapViewingPlayerId);
            const { controlBreakdown } = getSystemControlInfo(system);
        
            node.classList.remove('player-controlled', 'contested', 'fully-neutral');
            switch (status) {
                case 'friendly': node.classList.add('player-controlled'); break;
                case 'hostile': node.classList.add('contested'); break;
                case 'neutral': node.classList.add('fully-neutral'); break;
            }
            
            let breakdownText = Object.entries(controlBreakdown).map(([ownerId, count]) => {
                if (ownerId === 'neutral') return `PNJ: ${count}`;
                const player = campaignData.players.find(p => p.id === ownerId);
                return `${player ? player.name.split(' ')[0] : '???'}: ${count}`;
            }).join(', ');

            const ownerInfo = `${text}<br><small>${breakdownText || 'Inexploré'}</small>`;

            node.innerHTML = `<span>${system.name}</span><small>${ownerInfo}</small>`;
            node.title = `${system.name}\n${ownerInfo.replace(/<br>/g, '\n').replace(/<small>|<\/small>/g, '')}`;
        
            node.style.left = `${pos.x}px`;
            node.style.top = `${pos.y}px`;
            viewport.appendChild(node);
        }

        const centerSystemPos = systemPositions.get(currentlyViewedSystemId);
        if (centerSystemPos) {
            mapContainer.scrollLeft = centerSystemPos.x * currentMapScale - mapContainer.clientWidth / 2;
            mapContainer.scrollTop = centerSystemPos.y * currentMapScale - mapContainer.clientHeight / 2;
        }
    };

    const updateExplorationArrows = (currentSystem) => {
        const directions = ['up', 'down', 'left', 'right'];
        const arrowSymbols = { up: '↑', down: '↓', left: '←', right: '→' };
        const style = getComputedStyle(document.documentElement);
        const colors = {
            red: style.getPropertyValue('--danger-color').trim(),
            green: style.getPropertyValue('--friendly-color').trim(), // MODIFIÉ: Utilise la nouvelle couleur verte
            yellow: style.getPropertyValue('--warning-color').trim(),
            default: style.getPropertyValue('--text-muted-color').trim()
        };

        const viewingPlayerId = mapViewingPlayerId;

        directions.forEach(dir => {
            const arrow = document.getElementById(`explore-${dir}`);
            const connectedSystemId = currentSystem.connections[dir];

            let label = `<span class="arrow-symbol">${arrowSymbols[dir]}</span><small>Explorer</small>`;
            arrow.style.borderColor = colors.default;
            arrow.style.color = colors.default;
            arrow.title = `Explorer vers ${dir}`;

            if (connectedSystemId) {
                const connectedSystem = campaignData.systems.find(s => s.id === connectedSystemId);
                if (connectedSystem) {
                    const { status, text } = getSystemStatusForPlayer(connectedSystem, viewingPlayerId);
                    let borderColor = colors.default;
                    switch(status) {
                        case 'friendly': borderColor = colors.green; break;
                        case 'hostile':  borderColor = colors.red; break;
                        case 'neutral':  borderColor = colors.yellow; break;
                    }
                    
                    arrow.style.borderColor = borderColor;
                    arrow.style.color = borderColor;

                    label = `<span class="arrow-symbol">${arrowSymbols[dir]}</span><small>${connectedSystem.name}<br>${text}</small>`;
                    arrow.title = `Voyager vers ${connectedSystem.name} (${text})`;

                } else {
                    label = `<span class="arrow-symbol">${arrowSymbols[dir]}</span><small>???</small>`;
                    arrow.title = `Route vers un système inconnu`;
                }
            }
            arrow.innerHTML = label;
        });
    };

    //======================================================================
    //  LOGIQUE D'EXPLORATION
    //======================================================================
    const getUniqueSystemName = () => {
        const usedNames = new Set(campaignData.systems.map(s => s.name));
        const systemNamesList = ["Alpha Centauri", "Proxima", "Sirius", "Luyten", "Vega", "Rigel", "Betelgeuse", "Aldebaran", "Antares", "Spica", "Procyon", "Cygnus", "Deneb", "Altair"];
        const availableNames = systemNamesList.filter(name => !usedNames.has(name));
        if (availableNames.length === 0) {
            return `Système Inconnu ${Math.floor(Math.random() * 1000)}`;
        }
        return availableNames[Math.floor(Math.random() * availableNames.length)];
    };

    const generateRandomNPCSystem = () => {
        const planetTypes = ["Monde Mort", "Monde Sauvage", "Agri-monde", "Monde Forge", "Monde Ruche", "Monde Ancien"];
        const planetNames = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"];
        const numPlanets = Math.floor(Math.random() * 4) + 2;
        const planets = [];
        for (let i = 0; i < numPlanets; i++) {
            planets.push({
                type: planetTypes[Math.floor(Math.random() * planetTypes.length)],
                name: planetNames[i] || `Planet ${i + 1}`,
                owner: "neutral",
                defense: (Math.floor(Math.random() * 10) + 1) * 100
            });
        }
        return {
            id: crypto.randomUUID(),
            name: getUniqueSystemName(),
            owner: 'npc',
            planets: planets,
            connections: { up: null, down: null, left: null, right: null }
        };
    };

    const handleExploration = (direction) => {
        const currentSystem = campaignData.systems.find(s => s.id === currentlyViewedSystemId);
        if (!currentSystem) return;

        const viewingPlayer = campaignData.players.find(p => p.id === mapViewingPlayerId);
        if (!viewingPlayer) {
            alert("Erreur : Impossible de trouver le joueur actif pour l'exploration.");
            return;
        }

        if(viewingPlayer && viewingPlayer.systemId === currentSystem.id) {
             if (!currentSystem.planets.every(p => p.owner === viewingPlayer.id || p.owner === 'neutral' && p.defense === 0)) {
                alert("Vous devez conquérir toutes les planètes PNJ de votre système de départ avant de pouvoir explorer !");
                return;
            }
        }

        if (currentSystem.connections[direction]) {
            renderPlanetarySystem(currentSystem.connections[direction]);
            return;
        }

        let discoveredSystem;
        
        //--- DÉBUT DE LA MODIFICATION ---
        const reachableSystems = getReachableSystems(viewingPlayer.systemId);

        // 2. Trouver les systèmes de départ des autres joueurs qui ne sont PAS dans l'ensemble des systèmes accessibles ET qui sont "découvrables".
        const unreachablePlayerSystems = campaignData.players
            .map(p => campaignData.systems.find(s => s.id === p.systemId))
            .filter(system => {
                // Filtrage de base : le système doit exister, ne pas être celui du joueur actif, et ne pas être déjà accessible.
                if (!system || system.id === viewingPlayer.systemId || reachableSystems.has(system.id)) {
                    return false;
                }
                // NOUVELLE CONDITION : Le propriétaire du système doit être découvrable.
                // L'owner d'un système de départ est l'ID du joueur.
                return isPlayerDiscoverable(system.owner);
            });

        // 3. Avoir une chance de découvrir l'un de ces systèmes inaccessibles pour créer un pont.
        if (unreachablePlayerSystems.length > 0 && Math.random() < 0.25) { // 25% de chance de trouver un autre amas de joueurs
            discoveredSystem = unreachablePlayerSystems[Math.floor(Math.random() * unreachablePlayerSystems.length)];
            alert(`✨ Contact majeur ! ✨\nVous avez établi une route vers le système "${discoveredSystem.name}", qui appartient à un autre groupe de la croisade !`);
        } else {
            // 4. Sinon, générer un système PNJ normal.
            discoveredSystem = generateRandomNPCSystem();
            campaignData.systems.push(discoveredSystem);
            alert(`Nouveau contact ! Vous avez découvert le système PNJ "${discoveredSystem.name}".`);
        }
        //--- FIN DE LA MODIFICATION ---


        const oppositeDirection = { up: 'down', down: 'up', left: 'right', right: 'left' }[direction];
        currentSystem.connections[direction] = discoveredSystem.id;
        discoveredSystem.connections[oppositeDirection] = currentSystem.id;

        // Auto-connect neighbors
        Object.keys(currentSystem.connections).forEach(linkDir => {
            if (linkDir === direction || linkDir === oppositeDirection) return;
            const intermediateSystemId = currentSystem.connections[linkDir];
            if (intermediateSystemId) {
                const intermediateSystem = campaignData.systems.find(s => s.id === intermediateSystemId);
                if (intermediateSystem && intermediateSystem.connections[direction]) {
                    const targetNeighbor = campaignData.systems.find(s => s.id === intermediateSystem.connections[direction]);
                    const oppositeLinkDir = { up: 'down', down: 'up', left: 'right', right: 'left' }[linkDir];
                    if (targetNeighbor && !discoveredSystem.connections[linkDir]) {
                        discoveredSystem.connections[linkDir] = targetNeighbor.id;
                        targetNeighbor.connections[oppositeLinkDir] = discoveredSystem.id;
                    }
                }
            }
        });

        saveData();
        renderPlanetarySystem(discoveredSystem.id);
    };


    //======================================================================
    //  GESTION DES MODALES ET ÉVÉNEMENTS
    //======================================================================
    const openModal = (modal) => modal.classList.remove('hidden');
    const closeModal = (modal) => modal.classList.add('hidden');

    document.querySelectorAll('.modal .close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => closeModal(e.target.closest('.modal')));
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) { closeModal(e.target); }
    });

    addPlayerBtn.addEventListener('click', () => {
        editingPlayerIndex = -1;
        playerModalTitle.textContent = "Ajouter un Joueur";
        playerForm.reset();
        document.getElementById('player-id').value = '';
        openModal(playerModal);
    });

    document.getElementById('add-unit-btn').addEventListener('click', () => {
        editingUnitIndex = -1;
        unitForm.reset();
        document.getElementById('unit-id').value = '';
        unitModalTitle.textContent = "Ajouter une Unité";
        document.getElementById('unit-rank-display').textContent = getRankFromXp(0);
        openModal(unitModal);
    });

    resetCampaignBtn.addEventListener('click', () => {
        if (confirm("Êtes-vous sûr de vouloir déclencher une Explosion du Warp ? Toutes les connexions et systèmes PNJ seront détruits, et les systèmes des joueurs seront réinitialisés. Les fiches de joueur resteront intactes.")) {
            campaignData.systems = []; // Vider les systèmes

            const PLANET_TYPES = ["Monde Mort", "Monde Sauvage", "Agri-monde", "Monde Forge", "Monde Ruche", "Monde Ancien"];
            
            // Recréer un système de départ pour chaque joueur
            campaignData.players.forEach(player => {
                const newSystemId = crypto.randomUUID();
                const newPlanets = Array.from({ length: 5 }, (_, i) => ({
                    type: i === 0 ? "Monde Sauvage" : PLANET_TYPES[Math.floor(Math.random() * PLANET_TYPES.length)],
                    name: ["Prima", "Secundus", "Tertius", "Quartus", "Quintus"][i],
                    owner: i === 0 ? player.id : "neutral",
                    defense: i === 0 ? 0 : 500 + (Math.floor(Math.random() * 31)) * 50
                }));

                const newSystem = {
                    id: newSystemId,
                    name: `${player.name}'s Home System`,
                    owner: player.id,
                    planets: newPlanets,
                    connections: { up: null, down: null, left: null, right: null }
                };
                
                campaignData.systems.push(newSystem);
                player.systemId = newSystemId; // Relier le joueur à son nouveau système
            });

            saveData();
            switchView('list');
            renderPlayerList();
            alert("Le Warp a tout consumé. Les systèmes ont été réinitialisés.");
        }
    });

    playerListDiv.addEventListener('click', (e) => {
        const target = e.target;
        if (target.matches('.edit-player-btn')) {
            editingPlayerIndex = parseInt(target.dataset.index);
            const player = campaignData.players[editingPlayerIndex];
            playerModalTitle.textContent = "Modifier un Joueur";
            document.getElementById('player-id').value = editingPlayerIndex;
            document.getElementById('player-name-input').value = player.name;
            document.getElementById('player-faction-input').value = player.faction;
            openModal(playerModal);
        } else if (target.matches('.player-name-link')) {
            activePlayerIndex = parseInt(target.dataset.index);
            backToSystemBtn.classList.add('hidden');
            renderPlayerDetail();
            switchView('detail');
        } else if (target.matches('.world-btn')) {
            const playerIndex = parseInt(target.dataset.index);
            const player = campaignData.players[playerIndex];
            if (player.systemId) {
                activePlayerIndex = playerIndex;
                mapViewingPlayerId = player.id; 
                openModal(worldModal);
                setTimeout(() => renderPlanetarySystem(player.systemId), 50);
            } else { alert("Erreur : ce joueur n'a pas de système assigné."); }
        } else if (target.matches('.delete-player-btn')) {
            const index = parseInt(target.dataset.index);
            const playerName = campaignData.players[index].name;
            if (confirm(`Êtes-vous sûr de vouloir supprimer le joueur "${playerName}" ? Cette action est irréversible.`)) {
                const systemIdToDelete = campaignData.players[index].systemId;
                campaignData.players.splice(index, 1);

                const systemIndex = campaignData.systems.findIndex(s => s.id === systemIdToDelete);
                if (systemIndex > -1) {
                    campaignData.systems.splice(systemIndex, 1);
                    campaignData.systems.forEach(s => {
                        for (const dir in s.connections) {
                            if (s.connections[dir] === systemIdToDelete) s.connections[dir] = null;
                        }
                    });
                }
                saveData();
                renderPlayerList();
            }
        }
    });

    document.getElementById('units-tbody').addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        if (target.classList.contains('edit-unit-btn')) {
            editingUnitIndex = parseInt(target.dataset.index);
            const unit = campaignData.players[activePlayerIndex].units[editingUnitIndex];
            unitModalTitle.textContent = `Modifier ${unit.name}`;
            Object.keys(unit).forEach(key => {
                const elementId = `unit-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
                const element = document.getElementById(elementId);
                if (element) {
                    element.value = unit[key];
                }
            });
            document.getElementById('unit-id').value = editingUnitIndex;
            document.getElementById('unit-rank-display').textContent = getRankFromXp(unit.xp || 0);
            openModal(unitModal);
        } else if (target.classList.contains('delete-unit-btn')) {
            const index = parseInt(target.dataset.index);
            if (confirm(`Supprimer l'unité "${campaignData.players[activePlayerIndex].units[index].name}" ?`)) {
                campaignData.players[activePlayerIndex].units.splice(index, 1);
                saveData();
                renderOrderOfBattle();
            }
        }
    });

    planetarySystemDiv.addEventListener('click', (e) => {
        const planetElement = e.target.closest('.planet');
        if (planetElement) {
            const { systemId, planetIndex } = planetElement.dataset;
            const system = campaignData.systems.find(s => s.id === systemId);
            const planet = system.planets[planetIndex];

            document.getElementById('planet-system-id').value = systemId;
            document.getElementById('planet-index').value = planetIndex;
            document.getElementById('planet-name-input').value = planet.name;
            document.getElementById('planet-type-select').value = planet.type;

            const ownerSelect = document.getElementById('planet-owner-select');
            ownerSelect.innerHTML = '<option value="neutral">Neutre (PNJ)</option>';
            campaignData.players.forEach(player => {
                ownerSelect.innerHTML += `<option value="${player.id}">${player.name}</option>`;
            });
            ownerSelect.value = planet.owner;
            document.getElementById('planet-defense-input').value = planet.defense || 0;
            document.getElementById('planet-type-modal-title').textContent = `Modifier ${planet.name}`;
            ownerSelect.dispatchEvent(new Event('change'));
            openModal(planetTypeModal);
        }
    });

    worldModal.addEventListener('click', (e) => {
        if (e.target.id === 'show-map-btn') {
            openModal(mapModal);
            currentMapScale = 1;
            setTimeout(renderGalacticMap, 50);
        } else if (e.target.id === 'edit-crusade-order-btn') {
            const system = campaignData.systems.find(s => s.id === currentlyViewedSystemId);
            if (system && system.owner !== 'npc') {
                const playerIndex = campaignData.players.findIndex(p => p.id === system.owner);
                if (playerIndex > -1) {
                    activePlayerIndex = playerIndex;
                    closeModal(worldModal);
                    renderPlayerDetail();
                    switchView('detail');
                    backToSystemBtn.classList.remove('hidden');
                }
            } else {
                closeModal(worldModal);
                switchView('list');
            }
        }
    });

    mapContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const viewport = mapContainer.querySelector('.map-viewport');
        if (!viewport) return;
        const scaleChange = e.deltaY < 0 ? 0.1 : -0.1;
        currentMapScale = Math.max(0.2, Math.min(currentMapScale + scaleChange, 2.5));
        viewport.style.transform = `scale(${currentMapScale})`;
    });
    mapContainer.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isPanning = true; wasDragged = false; mapContainer.style.cursor = 'grabbing';
        startX = e.pageX - mapContainer.offsetLeft; scrollLeftStart = mapContainer.scrollLeft;
        startY = e.pageY - mapContainer.offsetTop; scrollTopStart = mapContainer.scrollTop;
    });
    mapContainer.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        e.preventDefault(); wasDragged = true;
        mapContainer.scrollLeft = scrollLeftStart - (e.pageX - mapContainer.offsetLeft - startX);
        mapContainer.scrollTop = scrollTopStart - (e.pageY - mapContainer.offsetTop - startY);
    });
    window.addEventListener('mouseup', () => { isPanning = false; mapContainer.style.cursor = 'grab'; });
    mapContainer.addEventListener('click', (e) => {
        if (wasDragged) return;
        const systemNode = e.target.closest('.system-node');
        if (systemNode && systemNode.dataset.systemId) {
            closeModal(mapModal);
            openModal(worldModal);
            setTimeout(() => renderPlanetarySystem(systemNode.dataset.systemId), 50);
        }
    });
    
    document.getElementById('map-player-view-select').addEventListener('change', (e) => {
        mapViewingPlayerId = e.target.value;
        renderGalacticMap();
    });

    systemContainer.addEventListener('click', (e) => {
        const arrow = e.target.closest('.explore-arrow');
        if (arrow) handleExploration(arrow.id.replace('explore-', ''));
    });


    document.getElementById('planet-owner-select').addEventListener('change', (e) => {
        document.getElementById('planet-defense-container').classList.toggle('hidden', e.target.value !== 'neutral');
    });

    backToListBtn.addEventListener('click', () => switchView('list'));

    backToSystemBtn.addEventListener('click', () => {
        if (currentlyViewedSystemId) {
            playerDetailView.classList.add('hidden');
            openModal(worldModal);
            setTimeout(() => renderPlanetarySystem(currentlyViewedSystemId), 50);
        }
    });

    playerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('player-name-input').value.trim();
        if (!name) return;

        if (editingPlayerIndex > -1) {
            const player = campaignData.players[editingPlayerIndex];
            player.name = name;
            player.faction = document.getElementById('player-faction-input').value.trim();
        } else {
            const newPlayerId = crypto.randomUUID();
            const newSystemId = crypto.randomUUID();
            const PLANET_TYPES = ["Monde Mort", "Monde Sauvage", "Agri-monde", "Monde Forge", "Monde Ruche", "Monde Ancien"];
            const newPlanets = Array.from({ length: 5 }, (_, i) => ({
                type: i === 0 ? "Monde Sauvage" : PLANET_TYPES[Math.floor(Math.random() * PLANET_TYPES.length)],
                name: ["Prima", "Secundus", "Tertius", "Quartus", "Quintus"][i],
                owner: i === 0 ? newPlayerId : "neutral",
                defense: i === 0 ? 0 : 500 + (Math.floor(Math.random() * 31)) * 50
            }));
            campaignData.systems.push({
                id: newSystemId, name: `${name}'s Home System`, owner: newPlayerId, planets: newPlanets,
                connections: { up: null, down: null, left: null, right: null }
            });
            campaignData.players.push({
                id: newPlayerId, systemId: newSystemId, name: name,
                faction: document.getElementById('player-faction-input').value.trim(), crusadeFaction: '',
                requisitionPoints: 5, supplyLimit: 50, battles: { wins: 0, draws: 0, losses: 0 },
                goalsNotes: '', units: []
            });
        }
        saveData();
        renderPlayerList();
        closeModal(playerModal);
    });

    unitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('unit-name').value.trim();
        if (!name) return;
        
        const unitData = {
            name: name,
            role: document.getElementById('unit-role').value,
            powerRating: parseInt(document.getElementById('unit-power').value) || 0,
            xp: parseInt(document.getElementById('unit-xp').value) || 0,
            crusadePoints: parseInt(document.getElementById('unit-crusade-points').value) || 0,
            equipment: document.getElementById('unit-equipment').value,
            warlordTrait: document.getElementById('unit-warlord-trait').value,
            relic: document.getElementById('unit-relic').value,
            battleHonours: document.getElementById('unit-honours').value,
            battleScars: document.getElementById('unit-scars').value,
            markedForGlory: parseInt(document.getElementById('unit-marked-for-glory').value) || 0
        };

        const player = campaignData.players[activePlayerIndex];
        if (editingUnitIndex > -1) {
            const existingUnit = player.units[editingUnitIndex];
            player.units[editingUnitIndex] = { ...existingUnit, ...unitData };
        } else {
            unitData.id = crypto.randomUUID();
            player.units.push(unitData);
        }
        saveData();
        renderOrderOfBattle();
        closeModal(unitModal);
    });

    planetTypeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const { value: systemId } = document.getElementById('planet-system-id');
        const { value: planetIndex } = document.getElementById('planet-index');
        const system = campaignData.systems.find(s => s.id === systemId);
        const planet = system.planets[planetIndex];

        planet.type = document.getElementById('planet-type-select').value;
        planet.name = document.getElementById('planet-name-input').value.trim() || planet.name;
        planet.owner = document.getElementById('planet-owner-select').value;
        planet.defense = (planet.owner === 'neutral') ? parseInt(document.getElementById('planet-defense-input').value) || 0 : 0;

        saveData();
        renderPlanetarySystem(systemId);
        closeModal(planetTypeModal);
    });

    document.getElementById('randomize-planet-btn').addEventListener('click', () => {
        const system = campaignData.systems.find(s => s.id === currentlyViewedSystemId);
        if (!system || system.owner === 'npc') {
            alert("Cette action ne peut être effectuée que dans un système de joueur."); return;
        }
        const player = campaignData.players.find(p => p.id === system.owner);
        if (!player) { alert("Erreur : Joueur propriétaire introuvable."); return; }
        if (player.requisitionPoints < 1) { alert("Pas assez de Points de Réquisition (1 RP requis)."); return; }

        if (confirm(`Cette action coûtera 1 Point de Réquisition. Continuer ?\nRP restants : ${player.requisitionPoints - 1}`)) {
            player.requisitionPoints--;
            const planet = system.planets[document.getElementById('planet-index').value];
            const PLANET_TYPES = ["Monde Mort", "Monde Sauvage", "Agri-monde", "Monde Forge", "Monde Ruche", "Monde Ancien"];
            planet.type = PLANET_TYPES[Math.floor(Math.random() * PLANET_TYPES.length)];
            saveData();
            renderPlanetarySystem(system.id);
            const playerIndex = campaignData.players.findIndex(p => p.id === player.id);
            if (activePlayerIndex === playerIndex && !playerDetailView.classList.contains('hidden')) renderPlayerDetail();
            closeModal(planetTypeModal);
            alert(`Planète randomisée ! Type actuel : ${planet.type}.`);
        }
    });

    document.getElementById('unit-xp').addEventListener('input', (e) => {
        document.getElementById('unit-rank-display').textContent = getRankFromXp(parseInt(e.target.value) || 0);
    });

    document.querySelector('.player-info-grid').addEventListener('input', (e) => {
        if (activePlayerIndex === -1) return;
        const player = campaignData.players[activePlayerIndex];
        if (e.target.id === 'supply-limit') player.supplyLimit = parseInt(e.target.value) || 0;
        else if (e.target.id === 'crusade-faction') player.crusadeFaction = e.target.value;
        saveData();
    });

    document.getElementById('goals-notes').addEventListener('change', (e) => {
        if (activePlayerIndex > -1) {
            campaignData.players[activePlayerIndex].goalsNotes = e.target.value;
            saveData();
        }
    });

    document.querySelector('.player-info-grid').addEventListener('click', (e) => {
        const button = e.target.closest('.tally-btn');
        if (!button || activePlayerIndex === -1) return;
        const player = campaignData.players[activePlayerIndex];
        const action = button.dataset.action;
        const [operation, stat] = action.split('-');
        const change = operation === 'increase' ? 1 : -1;

        if (stat === 'rp') {
            player.requisitionPoints = Math.max(0, player.requisitionPoints + change);
        } else {
            const battleStat = stat === 'win' ? 'wins' : (stat === 'draw' ? 'draws' : 'losses');
            if (!player.battles) player.battles = { wins: 0, draws: 0, losses: 0 };
            player.battles[battleStat] = Math.max(0, (player.battles[battleStat] || 0) + change);
        }
        saveData();
        renderPlayerDetail();
    });

    //======================================================================
    //  INITIALISATION
    //======================================================================
    loadData();
    renderPlayerList();
});