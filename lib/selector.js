'use strict';

var Status = require('./core/status'),
    inherits = require('inherits'),
    assert = require('assert'),
    Composite = require('./core/base').Composite;

function Selector() {
    var self = this;
    if (!(self instanceof Selector)) {
        self = new Selector();
    } else {
        var params = {
            start: function() {
                assert(self.children.length > 0, 'Selector has no children.');
                self.currentChildIndex = 0;
            },
            update: function() {
                while (true) {
                    var status = self.children[self.currentChildIndex].tick();

                    // Progress to next child on failure.
                    if (status === Status.FAILURE) {
                        self.currentChildIndex++;

                        // All done?
                        if (self.currentChildIndex === self.children.length) {
                            return Status.FAILURE;
                        }
                    } else {
                        return status;
                    }
                }
            }
        };

        Composite.call(self, params);
        self.currentChildIndex = -1;
    }
    return self;
}

inherits(Selector, Composite);

module.exports = Selector;
