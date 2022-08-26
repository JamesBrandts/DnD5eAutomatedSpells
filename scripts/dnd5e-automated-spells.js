console.log('DnD5e Automated Spells 1.1.4|| Registering Hooks');
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
let automatedSocket;
Hooks.once("socketlib.ready", () => {
    console.log('DnD5e Automated Spells|| Registering Sockets');
    automatedSocket = socketlib.registerModule("dnd5e-automated-spells");	
    automatedSocket.register("automatedWebSpell", automatedWebSpell);
    automatedSocket.register("automatedDarknessSpell", automatedDarknessSpell);
    automatedSocket.register("automatedSpikeGrowthSpell", automatedSpikeGrowthSpell);
    automatedSocket.register("callHookGM", callHookGM);
})

Hooks.on("midi-qol.preItemRoll",async (workflow)=>{
    return await automatedSocket.executeAsGM("callHookGM","midi-qol.preItemRollGM",workflow)
})
Hooks.on("midi-qol.preDamageRollComplete",async (workflow)=>{
    return await automatedSocket.executeAsGM("callHookGM","midi-qol.preDamageRollCompleteGM",workflow)
})
Hooks.on("preUpdateToken",async (document,updates)=>{
    return await automatedSocket.executeAsGM("callHookGM","preUpdateTokenGM",document,updates)
})
async function callHookGM(hookName,arg1,arg2){
    return await Hooks.call(hookName,arg1,arg2)
}


