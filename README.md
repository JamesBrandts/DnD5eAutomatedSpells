# [ALPHA] In test, this is here for test purposes only and is not intended to be used yet.
# DnD5eAutomatedSpells
This is a Collection of Spells to be used with automation with the modules Midi-QoL, DAE and Item Macro.
I'm focusing on the 3 first levels of spells and cantrips for now, as they are the most used by the majority of players.


Recommended Modules for testing:

  Token Action HUD

**NOT** Recommended Modules for testing:

  Better Rolls 5e (Many people like it, but the module's been discontinued and it messes up with the Midi-QoL workflow, so it'll break most of this items)
  
Recommended Macros for testing:

  Turn Pass:
  
    game.combats.active?.nextTurn()
    
  Clear Measurement Templates:
  
    canvas.scene.deleteEmbeddedDocuments('MeasuredTemplate',canvas.scene.templates.map(i=>i.id))
    
  Remove Temporary Effects from selected Tokens:
  
    canvas.tokens.controlled.map(i=>i.actor.deleteEmbeddedDocuments('ActiveEffect',i.actor.effects.filter(i=>i.isTemporary).map(i=>i.id)))


##	Cantrips:
*	**Green-Flame Blade**:
		First it creates an effect with flags.dnd5s.damageBonusMacro to return the additional damage on the attack damage, with the special duration of 1 attack.
		When used should filter the equipped weapons and, if more than one, show a Dialog to prompt the user to select which weapon will be used for the attack. Then .roll() the selected weapon(Green-Flame Blade target is self, but it'll use the user's selected target for the weapon attack).
		If the attack hits, the damageBonusMacro will filter the enemy tokens around the target, and show a Dialog for the user to select one of the targets for the secondary damage.
		Then creates a temporary Item on the actor that casted the cantrip, and uses it to deal the damage to the secondary target and deletes it immediately after.
		
*	**Booming Blade**:
		First it creates an effect with flags.dnd5s.damageBonusMacro to return the additional damage on the attack damage, with the special duration of 1 attack.
		When used should filter the equipped weapons and, if more than one, show a Dialog to prompt the user to select which weapon will be used for the attack. Then .roll() the selected weapon(Booming Blade target is self, but it'll use the user's selected target for the weapon attack).
		If the attack hits, the damageBonusMacro creates an effect that will trigger the secondary damage if the target moves.
		Then, if the target moves, creates a temporary Item on the actor that casted the cantrip, and uses it to deal the secondary damage and deletes it immediately after.
		
*	**Magic Stone**:		
		Creates an Item on the target, with 3 uses, then deletes it when the effect ends.
		
*	**Shillelagh**:		
		Prompt the user to choose an equipped weapon to use the cantrip on.

*	**Acid Splash**:		
		On preItemRoll checks if there are 2 or less targets and if they are next to each other and returns false if not (canceling the Item Roll).

*	**Gust**:		
		Moves the target away if it fails the save.

*	**Shocking Grasp**:		
		Set the midi-qol flag reactionCombatRound to the current round. // Todo: Test this with Convenient Effects

*	**Infestation**:		
		Moves the target to a random direction if it fails the save.

*	**True Strike**:		
		It just gives advantage to the caster next attack, there are other restraints to the cantrip, but it's some work and I don't think people use this cantrip at all.

*	**Toll the Dead**:		
		This is the same cantrip from the Midi-QoL sample Items, I just included everything in one place.

*	**Lightning Lure**:		
		If the target fails the save it moves 10 feet in the user direction and takes the damage if next to the user.

*	**Thorn Whip**:		
		Move the target 10 feet in the direction of the user if it hits.

*	**Light**:		
		Just adjust the bright and dim light of the token via macro, so there's no need to install another module, but the ATL version is more consistent if you have the Active Token Effects module installed.

*	**Produce Flame**:		
		Creates an Item on the user, then deletes it when the effect ends and ends the effect if the item is used.

##	1st Level Spells:

*	**Cause Fear**:		
		Effect cancels token movement if it's towards the caster.

*	**Faerie Fire**:		
		Condition Immunity(Invisible), grants.advantage.attack.all, creates dim and colorful light around the targets

*	**Hail Of Thorns**:		
		damageBonusMacro, creates a temporary Item to deal damage on the tokens around target.

*	**Armor of Agathys**:		
		When target is damaged, creates a temporary Item to deal damage to the attacker, then verifies if the target still have temporary HP else ends the effect.

*	**Absorb Elements**:		
		To avoid the reaction Prompting on every damage taken, there's a Hook on initialization that switches the item between Reaction Manual and Reaction Damaged depending on the type of the damage taken. (TODO: Midi-QoL will add a better way to do it on future updates)

*	**Zephyr Strike**:		
		Creates a feature, that can be used for the activation of the effects(move speed, bonus damage and advantage on attack)

*	**Ensnaring Strike**:		
		bonusDamageMacro, creates effect on target if failed save. (TODO: Create Item to use effect)

*	**Chromatic Orb**:		
		Macro prompt Dialog to choose the damage type and changes it on workflow.



