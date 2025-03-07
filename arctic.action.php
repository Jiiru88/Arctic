<?php
/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * Arctic implementation : © Gilles Verriez <gilles.vginc@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * arctic.action.php
 *
 * Arctic main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/arctic/arctic/myAction.html", ...)
 *
 */
  
  
  class action_arctic extends APP_GameAction
  { 
    // Constructor: please do not modify
   	public function __default()
  	{
  	    if( self::isArg( 'notifwindow') )
  	    {
            $this->view = "common_notifwindow";
  	        $this->viewArgs['table'] = self::getArg( "table", AT_posint, true );
  	    }
  	    else
  	    {
            $this->view = "arctic_arctic";
            self::trace( "Complete reinitialization of board game" );
      }
  	} 
  	
  	// TODO: defines your action entry points there

    public function playCardOnStack() {
        self::setAjaxMode();
        $end = self::getArg("end", AT_bool, false, false);
        if ($end) {
            $this->game->playCardOnStack(null, true, false, false);
        }
        else {
            $card_id = self::getArg("id", AT_posint, true);
            $underStack = self::getArg("underStack", AT_bool, false, false);
            $flippedCard = self::getArg("flippedCard", AT_bool, false, false);
            if ($underStack) {
                $this->game->playCardOnStack($card_id, false, true, false);
            }
            else if ($flippedCard) {
                $this->game->playCardOnStack($card_id, false, false, true);
            }
            else {
                $this->game->playCardOnStack($card_id, false, false, false);
            }
        }
        self::ajaxResponse();
    }

    public function pickCard() {
        self::setAjaxMode();
        $end = self::getArg("end", AT_bool, false, false);
        $fromDeck = self::getArg("fromDeck", AT_bool, false, false);
        $fromPenalties = self::getArg("fromPenalties", AT_bool, false, false);
        if ($fromDeck) {
            $this->game->pickCard(null, true, false, false);
            $this->trace(" pickCard ACTION fromDeck");
        }
        else if ($end) {
            $this->game->pickCard(null, false, false, true);
            $this->trace(" pickCard ACTION fromDeck");
        }
        else {
            $card_id = self::getArg("id", AT_posint, true);
            if ($fromPenalties) {
                $this->trace(" pickCard ACTION fromPenalties");
                $this->game->pickCard($card_id, false, true, false);
            }
            else {
                $this->trace(" pickCard ACTION standard");
                $this->game->pickCard($card_id, false, false, false);
            }
        }
        self::ajaxResponse();
    }

    public function discardHandCard() {
        self::setAjaxMode();
        $card_id = self::getArg("id", AT_posint, true);
        $this->game->discardHandCard($card_id);
        self::ajaxResponse();
    }

    public function moveTokens() {
        self::setAjaxMode();
        
        $end = self::getArg("end", AT_bool, false, false);
        if ($end) {
            $this->game->moveTokens(null, null, $end);
        }
        else {
            $token_id = self::getArg("id", AT_posint, true);
            $token_new_pos = self::getArg("pos", AT_posint, true);
            $this->game->moveTokens($token_id, $token_new_pos, $end);
        }
        self::ajaxResponse();
    }

    public function givePenaltyCard() {
        self::setAjaxMode();
        $card_id = self::getArg("card_id", AT_posint, false);
        $player_id = self::getArg("player_id", AT_posint, false);
        $this->game->givePenaltyCard($card_id, $player_id);
        self::ajaxResponse();
    }

    public function getBackCardOnStack() {
        self::setAjaxMode();
        $card_id = self::getArg("id", AT_posint, true);
        $this->game->getBackCardOnStack($card_id);
        self::ajaxResponse();
    }

    public function changeCardFromRiver() {
        self::setAjaxMode();
        $hand_card_id = self::getArg("hand_card_id", AT_posint, true);
        $river_card_id = self::getArg("river_card_id", AT_posint, true);
        $this->game->changeCardFromRiver($hand_card_id, $river_card_id);
        self::ajaxResponse();
    }

    public function validateScoring() {
        self::setAjaxMode();
        $player_id = self::getArg("player_id", AT_posint, true);
        $scoring_infos = self::getArg("scoring_infos", AT_json, true);
        $this->validateJSonAlphaNum($scoring_infos, 'scoring_infos');
        $this->trace(" validateScoring will call game function ");
        $this->game->validateScoring($player_id, $scoring_infos);
        self::ajaxResponse();
    }

    public function validateJSonAlphaNum($value, $argName = 'unknown')
    {
        if (is_array($value)) {
            foreach ($value as $key => $v) {
            $this->validateJSonAlphaNum($key, $argName);
            $this->validateJSonAlphaNum($v, $argName);
            }
            return true;
        }
        if (is_int($value)) {
            return true;
        }
        $bValid = preg_match("/^[_0-9a-zA-Z- ]*$/", $value) === 1; // NOI18N
        if (!$bValid) {
            $this->trace(" validateJSonAlphaNum error");
            throw new BgaSystemException("Bad value for: $argName", true, true, FEX_bad_input_argument);
        }
        return true;
    }
    
    public function undo() {
        self::setAjaxMode();
        $this->game->action_undo();
        self::ajaxResponse();
    }
    
  }
  

