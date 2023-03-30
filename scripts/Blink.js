const lastArg = args[args.length-1]
const tokenTarget = await fromUuid(lastArg.tokenUuid)
if(args[0] === "each"){
    let roll = new Roll('1d20').evaluate({async:false})
    roll.toMessage(await getFlavor())
    if(roll.total < 11)return;    
    tokenTarget.update({hidden:true})
    let hookId = Hooks.on("updateCombat",async(document)=>{ 
        if(document.current.tokenId !== tokenTarget.id)return;
        tokenTarget.update({hidden:false})
        Hooks.off("updateCombat",hookId)
    })
}

if(args[0] === "off")
    tokenTarget.update({hidden:false})


async function getFlavor(){
    const itemOrigin = await fromUuid(lastArg.origin)
    return {flavor:`<div class="dnd5e chat-card item-card midi-qol-item-card">\n<header class="card-header flexrow">\n<img src="${itemOrigin.img}" width="36" height="36">\n    <h3 class="item-name">${itemOrigin.name}</h3>\n  </header>\n</div>`
    }
}

/*
if(args[0] === "on"){    
    let hookId = Hooks.on("updateCombat",async(document)=>{    
        if(document.previous.tokenId != targetToken.id)return;
        let roll = new Roll('1d20').evaluate({async:false})
        roll.toMessage(await getFlavor())
        if(roll.total < 11)return;
        let tokenData = duplicate(targetToken.data);
        await targetToken.document.update({x:-100,y:-100},{ animate:false})
        //canvas.animatePan({x:tokenData.x,y:tokenData.y})
        let hookId2 = Hooks.on("updateCombat",async(document)=>{ 
            if(document.current.tokenId != targetToken.id)return;
            await targetToken.document.update(tokenData,{animate:false})
            canvas.animatePan({x:tokenData.x,y:tokenData.y})
            Hooks.off("updateCombat",hookId2)
        })

    })
    DAE.setFlag(tokenTarget.actor,"blinkHookId",hookId)
}
if(args[0] === "off"){
    Hooks.off("updateCombat",DAE.getFlag(tokenTarget.actor,"blinkHookId"))
    DAE.unsetFlag(tokenTarget.actor,"blinkHookId")
}
*/
