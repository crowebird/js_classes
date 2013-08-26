# js_classes
### A js function that adds simple class extensibility to javascript without prototyping or requiring any external libraries.

I wanted a truer class based experience with javascript, but most of the extensibility scripts out there for JS did not fit what I was looking for, so I created my own.

This allows you to __extend classes__, gives you a __constructor that is auto called upon initialization__, and gives you __access to super for extended classes__ (as well as create __abstract classes and methods__).

Note that there is a limitation with how deep classes work.  There are only PUBLIC and PRIVATE methods, and child classes only have access to parent PUBLIC methods.  There is no PROTECTED.

## How It Works

```javascript
js_classes.extend('SomeClass', function() {
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

You call js_classes.extend to create a new class.  js_classes.extend has two ways to be called:

```javascript
js_classes.extend(name, function);
js_classes.extend(name, options, function);

//name - the name of the class
//options - a json object of options for the class
//function - the callable function that is the class being created.
```

Function works as a class using javascript scope.  The function returns a json object, these will be the public methods/variables.  Anything meant to be private will be left outside of the json object (see the example above).

The variable `self` allows all the public methods to be accessed from other public methods, and gives the private scope access to the public scope.

### Extending
When extending, simply call extend on a class that was created with js_class.extend.

Any public method that is overwritten will have access to a _super function which will call the parent function.

```javascript
js_classes.extend('Animal', function() {
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

Animal.extend('Cat', function() {
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
Animal.extend('Cat', function() {
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
console.log(myCat.getType()); //_type is not defined
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

### Abstract
Abstract classes can also be created, these are defined by passing the abstract option when creating a class:

```javascript
js_classes.extend('AbstractTestClass', {abstract: true}, function() {
  var self;
  return self = {
    myAbstractFunction: function abstract() {},
    myDefinedFunction: function() {
      return 1;
    }
  };
});
```

_Abstract classes cannot be instantiated.  Trying to create an instance of them will throw an error._

Notice in the example above we created two public methods:
  - `myAbstractFunction` which is declared abstract by naming the function `abstract`.  The function must be empty, adding a body to it will throw an error.  Any class that extends this class must implement this function.
  - `myDefinedFunction` which is a normal public method, any child methods that do not override it will (in this case) return 1

Now if we extended AbstractTestClass, using what we know, we will only have to implement myAstractFunction, otherwise an error will be thrown when we instantiate our new class:

```javascript
js_classes.extend('ExtendedTestClass', function() {
  var self;
  return self = {
    myAbstractFunction: function () {
      return 'I have implemented myAbstractFunction'
    }
  };
});
var myInstance = new ExtendedTestClass();
myInstance.myAbstractFunction(); //I have implemented myAstractFunction
myInstance.myDefinedFunction(); //1
```
