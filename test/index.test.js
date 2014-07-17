var expect = require('chai').expect,
    MockAction = require('./mock_objects').MockAction,
    bt = require('./../index');

describe('bt.Action', function() {
    it('should properly start and update', function(done) {
        var root = new MockAction();

        expect(root.startCount).to.equal(0);
        expect(root.updateCount).to.equal(0);
        root.tick();
        expect(root.startCount).to.equal(1);
        expect(root.updateCount).to.equal(1);

        done();
    });

    it('should properly end', function(done) {
        var root = new MockAction();

        expect(root.endCount).to.equal(0);
        root.tick();
        expect(root.endCount).to.equal(0);

        root.returnStatus = bt.Status.SUCCESS;
        root.tick();
        expect(root.endCount).to.equal(1);

        done();
    });

    it('should properly start and update (with callbacks)', function(done) {
        var startCount = 0;
        var updateCount = 0;

        var root = bt.Action({
            start: function() {
                startCount++;
            },
            update: function() {
                updateCount++;
                return bt.Status.SUCCESS;
            }
        });

        expect(startCount).to.equal(0);
        expect(updateCount).to.equal(0);
        root.tick();
        expect(startCount).to.equal(1);
        expect(updateCount).to.equal(1);

        done();
    });
});

describe('bt.Sequence', function() {
    it('has two children and should fail when the first child fails', function(done) {
        var root =
            bt.Sequence()
                .addChild(new MockAction())
                .addChild(new MockAction());

        expect(root.tick()).to.equal(bt.Status.RUNNING);
        expect(root.children[0].endCount).to.equal(0);

        root.children[0].returnStatus = bt.Status.FAILURE;
        expect(root.tick()).to.equal(bt.Status.FAILURE);
        expect(root.children[0].endCount).to.equal(1);
        expect(root.children[1].startCount).to.equal(0);

        done();
    });

    it('has two children and should continue when the first child succeeds', function(done) {
        var root =
            bt.Sequence()
                .addChild(new MockAction())
                .addChild(new MockAction());

        expect(root.tick()).to.equal(bt.Status.RUNNING);
        expect(root.children[0].endCount).to.equal(0);
        expect(root.children[1].startCount).to.equal(0);

        root.children[0].returnStatus = bt.Status.SUCCESS;
        expect(root.tick()).to.equal(bt.Status.RUNNING);
        expect(root.children[0].endCount).to.equal(1);
        expect(root.children[1].startCount).to.equal(1);

        done();
    });

    it('has one child and should pass on the child status upon completion', function(done) {
        var statuses = [bt.Status.SUCCESS, bt.Status.FAILURE];
        for (var i = 0; i < 2; i++) {
            var root =
                bt.Sequence()
                    .addChild(new MockAction());

            expect(root.tick()).to.equal(bt.Status.RUNNING);
            expect(root.children[0].endCount).to.equal(0);

            root.children[0].returnStatus = statuses[i];
            expect(root.tick()).to.equal(statuses[i]);
            expect(root.children[0].endCount).to.equal(1);
        }

        done();
    });
});

