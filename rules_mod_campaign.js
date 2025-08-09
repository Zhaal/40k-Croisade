// rules_mod_campaign.js
// Ce fichier documente les différences et adaptations entre les règles de
// Croisade officielles et leur implémentation dans le programme Nexus Crusade Tracker.

const campaignRuleDifferences = {
    deathGuard: {
        title: "Adaptations des Règles pour la Death Guard",
        introduction: "Cette section compare les règles de Croisade officielles de la Death Guard avec leur implémentation dans l'application. L'objectif du programme est de capturer l'esprit des règles tout en simplifiant la gestion pour une expérience de jeu plus fluide.",
        rules: [
            {
                ruleName: "Bienfaits de Nurgle",
                programImplementation: "Le programme gère l'obtention des bienfaits. En cliquant sur le bouton 'Lancer pour un Bienfait', vous refusez un Honneur de Bataille standard. Le programme simule un jet de D33, attribue un des 9 bienfaits, et gère la conséquence d'un doublon (Séquelle 'Dégénérescence'). L'unité ne peut pas avoir plus de trois bienfaits.",
                officialRule: "Un joueur refuse un Honneur de Bataille pour son personnage et lance 1D33 pour déterminer un bienfait. Une figurine ne peut avoir plus de trois Bienfaits de Nurgle. Si un résultat en double est obtenu, la figurine gagne à la place la Séquelle de Combat Dégénérescence.",
                comparison: "✅ **Implémentation fidèle.** Le programme automatise entièrement le processus, y compris le jet de dé, l'attribution, la vérification des doublons et l'application de la Séquelle de Dégénérescence, en respectant les conditions des règles."
            },
            {
                ruleName: "Dégénérescence",
                programImplementation: "La Dégénérescence est implémentée de deux manières : 1) comme une conséquence automatique si un personnage obtient un Bienfait de Nurgle en double, et 2) comme une Réquisition volontaire (coût : 1 PR) dans la fiche d'unité. Dans les deux cas, l'unité est transformée en Rejetons du Chaos, conservant son XP, ses Honneurs et Séquelles.",
                officialRule: "Si une unité subit la Dégénérescence, elle est retirée et remplacée par une unité de Rejetons du Chaos qui conserve son expérience (Honneurs, Séquelles, PX).",
                comparison: "✅ **Implémentation fidèle et étendue.** Le programme respecte la règle officielle en l'appliquant comme une conséquence involontaire. Il offre également une option volontaire via une Réquisition, ce qui est une adaptation pour plus de flexibilité."
            },
            {
                ruleName: "Grande Peste",
                programImplementation: "Le système est fortement simplifié. Le joueur 'infecte' une planète, ce qui lui donne des statistiques. Le programme calcule un 'Total de Peste' en additionnant les stats du monde et les stats de la peste du joueur. Si ce total atteint 7+, le joueur peut dépenser 1 PR pour tenter de 'Concrétiser la Peste' via un jet de dé. Le suivi complexe de la Voie de la Contagion et les Bénédictions de Nurgle ne sont pas automatisés.",
                officialRule: "Un système complexe de suivi ('Voie de la Contagion') où les caractéristiques d'un monde et de la peste évoluent après chaque bataille. L'objectif est d'atteindre un total de 7 pour chaque paire de caractéristiques pour réussir à 'Concocter une Peste' et gagner des récompenses basées sur un 'Score d'Adéquation', incluant des 'Bénédictions de Nurgle' permanentes.",
                comparison: "🔴 **Fortement simplifié.** Le programme conserve le thème de la corruption planétaire mais remplace la micro-gestion complexe de la 'Voie de la Contagion' par un mécanisme de jet de dé unique et plus direct. C'est une adaptation majeure pour la jouabilité."
            },
            {
                ruleName: "Pathogènes Alchimiques",
                programImplementation: "Le programme implémente le système du 'Pathogène'. Le joueur peut augmenter la 'Puissance du Pathogène' (jusqu'à 7) en choisissant de nouvelles Propriétés, qui ajoutent leurs Inconvénients. L'adaptation des toxines (remplacement) est gérée via une Réquisition. La 'Durée' du pathogène n'est pas suivie et doit être gérée manuellement par le joueur.",
                officialRule: "Un système évolutif où le joueur peut 'Élaborer son Variant' pour augmenter la 'Durée' de son pathogène, ajouter une 'Propriété' (avec son Inconvénient) ou supprimer un Inconvénient. La 'Puissance du Pathogène' est la somme de ces améliorations (max 7).",
                comparison: "🟡 **Implémentation partielle.** Le programme se concentre sur l'aspect le plus important (Propriétés/Inconvénients) et simplifie le calcul de la 'Puissance du Pathogène' en un simple compteur. La gestion de la 'Durée' est laissée au joueur."
            },
            {
                ruleName: "Intentions",
                programImplementation: "Toutes les Intentions spécifiques à la Death Guard sont listées dans les données du fichier `DeathGuard_module.js` pour consultation.",
                officialRule: "Le joueur peut choisir une Intention en début de partie pour gagner des récompenses en PX et faire progresser sa Grande Peste s'il la réussit.",
                comparison: "🔵 **Présent comme référence.** Les règles sont disponibles, mais le programme ne propose pas de mécanisme pour les sélectionner, les suivre ou appliquer leurs récompenses automatiquement. La gestion est manuelle."
            },
            {
                ruleName: "Réquisitions",
                programImplementation: "Toutes les Réquisitions sont listées dans les données. Certaines, comme 'Fruits du Chaudron' (Adapter les Toxines) ou 'Ascension Putride' (via la Dégénérescence), sont directement intégrées dans l'interface. Les autres sont à la disposition du joueur pour une utilisation manuelle.",
                officialRule: "Une liste de 6 Réquisitions uniques est disponible pour les armées de la Death Guard.",
                comparison: "🟡 **Implémentation partielle.** L'intégration de certaines Réquisitions clés facilite le jeu, mais la majorité reste à la charge du joueur de les appliquer en respectant les règles."
            },
            {
                ruleName: "Traits de Bataille & Reliques",
                programImplementation: "Les tables de Traits de Bataille et les listes de Reliques de Croisade spécifiques à la Death Guard sont entièrement intégrées. Elles apparaissent dans les menus déroulants de la fiche d'unité, permettant au joueur de les sélectionner conformément aux règles.",
                officialRule: "La Death Guard a accès à ses propres tables de Traits de Bataille (Infanterie, Démon, Véhicule) et à une liste unique de Reliques de Croisade (Artificier, Antique, Légendaire).",
                comparison: "✅ **Implémentation fidèle.** Les données sont complètes et correctement présentées à l'utilisateur, facilitant grandement la gestion des améliorations d'unités."
            }
        ]
    }
    // D'autres factions pourront être ajoutées ici, comme par exemple :
    // astraMilitarum: { ... },
    // tyranids: { ... },
};