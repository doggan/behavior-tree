'use strict';

var Status = require('./lib/status'),
    assert = require('assert');

function Node(params) {
    this.status = Status.INVALID;

    params = params || {};
    this.start = params.start || null;
    this.update = params.update;
    this.end = params.end || null;

    assert(this.update, 'Update callback required.');
}

Node.prototype.tick = function () {
    if (this.status !== Status.RUNNING) {
        if (this.start) {
            this.start();
        }
    }

    this.status = this.update();
    assert(!isNaN(this.status), 'Update must return a Status. Currently returning: ' + this.status);

    if (this.status !== Status.RUNNING) {
        if (this.end) {
            this.end();
        }
    }

    return this.status;
};

Node.prototype.isRunning = function () {
    return this.status === Status.RUNNING;
};

Node.prototype.isFinished = function () {
    return (this.status === Status.SUCCESS) ||
           (this.status === Status.FAILURE);
};

Node.prototype.abort = function () {
    if (this.end) {
        this.end();
    }
    this.status = Status.ABORTED;
};

var inherits = require('inherits');

function Action(params) {
    var self = this;
    if (!(self instanceof Action)) {
        self = new Action(params);
    } else {
        Node.call(self, params);
    }
    return self;
}

inherits(Action, Node);

function Composite(params) {
    Node.call(this, params);
    this.children = [];
}

inherits(Composite, Node);

Composite.prototype.addChild = function (node) {
    this.children.push(node);

    // Allow chaining.
    return this;
};

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

var ParallelPolicy = {
    REQUIRE_ONE : 0,
    REQUIRE_ALL : 1
};

function Parallel(successPolicy, failurePolicy) {
    var self = this;
    if (!(self instanceof Parallel)) {
        self = new Parallel(successPolicy, failurePolicy);
    } else {
        var params = {
            update: function() {
                var successCount = 0;
                var failureCount = 0;

                for (var i = 0; i < self.children.length; i++) {
                    var node = self.children[i];
                    if (!node.isFinished()) {
                        node.tick();
                    }

                    if (node.status === Status.SUCCESS) {
                        if (self.successPolicy === ParallelPolicy.REQUIRE_ONE) {
                            return Status.SUCCESS;
                        }

                        successCount++;
                    } else if (node.status === Status.FAILURE) {
                        if (self.failurePolicy === ParallelPolicy.REQUIRE_ONE) {
                            return Status.FAILURE;
                        }

                        failureCount++;
                    }
                }

                if ((self.successPolicy === ParallelPolicy.REQUIRE_ALL) &&
                    (successCount === self.children.length)) {
                    return Status.SUCCESS;
                }

                if ((self.failurePolicy === ParallelPolicy.REQUIRE_ALL) &&
                    (failureCount === self.children.length)) {
                    return Status.FAILURE;
                }

                return Status.RUNNING;
            },
            end: function() {
                // Properly shut down all running children if we finish.
                for (var i = 0; i < self.children.length; i++) {
                    var node = self.children[i];
                    if (node.isRunning()) {
                        node.abort();
                    }
                }
            }
        };

        Composite.call(self, params);
        self.currentChildIndex = -1;
        self.successPolicy = successPolicy || ParallelPolicy.REQUIRE_ONE;
        self.failurePolicy = failurePolicy || ParallelPolicy.REQUIRE_ONE;
    }
    return self;
}

inherits(Parallel, Composite);

module.exports = {
    Status: Status,
    Action: Action,
    Sequence: Sequence,
    Selector: Selector,
    Parallel: Parallel,
    ParallelPolicy: ParallelPolicy,
};
