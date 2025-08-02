// tyranid_module.js
// Ce fichier fusionne les règles (données) et le gameplay (logique)
// pour la faction des Tyranids.

//======================================================================
//  1. RÈGLES ET DONNÉES DES TYRANIDS
//======================================================================

const tyranidUnits = [
    { name: "Assimilatrice Norne", cost: 275 },
    { name: "Barbgaunts", cost: 55 },
    { name: "Biovores", cost: 50 },
    { name: "Bondisseurs de Von Ryan", cost: 70 },
    { name: "Carnifex", cost: 115 },
    { name: "Emissaire Norne", cost: 260 },
    { name: "Exocrine", cost: 140 },
    { name: "Gardes des Ruches", cost: 90 },
    { name: "Gardes Tyranides", cost: 80 },
    { name: "Gargouilles", cost: 85 },
    { name: "Genestealers", cost: 75 },
    { name: "Génocrate", cost: 80 },
    { name: "Guerriers Tyranides avec Bio-armes de Mêlée", cost: 75 },
    { name: "Guerriers Tyranides avec Bio-armes de Tir", cost: 65 },
    { name: "Harpie", cost: 215 },
    { name: "Haruspex", cost: 125 },
    { name: "Hormagaunts", cost: 65 },
    { name: "La Mort Subite", cost: 80 },
    { name: "Le Maître des Essaims", cost: 220 },
    { name: "Le Vieux Borgne", cost: 150 },
    { name: "Lictor", cost: 60 },
    { name: "Maleceptor", cost: 170 },
    { name: "Mawloc", cost: 145 },
    { name: "Neurogaunts", cost: 45 },
    { name: "Neurolictor", cost: 80 },
    { name: "Neurotyran", cost: 105 },
    { name: "Nuées de Voraces", cost: 25 },
    { name: "Parasite de Mortrex", cost: 80 },
    { name: "Primat Tyranide Ailé", cost: 65 },
    { name: "Psychophage", cost: 110 },
    { name: "Pyrovores", cost: 40 },
    { name: "Rodeurs", cost: 75 },
    { name: "Spores Mines", cost: 55 },
    { name: "Spores Mucolides", cost: 30 },
    { name: "Sporokyste", cost: 145 },
    { name: "Termagants", cost: 60 },
    { name: "Tervigon", cost: 175 },
    { name: "Toxicrène", cost: 150 },
    { name: "Trygon", cost: 140 },
    { name: "Tueur-hurleur", cost: 135 },
    { name: "Tyran des Ruches", cost: 195 },
    { name: "Tyran des Ruches Ailé", cost: 170 },
    { name: "Tyrannocyte", cost: 105 },
    { name: "Tyrannofex", cost: 200 },
    { name: "Venomthropes", cost: 70 },
    { name: "Virago des Ruches", cost: 200 },
    { name: "Zoanthropes", cost: 100 },
    { name: "Harridan", cost: 610 },
    { name: "Hierophant", cost: 810 }
];

