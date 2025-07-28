// upgrades.js

//======================================================================
//  LOGIQUE : GESTION DES AMÉLIORATIONS D'UNITÉ
//======================================================================

const findUpgradeDescription = (upgradeName) => {
    if (!upgradeName) return null;
    const allRules = [
        ...Object.values(crusadeRules.battleTraits).flat(),
        ...crusadeRules.weaponMods,
        ...Object.values(crusadeRules.relics).flat(),
        ...crusadeRules.sombrerocheHonours,
        ...crusadeRules.sombrerocheRelics,
        ...crusadeRules.battleScars
    ];
    const foundRule = allRules.find(rule => rule.name === upgradeName);
    return foundRule ? foundRule.desc : null;
};

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