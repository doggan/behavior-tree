'use strict';

var Status = require('./lib/status');

function Node(params) {
    this.status = Status.INVALID;

    params = params || {};
    this.start = params.start || null;
    this.update = params.update;
    this.end = params.end || null;
}

Node.prototype.tick = function () {
    if (this.status !== Status.RUNNING) {
        if (this.start) {
            this.start();
        }
    }

    this.status = this.update();
    if (isNaN(this.status)) {
        throw new Error('Update must return a Status. Currently returning: ' + this.status);
    }

    if (this.status !== Status.RUNNING) {
        if (this.end) {
            this.end();
        }
    }

    return this.status;
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

var assert = require('assert');

function Sequence() {
    var self = this;
    if (!(self instanceof Sequence)) {
        self = new Sequence();
    } else {
        Composite.call(self);
        self.currentChildIndex = -1;
        self.start = function() {
            assert(self.children.length > 0, 'Sequence has no children.');
            self.currentChildIndex = 0;
        };
        self.update = function() {
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
        };
    }
    return self;
}

inherits(Sequence, Composite);

module.exports = {
    Status: Status,
    Action: Action,
    Sequence: Sequence
};
