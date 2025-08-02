// upgrades.js

//======================================================================
//  LOGIQUE : GESTION DES AMÉLIORATIONS D'UNITÉ
//======================================================================

const findUpgradeDescription = (upgradeName) => {
    if (!upgradeName) return null;

    const player = campaignData.players[activePlayerIndex];
    let factionRules = {};
    if (player && player.faction === 'Adepta Sororitas') {
        factionRules = sororitasCrusadeRules || {};
    }
    else if (player && player.faction === 'Death Guard') {
        factionRules = deathGuardCrusadeRules || {};
    }
    // ==========================================================
    // DEBUT DE LA MODIFICATION TYRANIDE
    // ==========================================================
    else if (player && player.faction === 'Tyranids') {
        factionRules = tyranidCrusadeRules || {};
    }
    // ==========================================================
    // FIN DE LA MODIFICATION TYRANIDE
    // ==========================================================

    const allRules = [
        ...Object.values(crusadeRules.battleTraits).flat(),
        ...crusadeRules.weaponMods,
        ...Object.values(crusadeRules.relics).flat(),
        ...crusadeRules.sombrerocheHonours,
        ...crusadeRules.sombrerocheRelics,
        ...crusadeRules.battleScars,
        // CORRIGÉ : Ajout des traits de bataille spécifiques aux factions dans la recherche
        ...Object.values(factionRules.battleTraits || {}).flat(),
        // ==========================================================
        // DEBUT DE LA MODIFICATION TYRANIDE
        // ==========================================================
        // Ajout des reliques et séquelles de faction à la recherche
        ...Object.values(factionRules.relics || {}).flat(),
        ...Object.values(factionRules.battleScars || {}).flat()
        // ==========================================================
        // FIN DE LA MODIFICATION TYRANIDE
        // ==========================================================
    ];

    const foundRule = allRules.find(rule => rule.name === upgradeName);
    return foundRule ? foundRule.desc : null;
};


