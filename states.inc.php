<?php
/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * Arctic implementation : © Gilles Verriez <gilles.vginc@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 * 
 * states.inc.php
 *
 * Arctic game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: self::checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

//    !! It is not a good idea to modify this file when a game is running !!

 
$machinestates = array(

    // The initial state. Please do not modify.
    1 => array(
        "name" => "gameSetup",
        "description" => "",
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => array( "" => 2 )
    ),
    
    2 => array(
        "name" => "playerTurn",
        "description" => clienttranslate('${phaseIcon} ${actplayer} must place a card on their personal pile, ${currentStackCount}/${maxStackCount} cards placed this turn'),
        "descriptionmyturn" => clienttranslate('${phaseIcon} ${you} must place a card on your personal pile, ${currentStackCount}/${maxStackCount} cards placed this turn'),
        "args" => "argPlayCard",
        "type" => "activeplayer",
        "possibleactions" => array( "playCardOnStack", "getBackCardOnStack", "changeCardFromRiver" ),
        "updateGameProgression" => true, 
        "action" => "stPlayerTurn",
        "transitions" => array( "playCardOnStack" => 2, "moveTokens" => 24, "scoring" => 26  )
    ),

    21 => array(
        "name" => "pickCard",
        "description" => clienttranslate('${phaseIcon} ${actplayer} must draw a card, ${currentPickCount}/${maxPickCount} cards drawn this turn'),
        "descriptionmyturn" => clienttranslate('${phaseIcon} ${you} must draw a card, ${currentPickCount}/${maxPickCount} cards drawn this turn'),
        "args" => "argPickCard",
        "type" => "activeplayer",
        "possibleactions" => array( "pickCard", "givePenaltyCard"),
        "transitions" => array( "pickCard" => 21, "fillRiver" => 22, "discardHandCard" => 23, "givePenaltyCard" => 25 )
    ),
        
    22 => array(
        "name" => "fillRiver",
        "description" => "",
        "type" => "game",
        "action" => "stFillRiver",
        "updateGameProgression" => true, 
        "transitions" => array( "fillRiver" => 22, "pickCard" => 21, "nextPlayer" => 30 )
    ), 

    23 => array(
        "name" => "discardHandCard",
        "description" => clienttranslate('${phaseIcon} ${actplayer} must discard a card, ${currentDiscardCount}/${maxDiscardCount} cards discarded this turn'),
        "descriptionmyturn" => clienttranslate('${phaseIcon} ${you} must discard a card, ${currentDiscardCount}/${maxDiscardCount} cards discarded this turn'),
        "args" => "argDiscardCard",
        "type" => "activeplayer",
        "possibleactions" => array( "discardHandCard", "givePenaltyCard"),
        "transitions" => array( "fillRiver" => 22, "discardHandCard" => 23, "givePenaltyCard" => 25 )
    ),

    24 => array(
        "name" => "moveTokens",
        "description" => clienttranslate('${phaseIcon} ${actplayer} must move tokens'),
        "descriptionmyturn" => clienttranslate('${phaseIcon} ${you} must move tokens'),
        "type" => "activeplayer",
        "args" => "argMoveTokens",
        "possibleactions" => array( "moveTokens"),
        "transitions" => array( "pickCard" => 21, "moveTokens" => 24, "nextPlayer" => 30 )
    ),

    25 => array(
        "name" => "givePenaltyCard",
        "description" => clienttranslate('${phaseIcon} ${actplayer} can move a card from their Penalty zone to an opponent\'s.'),
        "descriptionmyturn" => clienttranslate('${phaseIcon} ${you} can move a card from your Penalty zone to an opponent\'s.'),
        "type" => "activeplayer",
        "args" => "argGivePenaltyCard",
        "possibleactions" => array( "givePenaltyCard"),
        "transitions" => array( "fillRiver" => 22 )
    ),

    26 => array(
        "name" => "scoring",
        "description" => clienttranslate('All players must validate their scoring'),
        "descriptionmyturn" => clienttranslate('${you} must validate your scoring'),
        "type" => "multipleactiveplayer",
        "args" => "argScoring",
        'action' => 'stScoringOrAllowScoringValidation',
        "possibleactions" => array( "validateScoring"),
        "updateGameProgression" => true, 
        "transitions" => array( "nextPlayer" => 30 )
    ),

    30 => array(
        "name" => "nextPlayer",
        "description" => "",
        "type" => "game",
        "action" => "stNextPlayer",
        "transitions" => array( "nextPlayer" => 2, "moveTokens" => 24, "scoring" => 26, "gameEnd" => 99 )
    ), 

    40 => array(
        "name" => "EndGame",
        "description" => "",
        "type" => "game",
        "action" => "stEndGame",
        "args" => "argEndGame",
        "updateGameProgression" => true, 
        "transitions" => array( "gameEnd" => 99 )
    ), 
   
    // Final state.
    // Please do not modify (and do not overload action/args methods).
    99 => array(
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "updateGameProgression" => true, 
        "args" => "argGameEnd"
    )

);



