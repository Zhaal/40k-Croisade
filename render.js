// render.js

//======================================================================
//  LOGIQUE DE RENDU (AFFICHAGE)
//======================================================================

const switchView = (view) => {
    const playerListView = document.getElementById('player-list-view');
    const playerDetailView = document.getElementById('player-detail-view');
    const backToSystemBtn = document.getElementById('back-to-system-btn');

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
    const playerListDiv = document.getElementById('player-list');
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
    
    // Affichage conditionnel de la boîte de Biomasse (Tyranids)
    const biomassBox = document.getElementById('biomass-box');
    if (player.faction === 'Tyranids') {
        biomassBox.classList.remove('hidden');
        document.getElementById('biomass-points').textContent = player.biomassPoints || 0;
    } else {
        biomassBox.classList.add('hidden');
    }

    // Affichage conditionnel de la boîte Death Guard
    const deathguardBox = document.getElementById('deathguard-box');
    if (player.faction === 'Death Guard') {
        deathguardBox.classList.remove('hidden');
        renderDeathGuardBox(player);
    } else {
        deathguardBox.classList.add('hidden');
    }

    // Affichage conditionnel de la boîte de Sainteté (Adepta Sororitas)
    const sainthoodBox = document.getElementById('sororitas-sainthood-box');
    if (player.faction === 'Adepta Sororitas') {
        sainthoodBox.classList.remove('hidden');
        renderSainthoodBox(player);
    } else {
        sainthoodBox.classList.add('hidden');
    }

    document.getElementById('supply-limit').value = player.supplyLimit;
    document.getElementById('upgrade-supply-cost').value = player.upgradeSupplyCost || 0;

    const battleTally = (player.battles.wins || 0) + (player.battles.losses || 0);
    document.getElementById('battle-tally').textContent = battleTally;
    document.getElementById('wins').textContent = player.battles.wins || 0;
    document.getElementById('losses').textContent = player.battles.losses || 0;

    document.getElementById('goals-notes').value = player.goalsNotes || '';

    renderOrderOfBattle();
};

const updateSupplyDisplay = () => {
    if (activePlayerIndex === -1) return;
    const player = campaignData.players[activePlayerIndex];

    const supplyFromUnits = (player.units || []).reduce((total, unit) => total + (unit.power || 0), 0);
    const supplyFromUpgrades = player.upgradeSupplyCost || 0;
    const totalUsed = supplyFromUnits + supplyFromUpgrades;
    const remainingSupply = (player.supplyLimit || 0) - totalUsed;

    document.getElementById('supply-used').textContent = totalUsed;
    document.getElementById('supply-remaining').textContent = remainingSupply;
};

const renderOrderOfBattle = () => {
    const player = campaignData.players[activePlayerIndex];
    const tbody = document.getElementById('units-tbody');
    tbody.innerHTML = '';
    
    (player.units || []).forEach((unit, index) => {
        const rank = getRankFromXp(unit.xp);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${unit.name}</td>
            <td>${unit.role}</td>
            <td>${unit.power || 0}</td>
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

    updateSupplyDisplay();
};

const renderPlanetarySystem = (systemId) => {
    const system = campaignData.systems.find(s => s.id === systemId);
    if (!system) return;

    currentlyViewedSystemId = systemId;
    const planetarySystemDiv = document.getElementById('planetary-system');
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
        
        // NOUVEAU : Ajout de l'effet visuel de corruption
        const viewingPlayer = campaignData.players.find(p => p.id === mapViewingPlayerId);
        if (viewingPlayer && viewingPlayer.faction === 'Death Guard' && viewingPlayer.deathGuardData.corruptedPlanetIds.includes(planet.id)) {
            planetDiv.classList.add('corrupted-planet');
        } else {
            planetDiv.classList.remove('corrupted-planet');
        }
        
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
    const mapContainer = document.getElementById('galactic-map-container');
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

    const visibleSystemIds = getReachableSystemsForPlayer(mapViewingPlayerId);
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

const updateExplorationArrows = (currentSystem) => {
    const directions = ['up', 'down', 'left', 'right'];
    const arrowSymbols = { up: '↑', down: '↓', left: '←', right: '→' };
    const style = getComputedStyle(document.documentElement);
    const colors = {
        red: style.getPropertyValue('--danger-color').trim(),
        green: style.getPropertyValue('--friendly-color').trim(),
        yellow: style.getPropertyValue('--warning-color').trim(),
        blue: style.getPropertyValue('--probed-color').trim(),
        default: style.getPropertyValue('--text-muted-color').trim()
    };

    const viewingPlayer = campaignData.players.find(p => p.id === mapViewingPlayerId);
    if (!viewingPlayer || !viewingPlayer.discoveredSystemIds) {
        directions.forEach(dir => document.getElementById(`explore-${dir}`).classList.add('hidden'));
        return;
    }

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
        arrow.style.cursor = 'pointer';
        arrow.title = `Explorer vers ${dir}`;

        if (connectedSystemId && viewingPlayer.discoveredSystemIds.includes(connectedSystemId)) {
            const connectedSystem = campaignData.systems.find(s => s.id === connectedSystemId);
            if (connectedSystem) {
                const { status, text } = getSystemStatusForPlayer(connectedSystem, viewingPlayer.id);
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
                label = `<span class="arrow-symbol">${arrowSymbols[dir]}</span><small>LIEN BRISÉ</small>`;
                arrow.style.borderColor = colors.red;
                arrow.style.color = colors.red;
                arrow.style.cursor = 'not-allowed';
                arrow.title = `Erreur: La connexion est rompue.`;
            }
        } else if (probedInfo) {
            if (probedInfo.status === 'player_contact') {
                arrow.style.borderColor = colors.red;
                arrow.style.color = colors.red;
                label = `<span class="arrow-symbol">${arrowSymbols[dir]}</span><small>JOUEUR<br>HOSTILE</small>`;
                arrow.title = `Sonde a détecté une présence hostile ! Cliquez pour tenter d'établir une connexion.`;
            } else {
                arrow.style.borderColor = colors.blue;
                arrow.style.color = colors.blue;
                label = `<span class="arrow-symbol">${arrowSymbols[dir]}</span><small>SONDÉ<br>${probedInfo.name}</small>`;
                arrow.title = `Route sondée vers ${probedInfo.name}. Cliquez pour établir la connexion.`;
            }
        } else {
            const parentPos = currentSystem.position;
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
                label = `<span class="arrow-symbol" style="opacity: 0.5;">${arrowSymbols[dir]}</span>`;
            }
        }
        arrow.innerHTML = label;
    });
};