const populateUpgradeSelectors = () => {
    const unitRole = document.getElementById('unit-role').value;
    const player = campaignData.players[activePlayerIndex];
    const isCharacter = unitRole === 'Personnage' || unitRole === 'Hero Epique';

    const battleTraitSelect = document.getElementById('battle-trait-select');
    battleTraitSelect.innerHTML = '<option value="">Choisir un trait...</option>';
    
    // --- DÉBUT DE LA MODIFICATION ---
    // Logique pour afficher les traits spécifiques à la faction ou les traits génériques
    if (player && player.faction === 'Tyranids' && tyranidCrusadeRules.battleTraits) {
        // Traits pour unités non-SYNAPSE
        const nonSynapseGroup = document.createElement('optgroup');
        nonSynapseGroup.label = `Tyranid: Non-SYNAPSE (D66)`;
        tyranidCrusadeRules.battleTraits.nonSynapse.forEach(trait => {
            nonSynapseGroup.innerHTML += `<option value="${trait.name}">${trait.roll}: ${trait.name}</option>`;
        });
        battleTraitSelect.appendChild(nonSynapseGroup);

        // Traits pour unités SYNAPSE
        const synapseGroup = document.createElement('optgroup');
        synapseGroup.label = `Tyranid: SYNAPSE (D6)`;
        tyranidCrusadeRules.battleTraits.synapse.forEach(trait => {
            synapseGroup.innerHTML += `<option value="${trait.name}">${trait.roll}: ${trait.name}</option>`;
        });
        battleTraitSelect.appendChild(synapseGroup);

    } else if (player && player.faction === 'Death Guard' && deathGuardCrusadeRules.battleTraits) {
        Object.entries(deathGuardCrusadeRules.battleTraits).forEach(([type, traits]) => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = `Death Guard: ${type}`;
            traits.forEach(trait => {
                optgroup.innerHTML += `<option value="${trait.name}">${trait.name}</option>`;
            });
            battleTraitSelect.appendChild(optgroup);
        });
    } else if (player && player.faction === 'Adepta Sororitas') {
        Object.entries(sororitasCrusadeRules.battleTraits).forEach(([type, traits]) => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = `Sororitas: ${type}`;
            traits.forEach(trait => {
                optgroup.innerHTML += `<option value="${trait.name}">${trait.name}</option>`;
            });
            battleTraitSelect.appendChild(optgroup);
        });
    } else {
        const genericTraits = crusadeRules.battleTraits[unitRole] || [];
        genericTraits.forEach(trait => {
            battleTraitSelect.innerHTML += `<option value="${trait.name}">${trait.name}</option>`;
        });
    }
    // --- FIN DE LA MODIFICATION ---

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
            optgroup.label = `Générique: ${type.charAt(0).toUpperCase() + type.slice(1)} (+${relics[0].cost} PC)`;
            relics.forEach(relic => {
                optgroup.innerHTML += `<option value="${relic.name}" data-cost="${relic.cost}" data-type="relics.${type}">${relic.name}</option>`;
            });
            relicSelect.appendChild(optgroup);
        });
        
        if (player && player.faction === 'Adepta Sororitas') {
            Object.entries(sororitasCrusadeRules.relics).forEach(([type, relics]) => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = `Sororitas: ${type.charAt(0).toUpperCase() + type.slice(1)} (+${relics[0].cost} PC)`;
                relics.forEach(relic => {
                    optgroup.innerHTML += `<option value="${relic.name}" data-cost="${relic.cost}" data-type="sororitas.relics.${type}">${relic.name}</option>`;
                });
                relicSelect.appendChild(optgroup);
            });
        }
        
        if (player && player.faction === 'Death Guard') {
            Object.entries(deathGuardCrusadeRules.relics).forEach(([type, relics]) => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = `Death Guard: ${type.charAt(0).toUpperCase() + type.slice(1)} (+${relics[0].cost} PC)`;
                relics.forEach(relic => {
                    optgroup.innerHTML += `<option value="${relic.name}" data-cost="${relic.cost}" data-type="deathguard.relics.${type}">${relic.name}</option>`;
                });
                relicSelect.appendChild(optgroup);
            });
        }

        // ==========================================================
        // DEBUT DE LA MODIFICATION TYRANIDE
        // ==========================================================
        if (player && player.faction === 'Tyranids') {
            Object.entries(tyranidCrusadeRules.relics).forEach(([type, relics]) => {
                const optgroup = document.createElement('optgroup');
                const cost = type === 'legendaire' ? 3 : (type === 'antique' ? 2 : 1);
                optgroup.label = `Tyranid: ${type.charAt(0).toUpperCase() + type.slice(1)} (+${cost} PC)`;
                relics.forEach(relic => {
                    optgroup.innerHTML += `<option value="${relic.name}" data-cost="${cost}" data-type="tyranid.relics.${type}">${relic.name}</option>`;
                });
                relicSelect.appendChild(optgroup);
            });
        }
        // ==========================================================
        // FIN DE LA MODIFICATION TYRANIDE
        // ==========================================================
    }
    relicSelect.disabled = !isCharacter;

    const detachmentUpgradeSelect = document.getElementById('detachment-upgrade-select');
    detachmentUpgradeSelect.innerHTML = '<option value="">Choisir une optimisation...</option>';

    let detachmentUpgrades = [];
    if (player && player.faction) {
        if (player.faction === 'Adepta Sororitas') {
            detachmentUpgrades = sororitasDetachments || [];
        } else if (player.faction === 'Death Guard') {
            detachmentUpgrades = deathGuardDetachments || [];
        } else if (player.faction === 'Tyranids') {
            detachmentUpgrades = tyranidDetachments || [];
        } else if (factionDetachments[player.faction]) {
            detachmentUpgrades = factionDetachments[player.faction];
        }
    }

    if (detachmentUpgrades.length > 0) {
        const groupedUpgrades = {};

        detachmentUpgrades.forEach(upgrade => {
            if (!groupedUpgrades[upgrade.group]) {
                groupedUpgrades[upgrade.group] = [];
            }
            groupedUpgrades[upgrade.group].push(upgrade);
        });

        for (const groupName in groupedUpgrades) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = groupName;
            groupedUpgrades[groupName].forEach(upgrade => {
                const option = document.createElement('option');
                option.value = upgrade.name;
                option.textContent = `${upgrade.name} (${upgrade.cost} pts)`;
                option.dataset.cost = upgrade.cost;
                optgroup.appendChild(option);
            });
            detachmentUpgradeSelect.appendChild(optgroup);
        }
    }
    detachmentUpgradeSelect.disabled = !isCharacter;


    const battleScarSelect = document.getElementById('battle-scar-select');
    battleScarSelect.innerHTML = '<option value="">Choisir une cicatrice...</option>';

    // ==========================================================
    // DEBUT DE LA MODIFICATION TYRANIDE
    // ==========================================================
    if (player && player.faction === 'Tyranids' && tyranidCrusadeRules.battleScars) {
        const nonSynapseGroup = document.createElement('optgroup');
        nonSynapseGroup.label = `Tyranid: Non-SYNAPSE (D6)`;
        tyranidCrusadeRules.battleScars.nonSynapse.forEach(scar => {
             nonSynapseGroup.innerHTML += `<option value="${scar.name}">${scar.roll}: ${scar.name}</option>`;
        });
        battleScarSelect.appendChild(nonSynapseGroup);
        
        const synapseGroup = document.createElement('optgroup');
        synapseGroup.label = `Tyranid: SYNAPSE (D6)`;
        tyranidCrusadeRules.battleScars.synapse.forEach(scar => {
             synapseGroup.innerHTML += `<option value="${scar.name}">${scar.roll}: ${scar.name}</option>`;
        });
        battleScarSelect.appendChild(synapseGroup);

    } else {
        crusadeRules.battleScars.forEach(scar => {
            battleScarSelect.innerHTML += `<option value="${scar.name}">${scar.name}</option>`;
        });
    }
    // ==========================================================
    // FIN DE LA MODIFICATION TYRANIDE
    // ==========================================================

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

    const nurgleBoonSection = document.getElementById('nurgle-boon-section');

    // CORRIGÉ : Le bouton sert maintenant à lancer un dé pour un bienfait aléatoire, conformément aux règles
    if (player && player.faction === 'Death Guard' && isCharacter) {
        nurgleBoonSection.classList.remove('hidden');
        const nurgleBoonBtn = document.getElementById('add-nurgle-boon-btn');
        nurgleBoonBtn.textContent = 'Lancer pour un Bienfait';
        nurgleBoonBtn.title = "Refuser un Honneur de Bataille standard pour recevoir un don aléatoire de Nurgle.";
    } else {
        nurgleBoonSection.classList.add('hidden');
    }

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

    const sororitasUpgradesSection = document.getElementById('sororitas-upgrades-section');
    if (player && player.faction === 'Adepta Sororitas') {
        sororitasUpgradesSection.classList.remove('hidden');
    } else {
        sororitasUpgradesSection.classList.add('hidden');
    }
};

