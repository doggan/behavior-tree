'use strict';

var inherits = require('inherits'),
    BaseNode = require('./core/base').BaseNode;

function Action(params) {
    var self = this;
    if (!(self instanceof Action)) {
        self = new Action(params);
    } else {
        BaseNode.call(self, params);
    }
    return self;
}

inherits(Action, BaseNode);

module.exports = Action;