async function automatedWebSpell(args){
    let casterToken = await fromUuid(args[0].tokenUuid)
    let template = await fromUuid(args[0].templateUuid)
    let origin = args[0].itemUuid
    let templateX = template.data.x;
    let templateY = template.data.y
    let item = await casterToken.actor.createEmbeddedDocuments('Item',[getWebSaveData()])
    let removeUuids = getProperty(casterToken.actor.data.flags, "midi-qol.concentration-data.removeUuids") ?? [];
    removeUuids = removeUuids.concat([item[0].uuid]);
    if (removeUuids.length > 0) casterToken.actor.setFlag("midi-qol", "concentration-data.removeUuids", removeUuids);
    let hookId = Hooks.on('updateToken',(token,changes)=>{
        if(!('x' in changes||'y' in changes))return;
        let px = token.data.x;
        let py = token.data.y;
        let center = token.data.height*canvas.grid.size/2;
        let size = canvas.grid.size;
        if(px+center<templateX)return;
        if(px+center>templateX+4*size)return;
        if(py+center<templateY)return;
        if(py+center>templateY+4*size)return;
        rollEffectItem(token)
    })
    let hookId2 = Hooks.on('updateCombat',(combat,turn,opions,userId)=>{
        let token = canvas.scene.tokens.get(combat.current.tokenId)
        let px = token.data.x;
        let py = token.data.y;
        let center = token.data.height*canvas.grid.size/2;
        let size = canvas.grid.size;
        if(px+center<templateX)return;
        if(px+center>templateX+4*size)return;
        if(py+center<templateY)return;
        if(py+center>templateY+4*size)return;
        rollEffectItem(token)
    })
    let hookId3 = Hooks.on('deleteActiveEffect',async (document)=>{
        if(document.data.label != 'Concentrating')return;
        if(document.data.origin != origin)return;
        webConcentrationId = await casterToken.actor.effects.filter(i=>i.data.label === 'Web Concentration').map(i=>i.id)
        await casterToken.actor.deleteEmbeddedDocuments('ActiveEffect',webConcentrationId)
        Hooks.off('updateToken',hookId)
        Hooks.off('updateCombat',hookId2)
        Hooks.off('deleteActiveEffect',hookId3)        
    })

    async function rollEffectItem(token){
        if(token.actor.effects.filter(i=>i.data.label === "Restrained").length > 0)return;
        await item[0].update({'data.uses':{per:'',max:'',value:null}});
        await MidiQOL.completeItemRoll(item[0], {targetUuids: [token.uuid??token.document.uuid]});
        await item[0].update({'data.uses':{per:'charges',max:'1',value:0}});
    }

    function getWebSaveData(){
        return {
            "name": "Web Save",
            "type": "spell",
            "img": "systems/dnd5e/icons/spells/shielding-spirit-3.jpg",
            "data": {
                "activation": {
                    "type": "none",
                    "cost": 0,
                    "condition": ""
                },
                "actionType": "save",
                "save": {
                    "ability": "dex",
                    "dc": null,
                    "scaling": "spell"
                },
                "level": 0,
                "school": "con",
            },
            "uses":{
                "value": 0,
                "max": "1",
                "per": "charges"
            },
            "effects": [
                {
                    "changes": [
                        {
                            "key": "flags.midi-qol.disadvantage.attack.all",
                            "mode": 2,
                            "value": "1",
                            "priority": "20"
                        },
                        {
                            "key": "flags.midi-qol.grants.advantage.attack.all",
                            "mode": 2,
                            "value": "1",
                            "priority": "20"
                        },
                        {
                            "key": "data.attributes.movement.all",
                            "mode": 0,
                            "value": "*0",
                            "priority": "20"
                        },
                        {
                            "key": "macro.itemMacro.GM",
                            "mode": 0,
                            "value": "@attributes.spelldc @token",
                            "priority": "20"
                        }
                    ],
                    "disabled": false,
                    "duration": {
                        "startTime": null,
                        "seconds": 3600,
                        "rounds": 600
                    },
                    "icon": "systems/dnd5e/icons/spells/shielding-spirit-3.jpg",
                    "label": "Restrained",
                    "transfer": false,
                    "flags": {
                        "core": {
                            "statusId": ""
                        },
                        "dae": {
                            "stackable": "none",
                            "transfer": false
                        }
                    },
                    "selectedKey": [
                        "flags.midi-qol.disadvantage.attack.all",
                        "flags.midi-qol.grants.advantage.attack.all",
                        "data.attributes.movement.all",
                        "macro.itemMacro"
                    ]
                }
            ],
            "flags": {
                "itemacro": {
                    "macro": {
                        "data": {
                            "name": "Web Save",
                            "command": getFreeFromWebCommand(),
                        }
                    }
                }
            }
        }
    }

    function getFreeFromWebCommand(){
        return `
        const lastArg = args[args.length-1];
        token = await fromUuid(lastArg.tokenUuid);
        actor = token.actor;
        const spelldc = args[1];
        if(args[0] === "on"){
            const casterToken = canvas.tokens.get(args[2])
            const effect = actor.effects.get(lastArg.effectId)
            let removeUuids = getProperty(casterToken.actor.data.flags, "midi-qol.concentration-data.removeUuids") ?? [];
            removeUuids = removeUuids.concat([effect.uuid]);
            if (removeUuids.length > 0) casterToken.actor.setFlag("midi-qol", "concentration-data.removeUuids", removeUuids);  
            let [item] = await actor.createEmbeddedDocuments("Item",[getFreeFromWebData()]);
            DAE.setFlag(actor,"webSaveItemId",[item.id]);
        }
        if(args[0]=== "off"){
            actor.deleteEmbeddedDocuments("Item",DAE.getFlag(actor,"webSaveItemId"));
            DAE.unsetFlag(actor,"webSaveItemId");
        }
        function getFreeFromWebData(){
            return {
                "name": "Free from Web",
                "type": "feat",
                "img": "systems/dnd5e/icons/spells/shielding-spirit-3.jpg",
                "data": {
                    "description": {
                        "value": "Try to free from web",
                        "chat": "Try to free from web",
                        "unidentified": ""
                    },
                    "activation": {
                        "type": "action",
                        "cost": 1,
                        "condition": ""
                    },
                    "target": {
                        "value": null,
                        "width": null,
                        "units": "",
                        "type": "self"
                    },
                    "actionType": "abil",
                    "save": {
                        "ability": "str",
                        "dc": \`\${spelldc}\`,
                        "scaling": "flat"
                    },
                },
                "flags": {
                    "midi-qol": {
                        "effectActivation": false,
                        "onUseMacroName": "[postActiveEffects]ItemMacro"
                    },
                    "itemacro": {
                        "macro": {
                            "data": {
                                "name": "Free from Web",
                                "command": \`let effectId = "\${lastArg.effectId}";if(args[0].saves.length < 1)return;actor.deleteEmbeddedDocuments(\\"ActiveEffect\\",[effectId])\`,
                            }
                        }
                    }
                }
            }
        }`
    }
}

async function automatedDarknessSpell(args){
    const template = await fromUuid(args[0].templateUuid);
    const casterToken = await fromUuid(args[0].tokenUuid)
    const [light] = await canvas.scene.createEmbeddedDocuments("AmbientLight",[{
        "x": template.data.x,
        "y": template.data.y,
        "walls": true,
        "vision": false,
        "config": {
            "alpha": 0.5,
            "angle": 0,
            "bright": 20,
            "coloration": 1,
            "dim": 0,
            "gradual": true,
            "luminosity": -1,
        }
    }])
    let removeUuids = getProperty(casterToken.actor.data.flags, "midi-qol.concentration-data.removeUuids") ?? [];
    removeUuids = removeUuids.concat([light.uuid]);
    if (removeUuids.length > 0) casterToken.actor.setFlag("midi-qol", "concentration-data.removeUuids", removeUuids);
}

