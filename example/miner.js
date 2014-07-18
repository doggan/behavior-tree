'use strict';

/**
 * Behavior Tree implementation of the 'The West World Project' state machine
 * as described in 'Programming Game AI by Example' by Mat Buckland.
 *
 * References:
 * 	http://www.ai-junkie.com/books/toc_pgaibe.html
 * 	http://www.ai-junkie.com/architecture/state_driven/tut_state2.html
 */

// TODO: add money requirement for saloon!

var bt = require('./../index');

var Locations = {
    MINE: 0,
    BANK: 1,
    SALOON: 2,
    HOME: 3,
    NONE: 4
};

function Miner() {
    var self = this;

    var POCKET_SIZE = 3;
    var MINIMUM_BALANCE = 9;
    var THIRST_THRESHOLD = 5;

    self.goToLocationAction = function(location) {
        // Already at the location?
        if (self.currentLocation === location) {
            return bt.Status.SUCCESS;
        }

        // From location...
        switch (self.currentLocation) {
            case Locations.MINE:
                console.log("Ah'm leavin' the gold mine with mah pockets full o' sweet gold.");
                break;
            case Locations.BANK:
                console.log("Leavin' the bank.");
                break;
            case Locations.SALOON:
                console.log("Leavin' the saloon, feelin' good.");
                break;
            case Locations.HOME:
                console.log("What a gosh-darn fantastic nap! Time to find more gold.");
                break;
        }

        // To location...
        switch (location) {
            case Locations.MINE:
                console.log("Walkin' to the gold mine.");
                break;
            case Locations.BANK:
                console.log("Goin' to the bank. Yes siree.");
                break;
            case Locations.SALOON:
                console.log("Boy, ah sure is thusty! Walkin' to the saloon.");
                break;
            case Locations.HOME:
                console.log("Woohoo! Rich enough for now. Back home to mah li'l lady.");
                console.log("Walkin' home.");
                break;
        }

        self.currentLocation = location;
        return bt.Status.SUCCESS;
    };

    self.isEnoughMoneyInBankCondition = function() {
        return self.moneyInBank >= MINIMUM_BALANCE;
    };

    self.sleepAction = function() {
        if (self.currentLocation !== Locations.HOME) {
            return bt.Status.FAILURE;
        }

        console.log("zzzzZZZZzzz...");

        self.moneyInBank -= 1;
        if (self.moneyInBank <= 0) {
            return bt.Status.SUCCESS;
        } else {
            return bt.Status.RUNNING;
        }
    };

    self.isThirstyCondition = function() {
        return self.thirst >= THIRST_THRESHOLD;
    };

    self.drinkAction = function() {
        if (self.currentLocation !== Locations.SALOON) {
            return bt.Status.FAILURE;
        }

        self.thirst = 0;

        console.log("That's mighty fine sippin liquor.");
        return bt.Status.SUCCESS;
    };

    self.arePocketsFullCondition = function() {
        return self.moneyInPockets >= POCKET_SIZE;
    };

    self.depositMoneyAction = function() {
        if (self.currentLocation !== Locations.BANK) {
            return bt.Status.FAILURE;
        }

        self.moneyInBank += self.moneyInPockets;
        self.moneyInPockets = 0;

        console.log("Depositin’ gold. Total savings now: " + self.moneyInBank);
        return bt.Status.SUCCESS;
    };

    self.mineGoldAction = function() {
        if (self.currentLocation !== Locations.MINE) {
            return bt.Status.FAILURE;
        }

        self.moneyInPockets++;
        self.thirst++;

        console.log("Pickin' up a nugget.");
        return bt.Status.SUCCESS;
    };

    self.currentLocation = Locations.NONE;
    self.moneyInBank = 0;
    self.moneyInPockets = 0;
    self.thirst = 0;
}

// Build and execute the behavior tree.
var tree = buildTree();
bt.log(tree);
execute(tree);

function buildTree() {
    var miner = new Miner();

    var home =
        bt.Sequence()
            .addChild(bt.Action({ update: miner.goToLocationAction.bind(miner, Locations.HOME) }))
            .addChild(bt.Action({ update: miner.sleepAction }));

    var saloon =
        bt.Sequence()
            .addChild(bt.Action({ update: miner.goToLocationAction.bind(miner, Locations.SALOON) }))
            .addChild(bt.Action({ update: miner.drinkAction }));

    var bank =
        bt.Sequence()
            .addChild(bt.Action({ update: miner.goToLocationAction.bind(miner, Locations.BANK) }))
            .addChild(bt.Action({ update: miner.depositMoneyAction }));

    var mine =
        bt.Sequence()
            .addChild(bt.Action({ update: miner.goToLocationAction.bind(miner, Locations.MINE) }))
            .addChild(bt.Action({ update: miner.mineGoldAction }));

    return bt.PrioritySelector()
        .addChild(home, miner.isEnoughMoneyInBankCondition)
        .addChild(saloon, miner.isThirstyCondition)
        .addChild(bank, miner.arePocketsFullCondition)
        .addChild(mine);
}

function execute(tree) {
    var delay = 500;
    var iterations = 100;

    tickAndSchedule();
    function tickAndSchedule() {
        if (iterations-- <= 0) {
            return;
        }

        // Execute a single tick.
        tree.tick();

        setTimeout(tickAndSchedule, delay);
    }
}