const addUpgradeToUnitData = (unit, textareaId, upgradeName, upgradeDesc, prefix = '') => {
    const textToAdd = `\n- ${prefix}${upgradeName}: ${upgradeDesc}`;
    const key = textareaId.replace('unit-', '');
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

    const traitDesc = findUpgradeDescription(traitName);
    if (!traitDesc) return;
    
    handleRpPurchase(`Trait: ${traitName}`, 1, () => {
        const unit = campaignData.players[activePlayerIndex].units[editingUnitIndex];
        addUpgradeToUnitData(unit, 'unit-honours', traitName, traitDesc);
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
    } else if (source === 'deathguard') {
        ruleSet = deathGuardCrusadeRules[category][type];
    }
    // ==========================================================
    // DEBUT DE LA MODIFICATION TYRANIDE
    // ==========================================================
    else if (source === 'tyranid') {
        ruleSet = tyranidCrusadeRules[category][type];
    }
    // ==========================================================
    // FIN DE LA MODIFICATION TYRANIDE
    // ==========================================================
    else {
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

    const scarDesc = findUpgradeDescription(scarName);
    const unit = campaignData.players[activePlayerIndex].units[editingUnitIndex];

    addUpgradeToUnitData(unit, 'unit-scars', scarName, scarDesc);
    saveData();
    
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

// CORRIGÉ : Cette fonction est maintenant gérée par le module de la faction (DeathGuard_module.js)
// document.getElementById('add-nurgle-boon-btn').addEventListener('click', () => { ... });

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