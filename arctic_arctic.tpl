{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
-- Arctic implementation : © Gilles Verriez <gilles.vginc@gmail.com>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

    arctic_arctic.tpl
    
    This is the HTML template of your game.
    
-->



<div id="arc_message_wrap" class="arc_message_wrap"></div>
<div id="arc_players_wrap" class="arc_whiteblock arc_gridbox arc_gridbox arc_players_wrap{PLAYERS_COUNT}">
    <h3 id="arc_players_title">{PLAYERS}</h3>
    <!-- BEGIN playertableblock -->
    <div id="arc_player_wrap_{PLAYER_ID}" class="arc_player_wrap">
        <div id="arc_player_{PLAYER_ID}" class="arc_player" style="color:#{PLAYER_COLOR}" >
            {PLAYER_NAME}
        </div>
        <div class="arc_playertable" id="arc_playertable_{PLAYER_ID}" style="box-shadow:0px 0px 10px 0px #{PLAYER_COLOR}">
            <div  id="arc_playerpenalties_{PLAYER_ID}" class="arc_playerpenalties_wrap">
                <div id="arc_playerpenaltiesplaceholder_{PLAYER_ID}" class="arc_playerpenalties arc_minifiedcard arc_placeholder"></div>
            </div>
            <div  id="arc_playerstack_{PLAYER_ID}" class="arc_playerstack_wrap">
                <div id="arc_playerstackplaceholder_{PLAYER_ID}" class="arc_playerstack arc_minifiedcard arc_placeholder"></div>
            </div>
        </div>
    </div>
    <!-- END playertableblock -->
</div>

<div id="arc_powers_wrap" class="arc_whiteblock arc_gridbox">
    <h3 id="arc_powers_title">{POWERS}</h3>
    <!-- pay attention to not add content in this 3 divs (use of :empty css selector) -->
    <div id="arc_currentPlayerPowers"></div>
    <div id="arc_powers"></div>
    <div id="arc_unavailablePowers"></div>
</div>

<div id="arc_totem_wrap" class="arc_whiteblock arc_gridbox">
    <h3 id="arc_totem_title">{MY_TOTEM}</h3>
    <div id="arc_totem">
    </div>
</div>

<div id="arc_landscapes_wrap" class="arc_whiteblock arc_gridbox">
    <h3 id="arc_landscapes_title">{LANDSCAPE}</h3>
    <div id="arc_landscape">
        <div id="arc_landscape1" class="arc_landscape">
            <div id="arc_landscape1_tooltip_zone" class="arc_landscape_tooltip_zone"></div>
            <div id="arc_tokenwrap1" class="arc_tokenwrap">
                <div id="arc_primarytokenwrap1" class="arc_primarytokenwrap"></div>
                <div id="arc_secondarytokenwrap1" class="arc_secondarytokenwrap"></div>
            </div>
        </div>
        <div id="arc_landscape2" class="arc_landscape">
            <div id="arc_landscape2_tooltip_zone" class="arc_landscape_tooltip_zone"></div>
            <div id="arc_tokenwrap2" class="arc_tokenwrap">
                <div id="arc_primarytokenwrap2" class="arc_primarytokenwrap"></div>
                <div id="arc_secondarytokenwrap2" class="arc_secondarytokenwrap"></div>
            </div>
        </div>
        <div id="arc_landscape3" class="arc_landscape">
            <div id="arc_landscape3_tooltip_zone" class="arc_landscape_tooltip_zone"></div>
            <div id="arc_tokenwrap3" class="arc_tokenwrap">
                <div id="arc_primarytokenwrap3" class="arc_primarytokenwrap"></div>
                <div id="arc_secondarytokenwrap3" class="arc_secondarytokenwrap"></div>
            </div>
        </div>
        <div id="arc_landscape4" class="arc_landscape">
            <div id="arc_landscape4_tooltip_zone" class="arc_landscape_tooltip_zone"></div>
            <div id="arc_tokenwrap4" class="arc_tokenwrap">
                <div id="arc_primarytokenwrap4" class="arc_primarytokenwrap"></div>
                <div id="arc_secondarytokenwrap4" class="arc_secondarytokenwrap"></div>
            </div>
        </div>
        <div id="arc_landscape5" class="arc_landscape">
            <div id="arc_landscape5_tooltip_zone" class="arc_landscape_tooltip_zone"></div>
            <div id="arc_tokenwrap5" class="arc_tokenwrap">
                <div id="arc_primarytokenwrap5" class="arc_primarytokenwrap"></div>
                <div id="arc_secondarytokenwrap5" class="arc_secondarytokenwrap"></div>
            </div>
        </div>
        <div id="arc_landscape6" class="arc_landscape">
            <div id="arc_landscape6_tooltip_zone" class="arc_landscape_tooltip_zone"></div>
            <div id="arc_tokenwrap6" class="arc_tokenwrap">
                <div id="arc_primarytokenwrap6" class="arc_primarytokenwrap"></div>
                <div id="arc_secondarytokenwrap6" class="arc_secondarytokenwrap"></div>
            </div>
        </div>
    </div>
</div>

<div id="arc_pick_wrap" class="arc_whiteblock arc_gridbox">
    <h3 id="arc_pick_title">{PICK}</h3>
    <div id="arc_pick">
        <!-- BEGIN pickblock -->
        <div id="arc_pickplaceholder" class="arc_card arc_placeholder"></div>
        <!-- END pickblock -->
    </div>
</div>

<div id="arc_river_wrap" class="arc_whiteblock arc_gridbox arc_gridbox">
    <h3 id="arc_river_title">{RIVER}</h3>
    <div id="arc_river">
    </div>
</div>
<div id="arc_penaltiesandstack_wrap">
    <div id="arc_mypenalties_wrap" class="arc_whiteblock arc_gridbox">
        <h3 id="arc_mypenalties_title">{MY_PENALTIES}</h3>
        <div id="arc_mypenalties">
            <!-- BEGIN currentplayerpenaltiesblock -->
            <div id="arc_playerpenaltiesplaceholder_{PLAYER_ID}" class="arc_card arc_placeholder"></div>
            <!-- END currentplayerpenaltiesblock -->
        </div>
        <div id="arc_mypenaltiesindetails">
        </div>
    </div>

    <div id="arc_mystack_wrap" class="arc_whiteblock arc_gridbox">
        <h3 id="arc_mystack_title">{MY_STACK}</h3>
        <div id="arc_mystack">
            <!-- BEGIN currentplayerstackblock -->
            <div id="arc_playerstackplaceholder_{PLAYER_ID}" class="arc_card arc_placeholder"></div>
            <!-- END currentplayerstackblock -->
        </div>
        <div id="arc_mystackindetails">
        </div>
    </div>
</div>
<div id="arc_myhand_wrap" class="arc_whiteblock arc_gridbox">
    <h3 id="arc_myhand_title">{MY_HAND}</h3>
    <div id="arc_myhand">
    </div>
</div>
<div id="arc_mystackinscoring" class="arc_mystackinscoring">
</div>

<script type="text/javascript">

// Javascript HTML templates

/*
// Example:
var jstpl_some_game_item='<div class="my_game_item" id="my_game_item_${MY_ITEM_ID}"></div>';

*/

//var jstpl_cardonriver = '<div class="river arc_card cardontable1" id="cardonriver_${card_id}" style="background-position:-${x}px -${y}px">\
//                        </div>';
var jstpl_cardonstack = '<div class="arc_card arc_cardontable arc_deck${deck_index}" id="arc_cardonstack_${card_id}" style="background-position:-${x}px -${y}px">\
                        </div>';
var jstpl_minifiedcardonstack = '<div class="arc_card arc_cardontable arc_deck${deck_index} arc_minified" id="arc_cardonstack_${card_id}" style="background-position:-${x}px -${y}px">\
                        </div>';
var jstpl_cardonpenalties = '<div class="arc_card arc_cardontable arc_deck${deck_index}" id="arc_cardonpenalties_${card_id}" style="background-position:-${x}px -${y}px">\
                        </div>';
var jstpl_cardonmyhand = '<div class="arc_card arc_cardontable arc_deck${deck_index}" id="arc_myhand_item_${card_id}" style="background-position:-${x}px -${y}px">\
                        </div>';
var jstpl_cardondraw = '<div class="arc_card arc_turnedbackcardontable">\
                        </div>';
var jstpl_player_board = '\<div id="arc_cp_board_${playerId}">\
                        </div>';
var jstpl_player_board_first_player = '<div id="arc_fpicon_${playerId}" class="arc_fpicon"></div>';
var jstpl_player_board_hand = '\<div id="arc_cp_board_handCardsCount_${playerId}" class="arc_cp_board_handCardsCount">${handCardsCount}&nbsp;:</div><div id="arc_cp_board_hand_${playerId}" class="arc_cp_board_hand">\
                        </div>';
var jstpl_player_board_pile = '\<div id="arc_cp_board_pile_${playerId}" class="arc_cp_board_pile"><div id="arc_cp_board_pileCardsCount_${playerId}" class="arc_cp_board_pileCardsCount">${pileCardsCount}</div>\
                        </div>';
var jstpl_player_board_penalties = '\<div id="arc_cp_board_penalties_${playerId}" class="arc_cp_board_penalties"><div id="arc_cp_board_penaltiesCardsCount_${playerId}" class="arc_cp_board_penaltiesCardsCount">${penaltiesCardsCount}</div>\
                        </div>';
var jstpl_player_board_powers = '\<div id="arc_cp_board_powers_${playerId}" class="arc_cp_board_powers"><span>${OWNED_POWERS}</span>\
                        </div>';
                        

var jstpl_my_stack_in_details = '\<div id="arc_my_stack_in_details_wrapper" class="arc_whiteblock arc_gridbox arc_active_slot">\
                            <h3>${MY_STACK_TITLE}</h3>\
                            <span class="arc_close-btn" onclick="javascript:document.getElementById(\'arc_my_stack_in_details_wrapper\').remove();">&times;</span>\
                            <div id="arc_mystackindetails"></div>\
                        </div>';
var jstpl_my_penalties_in_details = '\<div id="arc_my_penalties_in_details_wrapper" class="arc_whiteblock arc_gridbox arc_active_slot">\
                            <h3>${MY_PENALTIES_TITLE}</h3>\
                            <span class="arc_close-btn" onclick="javascript:document.getElementById(\'arc_my_penalties_in_details_wrapper\').remove();">&times;</span>\
                            <div id="arc_mypenaltiesindetails"></div>\
                        </div>';

var jstpl_currentplayerpenaltiesplaceholder = '\<div id="arc_playerpenaltiesplaceholder_${player_id}" class="arc_card arc_placeholder"></div>';
var jstpl_playerpenaltiesplaceholder = '\<div id="arc_playerpenaltiesplaceholder_${player_id}" class="arc_playerpenalties arc_minifiedcard arc_placeholder"></div>';
var jstpl_currentplayerstackplaceholder = '\<div id="arc_playerstackplaceholder_${player_id}" class="arc_card arc_placeholder"></div>';
var jstpl_playerstackplaceholder = '\<div id="arc_playerstackplaceholder_${player_id}" class="arc_playerstack arc_minifiedcard arc_placeholder"></div>';

var jstpl_scoring_stack = '\<div id="arc_scoring_stack_wrapper_current_player" class="arc_scoring_stack_wrapper arc_whiteblock arc_gridbox">\
                            <h3 id="arc_scoring_stack_title_current_player">${SCORING_STACK_TITLE}</h3>\
                            <div id="arc_myStackSeries_current_player" class="arc_myStackSeries"></div>\
                            <div id="arc_spectatorInfo">{SCORING_SPECTATOR_MESSAGE}</div>\
                        </div>';
var jstpl_opponent_scoring_stack = '\<div id="arc_scoring_stack_wrapper_${player_id}" class="arc_scoring_stack_wrapper arc_whiteblock arc_gridbox">\
                            <h3 id="arc_scoring_stack_title_${player_id}" style="color:#${player_color}">${SCORING_STACK_TITLE}&nbsp;${player_name}</h3>\
                            <div id="arc_myStackSeries_${player_id}" class="arc_myStackSeries"></div>\
                        </div>';
var jstpl_scoring_board = '\<div id="arc_scoring_board_wrapper" class="arc_whiteblock arc_gridbox">\
                            <h3>${FINAL_SCORING_TITLE}</h3>\
                            <div id="arc_myScoreInfos"></div>\
                        </div>';
                        
//<div id="myStackInfos">${playedAnimals}<br\>${animalSeries}</div>\
var jstpl_scoring_serie = '\<div id="arc_mystackinscoring_${player_id}_${seriesCounter}" class="arc_mystackinscoring"></div>';

var jstpl_permanent_message = '\<div id="arc_permanent_message_wrap" class="arc_whiteblock arc_gridbox arc_message">\
                                <h3 class="arc_pulse">${message}</h3>\
                            </div>';
var jstpl_power_active_message = '\<div id="arc_power_active_message_wrap" class="arc_whiteblock arc_gridbox arc_message">\
                                <h3 class="arc_pulse">${message}</h3>\
                            </div>';

var jstpl_scoring_different_animal_types = '\<div id="arc_different_animal_types_wrap" class="arc_whiteblock arc_gridbox">\
                                            <h3 id="arc_different_animal_types_title">${DIFFERENT_ANIMAL_TYPES_TITLE}</h3>\
                                            <div id="arc_different_animal_types">\
                                            </div>\
                                        </div>';
</script>  

{OVERALL_GAME_FOOTER}
