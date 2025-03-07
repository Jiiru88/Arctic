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
 * arctic.view.php
 *
 * This is your "view" file.
 *
 * The method "build_page" below is called each time the game interface is displayed to a player, ie:
 * _ when the game starts
 * _ when a player refreshes the game page (F5)
 *
 * "build_page" method allows you to dynamically modify the HTML generated for the game interface. In
 * particular, you can set here the values of variables elements defined in arctic_arctic.tpl (elements
 * like {MY_VARIABLE_ELEMENT}), and insert HTML block elements (also defined in your HTML template file)
 *
 * Note: if the HTML of your game interface is always the same, you don't have to place anything here.
 *
 */
  
require_once( APP_BASE_PATH."view/common/game.view.php" );
  
class view_arctic_arctic extends game_view
{
    protected function getGameName()
    {
        // Used for translations and stuff. Please do not modify.
        return "arctic";
    }
    
  	function build_page( $viewArgs )
  	{		
  	    // Get players & players number
        $players = $this->game->loadPlayersBasicInfos();
        $players_nbr = count( $players );

        /*********** Place your code below:  ************/

        $template = self::getGameName() . "_" . self::getGameName();

        global $g_user;
        $current_player_id = $g_user->get_id();

        // this will inflate our player block with actual others players data
        $this->page->begin_block($template, "playertableblock");
        /*for ($tmp = 1 ; $tmp <=3 ; $tmp++)
        {*/
        foreach ( $players as $player_id => $info ) {
            if ($player_id != $current_player_id) {
                $this->page->insert_block("playertableblock", array ("PLAYER_ID" => $player_id,
                        "PLAYER_NAME" => $players [$player_id] ['player_name'],
                        "PLAYER_COLOR" => $players [$player_id] ['player_color'] ));
            }
        }
        /*}*/

        // allows to get the pick 
        $this->page->begin_block($template, "pickblock");
        $this->page->insert_block("pickblock", array ());
        // allows to get the current player id for its stack
        $this->page->begin_block($template, "currentplayerstackblock");
        $this->page->insert_block("currentplayerstackblock", array ("PLAYER_ID" => $current_player_id));
        // allows to get the current player id for its penalties
        $this->page->begin_block($template, "currentplayerpenaltiesblock");
        $this->page->insert_block("currentplayerpenaltiesblock", array ("PLAYER_ID" => $current_player_id));

        // this will make our My Hand text translatable
        $this->tpl['PLAYERS_COUNT'] = $players_nbr;
        $this->tpl['POWERS'] = self::_("Powers");
        $this->tpl['PLAYERS'] = self::_("Players");
        $this->tpl['LANDSCAPE'] = self::_("Landscape");
        $this->tpl['MY_TOTEM'] = self::_("My Totem");
        $this->tpl['PICK'] = self::_("Draw pile");
        $this->tpl['RIVER'] = self::_("River");
        $this->tpl['MY_PENALTIES'] = self::_("My Penalty zone");
        $this->tpl['MY_HAND'] = self::_("My hand");
        $this->tpl['MY_STACK'] = self::_("My pile");
        $this->tpl['SCORING_STACK'] = self::_("Pile Scoring");
        $this->tpl['FINAL_SCORING'] = self::_("Final Scoring");
        $this->tpl['SCORING_SPECTATOR_MESSAGE'] = self::_("Waiting for players to validate their scoring...");
        $this->tpl['DIFFERENT_ANIMAL_TYPES'] = self::_("Different animal types");
        $this->tpl['OWNED_POWERS_TITLE'] = self::_("Owned powers :");


        /*
        
        // Examples: set the value of some element defined in your tpl file like this: {MY_VARIABLE_ELEMENT}

        // Display a specific number / string
        $this->tpl['MY_VARIABLE_ELEMENT'] = $number_to_display;

        // Display a string to be translated in all languages: 
        $this->tpl['MY_VARIABLE_ELEMENT'] = self::_("A string to be translated");

        // Display some HTML content of your own:
        $this->tpl['MY_VARIABLE_ELEMENT'] = self::raw( $some_html_code );
        
        */
        
        /*
        
        // Example: display a specific HTML block for each player in this game.
        // (note: the block is defined in your .tpl file like this:
        //      <!-- BEGIN myblock --> 
        //          ... my HTML code ...
        //      <!-- END myblock --> 
        

        $this->page->begin_block( "arctic_arctic", "myblock" );
        foreach( $players as $player )
        {
            $this->page->insert_block( "myblock", array( 
                                                    "PLAYER_NAME" => $player['player_name'],
                                                    "SOME_VARIABLE" => $some_value
                                                    ...
                                                     ) );
        }
        
        */



        /*********** Do not change anything below this line  ************/
  	}
}
