const lastArg = args[args.length-1]
const actor = await fromUuid(lastArg.actor.uuid)
const effects = lastArg.item.effects
let element = await Dialog.prompt({
title: 'Protection from Energy',
content: `
<form>
  <div class="form-group">
    <label>Select an element:</label>
    <select name="selectElement">
      <option value="acid">Acid</option>
      <option value="cold">Cold</option>
      <option value="fire">Fire</option>
      <option value="lightning">Lightning</option>
      <option value="thunder">Thunder</option>
    </select>
  </div>
</form>
`,
  callback: (html) => html.find('[name="selectElement"]').val()
})
effects[0].changes[0].value = element
await actor.updateEmbeddedDocuments("Item",[{_id:lastArg.item._id,effects}])
