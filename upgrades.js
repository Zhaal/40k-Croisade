// upgrades.js

//======================================================================
//  LOGIQUE : GESTION DES AMÉLIORATIONS D'UNITÉ
//======================================================================

// MODIFIÉ : La fonction cherche désormais aussi dans les règles spécifiques aux factions
const findUpgradeDescription = (upgradeName) => {
    if (!upgradeName) return null;

    const player = campaignData.players[activePlayerIndex];
    let factionRules = {};
    if (player && player.faction === 'Adepta Sororitas') {
        factionRules = sororitasCrusadeRules || {};
    }
    // (On pourrait ajouter d'autres factions ici avec 'else if')

    const allRules = [
        ...Object.values(crusadeRules.battleTraits).flat(),
        ...crusadeRules.weaponMods,
        ...Object.values(crusadeRules.relics).flat(),
        ...crusadeRules.sombrerocheHonours,
        ...crusadeRules.sombrerocheRelics,
        ...crusadeRules.battleScars,
        // Ajout des règles de faction
        ...Object.values(factionRules.battleTraits || {}).flat(),
        ...Object.values(factionRules.relics || {}).flat()
    ];

    const foundRule = allRules.find(rule => rule.name === upgradeName);
    return foundRule ? foundRule.desc : null;
};


// MODIFIÉ : Les sélecteurs sont maintenant remplis avec les options de faction
const populateUpgradeSelectors = () => {
    const unitRole = document.getElementById('unit-role').value;
    const player = campaignData.players[activePlayerIndex];
    const isCharacter = unitRole === 'Personnage' || unitRole === 'Hero Epique';

    // --- Traits de Bataille ---
    const battleTraitSelect = document.getElementById('battle-trait-select');
    battleTraitSelect.innerHTML = '<option value="">Choisir un trait...</option>';
    const genericTraits = crusadeRules.battleTraits[unitRole] || [];
    genericTraits.forEach(trait => {
        battleTraitSelect.innerHTML += `<option value="${trait.name}">${trait.name}</option>`;
    });

    // --- AJOUT : Traits de Bataille Spécifiques aux Sororitas ---
    if (player && player.faction === 'Adepta Sororitas') {
        Object.entries(sororitasCrusadeRules.battleTraits).forEach(([type, traits]) => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = `Sororitas: ${type}`;
            traits.forEach(trait => {
                optgroup.innerHTML += `<option value="${trait.name}">${trait.name}</option>`;
            });
            battleTraitSelect.appendChild(optgroup);
        });
    }


    const weaponModSelect = document.getElementById('weapon-mod-select');
    weaponModSelect.innerHTML = '<option value="">Choisir une modification...</option>';
    crusadeRules.weaponMods.forEach(mod => {
        weaponModSelect.innerHTML += `<option value="${mod.name}">${mod.name}</option>`;
    });

    // --- Reliques ---
    const relicSelect = document.getElementById('relic-select');
    relicSelect.innerHTML = '<option value="">Choisir une relique...</option>';
    if (isCharacter) {
        // Reliques génériques
        Object.entries(crusadeRules.relics).forEach(([type, relics]) => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = `Générique: ${type.charAt(0).toUpperCase() + type.slice(1)} (+${relics[0].cost} PC)`;
            relics.forEach(relic => {
                optgroup.innerHTML += `<option value="${relic.name}" data-cost="${relic.cost}" data-type="relics.${type}">${relic.name}</option>`;
            });
            relicSelect.appendChild(optgroup);
        });
        
        // --- AJOUT : Reliques Spécifiques aux Sororitas ---
        if (player && player.faction === 'Adepta Sororitas') {
            Object.entries(sororitasCrusadeRules.relics).forEach(([type, relics]) => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = `Sororitas: ${type.charAt(0).toUpperCase() + type.slice(1)} (+${relics[0].cost} PC)`;
                relics.forEach(relic => {
                    // Note: Le data-type pointe vers la structure de sororitasCrusadeRules
                    optgroup.innerHTML += `<option value="${relic.name}" data-cost="${relic.cost}" data-type="sororitas.relics.${type}">${relic.name}</option>`;
                });
                relicSelect.appendChild(optgroup);
            });
        }
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

    // Logique pour les Bienfaits de Nurgle
    const nurgleBoonSection = document.getElementById('nurgle-boon-section');

    if (player && player.faction === 'Death Guard' && isCharacter) {
        nurgleBoonSection.classList.remove('hidden');
        const nurgleBoonSelect = document.getElementById('nurgle-boon-select');
        nurgleBoonSelect.innerHTML = '<option value="">Choisir un bienfait...</option>';
        deathGuardCrusadeRules.boonsOfNurgle.forEach(boon => {
            nurgleBoonSelect.innerHTML += `<option value="${boon.name}">${boon.name} (Jet: ${boon.roll})</option>`;
        });
    } else {
        nurgleBoonSection.classList.add('hidden');
    }

    // Logique pour les Optimisations de la Légion de l'Ombre
    const legionOfShadowSection = document.getElementById('legion-of-shadow-section');
    if (player && player.faction === 'Chaos Daemons' && isCharacter) {
        legionOfShadowSection.classList.remove('hidden');
        const legionSelect = document.getElementById('legion-of-shadow-select');
        legionSelect.innerHTML = '<option value="">Choisir une optimisation...</option>';
        chaosDaemonsCrusadeRules.legionOfShadowEnhancements.forEach(enhancement => {
            legionSelect.innerHTML += `<option value="${enhancement.name}" data-cost="${enhancement.cost}" data-cp-cost="${enhancement.crusadePointCost}">${enhancement.name}</option>`;
        });
    } else {
        legionOfShadowSection.classList.add('hidden');
    }

};

