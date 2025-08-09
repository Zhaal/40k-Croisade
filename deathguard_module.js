// DeathGuard_module.js
// Ce fichier fusionne les règles (données) et le gameplay (logique)
// pour la faction de la Death Guard.

//======================================================================
//  1. RÈGLES ET DONNÉES DE LA DEATH GUARD
//======================================================================

const deathGuardUnits = [
    { name: "Biologus Putréfacteur", cost: 45 },
    { name: "Chenillé Crachepeste", cost: 195 },
    { name: "Chirurgien de la Peste", cost: 50 },
    { name: "Corrupteur Nidoreux", cost: 60 },
    { name: "Délabreur Délétère", cost: 50 },
    { name: "Drone Fétide", cost: 90 },
    { name: "Drone Fétide avec Lance-peste Lourd", cost: 100 },
    { name: "Essaimeur Répugnant", cost: 60 },
    { name: "Exhausteur Pandémique", cost: 105 },
    { name: "Intendant", cost: 40 },
    { name: "Land Raider du Chaos", cost: 240 },
    { name: "Marines de la Peste", cost: 95 },
    { name: "Métabrutus", cost: 115 },
    { name: "Mortarion", cost: 380 },
    { name: "Porte-icône", cost: 45 },
    { name: "Predator Annihilator du Chaos", cost: 135 },
    { name: "Predator Destructor du Chaos", cost: 145 },
    { name: "Prince Démon de Nurgle", cost: 195 },
    { name: "Prince Démon de Nurgle ailé", cost: 195 },
    { name: "Profanateur", cost: 165 },
    { name: "Rejetons du Chaos de Nurgle", cost: 80 },
    { name: "Rhino du Chaos", cost: 85 },
    { name: "Seigneur de la Contagion", cost: 110 },
    { name: "Seigneur de la Virulence", cost: 90 },
    { name: "Seigneur des Véroles", cost: 75 },
    { name: "Semi-chenillés Méphitiques", cost: 90 },
    { name: "Terminators du Linceul", cost: 40 },
    { name: "Terminators Rouillarques", cost: 115 },
    { name: "Typhus", cost: 90 },
    { name: "Véroleux", cost: 60 }
];

const deathGuardDetachments = [
    { group: "Champions de la Contagion", name: "Cornucophagus", cost: 35 },
    { group: "Champions de la Contagion", name: "Ingrédient Final", cost: 20 },
    { group: "Champions de la Contagion", name: "Seringue de Nurgle", cost: 25 },
    { group: "Champions de la Contagion", name: "Visions de Virulence", cost: 15 },
    { group: "Élus du Seigneur de la Mort", name: "Heaume du Roi des Mouches", cost: 20 },
    { group: "Élus du Seigneur de la Mort", name: "Talisman Maleputride", cost: 30 },
    { group: "Élus du Seigneur de la Mort", name: "Vigueur Infecte", cost: 15 },
    { group: "Élus du Seigneur de la Mort", name: "Visage de la Mort", cost: 10 },
    { group: "Invocateurs d'Intendance", name: "Affrécolteur", cost: 10 },
    { group: "Invocateurs d'Intendance", name: "Fléau du Fanal", cost: 20 },
    { group: "Invocateurs d'Intendance", name: "Glas Entropique", cost: 15 },
    { group: "Invocateurs d'Intendance", name: "Grimoire des Bienfaits Abondants", cost: 20 },
    { group: "Marteau de Mortarion", name: "Familier Hurlever", cost: 15 },
    { group: "Marteau de Mortarion", name: "Fléau de Gerbe-bile", cost: 10 },
    { group: "Marteau de Mortarion", name: "Eil de l'Affliction", cost: 20 },
    { group: "Marteau de Mortarion", name: "Vrilleseffluves", cost: 20 },
    { group: "Ost Vermoulu", name: "Brume Vermineuse", cost: 15 },
    { group: "Ost Vermoulu", name: "Essaim Revigorant", cost: 10 },
    { group: "Ost Vermoulu", name: "Murmure d'insectes", cost: 20 },
    { group: "Ost Vermoulu", name: "Voile de Peste", cost: 25 },
    { group: "Vectorium de la Pourriture Titubante", name: "Biniou Gâté", cost: 25 },
    { group: "Vectorium de la Pourriture Titubante", name: "Seigneur de la Vérole Ambulante", cost: 15 },
    { group: "Vectorium de la Pourriture Titubante", name: "Talisman d'Éclosion", cost: 25 },
    { group: "Vectorium de la Pourriture Titubante", name: "Tristesiphon", cost: 10 },
    { group: "Vectorium Virulent", name: "Archi-contaminateur", cost: 25 },
    { group: "Vectorium Virulent", name: "Arme-démon de Nurgle", cost: 10 },
    { group: "Vectorium Virulent", name: "Fourneau des Pestes", cost: 25 },
    { group: "Vectorium Virulent", name: "Régénération Révulsante", cost: 20 }
];