const tyranidDetachments = [
    { group: "Assaut de Bioformes de Type Guerrier", name: "Adaptation Oculaire", cost: 20 },
    { group: "Assaut de Bioformes de Type Guerrier", name: "Assimilation Sensorielle", cost: 20 },
    { group: "Assaut de Bioformes de Type Guerrier", name: "Puissance Elevée", cost: 30 },
    { group: "Assaut de Bioformes de Type Guerrier", name: "Tyran Synaptique", cost: 10 },
    { group: "Attaque Souterraine", name: "Intellect d'Avant-garde", cost: 15 },
    { group: "Attaque Souterraine", name: "Primat Trygon", cost: 20 },
    { group: "Attaque Souterraine", name: "Sensibilité Sismique", cost: 20 },
    { group: "Attaque Souterraine", name: "Stratégie Synaptique", cost: 15 },
    { group: "Essaim d'Assimilation", name: "Biomorphologie Parasite", cost: 25 },
    { group: "Essaim d'Assimilation", name: "Défense Instinctive", cost: 15 },
    { group: "Essaim d'Assimilation", name: "Flux Biophagique", cost: 10 },
    { group: "Essaim d'Assimilation", name: "Monstruosité Régénératrice", cost: 20 },
    { group: "Essaim Inépuisable", name: "Camouflage Naturel", cost: 30 },
    { group: "Essaim Inépuisable", name: "Faim Insatiable", cost: 20 },
    { group: "Essaim Inépuisable", name: "Montées d'Adrénaline", cost: 15 },
    { group: "Essaim Inépuisable", name: "Serres Perforantes", cost: 25 },
    { group: "Flotte d'Invasion", name: "Biologie Adaptative", cost: 25 },
    { group: "Flotte d'Invasion", name: "Parfaite Adaptation", cost: 15 },
    { group: "Flotte d'Invasion", name: "Pilier Synaptique", cost: 20 },
    { group: "Flotte d'Invasion", name: "Ruse Extraterrestre", cost: 30 },
    { group: "Nexus Synaptique", name: "Contrôle Synaptique", cost: 20 },
    { group: "Nexus Synaptique", name: "Le Mornecœur de Kharis", cost: 15 },
    { group: "Nexus Synaptique", name: "Perturbation Psychoparasite", cost: 30 },
    { group: "Nexus Synaptique", name: "Puissance de l'Esprit-ruche", cost: 10 },
    { group: "Offensive d'Avant-garde", name: "Caméléonisme", cost: 15 },
    { group: "Offensive d'Avant-garde", name: "Neuronodule", cost: 20 },
    { group: "Offensive d'Avant-garde", name: "Terrains de Chasse", cost: 20 },
    { group: "Offensive d'Avant-garde", name: "Traqueur", cost: 10 },
    { group: "Ruée Broyeuse", name: "Némésis Monstrueuse", cost: 25 },
    { group: "Ruée Broyeuse", name: "Nodules Nullificateurs", cost: 10 },
    { group: "Ruée Broyeuse", name: "Présence Funeste", cost: 15 },
    { group: "Ruée Broyeuse", name: "Réserves Surrénales", cost: 20 }
];

