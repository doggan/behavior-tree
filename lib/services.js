'use strict';

module.exports = {
    /**
     * A callback for getting the amount of time elapsed
     * between ticks.
     *
     * Time is necessary for certain nodes such as WaitAction.
     * This callback does not need to be implemented if only
     * time-independent node types are used.
     *
     * This library only provides an interface to the
     * deltaTime callback, and the actual implementation should
     * be defined in the user application and set like so:
     *
     * bt.Services.deltaTime = function() {
     * 		var elapsedTime = // calculation
     * 		return elapsedTime;
     * }
     *
     * The implementation is left to the user application
     * because time is very application-specific. For example,
     * games have game loops and already manage a deltaTime
     * for each frame, while NodeJS applications can calculate elapsed
     * time with process.hrtime, while  browser applications
     * would need a different implementation, etc.
     */
    deltaTime: function() {
        console.warn('Please implement the deltaTime callback.');
        return 0;
    }
};
