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

    const campaignInfoBtn = document.getElementById('campaign-info-btn');
    const infoModal = document.getElementById('info-modal');

    // NOUVEAUX ÉLÉMENTS POUR NOTIFICATIONS / CONFIRMATIONS
    const notificationContainer = document.getElementById('notification-container');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmModalTitle = document.getElementById('confirm-modal-title');
    const confirmModalText = document.getElementById('confirm-modal-text');
    const confirmModalOkBtn = document.getElementById('confirm-modal-ok-btn');
    const confirmModalCancelBtn = document.getElementById('confirm-modal-cancel-btn');


    //======================================================================
    //  SYSTÈME DE NOTIFICATION ET DE CONFIRMATION
    //======================================================================

    /**
     * Affiche une notification stylisée à l'écran.
     * @param {string} message Le message à afficher.
     * @param {string} [type='info'] Le type de notif (info, success, warning, error).
     * @param {number} [duration=5000] La durée en ms.
     */
    function showNotification(message, type = 'info', duration = 5000) {
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
     * Affiche une modale de confirmation et retourne une promesse.
     * @param {string} title Le titre de la modale.
     * @param {string} text Le message de confirmation.
     * @returns {Promise<boolean>} Résout à `true` si confirmé, `false` sinon.
     */
    function showConfirm(title, text) {
        return new Promise(resolve => {
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

    //======================================================================
    //  ÉTAT DE L'APPLICATION (STATE)
    //======================================================================
    let campaignData = {
        players: [],
        systems: [],
        isGalaxyGenerated: false
    };

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
    const GALAXY_SIZE = 8;

    //======================================================================
    //  GESTION DES DONNÉES (LOCALSTORAGE & JSON)
    //======================================================================
    const saveData = () => {
        localStorage.setItem('nexusCrusadeData', JSON.stringify(campaignData));
    };

    const loadData = () => {
        const data = localStorage.getItem('nexusCrusadeData');
        if (data) {
            campaignData = JSON.parse(data);
        }

        let dataWasModified = false;
        if (!campaignData.players) campaignData.players = [];
        if (!campaignData.systems) campaignData.systems = [];

        if (campaignData.isGalaxyGenerated === undefined) {
            campaignData.isGalaxyGenerated = false;
            dataWasModified = true;
        }

        campaignData.players.forEach(player => {
            if (player.sombrerochePoints === undefined) {
                player.sombrerochePoints = 0;
                dataWasModified = true;
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
        showNotification("Exportation de la campagne initiée.", 'success');
    });

    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (importedData && Array.isArray(importedData.players)) {
                    if (await showConfirm("Confirmation d'importation", "Importer ce fichier écrasera les données actuelles de la campagne. Êtes-vous sûr de vouloir continuer ?")) {
                        campaignData = importedData;
                        loadData();
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
        event.target.value = null;
    });

    //======================================================================
    //  NOUVELLE LOGIQUE : GÉNÉRATION DE LA GALAXIE (CORRIGÉ)
    //======================================================================
    /**
     * Sélectionne un type de planète aléatoire en fonction de poids définis.
     * @returns {string} Le nom du type de planète.
     */
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
        const systemNamesList = SYSTEM_NAMES;
        const availableNames = systemNamesList.filter(name => !usedNames.has(name));
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
                type: getWeightedRandomPlanetType(), // Utilise la nouvelle fonction pondérée
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

    const getReachableSystems = (startSystemId) => {
        const reachable = new Set();
        const playerSystem = campaignData.systems.find(s => s.id === startSystemId);
        if (!playerSystem || !playerSystem.position) {
            if (startSystemId) reachable.add(startSystemId);
            return reachable;
        }
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

    const isPlayerDiscoverable = (playerId) => {
        const player = campaignData.players.find(p => p.id === playerId);
        if (!player) return false;
        const homeSystem = campaignData.systems.find(s => s.id === player.systemId);
        return homeSystem && !!homeSystem.position;
    };


    //======================================================================
    //  LOGIQUE DE RENDU (AFFICHAGE)
    //======================================================================
    // ... (toutes les fonctions de rendu restent identiques)
    const switchView = (view) => {
        if (view === 'detail') {
            playerListView.classList.add('hidden');
            playerDetailView.classList.remove('hidden');
        } else {
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
            if (!campaignData.isGalaxyGenerated) {
                playerListDiv.innerHTML += `<p>La galaxie n'a pas encore été générée. L'administrateur peut le faire via le bouton "Explosion du Warp".</p>`;
            }
            return;
        }

        campaignData.players.forEach((player, index) => {
            const card = document.createElement('div');
            card.className = 'player-card';
            const playerSystem = campaignData.systems.find(s => s.id === player.systemId);
            const onMapStatus = (playerSystem && playerSystem.position) ?
                '<span style="color: var(--friendly-color);">Connecté</span>' :
                '<span style="color: var(--warning-color);">Non connecté</span>';

            card.innerHTML = `
                <h3 class="player-name-link" data-index="${index}">${player.name}</h3>
                <p>${player.faction || 'Faction non spécifiée'}<br>Statut: ${onMapStatus}</p>
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
        document.getElementById('sombreroche-points').textContent = player.sombrerochePoints || 0;
        document.getElementById('supply-limit').value = player.supplyLimit;

        const battleTally = (player.battles.wins || 0) + (player.battles.losses || 0);
        document.getElementById('battle-tally').textContent = battleTally;
        document.getElementById('wins').textContent = player.battles.wins || 0;
        document.getElementById('losses').textContent = player.battles.losses || 0;

        document.getElementById('goals-notes').value = player.goalsNotes || '';

        renderOrderOfBattle();
    };

    const getRankFromXp = (xp, role) => {
        const isCharacter = role === 'Personnage' || role === 'Hero Epique';
        if (xp >= 51) return isCharacter ? 'Légendaire (Personnage)' : 'Légendaire';
        if (xp >= 31) return isCharacter ? 'Héroïque (Personnage)' : 'Héroïque';
        if (xp >= 16) return 'Aguerri';
        if (xp >= 6) return 'Eprouvé';
        return 'Paré au Combat';
    };

    const renderOrderOfBattle = () => {
        const player = campaignData.players[activePlayerIndex];
        const tbody = document.getElementById('units-tbody');
        tbody.innerHTML = '';
        let supplyUsed = 0;

        (player.units || []).forEach((unit, index) => {
            supplyUsed += unit.powerRating;
            const rank = getRankFromXp(unit.xp, unit.role);
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
        const orbitRadiiFactors = [0.18, 0.26, 0.34, 0.42, 0.50, 0.58, 0.66, 0.74];

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

        const colonizationSpan = document.getElementById('colonization-percentage');
        const viewingPlayer = campaignData.players.find(p => p.id === mapViewingPlayerId);
        if (viewingPlayer && system.planets.length > 0) {
            const playerPlanetCount = system.planets.filter(p => p.owner === viewingPlayer.id).length;
            const percentage = (playerPlanetCount / system.planets.length) * 100;
            colonizationSpan.textContent = `(Contrôle: ${percentage.toFixed(0)}%)`;
        } else {
            colonizationSpan.textContent = '';
        }


        updateExplorationArrows(system);
    };

    const renderGalacticMap = () => {
        mapContainer.innerHTML = '';
        const playerViewSelect = document.getElementById('map-player-view-select');
        const viewingPlayer = campaignData.players.find(p => p.id === mapViewingPlayerId);

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

        const playerSystemId = viewingPlayer ? viewingPlayer.systemId : null;
        const visibleSystemIds = getReachableSystems(playerSystemId);
        const systemsToDisplay = campaignData.systems.filter(s => visibleSystemIds.has(s.id) && s.position);

        if (systemsToDisplay.length === 0) {
            mapContainer.innerHTML = '<p style="text-align: center; padding-top: 50px;">Aucun système découvert. Conquérez votre système natal pour rejoindre la carte.</p>';
            return;
        }

        const viewport = document.createElement('div');
        viewport.className = 'map-viewport';
        const allX = systemsToDisplay.map(s => s.position.x);
        const allY = systemsToDisplay.map(s => s.position.y);
        viewport.style.width = `${Math.max(...allX) + STEP_DISTANCE}px`;
        viewport.style.height = `${Math.max(...allY) + STEP_DISTANCE}px`;
        viewport.style.transform = `scale(${currentMapScale})`;

        mapContainer.appendChild(viewport);

        const drawnConnections = new Set();
        systemsToDisplay.forEach(system => {
            const pos1 = system.position;
            if (!pos1) return;

            Object.values(system.connections).forEach(connectedId => {
                if (connectedId && visibleSystemIds.has(connectedId)) {
                    const key = [system.id, connectedId].sort().join('-');
                    if (drawnConnections.has(key)) return;

                    const connectedSystem = campaignData.systems.find(s => s.id === connectedId);
                    const pos2 = connectedSystem?.position;
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

        systemsToDisplay.forEach(system => {
            const pos = system.position;
            if (!pos) {
                console.error("Cannot render system without position:", system.name);
                return;
            }

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
        });


        const centerSystem = systemsToDisplay.find(s => s.id === currentlyViewedSystemId);
        if (centerSystem && centerSystem.position) {
            mapContainer.scrollLeft = centerSystem.position.x * currentMapScale - mapContainer.clientWidth / 2;
            mapContainer.scrollTop = centerSystem.position.y * currentMapScale - mapContainer.clientHeight / 2;
        }
    };
    
    // ... (le reste des fonctions de rendu est identique)
    const updateExplorationArrows = (currentSystem) => {
        const directions = ['up', 'down', 'left', 'right'];
        const arrowSymbols = {
            up: '↑',
            down: '↓',
            left: '←',
            right: '→'
        };
        const style = getComputedStyle(document.documentElement);
        const colors = {
            red: style.getPropertyValue('--danger-color').trim(),
            green: style.getPropertyValue('--friendly-color').trim(),
            yellow: style.getPropertyValue('--warning-color').trim(),
            blue: style.getPropertyValue('--probed-color').trim(),
            default: style.getPropertyValue('--text-muted-color').trim()
        };

        const viewingPlayerId = mapViewingPlayerId;
        const isOffMap = !currentSystem.position;

        directions.forEach(dir => {
            const arrow = document.getElementById(`explore-${dir}`);
            arrow.classList.toggle('hidden', isOffMap);
            if (isOffMap) return;

            const connectedSystemId = currentSystem.connections[dir];
            const probedInfo = currentSystem.probedConnections ? currentSystem.probedConnections[dir] : null;

            let label = `<span class="arrow-symbol">${arrowSymbols[dir]}</span><small>Explorer</small>`;
            arrow.style.borderColor = colors.default;
            arrow.style.color = colors.default;
            arrow.style.cursor = 'pointer'; // Reset cursor
            arrow.title = `Explorer vers ${dir}`;

            if (connectedSystemId) {
                const connectedSystem = campaignData.systems.find(s => s.id === connectedSystemId);
                if (connectedSystem) {
                    const { status, text } = getSystemStatusForPlayer(connectedSystem, viewingPlayerId);
                    let borderColor = colors.default;
                    switch (status) {
                        case 'friendly': borderColor = colors.green; break;
                        case 'hostile': borderColor = colors.red; break;
                        case 'neutral': borderColor = colors.yellow; break;
                    }

                    arrow.style.borderColor = borderColor;
                    arrow.style.color = borderColor;
                    label = `<span class="arrow-symbol">${arrowSymbols[dir]}</span><small>${connectedSystem.name}<br>${text}</small>`;
                    arrow.title = `Voyager vers ${connectedSystem.name} (${text})`;
                } else {
                    // MODIFICATION START: Replaced destructive logic with non-destructive feedback.
                    // This prevents the application from deleting a valid return path.
                    label = `<span class="arrow-symbol">${arrowSymbols[dir]}</span><small>LIEN BRISÉ</small>`;
                    arrow.style.borderColor = colors.red;
                    arrow.style.color = colors.red;
                    arrow.style.cursor = 'not-allowed';
                    arrow.title = `Erreur: La connexion vers le système ${connectedSystemId} est rompue.`;
                    console.error(`Broken connection detected: System ${currentSystem.name} (${currentSystem.id}) has a connection to a non-existent system ID: ${connectedSystemId}. The connection was NOT deleted.`);
                    // The original code deleted the connection here, which caused the bug.
                    // currentSystem.connections[dir] = null;
                    // saveData();
                    // MODIFICATION END
                }
            } else if (probedInfo) {
                arrow.style.borderColor = colors.blue;
                arrow.style.color = colors.blue;
                if (probedInfo.status === 'player_contact') {
                    label = `<span class="arrow-symbol">${arrowSymbols[dir]}</span><small>Joueur Hostile détecté</small>`;
                    arrow.title = `Route sondée vers une présence de croisade. Le contact doit être mutuel pour établir un lien.`;
                } else {
                    label = `<span class="arrow-symbol">${arrowSymbols[dir]}</span><small>SONDÉ<br>${probedInfo.name}</small>`;
                    arrow.title = `Route sondée vers ${probedInfo.name}. Cliquez pour établir la connexion.`;
                }
            } else {
                const parentPos = currentSystem.position || { x: 0, y: 0 };
                const targetPos = { x: parentPos.x, y: parentPos.y };
                if (dir === 'up') targetPos.y -= STEP_DISTANCE;
                else if (dir === 'down') targetPos.y += STEP_DISTANCE;
                else if (dir === 'left') targetPos.x -= STEP_DISTANCE;
                else if (dir === 'right') targetPos.x += STEP_DISTANCE;

                const targetSystem = campaignData.systems.find(s => s.position && s.position.x === targetPos.x && s.position.y === targetPos.y);
                if (!targetSystem) {
                    arrow.style.borderColor = '#333';
                    arrow.style.color = '#555';
                    arrow.style.cursor = 'not-allowed';
                    arrow.title = 'Bord de la galaxie connue';
                }
            }
            arrow.innerHTML = label;
        });
    };

    //======================================================================
    //  LOGIQUE D'EXPLORATION (MODIFIÉE AVEC NOTIFICATIONS)
    //======================================================================
    const handleExploration = async (direction) => {
        const currentSystem = campaignData.systems.find(s => s.id === currentlyViewedSystemId);
        if (!currentSystem) return;
        
        const oppositeDirection = { up: 'down', down: 'up', left: 'right', right: 'left' }[direction];

        if (currentSystem.connections[direction]) {
            renderPlanetarySystem(currentSystem.connections[direction]);
            return;
        }
        
        const viewingPlayer = campaignData.players.find(p => p.id === mapViewingPlayerId);
        if (!viewingPlayer) {
            showNotification("Erreur : Impossible de trouver le joueur actif pour l'exploration.", 'error');
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

        const hasEnemyInTarget = discoveredSystem.planets.some(p => p.owner !== 'neutral' && p.owner !== viewingPlayer.id);
        if (hasEnemyInTarget) {
            const confirmHostile = await showConfirm("Découverte hostile !", "Le système adjacent est contrôlé par un autre joueur. Voulez-vous établir une connexion et y voyager ?<br><br><b>Attention :</b> une fois sur place, un blocus vous empêchera de continuer l'exploration depuis ce système.");
            if (confirmHostile) {
                currentSystem.connections[direction] = discoveredSystem.id;
                discoveredSystem.connections[oppositeDirection] = currentSystem.id;
                if (currentSystem.probedConnections) currentSystem.probedConnections[direction] = null;
                if (discoveredSystem.probedConnections) discoveredSystem.probedConnections[oppositeDirection] = null;
                saveData();
                renderPlanetarySystem(discoveredSystem.id);
            }
            return;
        }

        const probedInfo = currentSystem.probedConnections ? currentSystem.probedConnections[direction] : null;
        if (probedInfo) {
            const probedSystem = campaignData.systems.find(s => s.id === probedInfo.id);
            if (!probedSystem) {
                showNotification("Erreur: Le système sondé n'a pas été retrouvé.", 'error');
                currentSystem.probedConnections[direction] = null;
                saveData();
                renderPlanetarySystem(currentSystem.id);
                return;
            }

            if (probedInfo.status === 'player_contact') {
                const mutualProbe = probedSystem.probedConnections[oppositeDirection]?.id === currentSystem.id;
                if (mutualProbe) {
                    if (await showConfirm("Contact Mutuel Établi !", "Voulez-vous établir une connexion permanente ? (Irréversible)")) {
                        currentSystem.connections[direction] = probedSystem.id;
                        probedSystem.connections[oppositeDirection] = currentSystem.id;
                        currentSystem.probedConnections[direction] = null;
                        if (probedSystem.probedConnections) probedSystem.probedConnections[oppositeDirection] = null;
                        saveData();
                        renderPlanetarySystem(probedSystem.id);
                    }
                } else {
                    showNotification("Route sondée. Le contact doit être initié depuis le système voisin pour établir un lien.", 'info');
                }
            } else { 
                if (await showConfirm("Connexion PNJ", `Vous avez déjà sondé le système PNJ "<b>${probedInfo.name}</b>".<br>Voulez-vous établir une connexion permanente ?`)) {
                    currentSystem.connections[direction] = probedSystem.id;
                    probedSystem.connections[oppositeDirection] = currentSystem.id;
                    currentSystem.probedConnections[direction] = null;
                    saveData();
                    renderPlanetarySystem(probedSystem.id);
                }
            }
            return;
        }

        const useProbe = await showConfirm("Méthode d'Exploration", "Envoyer une sonde (coût: 1 RP) ?<br><small>(Annuler pour un saut à l'aveugle standard, gratuit mais plus risqué)</small>");
        if (useProbe) {
            if (viewingPlayer.requisitionPoints < 1) {
                showNotification("Points de Réquisition insuffisants !", 'warning');
                return;
            }
        }

        if (useProbe) {
            viewingPlayer.requisitionPoints--;
            if (activePlayerIndex === campaignData.players.findIndex(p => p.id === viewingPlayer.id) && !playerDetailView.classList.contains('hidden')) renderPlayerDetail();
        }

        const isPlayerSystem = discoveredSystem.owner !== 'npc';
        const isDiscoverable = isPlayerSystem ? isPlayerDiscoverable(discoveredSystem.owner) : true;
        
        if (isPlayerSystem && !isDiscoverable) {
            showNotification("Des lectures d'énergie étranges émanent de cette région, mais les augures sont incapables d'obtenir une position stable.", 'warning', 7000);
            if (useProbe) viewingPlayer.requisitionPoints++;
            return;
        }

        let discoveryMessage = isPlayerSystem ? `✨ <b>Contact majeur détecté !</b> Présence d'une autre force de croisade ! ✨` : `Nouveau contact ! Vous avez découvert le système PNJ "<b>${discoveredSystem.name}</b>".`;

        if (useProbe) {
            showNotification(`<b>Résultat de la sonde :</b><br>${discoveryMessage}`, 'info', 8000);
            if (isPlayerSystem) {
                currentSystem.probedConnections[direction] = { id: discoveredSystem.id, status: 'player_contact' };
                showNotification("Information de sonde enregistrée. Le système voisin devra sonder en retour pour établir un contact.", 'info', 8000);
            } else {
                currentSystem.probedConnections[direction] = { id: discoveredSystem.id, name: discoveredSystem.name };
                showNotification("Information de sonde enregistrée. Cliquez à nouveau sur la flèche pour confirmer la connexion.", 'info', 8000);
            }
        } else {
            // ***MODIFICATION START***
            // The previous logic incorrectly blocked a blind jump to a non-hostile player system.
            // The `hasEnemyInTarget` check at the start of the function already covers hostile jumps.
            // Therefore, if we reach this `else` block, the blind jump is permitted.
            showNotification(discoveryMessage, 'success', 8000);
            currentSystem.connections[direction] = discoveredSystem.id;
            discoveredSystem.connections[oppositeDirection] = currentSystem.id;
            renderPlanetarySystem(discoveredSystem.id);
            // ***MODIFICATION END***
        }

        saveData();
        renderPlanetarySystem(currentSystem.id);
    };


    //======================================================================
    // PLACEMENT DU SYSTÈME DU JOUEUR SUR LA CARTE (AVEC NOTIFICATIONS)
    //======================================================================
    const findUndiscoveredNpcSystem = () => {
        const allReachableIdsByPlayers = new Set();
        campaignData.players.forEach(player => {
            const playerSystem = campaignData.systems.find(s => s.id === player.systemId);
            if (playerSystem && playerSystem.position) {
                const reachable = getReachableSystems(player.systemId);
                reachable.forEach(id => allReachableIdsByPlayers.add(id));
            }
        });
        const candidates = campaignData.systems.filter(system =>
            system.owner === 'npc' && !allReachableIdsByPlayers.has(system.id)
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
                }
            }
        }
        
        playerSystem.position = oldPosition;
        playerSystem.connections = oldConnections;
        playerSystem.name = `${player.name}'s Bastion`;

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
    //  GESTION DES MODALES ET ÉVÉNEMENTS (AVEC NOTIFICATIONS)
    //======================================================================
    const openModal = (modal) => modal.classList.remove('hidden');
    const closeModal = (modal) => modal.classList.add('hidden');

    document.querySelectorAll('.modal .close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => closeModal(e.target.closest('.modal')));
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) closeModal(e.target);
    });

    campaignInfoBtn.addEventListener('click', () => openModal(infoModal));

    addPlayerBtn.addEventListener('click', () => {
        if (!campaignData.isGalaxyGenerated) {
            showNotification("Veuillez d'abord générer une galaxie avec le bouton 'Explosion du Warp'.", 'warning');
            return;
        }
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
        const role = document.getElementById('unit-role').value;
        document.getElementById('unit-rank-display').textContent = getRankFromXp(0, role);
        openModal(unitModal);
    });

    resetCampaignBtn.addEventListener('click', async () => {
        const confirmReset = await showConfirm(
            "Réinitialiser la Campagne ?",
            "Êtes-vous sûr ? Cette action va générer une <b>nouvelle carte galactique</b> et réinitialiser la position de TOUS les joueurs. Leurs fiches de personnage (unités, points, etc.) seront conservées."
        );
        if (confirmReset) {
            generateGalaxy();
            const playerSystems = [];
            campaignData.players.forEach((player) => {
                const newSystemId = crypto.randomUUID();
                const DEFENSE_VALUES = [500, 1000, 1500, 2000];
                const planetNames = ["Prima", "Secundus", "Tertius", "Quartus", "Quintus", "Sextus", "Septimus", "Octavus"];
                const numPlanets = 5; // MODIFICATION: Nombre de planètes fixé à 5
                const newPlanets = Array.from({ length: numPlanets }, (_, i) => ({
                    type: i === 0 ? "Monde Sauvage" : getWeightedRandomPlanetType(), // Le premier est fixe, les autres pondérés
                    name: planetNames[i] || `Planète ${i + 1}`,
                    owner: i === 0 ? player.id : "neutral",
                    defense: i === 0 ? 0 : DEFENSE_VALUES[Math.floor(Math.random() * DEFENSE_VALUES.length)]
                }));
                const newSystem = {
                    id: newSystemId, name: `Système Natal de ${player.name}`, owner: player.id, planets: newPlanets,
                    connections: { up: null, down: null, left: null, right: null },
                    probedConnections: { up: null, down: null, left: null, right: null },
                    position: null
                };
                playerSystems.push(newSystem);
                player.systemId = newSystemId;
            });
            campaignData.systems.push(...playerSystems);
            saveData();
            switchView('list');
            renderPlayerList();
            showNotification("Le Warp a tout consumé ! Une nouvelle galaxie a été générée.", 'success', 8000);
        }
    });

    playerListDiv.addEventListener('click', async (e) => {
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
            } else {
                showNotification("Erreur : ce joueur n'a pas de système assigné.", 'error');
            }
        } else if (target.matches('.delete-player-btn')) {
            const index = parseInt(target.dataset.index);
            const playerToDelete = campaignData.players[index];
            if (await showConfirm("Supprimer le Joueur", `Êtes-vous sûr de vouloir supprimer "<b>${playerToDelete.name}</b>" ? Cette action est irréversible.`)) {
                const systemIndex = campaignData.systems.findIndex(s => s.id === playerToDelete.systemId);
                if (systemIndex > -1) campaignData.systems.splice(systemIndex, 1);
                campaignData.players.splice(index, 1);
                saveData();
                renderPlayerList();
                showNotification(`Le joueur <b>${playerToDelete.name}</b> a été supprimé.`, 'info');
            }
        }
    });

    document.getElementById('units-tbody').addEventListener('click', async (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        if (target.classList.contains('edit-unit-btn')) {
            editingUnitIndex = parseInt(target.dataset.index);
            const unit = campaignData.players[activePlayerIndex].units[editingUnitIndex];
            unitModalTitle.textContent = `Modifier ${unit.name}`;
            Object.keys(unit).forEach(key => {
                const elementId = `unit-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
                const element = document.getElementById(elementId);
                if (element) element.value = unit[key];
            });
            document.getElementById('unit-id').value = editingUnitIndex;
            document.getElementById('unit-rank-display').textContent = getRankFromXp(unit.xp || 0, unit.role);
            openModal(unitModal);
        } else if (target.classList.contains('delete-unit-btn')) {
            const index = parseInt(target.dataset.index);
            const unitName = campaignData.players[activePlayerIndex].units[index].name;
            if (await showConfirm("Supprimer l'unité", `Supprimer l'unité "<b>${unitName}</b>" de l'ordre de bataille ?`)) {
                campaignData.players[activePlayerIndex].units.splice(index, 1);
                saveData();
                renderOrderOfBattle();
                showNotification(`Unité <b>${unitName}</b> supprimée.`, 'info');
            }
        }
    });

    // ... (le reste des gestionnaires d'événements qui n'utilisent pas alert/confirm reste identique)
    
    // ... (ici, les gestionnaires d'événements pour les modales, etc.)
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

            const halveDefenseBtn = document.getElementById('halve-defense-btn');
            halveDefenseBtn.classList.toggle('hidden', planet.owner !== 'neutral' || planet.defense === 0);

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
        isPanning = true;
        wasDragged = false;
        mapContainer.style.cursor = 'grabbing';
        startX = e.pageX - mapContainer.offsetLeft;
        scrollLeftStart = mapContainer.scrollLeft;
        startY = e.pageY - mapContainer.offsetTop;
        scrollTopStart = mapContainer.scrollTop;
    });
    mapContainer.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        e.preventDefault();
        wasDragged = true;
        mapContainer.scrollLeft = scrollLeftStart - (e.pageX - mapContainer.offsetLeft - startX);
        mapContainer.scrollTop = scrollTopStart - (e.pageY - mapContainer.offsetTop - startY);
    });
    window.addEventListener('mouseup', () => {
        isPanning = false;
        mapContainer.style.cursor = 'grab';
    });
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
        if (currentlyViewedSystemId && !worldModal.classList.contains('hidden')) {
            renderPlanetarySystem(currentlyViewedSystemId);
        }
    });

    systemContainer.addEventListener('click', (e) => {
        const arrow = e.target.closest('.explore-arrow');
        if (arrow && arrow.style.cursor !== 'not-allowed') handleExploration(arrow.id.replace('explore-', ''));
    });


document.getElementById('planet-owner-select').addEventListener('change', (e) => {
    const isNeutral = e.target.value === 'neutral';
    document.getElementById('planet-defense-container').classList.toggle('hidden', !isNeutral);
    document.getElementById('planet-defense-input').disabled = !isNeutral;
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
            const DEFENSE_VALUES = [500, 1000, 1500, 2000];
            const planetNames = ["Prima", "Secundus", "Tertius", "Quartus", "Quintus", "Sextus", "Septimus", "Octavus"];
            const numPlanets = 5; // MODIFICATION: Nombre de planètes fixé à 5
            const newPlanets = Array.from({ length: numPlanets }, (_, i) => ({
                type: i === 0 ? "Monde Sauvage" : getWeightedRandomPlanetType(), // Le premier est fixe, les autres pondérés
                name: planetNames[i] || `Planète ${i + 1}`,
                owner: i === 0 ? newPlayerId : "neutral",
                defense: i === 0 ? 0 : DEFENSE_VALUES[Math.floor(Math.random() * DEFENSE_VALUES.length)]
            }));

            const newSystem = {
                id: newSystemId, name: `Système Natal de ${name}`, owner: newPlayerId, planets: newPlanets,
                connections: { up: null, down: null, left: null, right: null },
                probedConnections: { up: null, down: null, left: null, right: null },
                position: null
            };
            campaignData.systems.push(newSystem);

            campaignData.players.push({
                id: newPlayerId, systemId: newSystemId, name: name,
                faction: document.getElementById('player-faction-input').value.trim(),
                crusadeFaction: '', requisitionPoints: 5, sombrerochePoints: 0,
                supplyLimit: 50, battles: { wins: 0, losses: 0 },
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
            name: name, role: document.getElementById('unit-role').value,
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

        const newOwner = document.getElementById('planet-owner-select').value;
        planet.type = document.getElementById('planet-type-select').value;
        planet.name = document.getElementById('planet-name-input').value.trim() || planet.name;
        planet.owner = newOwner;
        planet.defense = (planet.owner === 'neutral') ? parseInt(document.getElementById('planet-defense-input').value) || 0 : 0;

        saveData();
        renderPlanetarySystem(systemId);
        closeModal(planetTypeModal);

        if (newOwner !== 'neutral') {
            placePlayerSystemOnMap(newOwner);
        }
    });

    document.getElementById('randomize-planet-btn').addEventListener('click', async () => {
        const viewingPlayer = campaignData.players.find(p => p.id === mapViewingPlayerId);
        if (!viewingPlayer) { showNotification("Erreur : Joueur actif introuvable.", 'error'); return; }
        if (viewingPlayer.requisitionPoints < 2) { showNotification("Pas assez de Points de Réquisition (2 RP requis).", 'warning'); return; }

        const systemId = document.getElementById('planet-system-id').value;
        const planetIndex = document.getElementById('planet-index').value;
        const system = campaignData.systems.find(s => s.id === systemId);
        const planet = system.planets[planetIndex];

        if (await showConfirm("Randomiser la planète", "Cette action coûtera <b>2 Points de Réquisition</b>. Continuer ?")) {
            viewingPlayer.requisitionPoints -= 2;
            planet.type = getWeightedRandomPlanetType();
            saveData();
            renderPlanetarySystem(system.id);
            if (activePlayerIndex === campaignData.players.findIndex(p => p.id === viewingPlayer.id) && !playerDetailView.classList.contains('hidden')) renderPlayerDetail();
            closeModal(planetTypeModal);
            showNotification(`Planète randomisée ! Nouveau type : <b>${planet.type}</b>.`, 'success');
        }
    });

    document.getElementById('halve-defense-btn').addEventListener('click', async () => {
        const viewingPlayer = campaignData.players.find(p => p.id === mapViewingPlayerId);
        if (!viewingPlayer) { showNotification("Erreur : Joueur actif introuvable.", 'error'); return; }
        if (viewingPlayer.requisitionPoints < 1) { showNotification("Pas assez de Points de Réquisition (1 RP requis).", 'warning'); return; }

        const systemId = document.getElementById('planet-system-id').value;
        const planetIndex = document.getElementById('planet-index').value;
        const system = campaignData.systems.find(s => s.id === systemId);
        const planet = system.planets[planetIndex];
        const oldDefense = planet.defense;
        const newDefense = Math.floor(oldDefense / 2);

        if (await showConfirm("Saboter les défenses", `Cette action coûtera <b>1 Point de Réquisition</b>. La défense passera de <b>${oldDefense}</b> à <b>${newDefense}</b>. Continuer ?`)) {
            viewingPlayer.requisitionPoints--;
            planet.defense = newDefense;
            saveData();
            renderPlanetarySystem(system.id);
            if (activePlayerIndex === campaignData.players.findIndex(p => p.id === viewingPlayer.id) && !playerDetailView.classList.contains('hidden')) renderPlayerDetail();
            closeModal(planetTypeModal);
            showNotification(`Sabotage réussi ! Défenses réduites à <b>${newDefense}</b>.`, 'success');
        }
    });

    document.getElementById('unit-xp').addEventListener('input', (e) => {
        const role = document.getElementById('unit-role').value;
        document.getElementById('unit-rank-display').textContent = getRankFromXp(parseInt(e.target.value) || 0, role);
    });
    
    document.getElementById('unit-role').addEventListener('change', (e) => {
        const xp = parseInt(document.getElementById('unit-xp').value) || 0;
        document.getElementById('unit-rank-display').textContent = getRankFromXp(xp, e.target.value);
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
        } else if (stat === 'sombreroche') {
            player.sombrerochePoints = Math.max(0, (player.sombrerochePoints || 0) + change);
        } else {
            const battleStat = stat === 'win' ? 'wins' : 'losses';

            if (change < 0 && (player.battles[battleStat] || 0) === 0) return;

            if (!player.battles) player.battles = { wins: 0, losses: 0 };
            player.battles[battleStat] = Math.max(0, (player.battles[battleStat] || 0) + change);

            if (change > 0) {
                player.requisitionPoints++;
            } else {
                player.requisitionPoints = Math.max(0, player.requisitionPoints - 1);
            }
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