// MODIFIÉ : Structure de règles complète
const tyranidCrusadeRules = {
    // NOUVEAU : Récompenses de dévoration par type de monde
    worldTypeRewards: {
        "Agri-monde":           { npcBiomass: 5, playerBiomass: 10, rp: 0 },
        "Monde Sauvage":        { npcBiomass: 5, playerBiomass: 10, rp: 0 },
        "Monde Forge":          { npcBiomass: 3, playerBiomass: 7,  rp: 1 },
        "Monde Ruche":          { npcBiomass: 8, playerBiomass: 15, rp: 0 },
        "Monde Mort":           { npcBiomass: 2, playerBiomass: 4,  rp: 1 },
        "Monde Saint (relique)":{ npcBiomass: 4, playerBiomass: 8,  rp: 2 }
    },

    // NOUVEAU : Bonus et Réquisitions liés aux étapes
    devourStages: {
        invasion: {
            name: "Invasion",
            requisition: "Adaptation d'Avant-Garde (1 PR)",
            xpBonus: "Gagnez 1 PX sup. pour une unité qui monte en grade si elle est dans la zone de déploiement ennemie."
        },
        predation: {
            name: "Prédation",
            requisition: "Infestation (1 PR)",
            xpBonus: "Gagnez 1 PX sup. pour une unité qui contrôle un objectif à la fin de la bataille."
        },
        consommation: {
            name: "Consommation",
            requisition: "Garder et Assimiler (1 PR)",
            xpBonus: "Gagnez 1 PX sup. pour les BIOVORES, EXOCRINE, HARUSPEX, etc. s'ils ne sont pas détruits."
        }
    },
    
    biogenesisRewards: [
        { name: "L'Essaim Prolifère", cost: 2, desc: "Augmentez de 100 points votre Limite de Ravitaillement." },
        { name: "Biotrophes Rares", cost: 3, desc: "Choisissez 1 PERSONNAGE. Le coût de la Réquisition 'Héros Renommé' est réduit de 1 PR pour lui. Donnez-lui une Optimisation comme s'il avait gagné un rang." },
        { name: "Organismes Optimisés", cost: 4, desc: "Choisissez 1 unité. Elle gagne 3 PX (une seule fois par monde dévoré)." },
        { name: "Adaptation Rapide", cost: 5, desc: "Utilisez la Réquisition 'Physiologie Adaptée' une fois gratuitement." },
        { name: "Manne Biologique", cost: 6, desc: "Gagnez 1 Point de Réquisition (PR)." }
    ],
    requisitions: [
        { name: "Adaptation d'Avant-Garde (1 PR)", stage: "Invasion", desc: "Après une bataille, jusqu'à 2 PERSONNAGES ou MONSTRES peuvent échanger leur Trait de SdG pour la prochaine bataille." },
        { name: "Infestation (1 PR)", stage: "Predation", desc: "Une fois par monde, après une bataille, 1 unité INFANTERIE gagne Infiltrateurs pour la prochaine bataille." },
        { name: "Garder et Assimiler (1 PR)", stage: "Consommation", desc: "Une fois par monde, après une bataille, 1 PERSONNAGE ou MONSTRE non-détruit gagne 1 PX." },
        { name: "Consommer pour Survivre (2 PR)", stage: "Any", desc: "Augmente la Limite de Ravitaillement de 100 points (coût réduit de 3 à 2 PR)." },
        { name: "Réengendrer des Organismes (1 PR)", stage: "Any", desc: "Une unité perd toutes ses séquelles et tous ses traits de bataille, puis vous lui en choisissez de nouveaux." },
        { name: "Un Intellect Vaste et Glacial (1 PR)", stage: "Any", desc: "Pendant le choix des Intentions, choisissez une Intention supplémentaire (une doit être Tyranide)." },
        { name: "Biogenèse Synaptique (2 PR)", stage: "Any", desc: "Une fois par croisade, remplacez une unité SYNAPSE par une autre de coût égal ou inférieur. Elle conserve ses PX." },
        { name: "Physiologie Adaptée (2 PR)", stage: "Any", desc: "Une fois par personnage, échangez sa Relique de Croisade contre une autre." }
    ],
    battleTraits: {
        nonSynapse: [
            { roll: "11-16", name: "Une Force Née de la Faim", desc: "Ajoutez +1 à la Force des armes de mêlée. Si déjà présent, ajoutez +1 aux Attaques à la place." },
            { roll: "21-26", name: "Sens Améliorés", desc: "Ignore les modificateurs à la touche/CT/CC et les bénéfices du couvert pour les tirs." },
            { roll: "31-36", name: "Autonomie Instinctive", desc: "Est considérée à 6\" d'une unité SYNAPSE amie si elle est à 18\" ou moins." },
            { roll: "41-46", name: "Résistance aux Tirs", desc: "Sur un 6, une attaque à distance allouée est annulée." },
            { roll: "51-56", name: "Course", desc: "Relancez les jets d'Avance ou de Charge." },
            { roll: "61-66", name: "Tueurs Irrépressibles", desc: "Si cette unité a chargé ce tour, ajoutez +1 au jet pour blesser en mêlée." }
        ],
        synapse: [
            { roll: "1", name: "Terreur Indicible", desc: "Fin de phase de Mouvement, 1 unité ennemie à 6\" doit faire un test de Commandement à -1. Au prochain tour, votre unité ne peut ni Avancer ni Charger et son Mouvement est divisé par deux." },
            { roll: "2", name: "Ombre Psychique", desc: "Ne peut être ciblée par des pouvoirs psy ennemis et gagne l'aptitude Volonté d'Adamantium (ignore les BM sur 5+)." },
            { roll: "3", name: "Résonance Psionique", desc: "Une fois par bataille, peut être ciblée par un Stratagème pour 0 PC." },
            { roll: "4", name: "Résistance Inconcevable", desc: "La première fois que cette unité est détruite, sur un 2+, elle reste sur le champ de bataille avec 3 PV." },
            { roll: "5", name: "Biomorphe Renforcé", desc: "Ajoutez +1 à la caractéristique d'Endurance." },
            { roll: "6", name: "Aberration Psychique", desc: "Une fois par bataille, au début d'une phase, 1 unité TYRANIDE ennemie à 12\" perd l'aptitude SYNAPSE pour la phase." }
        ]
    },
    battleScars: {
        nonSynapse: [
            { roll: "1", name: "Incontrôlable", desc: "N'est jamais considérée à portée de l'aptitude Synapse." },
            { roll: "2", name: "Mus par le Seul Instinct", desc: "Ne peut jamais être la cible d'un Stratagème." },
            { roll: "3", name: "Concentration Obsessionnelle", desc: "Doit cibler l'unité ennemie éligible la plus proche avec ses attaques de tir." },
            { roll: "4", name: "Rage Bestiale", desc: "Doit inclure l'unité ennemie éligible la plus proche parmi ses cibles de charge." },
            { roll: "5-6", name: "Séquelle Standard", desc: "Subit une Séquelle de Combat du tableau principal." }
        ],
        synapse: [
            { roll: "1", name: "Dissonance Neuronale", desc: "Ne peut plus bénéficier de Stratagèmes ni de Règles de Détachement nécessitant le mot-clé SYNAPSE." },
            { roll: "2", name: "Délabrement Synaptique", desc: "La portée de son aptitude Synapse est réduite de moitié." },
            { roll: "3", name: "Dégénérescence Cérébrale", desc: "Perd l'aptitude Synapse." },
            { roll: "4", name: "Absence d'Ombre", desc: "Est affectée par l'aptitude 'Ombre dans le Warp' de votre propre armée." },
            { roll: "5-6", name: "Séquelle Standard", desc: "Subit une Séquelle de Combat du tableau principal." }
        ]
    },
    relics: {
        artificer: [
            { name: "Cortex Psychovore", desc: "PSYKER. Quand une unité ennemie perd un PV à cause d'une Attaque Psychique du porteur, elle perd 1 PC. Jusqu'à votre prochaine phase de Co, +1 à la Force des armes de mêlée du porteur." },
            { name: "Membrane de Mâlesprit", desc: "PSYKER. Vous pouvez relancer le jet pour toucher et pour blesser des Attaques Psychiques du porteur." }
        ],
        antique: [
            { name: "Implant d'Attaque de Mortrex", desc: "Les armes de mêlée gagnent [BLESSURES DÉVASTATRICES]. Si l'unité du porteur détruit un VÉHICULE/MONSTRE en mêlée, ajoutez une unité NUÉE DE VORACES à votre armée. Si le porteur est un MONSTRE, la première fois, ajoutez D3 unités à la place." },
            { name: "Sabres Tueurs", desc: "MONSTRE. Remplace 2 armes de mêlée. Après avoir combattu, sur un 2+, une unité ennemie touchée subit D3 BM. Si le porteur est un PSYKER, elle subit D6 BM à la place." }
        ],
        legendaire: [
            { name: "La Couronne Norne", desc: "Tant que le porteur est sur le champ de bataille, vous pouvez utiliser l'aptitude Ombre dans le Warp une fois de plus par partie. Augmente de 9\" la portée de l'aptitude Synapse de toutes les unités SYNAPSE amies." }
        ]
    }
};