describe('Selectors', function() {
    function doTest1(newSelector) {
        var root =
            newSelector()
                .addChild(new MockAction())
                .addChild(new MockAction());

        expect(root.tick()).to.equal(bt.Status.RUNNING);
        expect(root.children[0].endCount).to.equal(0);
        expect(root.children[1].startCount).to.equal(0);

        root.children[0].returnStatus = bt.Status.FAILURE;
        expect(root.tick()).to.equal(bt.Status.RUNNING);
        expect(root.children[0].endCount).to.equal(1);
        expect(root.children[1].startCount).to.equal(1);
    }

    function doTest2(newSelector) {
        var root =
            newSelector()
                .addChild(new MockAction())
                .addChild(new MockAction());

        expect(root.tick()).to.equal(bt.Status.RUNNING);
        expect(root.children[0].endCount).to.equal(0);
        expect(root.children[1].startCount).to.equal(0);

        root.children[0].returnStatus = bt.Status.SUCCESS;
        expect(root.tick()).to.equal(bt.Status.SUCCESS);
        expect(root.children[0].endCount).to.equal(1);
        expect(root.children[1].startCount).to.equal(0);
    }

    function doTest3(newSelector) {
        var statuses = [bt.Status.SUCCESS, bt.Status.FAILURE];
        for (var i = 0; i < 2; i++) {
            var root =
                newSelector()
                    .addChild(new MockAction());

            expect(root.tick()).to.equal(bt.Status.RUNNING);
            expect(root.children[0].endCount).to.equal(0);

            root.children[0].returnStatus = statuses[i];
            expect(root.tick()).to.equal(statuses[i]);
            expect(root.children[0].endCount).to.equal(1);
        }
    }

    describe('bt.Selector', function() {
        it('has two children and should continue to the next child when the first child fails', function(done) {
            doTest1(function() { return bt.Selector(); });
            done();
        });

        it('has two children and should stop when the first child succeeds', function(done) {
            doTest2(function() { return bt.Selector(); });
            done();
        });

        it('has one child and should pass on the child status upon completion', function(done) {
            doTest3(function() { return bt.Selector(); });
            done();
        });

        it('has two children and should not re-evaluate the first child if the second child is running', function(done) {
            var root =
                bt.Selector()
                    .addChild(new MockAction())
                    .addChild(new MockAction());

            expect(root.children[0].updateCount).to.equal(0);
            expect(root.children[1].updateCount).to.equal(0);
            root.children[0].returnStatus = bt.Status.FAILURE;
            expect(root.tick()).to.equal(bt.Status.RUNNING);
            expect(root.children[0].updateCount).to.equal(1);
            expect(root.children[1].updateCount).to.equal(1);

            expect(root.tick()).to.equal(bt.Status.RUNNING);
            expect(root.children[0].updateCount).to.equal(1);
            expect(root.children[1].updateCount).to.equal(2);

            done();
        });
    });

    describe('bt.PrioritySelector', function() {
        it('has two children and should continue to the next child when the first child fails', function(done) {
            doTest1(function() { return bt.PrioritySelector(); });
            done();
        });

        it('has two children and should stop when the first child succeeds', function(done) {
            doTest2(function() { return bt.PrioritySelector(); });
            done();
        });

        it('has one child and should pass on the child status upon completion', function(done) {
            doTest3(function() { return bt.PrioritySelector(); });
            done();
        });

        it('has two children and should re-evaluate the first child even if the second child is running', function(done) {
            var root =
                bt.PrioritySelector()
                    .addChild(new MockAction())
                    .addChild(new MockAction());

            expect(root.children[0].updateCount).to.equal(0);
            expect(root.children[1].updateCount).to.equal(0);
            root.children[0].returnStatus = bt.Status.FAILURE;
            expect(root.tick()).to.equal(bt.Status.RUNNING);
            expect(root.children[0].updateCount).to.equal(1);
            expect(root.children[1].updateCount).to.equal(1);

            expect(root.tick()).to.equal(bt.Status.RUNNING);
            expect(root.children[0].updateCount).to.equal(2);
            expect(root.children[1].updateCount).to.equal(2);

            done();
        });

        it('has two children and should reset the second child (low priority) if the first child (high priority) starts running', function(done) {
            var root =
                bt.PrioritySelector()
                    .addChild(new MockAction())
                    .addChild(new MockAction());

            root.children[0].returnStatus = bt.Status.FAILURE;
            expect(root.tick()).to.equal(bt.Status.RUNNING);
            expect(root.children[0].status).to.equal(bt.Status.FAILURE);
            expect(root.children[1].status).to.equal(bt.Status.RUNNING);

            // Begin the high priority child.
            root.children[0].returnStatus = bt.Status.RUNNING;
            expect(root.tick()).to.equal(bt.Status.RUNNING);
            expect(root.children[0].status).to.equal(bt.Status.RUNNING);
            expect(root.children[1].status).to.equal(bt.Status.ABORTED);

            // Re-start the low priority child.
            root.children[0].returnStatus = bt.Status.FAILURE;
            expect(root.tick()).to.equal(bt.Status.RUNNING);
            expect(root.children[0].status).to.equal(bt.Status.FAILURE);
            expect(root.children[1].status).to.equal(bt.Status.RUNNING);

            done();
        });
    });
});

