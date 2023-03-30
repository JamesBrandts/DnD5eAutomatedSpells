const lastArg = args[args.length-1]
const tokenTarget = await fromUuid(lastArg.tokenUuid)
const origin = lastArg.origin
const originItem = await fromUuid(origin)
if(args[0] === "on"){
    for(let token of canvas.tokens.placeables){
        let distance = canvas.grid.measureDistance(tokenTarget.object,token)
        if(distance > 30)continue;
        if(token.document.disposition !== tokenTarget.disposition)continue;
        if(token.id === tokenTarget.id)continue;
        await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: token.actor.uuid, effects: [getEffectData()]});
    }
    let hookId = Hooks.on("updateToken",async(document,updates)=>{
        if(!('x' in updates||'y' in updates))return;
        let position = {x:updates.x??document.x,y:updates.y??document.y}
        if(document.id === tokenTarget.id){            
            for(let token of canvas.tokens.placeables){
                if(token.document.disposition != tokenTarget.disposition)continue;            
                let distance = canvas.grid.measureDistance(position,token);
                if(distance > 30){
                    if(token.id !== tokenTarget.id){
                        token.actor.effects.find(i=>i.origin === origin)?.delete()
                    }
                }
                else{
                    if(!token.actor.effects.find(i=>i.origin === origin)){       
                        await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: token.actor.uuid, effects: [getEffectData()]});
                    }
                }
            }
        }
        else{
            if(document.disposition != tokenTarget.disposition)return;
            let distance = canvas.grid.measureDistance(position,tokenTarget.object);
            if(distance > 30){
                document.actor.effects.find(i=>i.origin === origin)?.delete()
            }
            else{
                if(!document.actor.effects.find(i=>i.origin === origin)){       
                        await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: document.actor.uuid, effects: [getEffectData()]});
                    }
            }
        }
    })
    DAE.setFlag(tokenTarget.actor,"crusadersMantleHookId",hookId)
}

if(args[0] === "off"){
    Hooks.off("updateToken",DAE.getFlag(tokenTarget.actor,"crusadersMantleHookId"))
    DAE.unsetFlag(tokenTarget.actor,"crusadersMantleHookId")
    for(let token of canvas.tokens.placeables){
        if(token.actor.effects.find(i=>i.origin === origin))
            await token.actor.effects.find(i=>i.origin === origin)?.delete()
    }
}


function getEffectData(){
    return {
        "changes": [
            {
                "key": "data.bonuses.mwak.damage",
                "mode": 2,
                "value": "1d4[radiant]",
                "priority": "20"
            },
            {
                "key": "data.bonuses.rwak.damage",
                "mode": 2,
                "value": "1d4[radiant]",
                "priority": "20"
            }
        ],
        "disabled": false,
        "duration": {
            "rounds": 10,
            "startTime": null,
            "seconds": 60
        },
        "icon": originItem.img,
        "label": originItem.name,
        "origin": origin,
        "tint": "",
        "transfer": false
    }
}