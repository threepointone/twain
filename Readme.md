
# twain

  dynamic tweening engine

  [![Build Status](https://travis-ci.org/threepointone/twain.png?branch=master)](https://travis-ci.org/threepointone/twain)

## Installation

    $ component install threepointone/twain

## API

from `examples/basic.html`
```js

var box = document.getElementById('box'),
    tween = Twain();    // start up a new tweener


tween.update(function(step) {
    // step.left, step.top have values to be set
    for(var prop in step){
        box.style[prop] = step[prop] + 'px';
    }

    // or if you had jquery, you could do -
    // $(box).css(step);

});

// update targets with every mousemove
document.body.addEventListener('mousemove', function(e) {
    tween.to({
        left: e.clientX,
        top:  e.clientY
    });
});

setInterval(function(){
    tween.update();
}, 1000/60)

```   

## Tests 

Install dependencies with 
```
npm install
```
then run
```
npm test
```

## Coverage

```
npm run-script coverage
```



## License

  MIT

### bits and pieces from

- [manuelstofer/each](https://github.com/manuelstofer/each)
- [component/tween](https://github.com/component/tween)
- [ded/morpheus](https://github.com/ded/morpheus/)
