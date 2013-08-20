# js_classes
### A js function that adds simple class extensibility to javascript without prototyping or requiring any external libraries.

I wanted a truer class based experience with javascript, but most of the extensibility scripts out there for JS did not fit what I was looking for, so I created my own.

This allows you to extend classes, gives you a constructor that is auto called upon initialization, and gives you access to super for extended classes.

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
    },
    
    getVarFormatted: function() {
      return "\n" + self.getVar() + "\n";
    }
  };
})

var mySomeClass = new SomeClass(10);
console.log(mySomeClass.getVar()); //10
```

You first call js_classes.extend to a function.  This sets up a class object that can be instantiated.
That function returns a json object which will be the accessible public methods.

Anything not returned through the json object will be private for the scope of the class.

We created a reference variable self so that any of the public methods can be accessed between each other, and can also be accessed by any private methods.

### Extending
When extending, simply call extend on a class that was created with js_class.extend.

Any public method that is overwritten will have access to a _super function which will call the parent function.

```javascript
var Animal = js_classes.extend(function() {
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
      this._super._construct('meow', 'cat');
    }
  }
});

var myCat = new Cat();
console.log(myCat.makeSound()); //meow
console.log(myCat.getType()); //cat
```

_Note that _construct is not a true public method.  Creating an instance will auto call the _construct method for you, and then remove it as a callable function._

### Limitations
Remember that there are only PUBLIC and PRIVATE methods.  If we took the above example and changed Cat to:

```javascript
var Cat = Animal.extend(function() {
  var self;
  
  return self = {
    _construct: function() {
      this._super._construct('meow', 'cat');
    },
    
    makeSound: function() {
      return this._super.makeSound();
    },
    
    getType: function() {
      return _type;
    }
  }
});
var myCat = new Cat();
console.log(myCat.makeSound()); //meow
console.log(myCat.getType()); //undefined
```

makeSound will still fire properly since we directly reference the parent function call.  getType however will fail because in the scope of Cat, _type is undefined.

### Instance Of
Traditional javascript instanceof will not work with my implementation of classes, since an instantiated Class really becomes a reference to a json Object, not the function Class itself.

To fix this, all classes have a method _instanceOf that will allow you to check if an instance is an instanceof some class, or is a subclass of some class.

Using the same Animal, Cat example:

```javascript
var myAnimal = new Animal();
var myCat = new Cat();

console.log(myAnimal._instanceOf(Animal)); //true
console.log(myAnimal._instanceOf(js_classes)); //true
console.log(myAnimal._instanceOf(Cat)); //false
console.log(myCat._instanceOf(Cat)); //true
console.log(myCat._instanceOf(Animal)); //true
```

_Note that _instanceOf cannot be overwritten_

