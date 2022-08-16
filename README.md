# In test, this is here for test purposes only and is not intended to be used yet.
# DnD5eAutomatedSpells
This is a Colection of Spells to be used with automation with the modules Midi-QoL, DAE and Item Macro.

Recomended Modules for testing:

  Token Action HUD

Recomended Macros for testing:

  Turn Pass:
  
    game.combats.active?.nextTurn()
    
  Clear Measurement Templates:
  
    canvas.scene.deleteEmbeddedDocuments('MeasuredTemplate',canvas.scene.templates.map(i=>i.id))
    
  Remove Temporary Effects from selected Tokens:
  
    for(let token of canvas.tokens.controlled){
      token.actor.deleteEmbeddedDocuments('ActiveEffect',token.actor.effects.filter(i=>i.isTemporary).map(i=>i.id))
    }
