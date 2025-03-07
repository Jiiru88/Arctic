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
  * arctic.game.php
  *
  * This is the main file for your game logic.
  *
  * In this PHP file, you are going to defines the rules of the game.
  *
  */


require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );


class Arctic extends Table
{
	function __construct( )
	{
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();
        
        $this->mygamestatelabels=[
            "currentPlayerLastTurnTopStackCardId" => 10, 
            "currentPlayerStackCardType" => 11, 
            "currentPlayerPickCount" => 12,
            "currentPlayerStackCount" => 13,
            "currentPlayerTopStackCardId" => 14,
            "firstPlayerId" => 15,
            "moveTokensPowerApplied" => 16,
            "pickFromDeckPowerUsed" => 17,
            "pickFromPenaltiesPowerUsed" => 18,
            "givePenaltyPowerUsed" => 19,
            "canPlayPlusOrMinusOneCard" => 20,
            "canPickPlusOrMinusOneCard" => 21,
            "getBackCardFromStack" => 22,
            "changeCardFromRiver" => 23,
            "canPlayCardUnderStack" => 24,
            "canPlayCardFlipped" => 25,
            "endGameStock" => 26,
            "lastTurnOfTheGame" => 27,
            "endGame"  => 28,
            "cantPlayCardFlippedExplain" => 29,
            "flippedCardHasBeenPlayedInThisGame" => 30,
            "needScoringvalidation" => 31,
            "currentPlayerCurrentDiscardCount" => 32,
            "currentPlayerMaxDiscardCount" => 33,
            "cantStopPlayingCardExplain" => 34,
            // gameoptions bellow
            "fullyRandomizedPowerDraft" => 100,
            "power_draft_1" => 101,
            "power_draft_2" => 102,
            "power_draft_3" => 103,
            "power_draft_4" => 104,
            "power_draft_5" => 105,
            "power_draft_6" => 106,
            "authorized_undo" => 107,
        ];
        $this->initGameStateLabels($this->mygamestatelabels);
                                           
        
        $this->cards = self::getNew( "module.common.deck" );
        $this->cards->init( "card" );
        $this->totems = self::getNew( "module.common.deck" );
        $this->totems->init( "card" );
        $this->tokens = self::getNew( "module.common.deck" );
        $this->tokens->init( "card" );
        $this->powers = self::getNew( "module.common.deck" );
        $this->powers->init( "card" );
        // discrimination infos used by zombie (playCardOnStack)
        $this->discriminationInfos = array(
            0 => array(5,4,3,2,1),
            1 => array(4,5,3,2,1),
            2 => array(4,3,5,2,1),
            3 => array(3,4,2,5,1),
            4 => array(2,3,1,4,5),
            5 => array(2,1,3,4,5),
            6 => array(1,2,3,4,5)
        );
	}
	
    protected function getGameName( )
    {
		// Used for translations and stuff. Please do not modify.
        return "arctic";
    }	

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame( $players, $options = array() )
    {    
        // Set the colors of the players with HTML color code
        // The default below is red/green/blue/orange/brown
        // The number of colors defined here must correspond to the maximum number of players allowed for the gams
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];
 
        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = array();
        foreach( $players as $player_id => $player )
        {
            $color = array_shift( $default_colors );
            $values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."')";
        }
        $sql .= implode( ',', $values );
        self::DbQuery( $sql );
        self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
        self::reloadPlayersBasicInfos();
        
        /************ Start the game initialization *****/

        // Init global values with their initial values

        // Set current player last turn top stack card id (default:0 means no card on top of the stack => until first move of the game)
        self::setGameStateInitialValue( 'currentPlayerLastTurnTopStackCardId', 0 );
        // Set current player current turn top stack card id (default:0 means no card on top of the stack => on setup only)
        self::setGameStateInitialValue( 'currentPlayerTopStackCardId', 0 );
        
        // Set current player top stack card type (default:0 means no card on top of the stack)
        self::setGameStateInitialValue( 'currentPlayerStackCardType', 0 );
        
        // Set current player pick count for this turn (default:0 means no card has been picked this turn)
        self::setGameStateInitialValue( 'currentPlayerPickCount', 0 );

        // Set current player stack count for this turn (default:0 means no card has been stacked this turn)
        self::setGameStateInitialValue( 'currentPlayerStackCount', 0 );

        // Set current player moveTokens power applied for this turn (default:0 means power not applied this turn)
        self::setGameStateInitialValue( 'moveTokensPowerApplied', 0 );

        // Set current player pickFromDeck power used for this pick (default:0 means power not used for this pick)
        self::setGameStateInitialValue( 'pickFromDeckPowerUsed', 0 );

        // Set current player pickFromPenalties power used for this pick (default:0 means power not used for this pick)
        self::setGameStateInitialValue( 'pickFromPenaltiesPowerUsed', 0 );

        // Set current player givePenalty power used for this turn (default:0 means power not used for this turn)
        self::setGameStateInitialValue( 'givePenaltyPowerUsed', 0 );

        // Set current player can play plus or minus one card now (default:0 means can't play plus or minus one card now)
        self::setGameStateInitialValue( 'canPlayPlusOrMinusOneCard', 0 );

        // Set current player can pick plus or minus one card now (default:0 means can't pick plus or minus one card now)
        self::setGameStateInitialValue( 'canPickPlusOrMinusOneCard', 0 );

        // Set current player can get back a card from stack now (default:1 means can get back a card from stack now)
        self::setGameStateInitialValue( 'getBackCardFromStack', 1 );

        // Set current player can change a card from river now (default:0 means can change a card from river now)
        self::setGameStateInitialValue( 'changeCardFromRiver', 1 );

        // Set current player can play a card under stack now (default:0 means can't play a card under stack now)
        self::setGameStateInitialValue( 'canPlayCardUnderStack', 0 );

        // Set current player can play a card flipped now (default:0 means can't play a card flipped now)
        self::setGameStateInitialValue( 'canPlayCardFlipped', 0 );

        // Set end game stock (default:0 means the stock is OK, if 1 the deck uses reserve stock)
        self::setGameStateInitialValue( 'endGameStock', 0 );

        // Set last turn of the game (default:0 means it is not the last turn of the game)
        self::setGameStateInitialValue( 'lastTurnOfTheGame', 0 );

        // Set need to explain why card can't be played flipped (default:0 means it is not needed)
        self::setGameStateInitialValue( 'cantPlayCardFlippedExplain', 0 );
        
        // Set end game (default:0 means it is not the end of the game)
        self::setGameStateInitialValue( 'endGame', 0 );
        
        // Set flipped card has been played this game (default:0 means no flipped card has been played this game)
        self::setGameStateInitialValue( 'flippedCardHasBeenPlayedInThisGame', 0 );

        // Set need to explain why must play a card (default:0 means it is not needed)
        self::setGameStateInitialValue( 'cantStopPlayingCardExplain', 0 );
        
        
        // Set need scoring validation (default:0 means scoring validation is not needed)
        // scoring validation is needed only if : 
        // - fox "flippedCard" power exists in this game, 
        // - fox "flippedCard" power has been used in this game, 
        // - a flipped card can move between two series, 
        // this will only apply to some players 
        self::setGameStateInitialValue( 'needScoringvalidation', 0 );

        // Set current player current discard count (reset to 0 each turn)
        self::setGameStateInitialValue( 'currentPlayerCurrentDiscardCount', 0 );
        // Set current player max discard count (reset to 0 each turn)
        self::setGameStateInitialValue( 'currentPlayerMaxDiscardCount', 0 );
        
        
        

        // Create cards
        $playerCount = count($players);
        // tmp reduce to only one deck
        if ($this->getBgaEnvironment() == 'studio') {
            $playerCount = 2;
        }
        for ($deckIndex = 1; $deckIndex <= $playerCount; $deckIndex ++) {
            $cards = array ();
            foreach ( $this->animals as $animal_id => $animalType ) {
                $secondaryAnimalToken = $animal_id;
                for ($drawCounter = 1; $drawCounter <= 5; $drawCounter ++) {
                    // Build card type id
                    $primaryAnimalToken = $animal_id;
                    $secondaryAnimalToken = ($secondaryAnimalToken % 6) + $deckIndex;
                    $stackCounter = 6 - $drawCounter;
                    // value example : 1+1+5+1+2
                    //$uniqueId = ""+$animalType+$drawCounter+$stackCounter+$primaryAnimalToken+$secondaryAnimalToken;
                    $cards [] = array ('type' => $deckIndex.'_'.$animal_id,'type_arg' => $drawCounter,'nbr' => 1 );
                }
            }
            if ($this->getBgaEnvironment() == 'studio') {
                // tmp : reduce deck size to end the game quickly
                //$tmp_cards = array_chunk($cards, 10, true)[0];
                //$tmp_cards = array_chunk($cards, 10, true)[1];
                //$tmp_cards += array_chunk($cards, 10, true)[2];
                //$this->cards->createCards( $tmp_cards, 'deck' );
                $this->cards->createCards( $cards, 'deck' );
            }
            else {
                $this->cards->createCards( $cards, 'deck' );
            }
        }

        
        // Shuffle deck
        $this->cards->shuffle('deck');

        // Deal 4 cards to each players
        $players = self::loadPlayersBasicInfos();
        foreach ( $players as $player_id => $player ) {
            $cards = $this->cards->pickCards(3, 'deck', $player_id);
            
            //$cards = $this->cards->pickCards(1, 'deck', $player_id); // temp (Gameplay : valeur de pose > nombre de cartes en main = pioche auto vers la défausse)
            //$cards = $this->cards->pickCards(11, 'deck', $player_id); // temp (UI : overlap cartes de la main si 7+)
        }
        // create river
        $this->cards->pickCardsForLocation(6, 'deck', 'river');
        
        if ($this->getBgaEnvironment() == 'studio') {
            // 
            foreach ( $players as $player_id => $player ) {
                $this->cards->pickCardsForLocation(10, 'deck', 'cardsonpenalties_'.$player_id );
            }
        }

        // Create totems
        $totems = array ();
        foreach ( $this->animals as $animal_id => $animalType ) {
            $totems [] = array ('type' => $animal_id,'type_arg' => null,'nbr' => 1 );
        }
        $this->totems->createCards( $totems, 'totems' );
        // Shuffle deck
        $this->totems->shuffle('totems');
        // Deal 1 totem to each players
        foreach ( $players as $player_id => $player ) {
            $this->totems->pickCardForLocation('totems', 'totem', $player_id);
        }

        // Create tokens
        $tokens = array ();
        foreach ( $this->animals as $animal_id => $animalType ) {
            $tokens [] = array ('type' => $animal_id,'type_arg' => null,'nbr' => 1 );
        }
        $this->tokens->createCards( $tokens, 'tokens' );
        $this->tokens->pickCardsForLocation(6, 'tokens', 'tokens', 3);
        //$this->tokens->pickCardsForLocation(3, 'tokens', 'tokens', 1);// temp debug 3 tokens to the left
        //$this->tokens->pickCardsForLocation(3, 'tokens', 'tokens', 6);// temp debug 3 tokens to the right

        

        // Create powers
        $powers = array ();
        foreach ( $this->animals as $animal_id => $animalType ) {
            /*
            "Fully randomized power draft" => 100,
            "Fox power" => 101,
            "Moose power" => 102,
            "Walrus power" => 103,
            "Orca power" => 104,
            "Puffin power" => 105,
            "Polar bear power" => 106,
            */
            if ($this->getGameStateValue('fullyRandomizedPowerDraft') == 2) {
                // create 1 power for each animal (random draft)
                // standard mode : pick randomly the power between the 2 types for each animal type
                $powers [] = array ('type' => $animal_id,'type_arg' => random_int( 1, 2 ),'nbr' => 1 ); 
            }
            else {
                if ($this->getGameStateValue('power_draft_'.$animal_id) == 1) {
                    // randomized power
                    $powers [] = array ('type' => $animal_id,'type_arg' => random_int( 1, 2 ),'nbr' => 1 );
                }
                else if ($this->getGameStateValue('power_draft_'.$animal_id) == 2) {
                    // side A power
                    $powers [] = array ('type' => $animal_id,'type_arg' => 1,'nbr' => 1 );
                }
                else if ($this->getGameStateValue('power_draft_'.$animal_id) == 3) {
                    // side B power
                    $powers [] = array ('type' => $animal_id,'type_arg' => 2,'nbr' => 1 );
                }
            }
        }
        
        $this->powers->createCards( $powers, 'powers' );
        
        
        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        self::initStat( 'table', 'turns_number', 1 );    // Init a table statistics
        self::initStat( 'player', 'turns_with_fox_power', 0 );
        self::initStat( 'player', 'turns_with_moose_power', 0 );
        self::initStat( 'player', 'turns_with_walrus_power', 0 );
        self::initStat( 'player', 'turns_with_orc_power', 0 );
        self::initStat( 'player', 'turns_with_puffin_power', 0 );
        self::initStat( 'player', 'turns_with_bear_power', 0 );
        self::initStat( 'player', 'cards_on_stack_count', 0 );
        self::initStat( 'player', 'cards_on_penalties_count', 0 );
        
        self::initStat( 'player', 'fox_series_score', 0 );
        self::initStat( 'player', 'moose_series_score', 0 );
        self::initStat( 'player', 'walrus_series_score', 0 );
        self::initStat( 'player', 'orca_series_score', 0 );
        self::initStat( 'player', 'puffin_series_score', 0 );
        self::initStat( 'player', 'bear_series_score', 0 );
        self::initStat( 'player', 'different_animal_series_count', 0 );
        self::initStat( 'player', 'totem_scoring', 0 );
        self::initStat( 'player', 'penalties_score', 0 );
        self::initStat( 'player', 'score', 0 );

        // TODO: setup the initial game situation here
       

        // Activate first player (which is in general a good idea :) )
        $this->activeNextPlayer();
        self::setGameStateInitialValue( 'firstPlayerId', $this->getActivePlayerId() );

