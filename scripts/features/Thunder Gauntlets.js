export default async function ThunderGauntlets(workflow){
    console.log({workflow,Hook:"ThunderGauntlets"})
    if(!workflow.actor.flags?.dae?.ThunderGauntlets)return
    if(workflow.targets.map(i=>i.id).has(workflow.actor.flags?.dae?.ThunderGauntlets))return
    workflow.disadvantage = true
}