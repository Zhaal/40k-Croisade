// Sororitas_module.js
// Ce fichier fusionne les règles (données) et le gameplay (logique)
// pour la faction de l'Adepta Sororitas.
// VERSION CORRIGÉE ET COMPLÉTÉE

//======================================================================
//  1. RÈGLES ET DONNÉES DE L'ADEPTA SORORITAS
//======================================================================

const sororitasUnits = [
    { name: "Aestred Thurga et Agathae Dolan", cost: 85 },
    { name: "Arco-flagellants", cost: 45 },
    { name: "Castigator", cost: 160 },
    { name: "Célestes Sacro-saintes", cost: 70 },
    { name: "Chanoinesse", cost: 50 },
    { name: "Chanoinesse à Réacteur Dorsal", cost: 75 },
    { name: "Démonifuge", cost: 85 },
    { name: "Dialogus", cost: 40 },
    { name: "Dogmata", cost: 45 },
    { name: "Escouade de Sœurs de Bataille", cost: 105 },
    { name: "Escouade de Sœurs Novices", cost: 100 },
    { name: "Escouade Dominion", cost: 115 },
    { name: "Escouade Repentia", cost: 75 },
    { name: "Escouade Retributor", cost: 115 },
    { name: "Escouade Séraphine", cost: 80 },
    { name: "Escouade Zéphyrine", cost: 80 },
    { name: "Exo-harnais Parangon", cost: 210 },
    { name: "Exorcist", cost: 210 },
    { name: "Hospitalière", cost: 50 },
    { name: "Imagifère", cost: 65 },
    { name: "Immolator", cost: 115 },
    { name: "Junith Eruita", cost: 80 },
    { name: "Machines de Pénitence", cost: 75 },
    { name: "Mortificatrices", cost: 70 },
    { name: "Morvenn Vahl", cost: 170 },
    { name: "Palatine", cost: 50 },
    { name: "Prêtre du Ministorum", cost: 50 },
    { name: "Rhino Sororitas", cost: 75 },
    { name: "Sainte Célestine", cost: 160 },
    { name: "Sanctificateurs", cost: 100 },
    { name: "Triomphe de Sainte Katherine", cost: 235 }
];

const sororitasDetachments = [
    { group: "Armée de la Foi", name: "Aspect Divin", cost: 5 },
    { group: "Armée de la Foi", name: "Épée de Sainte Ellynor", cost: 15 },
    { group: "Armée de la Foi", name: "Litanies de la Foi", cost: 10 },
    { group: "Armée de la Foi", name: "Triptyque de la Croisade Macharienne", cost: 20 },
    { group: "Championnes de la Foi", name: "Amulette Sanctifiée", cost: 25 },
    { group: "Championnes de la Foi", name: "Marque de la Dévotion", cost: 30 },
    { group: "Championnes de la Foi", name: "Triptyque du Jugement", cost: 15 },
    { group: "Championnes de la Foi", name: "Yeux de l'Oracle", cost: 10 },
    { group: "Martyrs Sacrés", name: "Chapelet de Sacrifice", cost: 25 },
    { group: "Martyrs Sacrés", name: "Exemple de Sainteté", cost: 10 },
    { group: "Martyrs Sacrés", name: "La Force par la Souffrance", cost: 25 },
    { group: "Martyrs Sacrés", name: "Manteau d'Ophelia", cost: 20 },
    { group: "Ost Pénitent", name: "Catéchisme de Pénitence Divine", cost: 20 },
    { group: "Ost Pénitent", name: "Psaume de Sentence Légitime", cost: 30 },
    { group: "Ost Pénitent", name: "Refrain de Foi Pérenne", cost: 25 },
    { group: "Ost Pénitent", name: "Verset de Sainte Piété", cost: 15 },
    { group: "Porteuses de la Flamme", name: "Feu et Fureur", cost: 30 },
    { group: "Porteuses de la Flamme", name: "Manuel de Sainte Griselda", cost: 20 },
    { group: "Porteuses de la Flamme", name: "Rage Vertueuse", cost: 15 },
    { group: "Porteuses de la Flamme", name: "Surplis de Fer de Sainte Istalela", cost: 10 }
];

