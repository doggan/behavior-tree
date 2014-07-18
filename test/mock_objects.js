var inherits = require('inherits'),
    bt = require('./../index');

function MockAction() {
    var self = this;
    var params = {
        start: function() {
            self.startCount++;
        },
        update: function() {
            self.updateCount++;
            return self.returnStatus;
        },
        end: function() {
            self.endCount++;
        }
    };

    bt.Action.call(this, params);

    this.startCount = 0;
    this.updateCount = 0;
    this.endCount = 0;
    this.returnStatus = bt.Status.RUNNING;
}

inherits(MockAction, bt.Action);

function MockDecorator() {
    var self = this;
    var params = {
        update: function() {
            return self.child.tick();
        }
    };

    bt.Decorator.call(this, params);
}

inherits(MockDecorator, bt.Decorator);

var Composite = require('./../lib/core/base').Composite;

function MockComposite(params) {
    Composite.call(this, params);
}

inherits(MockComposite, Composite);

module.exports = {
    MockAction: MockAction,
    MockDecorator: MockDecorator,
    MockComposite: MockComposite
};
