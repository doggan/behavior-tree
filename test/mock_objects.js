var inherits = require('inherits'),
    bt = require('./../index');

function MockAction() {
    bt.Action.call(this);

    this.startCount = 0;
    this.updateCount = 0;
    this.endCount = 0;
    this.returnStatus = bt.Status.RUNNING;

    this.start = function() {
        this.startCount++;
    };

    this.update = function() {
        this.updateCount++;
        return this.returnStatus;
    };

    this.end = function() {
        this.endCount++;
    };
}

inherits(MockAction, bt.Action);

function MockSequence(childCount) {
    bt.Sequence.call(this);

    for (var i = 0; i < childCount; i++) {
        this.children.push(new MockAction());
    }
}

inherits(MockSequence, bt.Sequence);

function MockSelector(childCount) {
    bt.Selector.call(this);

    for (var i = 0; i < childCount; i++) {
        this.children.push(new MockAction());
    }
}

inherits(MockSelector, bt.Selector);

module.exports = {
    MockAction: MockAction,
    MockSequence: MockSequence,
    MockSelector: MockSelector
};
