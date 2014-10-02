'use strict';

var inherits = require('inherits'),
    Action = require('./action'),
    Status = require('./core/status'),
    Services = require('./services');

function getRandomRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * A leaf node (action) that waits a certain # of
 * seconds before succeeding.
 *
 * Specify only a minWaitTime to get a fixed amount of wait time.
 *
 * Specify both a minWaitTime and a maxWaitTime to get
 * a variable amount of wait time within the range. Actual wait
 * time will be randomized at the start of each new execution.
 */
function WaitAction(minWaitTime, maxWaitTime) {
    var self = this;
    if (!(self instanceof WaitAction)) {
        self = new WaitAction(minWaitTime, maxWaitTime);
    } else {
        var params = {
            start: function() {
                if (self.useRandomTime) {
                    self.remainingWaitTime = getRandomRange(self.minWaitTime, self.maxWaitTime);
                }
                else {
                    self.remainingWaitTime = self.minWaitTime;
                }
            },
            update: function() {
                // Progress time.
                var deltaTime = Services.deltaTime();
                self.remainingWaitTime -= deltaTime;

                if (self.remainingWaitTime <= 0.0) {
                    return Status.SUCCESS;
                }
                else {
                    return Status.RUNNING;
                }
            }
        };

        Action.call(self, params);
        self.useRandomTime = (typeof maxWaitTime !== 'undefined');
        self.minWaitTime = minWaitTime;
        self.maxWaitTime = maxWaitTime;
        self.remainingWaitTime = 0;
    }
    return self;
}

inherits(WaitAction, Action);

module.exports = WaitAction;
