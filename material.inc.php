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
 * material.inc.php
 *
 * Arctic game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */



$this->animals = array(
  1 => array( 'name' => clienttranslate('fox'),
              'nametr' => self::_('fox') ),
  2 => array( 'name' => clienttranslate('moose'),
              'nametr' => self::_('moose') ),
  3 => array( 'name' => clienttranslate('walrus'),
              'nametr' => self::_('walrus') ),
  4 => array( 'name' => clienttranslate('orca'),
              'nametr' => self::_('orca') ),
  5 => array( 'name' => clienttranslate('puffin'),
              'nametr' => self::_('puffin') ),
  6 => array( 'name' => clienttranslate('bear'),
              'nametr' => self::_('polar bear') )
);

$this->values_label = array(
  1 =>'1',
  2 =>'2',
  3 => '3',
  4 => '4',
  5 => '5'
);

$this->landscapes_label = array(
  1 =>'0',
  2 =>'1',
  3 => '3',
  4 => '6',
  5 => '10',
  6 => '15'
);

$this->powersInfos = array(
  11 => array( 'name' => clienttranslate('fox'),
              'nametr' => self::_('fox'),
              'phase' => 'playCardOnStack',
              'powerType' => 'flippedCard',
              'desc' => self::_('When placing cards, you may place the final card face down underneath your visible Animal card. During final scoring, it counts as an animal type of your choice.') ),
  21 => array( 'name' => clienttranslate('moose'),
              'nametr' => self::_('moose'),
              'phase' => 'pickCard',
              'powerType' => 'plusOrMinusOne',
              'desc' => self::_('Increase or decrease your draw value by 1.') ),
  31 => array( 'name' => clienttranslate('walrus'),
              'nametr' => self::_('walrus'),
              'phase' => 'moveTokens',
              'powerType' => 'firstTokenMoveAgain',
              'desc' => self::_('Move the token corresponding to the Main animal 1 extra card in the direction of your choice.') ),
  41 => array( 'name' => clienttranslate('orca'),
              'nametr' => self::_('orca'),
              'phase' => 'pickCard',
              'powerType' => 'alwaysCompleteRiver',
              'desc' => self::_('Immediately refill the River after each card you take.') ),
  51 => array( 'name' => clienttranslate('puffin'),
              'nametr' => self::_('puffin'),
              'phase' => 'playCardOnStack',
              'powerType' => 'changeCardFromRiver',
              'desc' => self::_('Before placing your cards, swap a card from your Hand with a card from the River.') ),
  61 => array( 'name' => clienttranslate('polar bear'),
              'nametr' => self::_('polar bear'),
              'phase' => 'pickCard',
              'powerType' => 'pickFromPenalties',
              'desc' => self::_('When drawing cards, you may choose cards from your Penalty zone as well as from the River.') ),

              
  12 => array( 'name' => clienttranslate('fox'),
              'nametr' => self::_('fox'),
              'phase' => 'playCardOnStack',
              'powerType' => 'underStack',
              'desc' => self::_('When placing cards, you may place the final card underneath your personal pile.') ),
  22 => array( 'name' => clienttranslate('moose'),
              'nametr' => self::_('moose'),
              'phase' => 'playCardOnStack',
              'powerType' => 'plusOrMinusOne',
              'desc' => self::_('Increase or decrease your placement value by 1.') ),
  32 => array( 'name' => clienttranslate('walrus'),
              'nametr' => self::_('walrus'),
              'phase' => 'moveTokens',
              'powerType' => 'secondTokenMoveAgain',
              'desc' => self::_('Move the token corresponding to the Companion animal 1 extra card in the direction of your choice.') ),
  42 => array( 'name' => clienttranslate('orca'),
              'nametr' => self::_('orca'),
              'phase' => 'pickCard',
              'powerType' => 'pickFromDeck',
              'desc' => self::_('When drawing cards, you may take 1 or more face-down cards from the top of the common draw pile.') ),
  52 => array( 'name' => clienttranslate('puffin'),
              'nametr' => self::_('puffin'),
              'phase' => 'playCardOnStack',
              'powerType' => 'getBackCardFromStack',
              'desc' => self::_('Before placing your cards, take your visible Animal card back into your hand. Careful, because you now have a new placement value this turn. If you don\'t have a visible Animal card, your placement value is considered to be 1') ),
  62 => array( 'name' => clienttranslate('polar bear'),
              'nametr' => self::_('polar bear'),
              'phase' => 'givePenaltyCard',
              'powerType' => 'givePenalty',
              'desc' => self::_('Choose a card from your Penalty zone and place it in another player\'s Penalty zone.') )
);