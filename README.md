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

You first call js_classes.extend to a function.  This sets up a class object that can be instantited.
That function returns a json object which will be the accessable public methods.

Anything not returned through the json object will be private for the scope of the class.

We created a reference variable self so that any of the public methods can be accessed between each other, and can also be accessed by any private methods.

### Extending

When extending, simply call extend on a class that was created with js_class.extend.

Any public method that is overloaded will have access to a _super function which will call the parent function.

```javascript
var Animal = js_class.extend(function() {
  var self;
  var _sound,
      _type;
      
  return self = {
    _construct: function(sound, type) {
      _sound = sound || '...';
      _type = type || 'unknown'
    },
    
    makeSound: function() {
      return _sound;
    },
    
    getType: function() {
      return _type;
    }
  };
});

var Cat = Animal.extend(function() {
  var self;
  
  return self = {
    _construct: function() {
      this._super('meow', 'cat');
    }
  }
});

var myCat = new Cat();
console.log(myCat.makeSound()); //meow
console.log(myCat.getType()); //cat

