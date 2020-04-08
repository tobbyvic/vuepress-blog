# nodejs的事件循环要弄懂哦

> nodejs的事件循环相比浏览器的事件循环有些复杂，这里会简化一些步骤，便于理解。

#### 官方图示和解释

<img src="https://yyd-picgo.oss-cn-shanghai.aliyuncs.com/img/1710556d5509ef63" style="zoom:100%;" />

> timers: 执行`setTimeout`和`setInterval`的回调
>
> pending callbacks: 执行延迟到下一个循环迭代的 I/O 回调
>
> idle, prepare: 仅系统内部使用
>
> poll: 检索新的 I/O 事件;执行与 I/O 相关的回调。事实上除了其他几个阶段处理的事情，其他几乎所有的异步都在这个阶段处理。
>
> check: `setImmediate`在这里执行
>
> close callbacks: 一些关闭的回调函数，如：`socket.on('close', ...)`

每个阶段都有一个自己的先进先出的队列，只有当这个队列的事件执行完或者达到该阶段的上限时，才会进入下一个阶段。在每次事件循环之间，Node.js都会检查它是否在等待任何一个I/O或者定时器，如果没有的话，程序就关闭退出了。我们的直观感受就是，如果一个Node程序只有同步代码，你在控制台运行完后，他就自己退出了

<img src="https://yyd-picgo.oss-cn-shanghai.aliyuncs.com/img/20200408161828.png" style="zoom:100%;" />

简单来讲，上述的流程大致是这样一个流程:

执行poll队列中的callback -> 执行setImmedidate的callback -> 进入到timers阶段执行到时的callback

#### setImmediate和setTimeout

* 举个栗子

```js
setTimeout(() => {
    setTimeout(() => {
        console.log('setTimeout');
    }, 0);
    setImmediate(() => {
        console.log('setImmediate');
    });
}, 0);
```

执行结果

```
outer
setImmediate
setTimeout
```

执行流程

1. 外层是一个`setTimeout`，所以执行他的回调的时候已经在`timers`阶段了

2. 处理里面的`setTimeout`，因为本次循环的`timers`正在执行，所以他的回调其实加到了下个`timers`阶段

3. 处理里面的`setImmediate`，将它的回调加入`check`阶段的队列

4. 外层`timers`阶段执行完，进入`pending callbacks`，`idle, prepare`，`poll`，这几个队列都是空的，所以继续往下

5. 到了`check`阶段，发现了`setImmediate`的回调，拿出来执行

6. 然后是`close callbacks`，队列是空的，跳过

7. 又是`timers`阶段，执行我们的`console`

**注意**

如果是直接执行

```js
console.log('outer');

setTimeout(() => {
    console.log('setTimeout');
}, 0);

setImmediate(() => {
    console.log('setImmediate');
});
```

执行结果

```
outer
setTimeout
setImmediate
```

