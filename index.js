"use strict";

var extend = require('util')._extend;
var exec = require('child_process').exec;

class TinyExecManager {
    constructor(threadsNum, options) {
        this._threadsNum = threadsNum;
        this._options = options || {};
        this._pool = [];
        this._running = new Set();
        this._timeout = 500;
    }

    addTask(task, options) {
        options = extend(this._options, options);

        var subprocessReflection = new SubprocessReflection(task, options, this);

        this._pool.push(subprocessReflection);

        return subprocessReflection;
    }

    run() {
        this._listenTicks();
    }

    report(task, data) {
        this._running.delete(task);
        process.stdout.write(data);
    }

    _listenTicks() {
        process.nextTick(() => {
            if(this._running.size >= this._threadsNum) {
                console.log("WAIT");

                setTimeout(this._listenTicks.bind(this), this._timeout);
            } else {
                let task = this._pool.shift();

                if(task) {
                    console.log(task._task);

                    task.run();
                    this._running.add(task);

                    this._listenTicks();
                } else {
                    this._done();
                }
            }
        });
    }

    _done() {
        process.nextTick(() => {
            if(this._running.size !== 0) {
                console.log("ALMOST DONE");
                setTimeout(this._done.bind(this), this._timeout);
            } else {
                console.log("DONE");
            }
        });
    }
}

class SubprocessReflection {
    constructor(task, options, ctx) {
        this._task = task;
        this._options = options;
        this._ctx = ctx;

        this._data = [];
    }

    run() {
        var task = exec(this._task, this._options);

        task.stdout.on('data', (data) => {
            this._data.push(data);
        });
        task.on('exit', () => {
            this._ctx.report(this, this._data.join(""));
        });
    }
}

module.export = TinyExecManager;