const addUpgradeToUnitData = (unit, textareaId, upgradeName, upgradeDesc, prefix = '') => {
    const textToAdd = `\n- ${prefix}${upgradeName}: ${upgradeDesc}`;
    const key = textareaId.replace('unit-', ''); // 'honours' ou 'relic' ou 'scars'
    const dataKey = key === 'honours' ? 'battleHonours' : (key === 'scars' ? 'battleScars' : key);

    unit[dataKey] = (unit[dataKey] || '').trim() + textToAdd;
    document.getElementById(textareaId).value = unit[dataKey];
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
        onConfirm(); // Cette fonction va maintenant modifier l'objet campaignData
        document.getElementById('pr-points').textContent = player.requisitionPoints;
        saveData(); // Sauvegarde les changements sur le joueur ET l'unité
        showNotification(`${upgradeName} acheté !`, 'success');
    }
}

document.getElementById('add-battle-trait-btn').addEventListener('click', () => {
    const select = document.getElementById('battle-trait-select');
    const traitName = select.value;
    if (!traitName) return;

    // Recherche dans les traits génériques ET de faction
    const trait = findUpgradeDescription(traitName);
    if (!trait) return;
    
    handleRpPurchase(`Trait: ${traitName}`, 1, () => {
        const unit = campaignData.players[activePlayerIndex].units[editingUnitIndex];
        addUpgradeToUnitData(unit, 'unit-honours', traitName, trait);
        unit.crusadePoints = (unit.crusadePoints || 0) + 1;
        document.getElementById('unit-crusade-points').value = unit.crusadePoints;
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
        const unit = campaignData.players[activePlayerIndex].units[editingUnitIndex];
        addUpgradeToUnitData(unit, 'unit-honours', mod.name, mod.desc, "Mod. d'Arme: ");
        unit.crusadePoints = (unit.crusadePoints || 0) + 1;
        document.getElementById('unit-crusade-points').value = unit.crusadePoints;
        select.value = '';
    });
});