const deathGuardCrusadeRules = {
    planetBaseStats: {
        "Monde Mort":           { fecundity: 1, population: 1, vulnerability: 2, adequation: 10 },
        "Monde Sauvage":        { fecundity: 3, population: 2, vulnerability: 4, adequation: 10 },
        "Agri-monde":           { fecundity: 4, population: 2, vulnerability: 1, adequation: 10 },
        "Monde Forge":          { fecundity: 1, population: 3, vulnerability: 3, adequation: 10 },
        "Monde Ruche":          { fecundity: 2, population: 4, vulnerability: 2, adequation: 10 },
        "Monde Saint (relique)":{ fecundity: 2, population: 1, vulnerability: 4, adequation: 10 }
    },

    // CORRIGÉ : La structure lie maintenant la propriété et l'inconvénient, conformément aux nouvelles règles.
    pathogenTutelaryOptions: [
        { 
            name: "Pourriture", 
            desc: "À chaque attaque de cette figurine avec une arme à Touche Fatales, un jet de Touche non modifié de 5+ cause une Touche Critique.",
            inconvenient: "Soustrayez 3 à la caractéristique de Force des armes à Touches Fatales que cette figurine est équipée."
        },
        { 
            name: "Hypervecteur", 
            desc: "À votre phase de Tir, après que cette figurine a tiré, choisissez 1 unité ennemie touchée par une ou plusieurs de ses attaques à Touches Fatales. Jusqu'à la fin de la bataille, l'unité ennemie est Affligée. Par tour, une seule figurine de chaque unité peut utiliser cette aptitude.",
            inconvenient: "Soustrayez 1 à la caractéristique d'Attaques des armes de tir à Touches Fatales que cette figurine est équipée."
        },
        { 
            name: "Implantation Parasitaire", 
            desc: "Le bonus à Touches Fatales dont cette figurine est équipée ont l'aptitude [TOUCHES SOUTENUES 1].",
            inconvenient: "À chaque attaque de cette figurine avec une arme à Touches Fatales, vous ne pouvez pas relancer le jet de Touche."
        },
        { 
            name: "Écoulement Ignoble", 
            desc: "À la phase de Combat, après que l'unité de cette figurine a combattu, si cette figurine a réussi une ou plusieurs attaques à Touches Fatales, choisissez 1 unité ennemie touchée. Chaque figurine de l'unité doit faire un test d'Ébranlement. Une seule figurine par unité peut utiliser cette aptitude.",
            inconvenient: "Aucun."
        },
        { 
            name: "Vérole Prolifique", 
            desc: "Si une ou plusieurs unités ont été détruites par leurs attaques à Touches Fatales alors que votre Pathogène est actif, la première fois après cette bataille que vous ajoutez une unité de Véroleux, elle gagne 6PX.",
            inconvenient: "Aucun."
        }
    ],

    // CORRIGÉ : La table des bienfaits a été entièrement mise à jour pour correspondre aux nouvelles règles D33.
    boonsOfNurgle: [
        { roll: "11", name: "Vitalité Fébrile", desc: "Ajoutez 1 à la caractéristique de Mouvement des figurines de l'unité de cette figurine." },
        { roll: "12", name: "Membres Sinueux", desc: "Ajoutez 1 aux jets d'Avance et de Charge pour le porteur de cette figurine." },
        { roll: "13", name: "Tentacules Grouillants", desc: "Ajoutez 1 à la caractéristique d'Attaques (A) des armes de mêlée dont cette figurine est équipée." },
        { roll: "21", name: "Hideusement Enflé", desc: "Ajoutez 2 à la caractéristique de Points de vie (W) de cette figurine." },
        { roll: "22", name: "Insensibilité Lépreuse", desc: "Cette figurine a l'aptitude Insensible à la Douleur 5+." },
        { roll: "23", name: "Voile de Mouches", desc: "Les figurines de l'unité de cette figurine ont l'aptitude Discrétion." },
        { roll: "31", name: "Contact Putréfiant", desc: "Améliorez de 1 la caractéristique de Pénétration d'armure (AP) des armes de mêlée dont cette figurine est équipée." },
        { roll: "32", name: "Pestevision", desc: "À chaque attaque de cette figurine qui cible une unité Affligée, vous pouvez relancer le jet de touche." },
        { roll: "33", name: "Tourbillon de Miasmes", desc: "Ajoutez 6\" à la Portée de Contagion de cette figurine." }
    ],

    // NOUVEAU : Ajout des Bénédictions de Nurgle liées au système de Grande Peste.
    nurgleBlessings: [
        { name: "Vigueur Florissante", desc: "Après chaque bataille de Croisade, vous pouvez ignorer votre premier test de 'Hors de Combat' raté." },
        { name: "Œil de Nurgle", desc: "Après chaque bataille de Croisade, jetez 1D6, en ajoutant 1 au résultat si vous avez gagné la bataille. Sur 6+, choisissez 1 unité supplémentaire qui est Promise à la Grandeur." },
        { name: "Ferveur Féconde", desc: "Après chaque bataille de Croisade, chaque unité de Ligne votre force de Croisade qui n'a pas été détruite à la bataille gagne 2PX." },
        { name: "Poisons Suintants", desc: "Quand une unité gagne l'Honneur de Bataille Modification d'arme, vous pouvez choisir que cette arme gagne [TOUCHES FATALES] au lieu de lui générer une Modification d'Arme au hasard." },
        { name: "Moisson sans Fin", desc: "Après chaque bataille de Croisade, jetez 1 dé. Sur 4+, vous gagnez 1 point de Réquisition supplémentaire." },
        { name: "Vile Possession", desc: "Chaque fois que vous ajoutez une unité de VÉHICULE à votre force de Croisade, ajoutez le mot-clé DÉMON, elle gagne immédiatement 6PX (rang Éprouvé) et choisissez-lui un Honneur de Bataille normalement." }
    ],
    
    // CORRIGÉ : Mise à jour des Intentions.
    intents: [
        { 
            name: "Semer les Graines de la Corruption", 
            desc: "Au début de la bataille, choisissez un pion d'objectif. À la fin de votre tour, pour chaque unité de PERSONNAGE ou VECTEUR DRONE que vous contrôlez et qui est à portée d'un pion d'objectif, si l'unité n'est pas Ébranlée, vous gagnez 1PX (max 3PX par unité)." 
        },
        { 
            name: "Vecteurs Malveillants", 
            desc: "À la fin de la bataille, jetez 1D6 pour chaque unité ennemie détruite au résultat 1 sur le tableau des blessures de combat. Sur 5+, baissez de 1 le Taux de Survie de votre peste, et choisissez 1 unité de votre armée qui a survécu pour gagner 3PX."
        },
        {
            name: "Moisson Virale",
            desc: "Au début de votre phase de Tir, choisissez 1 unité d'INFANTERIE DG éligible à portée d'un objectif. Sur 4+, elle peut 'clamer le vecteur'. À la fin de votre tour, si elle est toujours à portée, elle gagne 1PX (max 3PX). À la fin de la bataille, jetez 1D6 + nombre de succès (max +3), et augmentez l'Adaptabilité de votre peste du résultat."
        },
        {
            name: "Infâme Recherche",
            desc: "Chaque fois qu'une unité DG détruit une unité ennemie, gagnez 1PX de recherche (max 3PX par unité). À la fin de la bataille, si votre total est 1-3, vous pouvez 'Adapter les Toxines'. S'il est de 4+, vous pouvez le faire deux fois."
        }
    ],
    
    // CORRIGÉ : Mise à jour des Réquisitions.
    requisitions: [
        { name: "Sublimation Souillée (1 PR)", desc: "À la fin d'une bataille, au lieu de jeter sur un tableau de séquelles, vous pouvez choisir que l'unité reçoive un Don de Nurgle (Bienfait de Nurgle)." },
        { name: "Ascension Putride (2 PR)", desc: "Quand une unité PERSONNAGE (hors PRINCE DÉMON/LÉGENDAIRE) gagne la Séquelle 'Dégénérescence', remplacez-la par un PRINCE DÉMON. Il conserve l'équipement, les honneurs et les PX." },
        { name: "Mise en Culture Soignée (2 PR)", desc: "À la fin d'une bataille, avant la Voie de la Contagion, la prochaine fois, résolvez l'étape de 'Mise en Culture' deux fois." },
        { name: "Fruits du Chaudron (1 PR)", desc: "À la fin d'une bataille, vous pouvez 'Adapter les Toxines'." },
        { name: "Rémission Simulée (1 PR)", desc: "À la fin d'une bataille, si vous avez perdu, jetez 1D6. Sur 5+, ajoutez 1 à la Densité de Population de votre monde." },
        { name: "Puissance Misaimable (2 PR)", desc: "Avant une bataille, un VÉHICULE avec la Séquelle 'Épave' la perd et gagne le Trait de Bataille 'Épave' à la place." }
    ],

    // CORRIGÉ : Mise à jour des Reliques.
    relics: {
        artificer: [
            { name: "Encensoir Munificent", desc: "Chaque fois que le porteur utilise son aptitude Destruction Néfaste, vous pouvez relancer le jet de dé. De plus, les blessures mortelles ne sont infligées que si la cible est à 2\" ou moins.", cost: 1 },
            { name: "Ronge-grimoire", desc: "Chaque fois que le porteur est affecté par une Séquelle de Combat, il se sépare de l'unité. Chaque fois qu'il gagne un Point de Réquisition, vous pouvez lui faire perdre 1 point de Séquelle.", cost: 1 },
            { name: "Armure Putréforgée", desc: "Le porteur a une caractéristique de Sauvegarde de 2+.", cost: 1 }
        ],
        antique: [
            { name: "Orbe du Déclin", desc: "Une fois par bataille, au début de la phase de Tir de votre adversaire, choisissez une unité ennemie à 18\" et lancez 6D6 ; pour chaque 4+, l'unité subit 1 blessure mortelle." , cost: 2 },
            { name: "Coffret de Corruption", desc: "À la fin de la bataille, si le porteur est sur le champ de bataille, gagnez D3 Points de Contagion. Si vous avez gagné et détruit une unité dans la zone de déploiement adverse, la prochaine fois que vous suivez la Voie de la Contagion, vous pouvez relancer tous les jets.", cost: 2 }
        ],
        legendaire: [
             { name: "Cœur Putride", desc: "Le porteur a Inexorable et Insensible à la Douleur 5+. Augmentez sa Portée de Contagion de 3\". Une fois par bataille, dans votre phase de Commandement, le porteur peut augmenter la Portée de Contagion de toute l'armée de 3\" jusqu'à la fin de la bataille.", cost: 3 }
        ]
    },

    // CORRIGÉ : Mise à jour complète des tables de Traits de Bataille.
    battleTraits: {
        "INFANTERIE": [
            { name: "Giclecrasses (Résultat 1)", desc: "Chaque fois que cette unité effectue une attaque de mêlée, un jet de touche non modifié de 6 réussit automatiquement." },
            { name: "Brume Suffocante (Résultat 2)", desc: "Une fois par bataille, au début de la phase de tir adverse, cette unité peut faire un mouvement Normal, d'Avance ou de Retraite. Jusqu'à la fin de la phase, les attaques de tir qui la ciblent ont -1 pour toucher." },
            { name: "Cornes (Résultat 3)", desc: "Chaque fois que cette unité termine un mouvement de Charge, choisissez 1 unité ennemie à Portée d'Engagement. Pour chaque figurine de votre unité, sur 4+, l'ennemi subit 1 blessure mortelle." },
            { name: "Masse Impavide (Résultat 4)", desc: "Ajoutez 1 à la caractéristique de Capacité de Tir (BS) des armes de tir de cette unité." },
            { name: "Parasites de la Peste Guillerets (Résultat 5)", desc: "Les attaques à distance de cette unité ont l'aptitude [IGNORE LE COUVERT]." },
            { name: "Cils Frétillants (Résultat 6)", desc: "Chaque fois que vous utilisez le Stratagème 'Tir de Contre-charge' sur cette unité, des touches sont causées sur des jets de 5+ en plus des touches normales." }
        ],
        "DÉMON": [
            { name: "Bubons Infectieux (Résultat 1-2)", desc: "Chaque fois qu'une attaque de mêlée qui cible cette unité obtient un 1 ou 2 pour toucher, elle échoue." },
            { name: "Gerbespores (Résultat 3-4)", desc: "Chaque fois que cette unité termine un mouvement de Retraite, choisissez 1 unité ennemie qui était à Portée d'Engagement. Sur 4+, elle subit 1 blessure mortelle." },
            { name: "Souillure Brillante (Résultat 5-6)", desc: "À votre phase de Tir, après que cette unité a tiré, choisissez 1 unité ennemie touchée. Jusqu'à la fin du tour, chaque fois qu'un DÉMON DE NURGLE ami cible cette unité, relancez les jets de touche de 1." }
        ],
        "VÉHICULE": [
            { name: "Excroissances Blindées (Résultat 1-2)", desc: "À chaque attaque qui cible cette unité, si la Force de l'attaque est supérieure à l'Endurance de l'unité, soustrayez 1 au jet de blessure." },
            { name: "Maladies Magistrales (Résultat 3-4)", desc: "Ajoutez 6\" à la portée des armes de cette unité. (Relancez si l'unité n'a pas d'armes de tir à Touches Fatales)." },
            { name: "Membres Grouillants (Résultat 5-6)", desc: "Lors d'un mouvement normal, d'avance ou de retraite, cette unité peut se déplacer à travers les figurines ennemies. Les figurines ennemies ne peuvent pas finir un mouvement à Portée d'Engagement de cette unité sans réussir un test de Fuite Désespérée." }
        ]
    },

    simplePathogens: {
        vectors: [
            { name: "Chancre Gangreneux", desc: "Si une unité est détruite par une attaque de mêlée de l'unité affectée, le Don de Contagion peut se propager à une autre unité ennemie à 6\"." },
            { name: "Spores Miasmiques", desc: "La portée de l'aptitude Don de Contagion de cette unité est augmentée à 9\"." },
            { name: "Pourriture Évolutive", desc: "À la fin de votre tour, si l'unité affectée est à portée d'un pion Objectif, elle subit 1 blessure mortelle." }
        ],
        symptoms: [
            { name: "Atrophie Musculaire", desc: "Soustrayez 1 à la caractéristique de Force des figurines de l'unité affectée." },
            { name: "Nécrose Cutanée", desc: "Chaque fois qu'une figurine de l'unité affectée attaque, un jet de touche de 1 met fin à sa séquence d'attaque." },
            { name: "Hémorragie Interne", desc: "Soustrayez 1 aux jets d'Avance et de Charge pour l'unité affectée." }
        ]
    }
};


