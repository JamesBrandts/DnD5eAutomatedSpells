const lastArg = args[args.length - 1];
const actor = await fromUuid(lastArg.actorUuid);
let targetToken = await fromUuid(lastArg.targetUuids[0]);
if (lastArg.macroPass === "postActiveEffects") {
  const curseEffect = targetToken.actor.effects.find((i) => i.label === "Bestow Curse");
  const curse = await ShowDialogCurse();
  let changes = [];
  let ability = "";
  if (curse === "disadvantageAbility") {
    ability = await ShowDialogHabilities();
    changes = getAbilityDisadvantageEffectChanges(ability)
  }
  if (curse === "disadvantageAttack"){
    changes = [
        {
          key: `flags.dae.BestowCurseTokenId`,
          mode: 2,
          value: lastArg.tokenId,
          priority: 20,
        }]
  }
  if (curse === "wastaAction"){
    changes = [
        {
          key: `flags.dae.BestowCurseWasteAction`,
          mode: 2,
          value: "1",
          priority: 20,
        }]
  }
  if (curse === "extraDamage"){
    const concentrationDataUuid = lastArg.itemUuid
    const effectData = {
        changes: [
          {key: "flags.midi-qol.bestowCurse", mode: 5, value: lastArg.targetUuids[0], priority: 20},
          {key: "flags.dnd5e.DamageBonusMacro", mode: 0, value: `ItemMacro.${lastArg.item.name}`, priority: 20}
        ],  
        origin: concentrationDataUuid,
        disabled: false,
        duration: lastArg.item.effects[0].duration,
        icon: lastArg.item.img,
        label: lastArg.item.name
    }
    MidiQOL.socket().executeAsGM("createEffects", {actorUuid: lastArg.actorUuid, effects: [effectData]})
  }
  await MidiQOL.socket().executeAsGM("updateEffects", {
    actorUuid: targetToken.actor.uuid,
    updates: [{ _id: curseEffect.id, changes }],
  });
}

if(lastArg.macroPass === "DamageBonus"){
    const tokenU =  await fromUuid(lastArg.tokenUuid);
    if(tokenU.actor.flags["midi-qol"].bestowCurse != lastArg.hitTargetUuids[0])return;
    const diceMult = lastArg.isCritical ? 2: 1;
    return {damageRoll: `${diceMult}d8[necrotic]`, flavor: "Bestow Curse Damage"}
}



async function ShowDialogCurse() {
  return await new Promise((resolve) => {
    new Dialog({
      title: "Bestow Curse",
      content: `Choose the nature of the curse on the target`,
      buttons: {
        disadvantageAbility: {
          label:
            "Disadvantage on ability checks and saving throws made with one ability score",
          callback: () => {
            resolve("disadvantageAbility");
          },
        },
        disadvantageAttack: {
          label: "Disadvantage on attacks made agains you ",
          callback: () => {
            resolve("disadvantageAttack");
          },
        },
        wastaAction: {
          label: "Chance of losing it's action",
          callback: () => {
            resolve("wastaAction");
          },
        },
        extraDamage: {
          label: "Take extra damage from you",
          callback: () => {
            resolve("extraDamage");
          },
        },
      },
      default: "extraDamage",
    }).render(true);
  });
}

async function ShowDialogHabilities() {
  return await new Promise((resolve) => {
    new Dialog({
      title: "Bestow Curse",
      content: `Choose hability to give disadvantage on ability checks and saving throws`,
      buttons: {
        str: {
          label: "STR",
          callback: () => {
            resolve("str");
          },
        },
        dex: {
          label: "DEX",
          callback: () => {
            resolve("dex");
          },
        },
        con: {
          label: "CON",
          callback: () => {
            resolve("con");
          },
        },
        wis: {
          label: "WIS",
          callback: () => {
            resolve("wis");
          },
        },
        int: {
          label: "INT",
          callback: () => {
            resolve("int");
          },
        },
        cha: {
          label: "CHA",
          callback: () => {
            resolve("cha");
          },
        },
      },
      default: "str",
    }).render(true);
  });
}

function getAbilityDisadvantageEffectChanges(ability) {
  return [
    {
      key: `flags.midi-qol.disadvantage.ability.save.${ability}`,
      mode: 2,
      value: "1",
      priority: 20,
    },
    {
      key: `flags.midi-qol.disadvantage.ability.check.${ability}`,
      mode: 2,
      value: "1",
      priority: 20,
    },
  ];
}
