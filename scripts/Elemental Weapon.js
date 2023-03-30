//DAE Item Macro Execute, arguments = @item.level
const { actor, token, lArgs } = targets(args)
const DAEItem = lArgs.efData.flags.dae.itemData
let weapons = actor.items.filter(i => i.type === `weapon`);
let weapon_content = ``;
function value_limit(val, min, max) {
    return val < min ? min : (val > max ? max : val);
};
//Filter for weapons
for (let weapon of weapons) {
    weapon_content += `<label class="radio-label">
        <input type="radio" name="weapon" value="${weapon.id}" checked>
        <img src="${weapon.img}" style="border:0px; width: 50px; height:50px;">
        ${weapon.name}
    </label>`;
}
let elementsContent = `
<label for="element">Choose a Element:</label>
<select id="element">
    <option value="acid">Acid</option>
    <option value="cold">Cold</option>
    <option value="fire">Fire</option>
    <option value="lightning">Lightning</option>
    <option value="thunder">Thunder</option>
</select>`

/**
 * Select for weapon and apply bonus based on spell level
 */
if (args[0] === "on") {
    let content = `
        <form class="elementalWeapon">
        <div class="form-group" id="weapons">
            ${weapon_content}
        </div>
        </form>
        ${elementsContent}
        `;

    new Dialog({
        content,
        buttons:
        {
            Ok:
            {
                label: `Ok`,
                callback: async (html) => {
                    let itemId = $("input[type='radio'][name='weapon']:checked").val();
                    let damageType = html.find('select#element')[0].value;                    
                    let weaponItem = actor.items.get(itemId);                    
                    let copy_item = duplicate(weaponItem);
                    let spellLevel = Math.floor(args[1] / 2);
                    let bonus = value_limit(spellLevel, 1, 3);
                    await DAE.setFlag(actor, `elementalWeapon`, {
                        "_id" : itemId,
                        "system.damage" : copy_item.system.damage,
                        "system.ability": copy_item.system.ability,
                        "system.properties.mgc": copy_item.system.properties.mgc,
                        "name": copy_item.name,
                        "system.attackBonus":copy_item.system.attackBonus
                    }
                    );
                    if (copy_item.system.attackBonus === "") copy_item.system.attackBonus = "0"
                    copy_item.system.attackBonus = `${parseInt(copy_item.system.attackBonus) + bonus}`;
                    copy_item.system.damage.parts.push([`${bonus}d4`,damageType])
                    copy_item.system.properties.mgc = true
                    await actor.updateEmbeddedDocuments("Item", [copy_item]);
                }
            },
            Cancel:
            {
                label: `Cancel`
            }
        }
    }).render(true);
}

//Revert weapon and unset flag.
if (args[0] === "off") {
    const flag = DAE.getFlag(actor, `elementalWeapon`);
    await actor.updateEmbeddedDocuments("Item", [flag]);
    DAE.unsetFlag(actor, `elementalWeapon`);
    ChatMessage.create({content: flag.name + " returns to normal"});
}

function targets(args) {
const lastArg = args[args.length - 1];
let tactor, ttoken;
if (lastArg.tokenId) {
    ttoken = canvas.tokens.get(lastArg.tokenId);
    tactor = ttoken.actor
}
else tactor = game.actors.get(lastArg.actorId);
return { actor: tactor, token: ttoken, lArgs: lastArg }
}