import { Handler } from './Handler.js';
import { TransformerLibrary } from './TransformerLibrary.js';
Hooks.on("ready", () => {
    //Register Automation Handler
    game.automation = new Handler();
    game.automation.library = new TransformerLibrary();
    game.automation.util = new Utility();
    Hooks.call("swade-toolkit-handler-ready");
    //Load DefaultTransformers for every Actor
});
/**
 * @param token is of type *any* because it's the token data, not the token itself
 */
Hooks.on("deleteToken", (scene, token, obj, userId) => {
    if (game.userId != userId) {
        return;
    } //only process this on the machine that made the token
    //Delete all the transformers related to this token
    for (let transformer of game.automation.getTransformersByEntityId('Token', token.id, false)) {
        game.automation.removeTransformer(transformer.trigger, transformer.name);
    }
});
Hooks.on("deleteToken", (actor, obj, userId) => {
    if (game.userId != userId) {
        return;
    } //only process this on the machine that made the token
    //Delete all the transformers related to this token
    for (let transformer of game.automation.getTransformersByEntityId('Actor', actor.id, false)) {
        game.automation.removeTransformer(transformer.trigger, transformer.name);
    }
});
//Meant to contain helper functions to be found in game.automation.util
class Utility {
    getSwadeAction(item, actionId) {
        let action = undefined;
        const parseNumber = (numString) => {
            if (numString == "") {
                return 0;
            }
            else {
                return parseInt(numString);
            }
        };
        if (actionId == "formula") {
            action = {
                name: "Base Skill Roll",
                type: "skill",
                skill: item.data.data.actions.skill,
                skillMod: item.data.data.actions.skillMod,
                shotsUsed: 0
            };
        }
        else if (actionId == "damage") {
            action = {
                name: "Base Damage Roll",
                type: "damage",
                damage: item.data.data.damage,
                dmgMod: parseNumber(item.data.data.actions.dmgMod).toString()
            };
        }
        else {
            let itemAction = item.data.data.actions.additional[actionId];
            if (itemAction.type == "skill") {
                action = {
                    name: itemAction.name,
                    type: "skill",
                    skill: itemAction.skillOverride != "" ? itemAction.skillOverride : item.data.data.actions.skill,
                    skillMod: (parseNumber(item.data.data.actions.skillMod) + parseNumber(itemAction.skillMod)).toString(),
                    shotsUsed: itemAction.shotsUsed
                };
            }
            else if (itemAction.type == "damage") {
                action = {
                    name: itemAction.name,
                    type: "damage",
                    damage: item.data.data.damage,
                    dmgMod: (parseNumber(item.data.data.actions.dmgMod) + parseNumber(itemAction.dmgMod)).toString()
                };
            }
        }
        return action;
    }
}