async function automatedSpikeGrowthSpell(args){
    const template = await fromUuid(args[0].templateUuid)
    const casterToken = await fromUuid(args[0].tokenUuid)
    let size = canvas.grid.size
    let radius = 4*size
    let linesInXvar = await linesInX(template.data.x,template.data.y,radius,size)
    let linesInYvar = await linesInY(template.data.x,template.data.y,radius,size)
    canvas.scene.tokens.map(i=>i.setFlag("dnd5e-automated-spells","SpikeGrowthcontrollPosition",{x:i.data.x,y:i.data.y}));
    let hookId = Hooks.on("updateToken",async(token,changes)=>{
        if(!('x' in changes||'y' in changes))return;
        let p1x = token.getFlag("dnd5e-automated-spells","SpikeGrowthcontrollPosition")?.x
        let p1y = token.getFlag("dnd5e-automated-spells","SpikeGrowthcontrollPosition")?.y
        let p2x = changes.x??token.data.x
        let p2y = changes.y??token.data.y
        token.setFlag("dnd5e-automated-spells","SpikeGrowthcontrollPosition",{x:token.data.x,y:token.data.y})
        let desl = token.data.height*canvas.grid.size/2
        let crossedOnX = 0
        let crossedOnY = 0
        for(let line of linesInXvar){
            let crossPoint = await crossLineInX(line.x,p1x+desl,p1y+desl,p2x+desl,p2y+desl)
            if(!crossPoint)continue;
            if(crossPoint>line.y1)continue;
            if(crossPoint<line.y2)continue;
            crossedOnX++
        }
        for(let line of linesInYvar){
            let crossPoint = await crossLineInY(line.y,p1x+desl,p1y+desl,p2x+desl,p2y+desl)
            if(!crossPoint)continue;
            if(crossPoint>line.x1)continue;
            if(crossPoint<line.x2)continue;
            crossedOnY++
        }
        let dices = crossedOnX*2;
        if(crossedOnY>crossedOnX)dices = crossedOnY*2;
        if(dices<1)return;
        let item = await casterToken.actor.createEmbeddedDocuments('Item',[getItemData(dices)])
        await MidiQOL.completeItemRoll(item[0], {targetUuids: [token.uuid]});
        casterToken.actor.deleteEmbeddedDocuments('Item',[item[0].id])
    })
    let hookId2 = Hooks.on("deleteActiveEffect",(document)=>{
        if(document.data.label != "Concentrating")return;
        if(document.data.origin != args[0].itemUuid)return;
        canvas.scene.tokens.map(i=>i.unsetFlag("dnd5e-automated-spells","SpikeGrowthcontrollPosition"));
        Hooks.off("updateToken",hookId)
        Hooks.off("deleteActiveEffect",hookId2)
    })

    function crossLineInX(x,p1x,p1y,p2x,p2y){
        if(p1x>=x&&p2x>x)return false;
        if(p1x<=x&&p2x<x)return false;
        return p1y+((x-p1x)*(p1y-p2y)/(p1x-p2x)) 
    }
    function crossLineInY(y,p1x,p1y,p2x,p2y){
        if(p1y>=y&&p2y>y)return false;
        if(p1y<=y&&p2y<y)return false;
        return p1x+((y-p1y)*(p1x-p2x)/(p1y-p2y)) 
    }
    function linesInX(x,y,radius,size){
        let lines = [{x:x,y1:y+radius,y2:y-radius}]
        for(let i = size;i<=radius;i+=size){
            lines.push({x:x+i,y1:y+Math.sqrt(radius*radius-i*i),y2:y-Math.sqrt(radius*radius-i*i)})
            lines.push({x:x-i,y1:y+Math.sqrt(radius*radius-i*i),y2:y-Math.sqrt(radius*radius-i*i)})
        }
        return lines
    }
    function linesInY(x,y,radius,size){
        let lines = [{y:y,x1:x+radius,x2:x-radius}]
        for(let i = size;i<=radius;i+=size){
            lines.push({y:y+i,x1:x+Math.sqrt(radius*radius-i*i),x2:x-Math.sqrt(radius*radius-i*i)})
            lines.push({y:y-i,x1:x+Math.sqrt(radius*radius-i*i),x2:x-Math.sqrt(radius*radius-i*i)})
            
        }
        return lines
    }
    function getItemData(dices){
        return {
            "name": "Spike Growth Damage",
            "type": "spell",
            "img": "systems/dnd5e/icons/spells/vines-acid-2.jpg",
            "data": {
                "activation": {
                    "type": "none",
                    "cost": 0,
                    "condition": ""
                },
                "damage": {
                    "parts": [
                        [
                            `${dices}d4`,
                            "piercing"
                        ]
                    ],
                },
                "level": 0,
                "school": "trs",
                "preparation": {
                    "mode": "innate",
                }
            },
        }
    }
}
