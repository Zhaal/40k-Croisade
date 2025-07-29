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
    
    // NOUVEAUX ÉLÉMENTS POUR LE JOURNAL D'ACTIONS
    const actionLogContainer = document.getElementById('action-log-container');
    const actionLogHeader = document.getElementById('action-log-header');
    const actionLogEntries = document.getElementById('action-log-entries');
    const toggleLogBtn = document.getElementById('toggle-log-btn');


    // Infobulle personnalisée
    const customTooltip = document.createElement('div');
    customTooltip.id = 'custom-tooltip';
    document.body.appendChild(customTooltip);

    //======================================================================
    //  GESTION DES ÉVÉNEMENTS PRINCIPAUX
    //======================================================================

    // --- Contrôles généraux ---
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
    
    /**
     * CORRIGÉ : Gère la fermeture d'une modale et met à jour le contexte de l'historique.
     * @param {HTMLElement} modal L'élément de la modale à fermer.
     */
    function handleModalClose(modal) {
        closeModal(modal);
    
        // Le contexte du joueur (mapViewingPlayerId) est réinitialisé uniquement
        // si l'utilisateur ferme la fenêtre du système planétaire (worldModal),
        // ce qui signifie qu'il retourne à la liste principale.
        // Fermer la carte galactique (mapModal) ne réinitialise plus le contexte.
        if (modal === worldModal) {
            mapViewingPlayerId = null; // Réinitialise l'ID du joueur consulté
            renderActionLog(); // Met à jour l'historique pour afficher le journal de session global
        }
    }

    // --- Fermeture des modales ---
    document.querySelectorAll('.modal .close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleModalClose(e.target.closest('.modal')));
    });
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) handleModalClose(e.target);
    });

    // --- Gestion des joueurs ---
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
            // NOUVEAU : Met à jour le joueur pour l'affichage de l'historique
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
                mapViewingPlayerId = player.id; // L'ID du joueur pour la vue est défini ici
                openModal(worldModal);
                setTimeout(() => renderPlanetarySystem(player.systemId), 50);
                displayPendingNotifications();
                renderActionLog(); // MISE À JOUR : Affiche l'historique de ce joueur
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
                battles: { wins: 0, losses: 0 },
                goalsNotes: '', units: [],
                discoveredSystemIds: [newSystemId],
                probedSystemIds: [],
                actionLog: [] // NOUVEAU : Initialisation du journal d'actions personnel
            };

            if (faction === 'Tyranids') {
                newPlayer.biomassPoints = 0;
            }
            if (faction === 'Death Guard') {
                newPlayer.deathGuardData = {
                    contagionPoints: 0,
                    pathogenPower: 1,
                    corruptedPlanetIds: [],
                    plagueStats: { reproduction: 1, survival: 1, adaptability: 1 }
                };
            }
            if (faction === 'Adepta Sororitas') {
                newPlayer.sainthood = {
                    potentiaUnitId: null,
                    activeTrial: 'foi',
                    trials: { foi: 0, souffrance: 0, purete: 0, vertu: 0, vaillance: 0 },
                    martyrdomPoints: 0
                };
            }

            campaignData.players.push(newPlayer);
        }
        saveData();
        renderPlayerList();
        closeModal(playerModal);
    });

    // --- Événements de la vue détaillée du joueur ---
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
        
        const [operation, stat] = action.split('-');
        const change = operation === 'increase' ? 1 : -1;

        if (stat === 'rp') {
            player.requisitionPoints = Math.max(0, player.requisitionPoints + change);
        } else if (stat === 'sombreroche') {
            player.sombrerochePoints = Math.max(0, (player.sombrerochePoints || 0) + change);
        } else if (stat === 'biomass') { 
            player.biomassPoints = Math.max(0, (player.biomassPoints || 0) + change);
        } else if (stat === 'contagion') {
            player.deathGuardData.contagionPoints = Math.max(0, (player.deathGuardData.contagionPoints || 0) + change);
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

    document.getElementById('sororitas-sainthood-box').addEventListener('click', async (e) => {
        const player = campaignData.players[activePlayerIndex];
        if (!player || player.faction !== 'Adepta Sororitas') return;

        const button = e.target.closest('button');
        if (!button) return;

        if (button.classList.contains('tally-btn')) {
            const [operation, type] = button.dataset.action.split('-');
            const change = operation === 'increase' ? 1 : -1;

            if (type === 'trial') {
                const trialId = button.dataset.trial;
                if (!trialId) return;
                const currentPoints = player.sainthood.trials[trialId] || 0;
                player.sainthood.trials[trialId] = Math.max(0, Math.min(10, currentPoints + change));
            } else if (type === 'martyrdom') {
                player.sainthood.martyrdomPoints = Math.max(0, (player.sainthood.martyrdomPoints || 0) + change);
                if (change > 0) {
                    const currentSuffering = player.sainthood.trials.souffrance || 0;
                    player.sainthood.trials.souffrance = Math.min(10, currentSuffering + 3);
                    logAction(player.id, "Point de Martyre gagné (+3 à l'Épreuve de Souffrance).", 'info', '⚜️');
                    showNotification("Point de Martyre gagné ! +3 points pour l'Épreuve de Souffrance.", "info");
                }
            }
            saveData();
            renderSainthoodBox(player);
        } else if (e.target.id === 'select-saint-btn' || e.target.id === 'change-saint-btn') {
            const isChanging = e.target.id === 'change-saint-btn';
            if (isChanging) {
                if (player.requisitionPoints < 1) {
                    showNotification("Pas assez de Points de Réquisition (1 RP requis).", "error");
                    return;
                }
                if (!await showConfirm("Changer de Sainte Potentia", "Voulez-vous dépenser <b>1 Point de Réquisition</b> pour désigner une nouvelle Sainte Potentia ? L'ancienne perdra ce statut.")) {
                    return;
                }
                player.requisitionPoints--;
                logAction(player.id, "Changement de Sainte Potentia pour 1 PR.", 'info', '⚜️');
            }

            const characters = player.units.filter(u => u.role === 'Personnage' || u.role === 'Hero Epique');
            if (characters.length === 0) {
                showNotification("Aucune unité de type 'Personnage' ou 'Hero Epique' dans votre Ordre de Bataille.", "warning");
                return;
            }

            const selectionModal = document.createElement('div');
            selectionModal.className = 'modal';
            let optionsHTML = characters.map(char => `<button class="btn-primary" style="margin: 5px; width: 90%;" data-id="${char.id}">${char.name}</button>`).join('');
            selectionModal.innerHTML = `
                <div class="modal-content">
                    <span class="close-btn">&times;</span>
                    <h3>Choisir une Sainte Potentia</h3>
                    <div class="saint-selection-list" style="display: flex; flex-direction: column; align-items: center;">${optionsHTML}</div>
                </div>`;
            document.body.appendChild(selectionModal);
            
            selectionModal.querySelector('.close-btn').onclick = () => selectionModal.remove();
            selectionModal.onclick = (event) => { if (event.target === selectionModal) selectionModal.remove(); };

            selectionModal.querySelectorAll('button[data-id]').forEach(btn => {
                btn.onclick = () => {
                    player.sainthood.potentiaUnitId = btn.dataset.id;
                    const potentia = player.units.find(u => u.id === btn.dataset.id);
                    logAction(player.id, `<b>${potentia.name}</b> a été désignée Sainte Potentia.`, 'info', '⚜️');
                    saveData();
                    renderPlayerDetail();
                    selectionModal.remove();
                    showNotification("Nouvelle Sainte Potentia désignée !", "success");
                };
            });
        }
    });

    document.getElementById('active-trial-select').addEventListener('change', (e) => {
        const player = campaignData.players[activePlayerIndex];
        if (player && player.sainthood) {
            player.sainthood.activeTrial = e.target.value;
            saveData();
            renderSainthoodBox(player);
        }
    });

    // --- Événements de l'Ordre de Bataille et Unités ---
    
    const populateUnitSelector = () => {
        if (activePlayerIndex < 0) return;

        const player = campaignData.players[activePlayerIndex];
        const faction = player.faction;
        const units = factionUnits[faction] || [];
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
        const biomorphologySection = document.getElementById('biomorphology-section');
        if (player && player.faction === 'Tyranids') {
            biomorphologySection.classList.remove('hidden');
            const biomorphologySelect = document.getElementById('biomorphology-select');
            biomorphologySelect.innerHTML = '<option value="">Choisir une adaptation...</option>';
            tyranidCrusadeRules.biomorphologies.forEach(morph => {
                biomorphologySelect.innerHTML += `<option value="${morph.name}" data-biomass="${morph.biomassCost}" data-cp="${morph.crusadePointCost}">${morph.name} (${morph.biomassCost} Biomasse)</option>`;
            });
        } else {
            biomorphologySection.classList.add('hidden');
        }

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
            const unit = campaignData.players[activePlayerIndex].units[editingUnitIndex];
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
    
    // --- Événements du système planétaire et de la carte ---
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
            document.getElementById('halve-defense-btn').classList.toggle('hidden', planet.owner !== 'neutral' || planet.defense === 0);

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

            ownerSelect.dispatchEvent(new Event('change'));
            openModal(planetTypeModal);

            const viewingPlayer = campaignData.players.find(p => p.id === mapViewingPlayerId);
            const plagueBtnContainer = document.getElementById('planet-plague-actions');
            if (plagueBtnContainer) plagueBtnContainer.remove();

            if (viewingPlayer && viewingPlayer.faction === 'Death Guard') {
                const container = document.createElement('div');
                container.id = 'planet-plague-actions';
                container.style.marginTop = '15px';
                container.style.paddingTop = '15px';
                container.style.borderTop = '1px solid var(--border-color)';

                const isCorrupted = viewingPlayer.deathGuardData.corruptedPlanetIds.includes(planet.id);

                if (isCorrupted) {
                    const manageBtn = document.createElement('button');
                    manageBtn.type = 'button';
                    manageBtn.className = 'btn-primary';
                    manageBtn.textContent = 'Gérer la Peste';
                    manageBtn.onclick = () => openPlagueManagementModal(planet.id);
                    container.appendChild(manageBtn);
                } else {
                    const infectBtn = document.createElement('button');
                    infectBtn.type = 'button';
                    infectBtn.className = 'btn-secondary';
                    const cost = deathGuardCrusadeRules.intents.SEMER_LES_GRAINES.cost;
                    infectBtn.textContent = `Infecter la Planète (${cost} PC)`;
                    infectBtn.onclick = () => infectPlanet(planet.id);
                    container.appendChild(infectBtn);
                }
                planetTypeForm.appendChild(container);
            }
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
            logAction(viewingPlayer.id, `A saboté les défenses de <b>${planet.name}</b> pour 1 PR, les réduisant à ${newDefense}.`, 'info', '💣');
            saveData();
            renderPlanetarySystem(system.id);
            if (activePlayerIndex === campaignData.players.findIndex(p => p.id === viewingPlayer.id) && !playerDetailView.classList.contains('hidden')) renderPlayerDetail();
            closeModal(planetTypeModal);
            showNotification(`Sabotage réussi ! Défenses réduites à <b>${newDefense}</b>.`, 'success');
        }
    });

    systemContainer.addEventListener('click', (e) => {
        const arrow = e.target.closest('.explore-arrow');
        if (arrow && arrow.style.cursor !== 'not-allowed') handleExploration(arrow.id.replace('explore-', ''));
    });
    
    // --- Événements de la carte galactique ---
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
        if (wasDragged) return;
        const systemNode = e.target.closest('.system-node');

        if (systemNode && systemNode.classList.contains('probed-only')) {
            showNotification("Ce système a seulement été sondé. Établissez une connexion depuis un système adjacent pour y voyager.", "info");
            return;
        }
        
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
        displayPendingNotifications();
        renderActionLog(); // MODIFIÉ : Met à jour l'historique pour le nouveau joueur
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


    // --- Améliorations d'unité & Logique spéciale ---

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
        const confirmReset = await showConfirm(
            "Réinitialiser la Campagne ?",
            "Êtes-vous sûr ? Cette action va générer une <b>nouvelle carte galactique</b> et réinitialiser la position de TOUS les joueurs. Leurs fiches de personnage (unités, points, etc.) seront conservées."
        );
        if (confirmReset) {
            generateGalaxy();
            const playerSystems = [];
    
            // CORRIGÉ : Réinitialiser les journaux d'actions avant de créer les nouveaux systèmes
            campaignData.sessionLog = [];
    
            campaignData.players.forEach((player) => {
                player.actionLog = []; // Réinitialise l'historique personnel
    
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
        actionLogEntries.classList.toggle('hidden');
        toggleLogBtn.textContent = actionLogEntries.classList.contains('hidden') ? '+' : '_';
    });


    // --- LOGIQUE D'AMÉLIORATION ---
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
    
    document.getElementById('add-biomorphology-btn').addEventListener('click', async () => {
        const select = document.getElementById('biomorphology-select');
        const selectedOption = select.options[select.selectedIndex];
        if (!selectedOption || !selectedOption.value) return;
    
        const player = campaignData.players[activePlayerIndex];
        const biomassCost = parseInt(selectedOption.dataset.biomass);
        const cpCost = parseInt(selectedOption.dataset.cp);
        const morphName = selectedOption.value;
        const morph = tyranidCrusadeRules.biomorphologies.find(m => m.name === morphName);
    
        if (!morph) return;
    
        if (player.biomassPoints < biomassCost) {
            showNotification(`Biomasse insuffisante (Requis: ${biomassCost}).`, 'error');
            return;
        }
    
        const confirmText = `Voulez-vous dépenser <b>${biomassCost} Biomasse</b> pour faire évoluer cette unité avec <i>${morphName}</i>?<br><br>Coût: ${cpCost} PC<br>Solde Biomasse: ${player.biomassPoints} &rarr; ${player.biomassPoints - biomassCost}`;
        
        if (await showConfirm("Confirmer l'Évolution", confirmText)) {
            const unit = player.units[editingUnitIndex];
    
            player.biomassPoints -= biomassCost;
            
            const textToAdd = `\n- Biomorphologie: ${morph.name}: ${morph.desc}`;
            unit.battleHonours = (unit.battleHonours || '').trim() + textToAdd;
            unit.crusadePoints = (unit.crusadePoints || 0) + cpCost;
            
            logAction(player.id, `L'unité <b>${unit.name}</b> absorbe l'évolution <i>${morph.name}</i> pour ${biomassCost} Biomasse.`, 'info', '🧬');
            
            document.getElementById('unit-honours').value = unit.battleHonours;
            document.getElementById('unit-crusade-points').value = unit.crusadePoints;
            select.value = '';
    
            saveData();
            renderPlayerDetail(); 
            showNotification(`Évolution ${morphName} absorbée !`, 'success');
        }
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
    
    
    // --- NOUVELLES FONCTIONS DE LOGIQUE POUR LA DEATH GUARD ---
    function infectPlanet(planetId) {
        const player = campaignData.players.find(p => p.id === mapViewingPlayerId);
        const cost = deathGuardCrusadeRules.intents.SEMER_LES_GRAINES.cost;
    
        if (player.deathGuardData.contagionPoints < cost) {
            showNotification("Points de Contagion insuffisants.", 'error');
            return;
        }
    
        player.deathGuardData.contagionPoints -= cost;
        if (!player.deathGuardData.corruptedPlanetIds.includes(planetId)) {
            player.deathGuardData.corruptedPlanetIds.push(planetId);
        }
        
        for (const system of campaignData.systems) {
            const planet = system.planets.find(p => p.id === planetId);
            if (planet) {
                if (typeof planet.fecundity === 'undefined') {
                    const baseStats = deathGuardCrusadeRules.planetBaseStats[planet.type];
                    if (baseStats) {
                        planet.fecundity = baseStats.fecundity;
                        planet.populationDensity = baseStats.population;
                        planet.vulnerability = baseStats.vulnerability;
                    } else { 
                        planet.fecundity = Math.ceil(Math.random() * 6);
                        planet.populationDensity = Math.ceil(Math.random() * 6);
                        planet.vulnerability = Math.ceil(Math.random() * 6);
                    }
                }
                logAction(player.id, `A infecté la planète <b>${planet.name}</b> pour ${cost} PC.`, 'info', '☣️');
                break; 
            }
        }
    
        saveData();
        renderPlayerDetail();
        renderPlanetarySystem(currentlyViewedSystemId);
        closeModal(planetTypeModal);
        showNotification("La planète a été infectée ! Vous pouvez maintenant gérer la peste.", 'success');
    }
    
    function openPlagueManagementModal(planetId) {
        plagueManagementModal = document.getElementById('plague-management-modal');
        plagueManagementModal.dataset.planetId = planetId;
        closeModal(planetTypeModal);
    
        const player = campaignData.players.find(p => p.id === mapViewingPlayerId);
        const system = campaignData.systems.find(s => s.planets.some(p => p.id === planetId));
        if (!system) return;
        const planet = system.planets.find(p => p.id === planetId);
        if (!planet) return;
    
        document.getElementById('plague-modal-title').textContent = `Guerre Bactériologique sur ${planet.name}`;
        document.getElementById('planet-fecundity').textContent = planet.fecundity;
        document.getElementById('planet-population').textContent = planet.populationDensity;
        document.getElementById('planet-vulnerability').textContent = planet.vulnerability;
        
        const plagueStats = player.deathGuardData.plagueStats;
        document.getElementById('player-plague-reproduction').textContent = plagueStats.reproduction;
        document.getElementById('player-plague-survival').textContent = plagueStats.survival;
        document.getElementById('player-plague-adaptability').textContent = plagueStats.adaptability;
    
        const totalPeste = Math.min(6, (planet.fecundity || 0) + plagueStats.reproduction) +
                           Math.min(6, (planet.populationDensity || 0) + plagueStats.survival) +
                           Math.min(6, (planet.vulnerability || 0) + plagueStats.adaptability);
        document.getElementById('total-peste-value').textContent = totalPeste;
    
        const conquerBtn = document.getElementById('conquer-plague-btn');
        conquerBtn.disabled = totalPeste < 7;
        
        openModal(plagueManagementModal);
    }
    
    async function selectNurgleBoonForCharacter(player) {
        const characters = player.units.filter(u => u.role === 'Personnage' || u.role === 'Hero Epique');
        if (characters.length === 0) {
            showNotification("Aucun personnage éligible pour recevoir un Bienfait.", 'warning');
            return;
        }

        return new Promise(resolve => {
            const modal = document.createElement('div');
            modal.className = 'modal';
            const characterOptions = characters.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            const boonOptions = deathGuardCrusadeRules.boonsOfNurgle.map(b => `<option value="${b.name}">${b.name} (${b.roll})</option>`).join('');

            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-btn">&times;</span>
                    <h3>Accorder un Bienfait de Nurgle</h3>
                    <p>Choisissez un personnage et le bienfait qu'il recevra.</p>
                    <div class="form-group">
                        <label for="boon-char-select">Personnage :</label>
                        <select id="boon-char-select">${characterOptions}</select>
                    </div>
                    <div class="form-group">
                        <label for="boon-select">Bienfait :</label>
                        <select id="boon-select">${boonOptions}</select>
                    </div>
                    <div class="modal-actions">
                        <button id="confirm-boon-btn" class="btn-primary">Confirmer</button>
                    </div>
                </div>`;
            document.body.appendChild(modal);

            const closeModalFunc = () => { modal.remove(); resolve(); };
            modal.querySelector('.close-btn').onclick = closeModalFunc;
            
            modal.querySelector('#confirm-boon-btn').onclick = () => {
                const charId = modal.querySelector('#boon-char-select').value;
                const boonName = modal.querySelector('#boon-select').value;
                const unit = player.units.find(u => u.id === charId);
                const boon = deathGuardCrusadeRules.boonsOfNurgle.find(b => b.name === boonName);

                if(unit && boon) {
                    addUpgradeToUnitData(unit, 'unit-honours', boon.name, boon.desc, "Bienfait de Nurgle: ");
                    unit.crusadePoints = (unit.crusadePoints || 0) + 1;
                    logAction(player.id, `<b>${unit.name}</b> a reçu le bienfait de Nurgle : <i>${boon.name}</i>.`, 'info', '☣️');
                    showNotification(`${unit.name} a reçu le bienfait : ${boon.name} !`, 'success');
                }
                closeModalFunc();
            };
        });
    }

    document.getElementById('upgrade-plague-btn').addEventListener('click', async () => {
        if (activePlayerIndex === -1) return;
        const player = campaignData.players[activePlayerIndex];
        if (!player.deathGuardData) return;

        const upgradeId = await showUpgradeChoiceModal(player);
        if (!upgradeId) return;

        let cost = 0;
        let isPowerUpgrade = upgradeId === 'pathogenPower';

        if (isPowerUpgrade) {
            cost = player.deathGuardData.pathogenPower + 1;
        } else {
            cost = 5;
        }
        
        if (player.deathGuardData.contagionPoints < cost) {
            showNotification("Points de Contagion insuffisants.", 'error');
            return;
        }

        if (await showConfirm("Confirmer la Mutation", `Cette amélioration coûtera <b>${cost} Points de Contagion</b>. Continuer ?`)) {
            player.deathGuardData.contagionPoints -= cost;
            let logMessage = "";
            
            if (isPowerUpgrade) {
                player.deathGuardData.pathogenPower++;
                const newPower = player.deathGuardData.pathogenPower;
                logMessage = `A augmenté sa <b>Puissance du Pathogène</b> à ${newPower} pour ${cost} PC.`;
                const newBlessing = deathGuardCrusadeRules.plagueBlessings[newPower];
                const newCurse = deathGuardCrusadeRules.plagueBlessings[-newPower];
                if (newBlessing) showNotification(`Nouvelle Propriété débloquée : ${newBlessing.name}!`, 'info', 6000);
                if (newCurse) showNotification(`Nouvel Inconvénient subi : ${newCurse.name}...`, 'warning', 6000);

            } else {
                player.deathGuardData.plagueStats[upgradeId]++;
                const statName = {reproduction: 'Reproduction', survival: 'Survie', adaptability: 'Adaptabilité'}[upgradeId];
                logMessage = `A augmenté son <b>${statName}</b> pour ${cost} PC.`;
            }

            logAction(player.id, logMessage, 'info', '☣️');
            saveData();
            renderPlayerDetail();
            showNotification("La Peste a muté avec succès !", 'success');
        }
    });

    async function showUpgradeChoiceModal(player) {
        return new Promise(resolve => {
            const modal = document.createElement('div');
            modal.className = 'modal';

            const power = player.deathGuardData.pathogenPower;
            const stats = player.deathGuardData.plagueStats;
            const upgrades = [
                { id: 'pathogenPower', name: 'Puissance du Pathogène', current: power, max: 5, cost: power + 1 },
                { id: 'reproduction', name: 'Taux de Reproduction', current: stats.reproduction, max: 6, cost: 5 },
                { id: 'survival', name: 'Taux de Survie', current: stats.survival, max: 6, cost: 5 },
                { id: 'adaptability', name: 'Adaptabilité', current: stats.adaptability, max: 6, cost: 5 }
            ];

            let optionsHTML = upgrades.map(u => {
                if (u.current < u.max) {
                    return `<button class="btn-primary" style="margin: 5px;" data-id="${u.id}">${u.name} (${u.cost} PC)</button>`;
                }
                return `<button class="btn-secondary" style="margin: 5px;" disabled>${u.name} (Max)</button>`;
            }).join('');
            
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-btn">&times;</span><h3>Améliorer la Peste</h3>
                    <p>Points disponibles: ${player.deathGuardData.contagionPoints}</p>
                    <div style="display: flex; flex-direction: column; gap: 10px;">${optionsHTML}</div>
                </div>`;
            document.body.appendChild(modal);

            const closeModalFunc = (value = null) => { modal.remove(); resolve(value); };
            modal.querySelector('.close-btn').onclick = () => closeModalFunc();
            modal.querySelectorAll('button[data-id]').forEach(btn => {
                btn.onclick = () => closeModalFunc(btn.dataset.id);
            });
        });
    }

    document.getElementById('conquer-plague-btn').addEventListener('click', async () => {
        if (activePlayerIndex === -1) return;
        const player = campaignData.players[activePlayerIndex];
        const cost = 1;
    
        if (player.requisitionPoints < cost) {
            showNotification(`Points de Réquisition insuffisants (${cost} PR requis).`, 'error');
            return;
        }
    
        const title = "Résultat de la Concrétisation";
        const text = `Vous allez dépenser <b>1 PR</b> pour tenter de Concrétiser la Peste. Lancez 1D6. Si le résultat est supérieur à votre Puissance du Pathogène (${player.deathGuardData.pathogenPower}), c'est un succès.<br><br><b>Quel a été le résultat de votre jet ?</b>`;
    
        const blindJumpBtn = document.getElementById('exploration-choice-blind-jump-btn');
        const probeBtn = document.getElementById('exploration-choice-probe-btn');
        const originalBlindJumpText = blindJumpBtn.textContent;
        const originalProbeText = probeBtn.textContent;
        const originalProbeClass = probeBtn.className;
    
        try {
            closeModal(document.getElementById('plague-management-modal'));
            
            blindJumpBtn.textContent = "Succès";
            probeBtn.textContent = "Échec";
            probeBtn.className = 'btn-danger';
    
            const outcome = await showExplorationChoice(title, text);
    
            if (outcome === 'cancel') {
                return;
            }
    
            player.requisitionPoints -= cost;
    
            if (outcome === 'blind_jump') {
                const xpGained = Math.ceil(Math.random() * 3) + 3;
                logAction(player.id, `<b>Succès !</b> La peste s'est concrétisée. Gain de ${xpGained} XP et d'un Bienfait de Nurgle.`, 'success', '☣️');
                await showConfirm("Succès !", `La peste c'est concrétiser !<br><br>Une de vos unités gagne <b>${xpGained} XP</b>.<br>De plus, vous pouvez choisir un <b>Bienfait de Nurgle</b> pour un de vos personnages.`);
                await selectNurgleBoonForCharacter(player);
                showNotification(`N'oubliez pas d'assigner les ${xpGained} XP à l'une de vos unités ayant participé à la bataille !`, 'info', 10000);
            } else if (outcome === 'probe') {
                const pointsLost = Math.ceil(player.deathGuardData.contagionPoints / 2);
                player.deathGuardData.contagionPoints -= pointsLost;
                logAction(player.id, `<b>Échec...</b> La peste n'a pas pu se concrétiser. Perte de ${pointsLost} PC.`, 'error', '☣️');
                await showConfirm("Échec...", `La Peste n'a pas pu être concrétisée.<br><br>Vous perdez la moitié de vos Points de Contagion (-${pointsLost} PC).`);
            }
    
            saveData();
            renderPlayerDetail();
    
        } finally {
            blindJumpBtn.textContent = originalBlindJumpText;
            probeBtn.textContent = originalProbeText;
            probeBtn.className = originalProbeClass;
        }
    });

    //======================================================================
    //  INITIALISATION
    //======================================================================
    loadData();
    renderPlayerList();
    renderActionLog();
    if (campaignData.players.length > 0) {
        mapViewingPlayerId = campaignData.players[0].id;
        displayPendingNotifications();
    }
});