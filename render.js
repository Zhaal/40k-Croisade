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
        
        // CORRECTION : Réinitialise l'ID du joueur consulté et rafraîchit l'historique
        mapViewingPlayerId = null;
        renderActionLog();
        
        // AJOUT : Rafraîchit la liste des joueurs à chaque retour au menu principal.
        renderPlayerList(); 
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
        
        const totalGames = (player.battles.wins || 0) + (player.battles.losses || 0);
        const npcGames = player.battles.npcGames || 0;

        card.innerHTML = `
            <h3 class="player-name-link" data-index="${index}">${player.name}</h3>
            <p>
                ${player.faction || 'Faction non spécifiée'}<br>
                Statut: ${onMapStatus}<br>
                Parties: ${totalGames} (PNJ: ${npcGames})
            </p>
            <div class="player-card-actions">
                <button class="btn-secondary edit-player-btn" data-index="${index}">Modifier</button>
                <button class="btn-danger delete-player-btn" data-index="${index}">Supprimer</button>
                <button class="btn-secondary world-btn" data-index="${index}">JOUER</button>
            </div>
        `;
        playerListDiv.appendChild(card);
    });
};

const renderPlayerDetail = () => {
    if (activePlayerIndex === -1) return;
    const player = campaignData.players[activePlayerIndex];

    // NOUVELLE LOGIQUE : Calcul et mise à jour du coût des optimisations de détachement
    const totalUpgradeCost = calculateDetachmentUpgradeCost(player);
    player.upgradeSupplyCost = totalUpgradeCost;
    // La sauvegarde sera effectuée lors des interactions utilisateur qui modifient les unités

    document.getElementById('player-name-display').textContent = player.name;
    document.getElementById('player-faction-display').textContent = player.faction;
    document.getElementById('crusade-faction').value = player.crusadeFaction || '';
    document.getElementById('pr-points').textContent = player.requisitionPoints;
    // MODIFIÉ : Affichage des sondes gratuites
    document.getElementById('free-probes-points').textContent = player.freeProbes || 0;
    document.getElementById('sombreroche-points').textContent = player.sombrerochePoints || 0;
    
    // Affichage conditionnel de la boîte de Biomasse (Tyranids)
    const biomassBox = document.getElementById('biomass-box');
    if (player.faction === 'Tyranids') {
        biomassBox.classList.remove('hidden');
        document.getElementById('biomass-points').textContent = player.tyranidData.biomassPoints || 0;
    } else {
        biomassBox.classList.add('hidden');
    }

    // ==========================================================
    // DEBUT DE LA MODIFICATION TYRANIDE
    // ==========================================================
    // Affichage conditionnel de la boîte de dévoration Tyranide
    const tyranidTracker = document.getElementById('tyranid-devour-tracker');
    if (player.faction === 'Tyranids' && typeof renderTyranidDevourTracker === 'function') {
        tyranidTracker.classList.remove('hidden');
        renderTyranidDevourTracker(player);
    } else {
        if (tyranidTracker) tyranidTracker.classList.add('hidden');
    }
    // ==========================================================
    // FIN DE LA MODIFICATION TYRANIDE
    // ==========================================================

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
    
    // MODIFICATION : Mise à jour du textContent au lieu de la value
    document.getElementById('upgrade-supply-cost').textContent = player.upgradeSupplyCost || 0;

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
    // MODIFICATION : Utilise la valeur calculée et stockée sur l'objet joueur
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

        const isDoubled = unit.equipment && unit.equipment.includes("- Effectif doublé.");
        const displayName = isDoubled 
            ? `${unit.name} <span class="doubled-indicator">x2</span>`
            : unit.name;

        row.innerHTML = `
            <td>${displayName}</td>
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
        
        // --- NOUVELLE LOGIQUE POUR LE VISUEL DE CIBLE TYRANIDE ---
        let isTyranidTarget = false;
        for (const p of campaignData.players) {
            if (p.faction === 'Tyranids' && p.tyranidData?.devourTargets?.some(t => t.planetId === planet.id)) {
                isTyranidTarget = true;
                break;
            }
        }
        if (isTyranidTarget) {
            planetDiv.classList.add('tyranid-target');
        }
        // --- FIN DE LA NOUVELLE LOGIQUE ---
        
        const isDevoured = campaignData.players.some(p => 
            p.faction === 'Tyranids' && 
            p.tyranidData.devouredPlanetIds && 
            p.tyranidData.devouredPlanetIds.includes(planet.id)
        );

        if (isDevoured) {
            planetDiv.classList.add('devoured-planet');
        }
        
        planetDiv.dataset.type = planet.type;
        planetDiv.dataset.owner = planet.owner;
        planetDiv.dataset.systemId = systemId;
        planetDiv.dataset.planetIndex = index;
        
        const viewingPlayer = campaignData.players.find(p => p.id === mapViewingPlayerId);
        
        if (viewingPlayer && viewingPlayer.faction === 'Death Guard' && viewingPlayer.deathGuardData && viewingPlayer.deathGuardData.corruptedPlanetIds.includes(planet.id)) {
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
             if (isDevoured) {
                planetTitle = `${planet.name} - Monde Stérile`;
            } else {
                planetTitle += ` (Défense PNJ: ${planet.defense || 0} pts)`;
            }
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

    const freeProbesEl = document.getElementById('system-view-free-probes');
    if (freeProbesEl && viewingPlayer) {
        freeProbesEl.textContent = viewingPlayer.freeProbes || 0;
    }

    // --- LOGIQUE POUR LE BOUTON "REJOINDRE LA CARTE" ---
    const modalContent = document.getElementById('world-modal').querySelector('.modal-content');
    const existingJoinButton = document.getElementById('join-map-btn');
    if (existingJoinButton) {
        existingJoinButton.remove();
    }

    if (viewingPlayer) {
        const isPlayerHomeSystem = system.owner === viewingPlayer.id;
        const isOffTheMap = !system.position;
        const allPlanetsControlled = system.planets.every(p => p.owner === viewingPlayer.id);
        const hasPlanets = system.planets && system.planets.length > 0;

        if (isPlayerHomeSystem && isOffTheMap && hasPlanets && allPlanetsControlled) {
            const joinMapBtn = document.createElement('button');
            joinMapBtn.id = 'join-map-btn';
            joinMapBtn.className = 'btn-primary';
            joinMapBtn.textContent = 'Unifier & Rejoindre la Carte Galactique';
            joinMapBtn.style.marginBottom = '15px';
            joinMapBtn.style.marginTop = '15px';
            joinMapBtn.style.width = '100%';
            joinMapBtn.style.backgroundColor = 'var(--friendly-color)';
            joinMapBtn.style.borderColor = '#2b8a5a';
            
            joinMapBtn.addEventListener('click', () => {
                // Cette fonction est définie dans engine.js et gère toute la logique
                placePlayerSystemOnMap(viewingPlayer.id);
            });

            const editOrderBtn = modalContent.querySelector('#edit-crusade-order-btn');
            if (editOrderBtn) {
                editOrderBtn.insertAdjacentElement('afterend', joinMapBtn);
            } else {
                // Fallback si le bouton n'est pas trouvé
                const titleElement = modalContent.querySelector('#world-modal-title');
                titleElement.insertAdjacentElement('afterend', joinMapBtn);
            }
        }
    }
    // --- FIN DE LA LOGIQUE DU BOUTON ---


    updateExplorationArrows(system);
};

const renderGalacticMap = () => {
    const mapContainer = document.getElementById('galactic-map-container');
    mapContainer.innerHTML = '';
    const playerViewSelect = document.getElementById('map-player-view-select');
    let viewingPlayer = campaignData.players.find(p => p.id === mapViewingPlayerId);

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
        viewingPlayer = campaignData.players[0];
        playerViewSelect.value = mapViewingPlayerId;
    }
    
    const mapFreeProbesEl = document.getElementById('map-view-free-probes');
    if (mapFreeProbesEl && viewingPlayer) {
        mapFreeProbesEl.textContent = viewingPlayer.freeProbes || 0;
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

    // MODIFIED: Create SVG overlay for curved lines
    const svgOverlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgOverlay.style.position = 'absolute';
    svgOverlay.style.top = '0';
    svgOverlay.style.left = '0';
    svgOverlay.style.width = '100%';
    svgOverlay.style.height = '100%';
    svgOverlay.style.pointerEvents = 'none';
    svgOverlay.style.zIndex = '12'; // Position between regular lines and nodes
    viewport.appendChild(svgOverlay);


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

    // NOUVEAU : Dessiner les lignes de sonde en pointillé
    const drawnProbeLines = new Set();
    systemsToDisplay.forEach(system => {
        const pos1 = system.position;
        if (!pos1 || !system.probedConnections) return;

        Object.values(system.probedConnections).forEach(probedInfo => {
            if (probedInfo && probedInfo.id) {
                const connectedId = probedInfo.id;
                
                if (visibleSystemIds.has(connectedId)) {
                    const key = [system.id, connectedId].sort().join('-');
                    if (drawnProbeLines.has(key)) return;

                    const connectedSystem = campaignData.systems.find(s => s.id === connectedId);
                    const pos2 = connectedSystem?.position;
                    
                    const isFullyConnected = Object.values(system.connections).includes(connectedId);

                    if (pos2 && !isFullyConnected) {
                        const line = document.createElement('div');
                        line.className = 'probe-connection-line'; // Classe par défaut
                        
                        if (probedInfo.status === 'player_contact') {
                            line.classList.add('probe-connection-line--hostile');
                        }
                        
                        const deltaX = pos2.x - pos1.x;
                        const deltaY = pos2.y - pos1.y;
                        const distance = Math.hypot(deltaX, deltaY);
                        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
                        line.style.left = `${pos1.x}px`;
                        line.style.top = `${pos1.y}px`;
                        line.style.width = `${distance}px`;
                        line.style.transform = `rotate(${angle}deg)`;
                        viewport.appendChild(line);
                        drawnProbeLines.add(key);
                    }
                }
            }
        });
    });

    const drawnGatewayLinks = new Set();
    (campaignData.gatewayLinks || []).forEach(link => {
        const key = [link.systemId1, link.systemId2].sort().join('-');
        if (drawnGatewayLinks.has(key)) return;

        const system1 = systemsToDisplay.find(s => s.id === link.systemId1);
        const system2 = systemsToDisplay.find(s => s.id === link.systemId2);

        if (system1 && system2 && system1.position && system2.position) {
            const pos1 = system1.position;
            const pos2 = system2.position;
            
            // MODIFIED: Draw a curved SVG path instead of a div
            const midX = (pos1.x + pos2.x) / 2;
            const midY = (pos1.y + pos2.y) / 2;
            const dx = pos2.x - pos1.x;
            const dy = pos2.y - pos1.y;
            const dist = Math.hypot(dx, dy);
            
            // Offset the control point perpendicularly to the line for the curve
            const curveAmount = 150; // A fixed pixel value for the curve height
            const controlX = midX - curveAmount * (dy / dist);
            const controlY = midY + curveAmount * (dx / dist);

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('d', `M ${pos1.x},${pos1.y} Q ${controlX},${controlY} ${pos2.x},${pos2.y}`);
            path.setAttribute('stroke', 'var(--gateway-color)');
            path.setAttribute('stroke-width', '3');
            path.setAttribute('stroke-dasharray', '8, 6'); // Dashed line for visual effect
            path.setAttribute('fill', 'none');
            
            svgOverlay.appendChild(path);
            drawnGatewayLinks.add(key);
        }
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
        
        const isProbedOnly = viewingPlayer.probedSystemIds &&
                             viewingPlayer.probedSystemIds.includes(system.id) &&
                             !viewingPlayer.discoveredSystemIds.includes(system.id);

        if (isProbedOnly) {
            node.classList.add('probed-only');
        
            // CORRECTION: Utilise les données de sonde stockées au lieu des données en temps réel.
            let wasHostileProbe = false;
            for (const sourceSystem of campaignData.systems) {
                if (viewingPlayer.discoveredSystemIds.includes(sourceSystem.id) && sourceSystem.probedConnections) {
                    for (const dir in sourceSystem.probedConnections) {
                        const probeInfo = sourceSystem.probedConnections[dir];
                        if (probeInfo && probeInfo.id === system.id && probeInfo.status === 'player_contact') {
                            wasHostileProbe = true;
                            break;
                        }
                    }
                }
                if (wasHostileProbe) break;
            }
        
            if (wasHostileProbe) {
                node.classList.add('hostile-probe');
            }
            
            const planetCount = system.planets.length;
            const planetCountText = `${planetCount} planète${planetCount > 1 ? 's' : ''}`;
            node.innerHTML = `<span>Système Inconnu</span><small>Contact Sonde<br>${planetCountText}</small>`;
            node.title = `Système Inconnu\nDonnées de sonde uniquement.\nÉtablissez une connexion pour voyager.`;
        } else {
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

            node.innerHTML = `<span>${system.name}</span><small>${text}<br>${breakdownText || 'Inexploré'}</small>`;
            node.title = `${system.name}\n${text}\n${breakdownText || 'Inexploré'}`;
        }


        node.style.left = `${pos.x}px`;
        node.style.top = `${pos.y}px`;
        viewport.appendChild(node);
    });

    // MODIFICATION : Nouvelle logique de centrage de la carte
    // Calcule le centre de la masse des systèmes affichés
    const galaxyMinX = Math.min(...allX);
    const galaxyMaxX = Math.max(...allX);
    const galaxyMinY = Math.min(...allY);
    const galaxyMaxY = Math.max(...allY);

    const galaxyCenterX = (galaxyMinX + galaxyMaxX) / 2;
    const galaxyCenterY = (galaxyMinY + galaxyMaxY) / 2;

    // Centre la vue du conteneur sur ce point central.
    // Un léger délai garantit que le navigateur a calculé les dimensions du conteneur.
    setTimeout(() => {
        mapContainer.scrollLeft = galaxyCenterX * currentMapScale - mapContainer.clientWidth / 2;
        mapContainer.scrollTop = galaxyCenterY * currentMapScale - mapContainer.clientHeight / 2;
    }, 0);
    
    // Final call to initialize/hide the probe controls
    updateMapProbeControls();
};

const updateMapProbeControls = () => {
    const probeControls = document.getElementById('map-probe-controls');
    if (!selectedSystemOnMapId) {
        probeControls.classList.add('hidden');
        probeControls.classList.remove('visible');
        return;
    }

    const system = campaignData.systems.find(s => s.id === selectedSystemOnMapId);
    const player = campaignData.players.find(p => p.id === mapViewingPlayerId);
    
    const canProbeFromSystem = system && system.position && player;

    if (!canProbeFromSystem) {
        probeControls.classList.add('hidden');
        probeControls.classList.remove('visible');
        return;
    }

    probeControls.classList.remove('hidden');
    probeControls.classList.add('visible');

    const directions = ['up', 'down', 'left', 'right'];
    directions.forEach(dir => {
        const btn = document.getElementById(`map-probe-${dir}`);
        let isEnabled = true;

        const targetPos = { x: system.position.x, y: system.position.y };
        if (dir === 'up') targetPos.y -= STEP_DISTANCE;
        else if (dir === 'down') targetPos.y += STEP_DISTANCE;
        else if (dir === 'left') targetPos.x -= STEP_DISTANCE;
        else if (dir === 'right') targetPos.x += STEP_DISTANCE;

        const targetSystem = campaignData.systems.find(s => s.position && s.position.x === targetPos.x && s.position.y === targetPos.y);

        if (!targetSystem) {
            isEnabled = false;
        } else {
            // Disable if the player has already fully discovered this system.
            if (player.discoveredSystemIds && player.discoveredSystemIds.includes(targetSystem.id)) {
                isEnabled = false;
            }
            // Disable if the player has an active probe result for this direction.
            if (system.probedConnections && system.probedConnections[dir]) {
                isEnabled = false;
            }
        }
        btn.disabled = !isEnabled;
    });
}


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
        
        arrow.title = ''; 

        const connectedSystemId = currentSystem.connections[dir];
        const probedInfo = currentSystem.probedConnections ? currentSystem.probedConnections[dir] : null;

        let label = `<span class="arrow-symbol">${arrowSymbols[dir]}</span><small>Explorer</small>`;
        arrow.style.borderColor = colors.default;
        arrow.style.color = colors.default;
        arrow.style.cursor = 'pointer';

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
            } else {
                label = `<span class="arrow-symbol">${arrowSymbols[dir]}</span><small>LIEN BRISÉ</small>`;
                arrow.style.borderColor = colors.red;
                arrow.style.color = colors.red;
                arrow.style.cursor = 'not-allowed';
            }
        } else if (probedInfo) {
            if (probedInfo.status === 'probe_detected') {
                arrow.style.borderColor = colors.yellow;
                arrow.style.color = colors.yellow;
                label = `<span class="arrow-symbol" style="font-size: 20px;">!</span><small>SONDE<br>DÉTECTÉE</small>`;
            }
            else if (probedInfo.status === 'player_contact') {
                arrow.style.borderColor = colors.red;
                arrow.style.color = colors.red;
                label = `<span class="arrow-symbol">${arrowSymbols[dir]}</span><small>JOUEUR<br>HOSTILE</small>`;
            } else { // npc_contact
                arrow.style.borderColor = colors.blue;
                arrow.style.color = colors.blue;
                label = `<span class="arrow-symbol">${arrowSymbols[dir]}</span><small>SONDÉ<br>Contact PNJ</small>`;
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
                label = `<span class="arrow-symbol" style="opacity: 0.5;">${arrowSymbols[dir]}</span>`;
            } else {
                 const isUndiscoveredKnownRoute = currentSystem.connections[dir] === targetSystem.id;
                 if (isUndiscoveredKnownRoute) {
                    label = `<span class="arrow-symbol" style="font-size: 20px;">?</span><small>Route<br>Détectée</small>`;
                    arrow.style.borderColor = colors.blue;
                    arrow.style.color = colors.blue;
                 }
            }
        }
        arrow.innerHTML = label;
    });
    
    // NOUVEL AJOUT : Met à jour le compteur de sondes gratuites en temps réel.
    const freeProbesEl = document.getElementById('system-view-free-probes');
    if (freeProbesEl && viewingPlayer) {
        freeProbesEl.textContent = viewingPlayer.freeProbes || 0;
    }
};

const renderDeathGuardBox = (player) => {
    if (!player || player.faction !== 'Death Guard' || !player.deathGuardData) return;

    document.getElementById('contagion-points').textContent = player.deathGuardData.contagionPoints || 0;
    document.getElementById('pathogen-power').textContent = player.deathGuardData.pathogenPower || 1;
    document.getElementById('plague-reproduction').textContent = player.deathGuardData.plagueStats.reproduction || 1;
    document.getElementById('plague-survival').textContent = player.deathGuardData.plagueStats.survival || 1;
    document.getElementById('plague-adaptability').textContent = player.deathGuardData.plagueStats.adaptability || 1;
};

/**
 * MODIFIÉ : Affiche l'historique des actions en fonction du contexte (joueur ou global).
 */
const renderActionLog = () => {
    const logEntriesContainer = document.getElementById('action-log-entries');
    if (!logEntriesContainer) return;
    logEntriesContainer.innerHTML = '';

    // Si un joueur est en cours de consultation, afficher son journal personnel.
    if (mapViewingPlayerId) {
        const viewingPlayer = campaignData.players.find(p => p.id === mapViewingPlayerId);
        if (!viewingPlayer || !viewingPlayer.actionLog || viewingPlayer.actionLog.length === 0) {
            const playerName = viewingPlayer ? ` pour ${viewingPlayer.name}` : '';
            logEntriesContainer.innerHTML = `<p style="padding: 10px; color: var(--text-muted-color); text-align: center;">Aucune action enregistrée${playerName}.</p>`;
            return;
        }

        viewingPlayer.actionLog.forEach(entry => {
            const logItem = document.createElement('div');
            logItem.className = `log-item log-type-${entry.type}`;
            const timestamp = new Date(entry.timestamp);
            const formattedTime = `${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}`;
            logItem.innerHTML = `
                <span class="log-icon">${entry.icon}</span>
                <span class="log-message">${entry.message}</span>
                <span class="log-timestamp">${formattedTime}</span>
            `;
            logEntriesContainer.appendChild(logItem);
        });

    // Sinon, afficher le journal de session global.
    } else {
        if (!campaignData.sessionLog || campaignData.sessionLog.length === 0) {
            logEntriesContainer.innerHTML = `<p style="padding: 10px; color: var(--text-muted-color); text-align: center;">Aucune activité récente dans la campagne.</p>`;
            return;
        }

        campaignData.sessionLog.forEach(entry => {
            const logItem = document.createElement('div');
            logItem.className = `log-item log-type-info`; // Type générique pour la session
            const timestamp = new Date(entry.timestamp);
            const formattedTime = `${timestamp.toLocaleDateString()} ${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}`;
            logItem.innerHTML = `
                <span class="log-icon">👤</span>
                <span class="log-message"><b>${entry.playerName}</b> a été actif/active.</span>
                <span class="log-timestamp">${formattedTime}</span>
            `;
            logEntriesContainer.appendChild(logItem);
        });
    }
};

/**
 * Remplit l'onglet des règles de campagne adaptées dans la modale de la carte.
 */
function renderCampaignRulesTab() {
    const infoPanel = document.getElementById('info-content-panel');
    infoPanel.innerHTML = ''; // Vider le contenu précédent
    const player = campaignData.players.find(p => p.id === mapViewingPlayerId);

    if (!player || !campaignRuleDifferences) {
        infoPanel.innerHTML = `<p>Aucune donnée de règle de campagne à afficher.</p>`;
        return;
    }
    
    // Pour l'instant, on se concentre sur la Death Guard, mais la structure est prête pour d'autres factions.
    let factionKey;
    if (player.faction === 'Death Guard') {
        factionKey = 'deathGuard';
    } 
    // Ajoutez d'autres 'else if' ici pour d'autres factions à l'avenir
    // else if (player.faction === 'Tyranids') {
    //     factionKey = 'tyranids';
    // }

    const rulesData = campaignRuleDifferences[factionKey];

    if (!rulesData) {
        infoPanel.innerHTML = `<div class="info-panel" style="border: none; box-shadow: none; background: transparent; color: var(--text-color); max-width: 100%;">
            <div class="info-body" style="color: var(--text-color);">
             <h4 style="color: var(--primary-color); text-align:center;">Pas de règles de campagne adaptées pour cette faction.</h4>
             <p style="text-align:center;">Cette faction utilise les règles de base du programme.</p>
            </div>
        </div>`;
        return;
    }

    let tableHTML = `
        <div class="info-panel" style="border: none; box-shadow: none; background: transparent; color: var(--text-color); max-width: 100%;">
            <div class="info-body" style="color: var(--text-color);">
                <h3 style="color: var(--primary-color); text-align: center;">${rulesData.title}</h3>
                <p style="text-align: center; font-style: italic;">${rulesData.introduction}</p>
                <hr>
                <table style="width:100%; border-collapse: collapse;">
                    <thead>
                        <tr style="text-align: left; border-bottom: 2px solid var(--primary-color);">
                            <th style="padding: 8px; width: 15%;">Règle</th>
                            <th style="padding: 8px; width: 28%;">Implémentation Programme</th>
                            <th style="padding: 8px; width: 28%;">Règle Officielle</th>
                            <th style="padding: 8px; width: 29%;">Analyse & Comparaison</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    rulesData.rules.forEach(rule => {
        tableHTML += `
            <tr style="border-bottom: 1px solid var(--border-color); vertical-align: top;">
                <td style="padding: 8px;"><strong>${rule.ruleName}</strong></td>
                <td style="padding: 8px; font-size: 0.9em;">${rule.programImplementation}</td>
                <td style="padding: 8px; font-size: 0.9em;">${rule.officialRule}</td>
                <td style="padding: 8px; font-size: 0.9em; font-style: italic; color: var(--text-muted-color);">${rule.comparison}</td>
            </tr>
        `;
    });

    tableHTML += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    infoPanel.innerHTML = tableHTML;
}