describe('bt.Parallel', function() {
    it('should succeed when all children succeed while using REQUIRE_ALL as the success policy', function(done) {
        var root =
            bt.Parallel(bt.ParallelPolicy.REQUIRE_ALL, bt.ParallelPolicy.REQUIRE_ONE)
                .addChild(new MockAction())
                .addChild(new MockAction());

        expect(root.tick()).to.equal(bt.Status.RUNNING);
        root.children[0].returnStatus = bt.Status.SUCCESS;
        expect(root.tick()).to.equal(bt.Status.RUNNING);
        root.children[1].returnStatus = bt.Status.SUCCESS;
        expect(root.tick()).to.equal(bt.Status.SUCCESS);

        done();
    });

    it('should succeed when one child succeeds while using REQUIRE_ONE as the success policy', function(done) {
        var root =
            bt.Parallel(bt.ParallelPolicy.REQUIRE_ONE, bt.ParallelPolicy.REQUIRE_ALL)
                .addChild(new MockAction())
                .addChild(new MockAction());

        expect(root.tick()).to.equal(bt.Status.RUNNING);
        root.children[0].returnStatus = bt.Status.SUCCESS;
        expect(root.tick()).to.equal(bt.Status.SUCCESS);

        done();
    });

    it('should fail when all children fail while using REQUIRE_ALL as the failure policy', function(done) {
        var root =
            bt.Parallel(bt.ParallelPolicy.REQUIRE_ONE, bt.ParallelPolicy.REQUIRE_ALL)
                .addChild(new MockAction())
                .addChild(new MockAction());

        expect(root.tick()).to.equal(bt.Status.RUNNING);
        root.children[0].returnStatus = bt.Status.FAILURE;
        expect(root.tick()).to.equal(bt.Status.RUNNING);
        root.children[1].returnStatus = bt.Status.FAILURE;
        expect(root.tick()).to.equal(bt.Status.FAILURE);

        done();
    });

    it('should fail when one child fails while using REQUIRE_ONE as the failure policy', function(done) {
        var root =
            bt.Parallel(bt.ParallelPolicy.REQUIRE_ALL, bt.ParallelPolicy.REQUIRE_ONE)
                .addChild(new MockAction())
                .addChild(new MockAction());

        expect(root.tick()).to.equal(bt.Status.RUNNING);
        root.children[0].returnStatus = bt.Status.FAILURE;
        expect(root.tick()).to.equal(bt.Status.FAILURE);

        done();
    });

    it('should abort all running children when parallel node ends', function(done) {
        var root =
            bt.Parallel()
                .addChild(new MockAction())
                .addChild(new MockAction());

        expect(root.tick()).to.equal(bt.Status.RUNNING);

        expect(root.children[0].status).to.equal(bt.Status.RUNNING);
        expect(root.children[0].endCount).to.equal(0);
        expect(root.children[1].status).to.equal(bt.Status.RUNNING);
        expect(root.children[1].endCount).to.equal(0);

        root.children[0].returnStatus = bt.Status.SUCCESS;
        expect(root.tick()).to.equal(bt.Status.SUCCESS);

        expect(root.children[0].status).to.equal(bt.Status.SUCCESS);
        expect(root.children[0].endCount).to.equal(1);
        expect(root.children[1].status).to.equal(bt.Status.ABORTED);
        expect(root.children[1].endCount).to.equal(1);

        done();
    });
});

describe('bt.Condition', function() {
    it('should execute the child when the condition is met and pass on the result', function(done) {
        var root =
            bt.Condition(function() { return true; })
                .setChild(new MockAction());

        expect(root.child.startCount).to.equal(0);
        expect(root.tick()).to.equal(bt.Status.RUNNING);
        expect(root.child.startCount).to.equal(1);

        root.child.returnStatus = bt.Status.SUCCESS;
        expect(root.tick()).to.equal(bt.Status.SUCCESS);

        done();
    });

    it('should abort the running child when the condition changes from success to failure', function(done) {
        var condition = true;
        var root =
            bt.Condition(function() { return condition; })
                .setChild(new MockAction());

        expect(root.child.updateCount).to.equal(0);
        expect(root.tick()).to.equal(bt.Status.RUNNING);
        expect(root.child.updateCount).to.equal(1);
        expect(root.child.status).to.equal(bt.Status.RUNNING);

        condition = false;
        expect(root.child.endCount).to.equal(0);
        expect(root.tick()).to.equal(bt.Status.FAILURE);
        expect(root.child.updateCount).to.equal(1);
        expect(root.child.endCount).to.equal(1);
        expect(root.child.status).to.equal(bt.Status.ABORTED);

        done();
    });

    it('should fail and not execute the child when the condition is not met', function(done) {
        var root =
            bt.Condition(function() { return false; })
                .setChild(new MockAction());

        expect(root.child.startCount).to.equal(0);
        expect(root.tick()).to.equal(bt.Status.FAILURE);
        expect(root.child.startCount).to.equal(0);

        done();
    });
});
