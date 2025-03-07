/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * Arctic implementation : © Gilles Verriez <gilles.vginc@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * arctic.js
 *
 * Arctic user interface script
 * 
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"//,
    //"ebg/expandablesection"
],
function (dojo, declare) {
    return declare("bgagame.arctic", ebg.core.gamegui, {
        constructor: function(){
            //console.log('arctic constructor');
              
            // Here, you can init the global variables of your user interface
            // Example:
            // this.myGlobalValue = 0;

        },
        
        /*
            setup:
            
            This method must set up the game user interface according to current game situation specified
            in parameters.
            
            The method is called each time the game interface is displayed to a player, ie:
            _ when the game starts
            _ when a player refreshes the game page (F5)
            
            "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
        */
        
        setup: function( gamedatas )
        {
            //console.log( "Starting game setup" );
            
            this.cardWidth = 156;
            this.cardHeight = 218;
            this.cardBackgroundWidth = 780;
            this.cardBackgroundHeight = 1308;
            this.animalTypesBackgroundWidth = 744;
            this.animalTypesBackgroundHeight = 6236;
            this.pickBackgroundWidth = 468;
            this.pickBackgroundHeight = 218;
            this.totemWidth = 76;
            this.totemHeight = 114;
            this.totemBackgroundWidth = 76;
            this.totemBackgroundHeight = 684;
            this.tokenWidth = 45;
            this.tokenHeight = 49;
            this.tokenBackgroundWidth = 45;
            this.tokenBackgroundHeight = 294;
            this.powerWidth = 157;
            this.powerHeight = 78;
            this.powerBackgroundWidth = 314;
            this.powerBackgroundHeight = 468;
            this.onPickFromDeckSelectionChangedHandler = null;
            this.onMyPenaltiesSelectionChangedHandler = null;
            this.onMyPenaltiesInDetailsSelectionChangedHandler = null;
            this.onPlayersPenaltiesSelectionChangedHandler = [];
            this.savedPageMainTitle = "";
            this.savedPageGeneralActions = "";
            this.uniqueSelectedHandCardId = null;
            this.cardsonstackData = [];
            this.lastTurnInfoDisplayed = false;
            this.finalDrawPileInfoDisplayed = false;
            this.needScoringValidationForCurrentPlayer = false;
            this.activePowersAnimals = [];
            this.bubbleTimeOut = null;
            
            this.currentTimerRef = null;
            this.isLongPress = false;

            this.playersCount = 0;
            // Setting up player boards
            for( let player_id in gamedatas.players )
            {
                let player = gamedatas.players[player_id];
                //console.log("player_id : "+player_id);
                this.playersCount++;
                // TODO: Setting up players boards if needed
            }
            
            // TODO: Set up your game interface here, according to "gamedatas"
            
            //this.expanded = new ebg.expandablesection();
            //this.expanded.create(this, "my_expandable");
            //this.expanded.expand();   // show
            //this.expanded.collapse(); // hide
            //this.expanded.toggle();   // switch show/hide

            // Different Animal Types (for scoring)
            this.animalsStock = null;

            // Draw
            this.pick = new ebg.stock(); // new stock object for draw
            this.pick.create( this, $('arc_pick'), this.cardWidth, this.cardHeight );
            this.pick.image_items_per_row = 3; // 5 images per row in the deck
            this.pick.container_div.width = "156px"; // enought just for 1 card
            this.pick.autowidth = false; // this is required so it obeys the width set above
            this.pick.use_vertical_overlap_as_offset = false; // this is to use normal vertical_overlap
            this.pick.vertical_overlap = 100; // overlap
            this.pick.horizontal_overlap  = -1; // current bug in stock - this is needed to enable z-index on overlapping items
            this.pick.item_margin = 0; // has to be 0 if using overlap
            this.pick.setSelectionAppearance("class"); // there will be an extra stockitem_selected css class added to the element when it is selected, no border adding
            this.pick.updateDisplay(); // re-layout

            

            // Player hand
            this.playerHand = new ebg.stock(); // new stock object for hand
            this.playerHand.create( this, $('arc_myhand'), this.cardWidth, this.cardHeight );
            this.playerHand.image_items_per_row = 5; // 5 images per row in the deck
            this.playerHand.use_vertical_overlap_as_offset = true;
            this.playerHand.horizontal_overlap  = 0; // current bug in stock - this is needed to enable z-index on overlapping items
            this.playerHand.setSelectionMode(1); // a maximum of one item can be selected by the player at a time.
            this.playerHand.updateDisplay(); // re-layout


            // River
            this.river = new ebg.stock(); // new stock object for hand
            this.river.create( this, $('arc_river'), this.cardWidth, this.cardHeight );
            this.river.image_items_per_row = 5; // 5 images per row in the deck
            this.river.setSelectionMode(1); // a maximum of one item can be selected by the player at a time.


            // Player stack
            this.stack = new ebg.stock(); // new stock object for hand
            this.stack.create( this, $('arc_mystack'), this.cardWidth, this.cardHeight );
            this.stack.image_items_per_row = 5; // 5 images per row in the deck
            this.stack.container_div.width = "156px"; // enought just for 1 card
            this.stack.autowidth = false; // this is required so it obeys the width set above
            this.stack.use_vertical_overlap_as_offset = false; // this is to use normal vertical_overlap
            this.stack.vertical_overlap = 100; // overlap
            this.stack.horizontal_overlap  = -1; // current bug in stock - this is needed to enable z-index on overlapping items
            this.stack.item_margin = 0; // has to be 0 if using overlap
            this.stack.setSelectionAppearance("class"); // there will be an extra stockitem_selected css class added to the element when it is selected, no border adding
            this.stack.updateDisplay(); // re-layout

            // Player stack in details
            this.mystackindetails = new ebg.stock(); // new stock object for hand
            this.mystackindetails.create( this, $('arc_mystackindetails'), this.cardWidth, this.cardHeight );
            this.mystackindetails.image_items_per_row = 5; // 5 images per row in the deck
            this.mystackindetails.container_div.width = "156px"; // enought just for 1 card
            this.mystackindetails.autowidth = false; // this is required so it obeys the width set above
            this.mystackindetails.use_vertical_overlap_as_offset = true; // this is to use normal vertical_overlap
            this.mystackindetails.vertical_overlap = 0; // overlap
            this.mystackindetails.horizontal_overlap  = 23; // current bug in stock - this is needed to enable z-index on overlapping items
            this.mystackindetails.item_margin = 0; // has to be 0 if using overlap
            this.mystackindetails.updateDisplay(); // re-layout

            // Player stack in scoring
            this.mystackinscoring = {};
            /*this.mystackinscoring = new ebg.stock(); // new stock object for hand
            this.mystackinscoring.create( this, $('arc_mystackinscoring'), this.cardWidth, this.cardHeight );
            this.mystackinscoring.image_items_per_row = 5; // 5 images per row in the deck
            this.mystackinscoring.container_div.width = "156px"; // enought just for 1 card
            this.mystackinscoring.autowidth = false; // this is required so it obeys the width set above
            this.mystackinscoring.use_vertical_overlap_as_offset = true; // this is to use normal vertical_overlap
            this.mystackinscoring.vertical_overlap = 0; // overlap
            this.mystackinscoring.horizontal_overlap  = 40; // current bug in stock - this is needed to enable z-index on overlapping items
            this.mystackinscoring.item_margin = 0; // has to be 0 if using overlap
            this.mystackinscoring.updateDisplay(); // re-layout*/

            // Player penalties
            this.penalties = new ebg.stock(); // new stock object for hand
            this.penalties.create( this, $('arc_mypenalties'), this.cardWidth, this.cardHeight );
            this.penalties.image_items_per_row = 5; // 5 images per row in the deck
            this.penalties.container_div.width = "156px"; // enought just for 1 card
            this.penalties.autowidth = false; // this is required so it obeys the width set above
            this.penalties.use_vertical_overlap_as_offset = false; // this is to use normal vertical_overlap
            this.penalties.vertical_overlap = 100; // overlap
            this.penalties.horizontal_overlap  = -1; // current bug in stock - this is needed to enable z-index on overlapping items
            this.penalties.item_margin = 0; // has to be 0 if using overlap
            this.penalties.extraClasses = 'arc_turnedbackcardontable';// doesn't show the face of the penalties
            this.penalties.setSelectionAppearance("class"); // there will be an extra stockitem_selected css class added to the element when it is selected, no border adding
            this.penalties.updateDisplay(); // re-layout

            // Player penalties in details
            this.mypenaltiesindetails = new ebg.stock(); // new stock object for hand
            this.mypenaltiesindetails.create( this, $('arc_mypenaltiesindetails'), this.cardWidth, this.cardHeight );
            this.mypenaltiesindetails.image_items_per_row = 5; // 5 images per row in the deck
            this.mypenaltiesindetails.container_div.width = "156px"; // enought just for 1 card
            this.mypenaltiesindetails.autowidth = false; // this is required so it obeys the width set above
            this.mypenaltiesindetails.use_vertical_overlap_as_offset = true; // this is to use normal vertical_overlap
            this.mypenaltiesindetails.vertical_overlap = 0; // overlap
            this.mypenaltiesindetails.horizontal_overlap  = 45; // current bug in stock - this is needed to enable z-index on overlapping items
            this.mypenaltiesindetails.item_margin = 0; // has to be 0 if using overlap
            this.mypenaltiesindetails.updateDisplay(); // re-layout
            
            // Player totem
            this.playerTotem = new ebg.stock(); // new stock object for hand
            this.playerTotem.create( this, $('arc_totem'), this.totemWidth, this.totemHeight );
            this.playerTotem.image_items_per_row = 1; // 1 image per row in the deck
            this.playerTotem.setSelectionMode(0);

            // Animal tokens 1 (landscape 0)
            this.tokens1 = new ebg.stock(); // new stock object for hand
            this.tokens1.onItemCreate = dojo.hitch( this, 'setupToken' ); 
            this.tokens1.create( this, $('arc_tokenwrap1'), this.tokenWidth, this.tokenHeight );
            this.tokens1.image_items_per_row = 1; // 1 image per row in the deck
            this.addTooltip( 'arc_landscape1_tooltip_zone', _("If your Animal totem token is placed here at the end of the game, you will not score points with it"), '' );
            this.tokens1.setSelectionMode(0);
            let markingPointsLandscapeDesc = _("If your Animal totem token is placed here at the end of the game, you will score ${points} point(s)");
            // Animal tokens 2 (landscape 1)
            this.tokens2 = new ebg.stock(); // new stock object for hand
            this.tokens2.onItemCreate = dojo.hitch( this, 'setupToken' ); 
            this.tokens2.create( this, $('arc_tokenwrap2'), this.tokenWidth, this.tokenHeight );
            this.tokens2.image_items_per_row = 1; // 1 image per row in the deck
            this.addTooltip( 'arc_landscape2_tooltip_zone',  dojo.string.substitute( markingPointsLandscapeDesc, {points: 1} ), '' );
            this.tokens2.setSelectionMode(0);
            // Animal tokens 3 (landscape 3)
            this.tokens3 = new ebg.stock(); // new stock object for hand
            this.tokens3.onItemCreate = dojo.hitch( this, 'setupToken' ); 
            this.tokens3.create( this, $('arc_tokenwrap3'), this.tokenWidth, this.tokenHeight );
            this.tokens3.image_items_per_row = 1; // 1 image per row in the deck
            this.addTooltip( 'arc_landscape3_tooltip_zone', dojo.string.substitute( markingPointsLandscapeDesc, {points: 3} ), '' );
            this.tokens3.setSelectionMode(0);
            // Animal tokens 4 (landscape 6)
            this.tokens4 = new ebg.stock(); // new stock object for hand
            this.tokens4.onItemCreate = dojo.hitch( this, 'setupToken' ); 
            this.tokens4.create( this, $('arc_tokenwrap4'), this.tokenWidth, this.tokenHeight );
            this.tokens4.image_items_per_row = 1; // 1 image per row in the deck
            this.addTooltip( 'arc_landscape4_tooltip_zone', dojo.string.substitute( markingPointsLandscapeDesc, {points: 6} ), '' );
            this.tokens4.setSelectionMode(0);
            // Animal tokens 5 (landscape 10)
            this.tokens5 = new ebg.stock(); // new stock object for hand
            this.tokens5.onItemCreate = dojo.hitch( this, 'setupToken' ); 
            this.tokens5.create( this, $('arc_tokenwrap5'), this.tokenWidth, this.tokenHeight );
            this.tokens5.image_items_per_row = 1; // 1 image per row in the deck
            this.addTooltip( 'arc_landscape5_tooltip_zone', dojo.string.substitute( markingPointsLandscapeDesc, {points: 10} ), '' );
            this.tokens5.setSelectionMode(0);
            // Animal tokens 6 (landscape 15)
            this.tokens6 = new ebg.stock(); // new stock object for hand
            this.tokens6.onItemCreate = dojo.hitch( this, 'setupToken' ); 
            this.tokens6.create( this, $('arc_tokenwrap6'), this.tokenWidth, this.tokenHeight );
            this.tokens6.image_items_per_row = 1; // 1 image per row in the deck
            this.addTooltip( 'arc_landscape6_tooltip_zone', dojo.string.substitute( markingPointsLandscapeDesc, {points: 15} ), '' );
            this.tokens6.setSelectionMode(0);

            

            // Powers
            this.powers = new ebg.stock(); // new stock object for hand
            this.powers.create( this, $('arc_powers'), this.powerWidth, this.powerHeight );
            this.powers.image_items_per_row = 2; // 2 images per row in the deck
            this.powers.extraClasses = 'arc_unavailable';// apply unavailable class to rpevent from thinking the current player owns the powers
            this.powers.setSelectionMode(0);

            // Current player owned powers
            this.currentPlayerPowers = new ebg.stock(); // new stock object for hand
            this.currentPlayerPowers.create( this, $('arc_currentPlayerPowers'), this.powerWidth, this.powerHeight );
            this.currentPlayerPowers.image_items_per_row = 2; // 2 images per row in the deck
            this.currentPlayerPowers.setSelectionMode(0);

            // Current player unavailable powers
            this.unavailablePowers = new ebg.stock(); // new stock object for hand
            this.unavailablePowers.create( this, $('arc_unavailablePowers'), this.powerWidth, this.powerHeight );
            this.unavailablePowers.image_items_per_row = 2; // 2 images per row in the deck
            this.unavailablePowers.extraClasses = 'arc_unavailable';
            this.unavailablePowers.setSelectionMode(0);
            

            // Setting up game areas tooltips
            this.addTooltip( "arc_players_title", _("Players"), '' );
            this.addTooltip( "arc_powers_title", _("Powers"), '' );
            this.addTooltip( "arc_totem_title", _("My Totem"), '' );
            this.addTooltip( "arc_landscapes_title", _("Landscape"), '' );
            this.addTooltip( "arc_pick_title", _("Draw pile"), '' );
            this.addTooltip( "arc_river_title", _("River"), '' );
            this.addTooltip( "arc_mypenalties_title", _("My Penalty zone"), '' );
            this.addTooltip( "arc_mystack_title", _("My pile"), '' );
            this.addTooltip( "arc_myhand_title", _("My hand"), '' );

            // Setting up player names tooltips
            for( let player_id in gamedatas.players )
            {
                let player = gamedatas.players[player_id];
                if (player_id != this.player_id) {
                    this.addTooltip( "arc_player_"+player_id, player.name, '' );
                }
            }

            // Set mobile viewport for portrait orientation based on gameinfos.inc.php
            this.default_viewport = "width=" + this.interface_min_width;
            this.onScreenWidthChange();
            window.onresize = function(){
                this.onScreenWidthChange;
            };
            if (screen == undefined || screen.orientation == undefined) {
                // iOS 15.5 hack (using appetize.io)
                window.onorientationchange = this.onScreenWidthChange;
            }
            else {
                screen.orientation.addEventListener("change", () => {
                    this.onScreenWidthChange;
                });
            }
              
            // Create cards types:
            //$deckIndex.'_'.$animal_id
            let uniquePickCardPlaceHolderId = 0;
            //console.log("gamedatas.players.length : "+gamedatas.players.length);
            //console.log("playersCount : "+this.playersCount);
            for (let deckIndex = 1; deckIndex <= this.playersCount; deckIndex ++) {
                for (let animalType = 1; animalType <= 6; animalType++) {
                    //let secondaryAnimalToken = animalType;
                    for (let drawCounter = 1; drawCounter <= 5; drawCounter++) { // pickup number ---- temp ----
                        // Build card type id
                        let primaryAnimalToken = animalType;
                        
                        //secondaryAnimalToken = (secondaryAnimalToken % 6) + deckIndex;

                        let secondaryAnimalToken = 0;
                        if ((drawCounter + primaryAnimalToken) >= (primaryAnimalToken + 7 - deckIndex)) {
                            secondaryAnimalToken = 1;
                        }
                        secondaryAnimalToken += (drawCounter + primaryAnimalToken + deckIndex - 1) % 6;
                        if (secondaryAnimalToken == 0) secondaryAnimalToken = 6; // retarget index for bear animal type
                        


                        let stackCounter = 6 - drawCounter;
                        // value example : 1+1+5+1+2
                        let uniqueId = ""+deckIndex+animalType+drawCounter+stackCounter+primaryAnimalToken+secondaryAnimalToken;
                        let card_type_id = this.getCardUniqueType(deckIndex+'_'+animalType, drawCounter);
                        let image_position = this.getCardUniquePosition(animalType, drawCounter);
                        //console.log("unique id : "+uniqueId+" unique type id : "+card_type_id+" image_position : "+image_position);
                        this.playerHand.addItemType(card_type_id, image_position, g_gamethemeurl + 'img/cards'+deckIndex+'.jpg', image_position);
                        this.river.addItemType(card_type_id, image_position, g_gamethemeurl + 'img/cards'+deckIndex+'.jpg', image_position);
                        this.stack.addItemType(card_type_id, image_position, g_gamethemeurl + 'img/cards'+deckIndex+'.jpg', image_position);
                        this.mystackindetails.addItemType(card_type_id, image_position, g_gamethemeurl + 'img/cards'+deckIndex+'.jpg', image_position);
                        //this.mystackinscoring.addItemType(card_type_id, image_position, g_gamethemeurl + 'img/cards'+deckIndex+'.jpg', image_position);
                        this.penalties.addItemType(card_type_id, image_position, g_gamethemeurl + 'img/cards'+deckIndex+'.jpg', image_position);
                        this.mypenaltiesindetails.addItemType(card_type_id, image_position, g_gamethemeurl + 'img/cards'+deckIndex+'.jpg', image_position);
                        this.pick.addItemType(uniquePickCardPlaceHolderId, uniquePickCardPlaceHolderId, g_gamethemeurl + 'img/back.jpg', 0);
                        uniquePickCardPlaceHolderId++;
                    }
                }
            }

            for (let pickId = 0 ; pickId < gamedatas.pickCount ; pickId++) {
                this.pick.addToStockWithId(pickId, pickId);
                let remainingDeckCardsCount = (pickId+1);
                let endGameStockCount = (this.playersCount-1)*5;
                let remainingDeckCardsCountBeforeLastTurn = remainingDeckCardsCount - endGameStockCount;
                if (remainingDeckCardsCountBeforeLastTurn > 0) {
                    let estimatedTurnsCountBeforeLastTurn = Math.round((remainingDeckCardsCountBeforeLastTurn / (this.playersCount*3)));
                    let minEstimatedTurnsCountBeforeLastTurn = estimatedTurnsCountBeforeLastTurn == 0 ? 0 : (estimatedTurnsCountBeforeLastTurn-1);
                    let maxEstimatedTurnsCountBeforeLastTurn = (estimatedTurnsCountBeforeLastTurn+1);
                    let tooltipDesc = dojo.string.substitute( _("${remainingCount} remaining cards in the common draw pile before the last turn. Estimated turns count before the last turn between ${minEstimated} and ${maxEstimated}"), {
                        remainingCount: remainingDeckCardsCountBeforeLastTurn,
                        minEstimated: minEstimatedTurnsCountBeforeLastTurn,
                        maxEstimated: maxEstimatedTurnsCountBeforeLastTurn
                    } );
                    this.addTooltip( 'arc_pick_item_'+pickId, tooltipDesc, '' );
                    $('arc_pick_item_'+pickId).innerHTML = '<span class="arc_pick_item_count">'+remainingDeckCardsCountBeforeLastTurn+"</span>";
                }
                else {
                    let tooltipDesc = dojo.string.substitute( _("${remainingCount} remaining cards in the final draw pile (Reserve)"), {
                        remainingCount: remainingDeckCardsCount
                    } );
                    this.addTooltip( 'arc_pick_item_'+pickId, tooltipDesc, '' );
                    let endMessage = dojo.string.substitute( _("End (${reserveCardsCount})"), {
                        reserveCardsCount : remainingDeckCardsCount
                    } );
                    $('arc_pick_item_'+pickId).innerHTML = '<span class="arc_pick_item_count arc_red_text arc_shadowed_text arc_pulse ">'+endMessage+"</span>";
                }
            }

            //this.playerHand.addToStockWithId( this.getCardUniqueType( 1, 1 ), 11512 );
            //this.playerHand.addToStockWithId( this.getCardUniqueType( 2, 5 ), 12413 );
            
            // Create totems types:
            for (let animalType = 1; animalType <= 6; animalType++) {
                let card_type_id = this.getTotemOrTokenUniqueType(animalType);
                this.playerTotem.addItemType(card_type_id, card_type_id, g_gamethemeurl + 'img/totem_tiles.png', card_type_id);
            }

            // Create tokens :
            for (let animalType = 1; animalType <= 6; animalType++) {
                let card_type_id = this.getTotemOrTokenUniqueType(animalType);
                //console.log("token addItemType : "+ card_type_id);
                this.tokens1.addItemType(card_type_id, card_type_id, g_gamethemeurl + 'img/animal_tokens.png', card_type_id);
                this.tokens2.addItemType(card_type_id, card_type_id, g_gamethemeurl + 'img/animal_tokens.png', card_type_id);
                this.tokens3.addItemType(card_type_id, card_type_id, g_gamethemeurl + 'img/animal_tokens.png', card_type_id);
                this.tokens4.addItemType(card_type_id, card_type_id, g_gamethemeurl + 'img/animal_tokens.png', card_type_id);
                this.tokens5.addItemType(card_type_id, card_type_id, g_gamethemeurl + 'img/animal_tokens.png', card_type_id);
                this.tokens6.addItemType(card_type_id, card_type_id, g_gamethemeurl + 'img/animal_tokens.png', card_type_id);
            }
            this.tokenStock = new Array(this.tokens1, this.tokens2, this.tokens3, this.tokens4, this.tokens5, this.tokens6);
            // Cards in player's hand

            //log gamedata
            //console.log("gamedatas  : "+JSON.stringify(this.gamedatas));
            for ( let i in this.gamedatas.hand) {
                let card = this.gamedatas.hand[i];
                let deckIndexAndAnimalType = card.type;
                let value = card.type_arg;
                //console.log("draftPlayerHand deckIndexAndAnimalType : "+deckIndexAndAnimalType+" | value : "+value+" | card.id : "+card.id + " | uniqueCardType : "+this.getCardUniqueType(deckIndexAndAnimalType, value));
                this.playerHand.addToStockWithId(this.getCardUniqueType(deckIndexAndAnimalType, value), card.id);
                this.addCardDefinitionTooltip(this.playerHand, 'arc_myhand_item_'+card.id, card.id);
                this.manageHandCardsOverlap(this.playerHand.count());
            }

            // Cards played on stack
            //console.log("before reorder cardsonstack");
            //console.log(this.gamedatas.cardsonstack);
            this.gamedatas.cardsonstack = this.gamedatas.cardsonstack.sort( this.compareCardLocationArg );
            //console.log("after reorder cardsonstack");
            //console.log(this.gamedatas.cardsonstack);
            for (let i in this.gamedatas.cardsonstack) {
                let card = this.gamedatas.cardsonstack[i];
                let deckIndexAndAnimalType = card.type;
                let value = card.type_arg;
                let player_id = card.location.split('_')[1];
                let order = card.location_arg;
                let isFlipped = (card.flipped == 1);
                //console.log("playCardOnStack deckIndexAndAnimalType : "+deckIndexAndAnimalType+" | value : "+value+" | card.id : "+card.id);
                this.playCardOnStack(player_id, deckIndexAndAnimalType, value, card.id, false, isFlipped, true);
            }
            this.stack.updateDisplay(); // re-layout
            

            // Cards played on penalties
            this.gamedatas.cardsonpenalties = this.gamedatas.cardsonpenalties.sort( this.compareCardLocationArg );
            for (let i in this.gamedatas.cardsonpenalties) {
                let card = this.gamedatas.cardsonpenalties[i];
                let deckIndexAndAnimalType = card.type;
                let value = card.type_arg;
                let player_id = card.location.split('_')[1];
                let order = card.location_arg;
                //console.log("playCardOnPenalties deckIndexAndAnimalType : "+deckIndexAndAnimalType+" | value : "+value+" | card.id : "+card.id);
                this.playCardOnPenalties(player_id, deckIndexAndAnimalType, value, card.id, undefined, true);
            }
            this.penalties.updateDisplay(); // re-layout

            // Cards in the river
            for (let i in this.gamedatas.river) {
                let card = this.gamedatas.river[i];
                let deckIndexAndAnimalType = card.type;
                let value = card.type_arg;
                let player_id = card.location_arg;
                //console.log("draftRiver deckIndexAndAnimalType : "+deckIndexAndAnimalType+" | value : "+value+" | card.id : "+card.id);
                
                this.river.addToStockWithId(this.getCardUniqueType(deckIndexAndAnimalType, value), card.id);
                this.addCardDefinitionTooltip(this.river, 'arc_river_item_'+card.id, card.id);
            }

            // Totem in player's totem area
            
            for (let i in this.gamedatas.totem) {
                let card = this.gamedatas.totem[i];
                let animalType = card.type;
                let card_type_id = this.getTotemOrTokenUniqueType(animalType);
                let value = card.type_arg;
                //console.log("draftPlayerTotem card_type_id : "+card_type_id+" | value : "+value+" | card.id : "+card.id);
                this.playerTotem.addToStockWithId(card_type_id, card.id);
            }

            // Tokens in the landscape
            for (let i in this.gamedatas.tokens) {
                let token = this.gamedatas.tokens[i];
                let animalType = token.type;
                let card_type_id = this.getTotemOrTokenUniqueType(animalType);
                let value = token.type_arg;
                let location = token.location_arg;
                //console.log("draftTokens card_type_id : "+card_type_id+" | value : "+value+" | token.id : "+token.id + " | location : "+location);
                let currentTokenStock = null;
                switch (location) {
                    case '1':
                        currentTokenStock = this.tokens1;
                        break;
                    case '2':
                        currentTokenStock = this.tokens2;
                        break;
                    case '3':
                        currentTokenStock = this.tokens3;
                        break;
                    case '4':
                        currentTokenStock = this.tokens4;
                        break;
                    case '5':
                        currentTokenStock = this.tokens5;
                        break;
                    case '6':
                        currentTokenStock = this.tokens6;
                        break;
                }
                currentTokenStock.addToStockWithId(card_type_id, token.id);
            }

            // Create powers :
            for (let animalType = 1; animalType <= 6; animalType++) {
                for (let value = 1; value <= 2; value++) { // pickup number ---- temp ----
                    // Build card type id
                    let card_type_id =this.getPowerUniqueType(animalType, value);
                    //console.log("Create powers animalType : "+animalType+" | value : "+value+" | card_type_id : "+card_type_id);
                    this.powers.addItemType(card_type_id, card_type_id, g_gamethemeurl + 'img/powers.jpg', card_type_id);
                }
            }
            // Create current player powers :
            for (let animalType = 1; animalType <= 6; animalType++) {
                for (let value = 1; value <= 2; value++) { // pickup number ---- temp ----
                    // Build card type id
                    let card_type_id =this.getPowerUniqueType(animalType, value);
                    //console.log("Create current player powers animalType : "+animalType+" | value : "+value+" | card_type_id : "+card_type_id);
                    this.currentPlayerPowers.addItemType(card_type_id, card_type_id, g_gamethemeurl + 'img/selected_powers.jpg', card_type_id);
                }
            }
            // Create unavailable powers :
            for (let animalType = 1; animalType <= 6; animalType++) {
                for (let value = 1; value <= 2; value++) { // pickup number ---- temp ----
                    // Build card type id
                    let card_type_id =this.getPowerUniqueType(animalType, value);
                    //console.log("Create unavailable powers animalType : "+animalType+" | value : "+value+" | card_type_id : "+card_type_id);
                    this.unavailablePowers.addItemType(card_type_id, card_type_id, g_gamethemeurl + 'img/powers.jpg', card_type_id);
                }
            }

            // Shows different powers : 
            for (let i in this.gamedatas.powers) {
                let card = this.gamedatas.powers[i];
                let animalType = card.type;
                let value = card.type_arg;
                let owningPlayerId = card.location_arg;
                //console.log("draftPowers animalType : "+animalType+" | value : "+value+" | card.id : "+card.id+" | uniquetype : "+this.getPowerUniqueType(animalType, value)+ " | owningPlayerId : "+owningPlayerId+ "description : "+description);
                if (this.player_id == owningPlayerId ) {
                    this.currentPlayerPowers.addToStockWithId(this.getPowerUniqueType(animalType, value), card.id);
                    this.addPowerToolTip( 'arc_currentPlayerPowers_item_'+card.id, this.getPowerDescription(card.id), owningPlayerId );
                }
                else {
                    let currentPowerIsOwnedByOtherPlayer = false;
                    for ( let player_id in gamedatas.players )
                    {
                        let player = gamedatas.players[player_id];
                        if (player_id == owningPlayerId ) {
                            currentPowerIsOwnedByOtherPlayer = true;
                            break;
                        }
                    }
                    if (currentPowerIsOwnedByOtherPlayer) {
                        this.unavailablePowers.addToStockWithId(this.getPowerUniqueType(animalType, value), card.id);
                        // use weight to share to power player owner
                        this.unavailablePowers.changeItemsWeight( { [this.getPowerUniqueType(animalType, value)]: owningPlayerId } );
                        
                        let playerColorHex = '#'+gamedatas.players[owningPlayerId].color;
                        dojo.style("arc_unavailablePowers_item_"+card.id, {
                            'box-shadow': '7px 7px 7px 0px '+playerColorHex,
                            'border': '1px solid '+playerColorHex 
                        });
                        this.addPowerToolTip( 'arc_unavailablePowers_item_'+card.id, this.getPowerDescription(card.id), owningPlayerId );
                        
                    }
                    else {
                        this.powers.addToStockWithId(this.getPowerUniqueType(animalType, value), card.id);
                        this.addPowerToolTip( 'arc_powers_item_'+card.id, this.getPowerDescription(card.id), null );
                    }
                }
            }
            this.managePowerBubblesDisplayOverriding();
            
            this.onMyHandSelectionChangedHandler = dojo.connect( this.playerHand, 'onChangeSelection', this, dojo.hitch(this, "onPlayerHandSelectionChanged", {changeCardFromRiverPowerActive:false,playCardUnderStackPowerActive:false,playCardFlippedPowerActive:false}) );
            this.onRiverSelectionChangedHandler = dojo.connect( this.river, 'onChangeSelection', this, dojo.hitch(this, "onRiverSelectionChanged", false) );
            this.onMyStackSelectionChangedHandler = dojo.connect( this.stack, 'onChangeSelection', this, dojo.hitch(this, "onMyStackSelectionChanged", false) );
            this.onMyPenaltiesSelectionChangedHandler = dojo.connect( this.penalties, 'onChangeSelection', this, dojo.hitch(this, "onMyPenaltiesSelectionChanged", false) );

            for (tokenStockIndex in this.tokenStock) {
                //dojo.connect( this.tokenStock[tokenStockIndex], 'onChangeSelection', this, 'onTokenSelectionChanged' );
            }
            
            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();

            // Setting up player boards
            this.opponentHands = [];
            let uniqueOpponentHandCardPlaceHolderId = 0;
            for (let player_id in gamedatas.players )
            {
                // Setting up player board
                let player_board_div = $('player_board_'+player_id);
                dojo.place( this.format_block('jstpl_player_board', {playerId : player_id} ), player_board_div );
                let player_board_cp_div = $('arc_cp_board_'+player_id);
                if (gamedatas.firstPlayerId == player_id) {
                    // add first player token if needed
                    dojo.place( this.format_block('jstpl_player_board_first_player', {playerId : player_id} ), player_board_cp_div );
                    this.addTooltip( 'arc_fpicon_'+player_id, _("First player"), '' );
                }
                
                // Setting up opponents hand infos
                if (player_id != this.player_id) {
                    let handCardsCount = 0;
                    for (let opponentsHandIndex in gamedatas.opponentshand ) {
                        //console.log(gamedatas.opponentshand[opponentsHandIndex]);
                        if (gamedatas.opponentshand[opponentsHandIndex].playerId == player_id) {
                            handCardsCount = gamedatas.opponentshand[opponentsHandIndex].handCardsCount;
                            break;
                        }
                    }
                    dojo.place(this.format_block('jstpl_player_board_hand', {playerId : player_id, handCardsCount : handCardsCount}), 'arc_cp_board_'+player_id);
                    
                    let player_board_cp_hand_div = $('arc_cp_board_hand_'+player_id);
                    let currentOpponentHand = new ebg.stock(); // new stock object for draw
                    this.opponentHands.push({playerId : player_id, hand : currentOpponentHand});
                    currentOpponentHand.create( this, player_board_cp_hand_div, this.cardWidth, this.cardHeight );
                    currentOpponentHand.image_items_per_row = 3; // 5 images per row in the deck
                    currentOpponentHand.container_div.width = "156px"; // enought just for 1 card
                    currentOpponentHand.autowidth = false; // this is required so it obeys the width set above
                    currentOpponentHand.use_vertical_overlap_as_offset = false; // this is to use normal vertical_overlap
                    currentOpponentHand.vertical_overlap = 0; // overlap
                    currentOpponentHand.horizontal_overlap  = 23; // current bug in stock - this is needed to enable z-index on overlapping items
                    currentOpponentHand.item_margin = 0; // has to be 0 if using overlap
                    currentOpponentHand.setSelectionMode(0);
                    currentOpponentHand.addItemType(uniqueOpponentHandCardPlaceHolderId, uniqueOpponentHandCardPlaceHolderId, g_gamethemeurl + 'img/back.jpg', 0);
                    let ratio = 0.2;
                    currentOpponentHand.resizeItems( this.cardWidth*ratio, this.cardHeight*ratio, this.pickBackgroundWidth*ratio, this.pickBackgroundHeight*ratio );
                    currentOpponentHand.updateDisplay(); // re-layout
                    
                    for (let handCardId = 0 ; handCardId < handCardsCount ; handCardId++) {
                        this.addCardToOpponentPlayerHand(player_id, currentOpponentHand);
                    }
                    this.updateOpponentPlayerHandCountAndTooltip(player_id, currentOpponentHand);
                }
                else {
                    // current player hand in player board
                    let handCardsCount = this.playerHand.getAllItems().length;
                    dojo.place(this.format_block('jstpl_player_board_hand', {playerId : player_id, handCardsCount : handCardsCount}), 'arc_cp_board_'+player_id);

                    
                    let player_board_cp_hand_div = $('arc_cp_board_hand_'+player_id);
                    this.currentPlayerMinifiedHand = new ebg.stock(); // new stock object for draw
                    this.currentPlayerMinifiedHand.create( this, player_board_cp_hand_div, this.cardWidth, this.cardHeight );
                    this.currentPlayerMinifiedHand.image_items_per_row = 3; // 5 images per row in the deck
                    this.currentPlayerMinifiedHand.container_div.width = "156px"; // enought just for 1 card
                    this.currentPlayerMinifiedHand.autowidth = false; // this is required so it obeys the width set above
                    this.currentPlayerMinifiedHand.use_vertical_overlap_as_offset = false; // this is to use normal vertical_overlap
                    this.currentPlayerMinifiedHand.vertical_overlap = 0; // overlap
                    this.currentPlayerMinifiedHand.horizontal_overlap  = 23; // current bug in stock - this is needed to enable z-index on overlapping items
                    this.currentPlayerMinifiedHand.item_margin = 0; // has to be 0 if using overlap
                    this.currentPlayerMinifiedHand.setSelectionMode(0);
                    this.currentPlayerMinifiedHand.addItemType(uniqueOpponentHandCardPlaceHolderId, uniqueOpponentHandCardPlaceHolderId, g_gamethemeurl + 'img/back.jpg', 0);
                    let ratio = 0.2;
                    this.currentPlayerMinifiedHand.resizeItems( this.cardWidth*ratio, this.cardHeight*ratio, this.pickBackgroundWidth*ratio, this.pickBackgroundHeight*ratio );
                    this.currentPlayerMinifiedHand.updateDisplay(); // re-layout
                    
                    for (let handCardId = 0 ; handCardId < handCardsCount ; handCardId++) {
                        this.addCardToOpponentPlayerHand(player_id, this.currentPlayerMinifiedHand);
                    }
                    this.updateOpponentPlayerHandCountAndTooltip(player_id, this.currentPlayerMinifiedHand);
                }
                
                let currentPlayerPenaltiesCardsCount = 0;
                for (let i in this.gamedatas.cardsonpenalties) {
                    let penaltiesPlayerId = this.gamedatas.cardsonpenalties[i].location.split('_')[1];
                    if (player_id == penaltiesPlayerId) {
                        currentPlayerPenaltiesCardsCount++;
                    }
                }
                dojo.place(this.format_block('jstpl_player_board_penalties', {playerId : player_id, penaltiesCardsCount : currentPlayerPenaltiesCardsCount}), 'arc_cp_board_'+player_id);
                this.updateOpponentPlayerPenaltiesCountAndTooltip(player_id, currentPlayerPenaltiesCardsCount);
                let currentPlayerPileCardsCount = 0;
                for (let i in this.gamedatas.cardsonstack) {
                    let penaltiesPlayerId = this.gamedatas.cardsonstack[i].location.split('_')[1];
                    if (player_id == penaltiesPlayerId) {
                        currentPlayerPileCardsCount++;
                    }
                }
                dojo.place(this.format_block('jstpl_player_board_pile', {playerId : player_id, pileCardsCount : currentPlayerPileCardsCount}), 'arc_cp_board_'+player_id);
                this.updateOpponentPlayerPileCountAndTooltip(player_id, currentPlayerPileCardsCount);
                let ownedPowersTitle = _("Owned powers :");
                dojo.place(this.format_block('jstpl_player_board_powers', {playerId : player_id, OWNED_POWERS : ownedPowersTitle}), 'arc_cp_board_'+player_id);
            }
            this.updatePlayerBoardPowersPossessions();
            window.addEventListener("click", (e) => this.removeDetailsEventWrapper(e, this));

            
            window.addEventListener("mousedown", (e) => this.handleOnMouseDown(e, this));
            window.addEventListener("mouseup", (e) => this.handleOnMouseUp(e, this));
            window.addEventListener("touchstart", (e) => this.handleOnTouchStart(e, this));
            window.addEventListener("touchend", (e) => this.handleOnTouchEnd(e, this));
            //window.addEventListener("click", (e) => this.handleOnClick(e, this));

           /* window.addEventListener('click', function(e){   
                if (document.getElementById('arc_my_stack_in_details_wrapper') !== null && !document.getElementById('arc_my_stack_in_details_wrapper').contains(e.target)) {
                    document.getElementById('arc_my_stack_in_details_wrapper').remove();
                    this.stack.unselectAll();
                    //console.log("arc_my_stack_in_details_wrapper closed by outside click");
                }
                if (document.getElementById('arc_my_penalties_in_details_wrapper') !== null && !document.getElementById('arc_my_penalties_in_details_wrapper').contains(e.target)) {
                    document.getElementById('arc_my_penalties_in_details_wrapper').remove();
                    this.penalties.unselectAll();
                    //console.log("arc_my_penalties_in_details_wrapper closed by outside click");
                }
            });*/
            //console.log( "Ending game setup" );
        },
        unselectAllItems() {
            this.river.unselectAll();
            this.playerHand.unselectAll();
            this.pick.unselectAll();
            this.stack.unselectAll();
            this.penalties.unselectAll();
        },
        /*handleOnClick(e, self) {
            //console.log('handleOnClick');
            if ( this.isLongPress ) {
              //console.log('Is long press - not continuing.');
              return;
            }
            e.target.click();
        },*/
        handleOnMouseDown(e, self) {
            //console.log('handleOnMouseDown target : '+e.target.id);
            this.isLongPress = false;
            this.currentTimerRef = setTimeout(() => {
                //console.log('handleOnMouseDown longpress target : '+e.target.id);
                this.isLongPress = true;
                if (this.tooltips.hasOwnProperty(e.target.id) && this.tooltips[e.target.id].state !== 'SHOWING' ) {
                    this.tooltips[e.target.id].open(e.target.id);
                }
            }, 1000);
        },
        handleOnMouseUp(e, self) {
            //console.log('handleOnMouseUp');
            clearTimeout(this.currentTimerRef);
            if (this.tooltips.hasOwnProperty(e.target.id) && this.tooltips[e.target.id].state == 'SHOWING' ) {
                this.tooltips[e.target.id].close();
            }
        },
        handleOnTouchStart(e, self) {
            //console.log('handleOnTouchStart');
            this.isLongPress = false;
            this.currentTimerRef = setTimeout(() => {
                //console.log('handleOnTouchStart longpress target : '+e.target.id);
                this.isLongPress = true;
                if (this.tooltips.hasOwnProperty(e.target.id) && this.tooltips[e.target.id].state !== 'SHOWING' ) {
                    this.tooltips[e.target.id].open(e.target.id);
                }
            }, 1000);
        },
        handleOnTouchEnd(e, self) {
            //console.log('handleOnTouchEnd');
            clearTimeout(this.currentTimerRef);
            if (this.tooltips.hasOwnProperty(e.target.id) && this.tooltips[e.target.id].state == 'SHOWING' ) {
                this.tooltips[e.target.id].close();
            }
        },

        removeDetailsEventWrapper(e, self) {
            if (document.getElementById('arc_my_stack_in_details_wrapper') !== null && !document.getElementById('arc_my_stack_in_details_wrapper').contains(e.target)) {
                document.getElementById('arc_my_stack_in_details_wrapper').remove();
                //console.log("arc_my_stack_in_details_wrapper closed by outside click");
            }
            if (document.getElementById('arc_my_penalties_in_details_wrapper') !== null && !document.getElementById('arc_my_penalties_in_details_wrapper').contains(e.target)) {
                document.getElementById('arc_my_penalties_in_details_wrapper').remove();
                //console.log("arc_my_penalties_in_details_wrapper closed by outside click");
            }
            self.stack.unselectAll();
            self.penalties.unselectAll();
        },
        ///////////////////////////////////////////////////
        //// Game & client states
        
        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //
        onEnteringState: function( stateName, args )
        {
            this.highlightCurrentPlayer();
            this.removePowerActiveMessage();
            this.stopShowingCardBehind();
            this.deactivateBoardWrappers();

            if (this.onPickFromDeckSelectionChangedHandler != null) {
                dojo.disconnect(this.onPickFromDeckSelectionChangedHandler);
                this.onPickFromDeckSelectionChangedHandler = null;
            }

            if (this.onMyPenaltiesSelectionChangedHandler != null) {
                dojo.disconnect(this.onMyPenaltiesSelectionChangedHandler);
                this.onMyPenaltiesSelectionChangedHandler = null;
            }

            if (this.onMyPenaltiesInDetailsSelectionChangedHandler != null) {
                dojo.disconnect(this.onMyPenaltiesInDetailsSelectionChangedHandler);
                this.onMyPenaltiesInDetailsSelectionChangedHandler = null;
            }
            this.onMyPenaltiesSelectionChangedHandler = dojo.connect( this.penalties, 'onChangeSelection', this, dojo.hitch(this, "onMyPenaltiesSelectionChanged", this.isCurrentPlayerActive() && args.args.hasOwnProperty("givePenaltyPowerActive") && args.args.givePenaltyPowerActive) );

            if (this.onPlayersPenaltiesSelectionChangedHandler.length > 0) {
                for (let handlerIndex in this.onPlayersPenaltiesSelectionChangedHandler) {
                    dojo.disconnect(this.onMyPenaltiesInDetailsSelectionChangedHandler[handlerIndex]);
                }
                this.onMyPenaltiesInDetailsSelectionChangedHandler = [];
            }

            if (this.onMyStackSelectionChangedHandler != null) {
                dojo.disconnect(this.onMyStackSelectionChangedHandler);
                this.onMyStackSelectionChangedHandler = null;
            }
            this.onMyStackSelectionChangedHandler = dojo.connect( this.stack, 'onChangeSelection', this, dojo.hitch(this, "onMyStackSelectionChanged", this.isCurrentPlayerActive() && args.args.hasOwnProperty("getBackCardFromStackPowerActive") && args.args.getBackCardFromStackPowerActive) );
            
            if (this.onMyHandSelectionChangedHandler != null) {
                dojo.disconnect(this.onMyHandSelectionChangedHandler);
                this.onMyHandSelectionChangedHandler = null;
            }
            this.onMyHandSelectionChangedHandler = dojo.connect( this.playerHand, 'onChangeSelection', this, dojo.hitch(this, "onPlayerHandSelectionChanged", 
                {
                    changeCardFromRiverPowerActive : this.isCurrentPlayerActive() && args.args.hasOwnProperty("changeCardFromRiverPowerActive") && args.args.changeCardFromRiverPowerActive,
                    playCardUnderStackPowerActive : this.isCurrentPlayerActive() && args.args.hasOwnProperty("playCardUnderStackPowerActive") && args.args.playCardUnderStackPowerActive,
                    playCardFlippedPowerActive : this.isCurrentPlayerActive() && args.args.hasOwnProperty("playCardFlippedPowerActive") && args.args.playCardFlippedPowerActive,
                }) );

            if (this.onRiverSelectionChangedHandler != null) {
                dojo.disconnect(this.onRiverSelectionChangedHandler);
                this.onRiverSelectionChangedHandler = null;
            }
            this.onRiverSelectionChangedHandler = dojo.connect( this.river, 'onChangeSelection', this, dojo.hitch(this, "onRiverSelectionChanged", this.isCurrentPlayerActive() && args.args.hasOwnProperty("changeCardFromRiverPowerActive") && args.args.changeCardFromRiverPowerActive) );

            //console.log( 'Entering state: '+stateName );
            //this.managePulseOnPowersForCurrentPhase(stateName);
            this.deactivatePulseOnPowers();
            switch( stateName )
            {
            
            /* Example:
            
            case 'myGameState':
            
                // Show some HTML block at this game state
                dojo.style( 'my_html_block_id', 'display', 'block' );
                
                break;
            */
                case 'playerTurn':
                    if (args.args.hasOwnProperty("endGameStock") && args.args.endGameStock && !this.finalDrawPileInfoDisplayed) {
                        this.showPermanentMessage(_("The final draw pile has been created using the cards from the Reserve. Once the first player plays, it will mark the last turn of the game"), "info");
                        this.finalDrawPileInfoDisplayed = true;
                    }
                    if( this.isCurrentPlayerActive() ) {
                        if (args.args.hasOwnProperty("lastTurnOfTheGame") && args.args.lastTurnOfTheGame && !this.lastTurnInfoDisplayed) {
                            this.showPermanentMessage(_("This is your last turn, you won't be able to draw cards anymore."));
                            this.lastTurnInfoDisplayed = true;
                        }

                        if (args.args.hasOwnProperty("getBackCardFromStackPowerActive") && args.args.getBackCardFromStackPowerActive) {
                            // allow to check wich card will be on top if get back action used
                            // allow to do a get back action (with card selection)
                            // show a button to get back (without card selection)
                            this.addActionButtonForPlayersAndSpectators('btngetBackCardFromStack', _("Use this power ")+this.getAnimalIcon("puffin")+_(" Take your visible Animal card back into your hand"), 'onGetBackCardFromStack');
                            this.onMyStackSelectionChanged(args.args.getBackCardFromStackPowerActive);
                                this.addPowerActiveAnimal("puffin");
                        }
                        if (args.args.hasOwnProperty("changeCardFromRiverPowerActive") && args.args.changeCardFromRiverPowerActive) {
                            this.activateBoardWrapper('arc_river');
                            this.addPowerActiveAnimal("puffin");
                            // card selection in hand dont play the card instantly, 
                            // if river card is selected will allow to change card
                            // possible in reverse : card from river is selected so selection of hand card will change it
                            // show button to bypass the power and play a card on stack when hand card is selected
                        }
                        if (args.args.hasOwnProperty("playPlusOrMinusOneCardPowerActive") && args.args.playPlusOrMinusOneCardPowerActive) {
                            if (args.args.hasOwnProperty("cantStopPlayingCardExplain") && args.args.cantStopPlayingCardExplain == 1) {
                                this.showMessage(_("You can't use this power now ")+this.getAnimalIcon("moose")+_(" A visible Animal card must be on top of your personnal pile"), "info");
                            }
                            else {
                                let powerUseMessage = _("Use this power ");
                                if (args.args.currentStackCount == args.args.maxStackCount) {
                                    powerUseMessage = _("Do not use this power ");
                                }
                                $('pagemaintitletext').innerHTML += ".&nbsp;"+_("You can keep placing cards or...");
                                this.addActionButtonForPlayersAndSpectators('btnEndPlayCardOnStack', powerUseMessage+this.getAnimalIcon("moose")+_(" Stop placing cards on your personal pile"), 'onEndPlayCardOnStack');
                                this.addPowerActiveAnimal("moose");
                            }
                        }
                        if (args.args.hasOwnProperty("playCardUnderStackPowerActive") && args.args.playCardUnderStackPowerActive) {
                            this.addPowerActiveAnimal("fox");
                        }
                        if (args.args.hasOwnProperty("playCardFlippedPowerActive") && args.args.playCardFlippedPowerActive) {
                            if (args.args.hasOwnProperty("cantPlayCardFlippedExplain") && args.args.cantPlayCardFlippedExplain == 1) {
                                this.showMessage(_("You can't use this power now ")+this.getAnimalIcon("fox")+_(" A visible Animal card must be on top of your personnal pile"), "info");
                            }
                            else {
                                this.addPowerActiveAnimal("fox");
                            }
                        }
                        this.activateBoardWrapper('arc_mystack');
                        this.activateBoardWrapper('arc_myhand');
                        //this.activateBoardWrapper('arc_powers');
                    }
                    else {
                        if (args.args.hasOwnProperty("lastTurnOfTheGame") && args.args.lastTurnOfTheGame) {
                            this.showPermanentMessage(_("This is the last turn of the game"));
                        }
                        if (args.args.hasOwnProperty("changeCardFromRiverPowerActive") && args.args.changeCardFromRiverPowerActive) {
                            this.activateBoardWrapper('arc_river');
                        }
                        this.activateBoardWrapper('arc_players');
                        //this.activateBoardWrapper('arc_powers');
                    }
                    break;
                case 'moveTokens':
                    if( this.isCurrentPlayerActive() ) {
                        this.activateBoardWrapper('arc_mystack');
                        this.activateBoardWrapper('arc_totem');
                        this.activateBoardWrapper('arc_landscapes');
                        if (args.args.hasOwnProperty("moveTokensPowerApplied") && args.args.moveTokensPowerApplied == "1") {
                            //console.log("moveTokensPowerApplied");
                            //this.activateBoardWrapper('arc_powers');
                            this.highlightTokensToMove(args.args.moveFirstTokenPowerActive, args.args.moveSecondTokenPowerActive); 
                            this.addPowerActiveAnimal("walrus");
                        }
                        else {
                            //console.log("!moveTokensPowerApplied");
                            //console.log(args);
                            this.highlightTokensToMove(false, false);
                        }
                    }
                    else {
                        if (args.args.hasOwnProperty("moveTokensPowerApplied") && args.args.moveTokensPowerApplied == "1") {
                            //console.log("moveTokensPowerApplied");
                            //this.activateBoardWrapper('arc_powers');
                        }
                        else {
                            //console.log("!moveTokensPowerApplied");
                        }
                        this.activateBoardWrapper('arc_players');
                        this.activateBoardWrapper('arc_totem');
                        this.activateBoardWrapper('arc_landscapes');
                    }
                    break;
                case 'pickCard':
                    //console.log(args);
                    if( this.isCurrentPlayerActive() && this.river.count() == 0 && this.pick.count() == 0) {
                        this.addActionButtonForPlayersAndSpectators('btnEndPickCard', _(" Stop drawing cards"), 'onEndPickCard');
                    }
                    this.activateBoardWrapper('arc_river');
                    
                    if (args.args.hasOwnProperty("pickPlusOrMinusOneCardPowerActive") && args.args.pickPlusOrMinusOneCardPowerActive) {
                        //this.activateBoardWrapper('arc_powers');
                        
                        if ( this.isCurrentPlayerActive() ) {
                            
                            let powerUseMessage = _("Use this power ");
                            if (args.args.currentPickCount == args.args.maxPickCount) {
                                powerUseMessage = _("Do not use this power ");
                            }
                            $('pagemaintitletext').innerHTML += ".&nbsp;"+_("You can keep drawing or...");
                            this.addActionButtonForPlayersAndSpectators('btnEndPickCard', powerUseMessage+this.getAnimalIcon("moose")+_(" Stop drawing cards"), 'onEndPickCard');
                            this.addPowerActiveAnimal("moose");
                        }
                    }
                    if (args.args.hasOwnProperty("pickFromDeckPowerActive") && args.args.pickFromDeckPowerActive) {
                        //this.activateBoardWrapper('arc_powers');
                        this.activateBoardWrapper('arc_pick');
                        this.onPickFromDeckSelectionChangedHandler = dojo.connect( this.pick, 'onChangeSelection', this, 'onPickFromDeckSelectionChanged' );
                        if ( this.isCurrentPlayerActive() ) {
                            this.addPowerActiveAnimal("orca");
                        }
                    }
                    if (args.args.hasOwnProperty("pickFromPenaltiesPowerActive") && args.args.pickFromPenaltiesPowerActive) {
                        //this.activateBoardWrapper('arc_powers');
                        this.activateBoardWrapper('arc_mypenalties');
                        this.onMyPenaltiesInDetailsSelectionChangedHandler = dojo.connect( this.mypenaltiesindetails, 'onChangeSelection', this, 'onMyPenaltiesInDetailsSelectionChanged' );
                        if ( this.isCurrentPlayerActive() ) {
                            this.addPowerActiveAnimal("bear");
                        }
                    }
                    if (args.args.hasOwnProperty("givePenaltyPowerActive") && args.args.givePenaltyPowerActive && args.args.hasOwnProperty("givePenaltyPowerUsed") && args.args.givePenaltyPowerUsed == 0) {
                        //this.activateBoardWrapper('arc_powers');
                        this.activateBoardWrapper('arc_mypenalties');
                        this.activateBoardWrapper('arc_players');
                    }
                    if ( this.isCurrentPlayerActive() ){
                        this.activateBoardWrapper('arc_myhand');
                        if (args.args.hasOwnProperty("givePenaltyPowerActive") && args.args.givePenaltyPowerActive && args.args.hasOwnProperty("givePenaltyPowerUsed") && args.args.givePenaltyPowerUsed == 0) {
                            this.addPowerActiveAnimal("bear");
                        }
                    }
                    else {
                        this.activateBoardWrapper('arc_players');
                    }
                    break;
                case 'fillRiver':
                    if( this.isCurrentPlayerActive() ){ 
                        this.activateBoardWrapper('arc_pick');
                        this.activateBoardWrapper('arc_river');
                    }
                    else {
                        this.activateBoardWrapper('arc_players');
                        this.activateBoardWrapper('arc_pick');
                        this.activateBoardWrapper('arc_river');
                    }
                    break;
                case 'discardHandCard':
                    if (args.args.hasOwnProperty("givePenaltyPowerActive") && args.args.givePenaltyPowerActive && args.args.hasOwnProperty("givePenaltyPowerUsed") && args.args.givePenaltyPowerUsed == 0) {
                        //this.activateBoardWrapper('arc_powers');
                    }
                    if( this.isCurrentPlayerActive() ){ 
                        this.activateBoardWrapper('arc_myhand');
                        this.activateBoardWrapper('arc_mypenalties');
                        if (args.args.hasOwnProperty("givePenaltyPowerActive") && args.args.givePenaltyPowerActive && args.args.hasOwnProperty("givePenaltyPowerUsed") && args.args.givePenaltyPowerUsed == 0) {
                            //console.log("givePenaltyPowerActive");
                            this.activateBoardWrapper('arc_players');
                            this.addPowerActiveAnimal("bear");
                        }
                    }
                    else {
                        this.activateBoardWrapper('arc_players');
                    }
                    break;
                case 'givePenaltyCard':
                    //this.activateBoardWrapper('arc_powers');
                    this.activateBoardWrapper('arc_players');
                    if( this.isCurrentPlayerActive() ){
                        this.activateBoardWrapper('arc_mypenalties');
                        this.addActionButtonForPlayersAndSpectators('btnSkipGivePenalty',_("Do not use this power ")+this.getAnimalIcon("bear")+_(" Do not move card from your Penalty zone"), dojo.hitch(this, "onBtnGivePenalty", {playerId:null, cardId:null}));
                    }
                    break;
                case 'scoring':
                    this.removePermanentMessage();
                    
                    dojo.addClass("arc_players_wrap", 'arc_hidden');
                    dojo.addClass("arc_powers_wrap", 'arc_hidden');
                    dojo.addClass("arc_totem_wrap", 'arc_hidden');
                    dojo.addClass("arc_landscapes_wrap", 'arc_hidden');
                    dojo.addClass("arc_pick_wrap", 'arc_hidden');
                    dojo.addClass("arc_river_wrap", 'arc_hidden');
                    dojo.addClass("arc_penaltiesandstack_wrap", 'arc_hidden');
                    dojo.addClass("arc_myhand_wrap", 'arc_hidden');
                    this.showScoringBoard(true);
                    if (!this.needScoringValidationForCurrentPlayer) {
                        // no need to validate scoring
                        $('generalactions').innerHTML = "";
                    }
                    break;
                case 'endGame':
                    this.removePermanentMessage();
                    break;
                case 'gameEnd':
                    this.removePermanentMessage();
                    //console.log(args);
                    /*this.activateBoardWrapper('arc_players');
                    //this.activateBoardWrapper('arc_powers');
                    this.activateBoardWrapper('arc_pick');
                    this.activateBoardWrapper('arc_river');
                    this.activateBoardWrapper('arc_myhand');
                    this.activateBoardWrapper('arc_mystack');*/
                    dojo.addClass("game_play_area", 'arc_finalSituation');

                    dojo.addClass("arc_players_wrap", 'arc_hidden');
                    dojo.addClass("arc_powers_wrap", 'arc_hidden');
                    dojo.query("#arc_totem_wrap").removeClass('arc_hidden');
                    dojo.query("#arc_landscapes_wrap").removeClass('arc_hidden');
                    dojo.addClass("arc_pick_wrap", 'arc_hidden');
                    dojo.addClass("arc_river_wrap", 'arc_hidden');
                    dojo.query("#arc_penaltiesandstack_wrap").removeClass('arc_hidden');
                    dojo.addClass("arc_mystack_wrap", 'arc_hidden');
                    dojo.addClass("arc_myhand_wrap", 'arc_hidden');
                    dojo.destroy("arc_scoring_board_wrapper");

                    for( let player_id in this.gamedatas.players ) {
                        if (this.player_id == player_id) {
                            dojo.destroy("arc_scoring_stack_wrapper_current_player");
                        }
                        else {
                            dojo.destroy("arc_scoring_stack_wrapper_"+player_id);
                        }
                    }
                    /*this.activateBoardWrapper('arc_totem');
                    this.activateBoardWrapper('arc_landscapes');
                    this.activateBoardWrapper('arc_mypenalties');*/

                    this.penalties.vertical_overlap = 0; // overlap
                    this.penalties.horizontal_overlap  = 6; // current bug in stock - this is needed to enable z-index on overlapping items
                    this.penalties.updateDisplay(); // re-layout

                    this.showScoringBoard(false, args.args);
                    dojo.addClass("arc_scoring_board_wrapper", 'arc_finalSituation');

                    break;
                    break;
            }
            
            if( this.isCurrentPlayerActive() ) {
                this.showPowersActivesMessage();
            }
        },

        // onLeavingState: this method is called each time we are leaving a game state.
        //                 You can use this method to perform some user interface changes at this moment.
        //
        onLeavingState: function( stateName )
        {
            //console.log( 'Leaving state: '+stateName );
            
            switch( stateName )
            {
                case 'moveTokens':
                    if( this.isCurrentPlayerActive() ){  this.unhighlightTokens(); }
                    break;
                /* Example:
                
                case 'myGameState':
                
                    // Hide the HTML block we are displaying only during this game state
                    dojo.style( 'my_html_block_id', 'display', 'none' );
                    
                    break;
            */
           
            }               
        }, 

        // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
        //                        action status bar (ie: the HTML links in the status bar).
        //        
        onUpdateActionButtons: function( stateName, args )
        {
            //console.log( 'onUpdateActionButtons: '+stateName );
                      
            //console.log( args );

            if( this.isCurrentPlayerActive() )
            {
                switch( stateName )
                {
                    case 'pickCard':
                        if ((!args.alwaysCompleteRiverPowerActive || (args.alwaysCompleteRiverPowerActive && args.currentPickCount == "0")) && (args.pickFromDeckPowerUsed == 0) && args.authorizedUndo) {  
                            // allow undo if player don't have any orca power or if the orca power has not been usedto draw cards this turn
                            this.addActionButton('button_undo', _('Undo'), 'onUndo', undefined, undefined, 'red');
                        }
                        break;
                    case 'playerTurn':
                        if ((args.currentStackCount > 0 || args.getBackCardFromStackPowerUsed || args.changeCardFromRiverPowerUsed) && args.authorizedUndo) {
                            // allow undo if player has already placed cards on their personal pile
                            this.addActionButton('button_undo', _('Undo'), 'onUndo', undefined, undefined, 'red');
                        }
                        break;
                    case 'moveTokens':
                        if (args.authorizedUndo) {
			                this.addActionButton('button_undo', _('Undo'), 'onUndo', undefined, undefined, 'red');
                        }
                        this.addMoveTokenActionButtons((args.moveFirstTokenPowerActive && args.hasOwnProperty("moveTokensPowerApplied") && args.moveTokensPowerApplied == "1"), (args.moveSecondTokenPowerActive && args.hasOwnProperty("moveTokensPowerApplied") && args.moveTokensPowerApplied == "1"));
                        break;
                    case 'scoring':
                        this.addActionButtonForPlayersAndSpectators('btnValidateScoring', _("Validate your scoring"), dojo.hitch(this, "onBtnValidateScoring", {}));
                        break;
                }
            }
        },

        ///////////////////////////////////////////////////
        //// Utility methods
        
        /*
        
            Here, you can defines some utility methods that you can use everywhere in your javascript
            script.
        
        */
        
        highlightCurrentPlayer() {
            for( let player_id in this.gamedatas.players )
            {
                if ($('arc_player_'+player_id)) {
                    if (player_id == this.getActivePlayerId()) {
                        dojo.addClass('arc_player_wrap_'+player_id, 'arc_pulse');
                    }
                    else {
                        dojo.query('#arc_player_wrap_'+player_id).removeClass('arc_pulse');
                    }
                }
            }
        },
        getAnimalIcon(animalName) {
            return "<div class='arc_minified_animals arc_"+animalName+"' title='"+animalName+"'></div>";
        },
        addActionButtonForPlayersAndSpectators(id, label, method, destination, blinking, color) {
            /*if (this.isReadOnly()) {
                // for spectators/replayers
                this.addActionButton(id, label, null, null, blinking, color);
            }
            else {
                // for actual players
                this.addActionButton(id, label, method, destination, blinking, color);
            }*/
            this.addActionButton(id, label, method, destination, blinking, color);
        },
        addPowerToolTip(node, powerDescription, owningPlayerId) {
            let tooltipDescription = "";
            if (owningPlayerId == this.player_id) {
                tooltipDescription = _("You own this power : ");
            }
            else if (owningPlayerId != null) {
                let playerName = null;
                for (let playerIndex in this.gamedatas.players) {
                    if (this.gamedatas.players[playerIndex].id == owningPlayerId) {
                        playerName = '<span style="color:#'+this.gamedatas.players[owningPlayerId].color+';">'+this.gamedatas.players[owningPlayerId].name+'</span>';
                    }
                }
                if (playerName != null) {
                    tooltipDescription = playerName+"&nbsp;"+_("owns this power : ");
                }
            }
            tooltipDescription += powerDescription;
            this.addTooltipHtml( node, tooltipDescription );
            //this.tooltips[node].open(node); // shows tooltip for debug purpose
        },
        getPowerDescription(powerId) {
            let powerDescription = null;
            //console.log(this.gamedatas.powers);
            for (let i in this.gamedatas.powers) {
                let card = this.gamedatas.powers[i];
                if (card.id == powerId) {
                    //console.log("getPowerDescription powerId : "+powerId+" card.id : "+card.id+" found desc : "+card.desc);
                    powerDescription = this.getPhaseIcon(card.phase);
                    powerDescription += card.desc;
                }
            }
            return powerDescription;
        },
        getPhaseIcon(phase) {
            let phaseIcon = null;
            switch (phase) {
                case 'playCardOnStack': 
                    phaseIcon = "<div class=\"arc_picto_wrapper\"><div class=\"arc_picto arc_stack\"></div></div>&nbsp;";
                    break;
                case 'moveTokens':
                    phaseIcon = "<div class=\"arc_picto_wrapper\"><div class=\"arc_picto arc_token\"></div></div>&nbsp;";
                    break;
                case 'pickCard':
                    phaseIcon = "<div class=\"arc_picto_wrapper\"><div class=\"arc_picto arc_pick\"></div></div>&nbsp;";
                    break;
                case 'givePenaltyCard':
                    phaseIcon = "<div class=\"arc_picto_wrapper\"><div class=\"arc_picto arc_pick\"></div></div>&nbsp;";
                    break;
            }
            //console.log("phase : "+phase+" phaseIcon : "+phaseIcon); 
            return phaseIcon;
        },
        managePowerBubblesDisplayOverriding() {
            let powersCounter = 0;
            let powersItems = this.currentPlayerPowers.getAllItems();
            for (let powerItemIndex in powersItems) {
                powersCounter++;
                dojo.style("arc_currentPlayerPowers_item_"+powersItems[powerItemIndex].id, {
                    'z-index':powersCounter
                });
            }
            powersItems = this.powers.getAllItems();
            for (let powerItemIndex in powersItems) {
                powersCounter++;
                dojo.style("arc_powers_item_"+powersItems[powerItemIndex].id, {
                    'z-index':powersCounter
                });
            }
            powersItems = this.unavailablePowers.getAllItems();
            for (let powerItemIndex in powersItems) {
                powersCounter++;
                dojo.style("arc_unavailablePowers_item_"+powersItems[powerItemIndex].id, {
                    'z-index':powersCounter
                });
            }
        },
        showPermanentMessage(message) {
            this.removePermanentMessage();
            dojo.place(this.format_block('jstpl_permanent_message', {
                message : message
            }), 'arc_message_wrap');
            dojo.place('<span class="arc_close-btn" onclick="javascript:dojo.destroy(\'arc_permanent_message_wrap\');">&times;</span>', 'arc_permanent_message_wrap', "first");
        },
        removePermanentMessage() {
            if ($("arc_permanent_message_wrap")) {
                dojo.destroy('arc_permanent_message_wrap');
            }
        },
        showPowerActiveMessage(message) {
            dojo.place(this.format_block('jstpl_power_active_message', {
                message : message
            }), 'arc_message_wrap');
            dojo.place('<span class="arc_close-btn" onclick="javascript:dojo.destroy(\'arc_power_active_message_wrap\');">&times;</span>', 'arc_power_active_message_wrap', "first");
        },
        removePowerActiveMessage() {
            if ($("arc_power_active_message_wrap")) {
                dojo.destroy('arc_power_active_message_wrap');
            }
        },
        addPowerActiveAnimal(animal) {
            this.addPulseOnPower(animal);
            this.activePowersAnimals.push(animal);
        },
        showPowersActivesMessage() {
            if (this.activePowersAnimals.length == 0) { 
                this.removePowerActiveBubble();
                return;
            }
            let animalIcons = "";
            for (animalIndex in this.activePowersAnimals) {
                if (animalIndex > 0) {
                    animalIcons += "&nbsp;";
                }
                animalIcons += this.getAnimalIcon(this.activePowersAnimals[animalIndex]);
            }
            let message = dojo.string.substitute( _("${animalIcons} power(s) are now active!"), {
                animalIcons : animalIcons
            } );
            if (this.getGameUserPreference(104) == 1 || this.getGameUserPreference(104) == 3) {
                this.addPowerActiveBubble(message);
            }
            if (this.getGameUserPreference(104) == 2 || this.getGameUserPreference(104) == 3) {
                this.showPowerActiveMessage(message);
            }
            // remove animals for next turn
            this.activePowersAnimals = [];
        },
        /*showPowerActiveMessage(animal) {
            let animalName = animal;
            //if (animal == "bear") { animalName = "polar bear"; }
            let powerIndex = 0;
            for (let animalIndex in this.gamedatas.animals) {
                if (this.gamedatas.animals[animalIndex].name == animalName) {
                    powerIndex = animalIndex;
                    break;
                }
            }
            //console.log("powerIndex : "+powerIndex);
            let powerAnimalId = 0;
            for (let powerItemIndex in this.currentPlayerPowers.getAllItems()) {
                //console.log("powerItem animal id : "+this.currentPlayerPowers.getAllItems()[powerItemIndex].id);
                //console.log("powerItem animal type : "+this.currentPlayerPowers.getAllItems()[powerItemIndex].type);
                //console.log("powerItem animal uniquetype : "+this.getUniquePowerTypeAnimalType(this.currentPlayerPowers.getAllItems()[powerItemIndex].type));
                if (powerIndex == this.getUniquePowerTypeAnimalType(this.currentPlayerPowers.getAllItems()[powerItemIndex].type)) {
                    powerAnimalId = this.currentPlayerPowers.getAllItems()[powerItemIndex].id;
                    break;
                }
                
            }
            let animalPowerNodeId = "arc_currentPlayerPowers_item_"+powerAnimalId;
            //console.log("animalPowerNodeId : "+animalPowerNodeId);
            
            let message = dojo.string.substitute( _("${animalIcon} power is now active!"), {
                animalIcon : this.getAnimalIcon(animal)
            } );
            this.showBubble(animalPowerNodeId, message, 0, 10000, 'arc_power_bubble');
            setTimeout(() => {
                this.removePowerActiveMessage();
            }, 10000);
        },*/
        addPowerActiveBubble(message) {
            this.showBubble("arc_currentPlayerPowers", message, 0, 10000, 'arc_power_bubble');
            this.bubbleTimeOut = setTimeout(() => {
                this.removePowerActiveBubble();
            }, 10000);
        },
        removePowerActiveBubble() {
            dojo.query('.discussion_bubble').forEach(dojo.destroy);
            if (typeof this.bubbleTimeOut === "number") {
                clearTimeout(this.bubbleTimeOut);
            }
        },
        updatePlayerBoardPowersPossessions() {
            dojo.query(".arc_cp_board_powers .arc_minified_animals").forEach(dojo.destroy);
            for (let player_id in this.gamedatas.players ) {
                for (let animalIndex in this.gamedatas.animals) {
                    let powerAnimalName = null;
                    if (player_id == this.player_id) {
                        for (let powerItemIndex in this.currentPlayerPowers.getAllItems()) {
                            if (this.getUniquePowerTypeAnimalType(this.currentPlayerPowers.getAllItems()[powerItemIndex].type) == animalIndex) {
                                powerAnimalName = this.gamedatas.animals[animalIndex].name;
                                break;
                            }
                        }
                        if (powerAnimalName != null) {
                            //console.log("place in #arc_cp_board_powers_"+player_id+" : "+'<div class="arc_minified_animals arc_'+powerAnimalName+'"></div>');
                            dojo.place('<div class="arc_minified_animals arc_'+powerAnimalName+'"></div>', "arc_cp_board_powers_"+player_id);
                        }
                    }
                    else {
                        let powerId = null;
                        for (let powerItemIndex in this.unavailablePowers.getAllItems()) {
                            powerId = this.unavailablePowers.getAllItems()[powerItemIndex].id;
                            if (this.getUniquePowerTypeAnimalType(this.unavailablePowers.getAllItems()[powerItemIndex].type) == animalIndex) {
                                powerAnimalName = this.gamedatas.animals[animalIndex].name;
                                break;
                            }
                        }
                        if (powerAnimalName != null && powerId != null && this.unavailablePowers.getItemWeightById(powerId) == player_id) {
                            //console.log("place in #arc_cp_board_powers_"+player_id+" : "+'<div class="arc_minified_animals arc_'+powerAnimalName+'"></div>');
                            dojo.place('<div class="arc_minified_animals arc_'+powerAnimalName+'"></div>', "arc_cp_board_powers_"+player_id);
                        }
                    }
                }
                this.addTooltipHtml( "arc_cp_board_powers_"+player_id, $("arc_cp_board_powers_"+player_id).innerHTML );
            }
        },
        addCardToOpponentPlayerHand(player_id, opponentHand = null) {
            let uniqueOpponentHandCardPlaceHolderId = 0;
            if (opponentHand == null) {
                for (let opponentHandIndex in this.opponentHands) {
                    if (this.opponentHands[opponentHandIndex].playerId == player_id) {
                        opponentHand = this.opponentHands[opponentHandIndex].hand;
                        break;
                    }
                }
            }
            let handCardId = opponentHand.getAllItems().length;
            opponentHand.addToStockWithId(uniqueOpponentHandCardPlaceHolderId, handCardId);
            //dojo.addClass('arc_cp_board_hand_'+player_id+'_item_'+ handCardId, 'arc_xsCards');
            this.updateOpponentPlayerHandCountAndTooltip(player_id, opponentHand);
            return handCardId;
        },
        removeCardFromOpponentPlayerHand(player_id, opponentHand = null) {
            if (opponentHand == null) {
                for (let opponentHandIndex in this.opponentHands) {
                    if (this.opponentHands[opponentHandIndex].playerId == player_id) {
                        opponentHand = this.opponentHands[opponentHandIndex].hand;
                        break;
                    }
                }
            }
            let handCardId = opponentHand.getAllItems().length-1;
            opponentHand.removeFromStockById(handCardId);
            this.updateOpponentPlayerHandCountAndTooltip(player_id, opponentHand);
            return handCardId;
        },
        updateOpponentPlayerHandCountAndTooltip(player_id, opponentHand) {
            
            let tooltipDesc = dojo.string.substitute( _("${count} card(s) in hand"), {
                count: opponentHand.getAllItems().length
            } );
            this.addTooltip( 'arc_cp_board_hand_'+player_id, tooltipDesc, '' );
            this.addTooltip( 'arc_cp_board_handCardsCount_'+player_id, tooltipDesc, '' );
            let handCardsCountHtml = opponentHand.getAllItems().length+"&nbsp;:";
            if (opponentHand.getAllItems().length == 0) {
                handCardsCountHtml = _("Empty hand");
            }
            $('arc_cp_board_handCardsCount_'+player_id).innerHTML = handCardsCountHtml;
        },
        updateOpponentPlayerPileCountAndTooltip(player_id, pileCount) {
            
            let tooltipDesc = dojo.string.substitute( _("${count} card(s) in pile"), {
                count: pileCount
            } );
            this.addTooltip( 'arc_cp_board_pile_'+player_id, tooltipDesc, '' );
            this.addTooltip( 'arc_cp_board_pileCardsCount_'+player_id, tooltipDesc, '' );
            $('arc_cp_board_pileCardsCount_'+player_id).innerHTML = pileCount;
            if (pileCount == 0) {
                dojo.addClass('arc_cp_board_pileCardsCount_'+player_id, 'arc_empty');
            }
            else {
                dojo.removeClass('arc_cp_board_pileCardsCount_'+player_id, 'arc_empty');
            }
        },
        updateOpponentPlayerPenaltiesCountAndTooltip(player_id, penaltiesCount) {
            
            let tooltipDesc = dojo.string.substitute( _("${count} card(s) in Penalty zone"), {
                count: penaltiesCount
            } );
            this.addTooltip( 'arc_cp_board_penalties_'+player_id, tooltipDesc, '' );
            this.addTooltip( 'arc_cp_board_penaltiesCardsCount_'+player_id, tooltipDesc, '' );
            $('arc_cp_board_penaltiesCardsCount_'+player_id).innerHTML = penaltiesCount;
            if (penaltiesCount == 0) {
                dojo.addClass('arc_cp_board_penaltiesCardsCount_'+player_id, 'arc_empty');
            }
            else {
                dojo.removeClass('arc_cp_board_penaltiesCardsCount_'+player_id, 'arc_empty');
            }
        },
        addItemTypesForScoring(stockItem) {
            for (let deckIndex = 1; deckIndex <= this.playersCount; deckIndex ++) {
                for (let animalType = 1; animalType <= 6; animalType++) {
                    //let secondaryAnimalToken = animalType;
                    for (let drawCounter = 1; drawCounter <= 5; drawCounter++) { // pickup number ---- temp ----
                        // Build card type id
                        let primaryAnimalToken = animalType;
                        
                        //secondaryAnimalToken = (secondaryAnimalToken % 6) + deckIndex;

                        let secondaryAnimalToken = 0;
                        if ((drawCounter + primaryAnimalToken) >= (primaryAnimalToken + 7 - deckIndex)) {
                            secondaryAnimalToken = 1;
                        }
                        secondaryAnimalToken += (drawCounter + primaryAnimalToken + deckIndex - 1) % 6;
                        if (secondaryAnimalToken == 0) secondaryAnimalToken = 6; // retarget index for bear animal type
                        
                        let stackCounter = 6 - drawCounter;
                        // value example : 1+1+5+1+2
                        let uniqueId = ""+deckIndex+animalType+drawCounter+stackCounter+primaryAnimalToken+secondaryAnimalToken;
                        let card_type_id = this.getCardUniqueType(deckIndex+'_'+animalType, drawCounter);
                        let image_position = this.getCardUniquePosition(animalType, drawCounter);
                        stockItem.addItemType(card_type_id, image_position, g_gamethemeurl + 'img/cards'+deckIndex+'.jpg', image_position);
                        //console.log("addItemTypesForScoring card_type_id : "+card_type_id+" deckIndex : "+deckIndex+" image_position : "+image_position);
                    }
                }
            }
        },
        addAnimalTypesForScoring(stockItem) {
            for (let animalType = 1; animalType <= 6; animalType++) {
                stockItem.addItemType(animalType, animalType, g_gamethemeurl + 'img/animals.jpg', animalType);
            }
        },
        applyResizeOnTokenItems(ratio) {
            this.tokens1.resizeItems( this.tokenWidth*ratio, this.tokenHeight*ratio, this.tokenBackgroundWidth*ratio, this.tokenBackgroundHeight*ratio );
            this.tokens1.updateDisplay(); // re-layout
            this.tokens2.resizeItems( this.tokenWidth*ratio, this.tokenHeight*ratio, this.tokenBackgroundWidth*ratio, this.tokenBackgroundHeight*ratio );
            this.tokens2.updateDisplay(); // re-layout
            this.tokens3.resizeItems( this.tokenWidth*ratio, this.tokenHeight*ratio, this.tokenBackgroundWidth*ratio, this.tokenBackgroundHeight*ratio );
            this.tokens3.updateDisplay(); // re-layout
            this.tokens4.resizeItems( this.tokenWidth*ratio, this.tokenHeight*ratio, this.tokenBackgroundWidth*ratio, this.tokenBackgroundHeight*ratio );
            this.tokens4.updateDisplay(); // re-layout
            this.tokens5.resizeItems( this.tokenWidth*ratio, this.tokenHeight*ratio, this.tokenBackgroundWidth*ratio, this.tokenBackgroundHeight*ratio );
            this.tokens5.updateDisplay(); // re-layout
            this.tokens6.resizeItems( this.tokenWidth*ratio, this.tokenHeight*ratio, this.tokenBackgroundWidth*ratio, this.tokenBackgroundHeight*ratio );
            this.tokens6.updateDisplay(); // re-layout
        },
        applyResizeOnCardItems(ratio) {
            this.pick.resizeItems( Math.round(this.cardWidth*ratio), Math.round(this.cardHeight*ratio), Math.round(this.pickBackgroundWidth*ratio), Math.round(this.pickBackgroundHeight*ratio) );
            this.pick.updateDisplay(); // re-layout
            this.playerHand.resizeItems( this.cardWidth*ratio, this.cardHeight*ratio, this.cardBackgroundWidth*ratio, this.cardBackgroundHeight*ratio );
            this.playerHand.updateDisplay(); // re-layout
            this.river.resizeItems( this.cardWidth*ratio, this.cardHeight*ratio, this.cardBackgroundWidth*ratio, this.cardBackgroundHeight*ratio );
            this.river.updateDisplay(); // re-layout
            this.stack.resizeItems( this.cardWidth*ratio, this.cardHeight*ratio, this.cardBackgroundWidth*ratio, this.cardBackgroundHeight*ratio );
            this.stack.updateDisplay(); // re-layout
            this.penalties.resizeItems( this.cardWidth*ratio, this.cardHeight*ratio, this.cardBackgroundWidth*ratio, this.cardBackgroundHeight*ratio );
            this.penalties.updateDisplay(); // re-layout
            this.playerTotem.resizeItems( this.totemWidth*ratio, this.totemHeight*ratio, this.totemBackgroundWidth*ratio, this.totemBackgroundHeight*ratio );
            this.playerTotem.updateDisplay(); // re-layout
            this.powers.resizeItems( this.powerWidth*ratio, this.powerHeight*ratio, this.powerBackgroundWidth*ratio, this.powerBackgroundHeight*ratio );
            this.powers.updateDisplay(); // re-layout
            this.currentPlayerPowers.resizeItems( this.powerWidth*ratio, this.powerHeight*ratio, this.powerBackgroundWidth*ratio, this.powerBackgroundHeight*ratio );
            this.currentPlayerPowers.updateDisplay(); // re-layout
            this.unavailablePowers.resizeItems( this.powerWidth*ratio, this.powerHeight*ratio, this.powerBackgroundWidth*ratio, this.powerBackgroundHeight*ratio );
            this.unavailablePowers.updateDisplay(); // re-layout
            this.mypenaltiesindetails.resizeItems( this.cardWidth*ratio, this.cardHeight*ratio, this.cardBackgroundWidth*ratio, this.cardBackgroundHeight*ratio );
            this.mypenaltiesindetails.updateDisplay(); // re-layout
            this.mystackindetails.resizeItems( this.cardWidth*ratio, this.cardHeight*ratio, this.cardBackgroundWidth*ratio, this.cardBackgroundHeight*ratio );
            this.mystackindetails.updateDisplay(); // re-layout
            if (this.animalsStock != null) {
                // this.cardWidth is used instead of this.cardBackgroundWidth because the background image is only 156px wide
                this.animalsStock.resizeItems( this.cardWidth*ratio, this.cardHeight*ratio, this.cardWidth*ratio, this.cardBackgroundHeight*ratio );
                this.animalsStock.updateDisplay(); // re-layout
            }
        },
        applyResizeOnScoringCardItems(ratio) {
            for (let playerIndex in this.mystackinscoring) {
                let newRatio = ratio;
                let currentPlayerStackCardsCount = 0;
                //console.log("applyResizeOnScoringCardItems playerIndex : "+playerIndex);
                for (let stockIndex in this.mystackinscoring[playerIndex]) {
                    //console.log("applyResizeOnScoringCardItems stockIndex : "+stockIndex);
                    currentPlayerStackCardsCount += this.mystackinscoring[playerIndex][stockIndex].getAllItems().length;
                }
                //console.log("applyResizeOnScoringCardItems currentPlayerStackCardsCount : "+currentPlayerStackCardsCount);
                if (currentPlayerStackCardsCount > 15 && currentPlayerStackCardsCount <= 20) {
                    newRatio = ratio * 12 / currentPlayerStackCardsCount;
                    //console.log("new ratio:"+ratio+" currentPlayerStackCardsCount"+currentPlayerStackCardsCount);
                }
                else if (currentPlayerStackCardsCount > 20) {
                    newRatio = ratio * 15 / currentPlayerStackCardsCount;
                    //console.log("new ratio:"+ratio+" currentPlayerStackCardsCount"+currentPlayerStackCardsCount);
                }
                for (let stockIndex in this.mystackinscoring[playerIndex]) {
                    //console.log("resizeItems[playerIndex:"+playerIndex+"][stockIndex:"+stockIndex+"] ratio:"+ratio+" this.cardWidth*ratio:"+this.cardWidth*ratio+" this.cardHeight*ratio:"+this.cardHeight*ratio);
                    this.mystackinscoring[playerIndex][stockIndex].resizeItems( this.cardWidth*newRatio, this.cardHeight*newRatio, this.cardBackgroundWidth*newRatio, this.cardBackgroundHeight*newRatio );
                    this.mystackinscoring[playerIndex][stockIndex].updateDisplay(); // re-layout
                }
            }
            /*
            dojo.query('.arc_mystackinscoring').removeClass('arc_xsCards');
            dojo.query('.arc_mystackinscoring').removeClass('arc_sCards');
            dojo.query('.arc_mystackinscoring').removeClass('arc_mCards');
            dojo.query('.arc_mystackinscoring').removeClass('arc_lCards');
            // add ratio class to manage border-radius css
            if (ratio >= 0.7) {
                //console.log("addClass('arc_lCards')");
                dojo.query('.arc_mystackinscoring').addClass('arc_lCards');
            }
            else if (ratio >= 0.5 && ratio < 0.7) {
                //console.log("addClass('arc_mCards')");
                dojo.query('.arc_mystackinscoring').addClass('arc_mCards');
            }
            else if (ratio >= 0.3 && ratio < 0.5) {
                //console.log("addClass('arc_sCards')");
                dojo.query('.arc_mystackinscoring').addClass('arc_sCards');
            }
            else if (ratio >= 0 && ratio < 0.3) {
                //console.log("addClass('arc_xsCards')");
                dojo.query('.arc_mystackinscoring').addClass('arc_xsCards');
            }
            */
        },
        onScreenWidthChange() {
            // Remove broken "zoom" property added by BGA framework
            /*this.gameinterface_zoomFactor = 1;
            $("page-content").style.removeProperty("zoom");
            $("page-title").style.removeProperty("zoom");
            $("right-side-first-part").style.removeProperty("zoom");*/
            if (this.pick !== undefined) {
                // si < 980 alors pas de zone de droite
                //console.log("window.innerWidth : "+window.innerWidth);
                
                
                if (window.innerWidth > 448 && window.innerWidth < 512) {
                    //river cards show on 2 rows with 480px width
                    this.applyResizeOnCardItems(0.48);
                }
                else if (window.innerWidth < 768) {
                    this.applyResizeOnScoringCardItems(0.2);
                    this.applyResizeOnCardItems(0.5);
                    this.applyResizeOnTokenItems(0.5);
                }
                else if (window.innerWidth < 1280) {
                    this.applyResizeOnScoringCardItems(0.3);
                    this.applyResizeOnCardItems(0.5);
                    this.applyResizeOnTokenItems(0.5);
                }
                else if (window.innerWidth >= 1280 && window.innerWidth < 1440) {
                    this.applyResizeOnScoringCardItems(0.3);
                    this.applyResizeOnCardItems(0.6);
                    this.applyResizeOnTokenItems(0.6);
                }
                else if (window.innerWidth >= 1440 && window.innerWidth < 1600) {
                    this.applyResizeOnScoringCardItems(0.4);
                    this.applyResizeOnCardItems(0.7);
                    this.applyResizeOnTokenItems(0.6);
                }
                else if (window.innerWidth >= 1600 && window.innerWidth < 1920) {
                    this.applyResizeOnScoringCardItems(0.5);
                    this.applyResizeOnCardItems(0.8);
                    this.applyResizeOnTokenItems(0.7);
                }
                else if (window.innerWidth >= 1920) {
                    this.applyResizeOnScoringCardItems(0.7);
                    this.applyResizeOnCardItems(1);
                    this.applyResizeOnTokenItems(1);
                }
                this.manageDifferentAnimalTypesCardsOverlap();
            }
        },
        stopShowingCardBehind() {
            let myStackItems = this.stack.getAllItems();
            for (let itemIndex in myStackItems) {
                let currentCard = myStackItems[itemIndex];
                if($('arc_mystack_item_' + currentCard.id) && $('arc_mystack_item_' + currentCard.id).classList.contains('arc_showCardBehind')) { 
                    //console.log("stopShowingCardBehind contains currentCardId : "+currentCard.id);
                    $('arc_mystack_item_' + currentCard.id).classList.remove('arc_showCardBehind');
                    $('arc_mystack_item_' + currentCard.id).classList.add('arc_hideCardBehind');
                }
            }
        },
        closeDetailsWrappers() {
            if (document.getElementById('arc_my_stack_in_details_wrapper') !== null) {
                document.getElementById('arc_my_stack_in_details_wrapper').remove();
                this.stack.unselectAll();
            }
            if (document.getElementById('arc_my_penalties_in_details_wrapper') !== null) {
                document.getElementById('arc_my_penalties_in_details_wrapper').remove();
                this.penalties.unselectAll();
            }
        },
        managePulseOnPowersForCurrentPhase(currentState) {
            //console.log("managePulseOnPowersForCurrentPhase");
            //console.log(this.gamedatas.powers);
            for (let powerIndex in this.gamedatas.powers) {
                // state name match power phase
                let currentPhaseMatch = (this.gamedatas.powers[powerIndex].phase == currentState);
                
                // possible actions in current state match power phase
                for (let gameStateIndex in this.gamedatas.gamestates) {
                    if (this.gamedatas.gamestates[gameStateIndex].name == currentState) {
                        for (let possibleActionsIndex in this.gamedatas.gamestates[gameStateIndex].possibleactions) {
                            if (this.gamedatas.gamestates[gameStateIndex].possibleactions[possibleActionsIndex] == this.gamedatas.powers[powerIndex].phase) {
                                currentPhaseMatch = true;
                                break;
                            }
                        }
                    }
                }
                if (currentPhaseMatch) {
                    if ($("arc_currentPlayerPowers_item_"+this.gamedatas.powers[powerIndex].id) && this.isCurrentPlayerActive()) {
                        dojo.addClass('arc_currentPlayerPowers_item_' + this.gamedatas.powers[powerIndex].id, 'arc_pulse');
                    }
                    /*if ($("arc_unavailablePowers_item_"+this.gamedatas.powers[powerIndex].id) && !this.isCurrentPlayerActive()) {
                        dojo.addClass('arc_unavailablePowers_item_' + this.gamedatas.powers[powerIndex].id, 'arc_pulse');
                    }*/
                }
                else {
                    if ($("arc_currentPlayerPowers_item_"+this.gamedatas.powers[powerIndex].id)) {
                        dojo.query('#arc_currentPlayerPowers_item_' + this.gamedatas.powers[powerIndex].id).removeClass('arc_pulse');
                    }
                    if ($("arc_unavailablePowers_item_"+this.gamedatas.powers[powerIndex].id)) {
                        dojo.query('#arc_unavailablePowers_item_' + this.gamedatas.powers[powerIndex].id).removeClass('arc_pulse');
                    }
                }
            }
        },
        addPulseOnPower(animalName) {
            //if (animalName == "bear") { animalName = "polar bear"; }
            let powerIndex = 0;
            for (let animalIndex in this.gamedatas.animals) {
                if (this.gamedatas.animals[animalIndex].name == animalName) {
                    powerIndex = animalIndex;
                    break;
                }
            }
            //console.log("powerIndex : "+powerIndex);
            let powerAnimalId = 0;
            for (let powerItemIndex in this.currentPlayerPowers.getAllItems()) {
                //console.log("powerItem animal id : "+this.currentPlayerPowers.getAllItems()[powerItemIndex].id);
                //console.log("powerItem animal type : "+this.currentPlayerPowers.getAllItems()[powerItemIndex].type);
                //console.log("powerItem animal uniquetype : "+this.getUniquePowerTypeAnimalType(this.currentPlayerPowers.getAllItems()[powerItemIndex].type));
                if (powerIndex == this.getUniquePowerTypeAnimalType(this.currentPlayerPowers.getAllItems()[powerItemIndex].type)) {
                    powerAnimalId = this.currentPlayerPowers.getAllItems()[powerItemIndex].id;
                    break;
                }
                
            }
            let animalPowerNodeId = "arc_currentPlayerPowers_item_"+powerAnimalId;
            //console.log("animalPowerNodeId : "+animalPowerNodeId);
            
            if ($("arc_currentPlayerPowers_item_"+powerAnimalId)) {
                dojo.addClass('arc_currentPlayerPowers_item_' + powerAnimalId, 'arc_pulse');
            }
            
        },
        deactivatePulseOnPowers() {
            //console.log("deactivatePulseOnPowers");
            //console.log(this.gamedatas.powers);
            for (let powerIndex in this.gamedatas.powers) {
                if ($("arc_currentPlayerPowers_item_"+this.gamedatas.powers[powerIndex].id)) {
                    dojo.query('#arc_currentPlayerPowers_item_' + this.gamedatas.powers[powerIndex].id).removeClass('arc_pulse');
                }
                if ($("arc_powers_item_"+this.gamedatas.powers[powerIndex].id)) {
                    dojo.query('#arc_powers_item_' + this.gamedatas.powers[powerIndex].id).removeClass('arc_pulse');
                }
                if ($("arc_unavailablePowers_item_"+this.gamedatas.powers[powerIndex].id)) {
                    dojo.query('#arc_unavailablePowers_item_' + this.gamedatas.powers[powerIndex].id).removeClass('arc_pulse');
                }
            }
        },
        deactivateBoardWrappers() {
            dojo.query("#arc_players_wrap").removeClass("arc_active_slot");
            dojo.query("#arc_totem_wrap").removeClass("arc_active_slot");
            dojo.query("#arc_landscapes_wrap").removeClass("arc_active_slot");
            dojo.query("#arc_powers_wrap").removeClass("arc_active_slot");
            dojo.query("#arc_pick_wrap").removeClass("arc_active_slot");
            dojo.query("#arc_river_wrap").removeClass("arc_active_slot");
            dojo.query("#arc_mypenalties_wrap").removeClass("arc_active_slot");
            dojo.query("#arc_mystack_wrap").removeClass("arc_active_slot");
            dojo.query("#arc_myhand_wrap").removeClass("arc_active_slot");
        },
        activateBoardWrapper(areaName) {
            dojo.query("#"+areaName+"_wrap").addClass("arc_active_slot");
        },
        addCardDefinitionTooltip(currentStock, node, cardId, pileCount) {
            let cardDefinitionHtml = "<div class=\"arc_card_def\">";
            if (pileCount !== undefined) {
                cardDefinitionHtml += "<h3 class=\"arc_tooltipHeader\">"+_("Cards count in this pile")+" : "+pileCount+"</h3>";
            }

            if (currentStock != undefined || currentStock != null) {
                let cardType = currentStock.getItemById(cardId).type;
                
                cardDefinitionHtml += "<div class=\"arc_tooltipContent\">";
                cardDefinitionHtml += "<div class=\"arc_picto_wrapper\"><div class=\"arc_picto arc_token "+this.gamedatas.animals[this.getUniqueCardTypeAnimalType(cardType)].name+"\">&nbsp;</div></div><div class=\"arc_explain_wrapper\">"+_("Main animal")+" : "+this.gamedatas.animals[this.getUniqueCardTypeAnimalType(cardType)].nametr+"</div>";
                cardDefinitionHtml += "<div class=\"arc_picto_wrapper\"><div class=\"arc_picto arc_token "+this.gamedatas.animals[this.getUniqueCardTypeSecondaryTokenType(cardType)].name+"\">&nbsp;</div></div><div class=\"arc_explain_wrapper\">"+_("Companion animal")+" : "+this.gamedatas.animals[this.getUniqueCardTypeSecondaryTokenType(cardType)].nametr+"</div>";
                cardDefinitionHtml += "<div class=\"arc_picto_wrapper\"><div class=\"arc_picto arc_pick\">&nbsp;</div></div><div class=\"arc_explain_wrapper\">"+_("Draw value")+" : "+this.getUniqueCardTypeValue(cardType)+"</div>";
                cardDefinitionHtml += "<div class=\"arc_picto_wrapper\"><div class=\"arc_picto arc_stack\">&nbsp;</div></div><div class=\"arc_explain_wrapper\">"+_("Placement value")+" : "+this.getUniqueCardTypeStackValue(cardType)+"</div>";
                cardDefinitionHtml += "</div>";
            }
            cardDefinitionHtml += "</div>";

            this.addTooltipHtml( node, cardDefinitionHtml );
            //this.tooltips[node].open(node); // shows tooltip for debug purpose
        },
        manageHandCardsOverlap(handCardsCount) {
            
            let handCardsOverlapByCount = {
                'default':0,
                7:0, 
                8:88, 
                9:77, 
                10:68, 
                11:61, 
                12:53, 
                13:47, 
                'unauthorized':19
            };
            if (handCardsOverlapByCount[handCardsCount] !== undefined) {
                this.playerHand.horizontal_overlap  = handCardsOverlapByCount[handCardsCount];
            }
            else if (handCardsCount > 13) {
                // should not be authorized
                this.playerHand.horizontal_overlap  = handCardsOverlapByCount['unauthorized'];
            }
            else {
                this.playerHand.horizontal_overlap  = handCardsOverlapByCount['default'];
            }
            this.playerHand.updateDisplay(); // re-layout
        },
        manageDifferentAnimalTypesCardsOverlap() {
            if (this.animalsStock != null) {
                let animalTypesCardsCount = this.animalsStock.getAllItems().length;
                let animalTypesCardsOverlapByCount = {
                    'default':0
                };
                if (window.innerWidth < 1280) {
                    animalTypesCardsOverlapByCount["5"] = 61;
                    animalTypesCardsOverlapByCount["6"] = 53;
                }
                else if (window.innerWidth >= 1280 && window.innerWidth < 1440) {
                    animalTypesCardsOverlapByCount["5"] = 61;
                    animalTypesCardsOverlapByCount["6"] = 53;
                }
                else if (window.innerWidth >= 1440 && window.innerWidth < 1600) {
                    animalTypesCardsOverlapByCount["6"] = 61;
                }
                else if (window.innerWidth >= 1600 && window.innerWidth < 1920) {
                    animalTypesCardsOverlapByCount["6"] = 61;
                }
                else if (window.innerWidth >= 1920) {
                    animalTypesCardsOverlapByCount["6"] = 0;

                }
                if (animalTypesCardsOverlapByCount[animalTypesCardsCount] !== undefined) {
                    this.animalsStock.horizontal_overlap  = animalTypesCardsOverlapByCount[animalTypesCardsCount];
                }
                else {
                    this.animalsStock.horizontal_overlap  = animalTypesCardsOverlapByCount['default'];
                }
                this.animalsStock.updateDisplay(); // re-layout
            }
        },
        getTokensToMoveInfos(moveTokenActivePower) {
            let tokensToMove = []
            let currentPlayerStackCards = this.stack.getAllItems();
            let topStackCard = currentPlayerStackCards[currentPlayerStackCards.length-1];
            //console.log("top stack item id : "+topStackCard.id+" unique type : "+topStackCard.type);
            //console.log("top stack animal type : "+this.getUniqueCardTypeAnimalType(topStackCard.type));
            let primaryAnimalTokenAnimalType = this.getUniqueCardTypeAnimalType(topStackCard.type);
            let secondaryAnimalTokenAnimalType = this.getUniqueCardTypeSecondaryTokenType(topStackCard.type);
            //console.log("top stack primaryAnimalTokenAnimalType : "+primaryAnimalTokenAnimalType + " secondaryAnimalTokenAnimalType : "+secondaryAnimalTokenAnimalType);
            let primaryAnimalToken = null;
            let primaryAnimalTokenLocation = null;
            let secondaryAnimalToken = null;
            let secondaryAnimalTokenLocation = null;
            for (let tokenStockIndex in this.tokenStock)
            {
                let tokens = this.tokenStock[tokenStockIndex].getAllItems();
                for (let tokenIndex in tokens)
                {
                    //console.log("tokens["+tokenIndex+"].type : "+tokens[tokenIndex].type+1 + " =? primaryAnimalTokenAnimalType : "+primaryAnimalTokenAnimalType);
                    //console.log("tokens["+tokenIndex+"].type : "+tokens[tokenIndex].type+1 + " =? secondaryAnimalTokenAnimalType : "+secondaryAnimalTokenAnimalType);
                    if (tokens[tokenIndex].type+1 == primaryAnimalTokenAnimalType) {
                        primaryAnimalToken = tokens[tokenIndex];
                        primaryAnimalTokenLocation = parseInt(tokenStockIndex)+1;
                        //console.log("primaryAnimalToken.id : "+primaryAnimalToken.id + " primaryAnimalTokenLocation : "+primaryAnimalTokenLocation);
                        tokensToMove.push({
                            id: primaryAnimalToken.id,
                            location: primaryAnimalTokenLocation,
                            tokenType: "primary"
                        });
                    }
                    if (tokens[tokenIndex].type+1 == secondaryAnimalTokenAnimalType) {
                        secondaryAnimalToken = tokens[tokenIndex];
                        secondaryAnimalTokenLocation = parseInt(tokenStockIndex)+1;
                        //console.log("secondaryAnimalToken.id : "+secondaryAnimalToken.id + " secondaryAnimalTokenAnimalType : "+secondaryAnimalTokenAnimalType);
                        tokensToMove.push({
                            id: secondaryAnimalToken.id,
                            location: secondaryAnimalTokenLocation,
                            tokenType: "secondary"
                        });
                    }
                }
                if (primaryAnimalToken !== null && secondaryAnimalToken !== null) {
                    break;
                }
            }
            return tokensToMove;
        },
        addMoveTokenActionButtons(moveFirstTokenActivePower, moveSecondTokenActivePower) {
            
            let tokensToMove = this.getTokensToMoveInfos();

            let locationsInfos = {};
            for (let tokenIndex in tokensToMove) {
                    if (tokensToMove[tokenIndex].location == 6) {
                        locationsInfos[tokensToMove[tokenIndex].tokenType] = {right : false, left : true};
                    } else if (tokensToMove[tokenIndex].location == 1) {
                        locationsInfos[tokensToMove[tokenIndex].tokenType] = {right : true, left : false};
                    } else {
                        locationsInfos[tokensToMove[tokenIndex].tokenType] = {right : true, left : true};
                    }
                    locationsInfos[tokensToMove[tokenIndex].tokenType].tokenType = tokensToMove[tokenIndex].tokenType;
                    locationsInfos[tokensToMove[tokenIndex].tokenType].location = tokensToMove[tokenIndex].location;
            }
            if (!moveFirstTokenActivePower && !moveSecondTokenActivePower) {
                if (!locationsInfos.primary.left && !locationsInfos.secondary.left) {
                    locationsInfos.primary.right = true;
                    locationsInfos.secondary.right = true;
                }
                else if (!locationsInfos.primary.right && !locationsInfos.secondary.right) {
                    locationsInfos.primary.left = true;
                    locationsInfos.secondary.left = true;
                }
                if ((locationsInfos.secondary.left && locationsInfos.primary.right) || 
                    (!locationsInfos.secondary.right && !locationsInfos.primary.right)) {
                    dojo.place('<div id="secondaryMoveLeft" class="arc_actionArrow arc_arrowLeft" initialized="true"></div>', "arc_"+locationsInfos.secondary.tokenType+"tokenwrap"+locationsInfos.secondary.location, "first");
                }
                if ((locationsInfos.secondary.right && locationsInfos.primary.left) || 
                    (!locationsInfos.secondary.left && !locationsInfos.primary.left)) {
                    dojo.place('<div id="secondaryMoveRight" class="arc_actionArrow arc_arrowRight" initialized="true"></div>', "arc_"+locationsInfos.secondary.tokenType+"tokenwrap"+locationsInfos.secondary.location, "first");
                }
            }
            //console.log(locationsInfos);
            

            
            if (moveSecondTokenActivePower) {
                if (locationsInfos.secondary.left) {
                    this.addActionButtonForPlayersAndSpectators( 
                        'secondaryMoveLeft', 
                        '',  // Move to the left >> put in tooltip
                        'onSecondTokenPositionLeftSelection', 
                        "arc_"+locationsInfos.secondary.tokenType+"tokenwrap"+locationsInfos.secondary.location, 
                        false);
                    this.addTooltip( 'secondaryMoveLeft', _("Move the Companion animal token to the left"), '' );
                    dojo.addClass('secondaryMoveLeft','active arc_actionArrow arc_arrowLeft');
                    dojo.removeClass('secondaryMoveLeft','action-button bgabutton bgabutton_blue');

                    this.addActionButtonForPlayersAndSpectators('btnSecondaryMoveLeft', _("Move the Companion animal token to the left"), "onSecondTokenPositionLeftSelection");
                }
                if (locationsInfos.secondary.right) {
                    this.addActionButtonForPlayersAndSpectators( 
                        'secondaryMoveRight', 
                        '', // Move to the right >> put in tooltip
                        'onSecondTokenPositionRightSelection', 
                        "arc_"+locationsInfos.secondary.tokenType+"tokenwrap"+locationsInfos.secondary.location, 
                        false); 
                    this.addTooltip( 'secondaryMoveRight', _("Move the Companion animal token to the right"), '' );
                    dojo.addClass('secondaryMoveRight','active arc_actionArrow arc_arrowRight');
                    dojo.removeClass('secondaryMoveRight','action-button bgabutton bgabutton_blue');
                    
                    this.addActionButtonForPlayersAndSpectators('btnSecondaryMoveRight', _("Move the Companion animal token to the right"), "onSecondTokenPositionRightSelection");
                }
            }
            else {
                
                // the primary token can move to the left because of its position allows it 
                // the secondary token can move to the right because of its position allows it 
                // the primary token must move to the left because the secondary token can't move to the left
                // the primary token can't move to the right and the second token can move to the right
                if ((locationsInfos.primary.left && locationsInfos.secondary.right) || 
                    (!locationsInfos.primary.right && !locationsInfos.secondary.right) || 
                    (locationsInfos.primary.left && moveFirstTokenActivePower)) {
                    this.addActionButtonForPlayersAndSpectators( 
                        'moveLeft', 
                        '',  // Move to the left >> put in tooltip
                        'onTokenPositionLeftSelection', 
                        "arc_"+locationsInfos.primary.tokenType+"tokenwrap"+locationsInfos.primary.location, 
                        false);
                    this.addTooltip( 'moveLeft', _("Move the Main animal token to the left"), '' );
                    dojo.addClass('moveLeft','active arc_actionArrow arc_arrowLeft');
                    dojo.removeClass('moveLeft','action-button bgabutton bgabutton_blue');

                    this.addActionButtonForPlayersAndSpectators('btnMoveLeft', _("Move the Main animal token to the left"), "onTokenPositionLeftSelection");

                    if (locationsInfos.secondary.right && !moveFirstTokenActivePower) {
                        // oposite side highlight on mouse over
                        dojo.query('#moveLeft, #btnMoveLeft, #btnSecondaryMoveLeft').on('mouseover', function(){
                            dojo.removeClass('moveLeft','arc_slightlyHidden');
                            if (locationsInfos.primary.right && locationsInfos.secondary.left) dojo.addClass('moveRight','arc_slightlyHidden');
                            if (locationsInfos.primary.right && locationsInfos.secondary.left) dojo.removeClass('secondaryMoveLeft','active');
                            dojo.addClass('secondaryMoveRight','active');
                        });
                        dojo.query('#moveLeft, #btnMoveLeft, #btnSecondaryMoveLeft').on('mouseout', function(){
                            dojo.removeClass('moveLeft','arc_slightlyHidden');
                            if (locationsInfos.primary.right && locationsInfos.secondary.left) dojo.removeClass('moveRight','arc_slightlyHidden');
                            if (locationsInfos.primary.right && locationsInfos.secondary.left) dojo.removeClass('secondaryMoveLeft','active');
                            dojo.removeClass('secondaryMoveRight','active');
                        });
                    }
                    if (!locationsInfos.secondary.right && !moveFirstTokenActivePower) {
                        // identical side highlight on mouse over
                        // avoid opposite side treatment
                        dojo.query('#moveLeft, #btnMoveLeft, #btnSecondaryMoveLeft').on('mouseover', function(){
                            //dojo.removeClass('moveLeft','arc_slightlyHidden');
                            //dojo.addClass('moveRight','arc_slightlyHidden');
                            //dojo.addClass('secondaryMoveRight','active');
                            dojo.addClass('secondaryMoveLeft','active');
                        });
                        dojo.query('#moveLeft, #btnMoveLeft, #btnSecondaryMoveLeft').on('mouseout', function(){
                            //dojo.addClass('moveLeft','arc_slightlyHidden');
                            //dojo.removeClass('moveRight','arc_slightlyHidden');
                            //dojo.removeClass('secondaryMoveRight','active');
                            dojo.removeClass('secondaryMoveLeft','active');
                        });
                    }
                }

                if ((locationsInfos.primary.right && locationsInfos.secondary.left) || 
                    (!locationsInfos.primary.left && !locationsInfos.secondary.left) || 
                    (locationsInfos.primary.right && moveFirstTokenActivePower)) {
                    this.addActionButtonForPlayersAndSpectators( 
                        'moveRight', 
                        '', // Move to the right >> put in tooltip
                        'onTokenPositionRightSelection', 
                        "arc_"+locationsInfos.primary.tokenType+"tokenwrap"+locationsInfos.primary.location, 
                        false); 
                    this.addTooltip( 'moveRight', _("Move the Main animal token to the right"), '' );
                    dojo.addClass('moveRight','active arc_actionArrow arc_arrowRight');
                    dojo.removeClass('moveRight','action-button bgabutton bgabutton_blue');
                    
                    this.addActionButtonForPlayersAndSpectators('btnMoveRight', _("Move the Main animal token to the right"), "onTokenPositionRightSelection");
                    
                    if (locationsInfos.secondary.left && !moveFirstTokenActivePower) {
                        // oposite side highlight on mouse over
                        dojo.query('#moveRight, #btnMoveRight, #btnSecondaryMoveRight').on('mouseover', function(){
                            dojo.removeClass('moveRight','arc_slightlyHidden');
                            if (locationsInfos.primary.left && locationsInfos.secondary.right) dojo.addClass('moveLeft','arc_slightlyHidden');
                            if (locationsInfos.primary.left && locationsInfos.secondary.right) dojo.removeClass('secondaryMoveRight','active');
                            dojo.addClass('secondaryMoveLeft','active');
                        });
                        dojo.query('#moveRight, #btnMoveRight, #btnSecondaryMoveRight').on('mouseout', function(){
                            dojo.removeClass('moveRight','arc_slightlyHidden');
                            if (locationsInfos.primary.left && locationsInfos.secondary.right) dojo.removeClass('moveLeft','arc_slightlyHidden');
                            if (locationsInfos.primary.left && locationsInfos.secondary.right) dojo.removeClass('secondaryMoveRight','active');
                            dojo.removeClass('secondaryMoveLeft','active');
                        });
                    }
                    if (!locationsInfos.secondary.left && !moveFirstTokenActivePower) {
                        // identical side highlight on mouse over
                        // avoid opposite side treatment
                        dojo.query('#moveRight, #btnMoveRight, #btnSecondaryMoveRight').on('mouseover', function(){
                            //dojo.removeClass('moveRight','arc_slightlyHidden');
                            //dojo.addClass('moveLeft','arc_slightlyHidden');
                            dojo.addClass('secondaryMoveRight','active');
                            //dojo.addClass('secondaryMoveLeft','active');
                        });
                        dojo.query('#moveRight, #btnMoveRight, #btnSecondaryMoveRight').on('mouseout', function(){
                            //dojo.removeClass('moveRight','arc_slightlyHidden');
                            //dojo.removeClass('moveLeft','arc_slightlyHidden');
                            dojo.removeClass('secondaryMoveRight','active');
                            //dojo.removeClass('secondaryMoveLeft','active');
                        });
                    }
                }
            }
            if (moveFirstTokenActivePower) {
                this.addActionButtonForPlayersAndSpectators( 'endMoveToken', _("Do not use this power ")+this.getAnimalIcon("walrus")+_(" Do not move the Main animal token"), 'onEndMoveTokenSelection' );
            }
            if (moveSecondTokenActivePower) {
                this.addActionButtonForPlayersAndSpectators( 'endMoveToken', _("Do not use this power ")+this.getAnimalIcon("walrus")+_(" Do not move the Companion animal token"), 'onEndMoveTokenSelection' );
            }
            //this.addActionButtonForPlayersAndSpectators( 'moveToken_Right', _('Move to the right'), 'onTokenPositionRightSelection' ); 

        },
        highlightTokensToMove(moveFirstTokenPowerActive, moveSecondTokenPowerActive) {
            let tokensToMove = this.getTokensToMoveInfos();
            for (let tokenIndex in tokensToMove) {
                if ((moveFirstTokenPowerActive && tokensToMove[tokenIndex].tokenType == "secondary") || 
                    (moveSecondTokenPowerActive && tokensToMove[tokenIndex].tokenType == "primary")) {
                    continue;
                }
                //console.log("highlight "+tokensToMove[tokenIndex].tokenType+" token : "+"tokenwrap"+tokensToMove[tokenIndex].location+"_item_"+tokensToMove[tokenIndex].id);
                dojo.addClass("arc_tokenwrap"+tokensToMove[tokenIndex].location+"_item_"+tokensToMove[tokenIndex].id, "arc_higlighted"+tokensToMove[tokenIndex].tokenType+"token");
                dojo.place("arc_tokenwrap"+tokensToMove[tokenIndex].location+"_item_"+tokensToMove[tokenIndex].id, "arc_"+tokensToMove[tokenIndex].tokenType+"tokenwrap"+tokensToMove[tokenIndex].location, "first");
                this.slideToObject("arc_tokenwrap"+tokensToMove[tokenIndex].location+"_item_"+tokensToMove[tokenIndex].id, "arc_"+tokensToMove[tokenIndex].tokenType+"tokenwrap"+tokensToMove[tokenIndex].location).play();
            }
        },
        unhighlightTokens() {
            dojo.query("#arc_landscape .stockitem").removeClass("arc_higlightedprimarytoken");
            dojo.query("#arc_landscape .stockitem").removeClass("arc_higlightedsecondarytoken");
            for (let landscapeIndex = 1; landscapeIndex <= 6 ; landscapeIndex++)
            {
                dojo.query("#arc_primarytokenwrap"+landscapeIndex+" .stockitem").place("#arc_tokenwrap"+landscapeIndex, "last");
                dojo.query("#arc_secondarytokenwrap"+landscapeIndex+" .stockitem").place("#arc_tokenwrap"+landscapeIndex, "last");
                this.tokenStock[landscapeIndex-1].updateDisplay();
            }
        },
        // Converts hexadecimal color to RGB
        // call example : hexToRgb("#0033ff").g; // "51";
        // call example : hexToRgb("#03f").g; // "51";
        hexToRgb(hex) {
            // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
            let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function(m, r, g, b) {
                return r + r + g + g + b + b;
            });
            
            let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },
              
        // Get totem or token unique identifier based on its animal
        getTotemOrTokenUniqueType : function(animalType) {
            return (animalType - 1);
        }, 
        // Get card unique identifier based on its animal and value
        getCardUniqueType : function(deckIndexAndAnimalType, value) {
            let uniqueCardPosition = this.getCardUniquePosition(parseInt(deckIndexAndAnimalType.split("_")[1]), value);
            return deckIndexAndAnimalType.split("_")[0]+""+uniqueCardPosition;
        },
        getCardUniquePosition : function(animalType, value) {
            return (animalType - 1) * 5 + (value - 1);
        },
        // Get unique card type animal type 
        getUniqueCardTypeAnimalType : function(type) {
            let typeWithoutDeckIndex = parseInt(type.toString().slice(1));
            let animalType = Math.floor(typeWithoutDeckIndex / 5) + 1;
            return animalType;
        },
        // Get unique card type animal type 
        getUniqueCardTypeSecondaryTokenType : function(type) {
            let deckIndex = parseInt(type.toString().slice(0, 1));
            let primaryAnimalToken = this.getUniqueCardTypeAnimalType(type);
            let drawCounter = this.getUniqueCardTypeValue(type);
            let secondaryAnimalToken = 0;
            if ((drawCounter + primaryAnimalToken) >= (primaryAnimalToken + 7 - deckIndex)) {
                secondaryAnimalToken = 1;
            }
            secondaryAnimalToken += (drawCounter + primaryAnimalToken + deckIndex - 1) % 6;
            if (secondaryAnimalToken == 0) secondaryAnimalToken = 6; // retarget index for bear animal type
        
            //let secondaryAnimalToken = ((this.getUniqueCardTypeAnimalType(type)+this.getUniqueCardTypeValue(type)) % 6) + deckIndex - 1;
            //if (secondaryAnimalToken == 0) secondaryAnimalToken = 6; // retarget index for bear animal type

            /*//console.log(
                "getUniqueCardTypeSecondaryTokenType type : "+type+
                " deckIndex : "+deckIndex+
                " primaryAnimalToken : "+primaryAnimalToken + 
                " drawCounter : "+drawCounter + 
                " secondaryAnimalToken : "+secondaryAnimalToken);
                */
            return secondaryAnimalToken;
        },
        
        // Get unique card type pick value 
        getUniqueCardTypeValue : function(type) {
            let typeWithoutDeckIndex = parseInt(type.toString().slice(1));
            let value = typeWithoutDeckIndex % 5 + 1;
            return value;
        },
        // Get unique card type stack value
        getUniqueCardTypeStackValue : function(type) {
            let cardTypePickValue = this.getUniqueCardTypeValue(type);
            let value = 6 - cardTypePickValue;
            return value;
        },
        /*

        // Get unique card type animal type 
        getUniqueCardTypeAnimalType : function(type) { // 214
            let typeWithoutDeckIndex = parseInt(type.toString().slice(1)); // 14
            let animalType = Math.floor(typeWithoutDeckIndex / 5) + 1; // 2+1 = 3
            return animalType;
        },
        // Get unique card type animal type 
        getUniqueCardTypeSecondaryTokenType : function(type) {
            let deckIndex = parseInt(type.split("_")[0]);//2
            let secondaryAnimalToken = ((this.getUniqueCardTypeAnimalType(type)+this.getUniqueCardTypeValue(type)) % 6);// +deckIndex; // ((3+3 % 6 = 0)+2=2
            if (secondaryAnimalToken == 0) secondaryAnimalToken = 6; // retarget index for bear animal type
            return secondaryAnimalToken;
        },
        
        // Get unique card type animal type 
        getUniqueCardTypeValue : function(type) { // 214
            let deckIndex = parseInt(type.split("_")[0]);//2
            let typeWithoutDeckIndex = parseInt(type.toString().slice(1));//14
            let value = typeWithoutDeckIndex % 5 + deckIndex;//14 % 5 = 2 + 2 = 4
            return value;
        },

        */
        getUniquePowerTypeAnimalType(type) {
            
            let animalType = Math.floor(type / 2) + 1;
            return animalType;
        },
        // Get totem unique identifier based on its animal and value
        getPowerUniqueType : function(animalType, value) {
            return (animalType - 1) * 2 + (value - 1);
        },
        playCardOnStack : function(player_id, deckIndexAndAnimalType, value, card_id, underStack, isFlipped, init = false) {
            this.cardsonstackData.push({
                id:card_id,
                type:deckIndexAndAnimalType,
                type_arg:value,
                flipped:isFlipped
            });
            //console.log("playCardOnStack function call with deckIndexAndAnimalType:"+deckIndexAndAnimalType+" value:"+value+" card_id:"+card_id);
            /*
            //console.log("player_id : "+player_id);
            //console.log("animalType : "+animalType);
            //console.log("value : "+value);
            //console.log("card_id : "+card_id);
            //console.log("this.cardWidth : "+this.cardWidth);
            //console.log("this.cardHeight : "+this.cardHeight);
            */
            /*dojo.place(this.format_block('jstpl_cardonotherplayerstack', {
                x : this.cardWidth * (value - 1),
                y : this.cardHeight * (animalType - 1),
                player_id : player_id
            }), 'arc_playerstack_' + player_id);*/
            
            if (player_id != this.player_id) {
                // Some opponent played a card
                let deckIndex = parseInt(deckIndexAndAnimalType.split("_")[0]);
                let animalType = parseInt(deckIndexAndAnimalType.split("_")[1]);
                dojo.place(this.format_block('jstpl_minifiedcardonstack', {
                    x : this.cardWidth * (value - 1),
                    y : this.cardHeight * (animalType - 1),
                    deck_index : deckIndex,
                    card_id : card_id
                }), 'arc_playerstack_' + player_id);

                // Move card from player panel
                    //this.placeOnObject(direction_card_parent_node, origin_card_id);
                    
                this.placeOnObject('arc_playerstack_' + player_id, 'overall_player_board_' + player_id);

                if (underStack) {
                    //dojo.place('arc_playerstack_' + player_id, 'overall_player_board_' + player_id, 'first');
                    dojo.query('#arc_cardonstack_' + card_id).prependTo('#arc_playerstack_' + player_id);
                }
                else if (isFlipped && !init) {
                     // place the card under the top stack card
                    let cardsElements = dojo.query("#arc_playerstack_" + player_id+" .arc_card");
                    //console.log("need to add flipped card before id : "+'#'+cardsElements[cardsElements.length-2].id);
                    dojo.query('#arc_cardonstack_' + card_id).insertBefore('#'+cardsElements[cardsElements.length-2].id);
                }
                
                //dojo.addClass(card_div, 'card_type_'+card_type_id);
                dojo.addClass('arc_cardonstack_' + card_id, 'arc_minifiedcard');

                // Destroy player stack placeholder
                dojo.destroy('arc_playerstackplaceholder_' + player_id);
                if (!init) {
                    // remove card from opponent player hand
                    let cardId = this.removeCardFromOpponentPlayerHand(player_id);
                    // Move it to its final destination
                    //this.slideToObject(origin_card_id, direction_card_parent_node).play();
                    this.slideToObject('arc_cp_board_hand_'+player_id+'_item_' + cardId, 'arc_playertable_' + player_id).play();
                    // Update player board pile info
                    this.updateOpponentPlayerPileCountAndTooltip(player_id, dojo.query(".arc_card", "arc_playerstack_" + player_id).length);
                }
                /*
                let slideAnim = this.slideToObject('arc_cardonstack_' + card_id, 'arc_playerstack_' + player_id);
                slideAnim.play();
                */
                this.notifqueue.setSynchronousDuration(500);
                if (underStack) {
                    let cardsCount = 1;
                    let cardsElements = dojo.query("#arc_playerstack_" + player_id+" .arc_card");
                    for (let i = 0; i < cardsElements.length; i++) {
                        //console.log("addCardDefinitionTooltip id : "+cardsElements[i].id);
                        this.addCardDefinitionTooltip(null, cardsElements[i].id, cardsElements[i].id.split("_")[1], cardsCount);
                        cardsCount++;
                    }
                }
                else if (isFlipped) {
                    // flip the card visually
                    dojo.addClass('arc_cardonstack_' + card_id, 'arc_turnedbackcardontable');
                    if (init) {
                        this.addCardDefinitionTooltip(null, 'arc_cardonstack_' + card_id, card_id, dojo.query(".arc_card", "arc_playerstack_" + player_id).length);
                    }
                    else {
                        // update definition tool tip of the stack cards
                        let cardsCount = 1;
                        let cardsElements = dojo.query("#arc_playerstack_" + player_id+" .arc_card");
                        for (let i = 0; i < cardsElements.length; i++) {
                            //console.log("addCardDefinitionTooltip id : "+cardsElements[i].id+" cardsCount : "+cardsCount);
                            this.addCardDefinitionTooltip(null, cardsElements[i].id, cardsElements[i].id.split("_")[1], cardsCount);
                            cardsCount++;
                        }
                    }
                }
                else {
                    this.addCardDefinitionTooltip(null, 'arc_cardonstack_' + card_id, card_id, dojo.query(".arc_card", "arc_playerstack_" + player_id).length);
                }
            } else {
                // You played a card. If it exists in your hand, move card from there and remove
                // corresponding item

                // Destroy player stack placeholder
                dojo.destroy('arc_playerstackplaceholder_' + player_id);
                //console.log("stack addtostock deckIndexAndAnimalType : "+deckIndexAndAnimalType);
                // Changes item weight in order to keep stack order & changes their tooltip
                if (underStack) {
                    this.stack.addToStockWithId(this.getCardUniqueType(deckIndexAndAnimalType, value), card_id);
                    let weightInfos = {};
                    let stackItems = this.stack.getAllItems();
                    for (let stackItemIndex in stackItems) {
                        let currentItemWeight = this.stack.getItemWeightById(stackItems[stackItemIndex].id);
                        weightInfos[stackItems[stackItemIndex].type] = currentItemWeight+1;
                    }
                    weightInfos[parseInt(this.getCardUniqueType(deckIndexAndAnimalType, value))] = 0;
                    this.stack.changeItemsWeight( weightInfos );
                    let cardsCount = 1;
                    stackItems = this.stack.getAllItems();
                    for (let stackItemIndex in stackItems) {
                        this.addCardDefinitionTooltip(this.stack, 'arc_mystack_item_' + stackItems[stackItemIndex].id, stackItems[stackItemIndex].id, cardsCount);
                        cardsCount++;
                    }
                }
                else if (isFlipped) {
                    if (init) {
                        this.stack.addToStockWithId(this.getCardUniqueType(deckIndexAndAnimalType, value), card_id);
                        // flip the card visually
                        dojo.addClass('arc_mystack_item_' + card_id, 'arc_turnedbackcardontable');
                        // update definition tool tip of the card
                        this.stack.changeItemsWeight( { [parseInt(this.getCardUniqueType(deckIndexAndAnimalType, value))]: this.stack.getAllItems().length-1 } );
                    }
                    else {
                        // retrives the top stack item id & weight before addind the new one
                        let stackItems = this.stack.getAllItems();
                        //console.log("stackItems.length : "+stackItems.length);
                        //console.log("stackItems[stackItems.length-1] : "+stackItems[stackItems.length-1]);
                        let topStackItemType = stackItems[stackItems.length-1].type;
                        let topStackItemWeight = this.stack.getItemWeightById(stackItems[stackItems.length-1].id);
                        //console.log("topStackItemWeight : "+topStackItemWeight);
                        this.stack.addToStockWithId(this.getCardUniqueType(deckIndexAndAnimalType, value), card_id);
                        // flip the card visually
                        dojo.addClass('arc_mystack_item_' + card_id, 'arc_turnedbackcardontable');
                        // place the card under the top stack card
                        this.stack.changeItemsWeight( { [parseInt(this.getCardUniqueType(deckIndexAndAnimalType, value))]: topStackItemWeight } );
                        // add 1 to the top stack card weight
                        let weightInfos = {};
                        weightInfos[topStackItemType] = topStackItemWeight+1;
                        this.stack.changeItemsWeight( weightInfos );
                        // update definition tool tip of the stack cards
                        stackItems = this.stack.getAllItems();
                        let cardsCount = 1;
                        for (let stackItemIndex in stackItems) {
                            this.addCardDefinitionTooltip(this.stack, 'arc_mystack_item_' + stackItems[stackItemIndex].id, stackItems[stackItemIndex].id, cardsCount);
                            cardsCount++;
                        }
                    }
                }
                else {
                    this.stack.addToStockWithId(this.getCardUniqueType(deckIndexAndAnimalType, value), card_id);
                    this.addCardDefinitionTooltip(this.stack, 'arc_mystack_item_' + card_id, card_id, this.stack.getAllItems().length);
                    this.stack.changeItemsWeight( { [parseInt(this.getCardUniqueType(deckIndexAndAnimalType, value))]: this.stack.getAllItems().length-1 } );
                    // temp controlling weight
                    let itemWeights = { [parseInt(this.getCardUniqueType(deckIndexAndAnimalType, value))]: this.stack.getAllItems().length-1 };
                    //console.log(JSON.stringify(itemWeights));
                    /*for (let stackItemIndex in this.stack.getAllItems()) {
                        //console.log('stack id : '+this.stack.getAllItems()[stackItemIndex]['id']+' weight : '+this.stack.getItemWeightById(this.stack.getAllItems()[stackItemIndex]['id']));
                    }*/
                }
                if (!init) {
                    this.removeCardFromOpponentPlayerHand(player_id, this.currentPlayerMinifiedHand);
                    // Update player board pile info
                    this.updateOpponentPlayerPileCountAndTooltip(player_id, this.stack.getAllItems().length);
                }
                if ($('arc_myhand_item_' + card_id)) {
                    
                    //this.placeOnObject(direction_card_parent_node, origin_card_id);
                    //this.placeOnObject('arc_playerstack_' + player_id, 'arc_myhand_item_' + card_id);
                    this.playerHand.removeFromStockById(card_id);
                    this.manageHandCardsOverlap(this.playerHand.count());
                }
                // Move it to its final destination
                //this.slideToObject(origin_card_id, direction_card_parent_node).play();
                if ($('arc_myhand_item_' + card_id)) {
                    let slideAnim = this.slideToObject('arc_myhand_item_' + card_id, 'arc_mystack_item_' + card_id);
                    slideAnim.play();
                    this.notifqueue.setSynchronousDuration(slideAnim.duration);
                }
            }
        },
        
        pickCard : function(player_id, deckIndexAndAnimalType, value, card_id, pickFromDeckPowerUsed, pickFromPenaltiesPowerUsed, pickCount) {
            
            //console.log("pickCard function call with deckIndexAndAnimalType:"+deckIndexAndAnimalType+" value:"+value+" card_id:"+card_id+" pickFromDeckPowerUsed:"+pickFromDeckPowerUsed+" pickFromPenaltiesPowerUsed:"+pickFromPenaltiesPowerUsed+" pickCount:"+pickCount);
            /*dojo.place(this.format_block('jstpl_cardonmyhand', {
                x : this.cardWidth * (value - 1),
                y : this.cardHeight * (animalType - 1),
                card_id : card_id
            }), 'my_hand');
            */
            /*dojo.place(this.format_block('jstpl_cardonotherplayerstack', {
                x : this.cardWidth * (value - 1),
                y : this.cardHeight * (animalType - 1),
                player_id : player_id
            }), 'arc_playerstack_' + player_id);*/
            
            if (player_id != this.player_id) {
                
                // add card to opponent player hand
                let cardId = this.addCardToOpponentPlayerHand(player_id);

                if (pickFromDeckPowerUsed == 1) {
                    this.pick.removeFromStock(pickCount);
                    if ($('arc_pick_item_' + pickCount)) {
                        let slideAnim = this.slideToObject('arc_pick_item_' +pickCount, 'arc_cp_board_hand_'+player_id+'_item_' + cardId);
                        slideAnim.play();
                        this.notifqueue.setSynchronousDuration(slideAnim.duration);
                    }
                    /*let pickItems = this.pick.getAllItems();
                    let topPickItem = null;
                    for (let pickItemIndex in pickItems) {
                        if (topPickItem == null || pickItems[pickItemIndex].weight > topPickItem.weight) {
                            topPickItem = pickItems[pickItemIndex];
                        }
                    }
                    
                    
                    let remainingDeckCardsCount = (topPickItem.id+1);
                    let endGameStockCount = (this.playersCount-1)*5;
                    let remainingDeckCardsCountBeforeLastTurn = remainingDeckCardsCount - endGameStockCount;
                    if (remainingDeckCardsCountBeforeLastTurn > 0) {

                    } else {

                    }*/
                }
                else if (pickFromPenaltiesPowerUsed == 1) {
                    //console.log("pickFromPenaltiesPowerUsed == true");
                    
                
                    if ($('arc_cardonpenalties_' + card_id)) {

                        // slide card from player penalties to player overall board
                        let slideAnim = this.slideToObject('arc_cardonpenalties_' + card_id, 'arc_cp_board_hand_'+player_id+'_item_' + cardId);
                        slideAnim.play();
                        this.notifqueue.setSynchronousDuration(slideAnim.duration);

                        // remove card from player penalties
                        dojo.destroy('arc_cardonpenalties_' + card_id);
                        // Update opponent player board pile info
                        this.updateOpponentPlayerPenaltiesCountAndTooltip(player_id, dojo.query(".arc_card", "arc_playerpenalties_" + player_id).length);
                        // update penalties tooltip
                        //this.addCardDefinitionTooltip(null, 'arc_cardonpenalties_' + card_id, card_id, dojo.query(".arc_card", "arc_playerpenalties_" + player_id).length);
                        
                        if (dojo.query(".arc_card", "arc_playerpenalties_" + player_id).length == 0) {
                            dojo.place(this.format_block('jstpl_playerpenaltiesplaceholder', {
                                player_id : player_id
                            }), 'arc_playerpenalties_' + player_id);
                        }
                        let remainingPenaltiesCards = dojo.query(".arc_card", "arc_playerpenalties_" + player_id);
                        for (let i = 0 ; i < remainingPenaltiesCards.length ; i++) {
                            /*console.debug(remainingPenaltiesCards[i], "at index", i);*/
                            this.addCardDefinitionTooltip(null, remainingPenaltiesCards[i].id, remainingPenaltiesCards[i].id.split("_")[1], ++i);
                        }
                    }
                }
                else {
                    // Some opponent picked a card
                    // Remove card from river
                    this.river.removeFromStockById(card_id);
                    // Move it to its final destination
                    //this.slideToObject(origin_card_id, direction_card_parent_node).play();
                    let slideAnim = this.slideToObject('arc_river_item_' + card_id, 'arc_cp_board_hand_'+player_id+'_item_' + cardId);
                    slideAnim.play();
                    this.notifqueue.setSynchronousDuration(slideAnim.duration);
                }
            }
            else {
                this.addCardToOpponentPlayerHand(player_id, this.currentPlayerMinifiedHand);
                if (pickFromDeckPowerUsed == 1) {
                    //console.log("pickFromDeckPowerUsed == true pickCount:"+pickCount);
                    if ($('arc_pick_item_' + pickCount)) {
                        this.playerHand.addToStockWithId(this.getCardUniqueType(deckIndexAndAnimalType, value), card_id);
                        this.manageHandCardsOverlap(this.playerHand.count());
                        this.pick.removeFromStock(pickCount);
                    }
                    if ($('arc_pick_item_' + pickCount)) {
                        let slideAnim = this.slideToObject('arc_pick_item_' +pickCount, 'arc_myhand_item_' + card_id);
                        slideAnim.play();
                        this.notifqueue.setSynchronousDuration(slideAnim.duration);
                    }
                }
                else if (pickFromPenaltiesPowerUsed == 1) {
                    //console.log("pickFromPenaltiesPowerUsed == true");
                    if ($('arc_mypenalties_item_' + card_id)) {
                        this.playerHand.addToStockWithId(this.getCardUniqueType(deckIndexAndAnimalType, value), card_id);
                        this.manageHandCardsOverlap(this.playerHand.count());
                    }
                    if ($('arc_mypenaltiesindetails_item_' + card_id)) {
                        // game view
                        let slideAnim = this.slideToObject('arc_mypenaltiesindetails_item_' + card_id, 'arc_myhand_item_' + card_id);
                        slideAnim.play();
                        this.notifqueue.setSynchronousDuration(slideAnim.duration);
                        this.mypenaltiesindetails.removeFromStockById(card_id);
                        this.mypenaltiesindetails.updateDisplay(); // re-layout
                    }
                    else {
                        // replay view
                        let slideAnim = this.slideToObject('arc_mypenalties_item_' + card_id, 'arc_myhand_item_' + card_id);
                        slideAnim.play();
                        this.notifqueue.setSynchronousDuration(slideAnim.duration);

                    }


                    this.penalties.removeFromStockById(card_id);
                    // Update opponent player board pile info
                    this.updateOpponentPlayerPenaltiesCountAndTooltip(player_id, this.penalties.getAllItems().length);
                    if (this.penalties.count() == 0) {
                        dojo.place(this.format_block('jstpl_currentplayerpenaltiesplaceholder', {
                            player_id : player_id
                        }), 'arc_mypenalties');
                    }
                    // update penalties tooltip
                    let remainingPenaltiesCards = this.penalties.getAllItems();
                    for (currentPenaltyIndex in remainingPenaltiesCards) {
                        let currentPenaltiesCount = parseInt(currentPenaltyIndex) + 1;
                        let cardId = remainingPenaltiesCards[currentPenaltyIndex].id;
                        /*console.debug(remainingPenaltiesCards[currentPenaltyIndex], "at index", currentPenaltyIndex);*/
                        $('arc_mypenalties_item_'+cardId).innerHTML = '<span class="arc_mypenalties_item_count">'+currentPenaltiesCount+"</span>";
                        this.penalties.changeItemsWeight( { [remainingPenaltiesCards[currentPenaltyIndex].type]: currentPenaltiesCount } );
                        this.addCardDefinitionTooltip(null, 'arc_mypenalties_item_'+cardId, cardId, currentPenaltiesCount);
                    }
                    //this.addCardDefinitionTooltip(null, 'arc_cardonpenalties_' + card_id, card_id, dojo.query(".arc_card", "arc_playerpenalties_" + player_id).length);
                }
                else {
                    // You picked a card. If it exists in the river, move card from there and remove
                    // corresponding item
                    if ($('arc_river_item_' + card_id)) {
                        this.playerHand.addToStockWithId(this.getCardUniqueType(deckIndexAndAnimalType, value), card_id);
                        this.manageHandCardsOverlap(this.playerHand.count());
                        this.river.removeFromStockById(card_id);
                        //this.placeOnObject(direction_card_parent_node, origin_card_id);
                        //this.placeOnObject('arc_river_item_'+card_id, 'arc_myhand');
                    }
                    // Move it to its final destination
                    //this.slideToObject(origin_card_id, direction_card_parent_node).play();
                    if ($('arc_river_item_' + card_id)) {
                        let slideAnim = this.slideToObject('arc_river_item_' + card_id, 'arc_myhand_item_' + card_id);
                        slideAnim.play();
                        this.notifqueue.setSynchronousDuration(slideAnim.duration);
                    }
                }
                //console.log("end pickCard function for currentplayer");
                this.addCardDefinitionTooltip(this.playerHand, 'arc_myhand_item_' + card_id, card_id);
            }
        },
        
        playCardOnPenalties : function(player_id, deckIndexAndAnimalType, value, card_id, pickCount, init = false) {
            
            if (player_id != this.player_id) {
                // Some opponent played a card
                let deckIndex = parseInt(deckIndexAndAnimalType.split("_")[0]);
                let animalType = parseInt(deckIndexAndAnimalType.split("_")[1]);
                dojo.place(this.format_block('jstpl_cardonpenalties', {
                    x : this.cardWidth * (value - 1),
                    y : this.cardHeight * (animalType - 1),
                    deck_index : deckIndex,
                    card_id : card_id
                }), 'arc_playerpenalties_' + player_id);
                if (!init) {
                    // Update opponent player board pile info
                    this.updateOpponentPlayerPenaltiesCountAndTooltip(player_id, dojo.query(".arc_card", "arc_playerpenalties_" + player_id).length);
                }
                // Move card from player panel
                    //this.placeOnObject(direction_card_parent_node, origin_card_id);
                this.placeOnObject('arc_playerpenalties_' + player_id, 'overall_player_board_' + player_id);
                
                this.addCardDefinitionTooltip(null, 'arc_cardonpenalties_' + card_id, card_id, dojo.query(".arc_card", "arc_playerpenalties_" + player_id).length);
                
                //dojo.addClass(card_div, 'card_type_'+card_type_id);
                dojo.addClass('arc_cardonpenalties_' + card_id, 'arc_minifiedcard');
                dojo.addClass('arc_cardonpenalties_' + card_id, 'arc_turnedbackcardontable');
                
                // Destroy player penalties placeholder
                dojo.destroy('arc_playerpenaltiesplaceholder_' + player_id);
                // Move it to its final destination
                //this.slideToObject(origin_card_id, direction_card_parent_node).play();
                if (pickCount !== undefined) {
                    this.activateBoardWrapper('arc_pick');
                    // from pick
                    this.pick.removeFromStockById(pickCount);
                    // Move it to its final destination
                    //this.slideToObject(origin_card_id, direction_card_parent_node).play();
                    let slideAnim = this.slideToObject('arc_pick_item_' + pickCount, 'arc_playerpenalties_' + player_id);
                    slideAnim.play();
                    this.notifqueue.setSynchronousDuration(slideAnim.duration);
                }
                else if (!init) {
                    // remove card from opponent player hand
                    let cardId = this.removeCardFromOpponentPlayerHand(player_id);
                    // Move it to its final destination
                    //this.slideToObject(origin_card_id, direction_card_parent_node).play();
                    let slideAnim = this.slideToObject('arc_cp_board_hand_'+player_id+'_item_' + cardId, 'arc_playerpenalties_' + player_id);
                    slideAnim.play();
                    this.notifqueue.setSynchronousDuration(slideAnim.duration);
                }
            } else {
                // You played a card. If it exists in your hand, move card from there and remove
                // corresponding item

                // Destroy player penalties placeholder
                dojo.destroy('arc_playerpenaltiesplaceholder_' + player_id);
                this.penalties.addToStockWithId(this.getCardUniqueType(deckIndexAndAnimalType, value), card_id);
                this.addCardDefinitionTooltip(null, 'arc_mypenalties_item_' + card_id, card_id, this.penalties.getAllItems().length);
                $('arc_mypenalties_item_'+card_id).innerHTML = '<span class="arc_mypenalties_item_count">'+this.penalties.getAllItems().length+"</span>";
                if (!init) {
                    this.removeCardFromOpponentPlayerHand(player_id, this.currentPlayerMinifiedHand);
                    // Update player board pile info
                    this.updateOpponentPlayerPenaltiesCountAndTooltip(player_id, this.penalties.getAllItems().length);
                }
                // Changes item weight in order to keep penalties order 
                this.penalties.changeItemsWeight( { [this.getCardUniqueType(deckIndexAndAnimalType, value)]: this.penalties.getAllItems().length } );
                if ($('arc_myhand_item_' + card_id)) {
                    this.activateBoardWrapper('arc_myhand');
                    this.activateBoardWrapper('arc_mypenalties');
                    //this.placeOnObject(direction_card_parent_node, origin_card_id);
                    //this.placeOnObject('arc_playerpenalties_' + player_id, 'arc_myhand_item_' + card_id);
                    
                    this.playerHand.removeFromStockById(card_id);
                    this.manageHandCardsOverlap(this.playerHand.count());
                    // Move it to its final destination
                    //this.slideToObject(origin_card_id, direction_card_parent_node).play();
                    let slideAnim = this.slideToObject('arc_myhand_item_' + card_id, 'arc_mypenalties_item_' + card_id);
                    slideAnim.play();
                    this.notifqueue.setSynchronousDuration(slideAnim.duration);
                }
                else if (pickCount !== undefined) {
                    this.activateBoardWrapper('arc_pick');
                    this.activateBoardWrapper('arc_mypenalties');
                    // from pick
                    this.pick.removeFromStockById(pickCount);
                    // Move it to its final destination
                    //this.slideToObject(origin_card_id, direction_card_parent_node).play();
                    let slideAnim = this.slideToObject('arc_pick_item_' + pickCount, 'arc_mypenalties_item_' + card_id);
                    slideAnim.play();
                    this.notifqueue.setSynchronousDuration(slideAnim.duration);
                }
            }
        },

        // reorder played cards (stack & penalties) to fit their played order
        compareCardLocationArg: function( a, b ) {
            if ( parseInt(a.location_arg) > parseInt(b.location_arg) ){
                return 1;
            }
            if ( parseInt(a.location_arg) < parseInt(b.location_arg) ){
                return -1;
            }
            return 0;
        },
        // Returns true for spectators, instant replay (during game), archive mode (after game end)
        isReadOnly: function () {
            return this.isSpectator || typeof g_replayFrom != 'undefined' || g_archive_mode;
        },
        // makes the player totem corresponding token more visible
        setupToken: function( token_div, token_type_id, token_id )
        {
            if (!this.isSpectator) {
                //console.log("playerTotemType : "+this.playerTotem.getAllItems()[0].type);
                let tokenAnimalName;
                for (let animalIndex in this.gamedatas.animals) {
                    if (animalIndex == token_type_id + 1) {
                        tokenAnimalName = this.gamedatas.animals[animalIndex].nametr;
                    }
                }
                if(this.playerTotem.getAllItems()[0].type == token_type_id){
                    dojo.addClass(token_div, 'arc_pulse');
                    let message = dojo.string.substitute( _("${animalName} is your Animal totem"), {
                        animalName : tokenAnimalName
                    } );
                    this.addTooltip( token_div.id, message, '' );
                }
                else {
                    let message = dojo.string.substitute( _("${animalName} is not your Animal totem"), {
                        animalName : tokenAnimalName
                    } );
                    this.addTooltip( token_div.id, message, '' );
                }
            }
        },

        ///////////////////////////////////////////////////
        //// Player's action
        
        /*
        
            Here, you are defining methods to handle player's action (ex: results of mouse click on 
            game objects).
            
            Most of the time, these methods:
            _ check the action is possible at this game state.
            _ make a call to the game server
        
        */
        
        /* Example:
        
        onMyMethodToCall1: function( evt )
        {
            //console.log( 'onMyMethodToCall1' );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );

            // Check that this action is possible (see "possibleactions" in states.inc.php)
            if( ! this.checkAction( 'myAction' ) )
            {   return; }

            this.ajaxcall( "/arctic/arctic/myAction.html", { 
                                                                    lock: true, 
                                                                    myArgument1: arg1, 
                                                                    myArgument2: arg2,
                                                                    ...
                                                                 }, 
                         this, function( result ) {
                            
                            // What to do after the server call if it succeeded
                            // (most of the time: nothing)
                            
                         }, function( is_error) {

                            // What to do after the server call in anyway (success or failure)
                            // (most of the time: nothing)

                         } );        
        },        
        
        */

        onPlayerHandSelectionChanged : function(opts) {
            if (this.isLongPress) {
                //console.log('onPlayerHandSelectionChanged Is long press - not continuing.');
                this.playerHand.unselectAll();
                return;
            }
            this.closeDetailsWrappers();
            let handSelectedItems = this.playerHand.getSelectedItems();
            if (handSelectedItems.length > 0) {
                if (this.checkAction('changeCardFromRiver', true) && opts.changeCardFromRiverPowerActive) {
                    let riverSelectedItems = this.river.getSelectedItems();
                    if (riverSelectedItems.length > 0) {
                        let action = 'changeCardFromRiver';
                        let hand_card_id = handSelectedItems[0].id;
                        let river_card_id = riverSelectedItems[0].id;
                        this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", {
                            hand_card_id : hand_card_id,
                            river_card_id : river_card_id,
                            lock : true
                        }, this, function(result) {
                        }, function(is_error) {
                        });
                        this.playerHand.unselectAll();
                        this.river.unselectAll();
                    }
                    else {
                        this.savedPageMainTitle =  $('pagemaintitletext').innerHTML;
                        this.savedPageGeneralActions = $('generalactions').innerHTML;
                        this.gamedatas.gamestate.descriptionmyturn = _("Use this power ")+this.getAnimalIcon("puffin")+_(" Choose a card from the River to swap.");
                        this.updatePageTitle();
                        // add button to play card on stack and bypass power
                        if (opts.playCardUnderStackPowerActive) {
                            this.addActionButtonForPlayersAndSpectators('btnPlayCardOnTopStack', _("Do not use any power ")+this.getAnimalIcon("fox")+"&nbsp;"+this.getAnimalIcon("puffin")+_(" Place the selected card on top of your personal pile"), dojo.hitch(this, "onPlayerHandSelectionChanged", {changeCardFromRiverPowerActive:false,playCardUnderStackPowerActive:false, playCardFlippedPowerActive:false, underStack:false, flippedCard:false}));
                            this.addActionButtonForPlayersAndSpectators('btnPlayCardOnBottomStack', _("Use this power ")+this.getAnimalIcon("fox")+_(" Place the selected card underneath your personal pile"), dojo.hitch(this, "onPlayerHandSelectionChanged", {changeCardFromRiverPowerActive:false,playCardUnderStackPowerActive:false, playCardFlippedPowerActive:false, underStack:true, flippedCard:false}));
                        }
                        else if (opts.playCardFlippedPowerActive) {
                            this.addActionButtonForPlayersAndSpectators('btnPlayCardFlippedOnStack', _("Use this power ")+this.getAnimalIcon("fox")+_(" Place the selected card face down underneath your visible Animal card"), dojo.hitch(this, "onPlayerHandSelectionChanged", {changeCardFromRiverPowerActive:false,playCardUnderStackPowerActive:false, playCardFlippedPowerActive:false, underStack:false, flippedCard:true}));
                            this.addActionButtonForPlayersAndSpectators('btnPlayCardOnStack', _("Do not use any power ")+this.getAnimalIcon("fox")+"&nbsp;"+this.getAnimalIcon("puffin")+_(" Place the selected card on top of your personal pile"), dojo.hitch(this, "onPlayerHandSelectionChanged", {changeCardFromRiverPowerActive:false,playCardUnderStackPowerActive:false, playCardFlippedPowerActive:false, }));
                        }
                        else {
                            this.addActionButtonForPlayersAndSpectators('btnPlayCardOnStack', _("Do not use this power ")+this.getAnimalIcon("puffin")+_(" Place the selected card on top of your personal pile"), dojo.hitch(this, "onPlayerHandSelectionChanged", {changeCardFromRiverPowerActive:false,playCardUnderStackPowerActive:false, playCardFlippedPowerActive:false, }));
                        }
                    }
                }
                else if (this.checkAction('playCardOnStack', true)) {
                    // Can play a card
                    
                    this.savedPageMainTitle =  $('pagemaintitletext').innerHTML;
                    if (opts.playCardUnderStackPowerActive || opts.playCardFlippedPowerActive) {
                        if (this.uniqueSelectedHandCardId != null) {
                            this.playerHand.unselectItem(this.uniqueSelectedHandCardId);
                            //console.log("unselect id:"+this.uniqueSelectedHandCardId);
                        }
                        else {
                            this.savedPageGeneralActions = $('generalactions').innerHTML;
                        }
                        handSelectedItems = this.playerHand.getSelectedItems();
                        if (handSelectedItems.length == 0) {
                            // should not exist, but happened to a player once
                            // will remove power elements & restore current state title and buttons
                            this.removeActionButtons();
                            $('pagemaintitletext').innerHTML = this.savedPageMainTitle;
                            $('generalactions').innerHTML = this.savedPageGeneralActions;
                            this.uniqueSelectedHandCardId = null;
                            return;
                        }
                        this.uniqueSelectedHandCardId = handSelectedItems[0].id;
                        //console.log("select id:"+this.uniqueSelectedHandCardId);
                        dojo.query("#generalactions #btnPlayCardOnTopStack").forEach(dojo.destroy);
                        dojo.query("#generalactions #btnPlayCardOnBottomStack").forEach(dojo.destroy);
                        dojo.query("#generalactions #btnPlayCardFlippedOnStack").forEach(dojo.destroy);
                        if (opts.playCardUnderStackPowerActive) {
                            this.addActionButtonForPlayersAndSpectators('btnPlayCardOnTopStack', _("Do not use this power ")+this.getAnimalIcon("fox")+_(" Place the selected card on top of your personal pile"), dojo.hitch(this, "onPlayerHandSelectionChanged", {changeCardFromRiverPowerActive:false,playCardUnderStackPowerActive:false, playCardFlippedPowerActive:false, underStack:false, flippedCard:false}));
                            this.addActionButtonForPlayersAndSpectators('btnPlayCardOnBottomStack', _("Use this power ")+this.getAnimalIcon("fox")+_(" Place the selected card underneath your personal pile"), dojo.hitch(this, "onPlayerHandSelectionChanged", {changeCardFromRiverPowerActive:false,playCardUnderStackPowerActive:false, playCardFlippedPowerActive:false, underStack:true, flippedCard:false}));
                        }
                        else if (opts.playCardFlippedPowerActive) {
                            this.addActionButtonForPlayersAndSpectators('btnPlayCardFlippedOnStack',_("Use this power ")+this.getAnimalIcon("fox")+_(" Place the selected card face down underneath your visible Animal card"), dojo.hitch(this, "onPlayerHandSelectionChanged", {changeCardFromRiverPowerActive:false,playCardUnderStackPowerActive:false, playCardFlippedPowerActive:false, underStack:false, flippedCard:true}));
                            this.addActionButtonForPlayersAndSpectators('btnPlayCardOnStack', _("Do not use this power ")+this.getAnimalIcon("fox")+_(" Place the selected card on top of your personal pile"), dojo.hitch(this, "onPlayerHandSelectionChanged", {changeCardFromRiverPowerActive:false,playCardUnderStackPowerActive:false, playCardFlippedPowerActive:false, }));
                        }
                        //console.log("buttons added");
                    }
                    else {
                        let action = 'playCardOnStack';
                        let card_id = handSelectedItems[0].id;                    
                        this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", {
                            id : card_id,
                            underStack : (opts.hasOwnProperty("underStack") ? opts.underStack : false),
                            flippedCard : (opts.hasOwnProperty("flippedCard") ? opts.flippedCard : false),
                            lock : true
                        }, this, function(result) {
                        }, function(is_error) {
                        });
    
                        this.playerHand.unselectAll();
                        this.uniqueSelectedHandCardId = null;
                    }
                }
                else if (this.checkAction('discardHandCard', true)) {
                    // Can discard a card
                    let action = 'discardHandCard';
                    let card_id = handSelectedItems[0].id;                    
                    this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", {
                        id : card_id,
                        lock : true
                    }, this, function(result) {
                    }, function(is_error) {
                    });

                    this.playerHand.unselectAll();
                }
                else {
                    this.playerHand.unselectAll();
                }
            }
            else {
                if (opts.playCardUnderStackPowerActive || opts.playCardFlippedPowerActive || opts.changeCardFromRiverPowerActive) {
                    
                    //console.log("unselect all todo");
                    this.uniqueSelectedHandCardId = null;
                    // remove power elements & restore current state title and buttons
                    this.removeActionButtons();
                    $('pagemaintitletext').innerHTML = this.savedPageMainTitle;
                    $('generalactions').innerHTML = this.savedPageGeneralActions;
                    //console.log("unselect all done");
                }
            }
        },
        onMyPenaltiesSelectionChanged : function(givePenaltyPowerActive) {
            if (this.isLongPress) {
                //console.log('onMyPenaltiesSelectionChanged Is long press - not continuing.');
                this.penalties.unselectAll();
                return;
            }
            this.closeDetailsWrappers();
            let items = this.penalties.getSelectedItems();
            if (givePenaltyPowerActive) {
                if (items.length > 0) {
                    // allow to select the player to give the penalty
                    //console.log("onMyPenaltiesSelectionChanged with givePenaltyPowerActive = true ");
                    
                    // #pagemaintitletext to save... and change
                    this.savedPageMainTitle =  $('pagemaintitletext').innerHTML;
                    this.savedPageGeneralActions = $('generalactions').innerHTML;
                    this.gamedatas.gamestate.descriptionmyturn = _("Use this power ")+this.getAnimalIcon("bear")+_(" Place a card in the Penalty zone of...");
                    this.updatePageTitle();

                    for (let playerId in this.gamedatas.players) {
                        if (playerId == this.player_id) {
                            continue;
                        }
                        //console.log("add onPlayersPenaltiesSelectionChangedHandler ["+playerId+"]");
                        let card_id = items[0].id; 
                        //this.onPlayersPenaltiesSelectionChangedHandler[playerId] = dojo.connect( $('#arc_playerpenalties_'+playerId), 'onclick', this, dojo.hitch(this, "onPlayersPenaltiesSelectionChanged", {playerId:playerId, cardId:card_id}) );
                        //this.addActionButtonForPlayersAndSpectators('btnGivePenalty', _('Give penalty card to'+this.gamedatas.players[playerId].name), 'onBtnGivePenalty');
                        this.addActionButtonForPlayersAndSpectators('btnGivePenalty_'+playerId, this.gamedatas.players[playerId].name, dojo.hitch(this, "onBtnGivePenalty", {playerId:playerId, cardId:card_id}));

                    }
                    //this.onPlayersPenaltiesSelectionChangedHandler[playerId] = dojo.connect( $('#arc_playerpenalties_'+playerId), 'onClick', this, 'onPlayersPenaltiesSelectionChanged' );
                }
                else {
                    // remove power elements & restore current state title and buttons
                    this.removeActionButtons();
                    $('pagemaintitletext').innerHTML = this.savedPageMainTitle;
                    $('generalactions').innerHTML = this.savedPageGeneralActions;
                }
            }
            else {
                
                if (items.length > 0) {
                    // show my penalties detail
                    let myPenaltiesItems = this.penalties.getAllItems();
                    //console.log("onMyPenaltiesSelectionChanged");
                    dojo.destroy("arc_mypenaltiesindetails");
                    dojo.place( this.format_block('jstpl_my_penalties_in_details', {MY_PENALTIES_TITLE : _("My Penalty zone")
                        /*playedAnimals : _("You played "+stackInfos.playedAnimalsTypes.length+" differents animal types"),
                        animalSeries : _("You are scoring with "+stackInfos.countingAnimalSeries.length+" animal series (WIP)")*/
                    } ), $('game_play_area_wrap') );
                    this.mypenaltiesindetails.removeAll();
                    for (penaltiesItemIndex in myPenaltiesItems) {
                        this.mypenaltiesindetails.addToStockWithId( myPenaltiesItems[penaltiesItemIndex].type, myPenaltiesItems[penaltiesItemIndex].id );
                        this.mypenaltiesindetails.changeItemsWeight( { [myPenaltiesItems[penaltiesItemIndex].type]: this.mypenaltiesindetails.getAllItems().length-1 } );
                    }
                }
                else {
                    this.penalties.unselectAll();
                    dojo.destroy('arc_my_penalties_in_details_wrapper');
                    dojo.destroy('arc_my_stack_in_details_wrapper');
                }
            }
        },
        onEndPlayCardOnStack : function() {
            this.closeDetailsWrappers();
            //console.log("onEndPlayCardOnStack call");
            let action = 'playCardOnStack';
            if (this.checkAction(action, true)) {
                // Can pick card                  
                this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", {
                    end : true,
                    lock : true
                }, this, function(result) {
                }, function(is_error) {
                });
            }
        },
        onEndPickCard : function() {
            this.closeDetailsWrappers();
            //console.log("onEndPickCard call");
            let action = 'pickCard';
            if (this.checkAction(action, true)) {
                // Can pick card                  
                this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", {
                    end : true,
                    lock : true
                }, this, function(result) {
                }, function(is_error) {
                });
            }
        },
        onBtnGivePenalty : function(data) {
            this.closeDetailsWrappers();
            //console.log("onBtnGivePenalty call");
            //console.log(data);
            if (data.hasOwnProperty("cardId") && data.hasOwnProperty("playerId")) {
                let action = 'givePenaltyCard';
                if (this.checkAction(action, true)) {
                    // Can pick card
                    let card_id = data.cardId;  
                    let player_id = data.playerId;                    
                    this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", {
                        card_id : card_id,
                        player_id : player_id,
                        lock : true
                    }, this, function(result) {
                    }, function(is_error) {
                    });
                    this.penalties.unselectAll();
                } else {
                    this.penalties.unselectAll();
                }
            }
        },
        onMyPenaltiesInDetailsSelectionChanged : function() {
            if (this.isLongPress) {
                //console.log('onMyPenaltiesInDetailsSelectionChanged Is long press - not continuing.');
                this.mypenaltiesindetails.unselectAll();
                return;
            }
            let items = this.mypenaltiesindetails.getSelectedItems();
            if (items.length > 0) {
                let action = 'pickCard';
                if (this.checkAction(action, true)) {
                    // Can pick card
                    let card_id = items[0].id;                    
                    this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", {
                        id : card_id,
                        fromDeck : false,
                        fromPenalties : true,
                        lock : true
                    }, this, function(result) {
                    }, function(is_error) {
                    });
                    this.mypenaltiesindetails.unselectAll();
                } else {
                    this.mypenaltiesindetails.unselectAll();
                }
            }
        },
        onMyStackSelectionChanged : function(getBackCardFromStackPowerActive) {
            if (this.isLongPress) {
                //console.log('onMyStackSelectionChanged Is long press - not continuing.');
                this.stack.unselectAll();
                return;
            }
            let myStackItems = this.stack.getAllItems();
            if (getBackCardFromStackPowerActive) {
                let topStackCard = myStackItems[myStackItems.length-1];
                if($('arc_mystack_item_' + topStackCard.id).classList.contains('arc_showCardBehind')) {
                    //console.log("onMyStackSelectionChanged contains topStackCardId : "+topStackCard.id);
                    $('arc_mystack_item_' + topStackCard.id).classList.remove('arc_showCardBehind');
                    $('arc_mystack_item_' + topStackCard.id).classList.add('arc_hideCardBehind');
                    if (myStackItems.length == 1) {
                        dojo.destroy('arc_playerstackplaceholder_' + this.player_id);
                        dojo.destroy('arc_my_stack_in_details_wrapper');
                    }
                }
                else {
                    //console.log("onMyStackSelectionChanged !contains topStackCardId : "+topStackCard.id);
                    $('arc_mystack_item_' + topStackCard.id).classList.add('arc_showCardBehind');
                    $('arc_mystack_item_' + topStackCard.id).classList.remove('arc_hideCardBehind');
                    // place holder to add?
                    if (myStackItems.length == 1) {
                        dojo.place(this.format_block('jstpl_currentplayerstackplaceholder', {
                            player_id : this.player_id
                        }), 'arc_mystack');
                    }
                }
            }
            if (this.stack.getSelectedItems().length > 0) {
                //console.log("onMyStackSelectionChanged getSelectedItems() > 0");
                let stackInfos = {playedAnimalsTypes : [], playedAnimalSeries: [], countingAnimalSeries: []};
                let lastAnimalType;
                for (let stackItemIndex in myStackItems) {
                    let currentStackItemAnimalType = this.getUniqueCardTypeAnimalType(myStackItems[stackItemIndex].type);
                    if (stackInfos.playedAnimalsTypes.indexOf(currentStackItemAnimalType) === -1) stackInfos.playedAnimalsTypes.push(currentStackItemAnimalType);
                    if (lastAnimalType == undefined || lastAnimalType !== currentStackItemAnimalType) {
                        stackInfos.playedAnimalSeries.push({[currentStackItemAnimalType]:1});
                    } else {
                        // add 1 to the last played animal series
                        stackInfos.playedAnimalSeries[stackInfos.playedAnimalSeries.length-1][currentStackItemAnimalType] = stackInfos.playedAnimalSeries[stackInfos.playedAnimalSeries.length-1][currentStackItemAnimalType]+1;
                    }
                    lastAnimalType = currentStackItemAnimalType;
                }
                //console.log(stackInfos);
                for (let seriesIndex in stackInfos.playedAnimalSeries) {
                    //console.log("stackInfos.playedAnimalSeries["+seriesIndex+"] : "+stackInfos.playedAnimalSeries[seriesIndex]);
                    for (const [key, value] of Object.entries(stackInfos.playedAnimalSeries[seriesIndex])) {
                        //console.log(`${key}: ${value}`);
                        if (value > 1 ) {
                            stackInfos.countingAnimalSeries.push(stackInfos.playedAnimalSeries[seriesIndex]);
                        }
                    }
                }
                //console.log(stackInfos);

                dojo.destroy('arc_my_stack_in_details_wrapper');
                dojo.destroy("arc_mystackindetails");
                dojo.place( this.format_block('jstpl_my_stack_in_details', {MY_STACK_TITLE: _("My pile")} ), $('game_play_area_wrap') );
                this.mystackindetails.removeAll();
                for (stackItemIndex in myStackItems) {
                    this.mystackindetails.addToStockWithId( myStackItems[stackItemIndex].type, myStackItems[stackItemIndex].id );
                    this.mystackindetails.changeItemsWeight( { [myStackItems[stackItemIndex].type]: this.mystackindetails.getAllItems().length-1 } );
                }
                for (let i in this.cardsonstackData) {
                    let card = this.cardsonstackData[i];
                    if (card.flipped && dojo.exists('arc_mystackindetails_item_' + card.id)) {
                        dojo.addClass('arc_mystackindetails_item_' + card.id, 'arc_turnedbackcardontable');
                    }
                }
                //this.stack.unselectAll();
            }
            else {
                //console.log("onMyStackSelectionChanged getSelectedItems() = 0");
                //document.getElementById('arc_my_stack_in_details_wrapper').remove();
                dojo.destroy('arc_my_stack_in_details_wrapper');
                dojo.destroy('arc_my_penalties_in_details_wrapper');
            }
        },
        onRiverSelectionChanged : function(changeCardFromRiverPowerActive) {
            if (this.isLongPress) {
                //console.log('onRiverSelectionChanged Is long press - not continuing.');
                this.river.unselectAll();
                return;
            }
            this.closeDetailsWrappers();
            //console.log("onRiverSelectionChanged");
            let riverSelectedItems = this.river.getSelectedItems();
            if (riverSelectedItems.length > 0) {
                if (this.checkAction('changeCardFromRiver', true) && changeCardFromRiverPowerActive) {
                    let handSelectedItems = this.playerHand.getSelectedItems();
                    if (handSelectedItems.length > 0) {
                        let action = 'changeCardFromRiver';
                        let hand_card_id = handSelectedItems[0].id;
                        let river_card_id = riverSelectedItems[0].id;
                        this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", {
                            hand_card_id : hand_card_id,
                            river_card_id : river_card_id,
                            lock : true
                        }, this, function(result) {
                        }, function(is_error) {
                        });
                        this.playerHand.unselectAll();
                        this.river.unselectAll();
                    }
                    else {
                        this.savedPageMainTitle = $('pagemaintitletext').innerHTML;
                        this.savedPageGeneralActions = $('generalactions').innerHTML;
                        this.gamedatas.gamestate.descriptionmyturn = _("Use this power ")+this.getAnimalIcon("puffin")+_(" Choose a card from your Hand to swap.");
                        this.updatePageTitle();
                    }
                }
                else if (this.checkAction('pickCard', true)) {
                    // Can pick card
                    let card_id = riverSelectedItems[0].id;  
                    let action = 'pickCard';                  
                    this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", {
                        id : card_id,
                        lock : true
                    }, this, function(result) {
                    }, function(is_error) {
                    });
                    this.river.unselectAll();
                } else {
                    this.river.unselectAll();
                }
            }
        },
        onPickFromDeckSelectionChanged : function() {
            if (this.isLongPress) {
                //console.log('onPickFromDeckSelectionChanged Is long press - not continuing.');
                this.pick.unselectAll();
                return;
            }
            //console.log("onPickFromDeckSelectionChanged");
            this.closeDetailsWrappers();
            let items = this.pick.getSelectedItems();
            if (items.length > 0) {
                let action = 'pickCard';
                if (this.checkAction(action, true)) {
                    // Can pick card from the deck                 
                    this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", {
                        id : null,
                        lock : true,
                        fromDeck : true,
                        fromPenalties : false
                    }, this, function(result) {
                    }, function(is_error) {
                    });
                    this.pick.unselectAll();
                } else {
                    this.pick.unselectAll();
                }
            }
        },
        onGetBackCardFromStack : function() {
            this.closeDetailsWrappers();
            let currentPlayerStackCards = this.stack.getAllItems();
            let topStackCard = currentPlayerStackCards[currentPlayerStackCards.length-1];
            if (currentPlayerStackCards.length > 0) {
                let action = 'getBackCardOnStack';
                if (this.checkAction(action, true)) {
                    // Can pick card from the deck                 
                    this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", {
                        id : topStackCard.id,
                        lock : true
                    }, this, function(result) {
                    }, function(is_error) {
                    });
                }
            }
        },
        onSecondTokenPositionLeftSelection : function() {
            this.onTokenPositionSelectionChanged(true, true);
        },
        onSecondTokenPositionRightSelection : function() {
            this.onTokenPositionSelectionChanged(false, true);
        },
        onTokenPositionLeftSelection : function() {
            this.onTokenPositionSelectionChanged(true, false);
        },
        onTokenPositionRightSelection : function() {
            this.onTokenPositionSelectionChanged(false, false);
        },
        onTokenPositionSelectionChanged : function(isLeft, isSecondaryToken) {
            if (this.isLongPress) {
                //console.log('onTokenPositionSelectionChanged Is long press - not continuing.');
                return;
            }
            this.closeDetailsWrappers();
            let action = 'moveTokens';
            if (this.checkAction(action, true)) {
                let currentPlayerStackCards = this.stack.getAllItems();
                let topStackCard = currentPlayerStackCards[currentPlayerStackCards.length-1];
                //console.log("top stack item id : "+topStackCard.id+" unique type : "+topStackCard.type);
                //console.log("top stack animal type : "+this.getUniqueCardTypeAnimalType(topStackCard.type));
                let animalToken = null;
                let animalTokenLocation = null;
                let animalTokenAnimalType = null;
                if (isSecondaryToken) {
                    animalTokenAnimalType = this.getUniqueCardTypeSecondaryTokenType(topStackCard.type);
                }
                else {
                    animalTokenAnimalType = this.getUniqueCardTypeAnimalType(topStackCard.type);
                }
                for (let tokenStockIndex in this.tokenStock)
                {
                    let tokens = this.tokenStock[tokenStockIndex].getAllItems();
                    for (let tokenIndex in tokens)
                    {
                        //console.log("tokens["+tokenIndex+"].type : "+tokens[tokenIndex].type+1 + " =? animalTokenAnimalType : "+animalTokenAnimalType);
                        if (tokens[tokenIndex].type+1 == animalTokenAnimalType) {
                            animalToken = tokens[tokenIndex];
                            animalTokenLocation = parseInt(tokenStockIndex)+1;
                            //console.log("animalToken.id : "+animalToken.id + " animalTokenAnimalType : "+animalTokenAnimalType);
                            break;
                        }
                    }
                    if (animalToken !== null) {
                        break;
                    }
                }
                //console.log("/" + this.game_name + "/" + this.game_name + "/" + action + ".html id : "+animalToken.id);
                this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", {
                    id : animalToken.id,
                    pos : animalTokenLocation+(isLeft ? -1 : 1),
                    lock : true
                }, this, function(result) {
                }, function(is_error) {
                });
            }
        },
        onEndMoveTokenSelection : function() {
            this.closeDetailsWrappers();
            let action = 'moveTokens';
            if (this.checkAction(action, true)) {
                //console.log("/" + this.game_name + "/" + this.game_name + "/" + action + ".html end : true");
                this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", {
                    end : true,
                    lock : true
                }, this, function(result) {
                }, function(is_error) {
                });
            }
        },
        reinitStockItemsWeight(stock) {
            let weightInfos = {};
            let stackItems = stock.getAllItems();
            let currentItemWeight = 1;
            for (let stackItemIndex in stackItems) {
                weightInfos[stackItems[stackItemIndex].type] = currentItemWeight;
                currentItemWeight++;
            }
            stock.changeItemsWeight( weightInfos );
        },
        onFlippedCardMove(arg) {
            if (this.isLongPress) {
                //console.log('onFlippedCardMove Is long press - not continuing.');
                return;
            }
            //console.log("onFlippedCardMove");
            let oldStock, newStock, oldSerieNumber, newSerieNumber;
            if (arg.moveRight) {
                oldStock = this.mystackinscoring[this.player_id][arg.fromSerieNumber-1];
                newStock = this.mystackinscoring[this.player_id][arg.fromSerieNumber];
                oldSerieNumber = arg.fromSerieNumber;
                newSerieNumber = arg.fromSerieNumber+1;
            }
            else {
                oldStock = this.mystackinscoring[this.player_id][arg.fromSerieNumber-1];
                newStock = this.mystackinscoring[this.player_id][arg.fromSerieNumber-2];
                oldSerieNumber = arg.fromSerieNumber;
                newSerieNumber = arg.fromSerieNumber-1;
            }
            // manage stock
            oldStock.removeFromStockById(arg.cardId);
            newStock.addToStockWithId( arg.cardType, arg.cardId );
            dojo.addClass('arc_mystackinscoring_'+this.player_id+'_'+(newSerieNumber)+'_item_' + arg.cardId, 'arc_turnedbackcardontable');
            
            // change weight
            this.reinitStockItemsWeight(oldStock);
            if (arg.moveRight) {
                let weightInfos = {};
                let stackItems = newStock.getAllItems();
                for (let stackItemIndex in stackItems) {
                    let currentItemWeight = newStock.getItemWeightById(stackItems[stackItemIndex].id);
                    weightInfos[stackItems[stackItemIndex].type] = currentItemWeight+1;
                }
                weightInfos[parseInt(arg.cardType)] = 0;
                newStock.changeItemsWeight( weightInfos );
            }
            else {
                newStock.changeItemsWeight( { [arg.cardType]: newStock.getAllItems().length } );
            }
            
            // animate move
            let slideAnim = this.slideToObject('arc_mystackinscoring_'+this.player_id+'_'+(oldSerieNumber)+'_item_' + arg.cardId, 'arc_mystackinscoring_'+this.player_id+'_'+(newSerieNumber)+'_item_' + arg.cardId);
            slideAnim.play();
            dojo.connect(slideAnim, 'onEnd', () => {
                this.manageSeriesButtons(oldStock, oldSerieNumber, newStock, newSerieNumber, arg.moveRight);
                this.addMoveFlippedCardButton(arg.cardId, arg.cardType, !arg.moveRight, newSerieNumber);
                this.updateScore(this.player_id, true);
            }); 
        },
        removeMoveFlippedCardButton(cardId) {
            dojo.destroy('flippedCardMove_'+cardId);
        },
        manageSeriesButtons(oldStock, oldSerieNumber, newStock, newSerieNumber, moveRight) {
            if (moveRight) {
                // add a right button for the old serie last card if flipped
                let oldSerieLastCard = oldStock.getAllItems()[oldStock.getAllItems().length-1];
                for (let i in this.cardsonstackData) {
                    let card = this.cardsonstackData[i];
                    if (card.flipped && oldSerieLastCard.id == card.id) {
                        this.addMoveFlippedCardButton(oldSerieLastCard.id, oldSerieLastCard.type, true, oldSerieNumber);
                    }
                }
                // remove left button for the new serie second card if flipped (the first card is the moved flipped card)
                let newSerieSecondCard = newStock.getAllItems()[1];
                for (let i in this.cardsonstackData) {
                    let card = this.cardsonstackData[i];
                    if (card.flipped && newSerieSecondCard.id == card.id) {
                        this.removeMoveFlippedCardButton(newSerieSecondCard.id);
                    }
                }
            }
            else {
                // add a left button for the old serie first card if flipped
                let oldSerieFirstCard = oldStock.getAllItems()[0];
                for (let i in this.cardsonstackData) {
                    let card = this.cardsonstackData[i];
                    if (card.flipped && oldSerieFirstCard.id == card.id) {
                        this.addMoveFlippedCardButton(oldSerieFirstCard.id, oldSerieFirstCard.type, false, oldSerieNumber);
                    }
                }
                // remove right button for the new serie last but one card if flipped (the last card is the moved flipped card)
                let newSerieLastButOneCard = newStock.getAllItems()[newStock.getAllItems().length-2];
                for (let i in this.cardsonstackData) {
                    let card = this.cardsonstackData[i];
                    if (card.flipped && newSerieLastButOneCard.id == card.id) {
                        this.removeMoveFlippedCardButton(newSerieLastButOneCard.id);
                    }
                }
            }
        },
        addMoveFlippedCardButton(cardId, cardType, moveRight, currentSerieNumber) {
            //if (!this.isCurrentPlayerActive()) { return; }
            this.addActionButtonForPlayersAndSpectators(
                'flippedCardMove_'+cardId, 
                '', // Move to the left/right >> put in tooltip
                dojo.hitch(this, "onFlippedCardMove", {
                    moveRight: moveRight,
                    fromSerieNumber:currentSerieNumber, 
                    cardId:cardId, 
                    cardType:cardType
                }),
                'arc_mystackinscoring_'+this.player_id+'_'+currentSerieNumber+'_item_' + cardId, 
                false);
            let tooltipMessage = "";
            if (moveRight) {
                tooltipMessage = _("Move this card to the right sequence");
            }
            else {
                tooltipMessage = _("Move this card to the left sequence");
            }
            this.addTooltip( 'flippedCardMove_'+cardId, tooltipMessage, '' );
            dojo.addClass('flippedCardMove_'+cardId,'active arc_actionArrow '+(moveRight ? 'arc_arrowRight' : 'arc_arrowLeft'));
            dojo.removeClass('flippedCardMove_'+cardId,'action-button bgabutton bgabutton_blue');
        },
        getFinalScoringSeries(player_id, args) {
            /*if (player_id != this.playerId) {
                args.
            }
            let myStackItems = this.stack.getAllItems();
            let stackInfos = {playedAnimalsTypes : [], playedAnimalSeries: [], countingAnimalSeries: []};
            let lastAnimalType;
            for (let stackItemIndex in myStackItems) {
                let currentStackItemAnimalType = this.getUniqueCardTypeAnimalType(myStackItems[stackItemIndex].type);
                if (stackInfos.playedAnimalsTypes.indexOf(currentStackItemAnimalType) === -1) stackInfos.playedAnimalsTypes.push(currentStackItemAnimalType);
                if (lastAnimalType == undefined || lastAnimalType !== currentStackItemAnimalType) {
                    stackInfos.playedAnimalSeries.push({[currentStackItemAnimalType]:1});
                } else {
                    // add 1 to the last played animal series
                    stackInfos.playedAnimalSeries[stackInfos.playedAnimalSeries.length-1][currentStackItemAnimalType] = stackInfos.playedAnimalSeries[stackInfos.playedAnimalSeries.length-1][currentStackItemAnimalType]+1;
                }
                lastAnimalType = currentStackItemAnimalType;
            }
            //console.log("stackInfos");
            //console.log(stackInfos);
            for (let seriesIndex in stackInfos.playedAnimalSeries) {
                //console.log("stackInfos.playedAnimalSeries["+seriesIndex+"] : "+stackInfos.playedAnimalSeries[seriesIndex]);
                for (const [key, value] of Object.entries(stackInfos.playedAnimalSeries[seriesIndex])) {
                    //console.log(`${key}: ${value}`);
                    if (value > 1 ) {
                        stackInfos.countingAnimalSeries.push(stackInfos.playedAnimalSeries[seriesIndex]);
                    }
                }
            }
            //console.log("stackInfos");
            //console.log(stackInfos);
            //return stackInfos;
            let scoringInfos = null;
            */
            if (args != null) {
                
                for (let scoringIndex in args.arcticScoring) {
                    //if (args.arcticScoring[scoringIndex].player_id == this.player_id) {
                    if (args.arcticScoring[scoringIndex].player_id == player_id) {
                        scoringInfos = args.arcticScoring[scoringIndex].scoringInfos;
                        break;
                    }
                }
            }
            else {
                scoringInfos = this.getScoringInfos(player_id);
            }
            let scoringSeries = [];
            let tempFlippedCardsCounter = 0;
            for (let scoring_info_index in scoringInfos) {
                if (scoringInfos[scoring_info_index].flipped) {
                    if (scoringSeries.length == 0 || 
                        scoringInfos[scoring_info_index].serieIndex != scoringSeries[scoringSeries.length-1].serieIndex) {
                        tempFlippedCardsCounter++;
                    }
                    else {
                        scoringSeries[scoringSeries.length-1].count++;
                    } 
                }
                else if (!scoringInfos[scoring_info_index].flipped && 
                        (scoringSeries.length == 0 || 
                        scoringInfos[scoring_info_index].serieIndex != scoringSeries[scoringSeries.length-1].serieIndex)) {
                    scoringSeries.push({
                        serieIndex:scoringInfos[scoring_info_index].serieIndex,
                        animalType:scoringInfos[scoring_info_index].animalType,
                        count: 1
                    });
                    scoringSeries[scoringSeries.length-1].count += tempFlippedCardsCounter;
                    tempFlippedCardsCounter = 0;
                } 
                else {
                    scoringSeries[scoringSeries.length-1].count++;
                }
            }
            //console.log("scoringSeries");
            //console.log(scoringSeries);
            let finalScoringSeries = scoringSeries;
            for (let serieIndex in finalScoringSeries) {
                // check if serie already has scoring info
                if (!finalScoringSeries[serieIndex].hasOwnProperty("isScoring")) {
                    // serie don't have scoring info : check count
                    if (finalScoringSeries[serieIndex].count <= 1) {
                        // ignore serie with count = 1
                        finalScoringSeries[serieIndex].isScoring = false;
                        continue;
                    }
                    let currentAnimalType = finalScoringSeries[serieIndex].animalType;
                    let sameAnimalTypeIndexs = [];
                    // get the same animal series indexs
                    for (let compareSerieIndex in finalScoringSeries) {
                        if (finalScoringSeries[compareSerieIndex].animalType == currentAnimalType) {
                            sameAnimalTypeIndexs.push(compareSerieIndex);
                        }
                    }
                    let currentAnimalSerieMaxCount = 0;
                    let currentAnimalSerieMaxCountIndex = null;
                    // get the highest count serie
                    for (let i = 0 ; i < sameAnimalTypeIndexs.length ; i++) {
                        if (finalScoringSeries[sameAnimalTypeIndexs[i]].count > currentAnimalSerieMaxCount) {
                            currentAnimalSerieMaxCountIndex = sameAnimalTypeIndexs[i];
                            currentAnimalSerieMaxCount = finalScoringSeries[sameAnimalTypeIndexs[i]].count;
                        }
                    }
                    // change scoring for all the same animal series
                    for (let i = 0 ; i < sameAnimalTypeIndexs.length ; i++) {
                        if (currentAnimalSerieMaxCountIndex == sameAnimalTypeIndexs[i]) {
                            currentAnimalSerieMaxCountIndex = sameAnimalTypeIndexs[i];
                            finalScoringSeries[sameAnimalTypeIndexs[i]].isScoring = true;
                        }
                        else {
                            finalScoringSeries[sameAnimalTypeIndexs[i]].isScoring = false;
                        }
                    }
                }
                else {
                    // serie already has scoring info : go to next serie
                    continue;
                }

                /*
                OLD/BROKEN
                if (!finalScoringSeries[serieIndex].hasOwnProperty("isScoring")) {
                    finalScoringSeries[serieIndex].isScoring = null;
                }
                if (finalScoringSeries[serieIndex].count <= 1) {
                    finalScoringSeries[serieIndex].isScoring = false;
                    continue;
                }
                if (finalScoringSeries[serieIndex].isScoring == null) {
                    // compare with added series and replace the old one if same animal and old count is lesser than new count
                    let sameAnimalSerieFound = false;
                    let sameAnimalSerieReplacement = false;
                    for (let compareSerieIndex in finalScoringSeries) {
                        if (serieIndex == compareSerieIndex) {
                            continue;
                        }
                        if (finalScoringSeries[serieIndex].animalType == finalScoringSeries[compareSerieIndex].animalType) {
                            sameAnimalSerieFound = true;
                            if (finalScoringSeries[serieIndex].count < finalScoringSeries[compareSerieIndex].count) {
                                finalScoringSeries[compareSerieIndex].isScoring = true;
                                finalScoringSeries[serieIndex].isScoring = false;
                                sameAnimalSerieReplacement = true;
                                break;
                            }
                            else if (finalScoringSeries[serieIndex].count == finalScoringSeries[compareSerieIndex].count) {
                                finalScoringSeries[compareSerieIndex].isScoring = false;
                                finalScoringSeries[serieIndex].isScoring = true;
                                sameAnimalSerieReplacement = true;
                                break;
                            }
                        }
                    }
                    if (!sameAnimalSerieFound || (sameAnimalSerieFound && !sameAnimalSerieReplacement)) {
                        finalScoringSeries[serieIndex].isScoring = true;
                    }
                }
                */
            }
            //console.log("finalScoringSeries");
            //console.log(finalScoringSeries);


            return finalScoringSeries;
        },
        getSeriePoints(cardsCount) {
            let seriePoints = 0;
            switch (cardsCount) {
                case 2 :
                    seriePoints += 1;
                    break;
                case 3 :
                    seriePoints += 3;
                    break;
                case 4 :
                    seriePoints += 6;
                    break;
                case 5 :
                    seriePoints += 10;
                    break;
                default :
                seriePoints += 15;
                    break;
            }
            return seriePoints;
        },
        computeAndDisplayScore(finalScoringSeries) {
            let scoringTable = {
                1:0,
                2:0,
                3:0,
                4:0,
                5:0,
                6:0,
                differentAnimalsSeriesScore:0,
                animalTotemScore:0,
                penaltiesScore:0,
                finalScore:0
            };
            let seriesScore = 0;
            let differentAnimalTypeScoringCount = 0;
            for (let scoringSerieIndex in finalScoringSeries) {
                if (finalScoringSeries[scoringSerieIndex]['isScoring']) {
                    let seriePoints = this.getSeriePoints(finalScoringSeries[scoringSerieIndex].count);
                    seriesScore += seriePoints;
                    scoringTable[finalScoringSeries[scoringSerieIndex].animalType] = seriePoints;
                    differentAnimalTypeScoringCount++;
                }
            }
            //console.log("seriesScore : "+seriesScore);
            
            let differentAnimalsSeriesScore = 0;
            switch (differentAnimalTypeScoringCount) {
                case 0:
                    break;
                case 1:
                    break;
                case 2:
                    differentAnimalsSeriesScore = 1;
                    break;
                case 3:
                    differentAnimalsSeriesScore = 3;
                    break;
                case 4:
                    differentAnimalsSeriesScore = 6;
                    break;
                case 5:
                    differentAnimalsSeriesScore = 10;
                    break;
                default:
                    differentAnimalsSeriesScore = 15;
                    break;
                }
            scoringTable.differentAnimalsSeriesScore = differentAnimalsSeriesScore;
            //console.log("differentAnimalsSeriesScore : "+differentAnimalsSeriesScore);
            let animalTotemScore = 0;
            let animalTotemType = null;
            for (let landscapeIndex = 1 ; landscapeIndex <= 6 ; landscapeIndex++) {
                let currentLandscapeTokens = this['tokens'+ landscapeIndex].getAllItems();
                for (let tokenIndex in currentLandscapeTokens) {
                    if (this.playerTotem.getAllItems()[0].type == currentLandscapeTokens[tokenIndex].type) {
                        animalTotemType = currentLandscapeTokens[tokenIndex].type;
                        switch (landscapeIndex) {
                            case 1:
                                break;
                            case 2:
                                animalTotemScore = 1;
                                break;
                            case 3:
                                animalTotemScore = 3;
                                break;
                            case 4:
                                animalTotemScore = 6;
                                break;
                            case 5:
                                animalTotemScore = 10;
                                break;
                            case 6:
                                animalTotemScore = 15;
                                break;
                            default:
                                //console.log("error finding totem landscape");
                                break;
                        }
                    }
                }
            }
            scoringTable.animalTotemScore = animalTotemScore;
            let penaltiesScore = this.penalties.getAllItems().length;
            scoringTable.penaltiesScore = penaltiesScore;
            let finalScore = differentAnimalsSeriesScore+seriesScore+animalTotemScore-penaltiesScore;
            scoringTable.finalScore = finalScore;
            scoringTable.animalTotemType = animalTotemType;
            //console.log("scoringTable");
            //console.log(scoringTable);
            
            this.displayValidationScore(scoringTable);
        },
        displayValidationScore(scoringTable) {
            dojo.query('#arc_myScoreInfos table').forEach(dojo.destroy);
            let starIcon = '&nbsp;<i class="fa fa-star"></i>';
            let htmlScoringTable = "<table>";
            htmlScoringTable += '<tr class="arc_row"><td id="arc_fox_series_score" class="arc_picto_wrapper"><div class="arc_picto arc_fox"></div></td><td>';
            htmlScoringTable += (scoringTable[1] != 0 ? scoringTable[1]+starIcon : '-') + '</td></tr>';
            htmlScoringTable += '<tr class="arc_row"><td id="arc_moose_series_score" class="arc_picto_wrapper"><div class="arc_picto arc_moose"></div></td><td>';
            htmlScoringTable += (scoringTable[2] != 0 ? scoringTable[2]+starIcon : '-') + '</td></tr>';
            htmlScoringTable += '<tr class="arc_row"><td id="arc_walrus_series_score" class="arc_picto_wrapper"><div class="arc_picto arc_walrus"></div></td><td>';
            htmlScoringTable += (scoringTable[3] != 0 ? scoringTable[3]+starIcon : '-') + '</td></tr>';
            htmlScoringTable += '<tr class="arc_row"><td id="arc_orca_series_score" class="arc_picto_wrapper"><div class="arc_picto arc_orca"></div></td><td>';
            htmlScoringTable += (scoringTable[4] != 0 ? scoringTable[4]+starIcon : '-') + '</td></tr>';
            htmlScoringTable += '<tr class="arc_row"><td id="arc_puffin_series_score" class="arc_picto_wrapper"><div class="arc_picto arc_puffin"></div></td><td>';
            htmlScoringTable += (scoringTable[5] != 0 ? scoringTable[5]+starIcon : '-') + '</td></tr>';
            htmlScoringTable += '<tr class="arc_row"><td id="arc_bear_series_score" class="arc_picto_wrapper"><div class="arc_picto arc_bear"></div></td><td>';
            htmlScoringTable += (scoringTable[6] != 0 ? scoringTable[6]+starIcon : '-') + '</td></tr>';
            htmlScoringTable += '<tr class="arc_row"><td id="arc_different_animal_series_count" class="arc_picto_wrapper"><div class="arc_picto arc_differentsAnimals"></div></td><td>';
            htmlScoringTable += (scoringTable.differentAnimalsSeriesScore != 0 ? scoringTable.differentAnimalsSeriesScore+starIcon : '-') + '</td></tr>';
            htmlScoringTable += '<tr class="arc_row"><td id="arc_totem_scoring" class="arc_picto_wrapper"><div class="arc_picto arc_pawn"></div></td><td>';
            let tokenAnimalName = "";
            for (let animalIndex in this.gamedatas.animals) {
                if (animalIndex == scoringTable.animalTotemType+1) {
                    tokenAnimalName = this.gamedatas.animals[animalIndex].name;
                }
            }
            let animalTotemPictoHtml = '<span class="arc_picto arc_token '+tokenAnimalName+'"></span>';
            htmlScoringTable += '<span class="arc_totemTableScore">'+(scoringTable.animalTotemScore != 0 ? scoringTable.animalTotemScore+starIcon : '-')+'</span>'+animalTotemPictoHtml+'</td></tr>';
            htmlScoringTable += '<tr class="arc_row"><td id="arc_penalties_score" class="arc_picto_wrapper"><div class="arc_picto arc_discard"></div></td><td>';
            htmlScoringTable += (scoringTable.penaltiesScore != 0 ? '-'+scoringTable.penaltiesScore+starIcon : '-') + '</td></tr>';
            htmlScoringTable += '<tr class="arc_row"><td id="arc_total_score" class="arc_picto_wrapper"><div class="arc_picto arc_sum"></div></td><td class="arc_scoringSum">'+scoringTable.finalScore+'&nbsp;<i class="fa fa-star"></i></td></tr>';
            htmlScoringTable += '</table>';
            
            dojo.place( htmlScoringTable,
                'arc_myScoreInfos');
                
            this.addTooltip( 'arc_fox_series_score', _("Fox sequences score"), '' );
            this.addTooltip( 'arc_moose_series_score', _("Moose sequences score"), '' );
            this.addTooltip( 'arc_walrus_series_score', _("Walrus sequences score"), '' );
            this.addTooltip( 'arc_orca_series_score', _("Orca sequences score"), '' );
            this.addTooltip( 'arc_puffin_series_score', _("Puffin sequences score"), '' );
            this.addTooltip( 'arc_bear_series_score', _("Polar bear sequences score"), '' );
            this.addTooltip( 'arc_different_animal_series_count', _("Different animal sequences score"), '' );
            this.addTooltip( 'arc_totem_scoring', _("Totem position in landscape score"), '' );
            this.addTooltip( 'arc_penalties_score', _("Penalties score"), '' );
            this.addTooltip( 'arc_total_score', _("Total score"), '' );

        },
        displayFinalTableScore(args) {
            dojo.query('#arc_myScoreInfos table').forEach(dojo.destroy);
            for (let arcticScoringIndex in args.arcticScoring) {
                if (args.arcticScoring[arcticScoringIndex].finalScoringTable == undefined) {
                    return;
                }
            }

            // creates scoring different animal types wrapper
            dojo.place( this.format_block('jstpl_scoring_different_animal_types', {
                DIFFERENT_ANIMAL_TYPES_TITLE: _("Different animal types")
            } ), $('game_play_area') );
            // creates the animal stock
            this.animalsStock = new ebg.stock(); // new stock object for hand
            this.animalsStock.create( this, $('arc_different_animal_types'), this.cardWidth, this.cardHeight );
            this.animalsStock.container_div.width = "156px"; // enought just for 1 card
            this.animalsStock.autowidth = false; // this is required so it obeys the width set above
            this.animalsStock.image_items_per_row = 1; // 5 images per row in the deck
            this.animalsStock.use_vertical_overlap_as_offset = true;
            this.animalsStock.horizontal_overlap  = 0; // current bug in stock - this is needed to enable z-index on overlapping items
            this.animalsStock.setSelectionMode(0);
            this.animalsStock.updateDisplay(); // re-layout
            this.addAnimalTypesForScoring(this.animalsStock);

            // ajouter au stock chaque type d'animal qui score
            // afficher le score differentAnimalsSeriesScore
            
            let beginRowHtml = '<tr class="arc_row_'+args.arcticScoring.length+'">';
            let endRowHtml = '</tr>';
            let starIcon = '&nbsp;<i class="fa fa-star"></i>';
            let htmlScoringTable = "<table>";
            htmlScoringTable += beginRowHtml+'<th class="arc_picto_wrapper"></th>';
            for (let arcticScoringIndex in args.arcticScoring) htmlScoringTable += '<th><h3 style="color:#'+this.gamedatas.players[args.arcticScoring[arcticScoringIndex].player_id].color+';">'+this.gamedatas.players[args.arcticScoring[arcticScoringIndex].player_id].name+'</h3></th>';
            htmlScoringTable += endRowHtml;
            htmlScoringTable += beginRowHtml+'<td id="arc_fox_series_score" class="arc_picto_wrapper"><div class="arc_picto arc_fox"></div></td>';
            for (let arcticScoringIndex in args.arcticScoring) {
                if (args.arcticScoring[arcticScoringIndex].player_id == this.player_id && args.arcticScoring[arcticScoringIndex].finalScoringTable[1] != 0) {
                    this.animalsStock.addToStockWithId(6, 6);
                }
                htmlScoringTable += '<td>'+(args.arcticScoring[arcticScoringIndex].finalScoringTable[1] != 0 ? args.arcticScoring[arcticScoringIndex].finalScoringTable[1]+starIcon : '-')+'</td>';
            }
            htmlScoringTable += endRowHtml;
            htmlScoringTable += beginRowHtml+'<td id="arc_moose_series_score" class="arc_picto_wrapper"><div class="arc_picto arc_moose"></div></td>';
            for (let arcticScoringIndex in args.arcticScoring) {
                if (args.arcticScoring[arcticScoringIndex].player_id == this.player_id && args.arcticScoring[arcticScoringIndex].finalScoringTable[2] != 0) {
                    this.animalsStock.addToStockWithId(1, 1);
                }
                htmlScoringTable += '<td>'+(args.arcticScoring[arcticScoringIndex].finalScoringTable[2] != 0 ? args.arcticScoring[arcticScoringIndex].finalScoringTable[2]+starIcon : '-')+'</td>';
            }
            htmlScoringTable += endRowHtml;
            htmlScoringTable += beginRowHtml+'<td id="arc_walrus_series_score" class="arc_picto_wrapper"><div class="arc_picto arc_walrus"></div></td>';
            for (let arcticScoringIndex in args.arcticScoring)  {
                if (args.arcticScoring[arcticScoringIndex].player_id == this.player_id && args.arcticScoring[arcticScoringIndex].finalScoringTable[3] != 0) {
                    this.animalsStock.addToStockWithId(2, 2);
                }
                htmlScoringTable += '<td>'+(args.arcticScoring[arcticScoringIndex].finalScoringTable[3] != 0 ? args.arcticScoring[arcticScoringIndex].finalScoringTable[3]+starIcon : '-')+'</td>';
            }
            htmlScoringTable += endRowHtml;
            htmlScoringTable += beginRowHtml+'<td id="arc_orca_series_score" class="arc_picto_wrapper"><div class="arc_picto arc_orca"></div></td>';
            for (let arcticScoringIndex in args.arcticScoring)  {
                if (args.arcticScoring[arcticScoringIndex].player_id == this.player_id && args.arcticScoring[arcticScoringIndex].finalScoringTable[4] != 0) {
                    this.animalsStock.addToStockWithId(3, 3);
                }
                htmlScoringTable += '<td>'+(args.arcticScoring[arcticScoringIndex].finalScoringTable[4] != 0 ? args.arcticScoring[arcticScoringIndex].finalScoringTable[4]+starIcon : '-')+'</td>';
            }
            htmlScoringTable += endRowHtml;
            htmlScoringTable += beginRowHtml+'<td id="arc_puffin_series_score" class="arc_picto_wrapper"><div class="arc_picto arc_puffin"></div></td>';
            for (let arcticScoringIndex in args.arcticScoring)  {
                if (args.arcticScoring[arcticScoringIndex].player_id == this.player_id && args.arcticScoring[arcticScoringIndex].finalScoringTable[5] != 0) {
                    this.animalsStock.addToStockWithId(4, 4);
                }
                htmlScoringTable += '<td>'+(args.arcticScoring[arcticScoringIndex].finalScoringTable[5] != 0 ? args.arcticScoring[arcticScoringIndex].finalScoringTable[5]+starIcon : '-')+'</td>';
            }
            htmlScoringTable += endRowHtml;
            htmlScoringTable += beginRowHtml+'<td id="arc_bear_series_score" class="arc_picto_wrapper"><div class="arc_picto arc_bear"></div></td>';
            for (let arcticScoringIndex in args.arcticScoring)  {
                if (args.arcticScoring[arcticScoringIndex].player_id == this.player_id && args.arcticScoring[arcticScoringIndex].finalScoringTable[6] != 0) {
                    this.animalsStock.addToStockWithId(5, 5);
                }
                htmlScoringTable += '<td>'+(args.arcticScoring[arcticScoringIndex].finalScoringTable[6] != 0 ? args.arcticScoring[arcticScoringIndex].finalScoringTable[6]+starIcon : '-')+'</td>';
            }
            htmlScoringTable += endRowHtml;
            htmlScoringTable += beginRowHtml+'<td id="arc_different_animal_series_count" class="arc_picto_wrapper"><div class="arc_picto arc_differentsAnimals"></div></td>';
            for (let arcticScoringIndex in args.arcticScoring)  {
                if (args.arcticScoring[arcticScoringIndex].player_id == this.player_id) {
                    dojo.place( '<span class="arc_differentAnimalTypesScore">'+args.arcticScoring[arcticScoringIndex].finalScoringTable.differentAnimalsSeriesScore+'&nbsp;<i class="fa fa-star"></i></span>',
                        'arc_different_animal_types',
                        'last');
                }
                htmlScoringTable += '<td>'+(args.arcticScoring[arcticScoringIndex].finalScoringTable.differentAnimalsSeriesScore != 0 ? args.arcticScoring[arcticScoringIndex].finalScoringTable.differentAnimalsSeriesScore+starIcon : '-')+'</td>';
            }
            htmlScoringTable += endRowHtml;
            htmlScoringTable += beginRowHtml+'<td id="arc_totem_scoring" class="arc_picto_wrapper"><div class="arc_picto arc_pawn"></div></td>';
            for (let arcticScoringIndex in args.arcticScoring)  {
                if (args.arcticScoring[arcticScoringIndex].player_id == this.player_id) {
                    dojo.place( '<span class="arc_totemScore">'+args.arcticScoring[arcticScoringIndex].finalScoringTable.animalTotemScore+'&nbsp;<i class="fa fa-star"></i></span>',
                        'arc_totem_wrap',
                        'last');
                }
                
                let animalTotemCardType = args.arcticScoring[arcticScoringIndex].finalScoringTable.animalTotemType;
                let animalTotemPictoHtml = '<span class="arc_picto arc_token '+this.gamedatas.animals[animalTotemCardType].name+'"></span>';

                htmlScoringTable += '<td><span class="arc_totemTableScore">'+(args.arcticScoring[arcticScoringIndex].finalScoringTable.animalTotemScore != 0 ? args.arcticScoring[arcticScoringIndex].finalScoringTable.animalTotemScore+starIcon : '-')+'</span>'+animalTotemPictoHtml+'</td>';
            }
            htmlScoringTable += endRowHtml;
            htmlScoringTable += beginRowHtml+'<td id="arc_penalties_score" class="arc_picto_wrapper"><div class="arc_picto arc_discard"></div></td>';
            for (let arcticScoringIndex in args.arcticScoring)  {
                if (args.arcticScoring[arcticScoringIndex].player_id == this.player_id) {
                    dojo.place( '<span class="arc_penaltiesScore">-'+args.arcticScoring[arcticScoringIndex].finalScoringTable.penaltiesScore+'&nbsp;<i class="fa fa-star"></i></span>',
                        'arc_mypenalties',
                        'last');
                }
                htmlScoringTable += '<td>'+(args.arcticScoring[arcticScoringIndex].finalScoringTable.penaltiesScore != 0 ? '-'+args.arcticScoring[arcticScoringIndex].finalScoringTable.penaltiesScore+starIcon : '-')+'</td>';
            }
            htmlScoringTable += endRowHtml;
            htmlScoringTable += beginRowHtml+'<td id="arc_total_score" class="arc_picto_wrapper"><div class="arc_picto arc_sum"></div></td>';
            for (let arcticScoringIndex in args.arcticScoring)  {
                htmlScoringTable += '<td class="arc_scoringSum">'+args.arcticScoring[arcticScoringIndex].finalScoringTable.finalScore+'&nbsp;<i class="fa fa-star"></i></td>';
            }
            htmlScoringTable += endRowHtml;
            htmlScoringTable += "</table>";
            // tmp debug animaltypes 
            /*
            this.animalsStock.addToStockWithId(1, 1);
            this.animalsStock.addToStockWithId(2, 2);
            this.animalsStock.addToStockWithId(3, 3);
            this.animalsStock.addToStockWithId(4, 4);
            this.animalsStock.addToStockWithId(5, 5);
            this.animalsStock.addToStockWithId(6, 6);
            */
            dojo.place( htmlScoringTable,
                'arc_myScoreInfos');

            this.addTooltip( 'arc_fox_series_score', _("Fox sequences score"), '' );
            this.addTooltip( 'arc_moose_series_score', _("Moose sequences score"), '' );
            this.addTooltip( 'arc_walrus_series_score', _("Walrus sequences score"), '' );
            this.addTooltip( 'arc_orca_series_score', _("Orca sequences score"), '' );
            this.addTooltip( 'arc_puffin_series_score', _("Puffin sequences score"), '' );
            this.addTooltip( 'arc_bear_series_score', _("Polar bear sequences score"), '' );
            this.addTooltip( 'arc_different_animal_series_count', _("Different animal sequences score"), '' );
            this.addTooltip( 'arc_totem_scoring', _("Totem position in landscape score"), '' );
            this.addTooltip( 'arc_penalties_score', _("Penalties score"), '' );
            this.addTooltip( 'arc_total_score', _("Total score"), '' );

            this.onScreenWidthChange();
        },
        updateScore(player_id, validation, args = null) {
            let finalScoringSeries = this.getFinalScoringSeries(player_id, args);
            //console.log("finalScoringSeries for player:"+player_id+" => "+JSON.stringify(finalScoringSeries));
            this.manageSeriesScoring(player_id, finalScoringSeries);
            if (validation) {
                if (!this.isSpectator) {
                    this.computeAndDisplayScore(finalScoringSeries);
                }
            }
            else if ((player_id == this.player_id && !this.isSpectator ) || this.isSpectator) {
                this.displayFinalTableScore(args);
            }
        },
        createSeriesToValidate() {
            this.mystackinscoring[this.player_id] = [];
            let lastStackItemAnimalType = null;
            let position = "top";
            let seriesCounter = 0;
            let myStackItems = this.stack.getAllItems();
            let lastStackItemIsFlipped = false;
            let nextStackItemIsFlipped = false;
            for (let stackItemIndex = 0; stackItemIndex < myStackItems.length ; stackItemIndex++) {
                let currentCardIsFlipped = false;
                let currentStackItemAnimalType = this.getUniqueCardTypeAnimalType(myStackItems[stackItemIndex].type);
                // retrieves the flipped info of the current card
                for (let i in this.cardsonstackData) {
                    let card = this.cardsonstackData[i];
                    if (card.flipped && myStackItems[stackItemIndex].id == card.id) {
                        // current stack item is flipped
                        //console.log("CurrentCardId : "+card.id + " is flipped");
                        currentCardIsFlipped = true;
                    }
                    let nextCard = this.cardsonstackData[(parseInt(i)+1)];
                    if (nextCard !== undefined && nextCard.flipped && myStackItems[stackItemIndex+1] !== undefined && myStackItems[stackItemIndex+1].id == nextCard.id) {
                        // next stack item is flipped
                        //console.log("CurrentCardId : "+card.id + " next card id : "+nextCard.id + " is flipped");
                        nextStackItemIsFlipped = true;
                        break;
                    }
                    else {
                        nextStackItemIsFlipped = false;
                    }
                }
                let newSerieToCreate = false;
                
                // check if a new card serie need to be created
                // case where needed : first card 
                if (lastStackItemAnimalType == null) {
                    newSerieToCreate = true;
                }
                // case where needed : new animal type 
                if ((lastStackItemAnimalType != null && lastStackItemAnimalType !== currentStackItemAnimalType) && 
                    !currentCardIsFlipped) {
                    newSerieToCreate = true;
                }
                // case where NOT needed : the first card is flipped
                if (lastStackItemAnimalType == null && lastStackItemIsFlipped) {
                    newSerieToCreate = false;
                }
                if (newSerieToCreate) {
                    position = (position == "top") ? "bottom" : "top";
                    seriesCounter++;
                    dojo.place( this.format_block('jstpl_scoring_serie', {
                        seriesCounter : seriesCounter,
                        player_id : this.player_id
                    } ), $('arc_myStackSeries_current_player') );
                    dojo.addClass('arc_mystackinscoring_'+this.player_id+'_'+seriesCounter, position);
                    // Current animal stack in scoring
                    let serieStock = new ebg.stock(); // new stock object for hand
                    this.mystackinscoring[this.player_id].push(serieStock);
                    serieStock.create( this, $('arc_mystackinscoring_'+this.player_id+'_'+seriesCounter), this.cardWidth, this.cardHeight );
                    serieStock.image_items_per_row = 5; // 5 images per row in the deck
                    serieStock.container_div.width = "156px"; // enought just for 1 card
                    serieStock.autowidth = false; // this is required so it obeys the width set above
                    serieStock.use_vertical_overlap_as_offset = true; // this is to use normal vertical_overlap
                    serieStock.vertical_overlap = 0; // overlap
                    serieStock.horizontal_overlap  = 23; // current bug in stock - this is needed to enable z-index on overlapping items
                    serieStock.item_margin = 0; // has to be 0 if using overlap
                    serieStock.setSelectionMode(0);
                    serieStock.updateDisplay(); // re-layout
                    this.addItemTypesForScoring(serieStock);
                }
                let currentSerieStock = this.mystackinscoring[this.player_id][this.mystackinscoring[this.player_id].length-1];
                currentSerieStock.addToStockWithId( myStackItems[stackItemIndex].type, myStackItems[stackItemIndex].id );
                currentSerieStock.changeItemsWeight( { [myStackItems[stackItemIndex].type]: currentSerieStock.getAllItems().length-1 } );
                let addMoveRightButtonToFlippedCard = true;
                let addMoveLeftButtonToFlippedCard = true;
                if (currentCardIsFlipped) {
                    // check if flipped card is in first position to avoid creating move buttons
                    if (lastStackItemAnimalType == null) {
                        //console.log("CurrentCardId : "+myStackItems[stackItemIndex].id+" : lastStackItemAnimalType == null");
                        addMoveRightButtonToFlippedCard = false;
                        addMoveLeftButtonToFlippedCard = false;
                    }
                    // check if next card is flipped to avoid creating a move right button
                    if (nextStackItemIsFlipped) {
                        //console.log("CurrentCardId : "+myStackItems[stackItemIndex].id+" : nextStackItemIsFlipped");
                        addMoveRightButtonToFlippedCard = false;
                    }
                    // check if last card is flipped to avoid creating a move left button
                    // check also if the current card creates a new serie, if not avoid creating the button
                    if (lastStackItemIsFlipped || !newSerieToCreate) {
                        addMoveLeftButtonToFlippedCard = false;
                    }
                    // preregister for next card
                    lastStackItemIsFlipped = true;
                }
                else {
                    // preregister for next card
                    lastStackItemAnimalType = currentStackItemAnimalType;
                    lastStackItemIsFlipped = false;
                }
                // check if card is flipped and has been created in the page
                if (currentCardIsFlipped && dojo.exists('arc_mystackinscoring_'+this.player_id+'_'+seriesCounter+'_item_' + myStackItems[stackItemIndex].id)) {
                    // flip the card in the page
                    dojo.addClass('arc_mystackinscoring_'+this.player_id+'_'+seriesCounter+'_item_' + myStackItems[stackItemIndex].id, 'arc_turnedbackcardontable');
                    
                    let nextStackItemAnimalType = null;
                    // check if a card is following the current flipped card (is it the last one?)
                    if (myStackItems[stackItemIndex+1] !== undefined) {
                        
                        //console.log("CurrentCardId : "+myStackItems[stackItemIndex].id+" : myStackItems[stackItemIndex+1] !== undefined");
                        nextStackItemAnimalType = this.getUniqueCardTypeAnimalType(myStackItems[stackItemIndex+1].type);
                        // check if the following card animal type is different  from the previous card animal type
                        if (lastStackItemAnimalType !== nextStackItemAnimalType) {
                            //console.log("CurrentCardId : "+myStackItems[stackItemIndex].id+" : lastStackItemAnimalType !== nextStackItemAnimalType");
                            if (addMoveRightButtonToFlippedCard) {
                                // add a button to move the flipped card to the right
                                //console.log("will add move button right myStackItems[stackItemIndex].id: "+myStackItems[stackItemIndex].id + " myStackItems[stackItemIndex].type: "+myStackItems[stackItemIndex].type+ " seriesCounter: "+seriesCounter);
                                this.addMoveFlippedCardButton(myStackItems[stackItemIndex].id, myStackItems[stackItemIndex].type, true, seriesCounter);
                                this.needScoringValidationForCurrentPlayer = true;
                            }
                            if (addMoveLeftButtonToFlippedCard) {
                                // add a button to move the flipped card to the left
                                //console.log("will add move button left");
                                this.addMoveFlippedCardButton(myStackItems[stackItemIndex].id, myStackItems[stackItemIndex].type, false, seriesCounter);
                                this.needScoringValidationForCurrentPlayer = true;
                            }
                        }
                    }
                }
            }
        },
        createFinalScoredSeries(player_id, args) {
            //console.log("createFinalScoredSeries for player id : "+player_id + " this.cardsonstackData.length : "+this.cardsonstackData.length);
            this.mystackinscoring[player_id] = [];
            let position = "top";
            for (let scoringIndex in args.arcticScoring) {
                if (args.arcticScoring[scoringIndex].player_id == player_id) {
                    let scoringInfos = args.arcticScoring[scoringIndex].scoringInfos;
                    let seriesCounter = null;
                    let serieStock = null;
                    for (let scoringInfoIndex in scoringInfos) {
                        for (let cardOnStackDataIndex in this.cardsonstackData) {
                            if (scoringInfos[scoringInfoIndex].cardId == this.cardsonstackData[cardOnStackDataIndex].id) {
                                //console.log("createFinalScoredSeries new card scoringInfos[scoringInfoIndex].cardId : "+scoringInfos[scoringInfoIndex].cardId);
                                let currentCardIsFlipped = scoringInfos[scoringInfoIndex].flipped;
                                if (seriesCounter == null || (seriesCounter != null && seriesCounter != (parseInt(scoringInfos[scoringInfoIndex].serieIndex)+1))) {
                                    //newSerieToCreate
                                    seriesCounter = parseInt(scoringInfos[scoringInfoIndex].serieIndex)+1;
                                    position = (position == "top") ? "bottom" : "top";
                                    let myStackSeriesNodeId = "arc_myStackSeries"
                                    if (player_id == this.player_id) {
                                        myStackSeriesNodeId += "_current_player";
                                    }
                                    else {
                                        myStackSeriesNodeId += "_"+player_id;
                                    }
                                    dojo.place( this.format_block('jstpl_scoring_serie', {
                                        seriesCounter : seriesCounter,
                                        player_id : player_id
                                    } ), $(myStackSeriesNodeId) );
                                    dojo.addClass('arc_mystackinscoring_'+player_id+'_'+seriesCounter, position);
                                    // Current animal stack in scoring
                                    serieStock = new ebg.stock(); // new stock object for hand
                                    this.mystackinscoring[player_id].push(serieStock);
                                    if (player_id == this.player_id) {
                                        myStackSeriesNodeId += "_current_player";
                                    }
                                    else {
                                        myStackSeriesNodeId += "_"+player_id;
                                    }
                                    serieStock.create( this, $('arc_mystackinscoring_'+player_id+'_'+seriesCounter), this.cardWidth, this.cardHeight );
                                    serieStock.image_items_per_row = 5; // 5 images per row in the deck
                                    serieStock.container_div.width = "156px"; // enought just for 1 card
                                    serieStock.autowidth = false; // this is required so it obeys the width set above
                                    serieStock.use_vertical_overlap_as_offset = true; // this is to use normal vertical_overlap
                                    serieStock.vertical_overlap = 0; // overlap
                                    serieStock.horizontal_overlap  = 23; // current bug in stock - this is needed to enable z-index on overlapping items
                                    serieStock.item_margin = 0; // has to be 0 if using overlap
                                    serieStock.updateDisplay(); // re-layout
                                    serieStock.setSelectionMode(0);
                                    this.addItemTypesForScoring(serieStock);
                                }
                                serieStock.addToStockWithId( this.getCardUniqueType(this.cardsonstackData[cardOnStackDataIndex].type, this.cardsonstackData[cardOnStackDataIndex].type_arg), this.cardsonstackData[cardOnStackDataIndex].id );
                                serieStock.changeItemsWeight( { [this.getCardUniqueType(this.cardsonstackData[cardOnStackDataIndex].type, this.cardsonstackData[cardOnStackDataIndex].type_arg)]: serieStock.getAllItems().length-1 } );
                                //console.log("changeItemWeight type : "+this.cardsonstackData[cardOnStackDataIndex].type+" type_arg : "+this.cardsonstackData[cardOnStackDataIndex].type_arg+" getCardUniqueType : "+this.getCardUniqueType(this.cardsonstackData[cardOnStackDataIndex].type, this.cardsonstackData[cardOnStackDataIndex].type_arg)+" weight : "+(serieStock.getAllItems().length-1));
                                if (currentCardIsFlipped) {
                                    dojo.addClass('arc_mystackinscoring_'+player_id+'_'+seriesCounter+'_item_' + this.cardsonstackData[cardOnStackDataIndex].id, 'arc_turnedbackcardontable');
                                }
                            }
                        }
                        serieStock.updateDisplay(); // re-layout
                    }
                    break;
                }
                this.onScreenWidthChange();
            }
        },
        showScoringBoard(validation, args = null) {
            //console.log(args);
            dojo.destroy("arc_mystackinscoring");
            let scoringSpecMessage = _("Waiting for players to validate their scoring...");
            dojo.place( this.format_block('jstpl_scoring_stack', {
                SCORING_STACK_TITLE: _("Pile Scoring"), 
                SCORING_SPECTATOR_MESSAGE: scoringSpecMessage
            } ), $('game_play_area') );
            if (!validation || (validation && !this.isSpectator)) {
                dojo.place( this.format_block('jstpl_scoring_board', {FINAL_SCORING_TITLE: _("Final scoring")} ), $('game_play_area') );
            }
            if (!validation) {
                for( let player_id in this.gamedatas.players )
                {
                    if (this.player_id != player_id) {
                        dojo.place( this.format_block('jstpl_opponent_scoring_stack', {
                            player_id : player_id,
                            player_color: this.gamedatas.players[player_id].color,
                            player_name: this.gamedatas.players[player_id].name,
                            SCORING_STACK_TITLE: _("Pile Scoring")
                        } ), $('game_play_area') );
                    }
                }
            }
            /*
            if (validation) {
                if (!this.isSpectator) {
                    this.createSeriesToValidate();
                }
            }
            else {
                if (this.isSpectator) {
                    dojo.destroy("arc_spectatorInfo");
                }
                this.createFinalScoredSeries(args);
            }
            this.onScreenWidthChange();
            if (!this.isSpectator || !validation) {
                this.updateScore(this.player_id, validation, args);
            }
            */
           
            if (validation) {
                dojo.query("#arc_scoring_stack_wrapper").addClass("arc_active_slot");
                this.createSeriesToValidate();
            }
            else {
                dojo.destroy("arc_spectatorInfo");
                for( let player_id in this.gamedatas.players )
                {
                    this.createFinalScoredSeries(player_id, args);
                }
            }
            if (validation && this.needScoringValidationForCurrentPlayer) {
                let validationMessage = _("Make the longest sequences of consecutive cards in your personal pile with your face down cards");
                dojo.place('<span>&nbsp;:&nbsp;</span><span>'+validationMessage+'</span>', 'arc_scoring_stack_title_current_player', 'last');
            }
            this.onScreenWidthChange();
            if (validation) {
                this.updateScore(this.player_id, validation, args);
            }
            else {
                for( let player_id in this.gamedatas.players )
                {
                    this.updateScore(player_id, validation, args);
                }
            }
        },
        manageSeriesScoring(player_id, finalScoringSeries) {
            for (let serieIndex in finalScoringSeries) {
                let isScoring = finalScoringSeries[serieIndex].isScoring;
                let scoringCardCount = finalScoringSeries[serieIndex].count;
                
                let serieNumber = parseInt(serieIndex)+1;
                // the serie will not score if contains only one card
                if (isScoring) {
                    // remove visual effect on scoring series
                    dojo.query('#arc_mystackinscoring_'+player_id+'_'+serieNumber).removeClass("arc_nonScoring");
                    dojo.query('#arc_mystackinscoring_'+player_id+'_'+serieNumber+' h3').forEach(dojo.destroy);
                    dojo.place(
                        '<h3>'+this.getSeriePoints(scoringCardCount)+'&nbsp;<i class="fa fa-star"></i></h3>', 
                        'arc_mystackinscoring_'+player_id+'_'+serieNumber,
                        "first");
                }
                else {
                    // add visual effect on non-scoring series
                    //console.log("arc_nonScoring "+'arc_mystackinscoring_'+player_id+'_'+serieNumber);
                    dojo.addClass('arc_mystackinscoring_'+player_id+'_'+serieNumber, 'arc_nonScoring');
                    dojo.query('#arc_mystackinscoring_'+player_id+'_'+serieNumber+' h3').forEach(dojo.destroy);
                    dojo.place(
                        '<h3>0&nbsp;<i class="fa fa-star"></i></h3>',
                        'arc_mystackinscoring_'+player_id+'_'+serieNumber,
                        "first");
                }
            }
        },
        getScoringInfos(player_id) {
            let scoringInfos = [];
            for (let serieIndex in this.mystackinscoring[player_id]) {
                let currentSerieCards = this.mystackinscoring[player_id][serieIndex].getAllItems();
                for (let cardIndex in currentSerieCards) {
                    let isFlipped = false;
                    for (let i in this.cardsonstackData) {
                        let card = this.cardsonstackData[i];
                        if (card.flipped && currentSerieCards[cardIndex].id == card.id) {
                            isFlipped = true;
                        }
                    }
                    scoringInfos.push( {
                        serieIndex : serieIndex,
                        cardId : currentSerieCards[cardIndex].id,
                        animalType : this.getUniqueCardTypeAnimalType(currentSerieCards[cardIndex].type),
                        flipped : isFlipped
                    });
                }
            }
            //console.log("scoringInfos : "+JSON.stringify(scoringInfos));
            return scoringInfos;
        },
        onBtnValidateScoring(arg) {
            let scoringInfos = this.getScoringInfos(this.player_id);
            let action = 'validateScoring';
            //console.log("validateScoring action check : "+this.checkPossibleActions(action, true));
            if (this.checkPossibleActions(action, true)) {
                let player_id = this.player_id;
                this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", {
                    scoring_infos : JSON.stringify(scoringInfos),
                    player_id : player_id,
                    lock : true
                }, this, function(result) {
                }, function(is_error) {
                });
            }
        },
        onUndo: function (event) {
            const action = "undo";
            this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html",
                [],
                this,
                (result) => {},
                (err) => {
                    if (err) return;
                    this.removeActionButtons();
                    $('pagemaintitletext').innerHTML = _("Undo requested...");
                },
                true
            );
        },
        ///////////////////////////////////////////////////
        //// Reaction to cometD notifications

        /*
            setupNotifications:
            
            In this method, you associate each of your game notifications with your local method to handle it.
            
            Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                  your arctic.game.php file.
        
        */
        setupNotifications: function()
        {
            //console.log( 'notifications subscriptions setup' );
            
            // TODO: here, associate your game notifications with local methods
            
            // Example 1: standard notification handling
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            
            // Example 2: standard notification handling + tell the user interface to wait
            //            during 3 seconds after calling the method in order to let the players
            //            see what is happening in the game.
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            // this.notifqueue.setSynchronous( 'cardPlayed', 3000 );
            // 
            
            dojo.subscribe('playCardOnStack', this, "notif_playCardOnStack");
            this.notifqueue.setSynchronous( 'playCardOnStack' ); // wait time is dynamic
            dojo.subscribe('pickCard', this, "notif_pickCard");
            this.notifqueue.setSynchronous( 'pickCard' ); // wait time is dynamic
            dojo.subscribe( 'fillRiver', this, "notif_fillRiver" );
            dojo.subscribe('playCardOnPenalties', this, "notif_playCardOnPenalties");
            this.notifqueue.setSynchronous( 'playCardOnPenalties' ); // wait time is dynamic
            dojo.subscribe('givePowerToPlayer', this, "notif_givePowerToPlayer");
            dojo.subscribe('moveTokens', this, "notif_moveTokens");
            dojo.subscribe('givePenaltyCard', this, "notif_givePenaltyCard");
            this.notifqueue.setSynchronous( 'notif_givePenaltyCard' ); // wait time is dynamic
            dojo.subscribe('getBackCardOnStack', this, "notif_getBackCardOnStack");
            this.notifqueue.setSynchronous( 'notif_getBackCardOnStack' ); // wait time is dynamic
            dojo.subscribe('changeCardFromRiver', this, "notif_changeCardFromRiver");
            this.notifqueue.setSynchronous( 'notif_changeCardFromRiver' ); // wait time is dynamic
            dojo.subscribe('validateScoring', this, "notif_validateScoring");
            dojo.subscribe('needScoringValidation', this, "notif_needScoringValidation");
            //dojo.subscribe('endGame', this, "notif_endGame");
            
            
            
        },  
        
        // TODO: from this point and below, you can write your game notifications handling methods
        
        /*
        Example:
        
        notif_cardPlayed: function( notif )
        {
            //console.log( 'notif_cardPlayed' );
            //console.log( notif );
            
            // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
            
            // TODO: play the card in the user interface.
        },  
        */
        notif_endGame(notif) {
            //console.log(notif);
            /*this.activateBoardWrapper('arc_players');
            //this.activateBoardWrapper('arc_powers');
            this.activateBoardWrapper('arc_totem');
            this.activateBoardWrapper('arc_landscapes');
            this.activateBoardWrapper('arc_pick');
            this.activateBoardWrapper('arc_river');
            this.activateBoardWrapper('arc_myhand');
            this.activateBoardWrapper('arc_mystack');
            this.activateBoardWrapper('arc_mypenalties');*/
            dojo.destroy("arc_players_wrap");
            dojo.destroy("arc_powers_wrap");
            dojo.destroy("arc_totem_wrap");
            dojo.destroy("arc_landscapes_wrap");
            dojo.destroy("arc_pick_wrap");
            dojo.destroy("arc_river_wrap");
            dojo.destroy("arc_penaltiesandstack_wrap");
            dojo.destroy("arc_myhand_wrap");
            dojo.destroy("arc_scoring_board_wrapper");
            for( let player_id in this.gamedatas.players ) {
                if (this.player_id == player_id) {
                    dojo.destroy("arc_scoring_stack_wrapper_current_player");
                }
                else {
                    dojo.destroy("arc_scoring_stack_wrapper_"+player_id);
                }
            }
            if (this.isReadOnly()) {
                dojo.destroy("arc_scoring_stack_wrapper_current_player");
            }
            this.showScoringBoard(false, notif.args);
        },
        notif_validateScoring(notif) {
            //console.log(notif);
            this.scoreCtrl[notif.args.player_id].setValue(notif.args.scoringTable.finalScore);
        }, 
        notif_needScoringValidation(notif) {
            //console.log(notif);
        },
        notif_changeCardFromRiver: function(notif) {
            //this.activateBoardWrapper('arc_powers');
            this.activateBoardWrapper('arc_players');
            this.activateBoardWrapper('arc_river');
            // current player changed a card from river
            if (notif.args.player_id == this.player_id) {
                this.activateBoardWrapper('arc_myhand');
                // hand add the river card
                this.playerHand.addToStockWithId(this.getCardUniqueType(notif.args.river_color, notif.args.river_value), notif.args.river_card_id);
                this.addCardToOpponentPlayerHand(notif.args.player_id, this.currentPlayerMinifiedHand);
                // add tooltip
                this.addCardDefinitionTooltip(this.playerHand, 'arc_myhand_item_'+notif.args.river_card_id, notif.args.river_card_id);
                this.manageHandCardsOverlap(this.playerHand.count());
                // river remove the river card
                this.river.removeFromStockById(notif.args.river_card_id);
                // slide from river to player hand
                let slideAnim = this.slideToObject('arc_river_item_' + notif.args.river_card_id, 'arc_myhand_item_' + notif.args.river_card_id);
                slideAnim.play();
                this.notifqueue.setSynchronousDuration(slideAnim.duration);
                dojo.connect(slideAnim, 'onEnd', () => {
                     // river add the hand card
                    this.river.addToStockWithId(this.getCardUniqueType(notif.args.hand_color, notif.args.hand_value), notif.args.hand_card_id);
                    // add tooltip
                    this.addCardDefinitionTooltip(this.river, 'arc_river_item_'+notif.args.hand_card_id, notif.args.hand_card_id);
                    // hand remove the hand card
                    this.playerHand.removeFromStockById(notif.args.hand_card_id);
                    this.removeCardFromOpponentPlayerHand(notif.args.player_id, this.currentPlayerMinifiedHand);
                    this.manageHandCardsOverlap(this.playerHand.count());
                    // slide from player hand to river
                    slideAnim = this.slideToObject('arc_myhand_item_' + notif.args.hand_card_id, 'arc_river_item_' + notif.args.hand_card_id);
                    slideAnim.play();
                    this.notifqueue.setSynchronousDuration(slideAnim.duration);
                });
            }
            // other player changed a card from river
            else {
                // river remove the river card
                this.river.removeFromStockById(notif.args.river_card_id);
                
                // add card to opponent player hand
                let cardId = this.addCardToOpponentPlayerHand(notif.args.player_id);
                
                // slide from river stack to player overall board
                let slideAnim = this.slideToObject('arc_river_item_' + notif.args.river_card_id, 'arc_cp_board_hand_' + notif.args.player_id + '_item_' + cardId );
                slideAnim.play();
                this.notifqueue.setSynchronousDuration(slideAnim.duration);
                dojo.connect(slideAnim, 'onEnd', () => {
                    
                    /*let deckIndex = parseInt(notif.args.hand_color.split("_")[0]);
                    let animalType = parseInt(notif.args.hand_color.split("_")[1]);
                    dojo.place(this.format_block('jstpl_cardonmyhand', {
                        x : this.cardWidth * (notif.args.hand_value - 1),
                        y : this.cardHeight * (animalType - 1),
                        deck_index : deckIndex,
                        card_id : notif.args.hand_card_id
                    }), 'overall_player_board_' + notif.args.player_id);*/
                     // river add the hand card
                    this.river.addToStockWithId(this.getCardUniqueType(notif.args.hand_color, notif.args.hand_value), notif.args.hand_card_id);
                    // add tooltip
                    this.addCardDefinitionTooltip(this.river, 'arc_river_item_'+notif.args.hand_card_id, notif.args.hand_card_id);
                    
                    // remove card from opponent player hand
                    let cardId = this.removeCardFromOpponentPlayerHand(notif.args.player_id);
                    // slide from overall playerboard  to river
                    slideAnim = this.slideToObject('arc_cp_board_hand_'+notif.args.player_id+'_item_' + cardId, 'arc_river_item_' + notif.args.hand_card_id);//this.slideToObject('arc_myhand_item_' + notif.args.hand_card_id, 'arc_river_item_' + notif.args.hand_card_id);
                    slideAnim.play();
                    this.notifqueue.setSynchronousDuration(slideAnim.duration);
                    /*dojo.connect(slideAnim, 'onEnd', () => {
                        dojo.destroy('arc_myhand_item_' + notif.args.hand_card_id);
                    });*/
                });
            }
        },
        notif_getBackCardOnStack : function(notif) {
            //this.activateBoardWrapper('arc_powers');
            this.activateBoardWrapper('arc_players');
            // current player retrieved a card from its stack
            if (notif.args.player_id == this.player_id) {
                // hand add
                this.playerHand.addToStockWithId(this.getCardUniqueType(notif.args.color, notif.args.value), notif.args.card_id);
                this.addCardToOpponentPlayerHand(notif.args.player_id, this.currentPlayerMinifiedHand);
                // add tooltip
                this.addCardDefinitionTooltip(this.playerHand, 'arc_myhand_item_'+notif.args.card_id, notif.args.card_id);
                this.manageHandCardsOverlap(this.playerHand.count());
                // stack remove
                this.stack.removeFromStockById(notif.args.card_id);
                // Update player board pile info
                this.updateOpponentPlayerPileCountAndTooltip(this.player_id, this.stack.getAllItems().length);
                // slide from stack to player hand
                let slideAnim = this.slideToObject('arc_mystack_item_' + notif.args.card_id, 'arc_myhand_item_' + notif.args.card_id);
                slideAnim.play();
                this.notifqueue.setSynchronousDuration(slideAnim.duration);
                dojo.connect(slideAnim, 'onEnd', () => {
                    if (this.stack.count() == 0) {
                        
                        if (!$('arc_playerstackplaceholder_'+this.player_id)) {
                            dojo.place(this.format_block('jstpl_currentplayerstackplaceholder', {
                                player_id : this.player_id
                            }), 'arc_mystack');
                        }
                    }
                });
            }
            // other player retrieved a card from its stack
            else {
                
                // slide from stack to player overall board
                // remove stack card

                // other player gived & received a penalty
                //this.activateBoardWrapper('arc_powers');

                /*// player penalties add
                let deckIndex = parseInt(notif.args.color.split("_")[0]);
                let animalType = parseInt(notif.args.color.split("_")[1]);
                dojo.place(this.format_block('jstpl_cardonstack', {
                    x : this.cardWidth * (notif.args.value - 1),
                    y : this.cardHeight * (animalType - 1),
                    deck_index : deckIndex,
                    card_id : notif.args.card_id
                }), 'overall_player_board_' + notif.args.opponent_player_id);
                dojo.addClass('arc_cardonstack_' + notif.args.card_id, 'arc_minifiedcard');



                this.placeOnObject('arc_playerstack_' + player_id, 'overall_player_board_' + player_id);
*/
                // add card to opponent player hand
                let cardId = this.addCardToOpponentPlayerHand(notif.args.player_id);
                
                // slide from player stack to player overall board
                let slideAnim = this.slideToObject('arc_cardonstack_' + notif.args.card_id, 'arc_cp_board_hand_' + notif.args.player_id + '_item_' + cardId );
                slideAnim.play();
                this.notifqueue.setSynchronousDuration(slideAnim.duration);
                // Destroy player stack card
                dojo.connect(slideAnim, 'onEnd', () => {
                    dojo.destroy('arc_cardonstack_' + notif.args.card_id);
                    // Update player board pile info
                    this.updateOpponentPlayerPileCountAndTooltip(notif.args.player_id, dojo.query(".arc_card", "arc_playerstack_" + notif.args.player_id).length);
                    if (dojo.query(".arc_card", "arc_playerstack_" + notif.args.player_id).length == 0) {
                        dojo.place(this.format_block('jstpl_playerstackplaceholder', {
                            player_id : notif.args.player_id
                        }), 'arc_playerstack_' + notif.args.player_id);
                    }
                });
            }
        },
        notif_playCardOnStack : function(notif) {
            // Play a card on the table
            this.playCardOnStack(notif.args.player_id, notif.args.color, notif.args.value, notif.args.card_id, notif.args.underStack, notif.args.flippedCard);
        },
        notif_pickCard : function(notif) {
            // Play a card on the table
            //console.log(notif);
            this.pickCard(notif.args.player_id, notif.args.color, notif.args.value, notif.args.card_id, notif.args.pickFromDeckPowerUsed, notif.args.pickFromPenaltiesPowerUsed, notif.args.pickCount);
        },
        notif_fillRiver : function(notif) {
            // Move all cards on table to given table ?player?, then destroy them
            if (notif.args.card_id != undefined && notif.args.card_id !== null) {
                // Move it to its final destination
                //this.slideToObject(origin_card_id, direction_card_parent_node).play();
                this.pick.removeFromStock(notif.args.pickCount);
                this.river.addToStockWithId(this.getCardUniqueType(notif.args.animalType, notif.args.value), notif.args.card_id);
                if ($('arc_pick_item_' + notif.args.pickCount)) {
                    this.slideToObject('arc_pick_item_' +notif.args.pickCount, 'arc_river_item_' + notif.args.card_id).play();
                }
                this.addCardDefinitionTooltip(this.river, 'arc_river_item_'+notif.args.card_id, notif.args.card_id);
            }
            //this.slideToObject(origin_card_id, direction_card_parent_node).play();
            /*let anim = this.slideToObject('cardontable_' + player_id, 'overall_player_board_' + winner_id);
            dojo.connect(anim, 'onEnd', function(node) {
                dojo.destroy(node);
            });
            anim.play();*/
        },
        notif_playCardOnPenalties : function(notif) {
            // discard a card from hand
            this.playCardOnPenalties(notif.args.player_id, notif.args.color, notif.args.value, notif.args.card_id, notif.args.pickCount, false);
        },
        notif_givePowerToPlayer : function(notif) {
            // gives the power to the current player
            //console.log("notif : "+JSON.stringify(notif));
            if (notif.args.player_id == this.player_id) {
                let powerAlreadyOwnedByCurrentPlayer = false;
                let powerId = null;
                for (let powerIndex in this.currentPlayerPowers.getAllItems() ) {
                    //console.log("arc_currentPlayerPowers to add ? : "+JSON.stringify(this.currentPlayerPowers.getAllItems()[powerIndex]));
                    if (this.currentPlayerPowers.getAllItems()[powerIndex].type == this.getPowerUniqueType(notif.args.color, notif.args.value)) {
                        //console.log("arc_currentPlayerPowers to add ! : "+JSON.stringify(this.currentPlayerPowers.getAllItems()[powerIndex]));
                        powerAlreadyOwnedByCurrentPlayer = true;
                        break;
                    }
                }
                for (let powerIndex in this.powers.getAllItems() ) {
                    //console.log("power to remove ? : "+JSON.stringify(this.powers.getAllItems()[powerIndex]));
                    if (this.powers.getAllItems()[powerIndex].type == this.getPowerUniqueType(notif.args.color, notif.args.value)) {
                        //console.log("power to remove ! : "+JSON.stringify(this.powers.getAllItems()[powerIndex]));
                        let powerId = this.powers.getAllItems()[powerIndex].id;
                        if (!powerAlreadyOwnedByCurrentPlayer) {
                            this.currentPlayerPowers.addToStockWithId(this.getPowerUniqueType(notif.args.color, notif.args.value), powerId);
                            this.addPowerToolTip( 'arc_currentPlayerPowers_item_'+powerId, this.getPowerDescription(powerId), notif.args.player_id );
                        }
                        this.powers.removeFromStockById(powerId);
                        break;
                    }
                }
                for ( let powerIndex in this.unavailablePowers.getAllItems() ) {
                    //console.log("arc_unavailablePowers to remove ? : "+JSON.stringify(this.unavailablePowers.getAllItems()[powerIndex]));
                    if (this.unavailablePowers.getAllItems()[powerIndex].type == this.getPowerUniqueType(notif.args.color, notif.args.value)) {
                        let powerId = this.unavailablePowers.getAllItems()[powerIndex].id;
                        //console.log("arc_unavailablePowers to remove ! : "+JSON.stringify(this.unavailablePowers.getAllItems()[powerIndex]));
                        if (!powerAlreadyOwnedByCurrentPlayer) {
                            this.currentPlayerPowers.addToStockWithId(this.getPowerUniqueType(notif.args.color, notif.args.value), powerId);
                            this.addPowerToolTip( 'arc_currentPlayerPowers_item_'+powerId, this.getPowerDescription(powerId), notif.args.player_id );
                        }
                        this.unavailablePowers.removeFromStockById(powerId);
                        break;
                    }
                }
            }
            // give power to an other player
            else {
                // check if power is already owned by an other player
                let powerAlreadyUnavailableToCurrentPlayer = false;
                for (let powerIndex in this.unavailablePowers.getAllItems() ) {
                    //console.log("arc_unavailablePowers to add ? : "+JSON.stringify(this.unavailablePowers.getAllItems()[powerIndex]));
                    if (this.unavailablePowers.getAllItems()[powerIndex].type == this.getPowerUniqueType(notif.args.color, notif.args.value)) {
                        //console.log("arc_unavailablePowers to add ! : "+JSON.stringify(this.unavailablePowers.getAllItems()[powerIndex]));
                        powerAlreadyUnavailableToCurrentPlayer = true;
                        // update power color & description for the new owner
                        let powerId = this.unavailablePowers.getAllItems()[powerIndex].id;
                        let playerColorHex = '#'+this.gamedatas.players[notif.args.player_id].color;
                        dojo.style("arc_unavailablePowers_item_"+powerId, {
                            'box-shadow': '5px 5px 5px 0px '+playerColorHex,
                            'border': '1px solid '+playerColorHex
                        });
                        break;
                    }
                }
                // move the power from available powers to unavaiblable powers
                for (let powerIndex in this.powers.getAllItems() ) {
                    //console.log("power to remove ? : "+JSON.stringify(this.powers.getAllItems()[powerIndex]));
                    if (this.powers.getAllItems()[powerIndex].type == this.getPowerUniqueType(notif.args.color, notif.args.value)) {
                        //console.log("power to remove ! : "+JSON.stringify(this.powers.getAllItems()[powerIndex]));
                        let powerId = this.powers.getAllItems()[powerIndex].id;
                        if (!powerAlreadyUnavailableToCurrentPlayer) {
                            this.unavailablePowers.addToStockWithId(this.getPowerUniqueType(notif.args.color, notif.args.value), powerId);
                            this.powers.removeFromStockById(powerId);
                        }
                        let playerColorHex = '#'+this.gamedatas.players[notif.args.player_id].color;
                        dojo.style("arc_unavailablePowers_item_"+powerId, {
                            'box-shadow': '5px 5px 5px 0px '+playerColorHex,
                            'border': '1px solid '+playerColorHex
                        });
                        this.addPowerToolTip( 'arc_unavailablePowers_item_'+powerId, this.getPowerDescription(powerId), notif.args.player_id );
                        break;
                    }
                }
                // move the power from owned powers to unavaiblable powers
                for (let powerIndex in this.currentPlayerPowers.getAllItems() ) {
                    //console.log("arc_currentPlayerPowers to remove ? : "+JSON.stringify(this.currentPlayerPowers.getAllItems()[powerIndex]));
                    if (this.currentPlayerPowers.getAllItems()[powerIndex].type == this.getPowerUniqueType(notif.args.color, notif.args.value)) {
                        let powerId = this.currentPlayerPowers.getAllItems()[powerIndex].id;
                        //console.log("currentPlayerPowers to remove ! : "+JSON.stringify(this.currentPlayerPowers.getAllItems()[powerIndex]));
                        if (!powerAlreadyUnavailableToCurrentPlayer) {
                            this.unavailablePowers.addToStockWithId(this.getPowerUniqueType(notif.args.color, notif.args.value), powerId);
                            let playerColorHex = '#'+this.gamedatas.players[notif.args.player_id].color;
                            dojo.style("arc_unavailablePowers_item_"+powerId, {
                                'box-shadow': '5px 5px 5px 0px '+playerColorHex,
                                'border': '1px solid '+playerColorHex 
                            });
                            this.addPowerToolTip( 'arc_unavailablePowers_item_'+powerId, this.getPowerDescription(powerId), notif.args.player_id );
                        }
                        this.currentPlayerPowers.removeFromStockById(powerId);
                        break;
                    }
                }
                // use weight to share to power player owner
                this.unavailablePowers.changeItemsWeight( { [this.getPowerUniqueType(notif.args.color, notif.args.value)]: notif.args.player_id } );
            }
            this.currentPlayerPowers.updateDisplay();
            this.powers.updateDisplay();
            this.unavailablePowers.updateDisplay();
            this.managePowerBubblesDisplayOverriding();
            this.updatePlayerBoardPowersPossessions();
        },
        notif_moveTokens : function(notif) {
            //console.log(notif);
            if (notif.args.hasOwnProperty("token_old_pos")) {
                let oldPosTokens = this['tokens'+ notif.args.token_old_pos].getAllItems();
                for (let tokenIndex in oldPosTokens)
                {
                    if (oldPosTokens[tokenIndex].id == notif.args.token_id)
                    {
                        // remove token from old landscape stock
                        this['tokens'+ notif.args.token_old_pos].removeFromStockById(notif.args.token_id);
                        // add token to new landscape stock
                        this['tokens'+ notif.args.token_new_pos].addToStockWithId(this.getTotemOrTokenUniqueType(notif.args.token_color,), notif.args.token_id);
                        this.slideToObject("arc_tokenwrap"+notif.args.token_old_pos+"_item_"+notif.args.token_id, "arc_tokenwrap"+notif.args.token_new_pos+"_item_"+notif.args.token_id).play();
                        break;
                    }
                }
            } // else : case of move token power unused
            
            dojo.query(".arc_actionArrow").forEach(dojo.destroy);
        },
        notif_givePenaltyCard : function(notif) {
            //console.log(notif);

            //this.activateBoardWrapper('arc_powers');
            this.activateBoardWrapper('arc_players');
            
            if (notif.args.player_id == this.player_id) {
                // current player gived a penalty
                this.activateBoardWrapper('arc_mypenalties');

                // player penalties add
                let deckIndex = parseInt(notif.args.color.split("_")[0]);
                let animalType = parseInt(notif.args.color.split("_")[1]);
                dojo.place(this.format_block('jstpl_cardonpenalties', {
                    x : this.cardWidth * (notif.args.value - 1),
                    y : this.cardHeight * (animalType - 1),
                    deck_index : deckIndex,
                    card_id : notif.args.card_id
                }), 'arc_playerpenalties_' + notif.args.opponent_player_id);
                // Update opponent player board pile info
                this.updateOpponentPlayerPenaltiesCountAndTooltip(notif.args.opponent_player_id, dojo.query(".arc_card", "arc_playerpenalties_" + notif.args.opponent_player_id).length);
                // Move card from player panel
                //this.placeOnObject('arc_cardonpenalties_' + notif.args.card_id, 'arc_playerpenalties_' + notif.args.opponent_player_id);
                
                // add tooltip
                this.addCardDefinitionTooltip(null, 'arc_cardonpenalties_' + notif.args.card_id, notif.args.card_id, dojo.query(".arc_card", "arc_playerpenalties_" + notif.args.opponent_player_id).length);
                
                //dojo.addClass(card_div, 'card_type_'+card_type_id);
                dojo.addClass('arc_cardonpenalties_' + notif.args.card_id, 'arc_minifiedcard');
                dojo.addClass('arc_cardonpenalties_' + notif.args.card_id, 'arc_turnedbackcardontable');

                // Destroy player penalties placeholder
                dojo.destroy('arc_playerpenaltiesplaceholder_' + notif.args.opponent_player_id);
                
                
                // penalties remove
                this.penalties.removeFromStockById(notif.args.card_id);
                // Update player board pile info
                this.updateOpponentPlayerPenaltiesCountAndTooltip(this.player_id, this.penalties.getAllItems().length);

                // slide from penalties to player penalties
                let slideAnim = this.slideToObject('arc_mypenalties_item_' + notif.args.card_id, 'arc_cardonpenalties_' + notif.args.card_id);
                slideAnim.play();
                this.notifqueue.setSynchronousDuration(slideAnim.duration);
                dojo.connect(slideAnim, 'onEnd', () => {
                    if (this.penalties.count() == 0) {
                        dojo.place(this.format_block('jstpl_currentplayerpenaltiesplaceholder', {
                            player_id : this.player_id
                        }), 'arc_mypenalties');
                    }
                });
            }
            else {
                if (notif.args.opponent_player_id == this.player_id) {
                    // current player received a penalty
                    this.activateBoardWrapper('arc_mypenalties');

                    // player penalties remove
                    // penalties add
                    this.penalties.addToStockWithId(this.getCardUniqueType(notif.args.color, notif.args.value), notif.args.card_id);
                    // Update player board pile info
                    this.updateOpponentPlayerPenaltiesCountAndTooltip(this.player_id, this.penalties.getAllItems().length);

                    $('arc_mypenalties_item_'+notif.args.card_id).innerHTML = '<span class="arc_mypenalties_item_count">'+this.penalties.getAllItems().length+"</span>";
     
                    this.penalties.changeItemsWeight( { [this.getCardUniqueType(notif.args.color, notif.args.value)]: this.penalties.getAllItems().length } );
                    // add tooltip
                    //this.addCardDefinitionTooltip(this.penalties, 'arc_mypenalties_item_' + notif.args.card_id, notif.args.card_id, this.penalties.getAllItems().length);
                    this.addCardDefinitionTooltip(null, 'arc_mypenalties_item_' + notif.args.card_id, notif.args.card_id, this.penalties.getAllItems().length);
                    dojo.query('#arc_cardonpenalties_' + notif.args.card_id).removeClass('arc_minifiedcard');

                    dojo.addClass('arc_cardonpenalties_' + notif.args.card_id, 'stockitem');

                    // slide from player penalties to penalties
                    let slideAnim = this.slideToObject('arc_cardonpenalties_' + notif.args.card_id, 'arc_mypenalties_item_' + notif.args.card_id);
                    slideAnim.play();
                    this.notifqueue.setSynchronousDuration(slideAnim.duration);
                    // Destroy player penalties card
                    dojo.connect(slideAnim, 'onEnd', () => {
                        dojo.destroy('arc_cardonpenalties_' + notif.args.card_id);
                        //console.log(" opponent player id : "+notif.args.player_id);
                        //console.log(" opponent player penalties count : "+dojo.query(".card", "arc_playerpenalties_" + notif.args.player_id).length);
                        if (dojo.query(".arc_card", "arc_playerpenalties_" + notif.args.player_id).length == 0) {
                            dojo.place(this.format_block('jstpl_playerpenaltiesplaceholder', {
                                player_id : notif.args.player_id
                            }), 'arc_playerpenalties_' + notif.args.player_id);
                            // Update player board pile info
                            this.updateOpponentPlayerPenaltiesCountAndTooltip(notif.args.player_id, dojo.query(".arc_card", "arc_playerpenalties_" + notif.args.player_id).length);
                        }
                     });
                }
                else {
                    // other player gived & received a penalty
                    //this.activateBoardWrapper('arc_powers');

                    // Destroy player penalties placeholder
                    dojo.destroy('arc_playerpenaltiesplaceholder_' + notif.args.opponent_player_id);
                    dojo.setAttr('arc_cardonpenalties_' + notif.args.card_id, 'id', 'arc_moving_cardonpenalties_' + notif.args.card_id);
                    // opponent player penalties add
                    let deckIndex = parseInt(notif.args.color.split("_")[0]);
                    let animalType = parseInt(notif.args.color.split("_")[1]);
                    dojo.place(this.format_block('jstpl_cardonpenalties', {
                        x : this.cardWidth * (notif.args.value - 1),
                        y : this.cardHeight * (animalType - 1),
                        deck_index : deckIndex,
                        card_id : notif.args.card_id
                    }), 'arc_playerpenalties_' + notif.args.opponent_player_id);
                    // Update player board pile info
                    this.updateOpponentPlayerPenaltiesCountAndTooltip(notif.args.opponent_player_id, dojo.query(".arc_card", "arc_playerpenalties_" + notif.args.opponent_player_id).length);
                    dojo.addClass('arc_cardonpenalties_' + notif.args.card_id, 'arc_minifiedcard');
                    dojo.addClass('arc_cardonpenalties_' + notif.args.card_id, 'arc_turnedbackcardontable');
                    // slide from player penalties to opponent player penalties
                    let slideAnim = this.slideToObject('arc_moving_cardonpenalties_' + notif.args.card_id, 'arc_cardonpenalties_' + notif.args.card_id);
                    slideAnim.play();
                    this.notifqueue.setSynchronousDuration(slideAnim.duration);
                    // Destroy player penalties card
                    dojo.connect(slideAnim, 'onEnd', () => {
                        dojo.destroy('arc_moving_cardonpenalties_' + notif.args.card_id);
                        if (dojo.query(".arc_card", "arc_playerpenalties_" + notif.args.player_id).length == 0) {
                            dojo.place(this.format_block('jstpl_playerpenaltiesplaceholder', {
                                player_id : notif.args.player_id
                            }), 'arc_playerpenalties_' + notif.args.player_id);
                            // Update player board pile info
                            this.updateOpponentPlayerPenaltiesCountAndTooltip(notif.args.player_id, dojo.query(".arc_card", "arc_playerpenalties_" + notif.args.player_id).length);
                        }
                     });
                }
            }
        }
   });             
});
