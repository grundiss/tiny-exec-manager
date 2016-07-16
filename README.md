# tiny-exec-manager

```js
var TinyExecManager = require('tiny-exec-manager');

/* no more then 16 threads, each child processs runs with option {cwd: ...} */
var manager = new TinyExecManager(16, {cwd: process.cwd()});

for(let i = 0; i < 160; i++) {
  manager.addTask("ls -lA");
}

manager.run();
```
