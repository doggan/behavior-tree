'use strict';

var inherits = require('inherits'),
    assert = require('assert'),
    Status = require('./status');

function BaseNode(params) {
    this.status = Status.INVALID;

    params = params || {};
    this.start = params.start || null;
    this.update = params.update;
    this.end = params.end || null;

    assert(this.update, 'Update callback required.');
}

BaseNode.prototype.tick = function () {
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

BaseNode.prototype.isRunning = function () {
    return this.status === Status.RUNNING;
};

BaseNode.prototype.isFinished = function () {
    return (this.status === Status.SUCCESS) ||
           (this.status === Status.FAILURE);
};

BaseNode.prototype.abort = function () {
    assert(this.isRunning(), 'Attempting to abort a non-running node.');

    this.status = Status.ABORTED;
    this.onAbort();

    if (this.end) {
        this.end();
    }
};

/**
 * Override in sub-classes to recursively handle abort on child nodes.
 */
BaseNode.prototype.onAbort = function () {

};

function Composite(params) {
    BaseNode.call(this, params);
    this.children = [];
}

inherits(Composite, BaseNode);

Composite.prototype.addChild = function (node) {
    this.children.push(node);

    // Allow chaining.
    return this;
};

Composite.prototype.onAbort = function () {
    for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].isRunning()) {
            this.children[i].abort();
        }
    }
};

module.exports = {
    BaseNode: BaseNode,
    Composite: Composite
};
