// Sororitas_module.js
// Ce fichier fusionne les règles (données) et le gameplay (logique)
// pour la faction de l'Adepta Sororitas.

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
            acts: "Gagnez 1 point de Sainte à la fin d'une bataille si ce personnage a accompli au moins 3 Actes de Foi pendant cette bataille.",
            reward_name: "Foi sans Limites",
            reward_desc: "En présence d'une Sainte Vivante, les manifestations de la divinité de l'Empereur foisonnent. À la fin de la phase de Commandement de chaque joueur, si cette figurine est sur le champ de bataille, vous pouvez défausser 1 dé de Miracle. En ce cas, vous gagnez 1 dé de Miracle ayant une valeur de 6."
        },
        {
            id: 'souffrance',
            name: "Épreuve de Souffrance",
            acts: "Gagnez 3 points de Sainte chaque fois que cette figurine gagne un point de Martyre.",
            reward_name: "Résurrection Miraculeuse",
            reward_desc: "La chair brûlée se reforme, et les attaques mortelles ratent miraculeusement leur cible. À chaque fois qu'une figurine de cette unité perdrait un PV, jetez un D6. Sur 6+, ce PV n'est pas perdu."
        },
        {
            id: 'purete',
            name: "Épreuve de Pureté",
            acts: "Soif de connaissance : Gagnez 1 point de Sainte à la fin d'une bataille si cette figurine est à 6\" du centre du champ de bataille. Volonté Divine : Gagnez 2 points de Sainte à la fin d'une bataille si l'unité de cette figurine n'a subi aucun test d'Ébranlement pendant cette bataille.",
            reward_name: "Flamboiement de l'Âme",
            reward_desc: "Lorsque cette figurine doit être frappée, ses ennemis sont victimes d'autocombustion comme s'ils avaient été touchés par la main de l'Empereur. Chaque fois que l'unité de cette figurine est choisie pour combattre, vous pouvez défausser 1 dé de Miracle. En ce cas, jusqu'à la fin de la phase, doublez la caractéristique de Force des armes de mêlée de cette figurine, et ces armes ont l'aptitude [BLESSURES DÉVASTATRICES]."
        },
        {
            id: 'vertu',
            name: "Épreuve de Vertu",
            acts: "Tuez le Démagogue : Gagnez 2 points de Sainte à la fin d'une bataille si cette figurine a détruit une ou plusieurs unités PERSONNAGE ennemies. Châtier les Mécréants : Gagnez 2 points de Sainte à la fin d'une bataille si cette figurine a détruit au moins 3 figurines ennemies pendant cette bataille.",
            reward_name: "Sentence Légitime",
            reward_desc: "Nul n'échappe au jugement de l'Empereur. Chaque fois que l'unité de cette figurine est choisie pour tirer, vous pouvez défausser 1 dé de Miracle. En ce cas, jusqu'à la fin de la phase, les armes de tir dont sont équipées les figurines de cette unité ont l'aptitude [IGNORE LE COUVERT] et chaque fois qu'une attaque d'une telle arme cause une Blessure Critique, l'attaque a l'aptitude [PRÉCISION]."
        },
        {
            id: 'vaillance',
            name: "Épreuve de Vaillance",
            acts: "Victoire écrasante : Gagnez 3 points de Sainte à la fin d'une bataille si cette figurine est entièrement dans la zone de déploiement adverse. Pieuse Réputation : Gagnez 2 points de Sainte à la fin d'une bataille si cette figurine a gagné plus de PX que toute autre unité de votre armée de Croisade pendant cette bataille.",
            reward_name: "La Voix de l'Empereur",
            reward_desc: "Au début de l'étape d'Ébranlement de la phase de Commandement adverse, vous pouvez défausser 1 dé de Miracle. En ce cas, chaque unité ennemie à 12\" de cette figurine et au-dessus de son Effectif Initial doit passer un test d'Ébranlement."
        }
    ],
    battleTraits: {
        "UNITÉS PÉNITENT": [
            { name: "Fanatisme Intarissable", desc: "Ajoutez 1 aux jets d'Avance et de Charge pour cette unité." },
            { name: "Dévot Fidèle", desc: "Chaque fois qu'une attaque est allouée à une figurine de cette unité, si cette unité est au-dessus de son Demi-effectif, ses figurines ont l'aptitude Insensible à la Douleur 4+ contre cette attaque." },
            { name: "Le Sang Engendre l'Absolution", desc: "Chaque fois que cette unité détruit une unité ennemie à la phase de Combat, vous gagnez 1 dé de Miracle." }
        ],
        "FIGURINES PERSONNAGE": [
            { name: "Point de Paroles, des Actes", desc: "Chaque fois que cette figurine fait une action, et que cette figurine est à portée d'Engagement d'une ou plusieurs unités ennemies, elle peut quand même faire des attaques de tir. Dans ce cas, les armes de tir dont cette figurine est équipée ont la caractéristique [PISTOLET]." },
            { name: "Égide de Conviction", desc: "Chaque fois que cette figurine réussit un test d'Ébranlement, jusqu'au début de votre phase de Commandement, elle regagne 1 PV perdu." },
            { name: "Fanal de la Foi", desc: "À la fin de votre phase de Commandement, si cette figurine est votre SEIGNEUR DE GUERRE et sur le champ de bataille, vous pouvez défausser 1 dé de Miracle. En ce cas, vous gagnez un dé de Miracle." }
        ],
        "UNITÉS VÉHICULE": [
            { name: "Autel Mobile (Aura)", desc: "Tant qu'une unité ADEPTA SORORITAS amie est à 6\" de cette unité, ajoutez 1 à sa caractéristique de Contrôle d'Objectif." },
            { name: "Esprit de la Machine Pieux", desc: "Chaque fois que cette unité accomplit un Acte de Foi, le résultat du dé de Miracle utilisé pour ce test est considéré comme 6." },
            { name: "Coque Trois Fois Bénie", desc: "Cette unité a l'aptitude Insensible à la Douleur 4+ contre les Blessures mortelles." }
        ]
    },
    requisitions: [
        { name: "Appel Divin (1PR)", desc: "Achetez cette Réquisition à la fin d'une bataille. Quand votre figurine SAINTE POTENTIA abandonne son Épreuve actuelle et en commence une nouvelle, après avoir porté les points de Sainte acquis à 0, elle gagne le nombre de points de Sainte sous cette nouvelle épreuve égal à la moitié des points de Sainte qu'elle avait gagnés pour l'Épreuve abandonnée (arrondis au supérieur)." },
        { name: "Ascension au Sein de l'Ordre (2PR)", desc: "Achetez cette Réquisition avant une bataille. Choisissez 1 unité ESCOUADE DE SŒURS NOVICES de votre Ordre de Bataille. Retirez cette unité de votre Ordre de Bataille et ajoutez 1 unité ESCOUADE DE SŒURS DE BATAILLE, ESCOUADE DOMINION ou ESCOUADE RETRIBUTOR à votre Ordre de Bataille. La nouvelle unité a les mêmes Honneurs de Bataille et Séquelles de Combat que l'unité qu'elle remplace, ainsi que 5 PX de plus." },
        { name: "La Voie de la Pénitence (2PR)", desc: "Achetez cette Réquisition avant une bataille. Choisissez 1 ESCOUADE DE SŒURS DE BATAILLE, ESCOUADE DOMINION ou ESCOUADE RETRIBUTOR de votre Ordre de Bataille qui a subi un résultat Coup Dévastateur. Retirez cette unité et ajoutez 1 unité ESCOUADE REPENTIA ou MORTIFICATRICES à votre Ordre de Bataille. La nouvelle unité a les mêmes Honneurs de Bataille, Séquelles de Combat et PX que l'unité qu'elle remplace, et jusqu'à ce qu'elle soit retirée de votre Ordre de Bataille, elle gagne 2PX en lieu de 1PX." },
        { name: "Glorieuse Rédemption (1PR)", desc: "Achetez cette Réquisition. Votre Ordre de Bataille peut contenir 1 unité ESCOUADE REPENTIA, ESCOUADE SÉRAPHINE, ESCOUADE ZÉPHYRINE ou EXO-HARNAIS PARANGON de plus." },
        { name: "L'Illumination par la Douleur (1PR)", desc: "Achetez cette dévotion après une bataille, avant qu'une unité ADEPTA SORORITAS de votre armée de Croisade ne fasse un test de Mise Hors de Combat. Choisissez cette unité et chaque Séquelle de Combat est 1 Honneur de Bataille de votre choix. Si cette unité est une Sainte Potentia, elle gagne également 2 points de Sainte et 1 point de Martyre." },
        { name: "Saintes Bénéfictions (1PR)", desc: "Achetez cette Réquisition avant une bataille. Pendant le premier round de cette bataille, chaque dé de Miracle que vous gagnez au début du tour de chaque joueur a automatiquement une valeur de 6." }
    ],
    relics: {
        artificer: [
            { name: "Fiole de Dolan", desc: "Améliorez de 1 les caractéristiques de Points de vie et d'Endurance du porteur. Une fois par bataille, vous pouvez relancer un test d'Ébranlement ou de Contrôle d'Objectif pour l'unité du porteur.", cost: 1 },
            { name: "Praesidium Rosarius", desc: "Le porteur a une sauvegarde invulnérable de 4+.", cost: 1 },
            { name: "Larmes de l'Empereur", desc: "Améliorez de 1 les caractéristiques d'Attaques, de Force et de Dégâts des armes de tir du porteur.", cost: 1 }
        ],
        antique: [
            { name: "Bénédictions de Sebastian Thor", desc: "Quand le porteur est détruit, ce texte sert à bénir le champ de bataille, et le sang de l'Empereur exauce la prière. Vous pouvez utiliser une fois le Stratagème Intervention Héroïque sur une unité amie qui se trouve à 12\" du porteur.", cost: 2 },
            { name: "Icône de Sainteté", desc: "Chaque fois que cette unité a une charge, vous pouvez choisir de ne pas la faire. À la place, jusqu'à la fin de la phase, le porteur ne peut passer son tour d'engagement, mais il peut choisir une unité ennemie à 12\" et la charger au péril de cette charge.", cost: 2 }
        ],
        // CORRECTION APPORTÉE ICI
        legendaire: [
             { name: "Arme de la Matriarche", desc: "Améliorez de 1 les caractéristiques de Force et de Dégâts des armes de mêlée du porteur. De plus, les armes de mêlée du porteur ont les aptitudes [ANTI-PERSONNAGE 4+], [BLESSURES DÉVASTATRICES] et [PRÉCISION].", cost: 3 }
        ]
    },
    intentions: [
        { 
            name: "Test de Foi", 
            desc: "À la fin de la bataille, gagnez 1 PX pour chaque dé de Miracle sur votre carte de Croisade (jusqu'à 3 PX). Si vous gagnez 3 PX, votre Sainte Potentia gagne 1 point de Sainte." 
        },
        { 
            name: "Expiation au Combat", 
            desc: "Choisissez trois unités PÉNITENT. À la fin de la bataille, chaque fois qu'une de ces unités détruit une ou plusieurs unités ennemies, elle gagne 1 point de Rédemption (à noter sur sa carte). Pour chaque point de Rédemption, l'unité gagne 1 PX." 
        },
        { 
            name: "Défendez le Sanctuaire", 
            desc: "À la fin de la bataille, si vous contrôlez le pion d'objectif 'Temple Sacré', vous gagnez 1 PX par unité ADEPTA SORORITAS à portée. Si vous ne le contrôlez pas, l'adversaire gagne des points d'Islama. Votre Sainte Potentia (PERSONNAGE seulement) peut gagner 3 points de Sainte si elle contrôle l'objectif." 
        },
        {
            name: "Extermination Zélée",
            desc: "Chaque fois qu'une de vos unités détruit ou est détruite par une unité PSYKER, elle gagne 1 PX. Si une de vos unités détruit ou est détruite par une unité HÉRÉTIQUE, elle gagne 1 PX supplémentaire. Si une de vos unités gagne 3 PX ou plus via cette intention, elle gagne aussi 1 point de Sainte."
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

    // NOUVEAU BLOC DE CODE POUR L'AUTOMATISATION DE 'APPEL DIVIN'
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
            player.sainthood.trials[choice] = newPoints;
            player.sainthood.activeTrial = choice;

            logAction(player.id, `A utilisé 'Appel Divin' pour 1 PR. A changé de l'épreuve '${oldTrialId}' à '${choice}', transférant ${newPoints} points.`, 'info', '⚜️');
            saveData();
            renderPlayerDetail();
            showNotification("Épreuve changée avec succès !", "success");
        }
    });
}