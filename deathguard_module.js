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

    // ===================================================================
    // PATHOGÈNES ALCHIMIQUES
    // ===================================================================
    // La Puissance du Pathogène (max 7) est la somme de sa Durée (max 5),
    // du nombre de Propriétés et du nombre d'Inconvénients supprimés.
    // ===================================================================
    alchemicalPathogens: {
        properties: [
            { name: "Pourriture", desc: "À chaque attaque de cette figurine avec une arme à Touches Fatales, un jet de Touche non modifié de 5+ cause une Touche Critique.", inconvenient: "Soustrayez 3 à la caractéristique de Force des armes à Touches Fatales que cette figurine est équipée." },
            { name: "Hypervecteur", desc: "À votre phase de Tir, après que cette figurine a tiré, choisissez 1 unité ennemie touchée par une ou plusieurs de ses attaques à Touches Fatales. Jusqu'à la fin de la bataille, l'unité ennemie est Affligée. Par tour, une seule figurine de chaque unité peut utiliser cette aptitude.", inconvenient: "Soustrayez 1 à la caractéristique d'Attaques des armes de tir à Touches Fatales que cette figurine est équipée." },
            { name: "Implantation Parasitaire", desc: "Les bonus à Touches Fatales dont cette figurine est équipée ont l'aptitude [TOUCHES SOUTENUES 1].", inconvenient: "À chaque attaque de cette figurine avec une arme à Touches Fatales, vous ne pouvez pas relancer le jet de Touche." },
            { name: "Écoulement Ignoble", desc: "À la phase de Combat, après que l'unité de cette figurine a combattu, si cette figurine a réussi une ou plusieurs attaques à Touches Fatales, choisissez 1 unité ennemie touchée par une ou plusieurs attaques. Chaque figurine de l'unité doit faire un test d'Ébranlement. Par la suite, une seule figurine de chaque unité peut utiliser cette aptitude.", inconvenient: "Aucun." },
            { name: "Vérole Prolifique", desc: "Si une ou plusieurs unités ont été détruites par leurs attaques à Touches Fatales alors que votre Pathogène est actif, la première fois après cette bataille que vous ajoutez une unité de Véroleux, elle gagne 6PX.", inconvenient: "Aucun." }
        ]
    },

    // ===================================================================
    // BIENFAITS DE NURGLE (D33)
    // ===================================================================
    // Règle Dégénérescence : Si un Bienfait déjà possédé est obtenu, l'unité
    // subit la Séquelle de Combat Dégénérescence. Elle est retirée et
    // remplacée par une unité de REJETONS DU CHAOS avec les mêmes PX,
    // Honneurs et Séquelles.
    // ===================================================================
    boonsOfNurgle: [
        { roll: "11", name: "Vitalité Fébrile", desc: "Ajoutez 1 à la caractéristique de Mouvement des figurines de l'unité de cette figurine." },
        { roll: "12", name: "Membres Sinueux", desc: "Ajoutez 1 aux jets d'Avance et de Charge pour le porteur de cette figurine." },
        { roll: "13", name: "Tentacules Grouillantes", desc: "Ajoutez 1 à la caractéristique d'Attaques des armes de mêlée dont cette figurine est équipée." },
        { roll: "21", name: "Hideusement Enflé", desc: "Ajoutez 2 à la caractéristique de Points de vie de cette figurine." },
        { roll: "22", name: "Insensibilité Lépreuse", desc: "Cette figurine a l'aptitude Insensible à la Douleur 5+." },
        { roll: "23", name: "Voile de Mouches", desc: "Les figurines de l'unité de cette figurine ont l'aptitude Discrétion." },
        { roll: "31", name: "Contact Putréfiant", desc: "Améliorez de 1 la caractéristique de Pénétration d'armure des armes de mêlée dont cette figurine est équipée." },
        { roll: "32", name: "Pestevision", desc: "À chaque attaque de cette figurine qui cible une unité Affligée, vous pouvez relancer le jet de touche." },
        { roll: "33", name: "Tourbillon de Miasmes", desc: "Ajoutez 6\" à la Portée de Contagion de cette figurine." }
    ],

    // ===================================================================
    // GRANDE PESTE & VOIE DE LA CONTAGION
    // ===================================================================
    // Ces règles complexes ne sont pas entièrement implémentées dans la logique de l'application.
    // Les données ci-dessous servent de référence pour le joueur.
    // ===================================================================
    greatPlague: {
        adequationScoreRewards: [
            { range: "15-18", name: "Offrande Acceptable", desc: "Vous pouvez choisir 1 unité de PERSONNAGE de la DEATH GUARD afin qu'elle gagne 2PX. La prochaine fois que vous attaqué un monde en tentant de Concocter une Peste. Chaque fois que vous déterminer une caractéristique du monde, vous pouvez relancer un jet de 5 ou 6." },
            { range: "11-14", name: "Immonde Butin", desc: "Vous pouvez choisir 1 unité de PERSONNAGE de la DEATH GUARD de votre force de Croisade afin qu'elle gagne 2PX. De plus, vous pouvez choisir 1 unité de votre force de Croisade et lui donner le Trait de Bataille parmis ceux listés en page 122-123)." },
            { range: "7-10", name: "Redoutable Pestilence", desc: "Vous pouvez choisir 1 unité de PERSONNAGE de la DEATH GUARD de votre force de Croisade afin qu'elle gagne 3PX. De plus, votre force de Croisade peut choisir une des Bénédictions de Nurgle permanentes de la liste ci-contre." },
            { range: "3-6", name: "Chef-d'oeuvre Chancreux", desc: "Vous pouvez choisir 1 unité de votre force de Croisade. L'unité de votre force de Croisade que vous avez choisie gagne 5PX. De plus, votre force de Croisade peut choisir une des Bénédictions de Nurgle permanentes de la liste ci-contre." }
        ],
        nurgleBlessings: [
            { name: "Vigueur Florissante", desc: "Après chaque bataille de Croisade, vous pouvez ignorer votre premier test de 'Hors de Combat' raté." },
            { name: "Œil de Nurgle", desc: "Après chaque bataille de Croisade, jetez 1D6, en ajoutant 1 au résultat si vous avez gagné la bataille. Sur 6+, choisissez 1 unité supplémentaire qui est Promise à la Grandeur." },
            { name: "Ferveur Féconde", desc: "Après chaque bataille de Croisade, chaque unité de Ligne votre force de Croisade qui n'a pas été détruite à la bataille gagne 2PX." },
            { name: "Poisons Suintants", desc: "Quand une unité gagne l'Honneur de Bataille Modification d'arme, vous pouvez choisir que cette arme gagne [Touches Fatales] au lieu de lui générer une Modification d'Arme au hasard." },
            { name: "Moisson sans Fin", desc: "Après chaque bataille de Croisade, jetez 1 dé. Sur 4+, vous gagnez 1 point de Réquisition supplémentaire." },
            { name: "Vile Possession", desc: "Chaque fois que vous ajoutez une unité de Véhicule à votre force de Croisade, ajoutez le mot-clé Démon, elle gagne immédiatement 6PX (rang Eprouvé) et choisissez-lui un Honneur de Bataille normalement." }
        ]
    },
    
    // ===================================================================
    // INTENTIONS
    // ===================================================================
    intents: [
        { name: "SEMER LES GRAINES DE LA CORRUPTION", desc: "Au début de la bataille, choisissez un pion objectif dans votre zone de déploiement, un dans le No Man’s Land, et un dans la zone de déploiement adverse. À la fin de votre tour, pour chacun de ces pions d’objectif, si une ou plusieurs unités d’INFANTERIE de la DEATH GUARD de votre armée sont à portée de ce pion d’objectif, si aucune unité ennemie n’est à portée de lui, et s’il n’est pas ensemencé, ce pion d’objectif devient ensemencé, et choisissez 1 de ces unités afin qu’elle gagne 2 PEX. À la fin de la bataille, si des unités de votre armée ont ensemencé deux pions d’objectif, jetez 1 D6 : sur 4+, ajoutez 1 à la caractéristique de Fécondité de votre monde. Si des unités de votre armée ont ensemencé trois pions d’objectif, ajoutez 1 à la caractéristique de Fécondité de votre monde sans jeter de dé." },
        { name: "MOISSON VIRALE", desc: "Au début de la bataille, chaque pion d’objectif du No Man’s Land représente un Vecteur Cible. Au début de votre phase de Tir, choisissez 1 unité d’INFANTERIE de la DEATH GUARD de votre armée de Croisade (unités Ébranlées exclues) qui est éligible pour tirer et qui est à portée d’un ou plusieurs Vecteurs Cibles ; l’unité peut tenter d’exhumer 1 de ces Vecteurs Cibles. En ce cas, jusqu’à la fin de votre tour, l’unité n’est pas éligible pour tirer ni déclarer de charge. Si l’unité est à portée du Vecteur Cible choisi et qu’aucune unité ennemie n’est à portée de ce Vecteur Cible (AÉRODYNES exclus) à la fin de votre tour, l’unité gagne 1 PEX (jusqu’à un maximum de 3 PEX par unité). À la fin de la bataille, jetez 1 D6, en ajoutant 1 au résultat pour chaque tentative d’exhumation réussie : sur 7+, ajoutez 1 à la caractéristique d’Adaptabilité de votre peste." },
        { name: "VECTEURS MALGRÉ EUX", desc: "À la fin de la bataille, jetez 1 D6 pour chaque unité ennemie sur le champ de bataille, en ajoutant 2 au résultat si l’unité est en dessous de son Effectif Initial. S’il y a un ou plusieurs résultats de 6+, ajoutez 1 à la caractéristique de Taux de Survie de votre peste, et choisissez 1 unité de la DEATH GUARD de votre armée qui n’a pas été détruite. L’unité choisie gagne 3 PEX." },
        { name: "INFÂME RECHERCHE", desc: "Chaque fois qu’une unité de la DEATH GUARD de votre armée détruit une unité ennemie Affligée, ajoutez 1 à votre compte de recherche, et l’unité gagne 1 PEX (jusqu’à un maximum de 3 PEX par unité). À la fin de la bataille, si votre compte de recherche est 1-3, vous pouvez Adapter les Toxines (p. 120). Si votre compte de recherche est 4+, vous pouvez Adapter les Toxines deux fois." }
    ],
    
    // ===================================================================
    // RÉQUISITIONS
    // ===================================================================
    requisitions: [
        { name: "SUBLIMATION SOUILLÉE (1PR)", desc: "Achetez cette Réquisition à la fin d’une bataille, si vous avez gagné cette bataille. Vous pouvez Élaborer votre Variant (p. 120)." },
        { name: "FRUITS DU CHAUDRON (1PR)", desc: "Achetez cette Réquisition à la fin d’une bataille. Vous pouvez Adapter les Toxines (p. 120)." },
        { name: "RÉMISSION SIMULÉE (1PR)", desc: "Achetez cette Réquisition à la fin d’une bataille, si vous avez gagné cette bataille. Ajoutez 1 à la caractéristique de Densité de Population de votre monde." },
        { name: "MISE EN CULTURE SOIGNÉE (2PR)", desc: "Achetez cette Réquisition à la fin d’une bataille, avant de suivre la Voie de la Contagion. La prochaine fois que vous suivez la Voie de la Contagion, résolvez l’étape de Mise en Culture deux fois." },
        { name: "ASCENSION PUTRIDE (2PR)", desc: "Achetez cette Réquisition quand une unité de PERSONNAGE de la DEATH GUARD de votre force de Croisade (unités de DÉMONS exclues) qui a trois Bienfaits de Nurgle atteint le rang Héroïque ou Légendaire. Retirez l’unité de votre force de Croisade et remplacez-la par 1 PRINCE DÉMON de la DEATH GUARD ou PRINCE DÉMON ailé de la DEATH GUARD. La nouvelle unité a le même nombre d’Honneurs Bataille et de PEX que l’unité qu’elle a remplacée. La nouvelle figurine peut garder n’importe quels Bienfaits de Nurgle qu’avait l’unité qu’elle a remplacée, même si les figurines de DÉMON ne peuvent normalement pas avoir de Bienfaits de Nurgle. Aucune Séquelle de Combat qu’avait l’unité remplacée n’est conservée. Vous ne pouvez pas acheter cette Réquisition si, ce faisant, vous dépassez la Limite de Ressources de votre force de Croisade." },
        { name: "PUISSANCE MISÉRABLE (2PR)", desc: "Achetez cette Réquisition avant une bataille. Choisissez 1 unité de VÉROLEUX de votre armée de Croisade. Générez un Trait de Bataille pour l’unité, même si les unités de VÉROLEUX ne peuvent normalement pas avoir de Traits de Bataille. Jusqu’à la fin de la bataille, cette unité de VÉROLEUX a ce Trait de Bataille." }
    ],

    // ===================================================================
    // RELIQUES DE CROISADE
    // ===================================================================
    relics: {
        artificer: [
            { name: "ENCENSOIR MUNIFICENT", desc: "Chaque fois qu’une figurine amie avec l’aptitude Destruction Néfaste à 9\" du porteur est détruite, le porteur peut utiliser cette Relique de Croisade. En ce cas, ajoutez 2 au jet pour déterminer si des blessures mortelles sont infligées par l’aptitude Destruction Néfaste de la figurine. Vous ne pouvez pas cibler la figurine concernée avec le Stratagème Détonation Putride." },
            { name: "RONGE-GRIMOIRE", desc: "Chaque fois qu’une unité ennemie à 9\" de l’unité du porteur rate un test d’Ébranlement, jetez 1 D6 : sur 4+, vous gagnez 1 point de Réquisition." },
            { name: "ARMURE PUTREFORGÉE", desc: "Le porteur a une caractéristique de Sauvegarde de 2+." }
        ],
        antique: [
            { name: "ORBE DU DÉCLIN", desc: "Une fois par bataille, quand vous ciblez l’unité du porteur avec le Stratagème Grenade, le porteur peut utiliser cette Relique de Croisade. En ce cas, jusqu’à ce que ce Stratagème ait été résolu, ajoutez 2 au résultat de chaque dé lancé pour ce Stratagème." },
            { name: "COFFRET DE CORRUPTION", desc: "Le porteur a l’aptitude Destruction Néfaste D3. De plus, à la fin de la bataille, si l’unité du porteur est entièrement dans la zone de déploiement adverse, la prochaine fois que vous suivez la Voie de la Contagion, vous pouvez passer l’étape de Contre-agents." }
        ],
        legendaire: [
             { name: "CŒUR PUTRIDE", desc: "Le porteur a l’aptitude Insensible à la Douleur 5+. De plus, ajoutez 6\" à la Portée de Contagion des figurines de l’unité du porteur." }
        ]
    },

    // ===================================================================
    // TRAITS DE BATAILLE
    // ===================================================================
    battleTraits: {
        "INFANTERIE": [
            { name: "GICLECRASSE (⚀)", desc: "À chaque attaque de mêlée d’une figurine de cette unité, vous pouvez ignorer certains ou tous les modificateurs au jet de Touche, au jet de Blessure et à la caractéristique de Pénétration d’Armure." },
            { name: "BRUME SUFFOCANTE (⚁)", desc: "Une fois par bataille, quand cette unité est choisie pour faire un mouvement Normal, d’Avance ou de Retraite, est placée sur le champ de bataille, ou déclare une charge, elle peut utiliser ce Trait de Bataille. Jusqu’à la fin du tour, les unités ennemies ne peuvent pas utiliser le Stratagème Tir en État d’Alerte pour tirer sur cette unité." },
            { name: "CORNES (⚂)", desc: "Chaque fois que cette unité finit un mouvement de Charge, choisissez 1 unité ennemie à Portée d’Engagement d’elle et jetez 1 D6 pour chaque figurine de cette unité qui est à Portée d’Engagement de l’unité ennemie : pour chaque résultat de 5+, l’unité ennemie subit 1 blessure mortelle." },
            { name: "MASSE IMPAVIDE (⚃)", desc: "Ajoutez 1 à la caractéristique de Capacité de Tir des armes de tir dont sont équipées les figurines de cette unité." },
            { name: "PARASITES DE LA PESTE GUILLERETS (⚄)", desc: "Les armes de tir dont sont équipées les figurines de cette unité ont l’aptitude [IGNORE LE COUVERT]." },
            { name: "CILS FRÉTILLANTS (⚅)", desc: "Chaque fois que vous ciblez cette unité avec le Stratagème Tir en État d’Alerte, des touches sont causées sur des jets de Touche non modifiés de 5+ en résolvant ce Stratagème." },
            { name: "BUBONS INFECTIEUX (⚀)", desc: "À chaque attaque de mêlée qui cible cette unité, après que l’unité attaquante a résolu ses attaques, jetez 1 D6 (jusqu’à un maximum de six D6 par unité attaquante) : pour chaque résultat de 5+, l’unité attaquante subit 1 blessure mortelle." },
            { name: "GERBESPORES (⚁)", desc: "Chaque fois que cette unité finit un mouvement de Retraite, choisissez 1 unité ennemie qui était à Portée d’Engagement de cette unité au début de la phase. Jetez trois D6 : pour chaque résultat de 4+, l’unité ennemie subit 1 blessure mortelle." },
            { name: "SOUILLURE BRILLANTE (⚂)", desc: "À votre phase de Tir, après que cette unité a tiré, choisissez 1 unité ennemie visible touchée par une ou plusieurs de ces attaques. Jusqu’à la fin de la phase, à chaque attaque d’une figurine de DÉMON de NURGLE amie qui cible l’unité, relancez tout jet de Touche de 1." }
        ],
        "VÉHICULE": [
            { name: "EXCROISSANCES BLINDÉES (⚃)", desc: "À chaque attaque qui cible cette unité, si la caractéristique de Force de l’attaque est supérieure à la caractéristique d’Endurance de cette unité, soustrayez 1 au jet de Blessure." },
            { name: "MALADIES MAGISTRALES (⚄)", desc: "Ajoutez 6\" à la caractéristique de Portée des armes de tir à Touches Fatales dont sont équipées les figurines de cette unité. Relancez ce résultat si votre unité n’a aucune arme de tir à Touches Fatales." },
            { name: "MEMBRES GROUILLANTS (⚅)", desc: "Chaque fois qu’une figurine de cette unité fait un mouvement Normal, d’Avance ou de Retraite, elle peut passer à travers les figurines ennemies. Ce faisant, elle peut passer à Portée d’Engagement de telles figurines mais ne peut pas finir ce mouvement à Portée d’Engagement d’elles, et tout test de Fuite Désespérée est automatiquement réussi." }
        ]
    },

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
            pathogenDuration: 1,
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
        // Utilise la nouvelle structure de données pour les options
        let pathogenOptionsHTML = deathGuardCrusadeRules.alchemicalPathogens.properties
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
            const selectedOption = deathGuardCrusadeRules.alchemicalPathogens.properties.find(opt => opt.name === select.value);
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
            const option = deathGuardCrusadeRules.alchemicalPathogens.properties.find(opt => opt.name === property);
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