//======================================================================
//  2. LOGIQUE DE GAMEPLAY DE LA DEATH GUARD
//======================================================================

/**
 * Attribue les données initiales spécifiques à une faction lors de la création d'un joueur.
 * @param {object} newPlayer - L'objet joueur en cours de création.
 */
function initializeDeathGuardData(newPlayer) {
    if (newPlayer.faction === 'Death Guard') {
        newPlayer.deathGuardData = {
            contagionPoints: 0,
            pathogenPower: 1,
            corruptedPlanetIds: [],
            pathogenProperties: [], // Noms des propriétés acquises
            pathogenDrawbacks: [], // Noms des inconvénients acquis
            plagueStats: { reproduction: 1, survival: 1, adaptability: 1 }
        };
    }
}


/**
 * Gère les clics sur les boutons +/- pour les stats de la Death Guard.
 * @param {object} player - L'objet joueur actif.
 * @param {string} stat - Le nom de la statistique à modifier ('contagion').
 * @param {number} change - La valeur du changement (+1 ou -1).
 */
function handleDeathGuardTallyButtons(player, stat, change) {
    if (stat === 'contagion') {
        player.deathGuardData.contagionPoints = Math.max(0, (player.deathGuardData.contagionPoints || 0) + change);
        renderPlayerDetail();
        saveData();
    }
}

