const lastArg = args[args.length - 1];
const tokenTarget = await fromUuid(lastArg.tokenUuid)
if(args[0] === "on"){
    Hooks.on("midi-qol.preambleComplete", async (workflow) => {
        if(workflow.actor.uuid !== lastArg.actorUuid)return;
        const targetsNumber = workflow.targets.length
        const range = workflow.item?.system?.range
        const tokens = canvas.tokens.filter(token => canvas.grid.measureDistance(token.center,tokenTarget.center) >= range)
        const targets = []
        for(let target of workflow.targets){        
            const rand = tokens[Math.floor(Math.random()*tokens.length)]
            target.push(tokens[rand])
        }
    })
}