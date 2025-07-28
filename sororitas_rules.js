// sororitas_rules.js

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
            acts: "Soif de connaissance : Gagnez 1 point de Sainte à la fin d'une bataille si cette figurine est à 6\" du centre du champ de bataille. Volonté Divine : Gagnez 2 points de Sainte à la fin d'une bataille si l'unité de cette figurine n'a subi aucun test d'Ébranlement.",
            reward_name: "Flamboiement de l'Âme",
            reward_desc: "Lorsque cette figurine doit être frappée, ses ennemis sont victimes d'autocombustion comme s'ils avaient été touchés par la main de l'Empereur. Chaque fois que l'unité de cette figurine est choisie pour combattre, vous pouvez défausser 1 dé de Miracle. En ce cas, jusqu'à la fin de la phase, doublez la caractéristique de Force des armes de mêlée de cette figurine, et ces armes ont l'aptitude [BLESSURES DÉVASTATRICES]."
        },
        {
            id: 'vertu',
            name: "Épreuve de Vertu",
            acts: "Tuez le Démagogue : Gagnez 2 points de Sainte à la fin d'une bataille si cette figurine a détruit une ou plusieurs unités PERSONNAGE ennemies. Châtier les Mécréants : Gagnez 2 points de Sainte à la fin d'une bataille si cette figurine a détruit au moins 3 figurines ennemies pendant cette bataille.",
            reward_name: "Sentence Légitime",
            reward_desc: "Nul n'échappe au jugement de l'Empereur. Ceux qui tentent de se cacher sont tous atteints par les tirs de l'Adepta Sororitas. Chaque fois que l'unité de cette figurine est choisie pour tirer, vous pouvez défausser 1 dé de Miracle. En ce cas, jusqu'à la fin de la phase, les armes de tir dont sont équipées les figurines de cette unité ont l'aptitude [IGNORE LE COUVERT] et chaque fois qu'une attaque d'une telle arme cause une Blessure Critique, l'attaque a l'aptitude [PRÉCISION]."
        },
        {
            id: 'vaillance',
            name: "Épreuve de Vaillance",
            acts: "Victoire écrasante : Gagnez 3 points de Sainte à la fin d'une bataille si cette figurine est entièrement dans la zone de déploiement adverse. Pieuse Réputation : Gagnez 2 points de Sainte à la fin d'une bataille si cette figurine a gagné plus de PX que toute autre unité de votre armée de Croisade.",
            reward_name: "La Voix de l'Empereur",
            reward_desc: "Au début de l'étape d'Ébranlement de la phase de Commandement adverse, vous pouvez défausser 1 dé de Miracle. En ce cas, chaque unité ennemie à 12\" de cette figurine et au-dessus de son Effectif Initial doit passer un test d'Ébranlement. Si une unité le rate, en plus de son Don Divin, elle est Ébranlée. Aux tests d'Ébranlement de cette unité, à cette phase à la place."
        }
    ],
    battleTraits: {
        "UNITÉS PÉNITENT": [
            { name: "Fanatisme Intarissable", desc: "Le noviciat : Ajoutez 1 aux jets d'Avance et de Charge pour cette unité." },
            { name: "Dévot Fidèle", desc: "Chaque fois qu'une attaque est allouée à une figurine de cette unité, si cette unité est au-dessus de son Demi-effectif, ses figurines ont l'aptitude Insensible à la Douleur 4+ contre cette attaque." },
            { name: "Le Sang Engendre l'Absolution", desc: "Chaque fois que cette unité détruit une unité ennemie à la phase de Combat, vous gagnez 1 dé de Miracle." }
        ],
        "FIGURINES PERSONNAGE": [
            { name: "Point de Paroles, des Actes", desc: "Chaque fois que cette figurine fait une action, et que cette figurine est à portée d'Engagement d'une ou plusieurs unités ennemies, elle peut quand même faire des attaques de tir. Dans ce cas, les armes de tir dont cette figurine est équipée ont la caractéristique [PISTOLET]." },
            { name: "Égide de Conviction", desc: "Chaque fois que cette figurine réussit un test d'Ébranlement, jusqu'au début de votre phase de Commandement, elle regagne 1 PV perdu." },
            { name: "Fanal de la Foi", desc: "À la fin de votre phase de Commandement, si cette figurine est votre SEIGNEUR DE GUERRE et sur le champ de bataille, vous pouvez défausser 1 dé de Miracle. En ce cas, vous gagnez un dé de Miracle." }
        ],
        "UNITÉS VÉHICULE MARCHEURS OYEXUS": [ // "OYEXUS" est probablement une typo pour "ROYAUX" ou un autre terme, j'utilise la catégorie de l'image.
            { name: "Autel Mobile (Aura)", desc: "Tant qu'une unité ADEPTA SORORITAS amie est à portée de l'Aura de Commandement de cette unité, ajoutez 1 à sa caractéristique de Contrôle d'Objectif." },
            { name: "Esprit de la Machine Pieux", desc: "Chaque fois que cette unité accomplit un Acte de Foi, le résultat du dé de Miracle utilisé pour ce test est considéré comme 6." },
            { name: "Coque Trois Fois Bénie", desc: "Cette unité a l'aptitude Insensible à la Douleur 4+ contre les Blessures mortelles." }
        ]
    },
    requisitions: [
        { name: "Appel Divin (1PR)", desc: "Achetez cette Réquisition à la fin d'une bataille. Quand votre figurine SAINTE POTENTIA abandonne son Épreuve actuelle et en commence une nouvelle, après avoir porté les points de Sainte acquis à 0, elle gagne le nombre de points de Sainte sous cette nouvelle épreuve égal à la moitié des points de Sainte qu'elle avait gagnés pour l'Épreuve abandonnée (arrondis au supérieur)." },
        { name: "Ascension au Sein de l'Ordre (2PR)", desc: "Achetez cette Réquisition avant une bataille. Choisissez 1 unité ESCOUADE DE SŒURS NOVICES de votre Ordre de Bataille. Retirez cette unité de votre Ordre de Bataille et ajoutez 1 unité ESCOUADE DE SŒURS DE BATAILLE, ESCOUADE DOMINION ou ESCOUADE RETRIBUTOR à votre Ordre de Bataille. La nouvelle unité a les mêmes Honneurs de Bataille et Séquelles de Combat que l'unité qu'elle remplace, ainsi que 5 PX de plus." },
        { name: "La Voie de la Pénitence (2PR)", desc: "Achetez cette Réquisition avant une bataille. Choisissez 1 ESCOUADE DE SŒURS DE BATAILLE, ESCOUADE DOMINION ou ESCOUADE RETRIBUTOR de votre Ordre de Bataille qui a subi un résultat Coup Dévastateur. Retirez cette unité et ajoutez 1 unité ESCOUADE REPENTIA ou MORTIFICATRICES à votre Ordre de Bataille. Dans tous les cas, la nouvelle unité a les mêmes Honneurs de Bataille, Séquelles de Combat et PX que l'unité qu'elle remplace, et jusqu'à ce qu'elle soit retirée de votre Ordre de Bataille, elle gagne 2PX en lieu de 1PX." },
        { name: "Glorieuse Rédemption (1PR)", desc: "Achetez cette Réquisition. Votre Ordre de Bataille peut contenir 1 unité ESCOUADE REPENTIA, ESCOUADE SÉRAPHINE, ESCOUADE ZÉPHYRINE ou EXO-HARNAIS PARANGON de plus. De plus, les unités de Machines de Pénitence, Séquelles de Combat et Mortificatrices gagnent l'aptitude TRAITS DE BATAILLE (ce doit être un Trait de Bataille Vétéran). Pour chaque tranche de 5 PX, lancez deux fois au lieu d'une." },
        { name: "L'Illumination par la Douleur (1PR)", desc: "Achetez cette dévotion après une bataille, avant qu'une unité ADEPTA SORORITAS de votre armée de Croisade ne fasse un test de Mise Hors de Combat. Choisissez cette unité et chaque Séquelle de Combat est 1 Honneur de Bataille de votre choix. Si cette unité est une Sainte Potentia, elle gagne également 2 points de Sainte et 1 point de Martyre." },
        { name: "Saintes Bénéfictions (1PR)", desc: "Achetez cette Réquisition avant une bataille. Pendant le premier round de cette bataille, chaque dé de Miracle que vous gagnez au début du tour de chaque joueur a automatiquement une valeur de 6." }
    ],
    relics: {
        artificer: [
            { name: "Fiole de Dolan", desc: "La foi bénite est distillée dans cette fiole en cristal trois-pans bénite et rempli de la sainte eau du Grand Confesseur. Améliorez de 1 les caractéristiques de Points de vie et d'Endurance du porteur. Une fois par bataille, vous pouvez relancer un test d'Ébranlement ou de Contrôle d'Objectif pour l'unité du porteur.", cost: 1 },
            { name: "Praesidium Rosarius", desc: "Ce chapelet ornementé est accompagné par le Credo d'Invocation, et béni par la Prieure du Couvent Sanctorum. Le porteur a une sauvegarde invulnérable de 4+.", cost: 1 },
            { name: "Larmes de l'Empereur", desc: "Il y a beaucoup d'histoires sur des reliques de sang de l'Empereur ou de ses saints qui sont collectées dans des reliquaires. Améliorez de 1 les caractéristiques d'Attaques, de Force et de Dégâts des armes de tir du porteur.", cost: 1 }
        ],
        antique: [
            { name: "Bénédictions de Sebastian Thor", desc: "Chaque garde personnelle d'un saint canonisé porte un éclat de son armure ou un fragment de ses os. Quand le porteur est détruit, ce texte sert à bénir le champ de bataille, et le sang de l'Empereur exauce la prière. Vous pouvez utiliser une fois le Stratagème Proclamation de l'Ordre de Croisade, vous pouvez utiliser l'aptitude Intervention Héroïque sur une unité amie qui se trouve à 12\" du porteur, et ce texte vous sert à voir votre foi récompensée.", cost: 2 },
            { name: "Icône de Sainteté", desc: "Les derniers moments d'un saint sont remplis de ferveur, car leur foi est mise à l'épreuve. Chaque fois que cette unité a une charge, vous pouvez choisir de ne pas la faire. À la place, jusqu'à la fin de la phase, le porteur ne peut passer son tour d'engagement, mais il peut choisir une unité ennemie à 12\" et la charger au péril de cette charge.", cost: 2 }
        ],
        legendaire: [
             { name: "Le Sceau Ecclesiasticus", desc: "Le Sceau Ecclesiasticus des écoles de Proloquor de l'Adepta Sororitas sert de clé de voûte de la foi de l'Imperium. Portez ce symbole, et s'il est terni par le sang des serviteurs de l'Empereur des plus purs, c'est que vous ferez partie des élus de l'Empereur.", cost: 3 }
        ]
    }
};