const lastArg = args[args.length-1];
const spelldc = args[1];
const spellLevel = args[2]
const target = await fromUuid(lastArg.tokenUuid);
if(args[0] === "on"){
    let d = await new Dialog({
        title: "Dragon's Breath",
        content: `
            <div class="form-group">
            <label for="exampleSelect">Selecione o Elemento</label>
            <select name="exampleSelect">
                <option value="acid">Acido</option>
                <option value="cold">Cold</option>
                <option value="fire">Fire</option>
                <option value="lightning">Lightning</option>
                <option value="poison">Poison</option>
            </select>
            </div>
        `,
        buttons: {
        yes: {
            icon: '<i class="fas fa-check"></i>',
            label: 'OK',
            callback: async (html) => {
            let select = html.find('[name="exampleSelect"]').val();
            const itemData = {
                "name": "Breath Weapon",
                "type": "feat",
                "img": "icons/magic/fire/blast-jet-stream-embers-orange.webp",
                "system": {
                    "description": {
                        "value": "<p>Each creature in that area must make a Dexterity saving throw, taking 3d6 damage of the chosen type on a failed save, or half as much damage on a successful one.</p>",
                        "chat": "",
                        "unidentified": ""
                    },
                    "source": "",
                    "activation": {
                        "type": "action",
                        "cost": 1,
                        "condition": ""
                    },
                    "target": {
                        "value": 15,
                        "width": null,
                        "units": "ft",
                        "type": "cone"
                    },
                    "range": {
                        "value": null,
                        "long": null,
                        "units": "self"
                    },
                    "actionType": "save",
                    "damage": {
                        "parts": [
                            [
                                `${1+spellLevel}d6`,
                                `${select}`
                            ]
                        ],
                        "versatile": ""
                    },
                    "save": {
                        "ability": "dex",
                        "dc": `${spelldc}`,
                        "scaling": "flat"
                    }
                }
            }
            let breathWeapon = await target.actor.createEmbeddedDocuments("Item",[itemData])
            DAE.setFlag(target.actor,"breathWeaponId",breathWeapon[0].id);
            }
        }
    }}).render(true)
}
if(args[0] === "off"){
    let breathWeaponId = await DAE.getFlag(target.actor,"breathWeaponId");
    DAE.unsetFlag(target.actor,"breathWeaponId");
    target.actor.deleteEmbeddedDocuments("Item",[breathWeaponId]);
}