document.getElementById('add-relic-btn').addEventListener('click', () => {
    const select = document.getElementById('relic-select');
    const selectedOption = select.options[select.selectedIndex];
    if (!selectedOption.dataset.type) return;

    const [source, category, type] = selectedOption.dataset.type.split('.');
    let ruleSet;
    if (source === 'sororitas') {
        ruleSet = sororitasCrusadeRules[category][type];
    } else {
        ruleSet = crusadeRules[category][type];
    }

    const relic = ruleSet.find(r => r.name === selectedOption.value);
    if (!relic) return;
    
    handleRpPurchase(`Relique: ${relic.name}`, relic.cost, () => {
        const unit = campaignData.players[activePlayerIndex].units[editingUnitIndex];
        addUpgradeToUnitData(unit, 'unit-relic', relic.name, relic.desc);
        unit.crusadePoints = (unit.crusadePoints || 0) + relic.cost;
        document.getElementById('unit-crusade-points').value = unit.crusadePoints;
        select.value = '';
    });
});

document.getElementById('add-battle-scar-btn').addEventListener('click', () => {
    const select = document.getElementById('battle-scar-select');
    const scarName = select.value;
    if (!scarName) return;

    const scar = crusadeRules.battleScars.find(s => s.name === scarName);
    const unit = campaignData.players[activePlayerIndex].units[editingUnitIndex];

    addUpgradeToUnitData(unit, 'unit-scars', scar.name, scar.desc);
    saveData(); // Sauvegarde immédiate car il n'y a pas de coût
    
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
        const unit = campaignData.players[activePlayerIndex].units[editingUnitIndex];
        addUpgradeToUnitData(unit, 'unit-honours', honour.name, honour.desc, "Honneur de Sombreroche: ");
        
        select.value = '';
        document.getElementById('sombreroche-points').textContent = player.sombrerochePoints;
        saveData();
        showNotification("Honneur de Sombreroche acheté !", 'success');
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
        const unit = campaignData.players[activePlayerIndex].units[editingUnitIndex];
        addUpgradeToUnitData(unit, 'unit-relic', relic.name, relic.desc, "Relique de Sombreroche: ");

        select.value = '';
        document.getElementById('sombreroche-points').textContent = player.sombrerochePoints;
        saveData();
        showNotification("Relique de Sombreroche achetée !", 'success');
    }
});

// Listener pour les Bienfaits de Nurgle
document.getElementById('add-nurgle-boon-btn').addEventListener('click', () => {
    const select = document.getElementById('nurgle-boon-select');
    const boonName = select.value;
    if (!boonName) return;

    const boon = deathGuardCrusadeRules.boonsOfNurgle.find(b => b.name === boonName);
    if (!boon) return;
    
    const unit = campaignData.players[activePlayerIndex].units[editingUnitIndex];
    addUpgradeToUnitData(unit, 'unit-honours', boon.name, boon.desc, "Bienfait de Nurgle: ");
    
    unit.crusadePoints = (unit.crusadePoints || 0) + 1;
    document.getElementById('unit-crusade-points').value = unit.crusadePoints;

    saveData();
    showNotification(`Le Bienfait "${boon.name}" a été accordé.`, 'success');
    select.value = '';
});

// Listener pour les Optimisations de la Légion de l'Ombre
document.getElementById('add-legion-of-shadow-btn').addEventListener('click', () => {
    const select = document.getElementById('legion-of-shadow-select');
    const selectedOption = select.options[select.selectedIndex];
    const enhancementName = selectedOption.value;
    if (!enhancementName) return;

    const enhancement = chaosDaemonsCrusadeRules.legionOfShadowEnhancements.find(e => e.name === enhancementName);
    if (!enhancement) return;

    handleRpPurchase(enhancement.name, enhancement.cost, () => {
        const unit = campaignData.players[activePlayerIndex].units[editingUnitIndex];
        addUpgradeToUnitData(unit, 'unit-honours', enhancement.name, enhancement.desc, "Optimisation de l'Ombre: ");

        unit.crusadePoints = (unit.crusadePoints || 0) + enhancement.crusadePointCost;
        document.getElementById('unit-crusade-points').value = unit.crusadePoints;

        select.value = '';
    });
});