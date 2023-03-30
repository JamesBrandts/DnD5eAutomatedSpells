const damageType = 'radiant'
const lastArg = args[args.length-1];
const casterToken = (await fromUuid(lastArg.tokenUuid)).object
const spellLevel = args[1];
const item = await fromUuid(lastArg.origin)
if(args[0] === "on"){
    let damagedThisTurn = []
    let hookId1 = Hooks.on("preUpdateToken",(token,changes,options,userId)=>{
        if(!('x' in changes||'y' in changes))return;
        let desl = token.height*canvas.scene.dimensions.size/2;
        let finalPositionX = changes.x??token.x;
        let finalPositionY = changes.y??token.y;
        if(token.id === casterToken.id){
            for(let tokenT of canvas.scene.tokens.map(i=>i)){
                if(tokenT.disposition === casterToken.document.disposition)continue;
                if(canvas.grid.measureDistance({x:finalPositionX+desl,y:finalPositionY+desl},tokenT.object.center) > 15){
                    tokenT.actor.deleteEmbeddedDocuments("ActiveEffect",tokenT.actor.effects.filter(i=>i.origin === lastArg.origin).map(i=>i.id))
                    continue;
                }
                applyEffect(tokenT)            
            }
            return;
        }
        
        if(token.disposition === casterToken.document.disposition)return;        
        if(canvas.grid.measureDistance({x:finalPositionX+desl,y:finalPositionY+desl},casterToken.center) > 15){
            token.actor.deleteEmbeddedDocuments("ActiveEffect",token.actor.effects.filter(i=>i.origin === lastArg.origin).map(i=>i.id));
            return;
        }
        if(canvas.grid.measureDistance(token.object.center,casterToken.center) <= 15)return;     
        applyEffect(token)
        if(damagedThisTurn.includes(token))return;
        damagedThisTurn.push(token);
        applyDamage(token)
    })
    let hookId2 = Hooks.on("updateCombat",(combat,turn,opions,userId)=>{
        let token = canvas.tokens.get(combat.current.tokenId)
        if(token.disposition === casterToken.document.disposition)return;
        if(canvas.grid.measureDistance(token.center,casterToken.center) > 15)return;
        applyEffect(token)
        applyDamage(token)
    })
    DAE.setFlag(casterToken.actor,"SpiritGuardianHooks",[hookId1,hookId2])
    for(let token of canvas.scene.tokens.map(i=>i)){
        if(token.disposition === casterToken.document.disposition)continue;
        if(canvas.grid.measureDistance(token.object.center,casterToken.center) > 15)continue;
        applyEffect(token)
    }
}
if(args[0] === "off"){
    hookIds = DAE.getFlag(casterToken.actor,"SpiritGuardianHooks")
    Hooks.off("preUpdateToken",hookIds[0])
    Hooks.off("updateCombat",hookIds[1])
    for(let token of canvas.scene.tokens.map(i=>i)){
        token.actor.deleteEmbeddedDocuments("ActiveEffect",token.actor.effects.filter(i=>i.label === "Spirit Guardians Movement Reduction").map(i=>i.id))
    }
}


async function applyDamage(token){
    let tokenUuid = token.uuid??token.document.uuid
    let damageItem = await casterToken.actor.createEmbeddedDocuments("Item",[getItemData()])
    await MidiQOL.completeItemUse(damageItem[0], {}, {targetUuids: [tokenUuid]});
    await casterToken.actor.deleteEmbeddedDocuments("Item",[damageItem[0].id])
}

async function applyEffect(token){
    if(token.actor.effects.find(i=>i.label === "Spirit Guardians Movement Reduction"))return;
    effectData = {
        "changes": [
            {
                "key": "data.attributes.movement.walk",
                "mode": 1,
                "value": 0.5,
                "priority": "20"
            }
        ],
        "disabled": false,
        "origin":lastArg.origin,
        "duration": {
            "startTime": null,
            "seconds": 600,
            "rounds": 100
        },
        "icon": item.img,
        "label": "Spirit Guardians Movement Reduction",
        "tint": "",
        "transfer": false,
    }
    await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: token.actor.uuid, effects: [effectData]});
}

function getItemData(){
    return {
        name: item.name + " Damage",
        type: "spell",
        img: item.img,
        data: {
            description: {
                    value: ""},
            actionType: "save",
            activation: {type: "none"},
            damage: {parts: [[`${spellLevel}d8`, `${damageType}`]]},
            save: {ability: "wis",dc: null,scaling: "spell"},
            level: 0,
            school: "con",
        }
    };
}