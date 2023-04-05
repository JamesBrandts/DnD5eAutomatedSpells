const lastArg = args[args.length - 1];
if(args[0]=="on"){
    const tactor = await MidiQOL.MQfromActorUuid(lastArg.actorUuid);
    let weapons = tactor.items.filter(i => i.type === `weapon` && i.system.actionType == "mwak" && i.system.equipped);
    let weapon_content = ``;
    for (let weapon of weapons) {
        weapon_content += `<option value=${weapon.id}>${weapon.name}</option>`;
    }
    let content = `
    <div class="form-group">
    <label>Weapons : </label>
    <select name="weapons">
        ${weapon_content}
    </select>
    </div>`;
    if (weapons.length > 1){
        new Dialog({
            title: "Choose Weapon",
            content,
            buttons:
            {
                Ok:
                {
                    label: `Ok`,
                    callback: (html) => {
                        let itemId = html.find('[name=weapons]')[0].value;
                        let weaponItem = tactor.items.get(itemId);
                        weaponItem.use()
                    }
                },
                Cancel:
                {
                    label: `Cancel`
                }
            }
        }).render(true);
    }
    else{
        let weaponItem = weapons[0];
        weaponItem.use()
    }
}
if(args[0].tag != "DamageBonus")return;
if(args[0].item.system.actionType != "mwak")return
const tactor = await MidiQOL.MQfromActorUuid(lastArg.actorUuid);
const level = tactor.system.details?.level || 0;
const baseDice = Math.floor((level+1)/6);
const itemData = getItemData(baseDice+1)
for (let tokenUuid of args[0]?.hitTargetUuids) {
    const target = await MidiQOL.MQfromActorUuid(tokenUuid);
    const effects =  target.effects.filter(i=>i.flags.dae.effect = "booming-blade").length
    if( effects > 0) continue;
    await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: tokenUuid, effects: [getBoomingBladeEffectData()]});
    animation(target)
    const hookId = Hooks.on("updateToken",(document,update,options,userId)=>{
        if(document.uuid === tokenUuid && ("x" in update || "y" in update) && !target.flags.dae.forcedMovement){
            rollItem(tactor, [tokenUuid], itemData)            
            MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: tokenUuid, effects: target.effects.filter(i=>i.flags.dae.effect = "booming-blade").map(i=>i.id)});
            endAnimation(target)
            Hooks.off("updateToken",hookId)          
        }
    })
    const hookId2 = Hooks.on("updateCombat",(document,update,options,userId)=>{
        if(canvas.scene.tokens.get(document.current.tokenId).actor.id === tactor.id){
            MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: tokenUuid, effects: target.effects.filter(i=>i.flags.dae.effectName = "booming-blade").map(i=>i.id)});
            endAnimation(target)
            Hooks.off("updateToken",hookId)
            Hooks.off("updateToken",hookId2)
        }
    })
}


const diceMult = args[0].isCritical ? 2: 1;

if(baseDice < 1){return}
return {damageRoll: `${baseDice * diceMult}d8[thunder]`, flavor: "Lâmina Trovejante"};

async function rollItem(actor, targetUuids, itemData){
    let [item] = await actor.createEmbeddedDocuments("Item",[itemData])
    await MidiQOL.completeItemUse(item, {},{targetUuids});
    await actor.deleteEmbeddedDocuments("Item",[item.id])
}
function getItemData(dices){
    return {
        "name": "Booming Blade Secondary Damage",
        "type": "spell",
        "img": "icons/magic/sonic/projectile-shock-wave-blue.webp",
        "data": {
            "activation": {
                "type": "none",
                "cost": 0,
                "condition": ""
            },
            "damage": {
                "parts": [
                    [
                        `${dices}d8`,
                        "thunder"
                    ]
                ],
            },
            "level": 0,
            "school": "evo",
            "preparation": {
                "mode": "innate",
            }
        },
    }
}

function getBoomingBladeEffectData(){
    return {
        "disabled": false,
        "duration": {
            "rounds": 1
        },
        "icon": "icons/magic/sonic/projectile-shock-wave-blue.webp",
        "label": "Booming Blade",
        "flags":{"dae":{"effectName":"booming-blade"}}
    }
}

function animation(target){
    if(!game.modules.get("sequencer").active)return
    const tokenHeight = target.token?.height ?? 1
    new Sequence()
        .effect()
            .file("modules/JB2A_DnD5e/Library/Generic/Lightning/StaticElectricity_01_Regular_Blue_400x400.webm")
            .attachTo(target)
            .scale(0.5*tokenHeight,0.5*tokenHeight)
            .persist()
            .name(`BoomingBlade-${target.id}`)
        .play()
}


function endAnimation(target){
    if(!game.modules.get("sequencer").active)return
    Sequencer.EffectManager.endEffects({name: `BoomingBlade-${target.id}`})
}