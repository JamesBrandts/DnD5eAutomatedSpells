const lastArg = args[args.length-1]
if(args[0].tag === "DamageBonus"){
    const item = args[0].actor.items.find(i=>i.flags?.dae?.InfernalRuneItem === 1)
    console.log({item})
    let confirmation = await Dialog.confirm({
      title: 'Infernal Rune',
      content: `<p>Use Infernal Rune?</p>`,
    });
    if(!confirmation)return;    
    const targetUuids = args[0].targetUuids
    await MidiQOL.completeItemUse(item,{},targetUuids)
}

if(args[0] === "on"){
    let actor = await fromUuid(lastArg.actorUuid)
    actor = actor.actor ?? actor    
    await actor.setFlag("dae","originalImmunities",actor.system.traits.di.value)
    console.log({actor})
    // await new Promise(r => setTimeout(r, 200));
    const changes = lastArg.efData.changes
    // if(actor.system.traits.di.value.delete("fire"))
    //     changes[0].key = 'system.traits.dr.value'
    // if(actor.system.traits.di.value.delete("necrotic"))
    //     changes[1].key = 'system.traits.dr.value'
    actor.system.traits.di.value.delete("fire")
    actor.system.traits.di.value.delete("necrotic")
    //actor.updateEmbeddedDocuments("ActiveEffect",[{_id:lastArg.effectId,changes}])
}

if(args[0] === "off"){
    let actor = await fromUuid(lastArg.actorUuid)
    actor = actor.actor ?? actor   
    actor.system.traits.di.value = await actor.getFlag("dae","originalImmunities")
    await actor.unsetFlag("dae","originalImmunities")
}