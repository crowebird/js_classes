# js_classes
### A js function that adds simple class extensibity to javascript without prototyping or requiring any external libraries.

I wanted a truer class based experience with javascript, but most of the extensibility scripts out there for JS did not fit what I was looking for, so I created my own.

This allows you to extend classes, gives you a constructor that is auto called upon initilization, and gives you access to super for extended classes.

Note that there is a limitation with how deep classes work.  There are only PUBLIC and PRIVATE methods, and child classes only have access to parent PUBLIC methods.  There is no PROTECTED.

## How It Works

```javascript
var SomeClass = js_classes.extend(function() {
  var self;
  var somePrivateVar;
  
  return self = {
    _construct: function(_arg) {
      somePrivateVar = _arg;
    },
    
    getVar: function() {
      return somePrivateVar;
    }
  };
})

var mySomeClass = new SomeClass(10);
console.log(mySomeClass.getVar()); //10
```