//======================================================================
//  2. LOGIQUE DE GAMEPLAY DES TYRANIDS
//======================================================================

/**
 * MODIFIÉ : Attribue les données initiales spécifiques à la faction Tyranide.
 * @param {object} newPlayer - L'objet joueur en cours de création.
 */
function initializeTyranidData(newPlayer) {
    newPlayer.tyranidData = {
        biomassPoints: 0,
        // MODIFIÉ : Suivi des cibles de dévoration et des planètes dévorées
        devourTargets: [], // ex: [{ planetId, systemId, planetName, systemName, worldType, winsNeeded, winsAchieved, currentStage: 'invasion' }]
        devouredPlanetIds: [] // ex: [planetId1, planetId2, ...]
    };
}


/**
 * Gère les clics sur les boutons +/- pour les stats des Tyranids.
 * @param {object} player - L'objet joueur actif.
 * @param {string} stat - Le nom de la statistique à modifier.
 * @param {number} change - La valeur du changement (+1 ou -1).
 */
function handleTyranidTallyButtons(player, stat, change) {
    if (!player.tyranidData) return;
    if (stat === 'biomass') {
        player.tyranidData.biomassPoints = Math.max(0, (player.tyranidData.biomassPoints || 0) + change);
         document.getElementById('biomass-points').textContent = player.tyranidData.biomassPoints;
    }
    saveData();
}