/**
 * Met à jour la modale de planète avec les actions spécifiques à la Death Guard.
 * @param {object} planet - L'objet planète consulté.
 * @param {object} viewingPlayer - L'objet du joueur qui consulte.
 */
function updatePlanetModalForDeathGuard(planet, viewingPlayer) {
    const planetTypeForm = document.getElementById('planet-type-form');
    const existingContainer = document.getElementById('planet-plague-actions');
    if (existingContainer) existingContainer.remove();

    if (viewingPlayer.faction !== 'Death Guard') return;

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
        const cost = 1; // Le coût est de 1 PC selon la règle "Semer les Graines"
        infectBtn.textContent = `Infecter la Planète (${cost} PC)`;
        infectBtn.onclick = () => infectPlanet(planet.id);
        container.appendChild(infectBtn);
    }
    planetTypeForm.appendChild(container);
}


/**
 * Gère l'action d'infecter une planète.
 * @param {string} planetId - L'ID de la planète à infecter.
 */
function infectPlanet(planetId) {
    const player = campaignData.players.find(p => p.id === mapViewingPlayerId);
    const cost = 1;

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
                }
            }
            logAction(player.id, `A infecté la planète <b>${planet.name}</b> pour ${cost} PC.`, 'info', '☣️');
            break; 
        }
    }

    saveData();
    renderPlayerDetail();
    renderPlanetarySystem(currentlyViewedSystemId);
    closeModal(document.getElementById('planet-type-modal'));
    showNotification("La planète a été infectée ! Vous pouvez maintenant gérer la peste.", 'success');
}

