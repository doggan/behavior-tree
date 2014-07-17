'use strict';

var Status = require('./core/status'),
    inherits = require('inherits'),
    assert = require('assert'),
    Decorator = require('./decorator');

function Condition(checker) {
    assert(checker, 'Check function must be passed to Condition.');

    var self = this;
    if (!(self instanceof Condition)) {
        self = new Condition(checker);
    } else {
        var params = {
            update: function() {
                if (checker()) {
                    return this.child.tick();
                }
                return Status.FAILURE;
            }
        };

        Decorator.call(self, params);
    }
    return self;
}

inherits(Condition, Decorator);

module.exports = Condition;