/**
 * Met à jour la modale d'unité avec les actions spécifiques aux Tyranids (Traits, Séquelles, Reliques).
 * @param {object} unit - L'objet unité consulté.
 * @param {object} player - Le joueur qui consulte.
 */
function updateUnitModalForTyranids(unit, player) {
    // La logique est maintenant gérée par `upgrades.js` pour centraliser l'affichage des options
}

/**
 * MODIFIÉ : Affiche l'interface de suivi de la dévoration, maintenant centrée sur les planètes.
 * @param {object} player - L'objet du joueur Tyranide.
 */
function renderTyranidDevourTracker(player) {
    const container = document.getElementById('tyranid-devour-tracker');
    if (!player || !player.tyranidData) {
        container.classList.add('hidden');
        return;
    }
    container.classList.remove('hidden');

    const { devourTargets = [], devouredPlanetIds = [] } = player.tyranidData;

    let html = `<h3>Cibles de l'Esprit-ruche</h3>`;

    if (devourTargets.length === 0) {
        html += `<p>Aucune planète n'est actuellement ciblée pour être dévorée. Attaquez une planète et choisissez "Dévorer" pour commencer.</p>`;
    } else {
        html += '<ul style="list-style-type: none; padding-left: 0;">';
        devourTargets.forEach(target => {
            const stageInfo = tyranidCrusadeRules.devourStages[target.currentStage];
            const stageName = stageInfo ? stageInfo.name : "Terminée";
            const progressColor = target.winsAchieved / target.winsNeeded >= 0.5 ? 'var(--friendly-color)' : 'var(--warning-color)';
            
            html += `
                <li style="margin-bottom: 15px; padding: 10px; border-left: 3px solid var(--danger-color); background-color: var(--background-color);">
                    <strong>${target.planetName}</strong> (<em>${target.worldType}</em>)<br>
                    Système : ${target.systemName}<br>
                    Étape actuelle : <span style="font-weight: bold; color: var(--primary-color);">${stageName}</span><br>
                    Progression : <span style="font-weight: bold; color: ${progressColor};">${target.winsAchieved} / ${target.winsNeeded}</span> victoires
                </li>`;
        });
        html += '</ul>';
    }

    html += `<p style="margin-top: 15px; color: var(--text-muted-color);">Planètes dévorées : ${devouredPlanetIds.length}</p>`;
    container.innerHTML = html;
}

