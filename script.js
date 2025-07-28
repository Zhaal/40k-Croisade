document.addEventListener('DOMContentLoaded', () => {

    const APP_VERSION = "1.3.1"; // Version avec correction de la logique d'amélioration

    //======================================================================
    //  BASE DE DONNÉES DES RÈGLES DE CROISADE (Nexus Paria)
    //======================================================================
    const crusadeRules = {
        battleTraits: {
            Personnage: [
                { name: "Diriger en Première Ligne", desc: "Cette unité passe les tests de Moral automatiquement si elle est à 6\" d'une unité MONSTRE ou VÉHICULE amie qui n'est pas Ébranlée." },
                { name: "Immunisé aux Horreurs", desc: "Cette unité peut relancer les tests de Moral." },
                { name: "Grand Acquisiteur", desc: "Ajoutez 3 à la caractéristique de Contrôle d'Objectif de la figurine PERSONNAGE de cette unité." },
                { name: "Rôdeur Conquérant", desc: "Tant que cette unité est à portée d'un pion d'objectif, elle gagne l'aptitude Discrétion." },
                { name: "Constitution Héroïque", desc: "Ajoutez 1 à la caractéristique de PV de cette unité." },
                { name: "Duelliste", desc: "Le champ d'attraction de nimbus de force est amélioré. À chaque attaque de mêlée effectuée par une figurine ennemie qui cible cette unité, si l'attaquant est à portée d'Engagement de cette unité, il subit 1 blessure mortelle." }
            ],
            Vehicule: [ // Inclut Monstre et Véhicule
                { name: "Protections Durcies", desc: "Dans les environnements tordus de cette zone de guerre, cette unité a su renforcer ses protections. Les figurines de cette unité ont l'aptitude insensible à la Douleur 6+." },
                { name: "Présence Totémique", desc: "Cette unité est considérée comme une icône de la victoire par ses camarades. Chaque fois que cette unité contrôle un pion d'objectif, ajoutez 1 à la caractéristique de Contrôle d'Objectif de 1 figurine de cette unité." },
                { name: "Chasseur de Chars", desc: "À chaque attaque effectuée par une figurine de cette unité qui cible une unité VÉHICULE ennemie, vous pouvez relancer le jet de blessure." },
                { name: "Explorateur Obstiné", desc: "Les figurines de cette unité ne sont pas ralenties par les débris et les obstacles et ignorent toutes les règles qui pénalisent le mouvement ou les jets d'Avance pour le terrain difficile." },
                { name: "Lourdement Blindé", desc: "Soustraire 1 à la caractéristique de Dégâts des attaques de mêlée." },
                { name: "Faucheur", desc: "À chaque attaque de mêlée effectuée par une figurine de cette unité MONTRÉE, relancez tout jet de touche de 1." }
            ],
            Monstre: [ // Partage les mêmes que Véhicule
                { name: "Protections Durcies", desc: "Dans les environnements tordus de cette zone de guerre, cette unité a su renforcer ses protections. Les figurines de cette unité ont l'aptitude insensible à la Douleur 6+." },
                { name: "Présence Totémique", desc: "Cette unité est considérée comme une icône de la victoire par ses camarades. Chaque fois que cette unité contrôle un pion d'objectif, ajoutez 1 à la caractéristique de Contrôle d'Objectif de 1 figurine de cette unité." },
                { name: "Chasseur de Chars", desc: "À chaque attaque effectuée par une figurine de cette unité qui cible une unité VÉHICULE ennemie, vous pouvez relancer le jet de blessure." },
                { name: "Explorateur Obstiné", desc: "Les figurines de cette unité ne sont pas ralenties par les débris et les obstacles et ignorent toutes les règles qui pénalisent le mouvement ou les jets d'Avance pour le terrain difficile." },
                { name: "Lourdement Blindé", desc: "Soustraire 1 à la caractéristique de Dégâts des attaques de mêlée." },
                { name: "Faucheur", desc: "À chaque attaque de mêlée effectuée par une figurine de cette unité MONTRÉE, relancez tout jet de touche de 1." }
            ],
            Infantrie: [
                { name: "Résistance de Briscard", desc: "Les figurines de cette unité ont l'aptitude Insensible à la Douleur 6+." },
                { name: "Spectres des Ruines", desc: "Les figurines de cette unité ont l'aptitude Infiltrateurs." },
                { name: "Unis dans l'Adversité", desc: "Vous pouvez cibler cette unité avec le Stratagème Intervention Héroïque pour 0 PC, même si vous avez déjà ciblé une unité différente avec ce Stratagème." },
                { name: "Pillards", desc: "À chaque attaque d'une figurine de cette unité avec une arme de mêlée qui cible une unité qui est à portée d'un pion d'objectif, relancez tout jet de touche de 1." },
                { name: "Purificateurs", desc: "Si elle a déjà le mot-clé GRENADES, vous pouvez cibler cette unité avec le Stratagème Grenade pour 0PC." },
                { name: "Assaut de Terreur", desc: "Au début de la phase de Combat, choisissez 1 unité ennemie à Portée d'Engagement de cette unité. L'unité ennemie doit faire un test d'Ébranlement." }
            ],
            Cavalerie: [ // Mounted
                { name: "Cavaliers des Ruines", desc: "Ajoutez 2\" à la caractéristique de Mouvement des figurines de cette unité." },
                { name: "Offensive Tonitruante", desc: "Ajoutez 1 aux jets d'Avance et de Charge faits pour cette unité." },
                { name: "Assassins sur Selle", desc: "À chaque attaque de mêlée d'une figurine de cette unité qui cible la cible éligible la plus proche, améliorez de 1 la caractéristique de Pénétration d'Armure de l'attaque." },
                { name: "Briseurs de Lignes", desc: "Chaque fois que cette unité finit un mouvement de Charge, jusqu'à la fin du tour, les armes de mêlée dont sont équipées les figurines de cette unité ont l'aptitude [TOUCHES SOUTENUES 1]." },
                { name: "Charge Broyeuse", desc: "Chaque fois que cette unité finit un mouvement de Charge, choisissez 1 unité ennemie à Portée d'Engagement d'elle, puis jetez 1 D6 pour chaque figurine de cette unité qui est à Portée d'Engagement de l'unité ennemie; pour chaque 4+, l'unité ennemie subit 1 blessure mortelle." },
                { name: "Vitesse Étourdissante", desc: "Les figurines de cette unité ont l'aptitude Discrétion." }
            ]
        },
        weaponMods: [
            { name: "Finement Équilibrée", desc: "Améliorez de 1 la caractéristique de Capacité de Tir ou de Capacité de Combat de cette arme." },
            { name: "Brutale", desc: "Ajoutez 1 à la caractéristique de Force de cette arme." },
            { name: "Perce-Blindage", desc: "Améliorez de 1 la caractéristique de Pénétration d'Armure de cette arme." },
            { name: "Œuvre de Maître", desc: "Ajoutez 1 à la caractéristique de Dégâts de cette arme." },
            { name: "Héritage", desc: "Ajoutez 1 à la caractéristique d'Attaques de cette arme." },
            { name: "Précise", desc: "À chaque Blessure Critique causée par une attaque de cette arme, l'attaque a l'aptitude [PRÉCISION]." }
        ],
        relics: {
            artificer: [
                { name: "Boussole d'Artificier", desc: "Le porteur gagne l'aptitude Infiltrateurs.", cost: 1 },
                { name: "Voile des Doyens", desc: "Le porteur gagne l'aptitude Infiltrateurs.", cost: 1 },
                { name: "Trésor des Technomandrites", desc: "Choisissez 1 arme dont est équipé le porteur. Chaque fois que cette arme est remplacée par une Optimisation ou une Relique de Croisade, notez-le. L'arme d'origine est considérée comme un évocateur.", cost: 1 },
                { name: "Armure de la Sentinelle sans Âme", desc: "Améliorez de 1 les caractéristiques d'Endurance et de Sauvegarde du porteur.", cost: 1 }
            ],
            antique: [
                { name: "Sceau de Noctilithe", desc: "Figurine non-PSYKER seulement. Les figurines du porteur ont l'aptitude Insensible à la Douleur 4+ contre les Attaques Psychiques.", cost: 2 },
                { name: "Clé-Dolmen", desc: "Le porteur peut se déployer via les tunnels Dolmen (Deep Strike).", cost: 2 },
                { name: "Miroir de Vantachren", desc: "Les figurines du porteur ont l'aptitude Discrétion. De plus, chaque fois qu'un porteur cible une unité ennemie avec une charge, soustrayez 2 au jet de Charge.", cost: 2 },
                { name: "Œil de Mars", desc: "Après que les joueurs ont déployé leurs armées, vous pouvez placer le porteur en Réserves Stratégiques.", cost: 2 }
            ],
            legendaire: [
                { name: "Lame du Dynaste", desc: "Améliorez de 1 les caractéristiques de Force, de Dégâts et de Pénétration d'Armure des armes de mêlée du porteur. Une fois par bataille, vous pouvez activer cette Relique pour ajouter 2 aux jets de Charge.", cost: 3 },
                { name: "Bouclier Noctique", desc: "Ajoutez 1 aux caractéristiques d'Endurance et de Points de Vie du porteur. Une fois par bataille, quand une attaque cible l'unité du porteur, il peut soustraire 1 à la caractéristique de Dégâts de l'attaque.", cost: 3 },
                { name: "Bâton de l'Omnimessie", desc: "Au début de votre phase de Commandement, le porteur récupère jusqu'à D3 PV perdus. Une fois par bataille, il peut choisir 1 unité ennemie à Portée d'Engagement du porteur. L'unité ennemie subit autant de blessures mortelles que le nombre de PV que le porteur a récupéré.", cost: 3 }
            ]
        },
        sombrerocheHonours: [
            { name: "Carte Nodale", desc: "Tant que le porteur est à portée d'un pion d'objectif, si l'unité du porteur est Ébranlée, remplacez par 1 au lieu de 0 la caractéristique de Contrôle d'Objectif des figurines.", cost: 20 },
            { name: "Chercheur Obsessionnel", desc: "Si le porteur est votre SEIGNEUR DE GUERRE, à la fin de la bataille, jetez 1 D6. En ajoutant 2 au jet si vous avez remporté la bataille. Sur 6+, vous gagnez 5 Fragments de Sombreroche.", cost: 10 },
            { name: "Opportuniste Cupide", desc: "Au début de la bataille, si le porteur est votre SEIGNEUR DE GUERRE, vous pouvez choisir une Posture Stratégique : Agressive (Aptitude Éclaireurs 6), Équilibrée (Aptitude Agent Solitaire), ou Défensive (Aptitude Discrétion).", cost: 15 }
        ],
        sombrerocheRelics: [
            { name: "Désincitateur Empathique", desc: "Au début de la bataille, choisissez 1 pion d'objectif. Tant que le porteur est sur le champ de bataille, les unités amies à portée du pion d'objectif ont une sauvegarde invulnérable de 5+.", cost: 15 },
            { name: "Armement de Noctilithe", desc: "Choisissez 1 arme de mêlée dont est équipé le porteur. Une fois par tour, à la fin de la phase de Combat, vous pouvez activer cette Relique de Croisade. Dans ce cas, jusqu'à la fin de la phase, à chaque attaque de cette arme, on ne peut pas faire de jet de sauvegarde invulnérable contre l'attaque.", cost: 20 },
            { name: "Amulette de Sombreroche", desc: "Chaque fois qu'une attaque de mêlée non modifiée de 6 est allouée au porteur, l'unité attaquante subit 1 blessure mortelle après qu'elle a résolu ses attaques. Si l'attaque avait été faite avec une arme Psychique, cet effet s'applique sur un jet de sauvegarde non modifié de 5+ à la place.", cost: 20 }
        ],
        battleScars: [
            { name: "Dégâts Invalidants", desc: "Cette unité ne peut pas Avancer et on soustrait 1\" à la caractéristique de Mouvement de ses figurines." },
            { name: "Usé par la Guerre", desc: "Chaque fois que cette unité fait un test d'Ébranlement, de Commandement, de Fuite Désespérée ou de Mise Hars de Combat, soustrayez 1 au test." },
            { name: "Épuisé", desc: "Soustrayez 1 à la caractéristique de Contrôle d'Objectif des figurines de cette unité, et cette unité ne reçoit jamais de bonus de Charge." },
            { name: "Disgrâce", desc: "Vous ne pouvez pas utiliser de Stratagème pour affecter cette unité, et elle ne peut pas être Promise à la Grandeur." },
            { name: "Honni", desc: "Les jets de touche ne peuvent pas être relancés pour cette unité. Si elle est Attachée, cela ne s'applique pas aux unités amies et elle ne peut pas être Promise à la Grandeur." },
            { name: "Cicatrices Intérieures", desc: "À chaque Blessure Critique causée contre cette unité, l'attaque blesse automatiquement cette unité." }
        ]
    };

    //======================================================================
    //  ÉLÉMENTS DU DOM
    //======================================================================
    const playerListView = document.getElementById('player-list-view');
    const playerDetailView = document.getElementById('player-detail-view');
    const playerListDiv = document.getElementById('player-list');

    const addPlayerBtn = document.getElementById('add-player-btn');
    const playerModal = document.getElementById('player-modal');
    const playerForm = document.getElementById('player-form');
    const playerModalTitle = document.getElementById('player-modal-title');

    const unitModal = document.getElementById('unit-modal');
    const unitForm = document.getElementById('unit-form');
    const unitModalTitle = document.getElementById('unit-modal-title');

    const worldModal = document.getElementById('world-modal');
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

    const mapModal = document.getElementById('map-modal');
    const mapContainer = document.getElementById('galactic-map-container');

    const campaignInfoBtn = document.getElementById('campaign-info-btn');
    const infoModal = document.getElementById('info-modal');

    const notificationContainer = document.getElementById('notification-container');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmModalTitle = document.getElementById('confirm-modal-title');
    const confirmModalText = document.getElementById('confirm-modal-text');
    const confirmModalOkBtn = document.getElementById('confirm-modal-ok-btn');
    const confirmModalCancelBtn = document.getElementById('confirm-modal-cancel-btn');


    //======================================================================
    //  SYSTÈME DE NOTIFICATION ET DE CONFIRMATION
    //======================================================================

    function showNotification(message, type = 'info', duration = 5000) {
        const notif = document.createElement('div');
        notif.className = `notification ${type}`;
        notif.innerHTML = message;

        notificationContainer.appendChild(notif);

        requestAnimationFrame(() => {
            notif.classList.add('show');
        });

        const hideNotif = () => {
            notif.classList.remove('show');
            notif.classList.add('hide');
            setTimeout(() => {
                notif.remove();
            }, 500);
        };

        const timer = setTimeout(hideNotif, duration);

        notif.addEventListener('click', () => {
            clearTimeout(timer);
            hideNotif();
        });
    }

    function showConfirm(title, text) {
        return new Promise(resolve => {
            confirmModalTitle.textContent = title;
            confirmModalText.innerHTML = text;
            openModal(confirmModal);

            const closeAndResolve = (value) => {
                closeModal(confirmModal);
                resolve(value);
            };

            const okListener = () => closeAndResolve(true);
            const cancelListener = () => closeAndResolve(false);
            const closeBtnListener = () => closeAndResolve(false);

            confirmModalOkBtn.addEventListener('click', okListener, { once: true });
            confirmModalCancelBtn.addEventListener('click', cancelListener, { once: true });
            confirmModal.querySelector('.close-btn').addEventListener('click', closeBtnListener, { once: true });
        });
    }

    //======================================================================
    //  ÉTAT DE L'APPLICATION (STATE)
    //======================================================================
    let campaignData = {
        players: [],
        systems: [],
        isGalaxyGenerated: false
    };

    let activePlayerIndex = -1;
    let editingPlayerIndex = -1;
    let editingUnitIndex = -1;
    let currentlyViewedSystemId = null;
    let mapViewingPlayerId = null;
    let currentMapScale = 1;

    let isPanning = false;
    let wasDragged = false;
    let startX, scrollLeftStart;
    let startY, scrollTopStart;

    const STEP_DISTANCE = 250;
    const GALAXY_SIZE = 3;

    //======================================================================
    //  GESTION DES DONNÉES (LOCALSTORAGE & JSON)
    //======================================================================
    const saveData = () => {
        localStorage.setItem('nexusCrusadeData', JSON.stringify(campaignData));
    };

    const loadData = () => {
        const data = localStorage.getItem('nexusCrusadeData');
        if (data) {
            campaignData = JSON.parse(data);
        }

        let dataWasModified = false;
        if (!campaignData.players) campaignData.players = [];
        if (!campaignData.systems) campaignData.systems = [];

        if (campaignData.isGalaxyGenerated === undefined) {
            campaignData.isGalaxyGenerated = false;
            dataWasModified = true;
        }
        
        const oldGetReachableSystems = (startSystemId) => {
            const reachable = new Set();
            if (!startSystemId) return reachable;

            const playerSystem = campaignData.systems.find(s => s.id === startSystemId);
            if (!playerSystem || !playerSystem.position) {
                reachable.add(startSystemId);
                return reachable;
            }
            const queue = [startSystemId];
            reachable.add(startSystemId);
            while (queue.length > 0) {
                const currentId = queue.shift();
                const currentSystem = campaignData.systems.find(s => s.id === currentId);
                if (currentSystem && currentSystem.connections) {
                    Object.values(currentSystem.connections).forEach(connectedId => {
                        if (connectedId && !reachable.has(connectedId)) {
                            reachable.add(connectedId);
                            queue.push(connectedId);
                        }
                    });
                }
            }
            return reachable;
        };

        campaignData.players.forEach(player => {
            if (player.discoveredSystemIds === undefined) {
                const visibleSystems = oldGetReachableSystems(player.systemId);
                player.discoveredSystemIds = Array.from(visibleSystems);
                dataWasModified = true;
                console.log(`Migrated discovered systems for player ${player.name}`);
            }
            if (player.sombrerochePoints === undefined) {
                player.sombrerochePoints = 0;
                dataWasModified = true;
            }
            // NOUVELLE MIGRATION
            if (player.upgradeSupplyCost === undefined) {
                player.upgradeSupplyCost = 0;
                dataWasModified = true;
            }
        });

        campaignData.systems.forEach(system => {
            if (!system.probedConnections) {
                system.probedConnections = { up: null, down: null, left: null, right: null };
                dataWasModified = true;
            }
            if (!system.connections) {
                system.connections = { up: null, down: null, left: null, right: null };
                dataWasModified = true;
            }
        });

        if (dataWasModified) {
            saveData();
        }

        const lastVersion = localStorage.getItem('nexusCrusadeVersion');
        if (lastVersion !== APP_VERSION) {
            setTimeout(() => {
                showNotification(
                    `<b>Mise à jour v${APP_VERSION} !</b> La logique des coûts d'amélioration est corrigée.`,
                    'info',
                    10000
                );
            }, 500);
            localStorage.setItem('nexusCrusadeVersion', APP_VERSION);
        }
    };

    exportBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify(campaignData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nexus-crusade-backup-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification("Exportation de la campagne initiée.", 'success');
    });

    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (importedData && Array.isArray(importedData.players)) {
                    if (await showConfirm("Confirmation d'importation", "Importer ce fichier écrasera les données actuelles de la campagne. Êtes-vous sûr de vouloir continuer ?")) {
                        campaignData = importedData;
                        loadData(); 
                        saveData();
                        renderPlayerList();
                        switchView('list');
                        showNotification("Importation réussie !", 'success');
                    }
                } else {
                    showNotification("Le fichier sélectionné n'est pas un fichier de campagne valide.", 'error');
                }
            } catch (error) {
                showNotification("Erreur lors de la lecture du fichier : " + error.message, 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = null;
    });

    //======================================================================
    //  GÉNÉRATION DE LA GALAXIE
    //======================================================================
    const getWeightedRandomPlanetType = () => {
        const types = [
            { name: "Monde Ruche", weight: 35 },
            { name: "Agri-monde", weight: 25 },
            { name: "Monde Sauvage", weight: 15 },
            { name: "Monde Mort", weight: 10 },
            { name: "Monde Forge", weight: 10 },
            { name: "Monde Saint (relique)", weight: 5 }
        ];

        const totalWeight = types.reduce((sum, type) => sum + type.weight, 0);
        let random = Math.random() * totalWeight;

        for (const type of types) {
            if (random < type.weight) {
                return type.name;
            }
            random -= type.weight;
        }
    };
    
    const getUniqueSystemName = (existingNames) => {
        const usedNames = existingNames || new Set();
        const systemNamesList = SYSTEM_NAMES;
        const availableNames = systemNamesList.filter(name => !usedNames.has(name));
        if (availableNames.length === 0) {
            let fallbackName;
            let attempts = 0;
            do {
                fallbackName = `Secteur Inconnu ${Math.floor(Math.random() * 1000)}`;
                attempts++;
            } while (usedNames.has(fallbackName) && attempts < 100);
            return fallbackName;
        }
        return availableNames[Math.floor(Math.random() * availableNames.length)];
    };

    const generateRandomNPCSystem = (usedNames) => {
        const planetNames = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta"];
        const numPlanets = Math.floor(Math.random() * 6) + 3; // 3 à 8 planètes
        const defenseValues = [500, 1000, 1500, 2000];
        const planets = [];
        for (let i = 0; i < numPlanets; i++) {
            planets.push({
                type: getWeightedRandomPlanetType(),
                name: `${planetNames[i] || `Planète ${i + 1}`}`,
                owner: "neutral",
                defense: defenseValues[Math.floor(Math.random() * defenseValues.length)]
            });
        }
        return {
            id: crypto.randomUUID(),
            name: getUniqueSystemName(usedNames),
            owner: 'npc',
            planets: planets,
            connections: { up: null, down: null, left: null, right: null },
            probedConnections: { up: null, down: null, left: null, right: null },
            position: { x: 0, y: 0 }
        };
    };

    const generateGalaxy = () => {
        showNotification("Génération d'une nouvelle galaxie...", 'info');
        const newSystems = [];
        const usedNamesInGeneration = new Set();

        for (let y = 0; y < GALAXY_SIZE; y++) {
            for (let x = 0; x < GALAXY_SIZE; x++) {
                const system = generateRandomNPCSystem(usedNamesInGeneration);
                system.position = {
                    x: x * STEP_DISTANCE + (STEP_DISTANCE / 2),
                    y: y * STEP_DISTANCE + (STEP_DISTANCE / 2)
                };
                newSystems.push(system);
                usedNamesInGeneration.add(system.name);
            }
        }
        
        campaignData.systems = newSystems;
        campaignData.isGalaxyGenerated = true;
        showNotification(`Galaxie de <b>${newSystems.length}</b> systèmes PNJ créée.`, 'success');
    };


    //======================================================================
    //  ANALYSE DE CONTRÔLE & STATUT (LOGIQUE CENTRALE)
    //======================================================================
    const getSystemControlInfo = (system) => {
        const controlBreakdown = {};
        const controllingPlayerIds = new Set();
        system.planets.forEach(planet => {
            const ownerId = planet.owner;
            if (ownerId !== 'neutral') {
                controllingPlayerIds.add(ownerId);
            }
            controlBreakdown[ownerId] = (controlBreakdown[ownerId] || 0) + 1;
        });
        return { controlBreakdown, controllingPlayerIds };
    };

    const getSystemStatusForPlayer = (system, viewingPlayerId) => {
        const { controllingPlayerIds } = getSystemControlInfo(system);
        const otherPlayersInSystem = new Set(controllingPlayerIds);
        otherPlayersInSystem.delete(viewingPlayerId);

        if (otherPlayersInSystem.size > 0) return { status: 'hostile', text: 'Présence Ennemie' };
        if (controllingPlayerIds.has(viewingPlayerId)) return { status: 'friendly', text: 'Contrôlé par vous' };
        if (controllingPlayerIds.size === 0) return { status: 'neutral', text: 'Neutre' };
        return { status: 'hostile', text: 'Contrôlé par Ennemi' };
    };
    
    const getReachableSystemsForPlayer = (playerId) => {
        const player = campaignData.players.find(p => p.id === playerId);
        if (!player) {
            return new Set();
        }
        
        if (!player.discoveredSystemIds) {
            player.discoveredSystemIds = [player.systemId];
        }

        return new Set(player.discoveredSystemIds);
    };

    const isPlayerDiscoverable = (playerId) => {
        const player = campaignData.players.find(p => p.id === playerId);
        if (!player) return false;
        const homeSystem = campaignData.systems.find(s => s.id === player.systemId);
        return homeSystem && !!homeSystem.position;
    };


    //======================================================================
    //  LOGIQUE DE RENDU (AFFICHAGE)
    //======================================================================
    const switchView = (view) => {
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
        document.getElementById('supply-limit').value = player.supplyLimit;
        // NOUVEAU: Mettre à jour le champ pour le coût des optimisations
        document.getElementById('upgrade-supply-cost').value = player.upgradeSupplyCost || 0;


        const battleTally = (player.battles.wins || 0) + (player.battles.losses || 0);
        document.getElementById('battle-tally').textContent = battleTally;
        document.getElementById('wins').textContent = player.battles.wins || 0;
        document.getElementById('losses').textContent = player.battles.losses || 0;

        document.getElementById('goals-notes').value = player.goalsNotes || '';

        renderOrderOfBattle();
    };
    
    // NOUVELLE FONCTION: Met à jour l'affichage du ravitaillement
    const updateSupplyDisplay = () => {
        if (activePlayerIndex === -1) return;
        const player = campaignData.players[activePlayerIndex];

        const supplyFromUnits = (player.units || []).reduce((total, unit) => total + (unit.power || 0), 0);
        const supplyFromUpgrades = player.upgradeSupplyCost || 0;
        const totalUsed = supplyFromUnits + supplyFromUpgrades;
        const remainingSupply = (player.supplyLimit || 0) - totalUsed;

        // NOTE: Ces mises à jour supposent que votre HTML a été modifié pour inclure
        // un input avec id="upgrade-supply-cost" et un span avec id="supply-remaining".
        document.getElementById('supply-used').textContent = totalUsed;
        document.getElementById('supply-remaining').textContent = remainingSupply;
    };

    const getRankFromXp = (xp) => {
        if (xp >= 51) return 'Légendaire';
        if (xp >= 31) return 'Héroïque';
        if (xp >= 16) return 'Aguerri';
        if (xp >= 6) return 'Éprouvé';
        return 'Paré au Combat';
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

        // MODIFIÉ: Appelle la nouvelle fonction pour mettre à jour tout le bloc de ravitaillement
        updateSupplyDisplay();
    };

    const renderPlanetarySystem = (systemId) => {
        const system = campaignData.systems.find(s => s.id === systemId);
        if (!system) return;

        currentlyViewedSystemId = systemId;
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


    //======================================================================
    //  LOGIQUE D'EXPLORATION
    //======================================================================
    const handleExploration = async (direction) => {
        const currentSystem = campaignData.systems.find(s => s.id === currentlyViewedSystemId);
        if (!currentSystem) return;

        const viewingPlayer = campaignData.players.find(p => p.id === mapViewingPlayerId);
        if (!viewingPlayer) {
            showNotification("Erreur : Impossible de trouver le joueur actif pour l'exploration.", 'error');
            return;
        }

        const connectedSystemId = currentSystem.connections[direction];
        const oppositeDirection = { up: 'down', down: 'up', left: 'right', right: 'left' }[direction];

        if (connectedSystemId && viewingPlayer.discoveredSystemIds.includes(connectedSystemId)) {
            renderPlanetarySystem(connectedSystemId);
            return;
        }

        if (!currentSystem.position) {
            showNotification("Vous devez d'abord conquérir votre système natal pour rejoindre la carte galactique.", 'warning', 6000);
            return;
        }
        const hasEnemyPlanetInCurrent = currentSystem.planets.some(p => p.owner !== 'neutral' && p.owner !== viewingPlayer.id);
        if (hasEnemyPlanetInCurrent) {
            showNotification("<b>Blocus ennemi !</b> Vous ne pouvez pas explorer depuis ce système tant qu'une planète ennemie est présente.", 'error');
            return;
        }
        const hasFriendlyPlanetInCurrent = currentSystem.planets.some(p => p.owner === viewingPlayer.id);
        if (!hasFriendlyPlanetInCurrent && currentSystem.owner !== viewingPlayer.id) {
            showNotification("Vous devez contrôler au moins une planète dans ce système pour pouvoir explorer plus loin.", 'warning');
            return;
        }
        
        const parentPos = currentSystem.position;
        const targetPos = { x: parentPos.x, y: parentPos.y };
        if (direction === 'up') targetPos.y -= STEP_DISTANCE;
        else if (direction === 'down') targetPos.y += STEP_DISTANCE;
        else if (direction === 'left') targetPos.x -= STEP_DISTANCE;
        else if (direction === 'right') targetPos.x += STEP_DISTANCE;

        const discoveredSystem = campaignData.systems.find(s => s.position && s.position.x === targetPos.x && s.position.y === targetPos.y);

        if (!discoveredSystem) {
            showNotification("Vous avez atteint le bord de l'espace connu.", 'info');
            return;
        }

        const probedInfo = currentSystem.probedConnections ? currentSystem.probedConnections[direction] : null;

        if (probedInfo && probedInfo.status === 'player_contact') {
            const confirmed = await showConfirm(
                "Établir un Contact Hostile",
                `Vos sondes confirment la présence d'un autre joueur. Voulez-vous établir une connexion permanente ?<br><br><b>Attention :</b> Cette action est irréversible et révèlera immédiatement votre position à cet adversaire.`
            );

            if (confirmed) {
                currentSystem.connections[direction] = discoveredSystem.id;
                discoveredSystem.connections[oppositeDirection] = currentSystem.id;
                currentSystem.probedConnections[direction] = null;

                if (!viewingPlayer.discoveredSystemIds.includes(discoveredSystem.id)) {
                    viewingPlayer.discoveredSystemIds.push(discoveredSystem.id);
                }

                const discoveredPlayer = campaignData.players.find(p => p.id === discoveredSystem.owner);
                if (discoveredPlayer) {
                    if (!discoveredPlayer.discoveredSystemIds) discoveredPlayer.discoveredSystemIds = [];
                    if (!discoveredPlayer.discoveredSystemIds.includes(currentSystem.id)) {
                        discoveredPlayer.discoveredSystemIds.push(currentSystem.id);
                        showNotification(`Le joueur <b>${discoveredPlayer.name}</b> a été alerté de votre présence.`, 'warning');
                    }
                }
                
                saveData();
                showNotification(`Connexion établie vers le système hostile !`, 'success');
                renderPlanetarySystem(discoveredSystem.id);
            }
            return;
        }

        if (probedInfo) {
            const probedSystem = campaignData.systems.find(s => s.id === probedInfo.id);
            if (!probedSystem) {
                showNotification("Erreur: Le système sondé n'a pas été retrouvé.", 'error');
                currentSystem.probedConnections[direction] = null;
                saveData();
                updateExplorationArrows(currentSystem);
                return;
            }
            
            if (await showConfirm("Connexion PNJ", `Vous avez déjà sondé le système PNJ "<b>${probedInfo.name}</b>".<br>Voulez-vous établir une connexion permanente ?`)) {
                currentSystem.connections[direction] = probedSystem.id;
                probedSystem.connections[oppositeDirection] = currentSystem.id;
                currentSystem.probedConnections[direction] = null;
                
                if (!viewingPlayer.discoveredSystemIds.includes(probedSystem.id)) {
                    viewingPlayer.discoveredSystemIds.push(probedSystem.id);
                }
                
                saveData();
                renderPlanetarySystem(probedSystem.id);
                showNotification(`Connexion établie avec ${probedSystem.name}`, 'success');
            }
            return;
        }

        if (connectedSystemId && !viewingPlayer.discoveredSystemIds.includes(connectedSystemId)) { 
            const confirmDiscovery = await showConfirm(
                "Découverte de Route",
                `Vos scanners indiquent une route de saut stable mais non cartographiée vers le système <b>${discoveredSystem.name}</b>. Voulez-vous suivre ce chemin et l'ajouter à vos cartes ?`
            );
            if (confirmDiscovery) {
                viewingPlayer.discoveredSystemIds.push(connectedSystemId);
                saveData();
                renderPlanetarySystem(connectedSystemId);
                showNotification(`Nouvelle route cartographiée vers le système <b>${discoveredSystem.name}</b>.`, 'success');
            }
            return;
        }

        const useProbe = await showConfirm("Méthode d'Exploration", "Envoyer une sonde (coût: 1 RP) ?<br><small>(Annuler pour un saut à l'aveugle standard, gratuit mais plus risqué)</small>");
        
        if (useProbe) {
            if (viewingPlayer.requisitionPoints < 1) {
                showNotification("Points de Réquisition insuffisants !", 'warning');
                return;
            }
            viewingPlayer.requisitionPoints--;
            
            const hasEnemyPlanetInTarget = discoveredSystem.planets.some(
                p => p.owner !== 'neutral' && p.owner !== viewingPlayer.id
            );

            if (hasEnemyPlanetInTarget) {
                showNotification(`<b>Contact hostile détecté !</b> La sonde rapporte la présence d'une autre force de croisade.`, 'error', 8000);
                currentSystem.probedConnections[direction] = { id: discoveredSystem.id, status: 'player_contact' };
            } else { 
                showNotification(`<b>Résultat de la sonde :</b><br>Nouveau contact ! Vous avez découvert le système PNJ "<b>${discoveredSystem.name}</b>".`, 'info', 8000);
                currentSystem.probedConnections[direction] = { id: discoveredSystem.id, name: discoveredSystem.name, status: 'npc_contact' };
            }

            showNotification("Information enregistrée. Cliquez à nouveau sur la flèche pour agir.", 'info', 8000);
            saveData();
            if (!playerDetailView.classList.contains('hidden')) renderPlayerDetail();
            updateExplorationArrows(currentSystem);
        } else {
            showNotification("Saut à l'aveugle initié...", 'info', 3000);

            currentSystem.connections[direction] = discoveredSystem.id;
            discoveredSystem.connections[oppositeDirection] = currentSystem.id;

            if (!viewingPlayer.discoveredSystemIds.includes(discoveredSystem.id)) {
                viewingPlayer.discoveredSystemIds.push(discoveredSystem.id);
            }

            const hasEnemyInTarget = discoveredSystem.planets.some(p => p.owner !== 'neutral' && p.owner !== viewingPlayer.id);

            if (hasEnemyInTarget) {
                showNotification(`<b>Contact hostile !</b> Le saut à l'aveugle vous a mené dans le système <b>${discoveredSystem.name}</b>. Votre arrivée a été détectée !`, 'error', 8000);
                
                const enemyPlayerIds = new Set(discoveredSystem.planets.map(p => p.owner).filter(o => o !== 'neutral' && o !== viewingPlayer.id));
                enemyPlayerIds.forEach(enemyId => {
                    const enemyPlayer = campaignData.players.find(p => p.id === enemyId);
                    if (enemyPlayer && !enemyPlayer.discoveredSystemIds.includes(currentSystem.id)) {
                         if (!enemyPlayer.discoveredSystemIds) enemyPlayer.discoveredSystemIds = [];
                         enemyPlayer.discoveredSystemIds.push(currentSystem.id);
                         console.log(`Player ${enemyPlayer.name} has been alerted to system ${currentSystem.name}`);
                    }
                });
            } else {
                showNotification(`Saut à l'aveugle réussi ! Vous avez découvert le système PNJ "<b>${discoveredSystem.name}</b>".`, 'success', 8000);
            }
            
            saveData();
            renderPlanetarySystem(discoveredSystem.id);
        }
    };


    //======================================================================
    // PLACEMENT DU SYSTÈME DU JOUEUR SUR LA CARTE
    //======================================================================
    const findUndiscoveredNpcSystem = () => {
        const allDiscoveredIdsByPlayers = new Set();
        campaignData.players.forEach(player => {
            if (player.discoveredSystemIds) {
                player.discoveredSystemIds.forEach(id => allDiscoveredIdsByPlayers.add(id));
            } else if (player.systemId) {
                allDiscoveredIdsByPlayers.add(player.systemId);
            }
        });

        const candidates = campaignData.systems.filter(system =>
            system.owner === 'npc' && !allDiscoveredIdsByPlayers.has(system.id) && system.position
        );
        if (candidates.length === 0) return null;
        return candidates[Math.floor(Math.random() * candidates.length)];
    };
    
    const placePlayerSystemOnMap = async (playerId) => {
        const player = campaignData.players.find(p => p.id === playerId);
        if (!player) return;

        const playerSystem = campaignData.systems.find(s => s.id === player.systemId);
        if (!playerSystem || playerSystem.position) return;

        const allPlanetsControlled = playerSystem.planets.every(p => p.owner === playerId);
        if (!allPlanetsControlled) return;
        
        const joinMap = await showConfirm(`Félicitations, ${player.name} !`, "Vous avez unifié votre système natal. Voulez-vous maintenant rejoindre la carte galactique principale ?");
        if (!joinMap) return;

        const targetNpcSystem = findUndiscoveredNpcSystem();
        if (!targetNpcSystem) {
            showNotification("Impossible de trouver un système PNJ non découvert pour établir une tête de pont. La galaxie est peut-être trop encombrée.", 'error', 8000);
            return;
        }

        const oldConnections = { ...targetNpcSystem.connections };
        const oldPosition = { ...targetNpcSystem.position };

        for (const dir in oldConnections) {
            const neighborId = oldConnections[dir];
            if (neighborId) {
                const neighborSystem = campaignData.systems.find(s => s.id === neighborId);
                if (neighborSystem) {
                    const oppositeDir = { up: 'down', down: 'up', left: 'right', right: 'left' }[dir];
                    if (neighborSystem.connections) {
                       neighborSystem.connections[oppositeDir] = playerSystem.id;
                    }
                    const neighborOwner = campaignData.players.find(p => p.discoveredSystemIds && p.discoveredSystemIds.includes(neighborId));
                    if(neighborOwner && !neighborOwner.discoveredSystemIds.includes(playerSystem.id)) {
                        neighborOwner.discoveredSystemIds.push(playerSystem.id);
                    }
                }
            }
        }
        
        playerSystem.position = oldPosition;
        playerSystem.connections = oldConnections;
        playerSystem.name = `${player.name}'s Bastion`;
        
        Object.values(oldConnections).forEach(id => {
            if(id && !player.discoveredSystemIds.includes(id)) {
                player.discoveredSystemIds.push(id);
            }
        });

        const npcSystemIndex = campaignData.systems.findIndex(s => s.id === targetNpcSystem.id);
        if (npcSystemIndex > -1) {
            campaignData.systems.splice(npcSystemIndex, 1);
        }

        showNotification("<b>Tête de pont établie !</b> Votre système est maintenant connecté à la carte galactique. Vous pouvez explorer !", 'success', 8000);
        saveData();
        renderPlayerList();
        if (!mapModal.classList.contains('hidden')) renderGalacticMap();
        if (!worldModal.classList.contains('hidden') && currentlyViewedSystemId === playerSystem.id) renderPlanetarySystem(playerSystem.id);
    };


    //======================================================================
    //  GESTION DES MODALES ET ÉVÉNEMENTS
    //======================================================================
    const openModal = (modal) => modal.classList.remove('hidden');
    const closeModal = (modal) => modal.classList.add('hidden');

    document.querySelectorAll('.modal .close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => closeModal(e.target.closest('.modal')));
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) closeModal(e.target);
    });

    campaignInfoBtn.addEventListener('click', () => openModal(infoModal));

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

    const openUnitModal = () => {
        unitForm.reset();
        document.getElementById('unit-id').value = '';
        const role = document.getElementById('unit-role').value;
        document.getElementById('unit-rank-display').textContent = getRankFromXp(0);
        
        // Déplacer la section des améliorations en haut
        const unitModalContent = unitModal.querySelector('.modal-content');
        const upgradesSection = unitModalContent.querySelector('#unit-upgrades-section');
        const unitCardHeader = unitModalContent.querySelector('.unit-card-header');
        if (upgradesSection && unitCardHeader) {
            unitCardHeader.after(upgradesSection);
        }

        populateUpgradeSelectors();
        openModal(unitModal);
    };

    document.getElementById('add-unit-btn').addEventListener('click', () => {
        editingUnitIndex = -1;
        unitModalTitle.textContent = "Ajouter une Unité";
        openUnitModal();
    });

    resetCampaignBtn.addEventListener('click', async () => {
        const confirmReset = await showConfirm(
            "Réinitialiser la Campagne ?",
            "Êtes-vous sûr ? Cette action va générer une <b>nouvelle carte galactique</b> et réinitialiser la position de TOUS les joueurs. Leurs fiches de personnage (unités, points, etc.) seront conservées."
        );
        if (confirmReset) {
            generateGalaxy();
            const playerSystems = [];
            campaignData.players.forEach((player) => {
                const newSystemId = crypto.randomUUID();
                const DEFENSE_VALUES = [500, 1000, 1500, 2000];
                const planetNames = ["Prima", "Secundus", "Tertius", "Quartus", "Quintus", "Sextus", "Septimus", "Octavus"];
                const numPlanets = 5;
                const newPlanets = Array.from({ length: numPlanets }, (_, i) => ({
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
            saveData();
            switchView('list');
            renderPlayerList();
            showNotification("Le Warp a tout consumé ! Une nouvelle galaxie a été générée.", 'success', 8000);
        }
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
            backToSystemBtn.classList.add('hidden');
            renderPlayerDetail();
            switchView('detail');
        } else if (target.matches('.world-btn')) {
            const playerIndex = parseInt(target.dataset.index);
            const player = campaignData.players[playerIndex];
            if (player.systemId) {
                activePlayerIndex = playerIndex;
                mapViewingPlayerId = player.id;
                openModal(worldModal);
                setTimeout(() => renderPlanetarySystem(player.systemId), 50);
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

    document.getElementById('units-tbody').addEventListener('click', async (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        if (target.classList.contains('edit-unit-btn')) {
            editingUnitIndex = parseInt(target.dataset.index);
            const unit = campaignData.players[activePlayerIndex].units[editingUnitIndex];
            unitModalTitle.textContent = `Modifier ${unit.name}`;
            openUnitModal(); // Ouvre la modale et place les éléments correctement
            
            // Pré-remplir les champs après ouverture
            Object.keys(unit).forEach(key => {
                const elementId = `unit-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
                const element = document.getElementById(elementId);
                if (element) {
                     if (key === 'battleHonours') {
                        document.getElementById('unit-honours').value = unit[key] || '';
                    } else if (key === 'battleScars') {
                        document.getElementById('unit-scars').value = unit[key] || '';
                    } else if (element.type === 'checkbox') {
                        element.checked = unit[key];
                    } else {
                        element.value = unit[key];
                    }
                }
            });
            document.getElementById('unit-id').value = editingUnitIndex;
            document.getElementById('unit-rank-display').textContent = getRankFromXp(unit.xp || 0);
            populateUpgradeSelectors(); // Repopulate selectors based on loaded unit role

        } else if (target.classList.contains('delete-unit-btn')) {
            const index = parseInt(target.dataset.index);
            const unitName = campaignData.players[activePlayerIndex].units[index].name;
            if (await showConfirm("Supprimer l'unité", `Supprimer l'unité "<b>${unitName}</b>" de l'ordre de bataille ?`)) {
                campaignData.players[activePlayerIndex].units.splice(index, 1);
                saveData();
                renderOrderOfBattle();
                showNotification(`Unité <b>${unitName}</b> supprimée.`, 'info');
            }
        }
    });
    
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

            const halveDefenseBtn = document.getElementById('halve-defense-btn');
            halveDefenseBtn.classList.toggle('hidden', planet.owner !== 'neutral' || planet.defense === 0);

            ownerSelect.dispatchEvent(new Event('change'));
            openModal(planetTypeModal);
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

    mapContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const viewport = mapContainer.querySelector('.map-viewport');
        if (!viewport) return;
        const scaleChange = e.deltaY < 0 ? 0.1 : -0.1;
        currentMapScale = Math.max(0.2, Math.min(currentMapScale + 2.5, 2.5));
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
    });

    systemContainer.addEventListener('click', (e) => {
        const arrow = e.target.closest('.explore-arrow');
        if (arrow && arrow.style.cursor !== 'not-allowed') handleExploration(arrow.id.replace('explore-', ''));
    });

    document.getElementById('planet-owner-select').addEventListener('change', (e) => {
        const isNeutral = e.target.value === 'neutral';
        document.getElementById('planet-defense-container').classList.toggle('hidden', !isNeutral);
        document.getElementById('planet-defense-input').disabled = !isNeutral;
    });

    backToListBtn.addEventListener('click', () => switchView('list'));

    backToSystemBtn.addEventListener('click', () => {
        if (currentlyViewedSystemId) {
            playerDetailView.classList.add('hidden');
            openModal(worldModal);
            setTimeout(() => renderPlanetarySystem(currentlyViewedSystemId), 50);
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
            const DEFENSE_VALUES = [500, 1000, 1500, 2000];
            const planetNames = ["Prima", "Secundus", "Tertius", "Quartus", "Quintus", "Sextus", "Septimus", "Octavus"];
            const numPlanets = 5;
            const newPlanets = Array.from({ length: numPlanets }, (_, i) => ({
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

            campaignData.players.push({
                id: newPlayerId, systemId: newSystemId, name: name,
                faction: document.getElementById('player-faction-input').value.trim(),
                crusadeFaction: '', requisitionPoints: 5, sombrerochePoints: 0,
                supplyLimit: 50, 
                upgradeSupplyCost: 0, // NOUVEAU
                battles: { wins: 0, losses: 0 },
                goalsNotes: '', units: [],
                discoveredSystemIds: [newSystemId]
            });
        }
        saveData();
        renderPlayerList();
        closeModal(playerModal);
    });

    unitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('unit-name').value.trim();
        if (!name) return;

        const unitData = {
            name: name, role: document.getElementById('unit-role').value,
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

        const player = campaignData.players[activePlayerIndex];
        if (editingUnitIndex > -1) {
            const existingUnit = player.units[editingUnitIndex];
            player.units[editingUnitIndex] = { ...existingUnit, ...unitData };
        } else {
            unitData.id = crypto.randomUUID();
            player.units.push(unitData);
        }
        saveData();
        renderOrderOfBattle();
        closeModal(unitModal);
    });

    planetTypeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const { value: systemId } = document.getElementById('planet-system-id');
        const { value: planetIndex } = document.getElementById('planet-index');
        const system = campaignData.systems.find(s => s.id === systemId);
        const planet = system.planets[planetIndex];

        const newOwner = document.getElementById('planet-owner-select').value;
        planet.type = document.getElementById('planet-type-select').value;
        planet.name = document.getElementById('planet-name-input').value.trim() || planet.name;
        planet.owner = newOwner;
        planet.defense = (planet.owner === 'neutral') ? parseInt(document.getElementById('planet-defense-input').value) || 0 : 0;

        saveData();
        renderPlanetarySystem(systemId);
        closeModal(planetTypeModal);

        if (newOwner !== 'neutral') {
            placePlayerSystemOnMap(newOwner);
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
            saveData();
            renderPlanetarySystem(system.id);
            if (activePlayerIndex === campaignData.players.findIndex(p => p.id === viewingPlayer.id) && !playerDetailView.classList.contains('hidden')) renderPlayerDetail();
            closeModal(planetTypeModal);
            showNotification(`Planète randomisée ! Nouveau type : <b>${planet.type}</b>.`, 'success');
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
            saveData();
            renderPlanetarySystem(system.id);
            if (activePlayerIndex === campaignData.players.findIndex(p => p.id === viewingPlayer.id) && !playerDetailView.classList.contains('hidden')) renderPlayerDetail();
            closeModal(planetTypeModal);
            showNotification(`Sabotage réussi ! Défenses réduites à <b>${newDefense}</b>.`, 'success');
        }
    });

    document.getElementById('unit-xp').addEventListener('input', (e) => {
        document.getElementById('unit-rank-display').textContent = getRankFromXp(parseInt(e.target.value) || 0);
    });
    
    document.getElementById('unit-role').addEventListener('change', (e) => {
        populateUpgradeSelectors();
    });

    // MODIFIÉ: L'event listener pour les inputs de la grille d'info joueur a été amélioré.
    document.querySelector('.player-info-grid').addEventListener('input', (e) => {
        if (activePlayerIndex === -1) return;
        const player = campaignData.players[activePlayerIndex];
        let needsSupplyUpdate = false;

        const targetId = e.target.id;
        const value = e.target.value;

        if (targetId === 'supply-limit') {
            player.supplyLimit = parseInt(value) || 0;
            needsSupplyUpdate = true;
        } else if (targetId === 'crusade-faction') {
            player.crusadeFaction = value;
        } else if (targetId === 'upgrade-supply-cost') { // NOUVEAU
            player.upgradeSupplyCost = parseInt(value) || 0;
            needsSupplyUpdate = true;
        }

        saveData();

        if (needsSupplyUpdate) {
            updateSupplyDisplay();
        }
    });

    document.getElementById('goals-notes').addEventListener('change', (e) => {
        if (activePlayerIndex > -1) {
            campaignData.players[activePlayerIndex].goalsNotes = e.target.value;
            saveData();
        }
    });

    document.querySelector('.player-info-grid').addEventListener('click', (e) => {
        const button = e.target.closest('.tally-btn');
        if (!button || activePlayerIndex === -1) return;
        const player = campaignData.players[activePlayerIndex];
        const action = button.dataset.action;
        const [operation, stat] = action.split('-');
        const change = operation === 'increase' ? 1 : -1;

        if (stat === 'rp') {
            player.requisitionPoints = Math.max(0, player.requisitionPoints + change);
        } else if (stat === 'sombreroche') {
            player.sombrerochePoints = Math.max(0, (player.sombrerochePoints || 0) + change);
        } else {
            const battleStat = stat === 'win' ? 'wins' : 'losses';

            if (change < 0 && (player.battles[battleStat] || 0) === 0) return;

            if (!player.battles) player.battles = { wins: 0, losses: 0 };
            player.battles[battleStat] = Math.max(0, (player.battles[battleStat] || 0) + change);

            if (change > 0) {
                player.requisitionPoints++;
            } else {
                player.requisitionPoints = Math.max(0, player.requisitionPoints - 1);
            }
        }
        saveData();
        renderPlayerDetail();
    });

    //======================================================================
    //  NOUVELLE LOGIQUE : GESTION DES AMÉLIORATIONS D'UNITÉ
    //======================================================================
    const populateUpgradeSelectors = () => {
        const unitRole = document.getElementById('unit-role').value;
        const isCharacter = unitRole === 'Personnage' || unitRole === 'Hero Epique';

        const battleTraitSelect = document.getElementById('battle-trait-select');
        battleTraitSelect.innerHTML = '<option value="">Choisir un trait...</option>';
        const traits = crusadeRules.battleTraits[unitRole] || [];
        traits.forEach(trait => {
            battleTraitSelect.innerHTML += `<option value="${trait.name}">${trait.name}</option>`;
        });

        const weaponModSelect = document.getElementById('weapon-mod-select');
        weaponModSelect.innerHTML = '<option value="">Choisir une modification...</option>';
        crusadeRules.weaponMods.forEach(mod => {
            weaponModSelect.innerHTML += `<option value="${mod.name}">${mod.name}</option>`;
        });

        const relicSelect = document.getElementById('relic-select');
        relicSelect.innerHTML = '<option value="">Choisir une relique...</option>';
        if (isCharacter) {
            Object.entries(crusadeRules.relics).forEach(([type, relics]) => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = `${type.charAt(0).toUpperCase() + type.slice(1)} (+${relics[0].cost} PC)`;
                relics.forEach(relic => {
                    optgroup.innerHTML += `<option value="${relic.name}" data-cost="${relic.cost}" data-type="relics.${type}">${relic.name}</option>`;
                });
                relicSelect.appendChild(optgroup);
            });
        }
        relicSelect.disabled = !isCharacter;

        const battleScarSelect = document.getElementById('battle-scar-select');
        battleScarSelect.innerHTML = '<option value="">Choisir une cicatrice...</option>';
        crusadeRules.battleScars.forEach(scar => {
            battleScarSelect.innerHTML += `<option value="${scar.name}">${scar.name}</option>`;
        });

        const sombrerocheHonourSelect = document.getElementById('sombreroche-honour-select');
        sombrerocheHonourSelect.innerHTML = '<option value="">Choisir un honneur...</option>';
        if (isCharacter) {
            crusadeRules.sombrerocheHonours.forEach(honour => {
                sombrerocheHonourSelect.innerHTML += `<option value="${honour.name}" data-cost="${honour.cost}">${honour.name} (${honour.cost} Éclats)</option>`;
            });
        }
        sombrerocheHonourSelect.disabled = !isCharacter;

        const sombrerocheRelicSelect = document.getElementById('sombreroche-relic-select');
        sombrerocheRelicSelect.innerHTML = '<option value="">Choisir une relique...</option>';
        if (isCharacter) {
            crusadeRules.sombrerocheRelics.forEach(relic => {
                sombrerocheRelicSelect.innerHTML += `<option value="${relic.name}" data-cost="${relic.cost}">${relic.name} (${relic.cost} Éclats)</option>`;
            });
        }
        sombrerocheRelicSelect.disabled = !isCharacter;
    };
    
    const addUpgradeToTextarea = (textareaId, upgradeName, upgradeDesc) => {
        const textarea = document.getElementById(textareaId);
        const textToAdd = `\n- ${upgradeName}: ${upgradeDesc}`;
        textarea.value = (textarea.value || '').trim() + textToAdd;
    };

    async function handleRpPurchase(upgradeName, rpCost, onConfirm) {
        const player = campaignData.players[activePlayerIndex];
        if (player.requisitionPoints < rpCost) {
            showNotification(`Points de Réquisition insuffisants (Requis: ${rpCost}).`, 'error');
            return;
        }

        const confirmText = `Voulez-vous dépenser <b>${rpCost} Point de Réquisition</b> pour cet achat : <i>${upgradeName}</i>?<br><br>Solde actuel : ${player.requisitionPoints} RP<br>Solde après achat : ${player.requisitionPoints - rpCost} RP`;
        
        if (await showConfirm("Confirmer Dépense de Réquisition", confirmText)) {
            player.requisitionPoints -= rpCost;
            onConfirm();
            document.getElementById('pr-points').textContent = player.requisitionPoints;
            saveData();
            showNotification(`${upgradeName} acheté !`, 'success');
        }
    }

    document.getElementById('add-battle-trait-btn').addEventListener('click', () => {
        const select = document.getElementById('battle-trait-select');
        const traitName = select.value;
        if (!traitName) return;

        const unitRole = document.getElementById('unit-role').value;
        const trait = crusadeRules.battleTraits[unitRole].find(t => t.name === traitName);
        if (!trait) return;
        
        handleRpPurchase(`Trait: ${trait.name}`, 1, () => {
            addUpgradeToTextarea('unit-honours', trait.name, trait.desc);
            const crusadePointsInput = document.getElementById('unit-crusade-points');
            crusadePointsInput.value = (parseInt(crusadePointsInput.value) || 0) + 1;
            select.value = '';
        });
    });

    document.getElementById('add-weapon-mod-btn').addEventListener('click', () => {
        const select = document.getElementById('weapon-mod-select');
        const modName = select.value;
        if (!modName) return;

        const mod = crusadeRules.weaponMods.find(m => m.name === modName);
        if (!mod) return;

        handleRpPurchase(`Mod. d'Arme: ${mod.name}`, 1, () => {
            addUpgradeToTextarea('unit-honours', `Mod. d'Arme: ${mod.name}`, mod.desc);
            const crusadePointsInput = document.getElementById('unit-crusade-points');
            crusadePointsInput.value = (parseInt(crusadePointsInput.value) || 0) + 1;
            select.value = '';
        });
    });

    document.getElementById('add-relic-btn').addEventListener('click', () => {
        const select = document.getElementById('relic-select');
        const selectedOption = select.options[select.selectedIndex];
        if (!selectedOption.dataset.type) return;

        const [category, type] = selectedOption.dataset.type.split('.');
        const relic = crusadeRules[category][type].find(r => r.name === selectedOption.value);
        if (!relic) return;
        
        handleRpPurchase(`Relique: ${relic.name}`, 1, () => {
            addUpgradeToTextarea('unit-relic', relic.name, relic.desc);
            const crusadePointsInput = document.getElementById('unit-crusade-points');
            crusadePointsInput.value = (parseInt(crusadePointsInput.value) || 0) + relic.cost;
            select.value = '';
        });
    });
    
    document.getElementById('add-battle-scar-btn').addEventListener('click', () => {
        const select = document.getElementById('battle-scar-select');
        const scarName = select.value;
        if (!scarName) return;

        const scar = crusadeRules.battleScars.find(s => s.name === scarName);
        addUpgradeToTextarea('unit-scars', scar.name, scar.desc);
        select.value = '';
        showNotification("Cicatrice de Bataille ajoutée.", 'info');
    });
    
    document.getElementById('add-sombreroche-honour-btn').addEventListener('click', async () => {
        const select = document.getElementById('sombreroche-honour-select');
        const selectedOption = select.options[select.selectedIndex];
        if (!selectedOption.value) return;

        const player = campaignData.players[activePlayerIndex];
        const cost = parseInt(selectedOption.dataset.cost);
        
        if (player.sombrerochePoints < cost) {
            showNotification(`Éclats de Sombreroche insuffisants (Requis: ${cost}).`, 'error');
            return;
        }

        const honour = crusadeRules.sombrerocheHonours.find(h => h.name === selectedOption.value);
        const confirmText = `Voulez-vous dépenser <b>${cost} Éclats de Sombreroche</b> pour cet Honneur : <i>${honour.name}</i>?<br><br>Solde actuel : ${player.sombrerochePoints} Éclats<br>Solde après achat : ${player.sombrerochePoints - cost} Éclats`;

        if(await showConfirm("Confirmer l'Achat", confirmText)) {
            player.sombrerochePoints -= cost;
            addUpgradeToTextarea('unit-honours', `Honneur de Sombreroche: ${honour.name}`, honour.desc);
            select.value = '';
            document.getElementById('sombreroche-points').textContent = player.sombrerochePoints;
            showNotification("Honneur de Sombreroche acheté !", 'success');
            saveData();
        }
    });

    document.getElementById('add-sombreroche-relic-btn').addEventListener('click', async () => {
        const select = document.getElementById('sombreroche-relic-select');
        const selectedOption = select.options[select.selectedIndex];
        if (!selectedOption.value) return;

        const player = campaignData.players[activePlayerIndex];
        const cost = parseInt(selectedOption.dataset.cost);

        if (player.sombrerochePoints < cost) {
            showNotification(`Éclats de Sombreroche insuffisants (Requis: ${cost}).`, 'error');
            return;
        }

        const relic = crusadeRules.sombrerocheRelics.find(r => r.name === selectedOption.value);
        const confirmText = `Voulez-vous dépenser <b>${cost} Éclats de Sombreroche</b> pour cette Relique : <i>${relic.name}</i>?<br><br>Solde actuel : ${player.sombrerochePoints} Éclats<br>Solde après achat : ${player.sombrerochePoints - cost} Éclats`;

        if (await showConfirm("Confirmer l'Achat", confirmText)) {
            player.sombrerochePoints -= cost;
            addUpgradeToTextarea('unit-relic', `Relique de Sombreroche: ${relic.name}`, relic.desc);
            select.value = '';
            document.getElementById('sombreroche-points').textContent = player.sombrerochePoints;
            showNotification("Relique de Sombreroche achetée !", 'success');
            saveData();
        }
    });


    //======================================================================
    //  INITIALISATION
    //======================================================================
    loadData();
    renderPlayerList();
});