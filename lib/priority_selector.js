'use strict';

var Status = require('./core/status'),
    inherits = require('inherits'),
    assert = require('assert'),
    Composite = require('./core/base').Composite;

var INVALID_CHILD_INDEX = -1;

function PrioritySelector() {
    var self = this;
    if (!(self instanceof PrioritySelector)) {
        self = new PrioritySelector();
    } else {
        var params = {
            start: function() {
                assert(self.children.length > 0, 'PrioritySelector has no children.');
                assert(self.children.length === self.childCheckers.length, 'Number of children must equal number of checker functions.');
                self.lastRunningChildIndex = INVALID_CHILD_INDEX;
                self.lastRunningChild = null;
            },
            update: function() {
                for (var i = 0; i < self.children.length; i++) {
                    var child = self.children[i];
                    var checker = self.childCheckers[i];

                    // Check higher priority children...
                    if (i < self.lastRunningChildIndex) {
                        assert(self.lastRunningChild);

                        // Is a higher priority child able to run?
                        if (checker()) {
                            // Abort the previously running child.
                            if (self.lastRunningChild.isRunning()) {
                                self.lastRunningChild.abort();
                            }
                        } else {
                            // Check failed - skip to next child.
                            continue;
                        }
                    }
                    // Currently running child...
                    else if (i === self.lastRunningChildIndex) {
                        // Do not call the check function on the currently running child.
                    }
                    else {
                        // Nothing is currently running.
                        assert(self.lastRunningChildIndex === INVALID_CHILD_INDEX);
                        assert(self.lastRunningChild === null);

                        // Check failed - skip to next child.
                        if (!checker()) {
                            continue;
                        }
                    }

                    var status = child.tick();

                    // Progress to the next child on failure.
                    if (status === Status.FAILURE) {
                        self.lastRunningChildIndex = INVALID_CHILD_INDEX;
                        self.lastRunningChild = null;
                        continue;
                    }

                    self.lastRunningChildIndex = i;
                    self.lastRunningChild = child;
                    return status;
                }

                // All children failed.
                return Status.FAILURE;
            }
        };

        Composite.call(self, params);
        self.childCheckers = [];
        self.lastRunningChildIndex = INVALID_CHILD_INDEX;
        self.lastRunningChild = null;
    }
    return self;
}

inherits(PrioritySelector, Composite);

/**
 * Overridden addChild method to allow passing a checker function
 * for the given child. When evaluating nodes for priority switching,
 * the checker will be evaluated. If the checker returns true,
 * the currently executing node will be aborted, and the node
 * associated with the checker will be started.
 */
PrioritySelector.prototype.addChild = function (node, checker) {
    // If no checker function is provided, use a default one.
    if (!checker) {
        this.childCheckers.push(function() {
            return true;
        });
    } else {
        this.childCheckers.push(checker);
    }
    return Composite.prototype.addChild.call(this, node);
};

module.exports = PrioritySelector;