/**
 * Ouvre et prépare la modale de gestion de la peste.
 * @param {string} planetId - L'ID de la planète concernée.
 */
function openPlagueManagementModal(planetId) {
    const plagueManagementModal = document.getElementById('plague-management-modal');
    plagueManagementModal.dataset.planetId = planetId;
    closeModal(document.getElementById('planet-type-modal'));

    const player = campaignData.players.find(p => p.id === mapViewingPlayerId);
    const system = campaignData.systems.find(s => s.planets.some(p => p.id === planetId));
    const planet = system ? system.planets.find(p => p.id === planetId) : null;
    if (!player || !planet) return;

    document.getElementById('plague-modal-title').textContent = `Guerre Bactériologique sur ${planet.name}`;
    document.getElementById('planet-fecundity').textContent = planet.fecundity || 'N/A';
    document.getElementById('planet-population').textContent = planet.populationDensity || 'N/A';
    document.getElementById('planet-vulnerability').textContent = planet.vulnerability || 'N/A';
    
    const plagueStats = player.deathGuardData.plagueStats;
    document.getElementById('player-plague-reproduction').textContent = plagueStats.reproduction;
    document.getElementById('player-plague-survival').textContent = plagueStats.survival;
    document.getElementById('player-plague-adaptability').textContent = plagueStats.adaptability;

    const totalPeste = (planet.fecundity || 0) + plagueStats.reproduction +
                       (planet.populationDensity || 0) + plagueStats.survival +
                       (planet.vulnerability || 0) + plagueStats.adaptability;
                       
    document.getElementById('total-peste-value').textContent = totalPeste;

    // CORRIGÉ : Le programme suit une règle simplifiée. La condition reste sur 7+.
    // La complexité de la "Voie de la Contagion" n'est pas implémentée.
    const conquerBtn = document.getElementById('conquer-plague-btn');
    conquerBtn.disabled = totalPeste < 7;
    
    openModal(plagueManagementModal);
}

// NOUVELLE FONCTION AJOUTÉE
/**
 * Affiche une modale permettant au joueur de choisir quelle caractéristique de la peste améliorer.
 * @param {object} player - L'objet joueur Death Guard.
 * @returns {Promise<string|null>} - L'ID de la caractéristique à améliorer ou null si annulé.
 */
