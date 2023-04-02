const lastArg = args[args.length - 1];
const tokenTarget = await fromUuid(lastArg.tokenUuid)
if(args[0] === "on"){
    const hookId = Hooks.on("midi-qol.preItemRoll", async (workflow) => {
        if(workflow.actor.uuid !== lastArg.actorUuid)return;
        let range = workflow.item?.system?.range.value||5
        if(range === 5)range = 7.5
        let tokens = canvas.tokens.placeables.filter(token => canvas.grid.measureDistance(token.center,tokenTarget.object.center) <= range && token.actor.system.attributes.hp.value > 0).map(token=>token.id)
        tokens.splice(tokens.indexOf(tokenTarget.id), 1);
        const targets = []
        for(let target of workflow.targets){
            if(target.id === tokenTarget.id){
                targets.push(target.id)
                continue
            }
            const rand = Math.floor(Math.random()*tokens.length)
            const id = tokens[rand]
            tokens.splice(rand, 1);
            targets.push(id)
        }
        game.user.updateTokenTargets(targets)
    })
    DAE.setFlag(tokenTarget.actor,"EnemiesAboundHookId",hookId)
}
if(args[0] === "off"){
    const hookId = await DAE.getFlag(tokenTarget.actor,"EnemiesAboundHookId")
    Hooks.off("midi-qol.preItemRoll",hookId)
    await DAE.unsetFlag(tokenTarget.actor,"EnemiesAboundHookId")
}