        /************ End of the game initialization *****/
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas()
    {
        $result = array();
    
        $players = $this->loadPlayersBasicInfos();
        $current_player_id = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!
    
        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $sql = "SELECT player_id id, player_score score, player_score_aux score_aux FROM player ";
        $result['players'] = self::getCollectionFromDb( $sql );
  
        // TODO: Gather all information about current game situation (visible by player $current_player_id).
  
        // Cards in player hand
        $result['pickCount'] = $this->cards->countCardInLocation( 'deck' );
        
        // Cards in player hand
        $result['hand'] = $this->cards->getCardsInLocation( 'hand', $current_player_id );
        
        // Cards played on the stack
        $result['opponentshand'] = array();
        foreach ($players as $player_id => $info) {
            if ($player_id != $current_player_id) {
                $opponentHand = array(
                    'playerId' => $player_id,
                    'handCardsCount' => $this->cards->countCardInLocation('hand', $player_id )
                );
                $result['opponentshand'][]= $opponentHand;
            }
        }
        // Cards played on the stack
        $result['cardsonstack'] = array();
        foreach ($players as $player_id => $info) {
            $result['cardsonstack'] = array_merge($result['cardsonstack'], $this->getCardsInLocationWithFlippedInfo('cardsonstack_'.$player_id));
        }

        // Cards played on the penalties
        $result['cardsonpenalties'] = array();
        foreach ($players as $player_id => $info) {
            $result['cardsonpenalties'] = array_merge($result['cardsonpenalties'], $this->cards->getCardsInLocation( 'cardsonpenalties_'.$player_id ));
        }
        
        // Cards drafted on the river
        $result['river'] = $this->cards->getCardsInLocation( 'river' );

        // Totem drafted
        $result['totem'] = $this->totems->getCardsInLocation( 'totem', $current_player_id );

        // Tokens
        $result['tokens'] = $this->tokens->getCardsInLocation( 'tokens' );

        // Powers
        $result['powers'] = $this->powers->getCardsInLocation( 'powers' );
        foreach ($result['powers'] as $powerId => $power) {
            $result['powers'][$powerId]['phase'] = $this->powersInfos[$power['type'].$power['type_arg']]['phase'];
            $result['powers'][$powerId]['desc'] = $this->powersInfos[$power['type'].$power['type_arg']]['desc'];
            ////$this->trace("add phase to power [powerType:".$power["type"]." powerTypeArg:".$power["type_arg"]." phase:".$this->powersInfos[$power['type'].$power['type_arg']]['phase']."]");
        }

        // First player
        $result['firstPlayerId'] = self::getGameStateValue( 'firstPlayerId' );

        // Animals
        $result['animals'] = $this->animals;

        // DEBUG
        $labels = array_keys($this->mygamestatelabels);
        $result['myglobals'] = array_combine($labels, array_map([$this,'getGameStateValue'],$labels));
        
        return $result;
    }

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression()
    {
        // TODO: compute and return the game progression
        $playersCount = count(self::loadPlayersBasicInfos());
        $cardsLocationsCount = $this->cards->countCardsInLocations();
        $overallCardsCount = 0;
        $unusedCardsCount = 0;

        /*
        // OLD (start)
        foreach( $cardsLocationsCount as $location => $locationCount ) {
            $overallCardsCount += $locationCount;
            if ($location == 'hand') {
                // ignore hand cards
                $overallCardsCount -= $locationCount;
            }
            if ($location == 'river' || $location == 'deck') {
                $unusedCardsCount += $locationCount;
            }
        }
        $gameProgression = round(($overallCardsCount - $unusedCardsCount) / $overallCardsCount*100);
        // OLD (end)
        */

        // NEW (start)
        $draftCardsCount = $playersCount*3; // 3 cards per player 
        foreach( $cardsLocationsCount as $location => $locationCount ) {
            
            if ($location != 'powers' && $location != 'tokens' && $location != 'totems') {
                $overallCardsCount += $locationCount;
            }
            if ($location == 'river' || $location == 'deck') {
                $unusedCardsCount += $locationCount;
            }
        }
        $gameProgression = round(($overallCardsCount - $unusedCardsCount - $draftCardsCount) / $overallCardsCount*100);
        // NEW (end)

        if ($gameProgression < 90) {
            if ($this->getStateName() == "scoring") {
                $playersCountPercent = round(8/$playersCount); // 2=4% 3=3% 4=2%
                $gameProgression = 98 - (count($this->gamestate->getActivePlayerList())*$playersCountPercent);
            }
            else if ($this->getStateName() == "EndGame") {
                $gameProgression = 99;
            }
            else if ($this->getStateName() == "gameEnd") {
                $gameProgression = 100;
            }
        }
        return $gameProgression;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    

    /*
        In this space, you can put any utility methods useful for your game logic
    */

    function manageSavePoint() {
        $currentPlayerHasNotPlayedCards = ($this->getGameStateValue( 'currentPlayerStackCount' ) == 0);
        $currentPlayerHasNotTookBackCardInHand = ($this->getGameStateValue( 'getBackCardFromStack' ) == 1);
        $currentPlayerHasNotChangedCardInHand = ($this->getGameStateValue( 'changeCardFromRiver' ) == 1);
        $this->trace("manageSavePoint for active player : [".self::getActivePlayerId()."]");
        $this->trace("manageSavePoint currentPlayerHasNotPlayedCards : [".$currentPlayerHasNotPlayedCards."]");
        $this->trace("manageSavePoint currentPlayerHasNotTookBackCardInHand : [".$currentPlayerHasNotTookBackCardInHand."]");
        $this->trace("manageSavePoint currentPlayerHasNotChangedCardInHand : [".$currentPlayerHasNotChangedCardInHand."]");
        $this->trace("manageSavePoint isUndoAuthorized : [".$this->isUndoAuthorized()."]");
        if ($currentPlayerHasNotPlayedCards && $currentPlayerHasNotTookBackCardInHand && $currentPlayerHasNotChangedCardInHand && $this->isUndoAuthorized()) {
            // creates undo save point at the beggining of player's turn
            $this->trace("undoSavepoint for active player : [".self::getActivePlayerId()."]");
            $this->undoSavepoint();
        }
    }

    function getPhaseIcon() {
        $isStackPhase = false;
        $isTokenPhase = false;
        $isPickPhase = false;
        switch ($this->getStateName()) {
            case 'playerTurn': 
                $isStackPhase = true;
                break;
            case 'moveTokens':
                $isTokenPhase = true;
                break;
            case 'pickCard':
                $isPickPhase = true;
                break;
            case 'fillRiver':
                $isPickPhase = true;
                break;
            case 'discardHandCard':
                $isPickPhase = true;
                break;
            case 'givePenaltyCard':
                $isPickPhase = true;
                break;
        }
        $phaseIcon = "<div class=\"arc_picto_wrapper".(!$isStackPhase ? " arc_inactive" : "")."\"><div class=\"arc_picto arc_stack\"></div></div>";
        $phaseIcon .= "<div class=\"arc_picto_wrapper".(!$isTokenPhase ? " arc_inactive" : "")."\"><div class=\"arc_picto arc_token\"></div></div>";
        $phaseIcon .= "<div class=\"arc_picto_wrapper".(!$isPickPhase ? " arc_inactive" : "")."\"><div class=\"arc_picto arc_pick\"></div></div>";
        $phaseIcon .= " ";
        return $phaseIcon;
    }

    function isUndoAuthorized() {
        return ($this->getGameStateValue('authorized_undo') == 2);
    }

    function getAnimalIcon( $animalName ) {
        $title = $animalName;
        if ($title == 'generic') {
            $title = clienttranslate("a card");
        }
        return "<div class='arc_minified_animals arc_".$animalName."' title='".$title."'></div>";
    }
    
    function manageZombieMoveTokens($active_player) {
        // retrieves the 2 tokens to move
        
        $topStackCard = $this->cards->getCardOnTop( 'cardsonstack_'.$active_player );
        $topStackCardType = self::getUniqueCardType($topStackCard);
        $playerTotemAnimalType = null;
        // retrieves player totem infos
        $playerTotemList = $this->totems->getCardsInLocation( 'totem', $active_player );
        foreach( $playerTotemList as $playerTotem ) {
            $playerTotemAnimalType = $playerTotem['type'];
            break;
        }
        // retrieves primary token to move infos
        $primaryAnimalToken = null;
        $primaryAnimalTokenId = null;
        $primary_token_old_pos = null;
        $primary_token_new_pos = null;
        $primaryTokenAnimalType = self::getCardPrimaryAnimalTokenType($topStackCardType);
        $primaryTokens = $this->tokens->getCardsOfTypeInLocation($primaryTokenAnimalType, null, 'tokens');
        foreach( $primaryTokens as $primaryToken ) {
            $primaryAnimalToken = $primaryToken;
            $primaryAnimalTokenId = $primaryToken['id'];
            $primary_token_old_pos = $primaryToken['location_arg'];
        }
        $primaryTokenCanMoveRight = false;
        $primaryTokenCanMoveLeft = false;
        if ($primary_token_old_pos == 6) {
            $primaryTokenCanMoveLeft = true;
        }
        else if ($primary_token_old_pos == 1) {
            $primaryTokenCanMoveRight = true;
        }
        else {
            $primaryTokenCanMoveRight = true;
            $primaryTokenCanMoveLeft = true;
        }
        // retrieves secondary token to move infos
        $secondaryAnimalToken = null;
        $secondary_token_old_pos = null;
        $secondaryTokenAnimalType = self::getCardSecondaryAnimalTokenType($topStackCardType);
        $secondaryTokens = $this->tokens->getCardsOfTypeInLocation($secondaryTokenAnimalType, null, 'tokens');
        foreach( $secondaryTokens as $secondaryToken ) {
            $secondaryAnimalToken = $secondaryToken;
            $secondaryAnimalTokenId = $secondaryToken['id'];
            $secondary_token_old_pos = $secondaryToken['location_arg'];
        }
        $secondaryTokenCanMoveRight = false;
        $secondaryTokenCanMoveLeft = false;
        if ($secondary_token_old_pos == 6) {
            $secondaryTokenCanMoveLeft = true;
        }
        else if ($secondary_token_old_pos == 1) {
            $secondaryTokenCanMoveRight = true;
        }
        else {
            $secondaryTokenCanMoveRight = true;
            $secondaryTokenCanMoveLeft = true;
        }

        if (!$primaryTokenCanMoveLeft && !$secondaryTokenCanMoveLeft) {
            $primaryTokenCanMoveRight = true;
            $secondaryTokenCanMoveRight = true;
        }
        else if (!$primaryTokenCanMoveRight && !$secondaryTokenCanMoveRight) {
            $primaryTokenCanMoveLeft = true;
            $secondaryTokenCanMoveLeft = true;
        }


        // check if 1 of the 2 tokens animal types are the same as the totem animal type
        $primaryTokenAnimalTypeIsTotemAnimalType = false;
        $secondaryTokenAnimalTypeIsTotemAnimalType = false;
        if ($primaryAnimalToken['type'] == $playerTotemAnimalType) {
            $primaryTokenAnimalTypeIsTotemAnimalType = true;
        }
        else if ($secondaryAnimalToken['type'] == $playerTotemAnimalType) {
            $secondaryTokenAnimalTypeIsTotemAnimalType = true;
        }
        if ($primaryTokenAnimalTypeIsTotemAnimalType || $secondaryTokenAnimalTypeIsTotemAnimalType) {
            // 1 : (primary) move the totem corresponding token to the right if possible
            if ($primaryTokenAnimalTypeIsTotemAnimalType) {
                if ($primaryTokenCanMoveRight) {
                    $primary_token_new_pos = $primary_token_old_pos+1;
                }
                else {
                    $primary_token_new_pos = $primary_token_old_pos-1;
                }
            }
            // 1 : (secondary) move the totem corresponding token to the right if possible
            else if ($secondaryTokenAnimalTypeIsTotemAnimalType) {
                if ($secondaryTokenCanMoveRight) {
                    if ($primaryTokenCanMoveLeft) {
                        $primary_token_new_pos = $primary_token_old_pos-1;
                    }
                    else {
                        $primary_token_new_pos = $primary_token_old_pos+1;
                    }
                }
                else {
                    if ($primaryTokenCanMoveRight) {
                        $primary_token_new_pos = $primary_token_old_pos+1;
                    }
                    else {
                        $primary_token_new_pos = $primary_token_old_pos-1;
                    }
                }
            }
        }
        else {
            // 2 : move the most advanced token to the left
            if ($primary_token_old_pos >= $secondary_token_old_pos) {
                // try to move primary token to the left
                if ($primaryTokenCanMoveLeft) {
                    $primary_token_new_pos = $primary_token_old_pos-1;
                }
                else {
                    $primary_token_new_pos = $primary_token_old_pos+1;
                }
            }
            else {
                // try to move the secondary token to the left
                if ($secondaryTokenCanMoveLeft) {
                    if ($primaryTokenCanMoveRight) {
                        $primary_token_new_pos = $primary_token_old_pos+1;
                    }
                    else {
                        $primary_token_new_pos = $primary_token_old_pos-1;
                    }
                }
                else {
                    if ($primaryTokenCanMoveLeft) {
                        $primary_token_new_pos = $primary_token_old_pos-1;
                    }
                    else {
                        $primary_token_new_pos = $primary_token_old_pos+1;
                    }
                }
            }
        }
        $this->moveTokens($primaryAnimalTokenId, $primary_token_new_pos, false, $active_player);
        return;
    }

    function manageZombiePickCard($active_player) {
        $riverCards = $this->cards->getCardsInLocation( 'river' );
        if (count($riverCards) == 0) {
            // can't pick any card
            //$this->trace("manageZombiePickCard throw error : should have gone to an other state?");
            return;
        }
        $topStackCard = $this->cards->getCardOnTop( 'cardsonstack_'.$active_player );
        $topStackCardType = self::getUniqueCardType($topStackCard);
        $topStackCardAnimalType = self::getCardAnimalType($topStackCardType);

        // 1 : search for top stack card same animal type cards in river
        $filteredCards = [];
        foreach ( $riverCards as $riverCardId => $riverCard ) {
            $riverCardType = self::getUniqueCardType($riverCard);
            $riverCardAnimalType = self::getCardAnimalType($riverCardType);
            if ($topStackCardAnimalType == $riverCardAnimalType) {
                $filteredCards[] = $riverCard;
            }
        }
        if (count($filteredCards) == 1) {
            //$this->trace("manageZombiePickCard 1 : count(filteredCards) == 1");
            $cardIdToDraw = $filteredCards[0]['id'];
            $this->pickCard($cardIdToDraw, false, false, false, $active_player);
            return;
        }
        else if (count($filteredCards) > 1) {
            //$this->trace("manageZombiePickCard 1 : count(filteredCards) > 1");
            // choose randomly a card
            $randomCardIndexInRiver = random_int(0, count($filteredCards)-1);
            $cardIdToDraw = array_values($filteredCards)[$randomCardIndexInRiver]['id'];
            $this->pickCard($cardIdToDraw, false, false, false, $active_player);
            return;
        }
        else {
            // 2 : search for the greatest number of river cards with the same animal type than a card in hand
            $riverCardsAnimalTypes = [];
            // gets the animal types cards count in river
            foreach ( $riverCards as $riverCardId => $riverCard ) {
                $riverCardType = self::getUniqueCardType($riverCard);
                $riverCardAnimalType = self::getCardAnimalType($riverCardType);
                if (!array_key_exists($riverCardAnimalType, $riverCardsAnimalTypes)) {
                    $riverCardsAnimalTypes[$riverCardAnimalType] = 0;
                }
                else {
                    $riverCardsAnimalTypes[$riverCardAnimalType] += 1;
                }
            }
            // sort the animal types cards by count 
            arsort($riverCardsAnimalTypes);
            
            // search for a card in hand matching animal types
            $filteredType = null;
            $handCards = $this->cards->getCardsInLocation( 'hand', $active_player );
            foreach ( $riverCardsAnimalTypes as $riverCardsAnimalType => $riverCardsCount ) {
                foreach ( $handCards as $handCardId => $handCard ) {
                    $handCardType = self::getUniqueCardType($handCard);
                    $handCardAnimalType = self::getCardAnimalType($handCardType);
                    if ($riverCardsAnimalType == $handCardAnimalType) {
                        $filteredType = $riverCardsAnimalType;
                    }
                }
                if ($filteredType != null) {
                    break;
                }
            }
            if ($filteredType != null) {
                // filter river cards by animal type
                //$this->trace("manageZombiePickCard 2 : filteredType != null");
                $filteredCards = [];
                foreach ( $riverCards as $riverCardId => $riverCard ) {
                    $riverCardType = self::getUniqueCardType($riverCard);
                    $riverCardAnimalType = self::getCardAnimalType($riverCardType);
                    if ($filteredType == $riverCardAnimalType) {
                        $filteredCards[] = $riverCard;
                    }
                }
                // choose randomly a card to draw
                $randomCardIndexInRiver = random_int(0, count($filteredCards)-1);
                $cardIdToDraw = $filteredCards[$randomCardIndexInRiver]['id'];
                $this->pickCard($cardIdToDraw, false, false, false, $active_player);
                return;
            }
            else {
                //$this->trace("manageZombiePickCard 2 : filteredType == null");
                // 3 : search for the greatest number of river cards with the same animal type 
                // (reuse previous instructions to directly get the river cards animal type (greatest number)
                $greatestAnimalTypeGreaterThanOne = false;
                foreach ( $riverCardsAnimalTypes as $riverCardsAnimalType => $riverCardsCount ) {
                    $filteredType = $riverCardsAnimalType;
                    if ($riverCardsCount > 1) {
                        $greatestAnimalTypeGreaterThanOne = true;
                    }
                    break;
                }
                if ($greatestAnimalTypeGreaterThanOne) {
                    //$this->trace("manageZombiePickCard 3 : greatestAnimalTypeGreaterThanOne == true");
                    // filter river cards by animal type
                    $filteredCards = [];
                    foreach ( $riverCards as $riverCardId => $riverCard ) {
                        $riverCardType = self::getUniqueCardType($riverCard);
                        $riverCardAnimalType = self::getCardAnimalType($riverCardType);
                        if ($filteredType == $riverCardAnimalType) {
                            $filteredCards[] = $riverCard;
                        }
                    }
                }
                else {
                    //$this->trace("manageZombiePickCard 4 : greatestAnimalTypeGreaterThanOne == false");
                    // 4 : will choose randomly in the overall river cards list
                    $filteredCards = $riverCards;
                }
                // choose randomly a card to draw
                $randomCardIndexInRiver = random_int(0, count($filteredCards)-1);
                $cardIdToDraw = $filteredCards[$randomCardIndexInRiver]['id'];
                $this->pickCard($cardIdToDraw, false, false, false, $active_player);
                return;
            }
        }
    }
    
    function manageZombieDiscardHandCard($active_player) {
        $handCards = $this->cards->getCardsInLocation( 'hand', $active_player );
        if (count($handCards) == 0) {
            // can't discard any card
            // throw error : should have gone to an other state?
            return;
        }
        $topStackCard = $this->cards->getCardOnTop( 'cardsonstack_'.$active_player );
        $topStackCardType = self::getUniqueCardType($topStackCard);
        $topStackCardAnimalType = self::getCardAnimalType($topStackCardType);
        $filteredCards = [];
        // 1 : discards a card that dont share animal type with top stack card
        foreach ( $handCards as $handCardId => $handCard ) {
            $handCardType = self::getUniqueCardType($handCard);
            $handCardAnimalType = self::getCardAnimalType($handCardType);
            if ($topStackCardAnimalType != $handCardAnimalType) {
                $filteredCards[] = $handCard;
            }
        }
        if (count($filteredCards) > 0) {
            $randomCardIndexInFilteredHand = random_int(0, count($filteredCards)-1);
            $cardIdToDiscard = $filteredCards[$randomCardIndexInFilteredHand]['id'];
            $this->discardHandCard($cardIdToDiscard, $active_player);
            return;
        }
        else {
            // 2 : search for the lowest number of hand cards with the same animal type
            $handCardsAnimalTypes = (object)[];
            // gets the animal types cards count
            foreach ( $handCards as $handCardId => $handCard ) {
                $handCardType = self::getUniqueCardType($handCard);
                $handCardAnimalType = self::getCardAnimalType($handCardType);
                if (!property_exists($handCardsAnimalTypes, $handCardAnimalType)) {
                    $handCardsAnimalTypes->$handCardAnimalType = 0;
                }
                else {
                    $handCardsAnimalTypes->$handCardAnimalType += 1;
                }
            }
            $filteredType = null;
            // gets the animal type with the lowest number of cards
            foreach ( $handCardsAnimalTypes as $animalType => $animalTypeCount ) {
                if ($filteredType == null) {
                    $filteredType = $animalType;
                }
                else {
                    if ($handCardsAnimalTypes->$filteredType > $animalTypeCount) {
                        $filteredType = $animalType;
                    }
                }
            }
            // filters the cards with this animal type
            foreach ( $handCards as $handCardId => $handCard ) {
                $handCardType = self::getUniqueCardType($handCard);
                $handCardAnimalType = self::getCardAnimalType($handCardType);
                if ($handCardAnimalType == $filteredType) {
                    $filteredCards[] = $handCard;
                }
            }
            if (count($filteredCards) == 1) {
                $cardIdToDiscard = $filteredCards[0]['id'];
                $this->discardHandCard($cardIdToDiscard, $active_player);
                return;
            }
            else {
                // 3 : choose randomly a card
                $randomCardIndexInHand = random_int(0, count($handCards)-1);
                $cardIdToDiscard = $handCards[$randomCardIndexInHand]['id'];
                $this->discardHandCard($cardIdToDiscard, $active_player);
                return;
            }
        }
    }

    function manageZombiePlayerTurn($active_player) {
        $topStackCard = $this->cards->getCardOnTop( 'cardsonstack_'.$active_player );
        $remainingStackCount = $this->getRemainingStackCount($active_player);
        $filteredCards = [];
        $handCards = $this->cards->getCardsInLocation( 'hand', $active_player );
        if ($topStackCard != null) {
            $topStackCardType = self::getUniqueCardType($topStackCard);
            $topStackCardAnimalType = self::getCardAnimalType($topStackCardType);
            if (count($handCards) == 0 || $remainingStackCount <= 0) {
                // can't play any card
                // throw error : should have gone to an other state?
                return;
            }
            // 1 : search for top stack card same animal type cards in hand
            foreach ( $handCards as $handCardId => $handCard ) {
                $handCardType = self::getUniqueCardType($handCard);
                $handCardAnimalType = self::getCardAnimalType($handCardType);
                if ($topStackCardAnimalType == $handCardAnimalType) {
                    $filteredCards[] = $handCard;
                }
            }
            if (count($filteredCards) == 1) {
                $cardIdToPlay = $filteredCards[0]['id'];
                $this->playCardOnStack($cardIdToPlay, false, false, false, $active_player);
                return;
            }
            else if (count($filteredCards) > 1) {
                // apply second discrimination filter
                $cardIdToPlay = $this->getSecondDiscriminationCardIdToPlayForZombie($handCards, $filteredCards, $remainingStackCount);
                $this->playCardOnStack($cardIdToPlay, false, false, false, $active_player);
                return;
            }
        }
        else {
            // 0 : first card to play, need to go to "2" discrimination
        }
        
        {
            // 2 : search for the greatest number of hand cards with the same animal type
            $handCardsAnimalTypes = (object)[];
            // gets the animal types cards count
            foreach ( $handCards as $handCardId => $handCard ) {
                $handCardType = self::getUniqueCardType($handCard);
                $handCardAnimalType = self::getCardAnimalType($handCardType);
                if (!property_exists($handCardsAnimalTypes, $handCardAnimalType)) {
                    $handCardsAnimalTypes->$handCardAnimalType = 0;
                }
                else {
                    $handCardsAnimalTypes->$handCardAnimalType += 1;
                }
            }
            $filteredType = null;
            // gets the animal type with the greatest number of cards
            foreach ( $handCardsAnimalTypes as $animalType => $animalTypeCount ) {
                if ($filteredType == null) {
                    $filteredType = $animalType;
                }
                else {
                    if ($handCardsAnimalTypes->$filteredType < $animalTypeCount) {
                        $filteredType = $animalType;
                    }
                }
            }
            // filters the cards with this animal type
            foreach ( $handCards as $handCardId => $handCard ) {
                $handCardType = self::getUniqueCardType($handCard);
                $handCardAnimalType = self::getCardAnimalType($handCardType);
                if ($handCardAnimalType == $filteredType) {
                    $filteredCards[] = $handCard;
                }
            }
            if (count($filteredCards) == 1) {
                $cardIdToPlay = $filteredCards[0]['id'];
                $this->playCardOnStack($cardIdToPlay, false, false, false, $active_player);
                return;
            }
            else {
                // apply second discrimination filter
                if (count($filteredCards) == 0) {
                    $filteredCards = $handCards;
                }
                $cardIdToPlay = $this->getSecondDiscriminationCardIdToPlayForZombie($handCards, $filteredCards, $remainingStackCount);
                $this->playCardOnStack($cardIdToPlay, false, false, false, $active_player);
                return;
            }
        }
    }

    function getSecondDiscriminationCardIdToPlayForZombie($handCards, $filteredCards, $remainingStackCount) {
        if ($remainingStackCount > 1) {
            // choose randomly a card within the filtered cards
            $randomCardIndexInFilteredHand = random_int(0, count($filteredCards)-1);
            $cardIdToPlay = $filteredCards[$randomCardIndexInFilteredHand]['id'];
            return $cardIdToPlay;
        }
        else {
            // search for the best card to play so it is the last card of the turn
            // depending on the hand size, chose the wisest card
            $handCardsCount = count($handCards);
            $discriminationPickNumberIndex = null;
            foreach ( $filteredCards as $filteredHandCardId => $filteredHandCard ) {
                $filteredHandCardType = self::getUniqueCardType($filteredHandCard);
                $filteredHandCardPickNumber = self::getCardPickNumber($filteredHandCardType);
                $pickIndex = 0;
                foreach ($this->discriminationInfos[$handCardsCount] as $pickNumber) {
                    if ($filteredHandCardPickNumber == $pickNumber) {
                        if ($discriminationPickNumberIndex == null || $pickIndex < $discriminationPickNumberIndex) {
                            $discriminationPickNumberIndex = $pickIndex;
                        }
                    }
                    $pickIndex++;
                }
            }
            foreach ( $filteredCards as $filteredHandCardId => $filteredHandCard ) {
                $filteredHandCardType = self::getUniqueCardType($filteredHandCard);
                $filteredHandCardPickNumber = self::getCardPickNumber($filteredHandCardType);
                if ($filteredHandCardPickNumber == $this->discriminationInfos[$handCardsCount][$discriminationPickNumberIndex]) {
                    // plays the first card with the wisest pick number
                    $cardIdToPlay = $filteredHandCard['id'];
                    return $cardIdToPlay;
                }
            }
        }
    }

    function computeScoringInfos($cardsOnStack) {
        $scoringInfos = [];
        $lastAnimalType = null;
        $currentStackCardIndex = 0;
        $currentSerieIndex = 0;
        foreach ( $cardsOnStack  as $cardId => $card ){
            $currentStackCard = $this->cards->getCard($cardId);
            $currentStackCardType = self::getUniqueCardType($currentStackCard);
            $currentStackCardAnimalType = self::getCardAnimalType($currentStackCardType);
            $currentStackCardFlipped = $card['flipped'] == 1 || $card['flipped'] == '1';
            if (!$currentStackCardFlipped) {
                if ($lastAnimalType != null && $lastAnimalType != $currentStackCardAnimalType) {
                    $currentSerieIndex++;
                }
                $lastAnimalType = $currentStackCardAnimalType;
            }
            
            /*
            $scoringInfo = (object)null; //create an empty object
            $scoringInfo->serieIndex = $currentSerieIndex;
            $scoringInfo->cardId = $cardId;
            $scoringInfo->animalType = $currentStackCardAnimalType;
            $scoringInfo->flipped = $currentStackCardFlipped;
            */
            $scoringInfo = array(
                'serieIndex' => $currentSerieIndex, 
                'cardId' => $cardId, 
                'animalType' => $currentStackCardAnimalType, 
                'flipped' => $currentStackCardFlipped );
            $scoringInfos[] = $scoringInfo;
        }
        return $scoringInfos;
    }
    // Read or modify player scores
    function dbGetScore ($player_id) {
        return $this->getUniqueValueFromDB("SELECT player_score FROM player WHERE player_id = '$player_id'");
    }
    function dbSetScore ($player_id, $count) {
        $playerPosition = $this->getUniqueValueFromDB("SELECT player_no FROM player WHERE player_id = '$player_id'");
        $players = self::loadPlayersBasicInfos();
        $playersCount = count($players);
        $playerPosition = $playersCount - $playerPosition;
        $this->DbQuery("UPDATE player SET player_score = '$count', player_score_aux = '$playerPosition' WHERE player_id = '$player_id'");
    }
    function dbIncScore ($player_id, $inc) {
        $count = $this->dbGetScore($player_id);
        if ($inc != 0) {
            $count += $inc;
            $this->dbSetScore($player_id, $count);
        }
        return $count;
    }
    function savePlayerScoring($player_id, $scoringInfos, $scoringTable) {
        $this->DbQuery("UPDATE player SET player_scoring_infos = '".json_encode($scoringInfos)."', player_final_scoring_table = '".json_encode($scoringTable)."' WHERE player_id = '$player_id'");
    }
    function retrievePlayerScoringTable($player_id) {
        $scoringTable = json_decode($this->getUniqueValueFromDB("SELECT player_final_scoring_table FROM player WHERE player_id = '$player_id'"));
        return $scoringTable;
    }
    function retrievePlayerScoringInfos($player_id) {
        $scoringTable = json_decode($this->getUniqueValueFromDB("SELECT player_scoring_infos FROM player WHERE player_id = '$player_id'"));
        return $scoringTable;
    }
    function getSeriePoints($cardsCount) {
        $seriePoints = 0;
        switch ($cardsCount) {
            case 2:
                $seriePoints += 1;
                break;
            case 3:
                $seriePoints += 3;
                break;
            case 4:
                $seriePoints += 6;
                break;
            case 5:
                $seriePoints += 10;
                break;
            default:
                $seriePoints += 15;
                break;
        }
        return $seriePoints;
    }
    // Get flipped cards in location
    function isCardFlipped($card_id) {
        self::checkPosInt($card_id); // ensure card_id is number
        $sql = "SELECT card_flipped flipped FROM card WHERE card_id='$card_id'"; // don't need to escape anymore since we checked key before
        $res = self::getCollectionFromDb( $sql );
        $flipped = false;
        //$this->trace("isCardFlipped res.lenght : ".count($res));
        if (!empty($res)) {
            $res = array_shift($res);
            $flipped = ($res['flipped'] == '1' || $res['flipped'] == 1);
        }
        else {
            //$this->trace("throw error : no card retrieved in isCardFlipped with id".$card_id);
        }
        return $flipped;
    }
    // Get flipped cards in location
    function getFlippedCardsInLocation($location) {
        self::checklocation($location); // ensure location is string
        $sql = "SELECT card_id id, card_type type, card_type_arg type_arg, card_location location, card_location_arg location_arg FROM card WHERE card_flipped = '1' AND card_location = '".$location."'";
        $flippedCards = self::getCollectionFromDb( $sql );
        return $flippedCards;
    }
    // Get flipped cards in location
    function getCardsInLocationWithFlippedInfo($location) {
        self::checklocation($location); // ensure location is string
        $sql = "SELECT card_id id, card_type type, card_type_arg type_arg, card_location location, card_location_arg location_arg, card_flipped flipped FROM card WHERE  card_location = '".$location."' ORDER BY card_location_arg";
        $flippedCards = self::getCollectionFromDb( $sql );
        return $flippedCards;
    }
    // Set card flipped status
    function setFlippedCard($card_id, $flipped) {
        self::checkFlipped($flipped); // ensure flipped is number
        self::checkPosInt($card_id); // ensure card_id is number
        $sql = "UPDATE card";
        $sql .= " SET card_flipped='$flipped'";
        $sql .= " WHERE card_id='$card_id'"; // don't need to escape anymore since we checked key before
        self::DbQuery($sql);
        return $flipped;
    }
    

    final function checkPosInt($key) {
        if ($key && preg_match("/^[0-9]+$/", $key) == 0) {
            throw new feException("must be integer number");
        }
    }

    final function checkFlipped($state, $canBeNull = false) {
        if ($state === null && $canBeNull == false)
            throw new feException("state cannot be null");
        if ($state !== null && preg_match("/^-?[0-9]+$/", $state) != 1) {
            // $bt = debug_backtrace();
            // trigger_error("bt ".print_r($bt[2],true)) ;
            throw new feException("state must be integer number");
        }
    }

    final function checkLocation($location, $like = false) {
        if ($location == null)
            throw new feException("location cannot be null");
        if (!is_string($location))
                throw new feException("location is not a string");
        $extra = "";
        if ($like)
            $extra = "%";
        if (preg_match("/^[A-Za-z_0-9${extra}]+$/", $location) == 0) {
            throw new feException("location must be alphanum and underscore non empty string '$location'");
        }
    }

    public function getStateName() {
        $state = $this->gamestate->state();
        return $state['name'];
    }

    function getCurrentDiscardCount($zombiePlayerId = null) {
        return self::getGameStateValue('currentPlayerCurrentDiscardCount');
    }

    function getMaxDiscardCount($zombiePlayerId = null) {
        return self::getGameStateValue('currentPlayerMaxDiscardCount');;
    }

    function getRemainingDiscardCount($zombiePlayerId = null) {
        $player_id = $zombiePlayerId ?? self::getActivePlayerId();
        return $this->cards->countCardInLocation( 'hand', $player_id ) - 7;
    }

    function getCurrentPickCount($zombiePlayerId = null) {
        return self::getGameStateValue('currentPlayerPickCount');
    }
    function getMaxPickCount($zombiePlayerId = null) {
        $maxPickCount = 0;
        $player_id = $zombiePlayerId ?? self::getActivePlayerId();
        $currentPlayerLastStackTopCard = $this->cards->getCardOnTop( 'cardsonstack_'.$player_id );
        if ($currentPlayerLastStackTopCard == null || $this->isCardFlipped($currentPlayerLastStackTopCard['id'])) {
            $maxPickCount = 1;
        }
        else {
            $currentPlayerStackCardType = self::getUniqueCardType($currentPlayerLastStackTopCard);
            $maxPickCount = self::getCardPickNumber($currentPlayerStackCardType);
        }
        return $maxPickCount;
    }

    function getCurrentStackCount($zombiePlayerId = null) {
        return self::getGameStateValue( 'currentPlayerStackCount');
    }
    function getMaxStackCount($zombiePlayerId = null) {
        $maxStackCount = 0;
        $player_id = $zombiePlayerId ?? self::getActivePlayerId();
        
        $currentPlayerLastTurnTopStackCardId = self::getGameStateValue( 'currentPlayerLastTurnTopStackCardId');
        $currentPlayerLastStackTopCard = $this->cards->getCard( $currentPlayerLastTurnTopStackCardId );
        //$currentPlayerLastStackTopCard = $this->cards->getCardOnTop( 'cardsonstack_'.$player_id );
        if ($currentPlayerLastStackTopCard == null || $this->isCardFlipped($currentPlayerLastStackTopCard['id'])) {
            $maxStackCount = 1;
        }
        else {
            $currentPlayerStackCardType = self::getUniqueCardType($currentPlayerLastStackTopCard);
            $maxStackCount = self::getCardStackNumber($currentPlayerStackCardType);
        }
        return $maxStackCount;
    }

    function getRemainingStackCount($zombiePlayerId = null) {
        $remainingStackCount = null;
        $currentPlayerStackCount = self::getGameStateValue( 'currentPlayerStackCount');
        $player_id = $zombiePlayerId ?? self::getActivePlayerId();
        $currentPlayerLastStackTopCard = $this->cards->getCardOnTop( 'cardsonstack_'.$player_id );
        $currentPlayerTopStackCardStackNumber = null;
        if ($currentPlayerStackCount == 0) {
            if ($currentPlayerLastStackTopCard == null) {
                $remainingStackCount = 1;
            }
            else {
                if ($this->isCardFlipped($currentPlayerLastStackTopCard['id'])) {
                    $currentPlayerLastStackTopCard = null;
                    $remainingStackCount = 1;
                }
                else {
                    $currentPlayerStackCardType = self::getUniqueCardType($currentPlayerLastStackTopCard);
                    $currentPlayerTopStackCardStackNumber = self::getCardStackNumber($currentPlayerStackCardType);
                }
            }
        }
        else {
            if ($this->isCardFlipped($currentPlayerLastStackTopCard['id'])) {
                $currentPlayerLastStackTopCard = null;
                $remainingStackCount = 1;
            }
            else {
                $currentPlayerLastTurnTopStackCardId = self::getGameStateValue( 'currentPlayerLastTurnTopStackCardId');
                $currentPlayerLastStackTopCard = $this->cards->getCard( $currentPlayerLastTurnTopStackCardId );
                $currentPlayerStackCount = self::getGameStateValue( 'currentPlayerStackCount');
                $currentPlayerStackCardType = self::getUniqueCardType($currentPlayerLastStackTopCard);
                $currentPlayerTopStackCardStackNumber = self::getCardStackNumber($currentPlayerStackCardType);
            }
        }
        $currentPlayerHandCardsCount = $this->cards->countCardInLocation( 'hand', $player_id );
        // get remaining stack count from top stack card and compare it to player hand card count : choose the smallest
        if ($currentPlayerLastStackTopCard != null) {
            if ($currentPlayerTopStackCardStackNumber - $currentPlayerStackCount < $currentPlayerHandCardsCount) {
                $remainingStackCount = $currentPlayerTopStackCardStackNumber - $currentPlayerStackCount;
            }
            else {
                $remainingStackCount = $currentPlayerHandCardsCount;
            }
        }
        return $remainingStackCount;
    }

    function givePowerToPlayer($player_id, $currentCard, $card_id, $zombiePlayerId = null) {
        
        $player_id = $zombiePlayerId ?? self::getActivePlayerId();
        $player_name = ($zombiePlayerId != null) ? $this->getPlayerNameById($zombiePlayerId) : self::getActivePlayerName();
        // Gives the top stack card corresponding power to the current player
        $currentPlayerNewPowers = $this->powers->getCardsOfTypeInLocation(explode('_', $currentCard ['type'])[1], null, 'powers');
        foreach( $currentPlayerNewPowers as $currentPlayerNewPower ) {
            $this->powers->moveCard( $currentPlayerNewPower['id'], 'powers', $player_id );
        }
        // notify
        self::notifyAllPlayers('givePowerToPlayer', clienttranslate('${player_name} earns ${color_displayed} power'), array (
            'i18n' => array ('color_displayed','value_displayed' ),'card_id' => $card_id,'player_id' => $player_id,
            'player_name' => $player_name,'value' => $currentPlayerNewPower ['type_arg'],
            'value_displayed' => $this->values_label [$currentPlayerNewPower ['type_arg']],'color' => $currentPlayerNewPower ['type'],
            'color_displayed' => $this->getAnimalIcon( $this->animals [$currentPlayerNewPower ['type']] ['name'] )));

    }

    function getRemainingPickCount() {
        
        $currentPlayerTopStackCardId = self::getGameStateValue( 'currentPlayerTopStackCardId' ) ;
        $currentPlayerStackCard = $this->cards->getCard($currentPlayerTopStackCardId);
        $currentPlayerStackCardType = self::getUniqueCardType($currentPlayerStackCard);
        $this->setGameStateValue( 'currentPlayerStackCardType', $currentPlayerStackCardType );
        $currentPlayerStackCardPickNumber = self::getCardPickNumber($currentPlayerStackCardType);
        
        $riverCardsCount = $this->cards->countCardInLocation( 'river' );
        if ($riverCardsCount < $currentPlayerStackCardPickNumber - self::getGameStateValue('currentPlayerPickCount'))
        {
            return $riverCardsCount;
        }
        else {
            return $currentPlayerStackCardPickNumber - self::getGameStateValue('currentPlayerPickCount');
        }
    }
    function isPowerActive($phase, $powerTypeValue) {
        
        //$this->trace(" isPowerActive check | [phase : ".$phase." powerType : ".$powerTypeValue."]");
        foreach( $this->powersInfos as $powerType => $powerInfos ) {
            if ($powerInfos['phase'] == $phase && $powerInfos['powerType'] == $powerTypeValue) {
                $player_id = self::getActivePlayerId();
                $currentPlayerCorrespondingPowers = $this->powers->getCardsOfTypeInLocation(substr($powerType, 0, 1), substr($powerType, 1, 2), 'powers', $player_id);
                //$this->trace(" isPowerActive | [phase : ".$phase." powerType : ".substr($powerType, 0, 1)." playerId : ".$player_id." count : ".count($currentPlayerCorrespondingPowers)."]");
                foreach( $currentPlayerCorrespondingPowers as $currentPlayerCorrespondingPower ) {
                    //$this->trace(" isPowerActive | [powerid : ".$currentPlayerCorrespondingPower['id']."]");
                }
                return count($currentPlayerCorrespondingPowers) == 1;
            }
        }
        return false;
    }
    function isPowerExisting($phase, $powerTypeValue) {
        
        //$this->trace(" isPowerActive check | [phase : ".$phase." powerType : ".$powerTypeValue."]");
        foreach( $this->powersInfos as $powerType => $powerInfos ) {
            if ($powerInfos['phase'] == $phase && $powerInfos['powerType'] == $powerTypeValue) {
                return true;
            }
        }
        return false;
    }

    function getUniqueCardType($card)//2_6 5
    {
        $deckIndexAndAnimalTypeId = $card['type'];//2_6
        $drawCounter = $card['type_arg'];//5
        $deckIndex = explode('_', $deckIndexAndAnimalTypeId)[0];//2
        $animalTypeId = explode('_', $deckIndexAndAnimalTypeId)[1];//6
        $primaryAnimalToken = $animalTypeId;//6

        $secondaryAnimalToken = 0;
        if (($primaryAnimalToken + $drawCounter) >= ($primaryAnimalToken + 7 - $deckIndex)) { // ((6+5)>=(6+7+2))==false
            $secondaryAnimalToken = 1;
        }
        $secondaryAnimalToken += (($primaryAnimalToken + $drawCounter + $deckIndex - 1) % 6); //0+=6+5+2-1 = 12
        if ($secondaryAnimalToken == 0) $secondaryAnimalToken = 6; // retarget index for bear animal type // 6
        
        $stackCounter = 6 - $drawCounter;
        $uniqueType = "".$deckIndex.$animalTypeId.$drawCounter.$stackCounter.$primaryAnimalToken.$secondaryAnimalToken;
        return $uniqueType;
    }

    function getCardTypeDatas($cardUniqueType)
    {
        return str_split("".$cardUniqueType);
    }

    function getCardDeckIndex($cardUniqueType)
    {
        return self::getCardTypeDatas($cardUniqueType)[0];
    }

    function getCardAnimalType($cardUniqueType)
    {
        return self::getCardTypeDatas($cardUniqueType)[1];
    }
    
    function getCardPickNumber($cardUniqueType)
    {
        return self::getCardTypeDatas($cardUniqueType)[2];
    }
    
    function getCardStackNumber($cardUniqueType)
    {
        return self::getCardTypeDatas($cardUniqueType)[3];
    }
    
    function getCardPrimaryAnimalTokenType($cardUniqueType)
    {
        return self::getCardTypeDatas($cardUniqueType)[4];
    }
    
    function getCardSecondaryAnimalTokenType($cardUniqueType)
    {
        return self::getCardTypeDatas($cardUniqueType)[5];
    }

//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in arctic.action.php)
    */

    /*
    
    Example:

    function playCard( $card_id )
    {
        // Check that this is the player's turn and that it is a "possible action" at this game state (see states.inc.php)
        self::checkAction( 'playCard' ); 
        
        $player_id = self::getActivePlayerId();
        
        // Add your game logic to play a card there 
        ...
        
        // Notify all players about the card played
        self::notifyAllPlayers( "cardPlayed", clienttranslate( '${player_name} plays ${card_name}' ), array(
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'card_name' => $card_name,
            'card_id' => $card_id
        ) );
          
    }
    
    */

    function action_undo() {
        if ($this->isUndoAuthorized()) {
            $this->undoRestorePoint(); // do not do checkAction - its on purpose - do not need to add undo as possible action to every state
        }
    }

    function playCardOnStack($card_id, $end, $underStack, $flippedCard, $zombiePlayerId = null) {
        
        if ($zombiePlayerId !== null) {
            self::checkAction("playCardOnStack");
        }
        $player_id = $zombiePlayerId ?? self::getActivePlayerId();
        $player_name = ($zombiePlayerId != null) ? $this->getPlayerNameById($zombiePlayerId) : self::getActivePlayerName();
        // if a card has been played this turn, payer can't get back a card anymore
        $this->setGameStateValue( 'getBackCardFromStack',  0);
        // if a card has been played this turn, payer can't change a card anymore
        $this->setGameStateValue( 'changeCardFromRiver',  0);
        if ($end) {
            $currentPlayerTopStackCardId = $this->getGameStateValue( 'currentPlayerTopStackCardId' );
            $currentPlayerTopStackCard = $this->cards->getCard( $currentPlayerTopStackCardId );
            $this->givePowerToPlayer($player_id, $currentPlayerTopStackCard, $currentPlayerTopStackCardId, $zombiePlayerId);
            $this->gamestate->nextState('moveTokens');
            return;
        }
        
        $currentPlayerStackCount = self::getGameStateValue( 'currentPlayerStackCount');
        // first stacking of the current player turn : get the last turn top stack card and retrieves its stack count
        $currentPlayerLastStackTopCard = null;
        $currentPlayerTopStackCardType = null;
        if ($currentPlayerStackCount == 0) {
            $currentPlayerLastStackTopCard = $this->cards->getCardOnTop( 'cardsonstack_'.$player_id );
            
            if ($currentPlayerLastStackTopCard == null) {
                $currentPlayerTopStackCardStackNumber = 1;
                $this->setGameStateValue( 'currentPlayerLastTurnTopStackCardId', $card_id );
                $currentPlayerTopStackCardType = self::getUniqueCardType($this->cards->getCard( $card_id ));
            }
            else {
                $currentPlayerStackCardType = self::getUniqueCardType($currentPlayerLastStackTopCard);
                $currentPlayerTopStackCardStackNumber = self::getCardStackNumber($currentPlayerStackCardType);
                $currentPlayerTopStackCardType = self::getUniqueCardType($currentPlayerLastStackTopCard);
                // set the top stack card id to reuse for each stacking of this turn
                $this->setGameStateValue( 'currentPlayerLastTurnTopStackCardId', $currentPlayerLastStackTopCard['id'] );
            }
        }
        // not first stacking of the current player turn : check the stack count
        else {
            $currentPlayerLastStackTopCard = $this->cards->getCardOnTop( 'cardsonstack_'.$player_id );
            if ($this->isCardFlipped($currentPlayerLastStackTopCard['id'])) {
                $currentPlayerStackCardType = self::getUniqueCardType($currentPlayerLastStackTopCard);
                $currentPlayerTopStackCardType = $currentPlayerStackCardType;
                $currentPlayerTopStackCardStackNumber = 1;
            }
            else {
                $currentPlayerLastTurnTopStackCardId = self::getGameStateValue( 'currentPlayerLastTurnTopStackCardId');
                $currentPlayerLastStackTopCard = $this->cards->getCard( $currentPlayerLastTurnTopStackCardId );
                $currentPlayerStackCardType = self::getUniqueCardType($currentPlayerLastStackTopCard);
                $currentPlayerTopStackCardType = $currentPlayerStackCardType;
                $currentPlayerTopStackCardStackNumber = self::getCardStackNumber($currentPlayerStackCardType);
            }
        }
        if ($flippedCard) {
            // insert the card before the last played card ( location_arg starts at 1 so card count means the last index )
            // insertCard rule is : If location_arg place is already taken, increment all cards after location_arg in order to insert new card at this precise location.
            $this->cards->insertCard($card_id, 'cardsonstack_'.$player_id, ($this->cards->countCardInLocation( 'cardsonstack_'.$player_id )));
            $this->setFlippedCard($card_id, 1);
            // set this info to simplify scoring validation display
            $this->setGameStateValue( 'flippedCardHasBeenPlayedInThisGame', 1 );
        }
        else {
            $this->cards->insertCardOnExtremePosition($card_id, 'cardsonstack_'.$player_id, !$underStack);
        }
        $currentPlayerStackCount = $this->incGameStateValue('currentPlayerStackCount', 1);
        $currentCard = $this->cards->getCard($card_id);
        
        // And notify
        self::notifyAllPlayers('playCardOnStack', clienttranslate('${player_name} places ${color_displayed} on their personal pile'), array (
                'i18n' => array ('color_displayed','value_displayed' ),'card_id' => $card_id,'player_id' => $player_id,
                'player_name' => $player_name,'value' => $currentCard ['type_arg'],
                'value_displayed' => $this->values_label [$currentCard ['type_arg']],'color' => $currentCard ['type'],
                'color_displayed' => $this->getAnimalIcon( $this->animals [explode('_', $currentCard ['type'])[1]] ['name'] ),
                'underStack' => $underStack,
                'flippedCard' => $flippedCard,
                'currentPlayerStackCount' => $currentPlayerStackCount,
                'currentPlayerTopStackCardStackNumber' => $currentPlayerTopStackCardStackNumber));
        
        if ($currentPlayerLastStackTopCard == null || ($currentPlayerLastStackTopCard != null && $this->isCardFlipped($currentPlayerLastStackTopCard['id']))) {
            // no need to continue stacking cards
            // Player must pick cards depending on the pick number of the top stack card
            
            $this->givePowerToPlayer($player_id, $currentCard, $card_id, $zombiePlayerId);
            $this->setGameStateValue( 'currentPlayerTopStackCardId', $card_id );
            $this->gamestate->nextState('moveTokens');
        }
        else {
            
            $currentPlayerHandCardsCount = $this->cards->countCardInLocation( 'hand', $player_id );
            
            // need to check last turn top stack card in order to get its stack count
            // compares stack count and stack number
            // also check if player still have cards in hand
            //$this->trace("currentPlayerTopStackCardStackNumber".$currentPlayerTopStackCardStackNumber);
            //$this->trace("currentPlayerStackCount".$currentPlayerStackCount);
            //$this->trace("currentPlayerHandCardsCount".$currentPlayerHandCardsCount);
            if ($currentPlayerTopStackCardStackNumber > $currentPlayerStackCount && $currentPlayerHandCardsCount > 0) {
                if ($this->isPowerActive('playCardOnStack', 'plusOrMinusOne') && $currentPlayerTopStackCardStackNumber == ($currentPlayerStackCount + 1)) {
                    // can stop playing now (minus one)
                    $this->setGameStateValue( 'currentPlayerTopStackCardId', $card_id );
                    $this->setGameStateValue( 'canPlayPlusOrMinusOneCard', 1 );
                }
                $nextMoveCanBeTheLast = false;
                if ($this->isPowerActive('playCardOnStack', 'plusOrMinusOne') && $currentPlayerTopStackCardStackNumber == ($currentPlayerStackCount + 2)) {
                    $nextMoveCanBeTheLast = true;
                }
                // can play card under stack if possesses the power and is last card to play (can be the last card to stack or the last card on hand)
                if ($this->isPowerActive('playCardOnStack', 'underStack') && (($currentPlayerTopStackCardStackNumber == ($currentPlayerStackCount + 1)) || ($currentPlayerTopStackCardStackNumber > ($currentPlayerStackCount + 1) && $currentPlayerHandCardsCount == 1) || $nextMoveCanBeTheLast)) {
                    $this->setGameStateValue( 'canPlayCardUnderStack', 1 );
                }
                // can play card flipped if possesses the power and is last card to play (can be the last card to stack or the last card on hand)
                if ($this->isPowerActive('playCardOnStack', 'flippedCard') && (($currentPlayerTopStackCardStackNumber == ($currentPlayerStackCount + 1)) || ($currentPlayerTopStackCardStackNumber > ($currentPlayerStackCount + 1) && $currentPlayerHandCardsCount == 1) || $nextMoveCanBeTheLast)) {
                    $this->setGameStateValue( 'canPlayCardFlipped', 1 );
                }

                /*
                if ($this->isPowerActive('playCardOnStack', 'underStack') && $currentPlayerTopStackCardStackNumber == ($currentPlayerStackCount + 1)) {
                    $this->setGameStateValue( 'canPlayCardUnderStack', 1 );
                }
                if ($this->isPowerActive('playCardOnStack', 'flippedCard') && $currentPlayerTopStackCardStackNumber == ($currentPlayerStackCount + 1)) {
                    $this->setGameStateValue( 'canPlayCardFlipped', 1 );
                }
                */
                if ($underStack || $flippedCard) {
                    // player has chosen to play its card under stack, so it is their last card this turn, must proceed to next phase
                    $this->setGameStateValue( 'canPlayPlusOrMinusOneCard', 0 );
                    $this->setGameStateValue( 'canPlayCardUnderStack', 0 );
                    $this->setGameStateValue( 'canPlayCardFlipped', 0 );
                    $currentPlayerLastStackTopCard = $this->cards->getCardOnTop( 'cardsonstack_'.$player_id );
                    $this->givePowerToPlayer($player_id, $currentPlayerLastStackTopCard, $currentPlayerLastStackTopCard['id'], $zombiePlayerId);
                    $this->setGameStateValue( 'currentPlayerTopStackCardId', $currentPlayerLastStackTopCard['id']);
                    $this->gamestate->nextState('moveTokens');
                }
                else {
                    $this->gamestate->nextState('playCardOnStack');
                }
            }
            else if ($this->isPowerActive('playCardOnStack', 'plusOrMinusOne') && ($currentPlayerTopStackCardStackNumber == $currentPlayerStackCount) && $currentPlayerHandCardsCount > 0) {
                $this->setGameStateValue( 'currentPlayerTopStackCardId', $card_id );
                // can stop playing now (stack count equals card stack number)
                $this->setGameStateValue( 'canPlayPlusOrMinusOneCard', 1 );
                if ($this->isPowerActive('playCardOnStack', 'underStack') || $this->isPowerActive('playCardOnStack', 'flippedCard')) {
                    if ($underStack || $flippedCard) {
                        // player has chosen to play its card under stack, so it is their last card this turn, must proceed to next phase
                        $this->setGameStateValue( 'canPlayPlusOrMinusOneCard', 0 );
                        $this->setGameStateValue( 'canPlayCardUnderStack', 0 );
                        $this->setGameStateValue( 'canPlayCardFlipped', 0 );
                        $currentPlayerLastStackTopCard = $this->cards->getCardOnTop( 'cardsonstack_'.$player_id );
                        $this->givePowerToPlayer($player_id, $currentPlayerLastStackTopCard, $currentPlayerLastStackTopCard['id'], $zombiePlayerId);
                        $this->setGameStateValue( 'currentPlayerTopStackCardId', $currentPlayerLastStackTopCard['id']);
                        $this->gamestate->nextState('moveTokens');
                    }
                    else {
                        $this->setGameStateValue( 'canPlayCardUnderStack', 1 );
                        $this->setGameStateValue( 'canPlayCardFlipped', 1 );
                        $this->gamestate->nextState('playCardOnStack');
                    }
                }
                else {
                    $this->gamestate->nextState('playCardOnStack');
                }
            }
            else if ($currentPlayerTopStackCardStackNumber > $currentPlayerStackCount && $currentPlayerHandCardsCount == 0) {
                if (!$underStack && !$flippedCard) {
                    $this->givePowerToPlayer($player_id, $currentCard, $card_id, $zombiePlayerId);
                    $this->setGameStateValue( 'currentPlayerTopStackCardId', $card_id );
                }
                else {
                    $currentPlayerLastStackTopCard = $this->cards->getCardOnTop( 'cardsonstack_'.$player_id );
                    $this->givePowerToPlayer($player_id, $currentPlayerLastStackTopCard, $currentPlayerLastStackTopCard['id'], $zombiePlayerId);
                    $this->setGameStateValue( 'currentPlayerTopStackCardId', $currentPlayerLastStackTopCard['id']);
                }
                if ($this->isPowerActive('playCardOnStack', 'plusOrMinusOne') && $currentPlayerTopStackCardStackNumber == ($currentPlayerStackCount + 1)) {
                    // player hand is empty but has played enough cards so he won't pick penalties
                }
                else {
                    // player should continue playing cards on stack but hand is empty
                    // this rule applies : pick the remaining cards and put them in the penalties
                    $penaltiesCount = $currentPlayerTopStackCardStackNumber - $currentPlayerStackCount;
                    if ($this->isPowerActive('playCardOnStack', 'plusOrMinusOne')) {
                        // penalties count is lowered because of the power
                        $penaltiesCount--;
                    }
                    for ($pickCounter = 1; $pickCounter <= $penaltiesCount; $pickCounter ++) {
                        $pickCardsCount = $this->cards->countCardInLocation( 'deck' );
                        if ($pickCardsCount == 0) break;
                        $newPenaltiesCard = $this->cards->pickCardForLocation('deck', 'cardsonpenalties_'.$player_id, $this->cards->countCardInLocation( 'cardsonpenalties_'.$player_id ));
                        $pickCardsCount--;
                        // notify
                        self::notifyAllPlayers('playCardOnPenalties', clienttranslate('${player_name} draws from the common draw pile and discards ${color_displayed}'), array (
                                'i18n' => array ('color_displayed','value_displayed' ),'card_id' => $newPenaltiesCard ['id'],'player_id' => $player_id,
                                'player_name' => $player_name,'value' => $newPenaltiesCard ['type_arg'],
                                'value_displayed' => $this->values_label [$newPenaltiesCard ['type_arg']],'color' => $newPenaltiesCard ['type'],
                                'color_displayed' => $this->getAnimalIcon('generic'),
                                'pickCount' =>  $pickCardsCount));
                    }
                }
                $this->gamestate->nextState('moveTokens');
                
            }
            else {
                if (!$underStack && !$flippedCard) {
                    $this->givePowerToPlayer($player_id, $currentCard, $card_id, $zombiePlayerId);
                    $this->setGameStateValue( 'currentPlayerTopStackCardId', $card_id );
                }
                else {
                    $currentPlayerLastStackTopCard = $this->cards->getCardOnTop( 'cardsonstack_'.$player_id );
                    $this->givePowerToPlayer($player_id, $currentPlayerLastStackTopCard, $currentPlayerLastStackTopCard['id'], $zombiePlayerId);
                    $this->setGameStateValue( 'currentPlayerTopStackCardId', $currentPlayerLastStackTopCard['id']);
                }
                $this->gamestate->nextState('moveTokens');
            }
        }
    }

    function pickCard($card_id, $fromDeck, $fromPenalties, $end, $zombiePlayerId = null) {
        if ($zombiePlayerId !== null) {
            self::checkAction("pickCard");
        }
        //$this->trace(" pickCard check | [card_id : ".$card_id." fromDeck : ".($fromDeck == true)." fromPenalties : ".($fromPenalties == true)." end : ".($end == true)." isPowerActive(pickFromDeck) : ".($this->isPowerActive('pickCard', 'pickFromDeck') == true)." isPowerActive(pickFromPenalties) : ".($this->isPowerActive('pickCard', 'pickFromPenalties') == true)."]");
        $player_id = $zombiePlayerId ?? self::getActivePlayerId();
       
        $player_name = ($zombiePlayerId != null) ? $this->getPlayerNameById($zombiePlayerId) : self::getActivePlayerName();
        if (($end && $this->isPowerActive('pickCard', 'plusOrMinusOne')) || 
            $end && $this->cards->countCardInLocation( 'deck' ) == 0 && $this->cards->countCardInLocation( 'river' ) == 0) {
            $currentPlayerHandCardsCount = $this->cards->countCardInLocation( 'hand', $player_id );
            if ($currentPlayerHandCardsCount > 7) {
                $this->setGameStateValue( 'currentPlayerMaxDiscardCount', $currentPlayerHandCardsCount - 7);
                $this->gamestate->nextState('discardHandCard');
            }
            else {
                $currentPlayerPenaltiesCardsCount = $this->cards->countCardInLocation( 'cardsonpenalties_'.$player_id );
                if ($this->isPowerActive('givePenaltyCard', 'givePenalty') && (self::getGameStateValue( 'givePenaltyPowerUsed' ) == 0) && ($currentPlayerPenaltiesCardsCount > 0)) {
                    //$this->trace(" pickCard next state givePenalty | [isPowerActive : ".$this->isPowerActive('givePenaltyCard', 'givePenalty')." givePenaltyPowerUsed : ".self::getGameStateValue( 'givePenaltyPowerUsed' )."]");
    
                    $this->gamestate->nextState('givePenaltyCard');
                }
                else {
                    $this->gamestate->nextState('fillRiver');
                }
            }
            return;
        }
        if ($fromDeck && $this->isPowerActive('pickCard', 'pickFromDeck')) {
            //$this->trace(" pickCard check fromDeck");
            $newHandCardFromDeck = $this->cards->pickCardForLocation('deck', 'hand', $player_id);
            $card_id = $newHandCardFromDeck['id'];
            $this->setGameStateValue( 'pickFromDeckPowerUsed', 1 );
        }
        else if ($fromPenalties && $this->isPowerActive('pickCard', 'pickFromPenalties')) {
            //$this->trace(" pickCard check fromPenalties");
            //$giveCardToOtherPlayer = $this->cards->moveCard($card_id, 'cardsonpenalties_'.$forPlayerId, $this->cards->countCardInLocation( 'cardsonpenalties_'.$forPlayerId ));
            $this->cards->moveCard($card_id, 'hand', $player_id);
            $this->setGameStateValue( 'pickFromPenaltiesPowerUsed', 1 );
        }
        else {
            //$this->trace(" pickCard check standard");
            $this->cards->moveCard($card_id, 'hand', $player_id);
            $this->setGameStateValue( 'pickFromDeckPowerUsed', 0 );
            $this->setGameStateValue( 'pickFromPenaltiesPowerUsed', 0 );
        }
        // XXX check rules here

        $currentPlayerTopStackCardId = self::getGameStateValue( 'currentPlayerTopStackCardId' ) ;
        $currentPlayerStackCard = $this->cards->getCard($currentPlayerTopStackCardId);
        $currentPlayerStackCardType = self::getUniqueCardType($currentPlayerStackCard);
        $this->setGameStateValue( 'currentPlayerStackCardType', $currentPlayerStackCardType );
        $currentPlayerStackCardPickNumber = self::getCardPickNumber($currentPlayerStackCardType);
        
        $currentPlayerPickCount = $this->incGameStateValue('currentPlayerPickCount', 1);

        $currentCard = $this->cards->getCard($card_id);
        
        if ($fromDeck && $this->isPowerActive('pickCard', 'pickFromDeck')) {
            // And notify : card picked from deck is not shown to others players
            $players = self::loadPlayersBasicInfos();
            foreach( $players as $playerId => $player )
            {
                if ($player_id == $playerId) {
                    // current player knows wich card has been picked
                    self::notifyPlayer($playerId, 'pickCard', clienttranslate('${player_name} draws ${color_displayed} from the common draw pile'), array (
                        'i18n' => array ('color_displayed','value_displayed' ),'card_id' => $card_id,'player_id' => $player_id,
                        'player_name' => $player_name,'value' => $currentCard ['type_arg'],
                        'value_displayed' => $this->values_label [$currentCard ['type_arg']],'color' => $currentCard ['type'],
                        'color_displayed' => $this->getAnimalIcon($this->animals [explode('_', $currentCard ['type'])[1]] ['name']),
                        'currentPlayerPickCount' => $currentPlayerPickCount,
                        'currentPlayerStackCardPickNumber' => $currentPlayerStackCardPickNumber,
                        'pickFromDeckPowerUsed' => self::getGameStateValue( 'pickFromDeckPowerUsed' ),
                        'pickFromPenaltiesPowerUsed' => self::getGameStateValue( 'pickFromPenaltiesPowerUsed' ),
                        'pickCount' => $this->cards->countCardInLocation( 'deck' ) ));
                }
                else {
                    // other players don't know wich card has been picked
                    self::notifyPlayer($playerId, 'pickCard', clienttranslate('${player_name} draws ${color_displayed} from the common draw pile'), array (
                        'i18n' => array ('color_displayed','value_displayed' ),'card_id' => $card_id,'player_id' => $player_id,
                        'player_name' => $player_name,
                        'currentPlayerPickCount' => $currentPlayerPickCount,
                        'currentPlayerStackCardPickNumber' => $currentPlayerStackCardPickNumber,
                        'pickFromDeckPowerUsed' => self::getGameStateValue( 'pickFromDeckPowerUsed' ),
                        'pickFromPenaltiesPowerUsed' => self::getGameStateValue( 'pickFromPenaltiesPowerUsed' ),
                        'pickCount' => $this->cards->countCardInLocation( 'deck' ),
                        'color_displayed' => $this->getAnimalIcon('generic') ));
                }
            }
        }
        else if ($fromPenalties && $this->isPowerActive('pickCard', 'pickFromPenalties')) {
            // And notify : card picked from deck is not shown to others players
            $players = self::loadPlayersBasicInfos();
            foreach( $players as $playerId => $player )
            {
                if ($player_id == $playerId) {
                    // current player knows wich card has been picked
                    self::notifyPlayer($playerId, 'pickCard', clienttranslate('${player_name} draws ${color_displayed} from the Penalty zone'), array (
                        'i18n' => array ('color_displayed','value_displayed' ),'card_id' => $card_id,'player_id' => $player_id,
                        'player_name' => $player_name,'value' => $currentCard ['type_arg'],
                        'value_displayed' => $this->values_label [$currentCard ['type_arg']],'color' => $currentCard ['type'],
                        'color_displayed' => $this->getAnimalIcon($this->animals [explode('_', $currentCard ['type'])[1]] ['name']),
                        'currentPlayerPickCount' => $currentPlayerPickCount,
                        'currentPlayerStackCardPickNumber' => $currentPlayerStackCardPickNumber,
                        'pickFromDeckPowerUsed' => self::getGameStateValue( 'pickFromDeckPowerUsed' ),
                        'pickFromPenaltiesPowerUsed' => self::getGameStateValue( 'pickFromPenaltiesPowerUsed' ),
                        'pickCount' => $this->cards->countCardInLocation( 'deck' ) ));
                }
                else {
                    // other players don't know wich card has been picked
                    self::notifyPlayer($playerId, 'pickCard', clienttranslate('${player_name} draws ${color_displayed} from the Penalty zone'), array (
                        'i18n' => array ('color_displayed','value_displayed' ),'card_id' => $card_id,'player_id' => $player_id,
                        'player_name' => $player_name,
                        'currentPlayerPickCount' => $currentPlayerPickCount,
                        'currentPlayerStackCardPickNumber' => $currentPlayerStackCardPickNumber,
                        'pickFromDeckPowerUsed' => self::getGameStateValue( 'pickFromDeckPowerUsed' ),
                        'pickFromPenaltiesPowerUsed' => self::getGameStateValue( 'pickFromPenaltiesPowerUsed' ),
                        'pickCount' => $this->cards->countCardInLocation( 'deck' ),
                        'color_displayed' => $this->getAnimalIcon('generic') ));
                }
            }
        }
        else {
            // And notify : card picked from river is shown
            self::notifyAllPlayers('pickCard', clienttranslate('${player_name} draws ${color_displayed} from the River'), array (
                'i18n' => array ('color_displayed','value_displayed' ),'card_id' => $card_id,'player_id' => $player_id,
                'player_name' => $player_name,'value' => $currentCard ['type_arg'],
                'value_displayed' => $this->values_label [$currentCard ['type_arg']],'color' => $currentCard ['type'],
                'color_displayed' => $this->getAnimalIcon($this->animals [explode('_', $currentCard ['type'])[1]] ['name']),
                'currentPlayerPickCount' => $currentPlayerPickCount,
                'currentPlayerStackCardPickNumber' => $currentPlayerStackCardPickNumber,
                'pickFromDeckPowerUsed' => self::getGameStateValue( 'pickFromDeckPowerUsed' ),
                'pickFromPenaltiesPowerUsed' => self::getGameStateValue( 'pickFromPenaltiesPowerUsed' ),
                'pickCount' => $this->cards->countCardInLocation( 'deck' ) ));
        }
        $riverCardsCount = $this->cards->countCardInLocation( 'river' );
        // currentPlayerPickCount = 6 currentPlayerStackCardPickNumber = 5   ($6 >= ($5 -1)) && ($6 <= ($5 + 1))  ($4 >= ($5 -1)) && ($4 <= ($5 + 1))
        
        if ($this->isPowerActive('pickCard', 'plusOrMinusOne') && ($currentPlayerPickCount >= ($currentPlayerStackCardPickNumber -1)) && ($currentPlayerPickCount <= ($currentPlayerStackCardPickNumber + 1)) && $riverCardsCount > 0) {
            self::setGameStateValue( 'canPickPlusOrMinusOneCard', 1 );
        }
        else {
            self::setGameStateValue( 'canPickPlusOrMinusOneCard', 0 );
        }
        // Next state
        
        $currentPlayerPenaltiesCardsToPick = 0;
        $currentPlayerPenaltiesCardsCount = $this->cards->countCardInLocation( 'cardsonpenalties_'.$player_id );
        if ($this->isPowerActive('pickCard', 'pickFromPenalties')) {
            // get the player penalties cards count to know if there are cards to draw in it, only if player has the polar bear power associated
            $currentPlayerPenaltiesCardsToPick = $currentPlayerPenaltiesCardsCount;
        }
        // check if player can draw a card now
        if (($currentPlayerPenaltiesCardsToPick > 0 || $riverCardsCount > 0) && 
                 ($currentPlayerPickCount < $currentPlayerStackCardPickNumber || ($this->isPowerActive('pickCard', 'plusOrMinusOne') && ($currentPlayerPickCount == $currentPlayerStackCardPickNumber))))
        {
            if ($this->isPowerActive('pickCard', 'alwaysCompleteRiver')) {
                // check if drawn card comes from penalties to know if fill river is needed now
                if ($fromPenalties && $this->isPowerActive('pickCard', 'pickFromPenalties')) {
                    // player can draw a card now (from penalties or river)
                    $this->gamestate->nextState('pickCard');
                }
                /*
                no need for this control : player can't have pickFromDeck & alwaysCompleteRiver power at the same time
                else if ($fromDeck && $this->isPowerActive('pickCard', 'pickFromDeck')) {
                    // player can draw a card now (from deck or river)
                    $this->gamestate->nextState('pickCard');
                }*/
                else {
                    // river must be filled now before next player card draw 
                    $this->gamestate->nextState('fillRiver');
                }
            }
            else {
                // player can draw a card now (from penalties or river or deck)
                $this->gamestate->nextState('pickCard');
            }
        }
        else
        {
            // player has no remaining draw this turn
            $currentPlayerHandCardsCount = $this->cards->countCardInLocation( 'hand', $player_id );
            
            if ($currentPlayerHandCardsCount > 7) {
                // player must discard a card until hand has 7 cards
                $this->setGameStateValue( 'currentPlayerMaxDiscardCount', $currentPlayerHandCardsCount - 7);
                $this->gamestate->nextState('discardHandCard');
            }
            else {
                if ($this->isPowerActive('givePenaltyCard', 'givePenalty') && (self::getGameStateValue( 'givePenaltyPowerUsed' ) == 0) && ($currentPlayerPenaltiesCardsCount > 0)) {
                    // player can give a penalty before next turn
                    $this->gamestate->nextState('givePenaltyCard');
                }
                else {
                    // river must be filled for next turn
                    $this->gamestate->nextState('fillRiver');
                }
            }
        }
    }

    function givePenaltyCard($card_id, $opponent_player_id) {
        self::checkAction("givePenaltyCard");
        if (self::getGameStateValue( 'givePenaltyPowerUsed' ) == 0 ) {
            $player_id = self::getActivePlayerId();
            $currentCard = $this->cards->getCard($card_id);
            if ($card_id != null && $opponent_player_id != null) {
                if ($currentCard['location'] == 'cardsonpenalties_'.$player_id) {
                    $this->cards->insertCardOnExtremePosition($card_id, 'cardsonpenalties_'.$opponent_player_id, true);
                    
                    self::setGameStateValue( 'givePenaltyPowerUsed', 1 ) ;
                    // And notify
                    $players = self::loadPlayersBasicInfos();
                    self::notifyAllPlayers('givePenaltyCard', clienttranslate('${player_name} moves ${color_displayed} from their Penalty zone to ${opponent_player_name}\'s Penalty zone.'), array (
                            'i18n' => array ('color_displayed','value_displayed' ),'card_id' => $card_id,'player_id' => $player_id, 'opponent_player_id' => $opponent_player_id,
                            'player_name' => self::getActivePlayerName(), 'opponent_player_name' => $players[$opponent_player_id]['player_name'], 'value' => $currentCard ['type_arg'],
                            'value_displayed' => $this->values_label [$currentCard ['type_arg']],'color' => $currentCard ['type'],
                            'color_displayed' => $this->getAnimalIcon('generic')));
                }
                else {
                    //throw error
                    //$this->trace(" need to throw error : givePenaltyCard currentCard['location'] : ".$currentCard['location']." != cardsonpenalties_[player_id] : ".$player_id."]");
                }
            }
        }
        if ($this->getStateName() == 'pickCard') {
            // continue pickCard actions
            $this->gamestate->nextState('pickCard');
        }
        else if ($this->getStateName() == 'discardHandCard') {
            // continue discardHandCard actions
            $this->gamestate->nextState('discardHandCard');
        } 
        else {
            // no more pickCard or discardHandCard action to do : go to fillRiver
            $this->gamestate->nextState('fillRiver');
            /*
            // find if there are cards to discard, if true : continue discardHandCard actions, if false : go to fillRiver state
            $currentPlayerHandCardsCount = $this->cards->countCardInLocation( 'hand', $player_id );
            if ($currentPlayerHandCardsCount > 7) {
                $this->gamestate->nextState('discardHandCard');
            }
            else {
                $this->gamestate->nextState('fillRiver');
            }
            */
        }
    }

    function changeCardFromRiver($hand_card_id, $river_card_id) {
        self::checkAction("changeCardFromRiver");
        $player_id = self::getActivePlayerId();
        //$this->trace(" changeCardFromRiver check [hand_card_id:".$hand_card_id." river_card_id:".$river_card_id."]");
        // move river card to hand
        $this->cards->moveCard($river_card_id, 'hand', $player_id);
        // move hand card to river
        $this->cards->moveCard($hand_card_id, 'river');

        $handCard = $this->cards->getCard($hand_card_id);
        $riverCard = $this->cards->getCard($river_card_id);

        // and notify
        self::notifyAllPlayers('changeCardFromRiver', clienttranslate('${player_name} swaps ${hand_color_displayed} from their hand with ${river_color_displayed} from the River'), array (
            'i18n' => array ('hand_color_displayed','hand_value_displayed','river_color_displayed','river_value_displayed' ),'player_id' => $player_id,
            'player_name' => $this->getPlayerNameById($player_id), 
            'hand_card_id' => $hand_card_id, 
            'hand_value_displayed' => $this->values_label [$handCard ['type_arg']], 'hand_value' => $handCard ['type_arg'],
            'hand_color_displayed' => $this->getAnimalIcon($this->animals [explode('_', $handCard ['type'])[1]] ['name']),'hand_color' => $handCard ['type'],
            'river_card_id' => $river_card_id,
            'river_value_displayed' => $this->values_label [$riverCard ['type_arg']], 'river_value' => $riverCard ['type_arg'],
            'river_color_displayed' => $this->getAnimalIcon($this->animals [explode('_', $riverCard ['type'])[1]] ['name']), 'river_color' => $riverCard ['type']));

        // player is not allowed to change card from river this turn
        $this->setGameStateValue( 'changeCardFromRiver', 0);

        $this->gamestate->nextState('playCardOnStack');
    }

    function validateScoring($player_id, $scoring_infos) {
        $this->gamestate->checkPossibleAction("validateScoring");
        $scoring_infos = array_values($scoring_infos);
        // check if scoring info exists : means a player had to validate its score
        if ($scoring_infos != null) {
            $dBStackCards = $this->getCardsInLocationWithFlippedInfo('cardsonstack_'.$player_id);
            // check if cards count a good
            if (count($scoring_infos) != count($dBStackCards)) {
                $this->gamestate->nextState('scoring');
                self::notifyAllPlayers('validateScoring', clienttranslate('${player_name} needs to revalidate their score : wrong count'), array (
                    'i18n' => array ('color_displayed' ),
                    'player_id' => $player_id,
                    'player_name' => $this->getPlayerNameById($player_id)
                    ));
                return;
            }
            // check if cards are placed in good order and are the good ones
            $cardCounter = 0;
            foreach ($dBStackCards as $dBStackCardId => $dBStackCard) {
                if ($dBStackCard['id'] != $scoring_infos[$cardCounter]['cardId']) {
                    self::notifyAllPlayers('validateScoring', clienttranslate('${player_name} needs to revalidate their score : wrong id'), array (
                        'i18n' => array ('color_displayed' ),
                        'player_id' => $player_id,
                        'player_name' => $this->getPlayerNameById($player_id)
                        ));
                    return;
                }
                if ($dBStackCard['flipped'] != $scoring_infos[$cardCounter]['flipped']) {
                    self::notifyAllPlayers('validateScoring', clienttranslate('${player_name} needs to revalidate their score : wrong flipped'), array (
                        'i18n' => array ('color_displayed' ),
                        'player_id' => $player_id,
                        'player_name' => $this->getPlayerNameById($player_id)
                        ));
                    return;
                }
                $cardCounter++;
            }
        }
        // compute score
        /*$scoringSeries[] = array ();
        foreach ($scoring_infos as $scoring_info_id => $scoring_info) {
            //if ()
            //$this->trace("validateScoring scoring_info_id : ".$scoring_info_id);
            //$this->trace("validateScoring scoring_info[cardId] : ".$scoring_info['cardId']);
            //$this->trace("validateScoring scoring_info[animalType] : ".$scoring_info['animalType']);
            //$this->trace("validateScoring scoring_info[serieIndex] : ".$scoring_info['serieIndex']);
            //$this->trace("validateScoring scoring_info[flipped] : ".$scoring_info['flipped']);
        }*/


        $scoringSeries = array();
        $tempFlippedCardsCounter = 0;
        foreach ($scoring_infos as $scoring_info_index => $scoringInfo) {
            if ($scoringInfo['flipped']) {
                if (empty($scoringSeries) || 
                    $scoringInfo['serieIndex'] != end($scoringSeries)['serieIndex']) {
                    $tempFlippedCardsCounter++;
                } else {
                     $scoringSeries[count($scoringSeries) - 1]['count']++;
                }
            } else if (!$scoringInfo['flipped'] && 
                      (empty($scoringSeries) || 
                       $scoringInfo['serieIndex'] != end($scoringSeries)['serieIndex'])) {
                $scoringSeries[] = array(
                    'serieIndex' => $scoringInfo['serieIndex'],
                    'animalType' => $scoringInfo['animalType'],
                    'count' => 1
                );
                $scoringSeries[count($scoringSeries) - 1]['count'] += $tempFlippedCardsCounter;
                $tempFlippedCardsCounter = 0;
            } else {
                 $scoringSeries[count($scoringSeries) - 1]['count']++;
            }
        }

        /*$finalScoringSeries = array();
        foreach ($scoringSeries as $serieIndex => $serie) {
            if ($serie['count'] <= 1) {
                continue;
            }
            if (count($finalScoringSeries) == 0) {
                $finalScoringSeries[] = $serie;
                $scoringSeries[$serieIndex]['finalIndex'] = count($finalScoringSeries) - 1;
            } else {
                // compare with added series and replace the old one if same animal and old count is lesser than new count
                $sameAnimalSerieFound = false;
                $sameAnimalSerieReplacement = false;
                foreach ($scoringSeries as $compareSerieIndex => $compareSerie) {
                    if ($serieIndex == $compareSerieIndex) {
                        break;
                    }
                    if ($serie['animalType'] == $compareSerie['animalType']) {
                        $sameAnimalSerieFound = true;
                        if ($serie['count'] > $compareSerie['count']) {
                            array_splice($finalScoringSeries, $scoringSeries[$compareSerieIndex]['finalIndex'], $scoringSeries[$compareSerieIndex]['finalIndex']);
                            $finalScoringSeries[] = $serie;
                            $scoringSeries[$serieIndex]['finalIndex'] = count($finalScoringSeries) - 1;
                            $sameAnimalSerieReplacement = true;
                        }
                    }
                }
                if (!$sameAnimalSerieFound && !$sameAnimalSerieReplacement) {
                    $finalScoringSeries[] = $serie;
                    $scoringSeries[$serieIndex]['finalIndex'] = count($finalScoringSeries) - 1;
                }
            }
        }*/

        $finalScoringSeries = $scoringSeries;

        foreach ($finalScoringSeries as $serieIndex => $serie) {
            
            // check if serie already has scoring info
            if (!array_key_exists("isScoring", $finalScoringSeries[$serieIndex])) {
                // serie don't have scoring info : check count
                if ($serie['count'] <= 1) {
                    // ignore serie with count = 1
                    $finalScoringSeries[$serieIndex]['isScoring'] = false;
                    continue;
                }
                $currentAnimalType = $serie['animalType'];
                $sameAnimalTypeIndexs = array();
                // get the same animal series indexs
                foreach ($finalScoringSeries as $compareSerieIndex => $compareSerie) {
                    if ($compareSerie['animalType'] == $currentAnimalType) {
                        $sameAnimalTypeIndexs[] = $compareSerieIndex;
                    }
                }
                $currentAnimalSerieMaxCount = 0;
                $currentAnimalSerieMaxCountIndex = null;
                // get the highest count serie
                for ($i = 0; $i < count($sameAnimalTypeIndexs); $i++) {
                    if ($finalScoringSeries[$sameAnimalTypeIndexs[$i]]['count'] > $currentAnimalSerieMaxCount) {
                        $currentAnimalSerieMaxCountIndex = array_values($sameAnimalTypeIndexs)[$i];
                        $currentAnimalSerieMaxCount = $finalScoringSeries[array_values($sameAnimalTypeIndexs)[$i]]['count'];
                    }
                }
                // change scoring for all the same animal series
                for ($i = 0; $i < count($sameAnimalTypeIndexs); $i++) {
                    if ($currentAnimalSerieMaxCountIndex == array_values($sameAnimalTypeIndexs)[$i]) {
                        $currentAnimalSerieMaxCountIndex = array_values($sameAnimalTypeIndexs)[$i];
                        $finalScoringSeries[array_values($sameAnimalTypeIndexs)[$i]]['isScoring'] = true;
                    }
                    else {
                        $finalScoringSeries[array_values($sameAnimalTypeIndexs)[$i]]['isScoring'] = false;
                    }
                }
            }
            else {
                // serie already has scoring info : go to next serie
                continue;
            }

            /*
            OLD/BROKEN
            if (!array_key_exists("isScoring", $finalScoringSeries[$serieIndex])) {
                $finalScoringSeries[$serieIndex]['isScoring'] = null;
            }
            if ($serie['count'] <= 1) {
                continue;
            }
            if ($finalScoringSeries[$serieIndex]['isScoring'] == null) {
                // compare with added series and replace the old one if same animal and old count is lesser than new count
                $sameAnimalSerieFound = false;
                $sameAnimalSerieReplacement = false;
                foreach ($finalScoringSeries as $compareSerieIndex => $compareSerie) {
                    if ($serieIndex == $compareSerieIndex) {
                        continue;
                    }
                    if ($serie['animalType'] == $compareSerie['animalType']) {
                        $sameAnimalSerieFound = true;
                        if ($serie['count'] < $compareSerie['count']) {
                            $finalScoringSeries[$compareSerieIndex]['isScoring'] = true;
                            $finalScoringSeries[$serieIndex]['isScoring'] = false;
                            $sameAnimalSerieReplacement = true;
                        }
                        else if ($serie['count'] == $compareSerie['count']) {
                            $finalScoringSeries[$compareSerieIndex]['isScoring'] = false;
                            $finalScoringSeries[$serieIndex]['isScoring'] = true;
                            $sameAnimalSerieReplacement = true;
                        }
                    }
                }
                if (!$sameAnimalSerieFound || ($sameAnimalSerieFound && !$sameAnimalSerieReplacement)) {
                    $finalScoringSeries[$serieIndex]['isScoring'] = true;
                }
            }
            */
        }

        
        foreach ($finalScoringSeries as $serieIndex => $serie) {
            //$this->trace( " serieIndex  : ".$serieIndex." isScoring : ".$serie["isScoring"] );
        }

        $scoringTable = array(
            1 => 0,
            2 => 0,
            3 => 0,
            4 => 0,
            5 => 0,
            6 => 0,
            'differentAnimalsSeriesScore' => 0,
            'animalTotemScore' => 0,
            'penaltiesScore' => 0,
            'finalScore' => 0
        );

        $seriesScore = 0;
        $differentAnimalTypeScoringCount = 0;
        foreach ($finalScoringSeries as $scoringSerieIndex => $scoringSerie) {
            if ($scoringSerie['isScoring']) {
                $seriePoints = $this->getSeriePoints($scoringSerie['count']);
                //$this->trace("validateScoring [scoringSerieIndex : ".$scoringSerieIndex." | seriePoints : ".$seriePoints." | scoringSerie['count'] : ".$scoringSerie['count']." | scoringSerie['animalType'] : ".$scoringSerie['animalType']."]");
                $seriesScore += $seriePoints;
                $scoringTable[$scoringSerie['animalType']] = $seriePoints;
                $differentAnimalTypeScoringCount++;
            }
        }
        

        $differentAnimalsSeriesScore = 0;
        switch ($differentAnimalTypeScoringCount) {
            case 0:
                break;
            case 1:
                break;
            case 2:
                $differentAnimalsSeriesScore = 1;
                break;
            case 3:
                $differentAnimalsSeriesScore = 3;
                break;
            case 4:
                $differentAnimalsSeriesScore = 6;
                break;
            case 5:
                $differentAnimalsSeriesScore = 10;
                break;
            default:
                $differentAnimalsSeriesScore = 15;
                break;
        }
        $scoringTable['differentAnimalsSeriesScore'] = $differentAnimalsSeriesScore;
        
        $animalTotemScore = 0;
        $currentPlayerTotemAnimalType = null;
        $currentPlayerTotemList = $this->totems->getCardsInLocation( 'totem', $player_id );
        foreach( $currentPlayerTotemList as $currentPlayerTotem ) {
            $currentPlayerTotemAnimalType = $currentPlayerTotem['type'];
            break;
        }
        $currentPlayerTokens = $this->tokens->getCardsOfTypeInLocation($currentPlayerTotemAnimalType, null, 'tokens');
        $animalTotemType = null;
        foreach ($currentPlayerTokens as $tokenIndex => $token) {
            $animalTotemType = $token['type'];
            switch ($token['location_arg']) {
                    case 1:
                        break;
                    case 2:
                        $animalTotemScore = 1;
                        break;
                    case 3:
                        $animalTotemScore = 3;
                        break;
                    case 4:
                        $animalTotemScore = 6;
                        break;
                    case 5:
                        $animalTotemScore = 10;
                        break;
                    case 6:
                        $animalTotemScore = 15;
                        break;
                    default:
                        //echo "error finding totem landscape";
                        break;
            }
        }
        $scoringTable['animalTotemScore'] = $animalTotemScore;
        $penaltiesScore = intval($this->cards->countCardInLocation( 'cardsonpenalties_'.$player_id ));
        $scoringTable['penaltiesScore'] = $penaltiesScore;
        $finalScore = $differentAnimalsSeriesScore + $seriesScore + $animalTotemScore - $penaltiesScore;
        $scoringTable['finalScore'] = $finalScore;
        $scoringTable['animalTotemType'] = $animalTotemType;
        $scoringTable['finalScoringSeries'] = $finalScoringSeries;
        
        // update current player score
        $this->dbIncScore($player_id, $scoringTable['finalScore']);
        // retrieves new score from bd
        $newScores = self::getCollectionFromDb("SELECT player_id, player_score, player_score_aux FROM player", true);


        // And notify
        self::notifyAllPlayers('validateScoring', clienttranslate('${player_name} has validated their score'), array (
            'i18n' => array ('color_displayed' ),
            'player_id' => $player_id,
            'player_name' => $this->getPlayerNameById($player_id),
            'scoringTable' => $scoringTable,
            'finalScoringSeries' => $finalScoringSeries
            ));
        $this->savePlayerScoring($player_id, $scoring_infos, $scoringTable);

        
        self::setStat($scoringTable[1] , 'fox_series_score', $player_id );
        self::setStat($scoringTable[2] , 'moose_series_score', $player_id );
        self::setStat($scoringTable[3] , 'walrus_series_score', $player_id );
        self::setStat($scoringTable[4] , 'orca_series_score', $player_id );
        self::setStat($scoringTable[5] , 'puffin_series_score', $player_id );
        self::setStat($scoringTable[6] , 'bear_series_score', $player_id );
        self::setStat($scoringTable['differentAnimalsSeriesScore'] , 'different_animal_series_count', $player_id );
        self::setStat($scoringTable['animalTotemScore'] , 'totem_scoring', $player_id );
        self::setStat($scoringTable['penaltiesScore'] , 'penalties_score', $player_id );
        self::setStat($scoringTable['finalScore'] , 'score', $player_id );

        // deactivate player; if none left, transition to 'nextPlayer' state (and will end the game)
        $this->setGameStateValue( 'endGame', 1);
        $this->gamestate->setPlayerNonMultiactive($player_id, 'nextPlayer');
    }

    function implode_recursive(string $separator, array $array)
    {
        $string = '';
        foreach ($array as $i => $a) {
            if (is_array($a)) {
                $string .= $this->implode_recursive($separator, $a);
            } else {
                $string .= $a;
                if ($i < count($array) - 1) {
                    $string .= $separator;
                }
            }
        }
    
        return $string;
    }

    function getBackCardOnStack($card_id) {
        self::checkAction("getBackCardOnStack");
        $player_id = self::getActivePlayerId();
        //$this->trace(" getBackCardOnStack check ");
        // XXX check rules here
        $currentPlayerLastTurnTopStackCardId = self::getGameStateValue( 'currentPlayerLastTurnTopStackCardId' );
        // check if card to get back is current top stack card
        if ($card_id != $currentPlayerLastTurnTopStackCardId) {
            // throw error
            //$this->trace(" getBackCardOnStack throw error ");
            return;
        }
        // move top stack card to hand
        $this->cards->moveCard($card_id, 'hand', $player_id);
        // retrieve new top stack card
        $currentPlayerLastStackTopCard = $this->cards->getCardOnTop( 'cardsonstack_'.$player_id );
        $canPlayPlusOrMinusOneCard = 0;
        $canPlayCardUnderStack = 0;
        $canPlayCardFlipped = 0;
        $cantPlayCardFlippedExplain = 0;
        $cantStopPlayingCardExplain = 0;
        if ($currentPlayerLastStackTopCard == null) {
            $this->setGameStateValue( 'currentPlayerStackCardType', 0 );
            $this->setGameStateValue( 'currentPlayerTopStackCardId', 0 );
            $this->setGameStateValue( 'currentPlayerLastTurnTopStackCardId', 0 );
            $cantPlayCardFlippedExplain = 1;
            $cantStopPlayingCardExplain = 1;
        }
        else {
            $currentPlayerStackCardType = self::getUniqueCardType($currentPlayerLastStackTopCard);
            $this->setGameStateValue( 'currentPlayerStackCardType', $currentPlayerStackCardType );
            $this->setGameStateValue( 'currentPlayerTopStackCardId', $currentPlayerLastStackTopCard['id']);
            $this->setGameStateValue( 'currentPlayerLastTurnTopStackCardId', $currentPlayerLastStackTopCard['id']);
            $currentPlayerTopStackCardStackNumber = self::getCardStackNumber($currentPlayerStackCardType);
            
            if ($this->isCardFlipped($currentPlayerLastStackTopCard['id'])) {
                $currentPlayerTopStackCardStackNumber = 1;
            }

            if ($this->isPowerActive('playCardOnStack', 'plusOrMinusOne') && $currentPlayerTopStackCardStackNumber == 1) {
                if ($this->isCardFlipped($currentPlayerLastStackTopCard['id'])) {
                    $cantStopPlayingCardExplain = 1;
                }
                else {
                    $canPlayPlusOrMinusOneCard = 1;
                }
            }
            if ($this->isPowerActive('playCardOnStack', 'underStack') && $currentPlayerTopStackCardStackNumber == 1) {
                $canPlayCardUnderStack = 1;
            }
            else if ($this->isPowerActive('playCardOnStack', 'flippedCard') && $currentPlayerTopStackCardStackNumber == 1) {
                if ($this->isCardFlipped($currentPlayerLastStackTopCard['id'])) {
                    $cantPlayCardFlippedExplain = 1;
                }
                else {
                    $canPlayCardFlipped = 1;
                }
            }
        }
        $this->setGameStateValue( 'cantPlayCardFlippedExplain',  $cantPlayCardFlippedExplain);
        $this->setGameStateValue( 'cantStopPlayingCardExplain',  $cantStopPlayingCardExplain);
        $this->setGameStateValue( 'canPlayCardUnderStack',  $canPlayCardUnderStack);
        $this->setGameStateValue( 'canPlayCardFlipped',  $canPlayCardFlipped);
        $this->setGameStateValue( 'canPlayPlusOrMinusOneCard',  $canPlayPlusOrMinusOneCard);
        // player is not allowed to get a card back this turn
        $this->setGameStateValue( 'getBackCardFromStack', 0);
        // and notify
        $currentCard = $this->cards->getCard($card_id);
        self::notifyAllPlayers('getBackCardOnStack', clienttranslate('${player_name} takes ${color_displayed} visible Animal card back into their hand'), array (
            'i18n' => array ('color_displayed','value_displayed' ),'card_id' => $card_id,'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),'value' => $currentCard ['type_arg'],
            'value_displayed' => $this->values_label [$currentCard ['type_arg']],'color' => $currentCard ['type'],
            'color_displayed' => $this->getAnimalIcon($this->animals [explode('_', $currentCard ['type'])[1]] ['name'] )));

        $this->gamestate->nextState('playCardOnStack');
        
    }

    function discardHandCard($card_id, $zombiePlayerId = null) {
        if ($zombiePlayerId !== null) {
            self::checkAction("discardHandCard");
        }
        $player_id = $zombiePlayerId ?? self::getActivePlayerId();
        $player_name = ($zombiePlayerId != null) ? $this->getPlayerNameById($zombiePlayerId) : self::getActivePlayerName();
        $this->cards->insertCardOnExtremePosition($card_id, 'cardsonpenalties_'.$player_id, true);
        // XXX check rules here
        //$this->setGameStateValue( 'currentPlayerPenalitesCardId', $card_id );
        //$this->setGameStateValue( 'currentPlayerPickCount', 0 );

        $currentCard = $this->cards->getCard($card_id);
        // And notify
        self::notifyAllPlayers('playCardOnPenalties', clienttranslate('${player_name} discards ${color_displayed}'), array (
                'i18n' => array ('color_displayed','value_displayed' ),'card_id' => $card_id,'player_id' => $player_id,
                'player_name' => $player_name,'value' => $currentCard ['type_arg'],
                'value_displayed' => $this->values_label [$currentCard ['type_arg']],'color' => $currentCard ['type'],
                'color_displayed' => $this->getAnimalIcon('generic')));
        $currentPlayerHandCardsCount = $this->cards->countCardInLocation( 'hand', $player_id );
    
        $this->incGameStateValue( 'currentPlayerCurrentDiscardCount', 1);
        
        if ($currentPlayerHandCardsCount > 7) {
            $this->gamestate->nextState('discardHandCard');
        }
        else {
            $currentPlayerPenaltiesCardsCount = $this->cards->countCardInLocation( 'cardsonpenalties_'.$player_id );
            if ($this->isPowerActive('givePenaltyCard', 'givePenalty') && (self::getGameStateValue( 'givePenaltyPowerUsed' ) == 0) && ($currentPlayerPenaltiesCardsCount > 0)) {
                //$this->trace(" discardHandCard next state givePenalty | [isPowerActive : ".$this->isPowerActive('givePenaltyCard', 'givePenalty')." givePenaltyPowerUsed : ".self::getGameStateValue( 'givePenaltyPowerUsed' )."]");
                $this->gamestate->nextState('givePenaltyCard');
            }
            else {
                $this->gamestate->nextState('fillRiver');
            }
        }
    }
    
    function moveTokens($token_id, $token_new_pos, $end, $zombiePlayerId = null) {
        if ($zombiePlayerId !== null) {
            self::checkAction("moveTokens");
        }
        $player_id = $zombiePlayerId ?? self::getActivePlayerId();
        $player_name = ($zombiePlayerId != null) ? $this->getPlayerNameById($zombiePlayerId) : self::getActivePlayerName();
        $currentPlayerTopStackCardId = self::getGameStateValue( 'currentPlayerTopStackCardId' ) ;
        $currentPlayerTopStackCard = $this->cards->getCard($currentPlayerTopStackCardId);
        $currentPlayerTopStackCardType = self::getUniqueCardType($currentPlayerTopStackCard);
        $currentPlayerTopStackCardPrimaryAnimalTokenType = self::getCardPrimaryAnimalTokenType($currentPlayerTopStackCardType);
        $currentPlayerStackCardSecondaryAnimalTokenType = self::getCardSecondaryAnimalTokenType($currentPlayerTopStackCardType);
        $currentPlayerStackCardPickNumber = self::getCardPickNumber($currentPlayerTopStackCardType);
        if ($end) {
            // means current player don't want to use its power that allows to move a token again
            
            if ($this->getGameStateValue( 'lastTurnOfTheGame') == 1) {
                // no pick card in last turn
                $this->gamestate->nextState('nextPlayer');
            }
            else {
                $this->gamestate->nextState('pickCard');
                // manage case when pick plus or minus one card power is active and current top stack card pick value = 1
                if ($this->isPowerActive('pickCard', 'plusOrMinusOne') && ($currentPlayerStackCardPickNumber == 1)) {
                    self::setGameStateValue( 'canPickPlusOrMinusOneCard', 1 );
                }
            }
            // And notify
            self::notifyAllPlayers('moveTokens', clienttranslate('${player_name} chooses not to use their power to move the token again'), array (
                'i18n' => array ('color_displayed' ),
                'player_id' => $player_id,
                'player_name' => $player_name
                ));
            return;
        }
        
        // XXX check rules here

        $primary_token_id = null;
        $secondary_token_id = null;
        $primary_token_new_pos = null;
        $secondary_token_new_pos = null;
        if (self::getGameStateValue( 'moveTokensPowerApplied' ) == 0 || (self::getGameStateValue( 'moveTokensPowerApplied' ) == 1 && $this->isPowerActive('moveTokens', 'firstTokenMoveAgain'))) {
            $primary_token_id = $token_id;
            $primary_token_new_pos = $token_new_pos;
            $primaryToken = $this->tokens->getCard($primary_token_id);
            if ($primaryToken ['type'] != $currentPlayerTopStackCardPrimaryAnimalTokenType) {
                // throw error
                //$this->trace(" need to throw error : primaryToken ['type'] : ".$primaryToken ['type']." != currentPlayerTopStackCardPrimaryAnimalTokenType : ".$currentPlayerTopStackCardPrimaryAnimalTokenType."]");
            }
            $primary_token_old_pos = $primaryToken['location_arg'];
            if ($primary_token_new_pos + 1 != $primary_token_old_pos || $primary_token_new_pos -1 != $primary_token_old_pos) {
                // throw error
                //$this->trace(" need to throw error : primary_token_new_pos+/- 1 : ".$primary_token_new_pos." != primary_token_old_pos : ".$primary_token_old_pos."]");
            }
            $this->tokens->moveCard( $primary_token_id, 'tokens', $primary_token_new_pos );
    
            // And notify
            self::notifyAllPlayers('moveTokens', clienttranslate('${player_name} moves ${token_color_displayed} Main animal token from ${token_old_pos_displayed} to ${token_new_pos_displayed} position'), array (
                    'i18n' => array ('token_color_displayed' ),
                    'token_id' => $primary_token_id, 
                    'token_old_pos' => $primary_token_old_pos, 
                    'token_old_pos_displayed' => $this->landscapes_label [$primary_token_old_pos], 
                    'token_new_pos' => $primary_token_new_pos,
                    'token_new_pos_displayed' => $this->landscapes_label [$primary_token_new_pos], 
                    'player_id' => $player_id,
                    'player_name' => $player_name,
                    'token_color' => $primaryToken ['type'], 
                    'token_color_displayed' => $this->getAnimalIcon($this->animals [$primaryToken ['type']] ['name'])));
        }
        else if (self::getGameStateValue( 'moveTokensPowerApplied' ) == 1 && $this->isPowerActive('moveTokens', 'secondTokenMoveAgain')){
            $secondary_token_id = $token_id;
            $secondary_token_new_pos = $token_new_pos;
            $secondaryToken = $this->tokens->getCard($secondary_token_id);
            if ($secondaryToken ['type'] != $currentPlayerStackCardSecondaryAnimalTokenType) {
                // throw error
                //$this->trace(" need to throw error : secondaryToken ['type'] : ".$secondaryToken ['type']." != currentPlayerStackCardSecondaryAnimalTokenType : ".$currentPlayerStackCardSecondaryAnimalTokenType."]");
            }
            $secondary_token_old_pos = $secondaryToken['location_arg'];
            if ($secondary_token_new_pos + 1 != $secondary_token_old_pos || $secondary_token_new_pos -1 != $secondary_token_old_pos) {
                // throw error
                //$this->trace(" need to throw error : secondary_token_new_pos+/- 1 : ".$secondary_token_new_pos." != secondary_token_old_pos : ".$secondary_token_old_pos."]");
            }
            $this->tokens->moveCard( $secondary_token_id, 'tokens', $secondary_token_new_pos );
    
            // And notify
            self::notifyAllPlayers('moveTokens', clienttranslate('${player_name} moves ${token_color_displayed} Companion animal token from ${token_old_pos_displayed} to ${token_new_pos_displayed} position'), array (
                    'i18n' => array ('token_color_displayed' ),
                    'token_id' => $secondary_token_id, 
                    'token_old_pos' => $secondary_token_old_pos, 
                    'token_old_pos_displayed' => $this->landscapes_label [$secondary_token_old_pos], 
                    'token_new_pos' => $secondary_token_new_pos,
                    'token_new_pos_displayed' => $this->landscapes_label [$secondary_token_new_pos], 
                    'player_id' => $player_id,
                    'player_name' => $player_name,
                    'token_color' => $secondaryToken ['type'], 
                    'token_color_displayed' => $this->getAnimalIcon($this->animals [$secondaryToken ['type']] ['name'])));
        }
        if (self::getGameStateValue( 'moveTokensPowerApplied' ) == 0 ) {

            // XXX check rules here
            $secondaryTokens = $this->tokens->getCardsOfTypeInLocation($currentPlayerStackCardSecondaryAnimalTokenType, null, 'tokens');
            $secondaryAnimalToken = null;
            $secondaryAnimalTokenId = null;
            $secondary_token_old_pos = null;
            $secondary_token_new_pos = null;
            foreach( $secondaryTokens as $secondaryToken ) {
                $secondaryAnimalToken = $secondaryToken;
                $secondaryAnimalTokenId = $secondaryToken['id'];
                $secondary_token_old_pos = $secondaryToken['location_arg'];
                if ($primary_token_old_pos < $primary_token_new_pos && $secondary_token_old_pos !== "1") {
                    $secondary_token_new_pos = $secondaryToken['location_arg']-1;
                }
                else if ($primary_token_old_pos < $primary_token_new_pos && $secondary_token_old_pos == "1") {
                    $secondary_token_new_pos = $secondaryToken['location_arg']+1;
                }
                else if ($primary_token_old_pos > $primary_token_new_pos && $secondary_token_old_pos !== "6") {
                    $secondary_token_new_pos = $secondaryToken['location_arg']+1;
                } 
                else if ($primary_token_old_pos > $primary_token_new_pos && $secondary_token_old_pos == "6") {
                    $secondary_token_new_pos = $secondaryToken['location_arg']-1;
                }
                $this->tokens->moveCard( $secondaryToken['id'], 'tokens', $secondary_token_new_pos );
            }
    
            // And notify
            self::notifyAllPlayers('moveTokens', clienttranslate('${player_name} moves ${token_color_displayed} Companion animal token from ${token_old_pos_displayed} to ${token_new_pos_displayed} position'), array (
                'i18n' => array ('color_displayed' ),
                'token_id' => $secondaryAnimalTokenId, 
                'token_old_pos' => $secondary_token_old_pos, 
                'token_old_pos_displayed' => $this->landscapes_label [$secondary_token_old_pos], 
                'token_new_pos' => $secondary_token_new_pos,
                'token_new_pos_displayed' => $this->landscapes_label [$secondary_token_new_pos],
                'player_id' => $player_id,
                'player_name' => $player_name,
                'token_color' => $secondaryAnimalToken ['type'],
                'token_color_displayed' => $this->getAnimalIcon($this->animals [$secondaryAnimalToken ['type']] ['name'] )));
        }
        
        if (($this->isPowerActive('moveTokens', 'firstTokenMoveAgain') || $this->isPowerActive('moveTokens', 'secondTokenMoveAgain')) && self::getGameStateValue( 'moveTokensPowerApplied' ) == 0 ) { 
            self::setGameStateValue( 'moveTokensPowerApplied', 1 );
            $this->gamestate->nextState('moveTokens');
        }
        else {
            self::setGameStateValue( 'moveTokensPowerApplied', 0 );
            // manage case when pick plus or minus one card power is active and current top stack card pick value = 1
            if ($this->isPowerActive('pickCard', 'plusOrMinusOne') && ($currentPlayerStackCardPickNumber == 1)) {
                self::setGameStateValue( 'canPickPlusOrMinusOneCard', 1 );
            }
            if ($this->getGameStateValue( 'lastTurnOfTheGame') == 1) {
                // no pick card in last turn
                $this->gamestate->nextState('nextPlayer');
            }
            else {
                $this->gamestate->nextState('pickCard');
            }
        }
    }

    

    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    /*
    
    Example for game state "MyGameState":
    
    function argMyGameState()
    {
        // Get some values from the current game situation in database...
    
        // return values:
        return array(
            'variable1' => $value1,
            'variable2' => $value2,
            ...
        );
    }    
    */
    function argPlayCard() {
        return [
            'phaseIcon' => $this->getPhaseIcon(),
            'stackCount' => $this->getRemainingStackCount(),
            'currentStackCount' => $this->getCurrentStackCount(),
            'maxStackCount' => $this->getMaxStackCount(),
            'playPlusOrMinusOneCardPowerActive' => $this->isPowerActive('playCardOnStack', 'plusOrMinusOne') && (self::getGameStateValue( 'canPlayPlusOrMinusOneCard' ) == 1),
            'getBackCardFromStackPowerActive' => $this->isPowerActive('playCardOnStack', 'getBackCardFromStack') && (self::getGameStateValue( 'getBackCardFromStack' ) == 1),
            'getBackCardFromStackPowerUsed' => $this->isPowerActive('playCardOnStack', 'getBackCardFromStack') && (self::getGameStateValue( 'getBackCardFromStack' ) == 0),
            'changeCardFromRiverPowerActive' => $this->isPowerActive('playCardOnStack', 'changeCardFromRiver') && (self::getGameStateValue( 'changeCardFromRiver' ) == 1),
            'changeCardFromRiverPowerUsed' => $this->isPowerActive('playCardOnStack', 'changeCardFromRiver') && (self::getGameStateValue( 'changeCardFromRiver' ) == 0),
            'playCardUnderStackPowerActive' => $this->isPowerActive('playCardOnStack', 'underStack') && (self::getGameStateValue( 'canPlayCardUnderStack' ) == 1),
            'playCardFlippedPowerActive' => $this->isPowerActive('playCardOnStack', 'flippedCard') && (self::getGameStateValue( 'canPlayCardFlipped' ) == 1),
            'cantPlayCardFlippedExplain' => (self::getGameStateValue( 'cantPlayCardFlippedExplain' ) == 1),
            'cantStopPlayingCardExplain' => (self::getGameStateValue( 'cantStopPlayingCardExplain' ) == 1),
            'lastTurnOfTheGame' => (self::getGameStateValue( 'lastTurnOfTheGame' ) == 1),
            'endGameStock' => (self::getGameStateValue( 'endGameStock' ) == 1),
            'authorizedUndo' => $this->isUndoAuthorized()
            
        ];
    }
    function argPickCard() {
        return [
            'phaseIcon' => $this->getPhaseIcon(),
            'pickCount' => $this->getRemainingPickCount(),
            'currentPickCount' => $this->getCurrentPickCount(),
            'maxPickCount' => $this->getMaxPickCount(),
            'pickFromDeckPowerActive' => $this->isPowerActive('pickCard', 'pickFromDeck'),
            'pickFromDeckPowerUsed' => self::getGameStateValue( 'pickFromDeckPowerUsed' ),
            'pickFromPenaltiesPowerActive' => $this->isPowerActive('pickCard', 'pickFromPenalties'),
            'pickFromPenaltiesPowerUsed' => self::getGameStateValue( 'pickFromPenaltiesPowerUsed' ),
            'givePenaltyPowerActive' => $this->isPowerActive('givePenaltyCard', 'givePenalty') && (self::getGameStateValue( 'givePenaltyPowerUsed' ) == 0),
            'givePenaltyPowerUsed' => self::getGameStateValue( 'givePenaltyPowerUsed' ),
            'pickPlusOrMinusOneCardPowerActive' => $this->isPowerActive('pickCard', 'plusOrMinusOne') && (self::getGameStateValue( 'canPickPlusOrMinusOneCard' ) == 1),
            'endGameStock' => (self::getGameStateValue( 'endGameStock' ) == 1),
            'authorizedUndo' => $this->isUndoAuthorized(),
            'alwaysCompleteRiverPowerActive' => $this->isPowerActive('pickCard', 'alwaysCompleteRiver')
        ];
    }
    function argGivePenaltyCard() {
        return [
            'phaseIcon' => $this->getPhaseIcon(),
            'givePenaltyPowerActive' => $this->isPowerActive('givePenaltyCard', 'givePenalty') && (self::getGameStateValue( 'givePenaltyPowerUsed' ) == 0),
            'givePenaltyPowerUsed' => self::getGameStateValue( 'givePenaltyPowerUsed' )
        ];
    }
    function argDiscardCard() {
        return [
            'phaseIcon' => $this->getPhaseIcon(),
            'discardCount' => $this->getRemainingDiscardCount(),
            'currentDiscardCount' => $this->getCurrentDiscardCount(),
            'maxDiscardCount' => $this->getMaxDiscardCount(),
            'givePenaltyPowerActive' => $this->isPowerActive('givePenaltyCard', 'givePenalty') && (self::getGameStateValue( 'givePenaltyPowerUsed' ) == 0),
            'givePenaltyPowerUsed' => self::getGameStateValue( 'givePenaltyPowerUsed' )
        ];
    }
    function argMoveTokens() {
        return [
            'phaseIcon' => $this->getPhaseIcon(),
            'moveFirstTokenPowerActive' => $this->isPowerActive('moveTokens', 'firstTokenMoveAgain'),
            'moveSecondTokenPowerActive' => $this->isPowerActive('moveTokens', 'secondTokenMoveAgain'),
            'moveTokensPowerApplied' => self::getGameStateValue( 'moveTokensPowerApplied' ),
            'authorizedUndo' => $this->isUndoAuthorized()
        ];
    }
    function argScoring() {
        return [
        ];
    }

    function argGameEnd() {
        $parentArgs = parent::argGameEnd();
        $players = self::loadPlayersBasicInfos();

        $arcticScoring = [];
        foreach( $players as $player_id => $player )
        {
            $arcticScoring[] = [
                'player_id' => $player_id,
                'scoringInfos' => $this->retrievePlayerScoringInfos($player_id),
                'finalScoringTable' => $this->retrievePlayerScoringTable($player_id)
            ];
        }
        $args = [
            'arcticScoring' => $arcticScoring
        ];
        return array_merge($parentArgs, $args);
    }
    function argEndGame() {
        $players = self::loadPlayersBasicInfos();
        $arcticScoring = [];
        foreach( $players as $player_id => $player )
        {
            $arcticScoring[] = [
                'player_id' => $player_id,
                'scoringInfos' => $this->retrievePlayerScoringInfos($player_id),
                'finalScoringTable' => $this->retrievePlayerScoringTable($player_id)
            ];
        }
        return [
            'arcticScoring' => $arcticScoring
        ];
    }
//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */
    
    /*
    
    Example for game state "MyGameState":

    function stMyGameState()
    {
        // Do some stuff ...
        
        // (very often) go to another gamestate
        $this->gamestate->nextState( 'some_gamestate_transition' );
    }    
    */
    
    function stPlayerTurn() {
        $this->trace("stPlayerTurn called ! ");
        //self::notifyAllPlayers( 'playerTurn', 'start stPlayerTurn', array() );
        $this->manageSavePoint();
        // must add notify to actually create the save point on the first round!
        //self::notifyAllPlayers( 'playerTurn', 'end stPlayerTurn', array() );
    }
    
    function stFillRiver() {
        /*$player_id = self::getActivePlayerId();*/
        $players = self::loadPlayersBasicInfos();
        $deckCardsCount = $this->cards->countCardInLocation( 'deck' );
        $endGameStockCount = (count($players)-1)*5;  // 2 players : 5, 3 players : 10, 4 players : 15
        // deck cards count minus 1 because the card has not been picked already
        //$this->trace("stFillRiver check : [deckCardsCount-1 : ".($deckCardsCount-1)." endGameStockCount-1 : ".$endGameStockCount."]");
        if ($deckCardsCount-1 <= $endGameStockCount) {
            // start of end game
            //$this->trace("start of end game");
            if ($this->getGameStateValue( 'endGameStock') == 0) {
                // notify only when the end game starts (once)
                
                $finalDrawPileMessage = clienttranslate('The final draw pile has been created using the cards from the Reserve. Once the first player plays, it will mark the last turn of the game');
                self::notifyAllPlayers( 'lastTurn', '<div class="arc_pulse arc_red_text">'.$finalDrawPileMessage.'</div>', array() );
            }
            $this->setGameStateValue( 'endGameStock', 1 );
        }

        $riverCardsCount = $this->cards->countCardInLocation( 'river' );
        if ($riverCardsCount == 6) { // no need to fill the river (happens when player has pickFromDeck power and used it for all their picks)
            $this->gamestate->nextState('nextPlayer');
            return;
        }

        
        if ($deckCardsCount == 0)
        {
            self::notifyAllPlayers( 'fillRiver', clienttranslate('unable to fill the River, remaining cards count : ${deckCardsCount}'), array(
                'deckCardsCount' => $deckCardsCount
                ) );
            if ($this->isPowerActive('pickCard', 'alwaysCompleteRiver') && $riverCardsCount > 0) {
                $currentPlayerStackCardType = self::getGameStateValue( 'currentPlayerStackCardType' );
                $currentPlayerStackCardPickNumber = self::getCardPickNumber($currentPlayerStackCardType);
                $currentPlayerPickCount = self::getGameStateValue('currentPlayerPickCount');
                if ($currentPlayerPickCount < $currentPlayerStackCardPickNumber || ($this->isPowerActive('pickCard', 'plusOrMinusOne') && ($currentPlayerPickCount == $currentPlayerStackCardPickNumber))) {
                    $this->gamestate->nextState('pickCard');
                }
                else {
                    $this->gamestate->nextState('nextPlayer');
                }
            }
            else {
                $this->gamestate->nextState('nextPlayer');
            }
        }
        else {
            $newRiverCard = $this->cards->pickCardForLocation('deck', 'river');
            $riverCardsCount = $this->cards->countCardInLocation( 'river' );
            $pickCardsCount = $this->cards->countCardInLocation( 'deck' );
            if ($newRiverCard != null) {
                self::notifyAllPlayers( 'fillRiver',clienttranslate('The River is filled with ${color_displayed}'), array(
                    'i18n' => array ('color_displayed' ),
                    'card_id' => $newRiverCard['id'],
                    'animalType' => $newRiverCard['type'],
                    'value' => $newRiverCard['type_arg'],
                    'color_displayed' => $this->getAnimalIcon($this->animals [explode('_', $newRiverCard ['type'])[1]] ['name']),
                    'pickCount' => $pickCardsCount
                    ) );
            }
            else {
                self::notifyAllPlayers( 'fillRiver','', clienttranslate('Unable to fill the River, there are no more cards left'), array(
                    'deckCardsCount' => $deckCardsCount
                    ) );
            }
            if ($riverCardsCount < 6) {
                $this->gamestate->nextState('fillRiver');
            }
            else {
                
                // if orc power earned && pick count not finished

                if ($this->isPowerActive('pickCard', 'alwaysCompleteRiver')) {
                    $currentPlayerStackCardType = self::getGameStateValue( 'currentPlayerStackCardType' );
                    $currentPlayerStackCardPickNumber = self::getCardPickNumber($currentPlayerStackCardType);
                    $currentPlayerPickCount = self::getGameStateValue('currentPlayerPickCount');
                    if ($currentPlayerPickCount < $currentPlayerStackCardPickNumber || ($this->isPowerActive('pickCard', 'plusOrMinusOne') && ($currentPlayerPickCount == $currentPlayerStackCardPickNumber))) {
                        $this->gamestate->nextState('pickCard');
                    }
                    else {
                        $this->gamestate->nextState('nextPlayer');
                    }
                }
                else {
                    $this->gamestate->nextState('nextPlayer');
                }
            }
        }
    }

    // this will make all players who need Scoring Validation multiactive just before entering the state
    function stScoringOrAllowScoringValidation() {
        $allPayersAreScoringNow = true;
        $players = self::loadPlayersBasicInfos();
        $validatingPlayers = array();
        foreach ( $players as $player_id => $player ) {
            $cardsOnStack = $this->getCardsInLocationWithFlippedInfo('cardsonstack_'.$player_id);
            //id, type, type_arg, card_location, location_arg, flipped
            $lastAnimalType = null;
            $currentStackCardIndex = 0;
            $needScoringValidation = false;
            if ($this->isPowerExisting('playCardOnStack', 'flippedCard')) {
                foreach ( $cardsOnStack  as $cardId => $card ){
                    $currentStackCard = $this->cards->getCard($cardId);
                    $currentStackCardType = self::getUniqueCardType($currentStackCard);
                    $currentStackCardAnimalType = self::getCardAnimalType($currentStackCardType);
                    $currentStackCardFlipped = $card['flipped'] == 1 || $card['flipped'] == '1';
                    //$this->trace("stCheckForScoringValidationNeeded : [cardId:".$cardId.", currentStackCardAnimalType : ".$currentStackCardAnimalType."]");
                    if ($currentStackCardFlipped) {
                        if ($lastAnimalType != null) {
                            // start checking next cards
                            $compareStack = array_values($cardsOnStack);
                            for ( $compareCardIndex = $currentStackCardIndex+1 ; $currentStackCardIndex < count($compareStack) ; $currentStackCardIndex++ ){
                                if (!array_key_exists($compareCardIndex, $compareStack)) { continue; }
                                $compareStackCard = $this->cards->getCard($compareStack[$compareCardIndex]['id']);
                                $compareStackCardType = self::getUniqueCardType($compareStackCard);
                                $compareStackCardAnimalType = self::getCardAnimalType($compareStackCardType);
                                $compareStackCardFlipped = $compareStack[$compareCardIndex]['flipped'] == 1 || $compareStack[$compareCardIndex]['flipped'] == '1';
                                if ($compareStackCardFlipped) {
                                    continue;
                                }
                                if ($lastAnimalType == $compareStackCardAnimalType) {
                                    break;
                                }
                                if ($lastAnimalType != $compareStackCardAnimalType) {
                                    $needScoringValidation = true;
                                    $allPayersAreScoringNow = false;
                                    //$this->gamestate->setPlayersMultiactive( [$player_id], 'scoring', true );
                                    $validatingPlayers[] = $player_id;
                                    break;
                                }
                            }
                            if ($needScoringValidation) {
                                break;
                            }
                        }
                    }
                    else {
                        $lastAnimalType = $currentStackCardAnimalType;
                    }
                    $currentStackCardIndex++;
                }
            }
            if (!empty($validatingPlayers)){
                $this->gamestate->setPlayersMultiactive( $validatingPlayers, 'scoring', true );
            }
            if (!$needScoringValidation) {
                // must score automatically
                $scoringInfos = $this->computeScoringInfos($cardsOnStack);
                $this->validateScoring($player_id, $scoringInfos);
            }
        }
        if ($allPayersAreScoringNow) {
            $this->setGameStateValue( 'endGame', 1);
            $this->gamestate->nextState('nextPlayer');
        }
        
    }

    function stNextPlayer() {
        // check if this is the end of the game
        $endGame = self::getGameStateValue( 'endGame');
        if ($endGame) {
            
            $players = self::loadPlayersBasicInfos();
            foreach ( $players as $player_id => $player ) {
                $cards_on_stack_count = $this->cards->countCardInLocation( 'cardsonstack_'.$player_id );
                $cards_on_penalties_count = $this->cards->countCardInLocation( 'cardsonpenalties_'.$player_id );
                self::setStat( $cards_on_stack_count, 'cards_on_stack_count', $player_id );
                self::setStat( $cards_on_penalties_count, 'cards_on_penalties_count', $player_id );
            }
        
            $this->gamestate->nextState('gameEnd');
            return;
        }

        // fox
        if ($this->isPowerActive('playCardOnStack', 'underStack') || $this->isPowerActive('playCardOnStack', 'flippedCard')) {
            self::incStat( 1, 'turns_with_fox_power', self::getActivePlayerId() );
        }
        // moose
        if ($this->isPowerActive('playCardOnStack', 'plusOrMinusOne') || $this->isPowerActive('pickCard', 'plusOrMinusOne')) {
            self::incStat( 1, 'turns_with_moose_power', self::getActivePlayerId() );
        }
        // walrus
        if ($this->isPowerActive('moveTokens', 'firstTokenMoveAgain') || $this->isPowerActive('moveTokens', 'secondTokenMoveAgain')) {
            self::incStat( 1, 'turns_with_walrus_power', self::getActivePlayerId() );
        }
        // orc
        if ($this->isPowerActive('pickCard', 'alwaysCompleteRiver') || $this->isPowerActive('pickCard', 'pickFromDeck')) {
            self::incStat( 1, 'turns_with_orc_power', self::getActivePlayerId() );
        }
        // puffin
        if ($this->isPowerActive('playCardOnStack', 'getBackCardFromStack') || $this->isPowerActive('playCardOnStack', 'changeCardFromRiver')) {
            self::incStat( 1, 'turns_with_puffin_power', self::getActivePlayerId() );
        }
        // bear
        if ($this->isPowerActive('givePenaltyCard', 'givePenalty') || $this->isPowerActive('pickCard', 'pickFromPenalties')) {
            self::incStat( 1, 'turns_with_bear_power', self::getActivePlayerId() );
        }

        // active the next player
        $player_id = self::activeNextPlayer();
        // check if current player is first player
        $firstPlayerId = self::getGameStateValue( 'firstPlayerId');
        if ( $firstPlayerId == $player_id ) {
            // check first if need to stop the game
            if ($this->getGameStateValue( 'lastTurnOfTheGame') == 1) {
                //$this->trace("stNextPlayer check : [lastTurnOfTheGame==1]");
                self::giveExtraTime($player_id);
                $this->gamestate->nextState('scoring');
                return;
            }
            // check after if need to play last turn (if checks inverted : lead to stop the game without playing last turn)
            if ($this->getGameStateValue( 'endGameStock') == 1) {
                //$this->trace("stNextPlayer check : [endGameStock==1]");
        
                $this->setGameStateValue( 'lastTurnOfTheGame', 1 );
                $lastTurnMessage = clienttranslate('This is the last turn of the game');
                self::notifyAllPlayers( 'lastTurn', '<div class="arc_pulse arc_red_text">'.$lastTurnMessage.'</div>', array() );
            }
        }
        $this->setGameStateValue( 'currentPlayerPickCount', 0 );
        $this->setGameStateValue( 'currentPlayerStackCount', 0 );
        $this->setGameStateValue( 'moveTokensPowerApplied', 0 );
        $this->setGameStateValue( 'pickFromDeckPowerUsed', 0 );
        $this->setGameStateValue( 'pickFromPenaltiesPowerUsed', 0 );
        $this->setGameStateValue( 'givePenaltyPowerUsed', 0 );
        $this->setGameStateValue( 'canPickPlusOrMinusOneCard', 0 );
        $this->setGameStateValue( 'canPlayPlusOrMinusOneCard', 0 );
        $this->setGameStateValue( 'currentPlayerCurrentDiscardCount', 0);
        $this->setGameStateValue( 'currentPlayerMaxDiscardCount', 0);
        
        $currentPlayerLastStackTopCard = $this->cards->getCardOnTop( 'cardsonstack_'.$player_id );
        if ($currentPlayerLastStackTopCard == null) {
            $this->setGameStateValue( 'currentPlayerLastTurnTopStackCardId', 0 );
        } 
        else {
            $currentPlayerLastStackTopCardId = $currentPlayerLastStackTopCard['id'];
            $this->setGameStateValue( 'currentPlayerLastTurnTopStackCardId', $currentPlayerLastStackTopCardId );
        }
        $canPlayCardUnderStack = 0;
        $canPlayCardFlipped = 0;
        $canPlayPlusOrMinusOneCard = 0;
        $cantPlayCardFlippedExplain = 0;
        $cantStopPlayingCardExplain = 0;
        $nextStateFound = false;
        if ($currentPlayerLastStackTopCard != null) {
            $currentPlayerTopStackCardId = $this->getGameStateValue( 'currentPlayerLastTurnTopStackCardId');
            $currentPlayerStackCard = $this->cards->getCard($currentPlayerTopStackCardId);
            $currentPlayerStackCardType = self::getUniqueCardType($currentPlayerStackCard);
            $currentPlayerTopStackCardStackNumber = self::getCardStackNumber($currentPlayerStackCardType);
            if ($this->isPowerActive('playCardOnStack', 'plusOrMinusOne') && $currentPlayerTopStackCardStackNumber == 1) {
                if ($this->isCardFlipped($currentPlayerLastStackTopCard['id'])) {
                    $cantStopPlayingCardExplain = 1;
                }
                else {
                    $canPlayPlusOrMinusOneCard = 1;
                }
                if ($this->isPowerActive('playCardOnStack', 'underStack')) {
                    $canPlayCardUnderStack = 1 ;
                }
                else if ($this->isPowerActive('playCardOnStack', 'flippedCard')) {
                    if ($this->isCardFlipped($currentPlayerLastStackTopCard['id'])) {
                        $cantPlayCardFlippedExplain = 1;
                    }
                    else {
                        $canPlayCardFlipped = 1 ;
                    }
                }
                // retrieves the last turn top stack card so will be considered if player don't play any card on stack
                $this->setGameStateValue( 'currentPlayerTopStackCardId', $currentPlayerTopStackCardId);
                $this->setGameStateValue( 'currentPlayerStackCardType', $currentPlayerStackCardType );
            }
            else if ($this->isPowerActive('playCardOnStack', 'underStack') && $currentPlayerTopStackCardStackNumber == 1) {
                $canPlayCardUnderStack = 1;
            }
            else if ($this->isPowerActive('playCardOnStack', 'flippedCard') && $currentPlayerTopStackCardStackNumber == 1) {
                if ($this->isCardFlipped($currentPlayerLastStackTopCard['id'])) {
                    $cantPlayCardFlippedExplain = 1;
                }
                else {
                    $canPlayCardFlipped = 1 ;
                }
                $canPlayCardFlipped = 1;
            }
            
            $currentPlayerHandCardsCount = $this->cards->countCardInLocation( 'hand', $player_id );
            if ($currentPlayerHandCardsCount == 0) {
                // player should begin its turn playing cards on stack but hand is empty
                // this rule applies : pick cards corresponding to the to stack card stack number and put them in the penalties
                $penaltiesCount = $currentPlayerTopStackCardStackNumber;
                if ($this->isPowerActive('playCardOnStack', 'plusOrMinusOne')) {
                    // penalties count is lowered because of the power
                    $penaltiesCount--;
                }
                for ($pickCounter = 1; $pickCounter <= $penaltiesCount; $pickCounter ++) {
                    $pickCardsCount = $this->cards->countCardInLocation( 'deck' );
                    if ($pickCardsCount == 0) break;
                    $newPenaltiesCard = $this->cards->pickCardForLocation('deck', 'cardsonpenalties_'.$player_id, $this->cards->countCardInLocation( 'cardsonpenalties_'.$player_id ));
                    $pickCardsCount--;
                    // notify
                    self::notifyAllPlayers('playCardOnPenalties', clienttranslate('${player_name} draws from the common draw pile and discards ${color_displayed}'), array (
                            'i18n' => array ('color_displayed','value_displayed' ),'card_id' => $newPenaltiesCard ['id'],'player_id' => $player_id,
                            'player_name' => self::getActivePlayerName(),'value' => $newPenaltiesCard ['type_arg'],
                            'value_displayed' => $this->values_label [$newPenaltiesCard ['type_arg']],'color' => $newPenaltiesCard ['type'],
                            'color_displayed' => $this->getAnimalIcon('generic'),
                            'pickCount' =>  $pickCardsCount));
                }
                $nextStateFound = true;
                $this->gamestate->nextState('moveTokens');
            }
        }
        
        $this->setGameStateValue( 'cantPlayCardFlippedExplain',  $cantPlayCardFlippedExplain);
        $this->setGameStateValue( 'cantStopPlayingCardExplain',  $cantStopPlayingCardExplain);
        $this->setGameStateValue( 'canPlayCardUnderStack',  $canPlayCardUnderStack);
        $this->setGameStateValue( 'canPlayCardFlipped',  $canPlayCardFlipped);
        $this->setGameStateValue( 'canPlayPlusOrMinusOneCard',  $canPlayPlusOrMinusOneCard);

        // always allow to get back a card at the beginning of player's turn, power active will check if it's really possible
        $this->setGameStateValue( 'getBackCardFromStack',  1);
        // always allow to change card from river at the beginning of player's turn, power active will check if it's really possible
        $this->setGameStateValue( 'changeCardFromRiver',  1);

        self::giveExtraTime($player_id);
        if (!$nextStateFound) {
            self::incStat( 1, 'turns_number' );
            $this->gamestate->nextState('nextPlayer');
        }

    }

    
    function stEndGame() {
        
        self::notifyAllPlayers('endGame', clienttranslate(''), $this->argGameEnd());
        self::notifyAllPlayers( 'simplePause', '', [ 'time' => 2000] );
        $this->gamestate->nextState('gameEnd');
    }

//////////////////////////////////////////////////////////////////////////////
//////////// Zombie
////////////

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
        
        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
    */

    function zombieTurn( $state, $active_player )
    {
        //$this->trace("active_player : ".$active_player." " );
    	$statename = $state['name'];
    	
        if ($state['type'] === "activeplayer") {
            switch ($statename) {
                case 'playerTurn': // means play card on stack
                    $this->manageZombiePlayerTurn($active_player);
                    break;
                case 'moveTokens':
                    $this->manageZombieMoveTokens($active_player);
                    break;
                case 'pickCard':
                    $this->manageZombiePickCard($active_player);
                    break;
                case 'discardHandCard':
                    $this->manageZombieDiscardHandCard($active_player);
                    break;
                case 'givePenaltyCard':
                    // this state should not be called : it is a action initiated by real player 
                    throw new feException( "Zombie mode not supported at this game state: ".$statename );
                    break;
                default:
                    $this->gamestate->nextState( "zombiePass" );
                	break;
            }
            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            switch ($statename) {
                case 'scoring': 
                    // must score automatically
                    $cardsOnStack = $this->getCardsInLocationWithFlippedInfo('cardsonstack_'.$active_player);
                    $scoringInfos = $this->computeScoringInfos($cardsOnStack);
                    $this->validateScoring($active_player, $scoringInfos);
                    break;
                default:
                    // Make sure player is in a non blocking status for role turn
                    $this->gamestate->setPlayerNonMultiactive( $active_player, '' );
                    break;
            }
            return;
        }

        throw new feException( "Zombie mode not supported at this game state: ".$statename );
    }
    
    function callZombie($numCycles = 1) { // Runs zombieTurn() on all active players
        // Note: isMultiactiveState() doesn't work during this! It crashes without yielding an error.
        for ($cycle = 0; $cycle < $numCycles; $cycle++) {
          $state = $this->gamestate->state();
          $activePlayers = $this->gamestate->getActivePlayerList(); // this works in both active and multiactive states
    
          // You can remove the notification if you find it too noisy
          self::notifyAllPlayers('notifyZombie', '<u>ZombieTest cycle ${cycle} for ${statename}</u>', [
            'cycle'     => $cycle+1,
            'statename' => $state['name']
          ]);
    
          // Make each active player take a zombie turn
          foreach ($activePlayers as $key=>$playerId) {
            self::zombieTurn($state, (int)$playerId);
          }
        }
      }
    
///////////////////////////////////////////////////////////////////////////////////:
////////// DB upgrade
//////////

    /*
        upgradeTableDb:
        
        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.
    
    */
    
    function upgradeTableDb( $from_version )
    {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345
        
        // Example:
//        if( $from_version <= 1404301345 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        if( $from_version <= 1405061421 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        // Please add your future database scheme changes here
//
//


    }    
}
