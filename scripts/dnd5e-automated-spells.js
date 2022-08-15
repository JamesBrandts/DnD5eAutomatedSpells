console.log('DnD5e Automated Spells || Registering Hooks');
Hooks.on("midi-qol.preDamageRollComplete",async(workflow)=>{   
    let targets = await Array.from(workflow.targets)
    for(let target of targets){
        let absorbElements = await target.actor.items.find(i=>i.name === "Absorb Elements");
        if(absorbElements){
            let damageType = workflow.damageDetail[0]?.type;
            if(["acid","cold","fire","lightning","thunder"].includes(damageType)){
                await absorbElements.update({'data.activation.type':'reactiondamage'})
                await DAE.setFlag(target.actor,"lastDamageType",damageType);
            }
            else{
                await absorbElements.update({'data.activation.type':'reactionmanual'})
            }
        }
        let deflectMissiles = await target.actor.items.find(i=>i.name === "Deflect Missiles");
        if(deflectMissiles){
            if(workflow.item.data.data.actionType === "rwak"){
                await deflectMissiles.update({'data.activation.type':'reactiondamage'})
            }
            else{
                await deflectMissiles.update({'data.activation.type':'reactionmanual'})
            }
        }
    }
    await new Promise(r => setTimeout(r, 10));
    return
})