const renderSainthoodBox = (player) => {
    if (!player || player.faction !== 'Adepta Sororitas') return;

    const potentiaNameEl = document.getElementById('saint-potentia-name');
    const selectSaintBtn = document.getElementById('select-saint-btn');
    const changeSaintBtn = document.getElementById('change-saint-btn');
    const activeTrialSelect = document.getElementById('active-trial-select');
    const martyrdomPointsEl = document.getElementById('martyrdom-points');
    const trialsGridEl = document.getElementById('trials-grid');
    const rewardsDisplayEl = document.getElementById('saint-rewards-display');

    // --- Sainte Potentia ---
    const potentiaUnitId = player.sainthood.potentiaUnitId;
    if (potentiaUnitId) {
        const potentiaUnit = player.units.find(u => u.id === potentiaUnitId);
        potentiaNameEl.textContent = potentiaUnit ? potentiaUnit.name : 'Unité introuvable';
        selectSaintBtn.classList.add('hidden');
        changeSaintBtn.classList.remove('hidden');
    } else {
        potentiaNameEl.textContent = 'Aucune';
        selectSaintBtn.classList.remove('hidden');
        changeSaintBtn.classList.add('hidden');
    }

    // --- Épreuve Active ---
    activeTrialSelect.innerHTML = '';
    sororitasCrusadeRules.trials.forEach(trial => {
        const option = document.createElement('option');
        option.value = trial.id;
        option.textContent = trial.name;
        if (trial.id === player.sainthood.activeTrial) {
            option.selected = true;
        }
        activeTrialSelect.appendChild(option);
    });

    // --- Points de Martyre ---
    martyrdomPointsEl.textContent = player.sainthood.martyrdomPoints || 0;

    // --- Grille des Épreuves ---
    trialsGridEl.innerHTML = '';
    sororitasCrusadeRules.trials.forEach(trial => {
        const points = player.sainthood.trials[trial.id] || 0;
        const isCompleted = points >= 10;
        const card = document.createElement('div');
        card.className = 'trial-card';
        if (isCompleted) {
            card.classList.add('completed');
        }

        card.innerHTML = `
            <h4>${trial.name}</h4>
            <p>${trial.acts}</p>
            <div style="display: flex; align-items: center; gap: 10px; margin-top: auto;">
                <span>${points} / 10</span>
                <progress value="${points}" max="10" style="flex-grow: 1;"></progress>
                <button class="tally-btn" data-action="decrease-trial" data-trial="${trial.id}" title="Retirer 1 point">-</button>
                <button class="tally-btn" data-action="increase-trial" data-trial="${trial.id}" title="Ajouter 1 point">+</button>
            </div>
        `;
        trialsGridEl.appendChild(card);
    });

    // --- Récompenses ---
    rewardsDisplayEl.innerHTML = '';
    let completedRewards = [];
    Object.entries(player.sainthood.trials).forEach(([trialId, points]) => {
        if (points >= 10) {
            const trialRule = sororitasCrusadeRules.trials.find(t => t.id === trialId);
            if (trialRule) {
                completedRewards.push(`<li><b>${trialRule.reward_name}:</b> ${trialRule.reward_desc}</li>`);
            }
        }
    });

    if (completedRewards.length > 0) {
        rewardsDisplayEl.innerHTML = `<ul>${completedRewards.join('')}</ul>`;
    } else {
        rewardsDisplayEl.innerHTML = `<p>Les récompenses des Épreuves terminées (10+ points) apparaîtront ici.</p>`;
    }
};

// NOUVELLE FONCTION de rendu pour la Death Guard
const renderDeathGuardBox = (player) => {
    if (!player || player.faction !== 'Death Guard' || !player.deathGuardData) return;

    document.getElementById('contagion-points').textContent = player.deathGuardData.contagionPoints || 0;
    document.getElementById('pathogen-power').textContent = player.deathGuardData.pathogenPower || 1;
    document.getElementById('plague-reproduction').textContent = player.deathGuardData.plagueStats.reproduction || 1;
    document.getElementById('plague-survival').textContent = player.deathGuardData.plagueStats.survival || 1;
    document.getElementById('plague-adaptability').textContent = player.deathGuardData.plagueStats.adaptability || 1;
};