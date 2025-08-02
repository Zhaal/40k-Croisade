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
                programImplementation: "Le programme gère l'obtention des bienfaits. En cliquant sur le bouton 'Lancer pour un Bienfait' dans la fiche d'unité d'un personnage, vous refusez un Honneur de Bataille standard. Le programme effectue un jet aléatoire simulé pour attribuer un des 9 bienfaits, évite les doublons et augmente les Points de Croisade de 1.",
                officialRule: "Un joueur refuse un Honneur de Bataille pour son personnage et lance 3D3 pour déterminer un bienfait sur une table D33. Une unité ne peut avoir que 3 bienfaits et ne peut pas avoir de doublons. L'obtention d'un bienfait coûte 1 Point de Croisade.",
                comparison: "✅ **Implémentation fidèle.** Le programme automatise le processus de manière très proche de la règle officielle, en simulant le jet de dé et en gérant les conditions."
            },
            {
                ruleName: "Dégénérescence",
                programImplementation: "Une Réquisition spéciale (coût : 1 PR) est disponible dans la fiche d'unité d'un personnage pour le transformer en 'Rejetons du Chaos'. La nouvelle unité conserve l'XP, les Honneurs et les Séquelles de l'ancienne.",
                officialRule: "Si un personnage (hors Prince Démon) subit la Dégénérescence, il est retiré et remplacé par une unité de Rejetons du Chaos qui conserve son expérience (Honneurs, Séquelles, PX).",
                comparison: "🟠 **Adapté avec une modification.** L'esprit de la règle est respecté, mais le programme en fait une action volontaire coûtant 1 PR via une Réquisition, alors que la règle officielle la présente comme une conséquence potentiellement involontaire."
            },
            {
                ruleName: "Grande Peste",
                programImplementation: "Le système est fortement simplifié. Le joueur 'infecte' une planète, ce qui lui donne des statistiques de base. Le programme calcule un 'Total de Peste' en additionnant les stats du monde et les stats de la peste du joueur. Si ce total atteint 7+, le joueur peut dépenser 1 PR pour tenter de 'Concrétiser la Peste' en réussissant un jet de D6 contre sa 'Puissance du Pathogène'. La 'Voie de la Contagion' et les récompenses associées ne sont pas automatisées.",
                officialRule: "Un système complexe de suivi où trois caractéristiques d'un monde (Densité, Fécondité, Vulnérabilité) et trois caractéristiques de la peste (Reproduction, Survie, Adaptabilité) évoluent après chaque bataille en suivant les étapes de la 'Voie de la Contagion'. La conquête est réussie quand les caractéristiques du monde atteignent un 'Score d'Adéquation' de 10.",
                comparison: "🔴 **Fortement simplifié.** Le programme conserve le thème de la corruption planétaire mais remplace la micro-gestion complexe de la 'Voie de la Contagion' par un mécanisme de jet de dé unique et plus direct. C'est l'adaptation la plus significative."
            },
            {
                ruleName: "Pathogènes Alchimiques",
                programImplementation: "Le programme implémente le système du 'Pathogène Tutélaire'. Le joueur peut améliorer la 'Puissance du Pathogène' (jusqu'à 5) en choisissant de nouvelles Propriétés, qui ajoutent automatiquement leurs Inconvénients. L'adaptation des toxines (remplacement d'une propriété) est gérée via une Réquisition. Le système simple (Vecteur + Symptôme) est présent dans les données pour référence mais n'est pas utilisé dans la logique de jeu.",
                officialRule: "Deux systèmes coexistent : un système simple où l'on dépense 1 PR pour combiner un Vecteur et un Symptôme, et un système plus complexe de 'Pathogène Tutélaire' qui évolue avec jusqu'à 5 Propriétés/Inconvénients.",
                comparison: "🟡 **Implémentation partielle.** Le programme se concentre sur une version simplifiée du système le plus complexe (Pathogène Tutélaire) et ignore le système simple. La mécanique d'évolution est rationalisée en une statistique de 'Puissance du Pathogène'."
            },
            {
                ruleName: "Intentions",
                programImplementation: "Toutes les Intentions spécifiques à la Death Guard sont listées dans les données du fichier `DeathGuard_module.js`.",
                officialRule: "Le joueur peut choisir secrètement une Intention en début de partie pour gagner des récompenses en PX et faire progresser sa Grande Peste s'il la réussit.",
                comparison: "🔵 **Présent comme référence.** Les règles sont disponibles pour consultation, mais le programme ne propose pas de mécanisme pour les sélectionner, les suivre ou appliquer leurs récompenses automatiquement. La gestion est manuelle."
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
            },
            {
                ruleName: "Légions de la Peste & Véreoleux / Insignes",
                programImplementation: "Aucune mécanique spécifique n'est en place pour gérer le statut temporaire des unités des Légions de la Peste ou des Véreoleux, ni pour les Insignes de Croisade.",
                officialRule: "Les unités des Légions de la Peste et les Véreoleux quittent l'Ordre de Bataille après chaque partie. Les joueurs peuvent aussi gagner des Insignes de Croisade.",
                comparison: "❌ **Non implémenté.** Ces règles plus secondaires doivent être gérées manuellement par le joueur."
            }
        ]
    }
    // D'autres factions pourront être ajoutées ici, comme par exemple :
    // astraMilitarum: { ... },
    // tyranids: { ... },
};