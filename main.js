// main.js

document.addEventListener('DOMContentLoaded', () => {

    //======================================================================
    //  ÉLÉMENTS DU DOM
    //======================================================================
    playerListView = document.getElementById('player-list-view');
    playerDetailView = document.getElementById('player-detail-view');
    const playerListDiv = document.getElementById('player-list');
    const addPlayerBtn = document.getElementById('add-player-btn');
    const playerModal = document.getElementById('player-modal');
    const playerForm = document.getElementById('player-form');
    const playerModalTitle = document.getElementById('player-modal-title');
    const unitModal = document.getElementById('unit-modal');
    const unitForm = document.getElementById('unit-form');
    const unitModalTitle = document.getElementById('unit-modal-title');
    worldModal = document.getElementById('world-modal');
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
    mapModal = document.getElementById('map-modal');
    const mapContainer = document.getElementById('galactic-map-container');
    const npcCombatModal = document.getElementById('npc-combat-modal');
    const pvpCombatModal = document.getElementById('pvp-combat-modal');
    
    const actionLogContainer = document.getElementById('action-log-container');
    const actionLogHeader = document.getElementById('action-log-header');
    const actionLogEntries = document.getElementById('action-log-entries');
    const toggleLogBtn = document.getElementById('toggle-log-btn');

    const fullHistoryModal = document.getElementById('full-history-modal');
    const historyDateFilter = document.getElementById('history-date-filter');
    const clearHistoryFilterBtn = document.getElementById('clear-history-filter-btn');
    const fullHistoryEntries = document.getElementById('full-history-entries');


    const customTooltip = document.createElement('div');
    customTooltip.id = 'custom-tooltip';
    document.body.appendChild(customTooltip);

    //======================================================================
    //  GESTION DES ÉVÉNEMENTS PRINCIPAUX
    //======================================================================

    exportBtn.addEventListener('click', handleExport);
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', handleImport);
    backToListBtn.addEventListener('click', () => switchView('list'));

    backToSystemBtn.addEventListener('click', () => {
        if (currentlyViewedSystemId) {
            playerDetailView.classList.add('hidden');
            openModal(worldModal);
            setTimeout(() => renderPlanetarySystem(currentlyViewedSystemId), 50);
        }
    });
    
    function handleModalClose(modal) {
        closeModal(modal);
    
        if (modal === worldModal) {
            mapViewingPlayerId = null; 
            renderActionLog();
            renderPlayerList();
        }
        if (modal === mapModal) {
            const previouslySelected = document.querySelector('.system-node.selected-for-action');
            if(previouslySelected) previouslySelected.classList.remove('selected-for-action');
            selectedSystemOnMapId = null; 
        }
    }

    document.querySelectorAll('.modal .close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleModalClose(e.target.closest('.modal')));
    });
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) handleModalClose(e.target);
    });

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
            mapViewingPlayerId = campaignData.players[activePlayerIndex].id;
            backToSystemBtn.classList.add('hidden');
            renderPlayerDetail();
            switchView('detail');
            displayPendingNotifications();
        } else if (target.matches('.world-btn')) {
            const playerIndex = parseInt(target.dataset.index);
            const player = campaignData.players[playerIndex];
            if (player.systemId) {
                activePlayerIndex = playerIndex;
                mapViewingPlayerId = player.id;
                openModal(worldModal);
                setTimeout(() => renderPlanetarySystem(player.systemId), 50);
                displayPendingNotifications();
                renderActionLog();
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
            const faction = document.getElementById('player-faction-input').value.trim();
            const DEFENSE_VALUES = [500, 1000, 1500, 2000];
            const planetNames = ["Prima", "Secundus", "Tertius", "Quartus", "Quintus", "Sextus", "Septimus", "Octavus"];
            const numPlanets = 5;
            const newPlanets = Array.from({ length: numPlanets }, (_, i) => ({
                id: crypto.randomUUID(),
                type: i === 0 ? "Monde Sauvage" : getWeightedRandomPlanetType(),
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

            const newPlayer = {
                id: newPlayerId, systemId: newSystemId, name: name,
                faction: faction,
                crusadeFaction: '', requisitionPoints: 5, sombrerochePoints: 0,
                supplyLimit: 500,
                upgradeSupplyCost: 0,
                freeProbes: 0,
                battles: { wins: 0, losses: 0, npcGames: 0 },
                goalsNotes: '', units: [],
                discoveredSystemIds: [newSystemId],
                probedSystemIds: [],
                actionLog: []
            };

            if (faction === 'Adepta Sororitas') {
                initializeSororitasData(newPlayer);
            } else if (faction === 'Death Guard') {
                initializeDeathGuardData(newPlayer); 
            } else if (faction === 'Tyranids') {
                initializeTyranidData(newPlayer);
            }

            campaignData.players.push(newPlayer);
        }
        saveData();
        renderPlayerList();
        closeModal(playerModal);
    });

    document.querySelector('.player-info-grid').addEventListener('input', (e) => {
        if (activePlayerIndex === -1) return;
        const player = campaignData.players[activePlayerIndex];
        const targetId = e.target.id;
        const value = e.target.value;

        if (targetId === 'supply-limit') {
            player.supplyLimit = parseInt(value) || 0;
            updateSupplyDisplay();
        } else if (targetId === 'crusade-faction') {
            player.crusadeFaction = value;
        }
        saveData();
    });

    document.getElementById('goals-notes').addEventListener('change', (e) => {
        if (activePlayerIndex > -1) {
            campaignData.players[activePlayerIndex].goalsNotes = e.target.value;
            saveData();
        }
    });

    document.getElementById('player-detail-view').addEventListener('click', (e) => {
        const button = e.target.closest('.tally-btn');
        if (!button || activePlayerIndex === -1) return;
        const player = campaignData.players[activePlayerIndex];
        const action = button.dataset.action;
        if (button.id === 'increase-supply-limit-btn') return;
    
        const parts = action.split('-');
        const operation = parts[0];
        const stat = parts.slice(1).join('-');
    
        const change = operation === 'increase' ? 1 : -1;
    
        if (player.faction === 'Death Guard' && stat === 'contagion') {
            handleDeathGuardTallyButtons(player, stat, change);
            return;
        } else if (player.faction === 'Tyranids' && stat === 'biomass') {
            handleTyranidTallyButtons(player, stat, change);
            return;
        }

        if (stat === 'rp') {
            player.requisitionPoints = Math.max(0, player.requisitionPoints + change);
        } else if (stat === 'sombreroche') {
            player.sombrerochePoints = Math.max(0, (player.sombrerochePoints || 0) + change);
        } else if (stat === 'free-probes') {
            player.freeProbes = Math.max(0, (player.freeProbes || 0) + change);
        } else {
            const battleStat = stat === 'win' ? 'wins' : 'losses';
            if (change < 0 && (player.battles[battleStat] || 0) === 0) return;
            if (!player.battles) player.battles = { wins: 0, losses: 0 };
            player.battles[battleStat] = Math.max(0, (player.battles[battleStat] || 0) + change);
            if (change > 0) {
                 player.requisitionPoints++;
                 const type = battleStat === 'wins' ? 'Victoire' : 'Défaite';
                 logAction(player.id, `Enregistrement d'une <b>${type}</b>. +1 Point de Réquisition.`, 'info', '⚔️');
            }
            else {
                player.requisitionPoints = Math.max(0, player.requisitionPoints - 1);
            }
        }
        saveData();
        renderPlayerDetail();
    });
    
    document.getElementById('increase-supply-limit-btn').addEventListener('click', async () => {
        if (activePlayerIndex === -1) return;
        const player = campaignData.players[activePlayerIndex];
        const cost = 1;
        const increase = 200;
        if (player.requisitionPoints < cost) {
            showNotification(`Points de Réquisition insuffisants (coût: ${cost} RP).`, 'warning');
            return;
        }
        const confirmed = await showConfirm(
            "Augmenter la Limite de Ravitaillement",
            `Voulez-vous dépenser <b>${cost} Point de Réquisition</b> pour augmenter votre limite de ravitaillement de <b>${increase} PL</b> ?<br><br>Limite actuelle: ${player.supplyLimit} PL &rarr; ${player.supplyLimit + increase} PL<br>Solde RP actuel: ${player.requisitionPoints} RP &rarr; ${player.requisitionPoints - cost} RP`
        );
        if (confirmed) {
            player.requisitionPoints -= cost;
            player.supplyLimit += increase;
            logAction(player.id, `Limite de ravitaillement augmentée à <b>${player.supplyLimit}</b> pour 1 PR.`, 'info', '📦');
            saveData();
            renderPlayerDetail();
            showNotification(`Limite de ravitaillement augmentée à ${player.supplyLimit} PL !`, 'success');
        }
    });
    
    const populateUnitSelector = () => {
        if (activePlayerIndex < 0) return;
        const player = campaignData.players[activePlayerIndex];
        const faction = player.faction;
        
        let units = [];
        if (faction === 'Adepta Sororitas') {
            units = sororitasUnits || [];
        } else if (faction === 'Death Guard') {
            units = deathGuardUnits || [];
        } else if (faction === 'Tyranids') {
            units = tyranidUnits || [];
        } else {
            units = factionUnits[faction] || [];
        }
        
        const unitSelect = document.getElementById('unit-name');
        unitSelect.innerHTML = '<option value="" disabled selected>Choisir une unité...</option>';

        if (units.length > 0) {
            units.sort((a, b) => a.name.localeCompare(b.name));
            units.forEach(unit => {
                unitSelect.innerHTML += `<option value="${unit.name}" data-cost="${unit.cost}">${unit.name}</option>`;
            });
        }
    };
    
    const openUnitModal = () => {
        unitForm.reset();
        document.getElementById('unit-id').value = '';
        unitForm.dataset.initialXp = "0";
        unitForm.dataset.initialGlory = "0";
        document.getElementById('unit-marked-for-glory').value = 0;
        document.getElementById('unit-rank-display').textContent = getRankFromXp(0);
        
        populateUnitSelector(); 
        populateUpgradeSelectors();
    
        const player = campaignData.players[activePlayerIndex];
        
        const degenerateBtn = document.getElementById('degenerate-unit-btn');
        if (player && player.faction === 'Death Guard') {
            degenerateBtn.classList.remove('hidden');
        } else {
            degenerateBtn.classList.add('hidden');
        }
        
        updateUnitModalForTyranids(null, player);
    
        openModal(unitModal);
    };

    document.getElementById('double-unit-cost-btn').addEventListener('click', () => {
        const unitPowerInput = document.getElementById('unit-power');
        const currentCost = parseInt(unitPowerInput.value) || 0;
        unitPowerInput.value = currentCost * 2;
    
        const equipmentTextarea = document.getElementById('unit-equipment');
        const note = "\n- Effectif doublé.";
        if (!equipmentTextarea.value.includes(note)) {
            equipmentTextarea.value = (equipmentTextarea.value || '').trim() + note;
        }
    
        unitPowerInput.dispatchEvent(new Event('change', { bubbles: true }));
        equipmentTextarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    document.getElementById('add-unit-btn').addEventListener('click', () => {
        editingUnitIndex = -1;
        unitModalTitle.textContent = "Ajouter une Unité";
        openUnitModal();
    });

    document.getElementById('units-tbody').addEventListener('click', async (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        if (target.classList.contains('edit-unit-btn')) {
            editingUnitIndex = parseInt(target.dataset.index);
            const player = campaignData.players[activePlayerIndex];
            const unit = player.units[editingUnitIndex];
            unitModalTitle.textContent = `Modifier ${unit.name}`;
            openUnitModal();
            unitForm.dataset.initialXp = unit.xp || 0;
            unitForm.dataset.initialGlory = unit.markedForGlory || 0;
            
            Object.keys(unit).forEach(key => {
                let elementId = `unit-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
                if (key === 'battleHonours') elementId = 'unit-honours';
                else if (key === 'battleScars') elementId = 'unit-scars';
                
                const element = document.getElementById(elementId);
                if (element) {
                    if (element.type === 'checkbox') element.checked = unit[key];
                    else element.value = unit[key] || '';
                }
            });
            document.getElementById('unit-id').value = editingUnitIndex;
            document.getElementById('unit-rank-display').textContent = getRankFromXp(unit.xp || 0);
            
            updateUnitModalForTyranids(unit, player);
            populateUpgradeSelectors();

        } else if (target.classList.contains('delete-unit-btn')) {
            const index = parseInt(target.dataset.index);
            const player = campaignData.players[activePlayerIndex];
            const unitName = player.units[index].name;
            if (await showConfirm("Supprimer l'unité", `Supprimer l'unité "<b>${unitName}</b>" de l'ordre de bataille ?`)) {
                player.units.splice(index, 1);
                saveData();
                renderPlayerDetail();
                logAction(player.id, `Unité <b>${unitName}</b> retirée de l'ordre de bataille.`, 'info', '🗑️');
                showNotification(`Unité <b>${unitName}</b> supprimée.`, 'info');
            }
        }
    });
    
    const updateAndSaveUnitDataFromForm = () => {
        if (editingUnitIndex < 0 || activePlayerIndex < 0) return;
        const name = document.getElementById('unit-name').value;
        if (!name) return;
        const player = campaignData.players[activePlayerIndex];
        const unitData = {
            name: name,
            role: document.getElementById('unit-role').value,
            power: parseInt(document.getElementById('unit-power').value) || 0,
            xp: parseInt(document.getElementById('unit-xp').value) || 0,
            crusadePoints: parseInt(document.getElementById('unit-crusade-points').value) || 0,
            equipment: document.getElementById('unit-equipment').value,
            warlordTrait: document.getElementById('unit-warlord-trait').value,
            relic: document.getElementById('unit-relic').value,
            battleHonours: document.getElementById('unit-honours').value,
            battleScars: document.getElementById('unit-scars').value,
            markedForGlory: parseInt(document.getElementById('unit-marked-for-glory').value) || 0
        };
        const existingUnit = player.units[editingUnitIndex];
        player.units[editingUnitIndex] = { ...existingUnit, ...unitData };
        saveData();
        renderPlayerDetail();
    };

    unitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('unit-name').value;
        if (!name) return;
    
        const player = campaignData.players[activePlayerIndex];
        const unitData = {
            name: name,
            role: document.getElementById('unit-role').value,
            power: parseInt(document.getElementById('unit-power').value) || 0,
            xp: parseInt(document.getElementById('unit-xp').value) || 0,
            crusadePoints: parseInt(document.getElementById('unit-crusade-points').value) || 0,
            equipment: document.getElementById('unit-equipment').value,
            warlordTrait: document.getElementById('unit-warlord-trait').value,
            relic: document.getElementById('unit-relic').value,
            battleHonours: document.getElementById('unit-honours').value,
            battleScars: document.getElementById('unit-scars').value,
            markedForGlory: parseInt(document.getElementById('unit-marked-for-glory').value) || 0
        };
    
        if (editingUnitIndex > -1) {
            const existingUnit = player.units[editingUnitIndex];
            player.units[editingUnitIndex] = { ...existingUnit, ...unitData };
        } else {
            unitData.id = crypto.randomUUID();
            unitData.detachmentUpgrades = [];
            player.units.push(unitData);
            logAction(player.id, `Nouvelle unité ajoutée à l'ordre de bataille : <b>${unitData.name}</b>.`, 'info', '➕');
        }
    
        saveData();
        renderPlayerDetail();
        closeModal(unitModal);
    });

    unitForm.addEventListener('change', updateAndSaveUnitDataFromForm);
    
    planetarySystemDiv.addEventListener('click', async (e) => { 
        const planetElement = e.target.closest('.planet');
        if (planetElement) {
            const { systemId, planetIndex } = planetElement.dataset;
            const system = campaignData.systems.find(s => s.id === systemId);
            const planet = system.planets[planetIndex];
            
            const isDevoured = planet.name.includes('(Dévorée)');

            if (isDevoured) {
                showNotification("Cette planète est un rocher stérile, dévoré par l'essaim. Elle ne peut plus être colonisée.", 'info');
                return;
            }

            // ====================== DÉBUT DE LA CORRECTION ======================
            // Le bloc `if` spécial pour les Tyranides est supprimé.
            // Tous les clics passent désormais par openPlanetModalAndCombat.
            openPlanetModalAndCombat(planet, systemId, planetIndex);
            // ====================== FIN DE LA CORRECTION ======================
            
            return; 
        }
    });

    // ====================== DÉBUT DE LA CORRECTION ======================
    function openPlanetModalAndCombat(planet, systemId, planetIndex, attackIntent = 'conquer') {
        // La logique est modifiée pour TOUJOURS ouvrir la fenêtre de détails.
        // Les boutons dans cette fenêtre déclencheront ensuite le combat.
        openPlanetDetailsModal(planet, systemId, planetIndex);
    }
    // ====================== FIN DE LA CORRECTION ======================

    // ====================== DÉBUT DU NOUVEL AJOUT ======================
    function updatePlanetModalForTyranids(planet, viewingPlayer, system) {
        const actionsContainer = document.getElementById('planet-actions-container');
        // Ne vide plus le conteneur ici pour permettre à d'autres factions d'ajouter leurs boutons

        if (!viewingPlayer || viewingPlayer.id === planet.owner) {
            return; // Ne rien faire si c'est la planète du joueur
        }
    
        // Si aucun bouton d'assaut n'existe, on en crée un
        if (!actionsContainer.querySelector('.btn-primary')) {
            const attackButton = document.createElement('button');
            attackButton.className = 'btn-primary';
            attackButton.textContent = 'Lancer l\'Assaut';
            attackButton.style.width = '100%';
            attackButton.onclick = () => {
                if (planet.owner === 'neutral') {
                    openNpcCombatModal(planet.id, 'conquer');
                } else {
                    openPvpCombatModal(planet.id, 'conquer');
                }
            };
            actionsContainer.appendChild(attackButton);
        }

        // Ajout des boutons spécifiques aux Tyranids
        if (viewingPlayer.faction === 'Tyranids') {
            const conquerButton = actionsContainer.querySelector('.btn-primary');
            if (conquerButton) {
                conquerButton.textContent = 'Conquérir la Planète'; // Renommer le bouton d'assaut existant
            }
            
            const devourButton = document.createElement('button');
            devourButton.className = 'btn-danger';
            devourButton.textContent = 'Dévorer la Planète';
            devourButton.style.width = '100%';
            devourButton.style.marginTop = '10px';
            devourButton.onclick = () => {
                const existingTarget = (viewingPlayer.tyranidData.devourTargets || []).find(t => t.planetId === planet.id);
                if (existingTarget) {
                    showNotification(`Cette planète est déjà une cible de l'essaim. Gagnez des batailles pour la dévorer.`, 'info');
                } else {
                    const isPlayerOwned = planet.owner !== 'neutral';
                    const newTarget = {
                        planetId: planet.id,
                        systemId: system.id,
                        planetName: planet.name,
                        systemName: system.name,
                        worldType: planet.type,
                        winsNeeded: isPlayerOwned ? 3 : 1,
                        winsAchieved: 0,
                        currentStage: 'invasion'
                    };
    
                    if (!viewingPlayer.tyranidData.devourTargets) {
                        viewingPlayer.tyranidData.devourTargets = [];
                    }
                    viewingPlayer.tyranidData.devourTargets.push(newTarget);
                    logAction(viewingPlayer.id, `L'essaim a commencé à dévorer la planète <b>${planet.name}</b>.`, 'combat', '☣️');
                    saveData();
                    if (!playerDetailView.classList.contains('hidden')) {
                        renderTyranidDevourTracker(viewingPlayer);
                    }
                    showNotification(`La dévoration de ${planet.name} a commencé ! Gagnez la bataille pour progresser.`, 'success');
                }
    
                // Lancer le combat après avoir marqué la planète comme cible
                if (planet.owner === 'neutral') {
                    openNpcCombatModal(planet.id, 'devour');
                } else {
                    openPvpCombatModal(planet.id, 'devour');
                }
            };
            actionsContainer.appendChild(devourButton);
        }
    }
    // ====================== FIN DU NOUVEL AJOUT ======================

    function openPlanetDetailsModal(planet, systemId, planetIndex) {
        const adminControls = document.getElementById('admin-controls');
        const adminSectionDetails = document.getElementById('admin-section');
        const adminPasswordInput = document.getElementById('admin-password');
        const unlockBtn = document.getElementById('unlock-admin-btn');
        const lockBtn = document.getElementById('lock-admin-btn');
        const adminPasswordGroup = adminPasswordInput.parentElement;

        adminControls.classList.add('hidden');
        adminPasswordInput.value = '';
        if (adminSectionDetails) {
            adminSectionDetails.open = false;
        }
        adminPasswordGroup.classList.remove('hidden');
        unlockBtn.classList.remove('hidden');
        lockBtn.classList.add('hidden');

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
        document.getElementById('planet-type-modal-title').textContent = `Détails de ${planet.name} (${planet.type})`;

        const deadWorldContainer = document.getElementById('dead-world-link-container');
        const deadWorldSelect = document.getElementById('dead-world-link-select');
        const linkButton = document.getElementById('link-dead-world-btn');

        deadWorldSelect.innerHTML = '';
        linkButton.disabled = false;
        linkButton.textContent = 'Activer le Portail';

        if (planet.type === 'Monde Mort' && planet.owner !== 'neutral') {
            const ownerId = planet.owner;
            const isSourceSystemLinked = (campaignData.gatewayLinks || []).some(link =>
                link.systemId1 === systemId || link.systemId2 === systemId
            );

            if (isSourceSystemLinked) {
                deadWorldSelect.innerHTML = '<option disabled>Portail déjà actif depuis ce système.</option>';
                linkButton.disabled = true;
            } else {
                const potentialDestinations = [];
                campaignData.systems.forEach(s => {
                    if (!s.position || s.id === systemId) return;
                    const isDestinationSystemLinked = (campaignData.gatewayLinks || []).some(link =>
                        link.systemId1 === s.id || link.systemId2 === s.id
                    );
                    if (isDestinationSystemLinked) return;
                    const hasQualifyingPlanet = s.planets.some(p => p.type === 'Monde Mort' && p.owner === ownerId);
                    if (hasQualifyingPlanet) {
                        const destPlanet = s.planets.find(p => p.type === 'Monde Mort' && p.owner === ownerId);
                        potentialDestinations.push({
                            systemId: s.id,
                            systemName: s.name,
                            planetName: destPlanet.name
                        });
                    }
                });

                if (potentialDestinations.length > 0) {
                    potentialDestinations.forEach(dest => {
                        const option = document.createElement('option');
                        option.value = dest.systemId;
                        option.textContent = `${dest.systemName} (${dest.planetName})`;
                        deadWorldSelect.appendChild(option);
                    });
                } else {
                    deadWorldSelect.innerHTML = '<option disabled>Aucun Monde Mort non-lié disponible.</option>';
                    linkButton.disabled = true;
                }
            }
            deadWorldContainer.classList.remove('hidden');
        } else {
            deadWorldContainer.classList.add('hidden');
        }
        
        const actionsContainer = document.getElementById('planet-actions-container');
        actionsContainer.innerHTML = ''; 
        const viewingPlayer = campaignData.players.find(p => p.id === mapViewingPlayerId);
        
        // ====================== DÉBUT DE LA CORRECTION ======================
        updatePlanetModalForDeathGuard(planet, viewingPlayer);

        // Appel de la nouvelle fonction pour les Tyranids (et les boutons d'assaut généraux)
        const system = campaignData.systems.find(s => s.id === systemId);
        updatePlanetModalForTyranids(planet, viewingPlayer, system);
        // ====================== FIN DE LA CORRECTION ======================
        
        ownerSelect.dispatchEvent(new Event('change'));
        openModal(planetTypeModal);
    }
    

    worldModal.addEventListener('click', (e) => {
        if (e.target.id === 'show-map-btn') {
            openModal(mapModal);
            currentMapScale = 1;
        renderCampaignRulesTab(); 
            setTimeout(renderGalacticMap, 50);
        } else if (e.target.id === 'show-history-btn') {
            openFullHistoryModal();
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

    planetTypeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const systemId = document.getElementById('planet-system-id').value;
        const planetIndex = document.getElementById('planet-index').value;
        const system = campaignData.systems.find(s => s.id === systemId);
        const planet = system.planets[planetIndex];
        const oldOwner = planet.owner;
    
        const newOwnerId = document.getElementById('planet-owner-select').value;
        planet.type = document.getElementById('planet-type-select').value;
        planet.name = document.getElementById('planet-name-input').value.trim() || planet.name;
        planet.owner = newOwnerId;
        planet.defense = (planet.owner === 'neutral') ? parseInt(document.getElementById('planet-defense-input').value) || 0 : 0;
    
        if (oldOwner === 'neutral' && newOwnerId !== 'neutral') {
            const newOwnerPlayer = campaignData.players.find(p => p.id === newOwnerId);
            if (newOwnerPlayer) {
                logAction(newOwnerPlayer.id, `A conquis la planète <b>${planet.name}</b> dans le système <b>${system.name}</b>.`, 'conquest', '🪐');
            }
        }
    
        saveData();
        renderPlanetarySystem(systemId);
        closeModal(planetTypeModal);
    
        if (newOwnerId !== 'neutral') {
            placePlayerSystemOnMap(newOwnerId);
        }
    });
    
    document.getElementById('unlock-admin-btn').addEventListener('click', () => {
        const passwordInput = document.getElementById('admin-password');
        const adminControls = document.getElementById('admin-controls');
        const unlockBtn = document.getElementById('unlock-admin-btn');
        const lockBtn = document.getElementById('lock-admin-btn');
        const adminPasswordGroup = passwordInput.parentElement;
    
        if (passwordInput.value === 'warp') {
            adminControls.classList.remove('hidden');
            adminPasswordGroup.classList.add('hidden');
            unlockBtn.classList.add('hidden');
            lockBtn.classList.remove('hidden');
            showNotification('Paramètres administratifs déverrouillés.', 'success');
            passwordInput.value = '';
        } else {
            showNotification('Mot de passe incorrect.', 'error');
            adminControls.classList.add('hidden');
        }
    });
    
    document.getElementById('lock-admin-btn').addEventListener('click', () => {
        const adminControls = document.getElementById('admin-controls');
        const passwordInput = document.getElementById('admin-password');
        const unlockBtn = document.getElementById('unlock-admin-btn');
        const lockBtn = document.getElementById('lock-admin-btn');
        const adminPasswordGroup = passwordInput.parentElement;
    
        adminControls.classList.add('hidden');
        adminPasswordGroup.classList.remove('hidden');
        unlockBtn.classList.remove('hidden');
        lockBtn.classList.add('hidden');
        showNotification('Paramètres administratifs verrouillés.', 'info');
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
            logAction(viewingPlayer.id, `A randomisé la planète <b>${planet.name}</b> pour 2 PR. Nouveau type : ${planet.type}.`, 'info', '🎲');
            saveData();
            renderPlanetarySystem(system.id);
            if (activePlayerIndex === campaignData.players.findIndex(p => p.id === viewingPlayer.id) && !playerDetailView.classList.contains('hidden')) renderPlayerDetail();
            closeModal(planetTypeModal);
            showNotification(`Planète randomisée ! Nouveau type : <b>${planet.type}</b>.`, 'success');
        }
    });
    
    document.getElementById('link-dead-world-btn').addEventListener('click', async (e) => {
        const sourceSystemId = document.getElementById('planet-system-id').value;
        const targetSystemId = document.getElementById('dead-world-link-select').value;
        const linkButton = e.target;
        const viewingPlayer = campaignData.players.find(p => p.id === mapViewingPlayerId);

        if (!targetSystemId || !viewingPlayer) {
            showNotification("Veuillez sélectionner une destination.", 'warning');
            return;
        }

        const sourceSystem = campaignData.systems.find(s => s.id === sourceSystemId);
        const targetSystem = campaignData.systems.find(s => s.id === targetSystemId);

        if (await showConfirm("Confirmer le Portail", `Voulez-vous créer un portail permanent entre <b>${sourceSystem.name}</b> et <b>${targetSystem.name}</b> ? Cette action est irréversible.`)) {
            const linkExists = (campaignData.gatewayLinks || []).some(link => 
                (link.systemId1 === sourceSystemId && link.systemId2 === targetSystemId) ||
                (link.systemId1 === targetSystemId && link.systemId2 === sourceSystemId)
            );

            if (linkExists) {
                showNotification("Ce lien de portail existe déjà.", 'info');
                return;
            }

            if (!campaignData.gatewayLinks) campaignData.gatewayLinks = [];
            campaignData.gatewayLinks.push({ systemId1: sourceSystemId, systemId2: targetSystemId });
            logAction(viewingPlayer.id, `Un portail de <b>Monde Mort</b> a été activé entre <b>${sourceSystem.name}</b> et <b>${targetSystem.name}</b>.`, 'info', '🌀');
            saveData();
            showNotification("Portail du Monde Mort activé !", 'success');
            
            linkButton.disabled = true;

            setTimeout(() => {
                closeModal(planetTypeModal);
            }, 800);

            if (!mapModal.classList.contains('hidden')) {
                renderGalacticMap();
            }
        }
    });

    async function halvePlanetDefense() {
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
            logAction(viewingPlayer.id, `A saboté les défenses de <b>${planet.name}</b> pour 1 PR, les réduisant à ${newDefense}.`, 'info', '💣');
            saveData();
            renderPlanetarySystem(system.id);
            if (activePlayerIndex === campaignData.players.findIndex(p => p.id === viewingPlayer.id) && !playerDetailView.classList.contains('hidden')) renderPlayerDetail();
            closeModal(planetTypeModal);
            showNotification(`Sabotage réussi ! Défenses réduites à <b>${newDefense}</b>.`, 'success');
        }
    }

    systemContainer.addEventListener('click', (e) => {
        const arrow = e.target.closest('.explore-arrow');
        if (arrow && arrow.style.cursor !== 'not-allowed') handleExploration(arrow.id.replace('explore-', ''));
    });
    
    mapContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const viewport = mapContainer.querySelector('.map-viewport');
        if (!viewport) return;
        const scaleChange = e.deltaY < 0 ? 0.1 : -0.1;
        currentMapScale = Math.max(0.2, Math.min(2.5, currentMapScale + scaleChange));
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
        if (wasDragged) {
            wasDragged = false;
            return;
        }
    
        const systemNode = e.target.closest('.system-node');
        const previouslySelectedNode = document.querySelector('.system-node.selected-for-action');
    
        if (previouslySelectedNode) {
            previouslySelectedNode.classList.remove('selected-for-action');
        }
    
        if (systemNode) {
            const systemId = systemNode.dataset.systemId;
            
            if (systemId === selectedSystemOnMapId) {
                if (systemNode.classList.contains('probed-only')) {
                    showNotification("Ce système a seulement été sondé. Établissez une connexion depuis un système adjacent pour y voyager.", "info");
                    return;
                }
                if (systemId) {
                    closeModal(mapModal);
                    openModal(worldModal);
                    setTimeout(() => renderPlanetarySystem(systemId), 50);
                }
                selectedSystemOnMapId = null;
            } else {
                systemNode.classList.add('selected-for-action');
                selectedSystemOnMapId = systemId;
            }
        } else {
            selectedSystemOnMapId = null;
        }
        
        updateMapProbeControls();
    });
    
    document.getElementById('map-player-view-select').addEventListener('change', (e) => {
        mapViewingPlayerId = e.target.value;
        renderGalacticMap();
        if (currentlyViewedSystemId && !worldModal.classList.contains('hidden')) {
            renderPlanetarySystem(currentlyViewedSystemId);
        }
        displayPendingNotifications();
        renderActionLog();
    });

    document.querySelector('.map-modal-tabs').addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-link')) {
            const targetTab = e.target.dataset.tab;

            document.querySelectorAll('#map-modal .tab-link').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('#map-modal .map-modal-content-panel').forEach(panel => panel.classList.add('hidden'));
            
            e.target.classList.add('active');
            document.getElementById(targetTab).classList.remove('hidden');
        }
    });

    document.getElementById('unit-name').addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        if (selectedOption && selectedOption.dataset.cost) {
            document.getElementById('unit-power').value = selectedOption.dataset.cost;
        }
    });

    document.getElementById('unit-xp').addEventListener('input', (e) => {
        document.getElementById('unit-rank-display').textContent = getRankFromXp(parseInt(e.target.value) || 0);
    });
    document.getElementById('unit-role').addEventListener('change', () => populateUpgradeSelectors());
    document.getElementById('unit-marked-for-glory').addEventListener('input', (e) => {
        const initialXp = parseInt(unitForm.dataset.initialXp || 0);
        const initialGlory = parseInt(unitForm.dataset.initialGlory || 0);
        const newGloryValue = parseInt(e.target.value || 0);
        const xpGained = Math.floor(newGloryValue / 3) - Math.floor(initialGlory / 3);
        const newTotalXp = initialXp + xpGained;
        const xpInput = document.getElementById('unit-xp');
        if (parseInt(xpInput.value) !== newTotalXp) {
            xpInput.value = newTotalXp;
            xpInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });

    resetCampaignBtn.addEventListener('click', async () => {
        const confirmReset = await showPasswordConfirm(
            "Réinitialiser la Campagne (Explosion du Warp)",
            "Êtes-vous sûr ? Cette action va générer une <b>nouvelle carte galactique</b> et réinitialiser la position de TOUS les joueurs. Leurs fiches de personnage (unités, points, etc.) seront conservées.<br><br><b>Pour confirmer, entrez le mot de passe ci-dessous.</b>"
        );
        if (confirmReset) {
            generateGalaxy();
            const playerSystems = [];
    
            campaignData.sessionLog = [];
            campaignData.players.forEach(player => {
                player.actionLog = [];
    
                const newSystemId = crypto.randomUUID();
                const DEFENSE_VALUES = [500, 1000, 1500, 2000];
                const planetNames = ["Prima", "Secundus", "Tertius", "Quartus", "Quintus", "Sextus", "Septimus", "Octavus"];
                const numPlanets = 5;
                const newPlanets = Array.from({ length: numPlanets }, (_, i) => ({
                    id: crypto.randomUUID(),
                    type: i === 0 ? "Monde Sauvage" : getWeightedRandomPlanetType(),
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
                player.discoveredSystemIds = [newSystemId]; 
            });
    
            campaignData.systems.push(...playerSystems);
            logGlobalAction(`<b>EXPLOSION DU WARP !</b> Une nouvelle galaxie a été générée.`, 'alert', '💥');
            saveData();
            switchView('list');
            renderPlayerList();
            showNotification("Le Warp a tout consumé ! Une nouvelle galaxie a été générée.", 'success', 8000);
        }
    });
    
    actionLogHeader.addEventListener('click', () => {
        const title = actionLogHeader.querySelector('h4');
        actionLogContainer.classList.toggle('minimized');
        actionLogEntries.classList.toggle('hidden');
        toggleLogBtn.textContent = actionLogEntries.classList.contains('hidden') ? '+' : '_';
        title.classList.toggle('hidden', actionLogEntries.classList.contains('hidden'));
    });

    const upgradesSection = document.getElementById('unit-upgrades-section');
    upgradesSection.addEventListener('mouseover', (e) => {
        const select = e.target.closest('select');
        if (!select || !select.closest('.upgrade-control-group') || !select.value) {
            customTooltip.style.opacity = '0';
            return;
        }

        const desc = findUpgradeDescription(select.value);
        if (desc) {
            customTooltip.innerHTML = `<strong>${select.value}</strong><p style="margin: 5px 0 0 0;">${desc}</p>`;
            const rect = select.getBoundingClientRect();
            customTooltip.style.left = `${rect.left}px`;
            customTooltip.style.top = `${rect.bottom + 5}px`;
            customTooltip.style.opacity = '1';
        } else {
            customTooltip.style.opacity = '0';
        }
    });

    upgradesSection.addEventListener('mouseout', () => {
        customTooltip.style.opacity = '0';
    });
    
    document.getElementById('add-detachment-upgrade-btn').addEventListener('click', async () => {
        const select = document.getElementById('detachment-upgrade-select');
        const selectedOption = select.options[select.selectedIndex];
        if (!selectedOption || !selectedOption.value) return;

        const player = campaignData.players[activePlayerIndex];
        const unit = player.units[editingUnitIndex];
        const upgradeName = selectedOption.value;
        const upgradeCost = parseInt(selectedOption.dataset.cost);
        const requisitionCost = 1;

        if (player.requisitionPoints < requisitionCost) {
            showNotification(`Points de Réquisition insuffisants (coût: ${requisitionCost} PR).`, 'error');
            return;
        }

        const confirmText = `Voulez-vous dépenser <b>${requisitionCost} PR</b> pour donner l'optimisation <i>${upgradeName}</i> (${upgradeCost} pts) à cette unité ?<br><br>Le coût en points sera ajouté automatiquement à votre total.`;
        if (await showConfirm("Acheter une Optimisation", confirmText)) {
            player.requisitionPoints -= requisitionCost;

            if (!unit.detachmentUpgrades) {
                unit.detachmentUpgrades = [];
            }
            unit.detachmentUpgrades.push({ name: upgradeName, cost: upgradeCost });

            addUpgradeToUnitData(unit, 'unit-honours', upgradeName, `(${upgradeCost} pts)`, "Optimisation: ");

            logAction(player.id, `Achète l'optimisation <i>${upgradeName}</i> pour <b>${unit.name}</b> (1 PR).`, 'info', '⚙️');
            
            saveData();
            renderPlayerDetail();
            showNotification(`Optimisation "${upgradeName}" ajoutée !`, 'success');

            select.value = '';
        }
    });
    
    function openNpcCombatModal(planetId, attackIntent = 'conquer') {
        const attacker = campaignData.players.find(p => p.id === mapViewingPlayerId);
        if (!attacker) return;
    
        closeModal(planetTypeModal);
    
        document.getElementById('npc-combat-attacker-name').textContent = attacker.name;
        const defenderSelect = document.getElementById('npc-combat-defender-select');
        defenderSelect.innerHTML = '<option value="" disabled selected>Sélectionner un défenseur...</option>';
    
        campaignData.players.forEach(p => {
            if (p.id !== attacker.id) {
                const option = document.createElement('option');
                option.value = p.id;
                option.textContent = p.name;
                defenderSelect.appendChild(option);
            }
        });
    
        npcCombatModal.dataset.planetId = planetId;
        npcCombatModal.dataset.attackIntent = attackIntent;
        openModal(npcCombatModal);
    }
    
    document.getElementById('finish-npc-combat-btn').addEventListener('click', async () => {
        const attacker = campaignData.players.find(p => p.id === mapViewingPlayerId);
        const defenderId = document.getElementById('npc-combat-defender-select').value;
        const planetId = npcCombatModal.dataset.planetId;
        const attackIntent = npcCombatModal.dataset.attackIntent; 
    
        if (!attacker || !defenderId || !planetId) {
            showNotification("Veuillez sélectionner un défenseur.", "warning");
            return;
        }
    
        const defender = campaignData.players.find(p => p.id === defenderId);
        const system = campaignData.systems.find(s => s.planets.some(p => p.id === planetId));
        const planet = system.planets.find(p => p.id === planetId);
    
        const okBtn = document.getElementById('confirm-modal-ok-btn');
        const cancelBtn = document.getElementById('confirm-modal-cancel-btn');
        const originalOkText = okBtn.textContent;
        const originalCancelText = cancelBtn.textContent;
    
        try {
            okBtn.textContent = "Victoire";
            cancelBtn.textContent = "Défaite";
    
            const hasWon = await showConfirm("Résultat du Combat", `L'attaquant, <b>${attacker.name}</b>, a-t-il remporté la bataille contre les PNJ défendus par <b>${defender.name}</b> ?`);
            
            // MODIFIÉ : Nouvelle logique Tyranide
            if (attacker.faction === 'Tyranids' && attackIntent === 'devour') {
                const target = attacker.tyranidData.devourTargets.find(t => t.planetId === planetId);
                if (target) {
                    if (hasWon) {
                        attacker.battles.wins = (attacker.battles.wins || 0) + 1;
                        attacker.requisitionPoints++;
                        target.winsAchieved++;

                        if (target.winsAchieved >= target.winsNeeded) {
                            // DÉVORAISON COMPLÈTE
                            const rewards = tyranidCrusadeRules.worldTypeRewards[target.worldType] || { npcBiomass: 1, rp: 0 };
                            const biomassGained = rewards.npcBiomass;
                            const rpGained = rewards.rp;

                            attacker.tyranidData.biomassPoints += biomassGained;
                            attacker.requisitionPoints += rpGained;

                            planet.owner = 'neutral';
                            planet.name = `${planet.name.replace(' (Dévorée)', '')} (Dévorée)`;
                            planet.defense = 0;

                            attacker.tyranidData.devouredPlanetIds.push(planet.id);
                            attacker.tyranidData.devourTargets = attacker.tyranidData.devourTargets.filter(t => t.planetId !== planetId);
                            
                            logAction(attacker.id, `<b>DÉVORATION RÉUSSIE !</b> La planète PNJ <b>${planet.name}</b> est stérile. Gain : ${biomassGained} Biomasse, ${rpGained} PR.`, 'conquest', '☣️');
                            
                            // Déclenche la phase de Biogenèse
                            await showBiogenesisModal(attacker);
                        }
                    } else {
                        attacker.battles.losses = (attacker.battles.losses || 0) + 1;
                        attacker.requisitionPoints++;
                        logAction(attacker.id, `<b>Échec.</b> L'assaut pour dévorer <b>${planet.name}</b> a été repoussé. +1 PR.`, 'info', '⚔️');
                    }
                }
            } else { // --- Logique de conquête normale ---
                if (hasWon) {
                    attacker.battles.wins = (attacker.battles.wins || 0) + 1;
                    attacker.requisitionPoints++;
                    planet.owner = attacker.id;
                    planet.defense = 0;
                    logAction(attacker.id, `<b>Victoire !</b> A conquis la planète PNJ <b>${planet.name}</b> (défendue par ${defender.name}). +1 PR.`, 'conquest', '🏆');
                } else {
                    attacker.battles.losses = (attacker.battles.losses || 0) + 1;
                    attacker.requisitionPoints++;
                    logAction(attacker.id, `<b>Défaite</b> contre les PNJ sur <b>${planet.name}</b> (défendus par ${defender.name}). +1 PR.`, 'info', '⚔️');
                }
            }
        
            defender.freeProbes = (defender.freeProbes || 0) + 1;
            defender.battles.npcGames = (defender.battles.npcGames || 0) + 1;
            logAction(defender.id, `A reçu <b>1 Sonde Gratuite</b> pour avoir incarné les PNJ contre <b>${attacker.name}</b>.`, 'info', '🛰️');
        
            saveData();
            closeModal(npcCombatModal);
            renderPlanetarySystem(system.id);
            
            if (!playerDetailView.classList.contains('hidden')) {
                renderPlayerDetail();
            }
            showNotification("Résultat de la bataille enregistré.", "success");
    
        } finally {
            okBtn.textContent = originalOkText;
            cancelBtn.textContent = originalCancelText;
        }
    });

    function openPvpCombatModal(planetId, attackIntent = 'conquer') {
        const attacker = campaignData.players.find(p => p.id === mapViewingPlayerId);
        const system = campaignData.systems.find(s => s.planets.some(p => p.id === planetId));
        if (!attacker || !system) return;
    
        const planet = system.planets.find(p => p.id === planetId);
        if (!planet) return;
    
        const defender = campaignData.players.find(p => p.id === planet.owner);
        if (!defender) return;
    
        closeModal(planetTypeModal);
    
        document.getElementById('pvp-combat-attacker-name').textContent = attacker.name;
        document.getElementById('pvp-combat-defender-name').textContent = defender.name;
    
        pvpCombatModal.dataset.planetId = planetId;
        pvpCombatModal.dataset.attackerId = attacker.id;
        pvpCombatModal.dataset.defenderId = defender.id;
        pvpCombatModal.dataset.attackIntent = attackIntent;
        openModal(pvpCombatModal);
    }
    
    document.getElementById('finish-pvp-combat-btn').addEventListener('click', async () => {
        const { planetId, attackerId, defenderId, attackIntent } = pvpCombatModal.dataset;
    
        if (!planetId || !attackerId || !defenderId) return;
    
        const attacker = campaignData.players.find(p => p.id === attackerId);
        const defender = campaignData.players.find(p => p.id === defenderId);
        const system = campaignData.systems.find(s => s.planets.some(p => p.id === planetId));
        const planet = system.planets.find(p => p.id === planetId);
    
        if (!attacker || !defender || !system || !planet) {
            showNotification("Erreur critique, données de combat introuvables.", "error");
            return;
        }
    
        const blindJumpBtn = document.getElementById('exploration-choice-blind-jump-btn');
        const probeBtn = document.getElementById('exploration-choice-probe-btn');
        const originalBlindJumpText = blindJumpBtn.textContent;
        const originalProbeText = probeBtn.textContent;
        const originalProbeClass = probeBtn.className;
    
        try {
            blindJumpBtn.textContent = `Victoire de l'attaquant (${attacker.name})`;
            probeBtn.textContent = `Victoire du défenseur (${defender.name})`;
            probeBtn.className = 'btn-primary';
    
            const outcome = await showExplorationChoice(
                "Résultat de la Bataille", 
                `Qui a remporté la bataille pour le contrôle de <b>${planet.name}</b> ?`
            );
    
            if (outcome === 'cancel') {
                return;
            }
    
            const attackerWon = outcome === 'blind_jump';
    
            attacker.requisitionPoints++;
            defender.requisitionPoints++;
            
            // MODIFIÉ : Nouvelle logique de dévoration Tyranide
            if (attacker.faction === 'Tyranids' && attackIntent === 'devour' && attackerWon) {
                const target = attacker.tyranidData.devourTargets.find(t => t.planetId === planetId);
                if (target) {
                    attacker.battles.wins = (attacker.battles.wins || 0) + 1;
                    defender.battles.losses = (defender.battles.losses || 0) + 1;
                    target.winsAchieved++;

                    const previousStage = tyranidCrusadeRules.devourStages[target.currentStage];

                    if (target.winsAchieved >= target.winsNeeded) {
                        // DÉVORAISON COMPLÈTE
                        const rewards = tyranidCrusadeRules.worldTypeRewards[target.worldType] || { playerBiomass: 1, rp: 0 };
                        const biomassGained = rewards.playerBiomass;
                        const rpGained = rewards.rp;

                        attacker.tyranidData.biomassPoints += biomassGained;
                        attacker.requisitionPoints += rpGained;

                        planet.owner = 'neutral';
                        planet.name = `${planet.name.replace(' (Dévorée)', '')} (Dévorée)`;
                        
                        attacker.tyranidData.devouredPlanetIds.push(planet.id);
                        attacker.tyranidData.devourTargets = attacker.tyranidData.devourTargets.filter(t => t.planetId !== planetId);
                        
                        logAction(attacker.id, `<b>DÉVORATION TERMINÉE !</b> La planète <b>${planet.name}</b> de <b>${defender.name}</b> est stérile. Gain: ${biomassGained} Biomasse, ${rpGained} PR.`, 'conquest', '☣️');
                        logAction(defender.id, `<b>PLANÈTE PERDUE !</b> Votre planète <b>${planet.name}</b> a été dévorée par <b>${attacker.name}</b>. +1 PR.`, 'alert', '💀');
                        
                        await showBiogenesisModal(attacker);

                    } else {
                        // PROGRESSION VERS L'ÉTAPE SUIVANTE
                        let nextStageKey = '';
                        if (target.currentStage === 'invasion') nextStageKey = 'predation';
                        if (target.currentStage === 'predation') nextStageKey = 'consommation';
                        target.currentStage = nextStageKey;
                        const nextStageInfo = tyranidCrusadeRules.devourStages[nextStageKey];

                        logAction(attacker.id, `<b>Progression !</b> L'étape d'<b>${previousStage.name}</b> est terminée sur <b>${planet.name}</b>. Début : <b>${nextStageInfo.name}</b>. +1 PR.`, 'combat', '▶️');
                        logAction(defender.id, `<b>Défaite.</b> Vous avez repoussé l'essaim sur <b>${planet.name}</b>, mais il progresse... +1 PR.`, 'info', '⚔️');
                    }
                }
            } else { // --- Logique de conquête normale OU défaite du Tyranide ---
                if (attackerWon) {
                    attacker.battles.wins = (attacker.battles.wins || 0) + 1;
                    defender.battles.losses = (defender.battles.losses || 0) + 1;
                    
                    const oldOwnerName = defender.name;
                    planet.owner = attacker.id;
                    logAction(attacker.id, `<b>Victoire !</b> Vous avez conquis la planète <b>${planet.name}</b> de <b>${oldOwnerName}</b>. +1 PR.`, 'conquest', '🏆');
                    logAction(defender.id, `<b>Défaite.</b> Vous avez perdu la planète <b>${planet.name}</b> face à <b>${attacker.name}</b>. +1 PR.`, 'info', '⚔️');
                    showNotification(`Victoire de ${attacker.name} ! La planète ${planet.name} est conquise.`, "success");
        
                } else { 
                    defender.battles.wins = (defender.battles.wins || 0) + 1;
                    attacker.battles.losses = (attacker.battles.losses || 0) + 1;
        
                    logAction(defender.id, `<b>Victoire !</b> Vous avez défendu la planète <b>${planet.name}</b> contre <b>${attacker.name}</b>. +1 PR.`, 'conquest', '🛡️');
                    logAction(attacker.id, `<b>Défaite.</b> Votre assaut sur <b>${planet.name}</b> a été repoussé par <b>${defender.name}</b>. +1 PR.`, 'info', '⚔️');
                    showNotification(`Victoire de ${defender.name} ! La planète ${planet.name} a été défendue.`, "success");
                }
            }
    
            saveData();
            closeModal(pvpCombatModal);
            renderPlanetarySystem(system.id);
    
            if (!playerDetailView.classList.contains('hidden')) {
                renderPlayerDetail();
            }
    
        } finally {
            blindJumpBtn.textContent = originalBlindJumpText;
            probeBtn.textContent = originalProbeText;
            probeBtn.className = originalProbeClass;
        }
    });
    
    function openFullHistoryModal() {
        const viewingPlayer = campaignData.players.find(p => p.id === mapViewingPlayerId);
        if (!viewingPlayer) {
            showNotification("Aucun joueur n'est actuellement consulté.", 'warning');
            return;
        }
        
        document.getElementById('full-history-modal-title').textContent = `Historique Complet pour ${viewingPlayer.name}`;
        historyDateFilter.value = '';
        renderFullHistory();
        openModal(fullHistoryModal);
    }

    function renderFullHistory(filterDate = null) {
        fullHistoryEntries.innerHTML = '';
        const viewingPlayer = campaignData.players.find(p => p.id === mapViewingPlayerId);
        if (!viewingPlayer || !viewingPlayer.actionLog || viewingPlayer.actionLog.length === 0) {
            fullHistoryEntries.innerHTML = `<p style="padding: 10px; color: var(--text-muted-color); text-align: center;">Aucune action enregistrée pour ce joueur.</p>`;
            return;
        }

        let logsToDisplay = viewingPlayer.actionLog;

        if (filterDate) {
            logsToDisplay = viewingPlayer.actionLog.filter(entry => {
                const entryDate = new Date(entry.timestamp).toISOString().slice(0, 10);
                return entryDate === filterDate;
            });
        }

        if (logsToDisplay.length === 0) {
            fullHistoryEntries.innerHTML = `<p style="padding: 10px; color: var(--text-muted-color); text-align: center;">Aucune action trouvée pour cette date.</p>`;
            return;
        }

        logsToDisplay.forEach(entry => {
            const logItem = document.createElement('div');
            logItem.className = `log-item log-type-${entry.type}`;
            const timestamp = new Date(entry.timestamp);
            const formattedDateTime = timestamp.toLocaleString('fr-FR', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            logItem.innerHTML = `
                <span class="log-icon" style="font-size: 1.2em;">${entry.icon}</span>
                <span class="log-message" style="flex-grow: 1;">${entry.message}</span>
                <span class="log-timestamp">${formattedDateTime}</span>
            `;
            fullHistoryEntries.appendChild(logItem);
        });
    }

    historyDateFilter.addEventListener('change', (e) => {
        renderFullHistory(e.target.value);
    });

    clearHistoryFilterBtn.addEventListener('click', () => {
        historyDateFilter.value = '';
        renderFullHistory();
    });

    const initiateProbeFromMap = async (direction) => {
        if (!selectedSystemOnMapId || !mapViewingPlayerId) return;

        const sourceSystem = campaignData.systems.find(s => s.id === selectedSystemOnMapId);
        const viewingPlayer = campaignData.players.find(p => p.id === mapViewingPlayerId);
        
        if (!sourceSystem || !viewingPlayer) {
            showNotification("Erreur : Système source ou joueur introuvable.", 'error');
            return;
        }

        const otherPlayerIds = campaignData.players.map(p => p.id).filter(id => id !== viewingPlayer.id);
        const hasEnemyPlanetInCurrent = sourceSystem.planets.some(p => otherPlayerIds.includes(p.owner));
        if (hasEnemyPlanetInCurrent) {
            showNotification("<b>Blocus ennemi !</b> Vous ne pouvez pas sonder depuis ce système tant qu'une planète ennemie est présente.", 'error');
            return;
        }
    
        const parentPos = sourceSystem.position;
        const targetPos = { x: parentPos.x, y: parentPos.y };
        if (direction === 'up') targetPos.y -= STEP_DISTANCE;
        else if (direction === 'down') targetPos.y += STEP_DISTANCE;
        else if (direction === 'left') targetPos.x -= STEP_DISTANCE;
        else if (direction === 'right') targetPos.x += STEP_DISTANCE;
        const targetSystem = campaignData.systems.find(s => s.position && s.position.x === targetPos.x && s.position.y === targetPos.y);
    
        const probeSuccessful = await performProbe(sourceSystem, targetSystem, direction, viewingPlayer);
    
        if (probeSuccessful) {
            if (!playerDetailView.classList.contains('hidden')) renderPlayerDetail();
            renderGalacticMap();
            updateMapProbeControls();
        }
    }

    document.getElementById('map-probe-up').addEventListener('click', () => initiateProbeFromMap('up'));
    document.getElementById('map-probe-down').addEventListener('click', () => initiateProbeFromMap('down'));
    document.getElementById('map-probe-left').addEventListener('click', () => initiateProbeFromMap('left'));
    document.getElementById('map-probe-right').addEventListener('click', () => initiateProbeFromMap('right'));

    //======================================================================
    //  INITIALISATION
    //======================================================================
    
    loadDataFromStorage();
    migrateData();
    
    if (typeof initializeDeathGuardGameplay === 'function') {
        initializeDeathGuardGameplay();
    }
    if (typeof initializeSororitasGameplay === 'function') {
        initializeSororitasGameplay();
    }
    if (typeof initializeTyranidGameplay === 'function') {
        initializeTyranidGameplay();
    }
    
    renderPlayerList();
    renderActionLog();
    if (campaignData.players.length > 0) {
        mapViewingPlayerId = campaignData.players[0].id;
        displayPendingNotifications();
    }
    
    document.getElementById('degenerate-unit-btn').addEventListener('click', async () => {
        if (activePlayerIndex < 0 || editingUnitIndex < 0) return;

        const player = campaignData.players[activePlayerIndex];
        const unit = player.units[editingUnitIndex];
        const cost = 1;

        if (player.faction !== 'Death Guard') {
            showNotification("Cette action est réservée à la Death Guard.", 'warning');
            return;
        }

        if (player.requisitionPoints < cost) {
            showNotification(`Points de Réquisition insuffisants (coût: ${cost} PR).`, 'error');
            return;
        }

        const confirmed = await showConfirm(
            "Confirmer la Dégénérescence",
            `Voulez-vous que l'unité "<b>${unit.name}</b>" succombe à ses mutations pour <b>${cost} PR</b> ?<br><br>Elle sera remplacée par une unité de <b>Rejetons du Chaos</b>, conservant son XP, ses Honneurs et ses Séquelles. Le coût en points sera mis à jour.`
        );

        if (confirmed) {
            player.requisitionPoints -= cost;

            const oldName = unit.name;
            
            unit.name = "Rejetons du Chaos de Nurgle";
            unit.power = 80;
            unit.role = "Bête";

            logAction(player.id, `L'unité "<b>${oldName}</b>" a succombé à la Dégénérescence et est devenue une unité de <b>Rejetons du Chaos</b> pour 1 PR.`, 'info', '☣️');

            saveData();
            renderPlayerDetail();
            closeModal(unitModal);
            showNotification(`L'unité "${oldName}" est maintenant une unité de Rejetons du Chaos !`, 'success');
        }
    });

    document.getElementById('illuminate-by-pain-btn').addEventListener('click', async () => {
        if (activePlayerIndex < 0 || editingUnitIndex < 0) return;

        const player = campaignData.players[activePlayerIndex];
        const unit = player.units[editingUnitIndex];
        const cost = 1;

        if (player.requisitionPoints < cost) {
            showNotification(`Points de Réquisition insuffisants (coût: ${cost} PR).`, 'error');
            return;
        }

        const confirmed = await showConfirm(
            "Confirmer l'Illumination par la Douleur",
            `Voulez-vous dépenser <b>${cost} PR</b> pour que l'unité "<b>${unit.name}</b>" ignore ses Séquelles de Combat en échange d'un Honneur de Bataille ?<br><br>Toutes les Séquelles de cette unité seront effacées.`
        );

        if (confirmed) {
            player.requisitionPoints -= cost;
            unit.battleScars = ""; 
            document.getElementById('unit-scars').value = ""; 

            let logMessage = `A utilisé 'L'Illumination par la Douleur' sur <b>${unit.name}</b> pour 1 PR.`;
            let notificationMessage = "Séquelles effacées ! N'oubliez pas de choisir un Honneur de Bataille.";

            if (unit.id === player.sainthood.potentiaUnitId) {
                const activeTrialId = player.sainthood.activeTrial;
                
                player.sainthood.trials[activeTrialId] = Math.min(10, (player.sainthood.trials[activeTrialId] || 0) + 2);
                
                player.sainthood.martyrdomPoints = (player.sainthood.martyrdomPoints || 0) + 1;
                player.sainthood.trials.souffrance = Math.min(10, (player.sainthood.trials.souffrance || 0) + 3);

                logMessage += ` L'unité étant la Sainte Potentia, elle gagne +2 points de Sainte, +1 point de Martyre (+3 à la Souffrance).`;
                notificationMessage += "<br>Bonus de Sainte Potentia appliqué !";
            }

            logAction(player.id, logMessage, 'info', '⚜️');
            saveData();
            renderPlayerDetail();
            showNotification(notificationMessage, 'success', 7000);
        }
    });
});