async function showUpgradeChoiceModal(player) {
    return new Promise(resolve => {
        const modal = document.createElement('div');
        modal.className = 'modal';
        const cost = 5;
        const canAfford = player.deathGuardData.contagionPoints >= cost;
        const canUpgradePathogen = player.deathGuardData.pathogenPower < 7; // CORRIGÉ : La nouvelle limite est 7

        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <h3>Améliorer la Peste / Élaborer un Variant</h3>
                <p>Choisissez une option. L'amélioration des Taux coûte 5 Points de Contagion.</p>
                
                <div class="form-group">
                    <label>
                        <input type="radio" name="plague_upgrade" value="pathogenPower" ${!canUpgradePathogen ? 'disabled' : 'checked'}>
                        Élaborer un Variant (Gratuit)
                        <small style="display:block; color: var(--text-muted-color);">Puissance actuelle: ${player.deathGuardData.pathogenPower}/7. Permet d'ajouter une Durée ou une Propriété.</small>
                    </label>
                </div>
                <hr>
                <div class="form-group">
                    <label>
                        <input type="radio" name="plague_upgrade" value="reproduction" ${!canAfford ? 'disabled' : (canUpgradePathogen ? '' : 'checked')}>
                        Améliorer le Taux de Reproduction (${cost} PC)
                        <small style="display:block; color: var(--text-muted-color);">Niveau actuel: ${player.deathGuardData.plagueStats.reproduction}/6.</small>
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="radio" name="plague_upgrade" value="survival" ${!canAfford ? 'disabled' : ''}>
                        Améliorer le Taux de Survie (${cost} PC)
                        <small style="display:block; color: var(--text-muted-color);">Niveau actuel: ${player.deathGuardData.plagueStats.survival}/6.</small>
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="radio" name="plague_upgrade" value="adaptability" ${!canAfford ? 'disabled' : ''}>
                        Améliorer l'Adaptabilité (${cost} PC)
                        <small style="display:block; color: var(--text-muted-color);">Niveau actuel: ${player.deathGuardData.plagueStats.adaptability}/6.</small>
                    </label>
                </div>

                <div class="modal-actions">
                    <button id="confirm-upgrade-btn" class="btn-primary">Confirmer</button>
                </div>
            </div>`;
        document.body.appendChild(modal);

        const closeModalFunc = (value = null) => { modal.remove(); resolve(value); };

        modal.querySelector('.close-btn').onclick = () => closeModalFunc();
        modal.querySelector('#confirm-upgrade-btn').onclick = () => {
            const selected = modal.querySelector('input[name="plague_upgrade"]:checked');
            if (selected) {
                closeModalFunc(selected.value);
            } else {
                showNotification("Veuillez choisir une option.", 'warning');
            }
        };
    });
}


/**
 * Ouvre la modale pour l'amélioration du pathogène.
 * @param {object} player - L'objet joueur Death Guard.
 */
async function showPathogenUpgradeModal(player) {
    return new Promise(resolve => {
        const modal = document.createElement('div');
        modal.className = 'modal';

        // CORRIGÉ : Utilise la nouvelle structure de données pour les options
        let pathogenOptionsHTML = deathGuardCrusadeRules.pathogenTutelaryOptions
            .map(opt => `<option value="${opt.name}">${opt.name}</option>`).join('');

        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <h3>Élaborer un Pathogène</h3>
                <p>Pour augmenter votre Puissance du Pathogène, vous devez choisir une nouvelle Propriété. Son Inconvénient associé sera automatiquement ajouté.</p>
                <div class="form-group">
                    <label for="pathogen-option-select">Choisir une Propriété :</label>
                    <select id="pathogen-option-select">${pathogenOptionsHTML}</select>
                </div>
                <div id="pathogen-info" style="font-style: italic; color: var(--text-muted-color); border-left: 2px solid #444; padding-left: 10px;">
                    <p><b>Propriété:</b> <span id="prop-desc"></span></p>
                    <p><b>Inconvénient:</b> <span id="inconv-desc"></span></p>
                </div>
                <div class="modal-actions">
                    <button id="confirm-pathogen-btn" class="btn-primary">Confirmer l'Élaboration</button>
                </div>
            </div>`;
        document.body.appendChild(modal);

        const select = modal.querySelector('#pathogen-option-select');
        const propDescEl = modal.querySelector('#prop-desc');
        const inconvDescEl = modal.querySelector('#inconv-desc');
        
        const updateDescription = () => {
            const selectedOption = deathGuardCrusadeRules.pathogenTutelaryOptions.find(opt => opt.name === select.value);
            if(selectedOption) {
                propDescEl.textContent = selectedOption.desc;
                inconvDescEl.textContent = selectedOption.inconvenient;
            }
        };
        select.addEventListener('change', updateDescription);
        updateDescription(); // Initial display

        const closeModalFunc = (value = null) => { modal.remove(); resolve(value); };
        modal.querySelector('.close-btn').onclick = () => closeModalFunc();
        
        modal.querySelector('#confirm-pathogen-btn').onclick = () => {
            const property = select.value;
            const option = deathGuardCrusadeRules.pathogenTutelaryOptions.find(opt => opt.name === property);
            closeModalFunc({ property: option.name, inconvenient: option.inconvenient });
        };
    });
}


/**
 * Met en place tous les écouteurs d'événements spécifiques à la Death Guard.
 */
