const tokenU = await fromUuid(args[0].tokenUuid);
const actorU = tokenU.actor;
const targets = args[0].hitTargets;
const spellLevel = args[0].spellLevel;
const isCritical = args[0].isCritical;
let numDice = isCritical ? 4 + 2 * spellLevel : 2 + spellLevel
if (targets.length < 1) return;
await Dialog.prompt({
    title: 'Chromatic Orb',
    content: `
        <div class="form-group">
          <label for="exampleSelect">Selecione o Elemento</label>
          <select name="exampleSelect">
            <option value="acid">Acid</option>
            <option value="cold">Cold</option>
            <option value="fire">Fire</option>
            <option value="lightning">Lightning</option>
            <option value="poison">Poison</option>
          </select>
        </div>
    `,
    callback: async (html) => {
        let select = html.find('[name="exampleSelect"]').val();
        let damageType = select;
        const theItem = await fromUuid(args[0].uuid);
        theItem.system.damage.parts[0][1] = damageType
    }
}
)