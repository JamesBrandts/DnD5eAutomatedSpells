const lastArg = args[args.length-1];
const targetToken = await fromUuid(lastArg.tokenUuid);
const targetActor = targetToken.actor;
if(args[0] === "on"){
    DAE.setFlag(targetActor, "ArmorOfAgathysEffectId", lastArg.effectId);
}
if(args[0] === "off"){
    DAE.unsetFlag(targetActor, "ArmorOfAgathysEffectId");
}