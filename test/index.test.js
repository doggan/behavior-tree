var expect = require('chai').expect,
    MockAction = require('./mock_objects').MockAction,
    MockSequence = require('./mock_objects').MockSequence,
    bt = require('./../index');

describe('bt.Action', function() {
    it('should properly start and update', function(done) {
        var action = new MockAction();

        expect(action.startCount).to.equal(0);
        expect(action.updateCount).to.equal(0);
        action.tick();
        expect(action.startCount).to.equal(1);
        expect(action.updateCount).to.equal(1);

        done();
    });

    it('should properly end', function(done) {
        var action = new MockAction();

        expect(action.endCount).to.equal(0);
        action.tick();
        expect(action.endCount).to.equal(0);

        action.returnStatus = bt.Status.SUCCESS;
        action.tick();
        expect(action.endCount).to.equal(1);

        done();
    });

    it('should properly start and update (with callbacks)', function(done) {
        var startCount = 0;
        var updateCount = 0;

        var tree = bt.Action({
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
        tree.tick();
        expect(startCount).to.equal(1);
        expect(updateCount).to.equal(1);

        done();
    });
});

describe('bt.Sequence', function() {
    it('has two children and should fail when the first child fails', function(done) {
        var seq = new MockSequence(2);

        expect(seq.tick()).to.equal(bt.Status.RUNNING);
        expect(seq.children[0].endCount).to.equal(0);

        seq.children[0].returnStatus = bt.Status.FAILURE;
        expect(seq.tick()).to.equal(bt.Status.FAILURE);
        expect(seq.children[0].endCount).to.equal(1);
        expect(seq.children[1].startCount).to.equal(0);

        done();
    });

    it('has two children and should continue when the first child succeeds', function(done) {
        var seq = new MockSequence(2);

        expect(seq.tick()).to.equal(bt.Status.RUNNING);
        expect(seq.children[0].endCount).to.equal(0);
        expect(seq.children[1].startCount).to.equal(0);

        seq.children[0].returnStatus = bt.Status.SUCCESS;
        expect(seq.tick()).to.equal(bt.Status.RUNNING);
        expect(seq.children[0].endCount).to.equal(1);
        expect(seq.children[1].startCount).to.equal(1);

        done();
    });

    it('has one child and should pass on the child status upon completion', function(done) {
        var statuses = [bt.Status.SUCCESS, bt.Status.FAILURE];
        for (var i = 0; i < 2; i++) {
            var seq = new MockSequence(1);

            expect(seq.tick()).to.equal(bt.Status.RUNNING);
            expect(seq.children[0].endCount).to.equal(0);

            seq.children[0].returnStatus = statuses[i];
            expect(seq.tick()).to.equal(statuses[i]);
            expect(seq.children[0].endCount).to.equal(1);
        }

        done();
    });
});
