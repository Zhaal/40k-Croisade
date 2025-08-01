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

const tyranidCrusadeRules = {
    biomorphologies: [
        { name: "Glandes Surrénales Accélérées", desc: "Ajoutez 1\" à la caractéristique de Mouvement de cette unité. Si l'unité a l'aptitude AVANCE, ajoutez 1 à ses jets d'Avance.", biomassCost: 10, crusadePointCost: 1 },
        { name: "Sacs à Toxines Virulents", desc: "Les armes de mêlée de cette unité (hors MONSTRE et VÉHICULE) gagnent l'aptitude [TOUCHES FATALES].", biomassCost: 15, crusadePointCost: 1 },
        { name: "Carapace Chitineuse Renforcée", desc: "Améliorez de 1 la caractéristique de Sauvegarde de cette unité (jusqu'à un maximum de 3+).", biomassCost: 20, crusadePointCost: 1 },
        { name: "Griffes et Dents Acérées", desc: "Améliorez de 1 la caractéristique de Pénétration d'Armure des armes de mêlée de cette unité.", biomassCost: 15, crusadePointCost: 1 },
        { name: "Instincts de Prédateur Alpha", desc: "Une fois par bataille, cette unité peut être la cible du stratagème Intervention Héroïque pour 0 PC.", biomassCost: 10, crusadePointCost: 1 },
        { name: "Camouflage Chéphalopodique", desc: "Les figurines de cette unité ont l'aptitude Discrétion.", biomassCost: 20, crusadePointCost: 1 },
        { name: "Sang Acide", desc: "Chaque fois qu'une attaque de mêlée est allouée à une figurine de cette unité, après que l'unité attaquante a résolu ses attaques, pour chaque figurine détruite dans cette unité, jetez un D6. Sur 5+, l'unité attaquante subit 1 blessure mortelle.", biomassCost: 15, crusadePointCost: 1 }
    ]
};


//======================================================================
//  2. LOGIQUE DE GAMEPLAY DES TYRANIDS
//======================================================================

/**
 * Attribue les données initiales spécifiques à la faction Tyranide.
 * @param {object} newPlayer - L'objet joueur en cours de création.
 */
function initializeTyranidData(newPlayer) {
    newPlayer.biomassPoints = 0;
}

/**
 * Gère les clics sur les boutons +/- pour les stats des Tyranids.
 * @param {object} player - L'objet joueur actif.
 * @param {string} stat - Le nom de la statistique à modifier ('biomass').
 * @param {number} change - La valeur du changement (+1 ou -1).
 */
function handleTyranidTallyButtons(player, stat, change) {
    if (stat === 'biomass') {
        player.biomassPoints = Math.max(0, (player.biomassPoints || 0) + change);
        renderPlayerDetail();
        saveData();
    }
}

/**
 * Met à jour la modale d'unité avec les actions spécifiques aux Tyranids (Biomorphologies).
 * @param {object} unit - L'objet unité consulté.
 * @param {object} player - Le joueur qui consulte.
 */
function updateUnitModalForTyranids(unit, player) {
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
}

/**
 * Met en place tous les écouteurs d'événements spécifiques aux Tyranids.
 */
function initializeTyranidGameplay() {
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
}