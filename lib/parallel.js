'use strict';

var Status = require('./core/status'),
    inherits = require('inherits'),
    Composite = require('./core/base').Composite;

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
    Parallel: Parallel,
    ParallelPolicy: ParallelPolicy,
};