// NOUVELLE FONCTION (AMÉLIORÉE) : Gère la modale de Biogenèse après la dévoration
async function showBiogenesisModal(player) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.zIndex = '1000'; 

    const updateModalContent = () => {
        let rewardsHTML = tyranidCrusadeRules.biogenesisRewards.map(reward => `
            <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid var(--border-color);">
                <h4>${reward.name} - Coût : ${reward.cost} Biomasse</h4>
                <p style="font-size: 0.9em; color: var(--text-muted-color);">${reward.desc}</p>
                <button type="button" class="btn-primary purchase-biogenesis-btn" data-cost="${reward.cost}" data-name="${reward.name}" ${player.tyranidData.biomassPoints < reward.cost ? 'disabled' : ''}>
                    Acheter
                </button>
            </div>
        `).join('');

        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <h3 class="crusade-card-title">Phase de Biogenèse</h3>
                <p>La planète a été assimilée. Dépensez vos points de Biomasse pour faire évoluer l'essaim.</p>
                <div class="info-box" style="text-align: center; margin-bottom: 20px;">
                    <strong>Biomasse disponible :</strong> 
                    <span id="biogenesis-biomass-points" class="stat-value">${player.tyranidData.biomassPoints}</span>
                </div>
                ${rewardsHTML}
                 <div class="modal-actions">
                    <button id="finish-biogenesis-btn" class="btn-secondary">Terminer la Biogenèse</button>
                </div>
            </div>
        `;

        modal.querySelector('.close-btn').onclick = () => modal.remove();
        modal.querySelector('#finish-biogenesis-btn').onclick = () => modal.remove();

        modal.querySelectorAll('.purchase-biogenesis-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const cost = parseInt(e.target.dataset.cost);
                const name = e.target.dataset.name;
                const reward = tyranidCrusadeRules.biogenesisRewards.find(r => r.name === name);

                if (player.tyranidData.biomassPoints >= cost && reward) {
                    player.tyranidData.biomassPoints -= cost;

                    let notificationMessage = `Amélioration '${name}' achetée !`;
                    let logMessage = `A acheté l'amélioration de Biogenèse '<b>${name}</b>' pour ${cost} biomasse.`;
                    let wasBonusApplied = true;

                    switch (reward.name) {
                        case "L'Essaim Prolifère":
                            player.supplyLimit = (player.supplyLimit || 0) + 100;
                            notificationMessage += `<br>Limite de ravitaillement augmentée à <b>${player.supplyLimit} PL</b>.`;
                            break;

                        case "Biotrophes Rares":
                            const characters = player.units.filter(u => u.role === 'Personnage');
                            if (characters.length > 0) {
                                const chosenUnitId = await showUnitChoiceModal("Choisir un Biotrophe Rare", "Sélectionnez le <b>Personnage</b> qui bénéficiera de cette amélioration.", characters);
                                if (chosenUnitId) {
                                    const targetUnit = player.units.find(u => u.id === chosenUnitId);
                                    if (targetUnit) {
                                        targetUnit.battleHonours = (targetUnit.battleHonours || "") + "\n- Biotrophe Rare (Réduction sur Héros Renommé)";
                                        notificationMessage += `<br>Le statut de Biotrophe Rare a été assigné à <b>${targetUnit.name}</b>.`;
                                        logMessage += ` Statut assigné à <b>${targetUnit.name}</b>.`;
                                    }
                                } else { wasBonusApplied = false; }
                            } else {
                                notificationMessage += "<br>Aucun Personnage éligible dans votre roster.";
                                wasBonusApplied = false;
                            }
                            break;

                        case "Organismes Optimisés":
                            const allUnits = player.units;
                            if (allUnits.length > 0) {
                                const chosenUnitId = await showUnitChoiceModal("Choisir un organisme à optimiser", "Sélectionnez une unité qui recevra <b>+3 Points d'Expérience</b>.", allUnits);
                                if (chosenUnitId) {
                                    const targetUnit = player.units.find(u => u.id === chosenUnitId);
                                    if (targetUnit) {
                                        targetUnit.xp = (targetUnit.xp || 0) + 3;
                                        notificationMessage += `<br><b>${targetUnit.name}</b> a gagné +3 PX !`;
                                        logMessage += ` L'unité <b>${targetUnit.name}</b> gagne +3 PX.`;
                                    }
                                } else { wasBonusApplied = false; }
                            } else {
                                notificationMessage += "<br>Aucune unité dans votre roster. Bonus non appliqué.";
                                wasBonusApplied = false;
                            }
                            break;
                        
                        case "Adaptation Rapide":
                            notificationMessage += "<br>Vous pouvez maintenant utiliser la Réquisition 'Physiologie Adaptée' gratuitement une fois.";
                            logMessage += " Prochaine utilisation de 'Physiologie Adaptée' gratuite."
                            break;

                        case "Manne Biologique":
                            player.requisitionPoints = (player.requisitionPoints || 0) + 1;
                            notificationMessage += `<br>Vous gagnez <b>1 Point de Réquisition</b>.`;
                            break;
                    }

                    if (!wasBonusApplied) {
                        player.tyranidData.biomassPoints += cost; // Rembourser
                        showNotification("Achat annulé. La biomasse a été restituée.", "info");
                    } else {
                        logAction(player.id, logMessage, 'info', '🧬');
                        showNotification(notificationMessage, 'success', 8000);
                        saveData();
                    }

                    // Rafraîchir la modale et la fiche joueur
                    updateModalContent();
                    if (!playerDetailView.classList.contains('hidden')) {
                        renderPlayerDetail();
                    }
                }
            });
        });
    };

    document.body.appendChild(modal);
    updateModalContent(); // Appel initial pour construire le contenu
}


/**
 * Met en place tous les écouteurs d'événements spécifiques aux Tyranids.
 */
function initializeTyranidGameplay() {
    // La logique d'écouteur est maintenant gérée directement dans `main.js` au moment du clic sur une planète,
    // car elle dépend du contexte (le joueur qui regarde, la planète cliquée, etc.).
    // Cela évite d'avoir des écouteurs d'événements globaux complexes ici.
}