const sororitasCrusadeRules = {
    trials: [
        {
            id: 'foi',
            name: "Épreuve de Foi",
            acts: "Faveur de Grâce Divine : Gagnez 1pt si ce personnage a accompli au moins 3 Actes de Foi. Gloire à l'Empereur : Gagnez 1pt pour chaque dé de Miracle en réserve à la fin de la bataille (max 2pts).",
            reward_name: "Foi sans Limites",
            reward_desc: "À la fin de votre phase de Commandement, si cette figurine est sur le champ de bataille, vous pouvez défausser 1 dé de Miracle. En ce cas, vous gagnez 1D3 dés de Miracle, qui ont tous une valeur de 6."
        },
        {
            id: 'souffrance',
            name: "Épreuve de Souffrance",
            acts: "Stigmates de la Pénitente : Gagnez 2pts chaque fois que cette figurine est détruite. Blessures de la Martyre : Gagnez 1pt si la figurine a perdu la moitié de ses PV ou plus ; Gagnez 2pts si elle est détruite et retirée du jeu.",
            reward_name: "Régénération Miraculeuse",
            reward_desc: "Au début de n'importe quelle phase, vous pouvez défausser 1 dé de Miracle. Si vous le faites, cette figurine récupère immédiatement tous les Points de Vie qu'elle avait perdus."
        },
        {
            id: 'purete',
            name: "Épreuve de Pureté",
            acts: "Soif d'Hérétiques : Gagnez 2pts si cette figurine est à 6\" ou moins du centre. Volonté Divine : Gagnez 2pts si l'unité de cette figurine a été témoin d'un test d'Ébranlement raté par un ennemi.",
            reward_name: "Flamboiement de l'Âme",
            reward_desc: "Chaque fois que l'unité de cette figurine est choisie pour combattre, vous pouvez défausser 1 dé de Miracle. En ce cas, jusqu'à la fin de la phase, doublez la caractéristique de Force des armes de mêlée de cette figurine, et ces armes ont l'aptitude [BLESSURES DÉVASTATRICES]."
        },
        {
            id: 'vertu',
            name: "Épreuve de Vertu",
            acts: "Tuez le Démagogue : Gagnez 2pts si cette figurine a détruit un ou plusieurs PERSONNAGES ennemis (+2pts si l'un d'eux était le SEIGNEUR DE GUERRE). Châtier les Mécréants : Gagnez 2pts si cette figurine a détruit au moins 3 unités ennemies.",
            reward_name: "Sentence Légitime",
            reward_desc: "Chaque fois que l'unité de cette figurine est choisie pour tirer, vous pouvez défausser 1 dé de Miracle. En ce cas, jusqu'à la fin de la phase, les armes de tir de l'unité ont [IGNORE LE COUVERT] et chaque fois qu'une attaque cause une Blessure Critique, l'attaque a [PRÉCISION]."
        },
        {
            id: 'vaillance',
            name: "Épreuve de Vaillance",
            acts: "Croisade Sainte : Gagnez 3pts si cette figurine est entièrement dans la zone de déploiement adverse. Pieuse Réputation : Gagnez 2pts si cette figurine a gagné plus de PX que toute autre unité de votre armée.",
            reward_name: "La Voix de l'Empereur",
            reward_desc: "Au début de l'étape d'Ébranlement de la phase de Commandement adverse, vous pouvez défausser 1 dé de Miracle. En ce cas, chaque unité ennemie à 12\" et en dessous de son Effectif Initial doit passer un test d'Ébranlement (-1 au test si l'unité est en Dessous de son Demi-effectif)."
        }
    ],
    battleTraits: {
        "UNITÉS PÉNITENT": [
            { name: "Fanatisme Intarissable (Résultat 1-2)", desc: "L'unité peut effectuer 1 jet d'Avance et 1 jet de Charge additionnels par tour." },
            { name: "Dévot Fidèle (Résultat 3-4)", desc: "Chaque fois qu'une attaque est allouée à une figurine de cette unité, si cette unité est En Dessous de son Demi-effectif, ses figurines ont l'aptitude Insensible à la Douleur 4+ contre cette attaque." },
            { name: "Le Sang Engendre l'Absolution (Résultat 5-6)", desc: "Chaque fois que cette unité détruit une unité ennemie à la phase de Combat, vous gagnez 1 dé de Miracle." }
        ],
        "FIGURINES PERSONNAGE": [
            { name: "Point de Paroles, des Actes (Résultat 1-2)", desc: "Chaque fois que cette figurine fait une touche pour blesser en mêlée, le jet de Touche et le jet de Blessure réussissent automatiquement." },
            { name: "Égide de Conviction (Résultat 3-4)", desc: "Cette figurine a l'aptitude Insensible à la Douleur 5+. Au début de votre phase de Commandement, elle regagne 1 PV perdu." },
            { name: "Fanal de la Foi (Résultat 5-6)", desc: "À la fin de votre phase de Commandement, si cette figurine est votre SEIGNEUR DE GUERRE et sur le champ de bataille, vous pouvez dépenser 1 PC. En ce cas, vous gagnez un dé de Miracle." }
        ],
        "UNITÉS VÉHICULE": [
            { name: "Autel Mobile (Aura) (Résultat 1-2)", desc: "L'aptitude Bouclier de la Foi des unités amies à 6\" de ce véhicule est améliorée. De plus, à 6\" de ce véhicule, les unités ADEPTA SORORITAS amies peuvent utiliser la caractéristique de Commandement de ce véhicule." },
            { name: "Esprit de la Machine Pieux (Résultat 3-4)", desc: "Chaque fois que cette unité accomplit un Acte de Foi, le résultat du dé de Miracle utilisé pour ce test est considéré comme étant de 1 de plus (un 6 ne peut être amélioré). L'aptitude Bouclier de la Foi de ce véhicule est améliorée de 1 (max 4+)." },
            { name: "Coque Trois Fois Bénie (Résultat 5-6)", desc: "Cette unité a l'aptitude Insensible à la Douleur 4+ contre les Blessures mortelles." }
        ]
    },
    requisitions: [
        { name: "Appel Divin (1PR)", desc: "Achetez à la fin d'une bataille. Quand votre Sainte Potentia abandonne son Épreuve actuelle pour une nouvelle, elle gagne pour sa nouvelle épreuve la moitié des points qu'elle avait pour l'ancienne (arrondi au supérieur)." },
        { name: "Ascension au Sein de l'Ordre (2PR)", desc: "Achetez après une bataille. Une unité ESCOUADE DE SŒURS NOVICES 'Aguerrie' peut être promue en ESCOUADE DE SŒURS DE BATAILLE, DOMINION ou RETRIBUTOR. La nouvelle unité conserve les Honneurs et Séquelles, et gagne 5 PX." },
        { name: "La Voie de la Pénitence (2PR)", desc: "Achetez après une bataille. Une unité de SŒURS (Bataille, Dominion, Retributor) ayant subi un 'Coup Dévastateur' peut devenir une ESCOUADE REPENTIA. Une Repentia ayant subi ce résultat peut devenir une unité MORTIFICATRICES. L'unité conserve ses Honneurs/Séquelles et gagne 2PX au lieu de 1PX temporairement." },
        { name: "Glorieuse Rédemption (1PR)", desc: "Achetez après une bataille. Une ESCOUADE REPENTIA avec 3+ points de Rédemption peut se 'racheter'. Dépensez ses points pour la transformer en ESCOUADE SÉRAPHINE, ZÉPHYRINE, CÉLESTE SACRO-SAINTE ou SŒURS DE BATAILLE. L'unité conserve ses Honneurs/Séquelles." },
        { name: "L'Illumination par la Douleur (1PR)", desc: "Achetez après une bataille, avant de mettre à jour la carte d'une unité de l'Ordre de Notre-Dame des Martyrs. Retirez une Séquelle de Combat subie et gagnez 1 PX à la place. Ne peut être utilisée qu'une fois par unité." },
        { name: "Saintes Bénéfictions (1PR)", desc: "Achetez avant une bataille. Pendant le premier round de cette bataille, chaque dé de Miracle que vous gagnez au début du tour de chaque joueur a automatiquement une valeur de 6." }
    ],
    relics: {
        artificer: [
            { name: "Fiole de Dolan", desc: "Améliorez de 1 les caractéristiques de Points de Commandement et de Contrôle d'Objectif du porteur.", cost: 1 },
            { name: "Praesidium Rosarius", desc: "Le porteur a une sauvegarde invulnérable de 4+. Une fois par bataille, au début de n'importe quelle phase, le porteur peut l'activer pour avoir une sauvegarde invulnérable de 3+ jusqu'à la fin de la phase.", cost: 1 },
            { name: "Larmes de l'Empereur", desc: "Le porteur peut relancer les jets de blessure. De plus, chaque fois que le porteur combat en mêlée, il peut relancer les jets de dégâts.", cost: 1 },
            { name: "Le Sceau Ecclesiasticus", desc: "Améliorez de 1 les carac. d'Attaques, Force et Dégâts des armes de tir et de mêlée du porteur. De plus, ses armes de mêlée ont [BLESSURES MORTELLES 4+].", cost: 1}
        ],
        antique: [
            { name: "Bénédictions de Sebastian Thor", desc: "Si le porteur est une CHANOINESSE, il connaît 1 litanie supplémentaire. Si son Hymne de Bataille est réussi, l'unité ennemie la plus proche à 12\" subit D3 blessures mortelles.", cost: 2 },
            { name: "Icône de Sainteté", desc: "Le porteur gagne l'aptitude ACTES DE FOI. De plus, chaque fois que le porteur accomplit un Acte de Foi, il peut relancer le dé de Miracle.", cost: 2 },
            { name: "Psaumes de Bataille de Vespania", desc: "Si le porteur est une DIALOGUS, une fois par bataille, il peut choisir d'inspirer les unités ADEPTA SORORITAS amies à 12\". Jusqu'à la fin du tour, ces unités peuvent charger même si elles ont Avancé ou Battu en Retraite.", cost: 2}
        ],
        legendaire: [
             { name: "Arme de la Matriarche", desc: "Remplace une arme. PROFIL TIR (Portée 18\", Assaut D6+3, F6, PA-3, D2). PROFIL MÊLÉE (F+2, PA-3, D2). Pour une SAINTE VIVANTE seulement : Améliorez la F et D de l'arme de 1. Son profil de mêlée gagne [ANTI-PERSONNAGE 4+], [BLESSURES DÉVASTATRICES] et [PRÉCISION].", cost: 3 }
        ]
    },
    intentions: [
        { 
            name: "Test de Foi", 
            desc: "Chaque fois qu'une unité accomplit un Acte de Foi, vous pouvez défausser un dé de Miracle additionnel pour le placer sur sa carte de Croisade. À la fin de la bataille, l'unité gagne 1 PX par dé sur sa carte (max 3 PX). Si une Sainte Potentia gagne des PX ainsi, elle gagne aussi 1 Point de Sainte." 
        },
        { 
            name: "Expiation au Combat", 
            desc: "Désignez trois unités PÉNITENT ou ayant une Séquelle de Combat. Pour chaque unité désignée qui détruit une ou plusieurs unités ennemies, elle gagne un point de Rédemption. Chaque point de Rédemption vaut 1 PX." 
        },
        { 
            name: "Défendez le Sanctuaire", 
            desc: "L'adversaire place un objectif 'Temple Sacré' dans sa zone. Si vous le contrôlez à la fin de vos tours, une unité à portée gagne 1 PX. Si vous ne le contrôlez pas à la fin de la bataille, vous ne gagnez pas de PR et une de vos unités subit une Séquelle. Si vous le contrôlez, un PERSONNAGE à portée gagne 3 PX et 3 points de Sainte." 
        },
        {
            name: "Extermination Zélée",
            desc: "Chaque fois qu'une de vos unités détruit une unité ennemie en tirant ou combattant, elle gagne 1 PX. Gagnez 1 PX additionnel si une figurine PSYKER est détruite. Gagnez 1 PX additionnel si une figurine est détruite par une arme à [TORRENT] ou [FUSION]. Max 4 PX par unité. Une Sainte Potentia gagne aussi 1 Point de Sainte si elle gagne des PX ainsi."
        }
    ]
};


