'use strict';

var archy = require('archy'),
    Composite = require('./base').Composite,
    Decorator = require('./../decorator');

function getChildren(node) {
    if (node instanceof Composite) {
        return node.children;
    } else if (node instanceof Decorator) {
        return [node.child];
    } else {
        return [];
    }
}

function recurseNode(node) {
    var children = getChildren(node);
    if (children.length === 0) {
        if (!node) {
            return '<null node>';
        } else {
            return node.constructor.name;
        }
    }

    for (var i = 0; i < children.length; i++) {
        children[i] = recurseNode(children[i]);
    }

    return {
        label: node.constructor.name,
        nodes: children
    };
}

/**
 * Prints a tree to the console with indentation.
 */
module.exports = function _log(tree) {
    var result = recurseNode(tree);
    result = archy(result);
    console.log(result);
};
