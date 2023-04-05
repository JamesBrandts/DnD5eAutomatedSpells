if(args[0].macroPass != "postDamageRoll")return;
const damage_types = ["Acid","Cold","Fire","Fire","Lightning","Poison","Psychic","Thunder",];
const element1 = damage_types[args[0].damageRoll.terms[0].values[0]-1]
const element2 = damage_types[args[0].damageRoll.terms[0].values[1]-1]
const spellLevel = args[0].spellLevel
const tokenCaster = await fromUuid(args[0].tokenUuid)
const actorCaster = tokenCaster.actor
if(element1 === element2){
    type = element1.toLowerCase()
    ui.notifications.info(
      `Chaos bolt bounces! Cast it again on another target within 30ft of the current one.`
    );
    let itemData = duplicate(args[0].itemData);
    itemData.data.level = 0;
    itemData.data.preparation.mode = "innate";
    itemData.name = "Additional Chaos Bolt"
    itemData.data.damage.parts[0][0] = `2d8+${spellLevel}d6`
    let item = await actor.createEmbeddedDocuments("Item",[itemData])
    let hookId = Hooks.on("midi-qol.RollComplete", (workflow)=>{
      if(workflow.itemId != item[0].id)return;
      actorCaster.deleteEmbeddedDocuments("Item",[item[0].id])
      Hooks.off("midi-qol.RollComplete", hookId)
    })
    Hooks.once('updateCombat',()=>{
      Hooks.off("midi-qol.RollComplete", hookId)
      if(actorCaster.items.get(item[0].id))
        actorCaster.deleteEmbeddedDocuments("Item",[item[0].id])
    })
}
else{
    typeU = await choose([element1,element2])
    type = typeU.toLowerCase()
}
const theItem = await fromUuid(args[0].uuid);
theItem.data.data.damage.parts[0][1] = type

async function choose(options) {
    let value = await new Promise((resolve) => {
      let buttons = options.map((type) => {
        return {
          label: type,
          callback: () => {
            resolve(type);
          },
        };
      });
      new Dialog({
        title: "Select damage type",
        buttons: buttons,
      }).render(true);
    });
    return value;
  }