//======================================================================
//  2. LOGIQUE DE GAMEPLAY DE L'ADEPTA SORORITAS
//======================================================================

/**
 * Attribue les données initiales spécifiques à la faction Adepta Sororitas lors de la création d'un joueur.
 * @param {object} newPlayer - L'objet joueur en cours de création.
 */
function initializeSororitasData(newPlayer) {
    newPlayer.sainthood = {
        potentiaUnitId: null,
        activeTrial: 'foi',
        trials: { foi: 0, souffrance: 0, purete: 0, vertu: 0, vaillance: 0 },
        martyrdomPoints: 0
    };
}


/**
 * Affiche et met à jour la boîte d'informations sur la mécanique de Sainteté pour les Adepta Sororitas.
 * @param {object} player - L'objet joueur Adepta Sororitas.
 */
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


/**
 * Met en place tous les écouteurs d'événements spécifiques à l'Adepta Sororitas.
 */
function initializeSororitasGameplay() {
    document.getElementById('sororitas-sainthood-box').addEventListener('click', async (e) => {
        const player = campaignData.players[activePlayerIndex];
        if (!player || player.faction !== 'Adepta Sororitas') return;

        const button = e.target.closest('button');
        if (!button) return;

        if (button.classList.contains('tally-btn')) {
            e.stopPropagation();

            const [operation, type] = button.dataset.action.split('-');
            const change = operation === 'increase' ? 1 : -1;

            if (type === 'trial') {
                const trialId = button.dataset.trial;
                if (!trialId) return;
                const currentPoints = player.sainthood.trials[trialId] || 0;
                player.sainthood.trials[trialId] = Math.max(0, Math.min(10, currentPoints + change));
            } else if (type === 'martyrdom') {
                player.sainthood.martyrdomPoints = Math.max(0, (player.sainthood.martyrdomPoints || 0) + change);
                // NOTE: La règle "Gagnez 3 points de Sainte chaque fois que cette figurine gagne un point de Martyre" n'est pas dans le texte fourni.
                // L'ancienne logique a été retirée pour se conformer au texte. 
                // Pour la réactiver, décommentez les lignes ci-dessous.
                /*
                if (change > 0) {
                    const currentSuffering = player.sainthood.trials.souffrance || 0;
                    player.sainthood.trials.souffrance = Math.min(10, currentSuffering + 3);
                    logAction(player.id, "Point de Martyre gagné (+3 à l'Épreuve de Souffrance).", 'info', '⚜️');
                    showNotification("Point de Martyre gagné ! +3 points pour l'Épreuve de Souffrance.", "info");
                }
                */
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

    // BLOC DE CODE POUR L'AUTOMATISATION DE 'APPEL DIVIN'
    document.getElementById('divine-call-btn').addEventListener('click', async () => {
        const player = campaignData.players[activePlayerIndex];
        if (!player || player.faction !== 'Adepta Sororitas') return;

        if (!player.sainthood.potentiaUnitId) {
            showNotification("Vous devez d'abord désigner une Sainte Potentia.", 'warning');
            return;
        }
        if (player.requisitionPoints < 1) {
            showNotification("Points de Réquisition insuffisants (1 PR requis).", "error");
            return;
        }

        const choice = await new Promise(resolve => {
            const modal = document.createElement('div');
            modal.className = 'modal';
            const currentTrialId = player.sainthood.activeTrial;
            const trialOptions = sororitasCrusadeRules.trials
                .filter(t => t.id !== currentTrialId)
                .map(t => `<option value="${t.id}">${t.name}</option>`)
                .join('');

            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-btn">&times;</span>
                    <h3>Appel Divin : Choisir une Nouvelle Épreuve</h3>
                    <p>La Sainte Potentia va abandonner son épreuve actuelle. Choisissez la nouvelle épreuve qu'elle va entreprendre.</p>
                    <div class="form-group">
                        <label for="new-trial-select">Nouvelle Épreuve :</label>
                        <select id="new-trial-select">${trialOptions}</select>
                    </div>
                    <div class="modal-actions">
                        <button id="cancel-divine-call" class="btn-secondary">Annuler</button>
                        <button id="confirm-divine-call" class="btn-primary">Confirmer (1 PR)</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const closeModalFunc = (value = null) => { modal.remove(); resolve(value); };
            modal.querySelector('.close-btn').onclick = () => closeModalFunc();
            modal.querySelector('#cancel-divine-call').onclick = () => closeModalFunc();
            modal.querySelector('#confirm-divine-call').onclick = () => {
                const newTrial = modal.querySelector('#new-trial-select').value;
                closeModalFunc(newTrial);
            };
        });

        if (choice) {
            const oldTrialId = player.sainthood.activeTrial;
            const oldPoints = player.sainthood.trials[oldTrialId] || 0;
            const newPoints = Math.ceil(oldPoints / 2);

            player.requisitionPoints -= 1;
            player.sainthood.trials[oldTrialId] = 0;
            player.sainthood.trials[choice] = Math.min(10, (player.sainthood.trials[choice] || 0) + newPoints); // Ajoute les points au lieu de les écraser
            player.sainthood.activeTrial = choice;

            logAction(player.id, `A utilisé 'Appel Divin' pour 1 PR. A changé de l'épreuve '${oldTrialId}' à '${choice}', transférant ${newPoints} points.`, 'info', '⚜️');
            saveData();
            renderPlayerDetail();
            showNotification("Épreuve changée avec succès !", "success");
        }
    });
}