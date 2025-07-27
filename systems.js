// systems.js

const SYSTEM_NAMES = [
    "Proxima Centauri", "Kepler-186f", "TRAPPIST-1", "Luyten b", "Gliese 581g", "Tau Ceti e",
    "Epsilon Eridani b", "Sirius", "Vega", "Arcturus", "Capella", "Rigel", "Betelgeuse", "Aldebaran",
    "Pollux", "Deneb", "Altair", "Fomalhaut", "Solaria", "Cryonia", "Pyralia", "Veridia", "Aquaria",
    "Nocturnus", "Aethelgard", "Helios Delta", "Terminus Est", "Orion's Folly", "Magellan Prime",
    "Andromeda's Tear", "The Cygnus Expanse", "Widow's Star", "The Ghoul Stars", "Segmentum Obscurus",
    "The Halo Zone", "Vostroya", "Krieg", "Cadia", "Fenris", "Baal", "Macragge", "Ultramar", "Ryza",
    "Stygies VIII", "Agripinaa", "Tallarn", "Valhalla", "Mordian", "Praetoria", "Catachan",
    
    "Zentha Prime", "Aquila Minor", "Draconis V", "Oblivion Reach", "Mythros", "Arcadia VII",
    "Nyx Verge", "Thorne’s Halo", "Icarion Delta", "Xerxes Core", "Ignis Major", "Tartarus Void",
    "Elara", "Nemoris", "Nova Vesta", "Zephyria", "Omicron Persei", "Lyonesse", "Galatia",
    "Cygna X", "Ilios", "Miridian Spire", "Volundr's Forge", "Azura Gate", "Delphinus",
    "Theta Crucis", "Hydra Expanse", "Ymir Station", "Abyssus", "Eidolon Reach", "Kassandros",
    "Erebus", "Aetherion", "Xanthe", "Virelia", "Nexus Prime", "Solitude IX", "Zarvax Omega",
    "Cerulean Rift", "Nova Centaur", "Echo Helix", "Sable Orbit", "Juno’s Rise", "Cryohex",
    "Ferron’s Edge", "Gorgon’s Reach", "Kronus II", "Midas Verge", "Numenor", "Nebulos",
    
    "Astralis", "Bellatrix", "Calypso", "Dione Expanse", "Echo Prime", "Forgeworld Karth",
    "Gaia's Womb", "Halcyon Drift", "Icarus Reach", "Jareth’s Halo", "Kallista", "Lucent Verge",
    "Moros", "Nereid Prime", "Obscura", "Pandora's Wake", "Quantus", "Ragnar's Gate", "Selene",
    "Titania", "Umbriel", "Valkyrion", "Warden's Watch", "Xel'Tor", "Ythros Minor", "Zentha’s End",
    "Aegir", "Brimstone Hold", "Calytrix", "Dreadspire", "Emberfall", "Fury's Gate", "Geminus",
    "Horizon’s Edge", "Iridion", "Jovaris", "Kael'Thas", "Lunaris", "Morgana Drift", "Naraka",
    "Oberon", "Peregrine Station", "Quintessence", "Ravana", "Sanctis", "Talos Reach", "Ursae Majoris",
    
    "Vanir Hold", "Weyland Spire", "Xar’Kun", "Yavin Theta", "Zirak’Zul", "Ashen Cradle", "Borealis",
    "Cradle of Light", "Dagon’s Fall", "Eos Ascendant", "Frostheim", "Gaius Ultima", "Hekate Spiral",
    "Ilyria", "Jörmungandr", "Kelvin Drift", "Lorentis", "Meridian IX", "Nihilus Core", "Orcus Verge",
    "Pylon Sigma", "Quel’Danas", "Ruinhold", "Skoll’s Breath", "Thalassa", "Utopia’s End",
    "Vespera", "Whisper Field", "Xebec", "Ysera Expanse", "Zeroth Meridian",

    "Andros", "Borysthenes", "Cirrina Major", "Dactyl", "Elarion", "Fulgur’s Rift", "Galaxis Crown",
    "Horadrim Delta", "Iskar’s Flame", "Jacta Est", "Krynn", "Lysara", "Malakar", "Nysa", "Orlinos",
    "Pelagus", "Quorrum", "Runedar", "Sycorax", "Tyrranos", "Umbra", "Vornheim", "Wyrmhold", "Xirion",
    "Ygreth", "Zariel Reach", "Amasis", "Briareos", "Cenaris", "Dianthus", "Edelweiss Reach",
    "Farsight Theta", "Gethsemane", "Helleborus", "Ignivar", "Jasna’s Reach", "Karnath", "Lemuria",
    "Mistral", "Nadir Sector", "Onyx Drift", "Penumbra", "Qadim", "Ravenholdt", "Severus",
    
    "Talemspire", "Unaros", "Virellium", "Wanderlight", "Xorth Prime", "Yvenor", "Zephrael",
    "Axiom", "Blighthold", "Clytemnestra", "Dreadvault", "Eris Station", "Falx Magnus", "Golgotha",
    "Hyperion Expanse", "Isenhold", "Junctus", "Kharon’s Wake", "Lanx Minor", "Marnath", "Noxious Edge",
    "Ostra Nex", "Phobos Delta", "Quietude", "Ravager’s Maw", "Straylight", "Thorne’s Cradle",
    "Umbriel Verge", "Vesper Reach", "Wastrel’s Star", "Xenithum", "Ylgrast", "Zakarum",
    
    "Ashenforge", "Blackreach", "Calderis", "Dun’harra", "Eternis", "Frostgate", "Gildur’s Rest",
    "Hallowed Forge", "Infractus", "Juno Decline", "Koronus Span", "Lazareth", "Mirrorglade",
    "Neth’Kar", "Oblivium", "Pharexis", "Quirinus", "Redwake", "Sablethorn", "Tranquil Verge",
    "Ul’Zanith", "Vandrel Core", "Wyrmspire", "Xanadu", "Yaraxis", "Zeraphine"
];
