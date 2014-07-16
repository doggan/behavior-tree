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

module.exports = {
    MockAction: MockAction
};
