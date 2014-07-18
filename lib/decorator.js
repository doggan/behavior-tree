'use strict';

var inherits = require('inherits'),
    BaseNode = require('./core/base').BaseNode;

function Decorator(params) {
    BaseNode.call(this, params);
    this.child = null;
}

inherits(Decorator, BaseNode);

Decorator.prototype.setChild = function (node) {
    this.child = node;

    // Allow chaining.
    return this;
};

Decorator.prototype.onAbort = function () {
    if (this.child.isRunning()) {
        this.child.abort();
    }
};

module.exports = Decorator;
