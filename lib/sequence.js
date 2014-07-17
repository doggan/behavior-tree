'use strict';

var Status = require('./core/status'),
    inherits = require('inherits'),
    assert = require('assert'),
    Composite = require('./core/base').Composite;

function Sequence() {
    var self = this;
    if (!(self instanceof Sequence)) {
        self = new Sequence();
    } else {
        var params = {
            start: function() {
                assert(self.children.length > 0, 'Sequence has no children.');
                self.currentChildIndex = 0;
            },
            update: function() {
                while (true) {
                    var status = self.children[self.currentChildIndex].tick();

                    // Progress to next child on success.
                    if (status === Status.SUCCESS) {
                        self.currentChildIndex++;

                        // All done?
                        if (self.currentChildIndex === self.children.length) {
                            return Status.SUCCESS;
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

inherits(Sequence, Composite);

module.exports = Sequence;