function initializeDeathGuardGameplay() {

    document.getElementById('upgrade-plague-btn').addEventListener('click', async () => {
        if (activePlayerIndex === -1) return;
        const player = campaignData.players[activePlayerIndex];
        if (!player.deathGuardData) return;

        const upgradeId = await showUpgradeChoiceModal(player);
        if (!upgradeId) return;

        if (upgradeId === 'pathogenPower') {
            if (player.deathGuardData.pathogenPower >= 7) { // CORRIGÉ: Limite à 7
                showNotification("La Puissance du Pathogène est déjà au maximum.", "info");
                return;
            }
            const choice = await showPathogenUpgradeModal(player);
            if (!choice) return;
            const { property } = choice;
            if (await showConfirm("Confirmer la Mutation", `Voulez-vous élaborer ce pathogène avec la propriété <b>${property}</b> ?<br><br>Cela augmentera votre Puissance du Pathogène à ${player.deathGuardData.pathogenPower + 1}.`)) {
                player.deathGuardData.pathogenPower++;
                player.deathGuardData.pathogenProperties.push(property);
                logAction(player.id, `A augmenté sa Puissance du Pathogène à ${player.deathGuardData.pathogenPower}.`, 'info', '☣️');
                saveData();
                renderPlayerDetail();
                showNotification("La Peste a muté avec succès !", 'success');
            }
        } else {
            const cost = 5;
            if (player.deathGuardData.contagionPoints < cost) {
                showNotification("Points de Contagion insuffisants.", "error");
                return;
            }
            if (await showConfirm("Confirmer la Mutation", `Voulez-vous améliorer cette caractéristique pour <b>${cost} PC</b> ?`)) {
                player.deathGuardData.contagionPoints -= cost;
                player.deathGuardData.plagueStats[upgradeId]++;
                const statName = {reproduction: 'Reproduction', survival: 'Survie', adaptability: 'Adaptabilité'}[upgradeId];
                logAction(player.id, `A augmenté son <b>${statName}</b> pour ${cost} PC.`, 'info', '☣️');
                saveData();
                renderPlayerDetail();
                showNotification(`Caractéristique ${statName} améliorée !`, 'success');
            }
        }
    });

    document.getElementById('conquer-plague-btn').addEventListener('click', async () => {
        if (activePlayerIndex === -1) return;
        const player = campaignData.players[activePlayerIndex];
        const cost = 1;
    
        if (player.requisitionPoints < cost) {
            showNotification(`Points de Réquisition insuffisants (${cost} PR requis).`, 'error');
            return;
        }
    
        const title = "Résultat de la Concrétisation";
        // CORRIGÉ : Le texte de la modale est adapté pour refléter la simplification du programme
        const text = `Vous allez dépenser <b>1 PR</b>. Le programme utilise une règle simplifiée : Lancez 1D6. Si le résultat est supérieur à votre Puissance du Pathogène (${player.deathGuardData.pathogenPower}), c'est un succès. Quel a été votre résultat ?`;
        
        const d6RollStr = prompt(text, "4");
        if (d6RollStr === null) return;
        const rollResult = parseInt(d6RollStr);

        if (isNaN(rollResult) || rollResult < 1 || rollResult > 6) {
            showNotification("Veuillez entrer un résultat de dé valide (1-6).", "warning");
            return;
        }
        
        closeModal(document.getElementById('plague-management-modal'));
        player.requisitionPoints -= cost;

        if (rollResult > player.deathGuardData.pathogenPower) {
             let rewardText = `<b>Succès !</b> La peste s'est concrétisée. Selon les règles de la 'Voie de la Contagion', vous gagnez des récompenses basées sur le 'Score d'Adéquation'.<br><br>Le programme n'automatise pas cette étape. Veuillez consulter vos règles pour appliquer la récompense appropriée (ex: 5XP pour 'Chef-d'œuvre Chancreux', etc.).`;
             logAction(player.id, `<b>Succès !</b> Peste concrétisée (Jet ${rollResult} > Puissance ${player.deathGuardData.pathogenPower}).`, 'success', '☣️');
             await showConfirm("Succès !", rewardText);
             showNotification("N'oubliez pas d'appliquer manuellement les récompenses de la Voie de la Contagion !", 'info', 10000);
            
        } else {
            const pointsLost = Math.ceil(player.deathGuardData.contagionPoints / 2);
            player.deathGuardData.contagionPoints -= pointsLost;
            logAction(player.id, `<b>Échec...</b> La peste n'a pas pu se concrétiser (Jet ${rollResult}). Perte de ${pointsLost} PC.`, 'error', '☣️');
            await showConfirm("Échec...", `La Peste n'a pas pu être concrétisée.<br><br>Vous perdez la moitié de vos Points de Contagion (-${pointsLost} PC).`);
        }
    
        saveData();
        renderPlayerDetail();
    });

    document.getElementById('adapt-toxins-btn').addEventListener('click', async () => {
        if (activePlayerIndex < 0) return;
        const player = campaignData.players[activePlayerIndex];
        const cost = 1; 

        if (player.faction !== 'Death Guard' || !player.deathGuardData) return;

        if (!player.deathGuardData.pathogenProperties || player.deathGuardData.pathogenProperties.length === 0) {
            showNotification("Vous n'avez aucune Propriété de pathogène à remplacer.", 'info');
            return;
        }

        if (player.requisitionPoints < cost) {
            showNotification(`Points de Réquisition insuffisants (coût: ${cost} PR).`, 'error');
            return;
        }

        const propertyToRemove = await choosePropertyToRemove(player);
        if (!propertyToRemove) return;

        const confirmed = await showConfirm(
            "Adapter les Toxines",
            `Voulez-vous dépenser <b>${cost} PR</b> pour remplacer la Propriété "<b>${propertyToRemove}</b>" ?<br><br>Vous choisirez ensuite une nouvelle Propriété (et son Inconvénient associé). La Puissance du Pathogène ne changera pas.`
        );
        if (!confirmed) return;

        const newPathogen = await showPathogenUpgradeModal(player);
        if (!newPathogen || !newPathogen.property) return;
        
        player.requisitionPoints -= cost;

        const propIndex = player.deathGuardData.pathogenProperties.indexOf(propertyToRemove);
        if (propIndex > -1) {
            player.deathGuardData.pathogenProperties.splice(propIndex, 1);
        }

        player.deathGuardData.pathogenProperties.push(newPathogen.property);

        logAction(player.id, `A adapté ses toxines pour 1 PR. A remplacé '${propertyToRemove}' par '${newPathogen.property}'.`, 'info', '☣️');

        saveData();
        renderPlayerDetail();
        showNotification("Le pathogène a été modifié avec succès !", 'success');
    });

    async function choosePropertyToRemove(player) {
        return new Promise(resolve => {
            const modal = document.createElement('div');
            modal.className = 'modal';

            let propertiesOptionsHTML = player.deathGuardData.pathogenProperties
                .map(p => `<option value="${p}">${p}</option>`).join('');

            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-btn">&times;</span>
                    <h3>Étape 1 : Choisir la Propriété à Remplacer</h3>
                    <div class="form-group">
                        <label for="property-to-remove-select">Propriété à retirer :</label>
                        <select id="property-to-remove-select">${propertiesOptionsHTML}</select>
                    </div>
                    <div class="modal-actions">
                        <button id="confirm-removal-btn" class="btn-primary">Confirmer</button>
                    </div>
                </div>`;
            document.body.appendChild(modal);

            const closeModalFunc = (value = null) => { modal.remove(); resolve(value); };
            modal.querySelector('.close-btn').onclick = () => closeModalFunc();
            modal.querySelector('#confirm-removal-btn').onclick = () => {
                const property = modal.querySelector('#property-to-remove-select').value;
                closeModalFunc(property);
            };
        });
    }

    // CORRIGÉ : Mise à jour de la logique pour gérer le jet D33 et la Séquelle "Dégénérescence" en cas de doublon.
    async function handleRollNurgleBoon(unit) {
        if (!unit) return;
        const player = campaignData.players[activePlayerIndex];
    
        const confirmed = await showConfirm(
            "Bienfait de Nurgle",
            `Refuser l'Honneur de Bataille standard pour lancer un dé sur la table des Bienfaits de Nurgle pour <b>${unit.name}</b> ?`
        );
    
        if (confirmed) {
            const boons = deathGuardCrusadeRules.boonsOfNurgle;
            
            // Simuler un jet D33
            const roll1 = Math.floor(Math.random() * 3) + 1;
            const roll2 = Math.floor(Math.random() * 3) + 1;
            const finalRoll = `${roll1}${roll2}`;
            const randomBoon = boons.find(b => b.roll === finalRoll);
    
            if (unit.battleHonours && unit.battleHonours.includes(randomBoon.name)) {
                // Le bienfait est un doublon, appliquer la Dégénérescence
                await showConfirm(
                    "Dégénérescence !",
                    `Résultat du jet : <b>${randomBoon.name}</b>. L'unité possède déjà ce bienfait !<br><br><b>${unit.name}</b> succombe à la Dégénérescence et devient une unité de <b>Rejetons du Chaos de Nurgle</b>. Elle conserve son XP, ses Honneurs et ses Séquelles.`
                );
                
                const oldName = unit.name;
                unit.name = "Rejetons du Chaos de Nurgle";
                unit.power = 80; // Coût des Rejetons DG
                unit.role = "Bête";
                
                logAction(player.id, `<b>${oldName}</b> a obtenu un Bienfait en double et a subi la <b>Dégénérescence</b>, devenant des Rejetons du Chaos.`, 'error', '☣️');
                closeModal(document.getElementById('unit-modal'));

            } else {
                // Ajouter le nouveau bienfait
                addUpgradeToUnitData(unit, 'unit-honours', randomBoon.name, randomBoon.desc, "Bienfait de Nurgle: ");
                unit.crusadePoints = (unit.crusadePoints || 0) + 1;
                document.getElementById('unit-crusade-points').value = unit.crusadePoints;
        
                logAction(player.id, `<b>${unit.name}</b> a reçu le bienfait de Nurgle : <i>${randomBoon.name}</i>.`, 'info', '☣️');
                showNotification(`${unit.name} a reçu le bienfait : ${randomBoon.name} !`, 'success');
            }
            
            saveData();
            renderPlayerDetail();
        }
    }

    // Attacher la nouvelle fonction au bouton (via un écouteur d'événements global pour la modale d'unité)
    document.getElementById('unit-modal').addEventListener('click', (e) => {
        if (e.target.id === 'add-nurgle-boon-btn') {
            if (activePlayerIndex > -1 && editingUnitIndex > -1) {
                const unit = campaignData.players[activePlayerIndex].units[editingUnitIndex];
                handleRollNurgleBoon(unit);
            }
        }
    });
}