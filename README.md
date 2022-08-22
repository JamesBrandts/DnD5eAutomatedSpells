# [ALPHA] In test, this is here for test purposes only and is not intended to be used yet.
# DnD5eAutomatedSpells
This is a Collection of Spells to be used with automation with the modules Midi-QoL, DAE and Item Macro.
I'm focusing on the 3 first level of spells and cantrips for now, as they are the more used by the majority of players.


Recommended Modules for testing:

  Token Action HUD

Recommended Macros for testing:

  Turn Pass:
  
    game.combats.active?.nextTurn()
    
  Clear Measurement Templates:
  
    canvas.scene.deleteEmbeddedDocuments('MeasuredTemplate',canvas.scene.templates.map(i=>i.id))
    
  Remove Temporary Effects from selected Tokens:
  
    canvas.tokens.controlled.map(i=>i.actor.deleteEmbeddedDocuments('ActiveEffect',i.actor.effects.filter(i=>i.isTemporary).map(i=>i.id)))
