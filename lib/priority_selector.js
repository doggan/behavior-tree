'use strict';

var Status = require('./core/status'),
    inherits = require('inherits'),
    assert = require('assert'),
    Composite = require('./core/base').Composite;

function PrioritySelector() {
    var self = this;
    if (!(self instanceof PrioritySelector)) {
        self = new PrioritySelector();
    } else {
        var params = {
            start: function() {
                assert(self.children.length > 0, 'PrioritySelector has no children.');
                self.lastRunningChildIndex = 0;
            },
            update: function() {
                for (var i = 0; i < self.children.length; i++) {
                    var status = self.children[i].tick();

                    // Progress to next child on failure.
                    if (status === Status.FAILURE) {
                        continue;
                    } else {
                        // Reset all lower priority children that may have been running.
                        for (var j = i + 1; j <= self.lastRunningChildIndex; j++) {
                            self.children[j].abort();
                        }
                        self.lastRunningChildIndex = i;

                        return status;
                    }
                }

                // All children failed.
                return Status.FAILURE;
            }
        };

        Composite.call(self, params);
        self.lastRunningChildIndex = -1;
    }
    return self;
}

inherits(PrioritySelector, Composite);

module.exports = PrioritySelector;
