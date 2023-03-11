if (args[0] === "on") {
    const lastArg = args[args.length - 1]
    const originTokenId = args[1]
    const targetToken = canvas.tokens.get(lastArg.tokenId);
    const origin = canvas.tokens.get(originTokenId);
    const targetActor = targetToken.actor;
    const dc = args[2]
    console.log({ lastArg, originTokenId, targetToken, origin, targetActor, dc })
    let hookId = Hooks.on("midi-qol.preItemRoll", async (workflow) => {
        if (lastArg.tokenId != workflow.tokenId) return;
        let targets = Array.from(workflow.targets);
        let ids = [];
        for (let target of targets) {
            ids.push(target.id)
        }
        if (ids.includes(originTokenId)) return;
        workflow.disadvantage = true
        return;
    });
    DAE.setFlag(targetActor, "CompelledDuelHookId", hookId);
    let hookId2 = Hooks.on('preUpdateToken', (tokenDocument, change, options, userId) => {
        if (change._id != targetToken.id) return;
        //if(game.combat?.current.tokenId != targetToken.id) return;
        if (!("x" in change || "y" in change)) return;
        if (targetActor.flags.dae.forcedMovement) return;
        let targetLocationX = change.x ?? targetToken.x;
        let targetLocationY = change.y ?? targetToken.y;
        let targetLocation = { x: targetLocationX, y: targetLocationY };
        let distance = canvas.grid.measureDistance(targetLocation, origin);
        if (distance > 30) {
            if (DAE.getFlag(targetActor, "CompelledDuelLastSave")) {
                if (DAE.getFlag(targetActor, "CompelledDuelLastSave")[0] == game.combat?.current.round) return DAE.getFlag(targetActor, "CompelledDuelLastSave")[1];
            }
            let wisSaveBonus = targetActor.system.abilities.wis.save;
            let saveRoll = new Roll(`1d20+${wisSaveBonus}`).evaluate({ async: false });
            let flavor = "";
            if (saveRoll.total < dc) {
                flavor = `<h2><img src="icons/skills/melee/weapons-crossed-swords-black-gray.webp" width="35" height="35">Compelled Duel Movement Restriction</h2><p style="font-size: larger">Due to the effect of Compelled Duel ${targetActor.name} cannot willingly move to more dan 30 feet away from ${origin.name}<p>Wisdom saving throw<p style="font-size:15px;color:red">DC: ${dc}`;
                saveRoll.toMessage({ flavor: flavor });
                ui.notifications.warn(`Due to the effect of Compelled Duel ${targetActor.name} cannot willingly move to more dan 30 feet away from ${origin.name}`);
                DAE.setFlag(targetActor, "CompelledDuelLastSave", [game.combat?.current.round, false]);
                return false;
            }
            else {
                flavor = `<h2><img src="icons/skills/melee/weapons-crossed-swords-black-gray.webp" width="35" height="35">Compelled Duel Movement Restriction</h2><p>Wisdom saving throw<p style="font-size:15px;color:green">DC: ${dc}`;
                saveRoll.toMessage({ flavor: flavor });
                DAE.setFlag(targetActor, "CompelledDuelLastSave", [game.combat?.current.round, true]);
            }
        }
    });
    DAE.setFlag(targetActor, "CompelledDuelHookId2", hookId2);
}

if (args[0] === "off") {
    const lastArg = args[args.length - 1]
    const targetToken = canvas.tokens.get(lastArg.tokenId);
    const targetActor = targetToken.actor;
    Hooks.off("midi-qol.preItemRoll", DAE.getFlag(targetActor, "CompelledDuelHookId"))
    Hooks.off("preUpdateToken", DAE.getFlag(targetActor, "CompelledDuelHookId2"))
    Hooks.off("preUpdateCombat", DAE.getFlag(targetActor, "CompelledDuelHookId3"))
    Hooks.off("midi-qol.RollComplete", DAE.getFlag(targetActor, "CompelledDuelHookId4"))
}

if (args[0].macroPass === 'postActiveEffects') {
    if (args[0].failedSaves.length < 1) return;
    let hookId3 = Hooks.on('preUpdateCombat', (combat, update, options, userId) => {
        if (args[0].tokenId != combat.current.tokenId) return;
        if (canvas.grid.measureDistance(args[0].failedSaves[0].object, token) <= 30) return;

        let concentrating = token.actor.effects.find(i => i.label === "Concentrating");
        token.actor.deleteEmbeddedDocuments("ActiveEffect", [concentrating.id]);
    })
    DAE.setFlag(args[0].failedSaves[0].actor, "CompelledDuelHookId3", hookId3)
    let hookId4 = Hooks.on('midi-qol.RollComplete', (workflow) => {
        let abilityTargets = Array.from(workflow.targets)
        if (workflow.token.id === token.id) {
            if (abilityTargets[0].id === args[0].failedSaves[0].id && abilityTargets.length < 2) return;
            for (let abilityTarget of abilityTargets) {
                console.log({ abilityTarget, args })
                if (abilityTarget.document.disposition === args[0].failedSaves[0].disposition) {
                    console.log({ token })
                    let concentrating = token.actor.effects.find(i => i.label === "Concentrating");
                    token.actor.deleteEmbeddedDocuments("ActiveEffect", [concentrating.id]);
                }
            }
        }
        if (abilityTargets.includes(args[0].failedSaves[0].object) && workflow.token.document.disposition === token.document.disposition) {
            let concentrating = token.actor.effects.find(i => i.label === "Concentrating");
            token.actor.deleteEmbeddedDocuments("ActiveEffect", [concentrating.id]);
        }
    })
    DAE.setFlag(args[0].failedSaves[0].actor, "CompelledDuelHookId4", hookId4)
}