怎么`setImmediate`又先出来了，这代码是见鬼了还是啥？这个世界上是没有鬼怪的，所以事情都有原因的，我们顺着之前的Event Loop再来理一下。在理之前，需要告诉大家一件事情，node.js里面`setTimeout(fn, 0)`会被强制改为`setTimeout(fn, 1)`,[这在官方文档中有说明](https://nodejs.org/api/timers.html#timers_settimeout_callback_delay_args)。(说到这里顺便提下，HTML 5里面`setTimeout`最小的时间限制是4ms)。原理我们都有了，我们来理一下流程：

> 1. 外层同步代码一次性全部执行完，遇到异步API就塞到对应的阶段
> 2. 遇到`setTimeout`，虽然设置的是0毫秒触发，但是被node.js强制改为1毫秒，塞入`times`阶段
> 3. 遇到`setImmediate`塞入`check`阶段
> 4. 同步代码执行完毕，进入Event Loop
> 5. 先进入`times`阶段，检查当前时间过去了1毫秒没有，如果过了1毫秒，满足`setTimeout`条件，执行回调，如果没过1毫秒，跳过
> 6. 跳过空的阶段，进入check阶段，执行`setImmediate`回调

通过上述流程的梳理，我们发现关键就在这个1毫秒，如果同步代码执行时间较长，进入Event Loop的时候1毫秒已经过了，`setTimeout`执行，如果1毫秒还没到，就先执行了`setImmediate`。每次我们运行脚本时，机器状态可能不一样，导致运行时有1毫秒的差距，一会儿`setTimeout`先执行，一会儿`setImmediate`先执行。但是这种情况只会发生在还没进入`timers`阶段的时候。像我们第一个例子那样，因为已经在`timers`阶段，所以里面的`setTimeout`只能等下个循环了，所以`setImmediate`肯定先执行。同理的还有其他`poll`阶段的API也是这样的，比如：

```js
var fs = require('fs')

fs.readFile(__filename, () => {
    setTimeout(() => {
        console.log('setTimeout');
    }, 0);
    setImmediate(() => {
        console.log('setImmediate');
    });
});
```

这里`setTimeout`和`setImmediate`在`readFile`的回调里面，由于`readFile`回调是I/O操作，他本身就在`poll`阶段，所以他里面的定时器只能进入下个`timers`阶段，但是`setImmediate`却可以在接下来的`check`阶段运行，所以`setImmediate`肯定先运行，他运行完后，去检查`timers`，才会运行`setTimeout`。

类似的，我们再来看一段代码，如果他们两个不是在最外层，而是在`setImmediate`的回调里面，其实情况跟外层一样，结果也是随缘的，看下面代码:

```js
console.log('outer');

setImmediate(() => {
  setTimeout(() => {
    console.log('setTimeout');
  }, 0);
  setImmediate(() => {
    console.log('setImmediate');
  });
});
```

原因跟写在最外层差不多，因为`setImmediate`已经在`check`阶段了，里面的循环会从`timers`阶段开始，会先看`setTimeout`的回调，如果这时候已经过了1毫秒，就执行他，如果没过就执行`setImmediate`。

#### process.nextTick()和promise.then

`process.nextTick()`是一个特殊的异步API，他不属于任何的Event Loop阶段。事实上Node在遇到这个API时，Event Loop根本就不会继续进行，会马上停下来执行`process.nextTick()`，这个执行完后才会继续Event Loop。我们写个例子来看下：

```js
var fs = require('fs')

fs.readFile(__filename, () => {
    setTimeout(() => {
        console.log('setTimeout');
    }, 0);

    setImmediate(() => {
        console.log('setImmediate');
        
        process.nextTick(() => {
          console.log('nextTick 2');
        });
    });

    process.nextTick(() => {
      console.log('nextTick 1');
    });
});
```

这段代码的打印如下：

```
nextTick 1
setImmediate
nextTick 2
setTimeout
```

我们还是来理一下流程:

> 1. 我们代码基本都在`readFile`回调里面，他自己执行时，已经在`poll`阶段
> 2. 遇到`setTimeout(fn, 0)`，其实是`setTimeout(fn, 1)`，塞入后面的`timers`阶段
> 3. 遇到`setImmediate`，塞入后面的`check`阶段
> 4. 遇到`nextTick`，立马执行，输出'nextTick 1'
> 5. 到了`check`阶段，输出'setImmediate',又遇到个`nextTick`,立马输出'nextTick 2'
> 6. 到了下个`timers`阶段，输出'setTimeout'

这种机制其实类似于我们前面讲的微任务，但是并不完全一样,比如同时有`nextTick`和`Promise`的时候，肯定是`nextTick`先执行，原因是`nextTick`的队列比`Promise`队列优先级更高。来看个例子:

```js
const promise = Promise.resolve()
setImmediate(() => {
  console.log('setImmediate');
});
promise.then(()=>{
    console.log('promise')
})
process.nextTick(()=>{
    console.log('nextTick')
})
复制代码
```

代码运行结果如下：

```
nextTick
promise
setImmediate
```

#### 总结

1. 异步线程完成任务后将其放入任务队列，主线程不断轮询任务队列，拿出任务执行

2. 任务队列有宏任务队列和微任务队列的区别

3. 微任务队列的优先级更高，所有微任务处理完后才会处理宏任务，`Promise`和`process.next`是微任务

4. Node.js的Event Loop跟浏览器的Event Loop不一样，他是分阶段的

5. `setImmediate`和`setTimeout(fn, 0)`哪个回调先执行，需要看他们本身在哪个阶段注册的，如果在定时器回调或者I/O回调里面，`setImmediate`肯定先执行。如果在最外层或者`setImmediate`回调里面，哪个先执行取决于当时机器状况。

6. `process.nextTick`不在Event Loop的任何阶段，他是一个特殊API，他会立即执行，然后才会继续执行Event Loop





