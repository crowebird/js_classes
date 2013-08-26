describe('js_classes javascript class extender', function() {

    //Reset global window object before each test
    var windowMethods;
    beforeEach(function() {
        windowMethods = {};
        for(var i in window) {
            windowMethods[i] = true;
        }
    });
    afterEach(function() {
        for(var i in window) {
            if (!windowMethods[i]) {
                delete window[i];
            }
        }
    });

    it('Should only allow proper arguments to be passed', function() {
        expect(function() { js_classes.extend(); }).toThrow("Invalid class declaration, invalid number of arguments");
        expect(function() { js_classes.extend({}); }).toThrow("Invalid class name, must be a string that represents a valid variable name that will be used as the class name");
        expect(function() { js_classes.extend(''); }).toThrow("Invalid class name, must be a string that represents a valid variable name that will be used as the class name");
        expect(function() { js_classes.extend('1TestClass'); }).toThrow("Invalid class name, must be a string that represents a valid variable name that will be used as the class name");
        expect(function() { js_classes.extend('1Test@Class'); }).toThrow("Invalid class name, must be a string that represents a valid variable name that will be used as the class name");
        expect(function() { js_classes.extend('TestClass', ''); }).toThrow("Invalid class function, a js_classes class can only be created by wrapping a function");
        expect(function() { js_classes.extend('TestClass', '', function() {}); }).toThrow("Invalid class definition, expecting an Object");
        expect(function() { js_classes.extend('TestClass', function() {}); }).not.toThrow();
        expect(function() { js_classes.extend('TestClass', {}, function() {}); }).not.toThrow();
    });

    it('Should call constructor on instantiation and constructor should not be accessible as a method', function() {
        var constructSpy = jasmine.createSpy('_construct');
        js_classes.extend('TestClass', function() {
            return {
                _construct: constructSpy
            }
        });
        var instance = new TestClass();
        expect(constructSpy).toHaveBeenCalled();
        expect(instance._construct).toBeFalsy();
    });

    it('Should call parent constructor if child constructor does not exist on instantiation', function() {
        var constructSpy = jasmine.createSpy('_construct');
        js_classes.extend('TestClass', function() {
            return {
                _construct: constructSpy
            }
        });
        TestClass.extend('TestClassExtended', function() {});
        new TestClassExtended();
        expect(constructSpy).toHaveBeenCalled();
    });

    it('Should not call parent method if child overrides parent method', function() {
        var methodSpy = jasmine.createSpy('method');
        js_classes.extend('TestClass', function() {
            return {
                method: methodSpy
            }
        });
        var methodExtendedSpy = jasmine.createSpy('methodExtended');
        TestClass.extend('TestClassExtended', function() {
            return {
                method: methodExtendedSpy
            }
        });
        var instance = new TestClassExtended();
        instance.method();
        expect(methodSpy).not.toHaveBeenCalled();
        expect(methodExtendedSpy).toHaveBeenCalled();
    });

    it('Should allow a child class to access all parent classes with super', function() {
        var methodASpy = jasmine.createSpy('methodA');
        var methodBSpy = jasmine.createSpy('methodB');
        var methodCSpy = jasmine.createSpy('methodC');
        js_classes.extend('TestClass', function() {
            return {
                methodA: methodASpy,
                methodB: methodBSpy,
                methodC: methodCSpy
            }
        });
        TestClass.extend('TestClassExtended', function() {
            return {
                childMethodA: function() {
                    this._super.methodA();
                },
                childMethodB_C: function() {
                    this._super.methodB();
                    this._super.methodC();
                }
            }
        });
        var instance = new TestClassExtended();
        instance.childMethodA();
        instance.childMethodB_C();
        expect(methodASpy).toHaveBeenCalled();
        expect(methodBSpy).toHaveBeenCalled();
        expect(methodCSpy).toHaveBeenCalled();
    });

    it('Should handle abstract classes properly', function() {
        //Check that abstract class cannot be instantiated but the extended class can be
        js_classes.extend('AbstractTestClass', {abstract: true}, function() {});
        expect(function() { new AbstractTestClass() }).toThrow('You cannot create an instance of abstract class AbstractTestClass');
        AbstractTestClass.extend('ExtendedClass', function() {});
        expect(function() { new ExtendedClass() }).not.toThrow();

        //Check that an abstract class with an abstract method cannot have a body
        js_classes.extend('AbstractBadMethodClass', {abstract: true}, function() {
            return {
                someFunction: function abstract() { return 1; }
            };
        });
        AbstractBadMethodClass.extend('ExtendedBadMethodClass', function() {});
        expect(function() { new ExtendedBadMethodClass(); }).toThrow('Abstract function AbstractBadMethodClass::someFunction cannot contain a body');

        //Check that if a class has abstract methods, the class also has to be declared abstract
        js_classes.extend('NotDefinedAbstractClass', function() {
            return {
                someFunction: function abstract(){}
            };
        });
        expect(function() { new NotDefinedAbstractClass(); }).toThrow('Class NotDefinedAbstractClass contains 1 abstract method and must be declared abstract or have those methods implemented (someFunction)');

        //Check that extended class needs to implement the abstract methods
        js_classes.extend('AbstractClass', {abstract: true}, function() {
            return {
                someFunction: function abstract(){}
            };
        });
        AbstractClass.extend('ExtendClassBad', function() {});
        expect(function() { new ExtendClassBad(); }).toThrow('Class ExtendClassBad contains 1 abstract method and must be declared abstract or have those methods implemented (someFunction)');
        AbstractClass.extend('ExtendClassGood', function() {
            return {
                someFunction: function() {}
            }
        });
        expect(function() { new ExtendClassGood(); }).not.toThrow();

        //Check that nested abstraction works
        js_classes.extend('BaseAbstractClass', {abstract: true}, function() {
            return {
                someFunction: function abstract(){}
            };
        });
        BaseAbstractClass.extend('ExtendedAbstractClass', {abstract: true}, function() {
            return {
                someFunction2: function abstract(){}
            };
        });
        ExtendedAbstractClass.extend('FinalClassBad', function() {});
        expect(function() { new FinalClassBad(); }).toThrow('Class FinalClassBad contains 2 abstract methods and must be declared abstract or have those methods implemented (someFunction,someFunction2)');
        ExtendedAbstractClass.extend('FinalClassBad2', function() {
            return {
                someFunction: function() {}
            }
        });
        expect(function() { new FinalClassBad2(); }).toThrow('Class FinalClassBad2 contains 1 abstract method and must be declared abstract or have those methods implemented (someFunction2)');
        ExtendedAbstractClass.extend('FinalClassGood', function() {
            return {
                someFunction: function() {},
                someFunction2: function() {}
            }
        });
        expect(function() { new FinalClassGood(); }).not.toThrow();

        //Check that implemented abstract methods must match argument count
        js_classes.extend('BaseAbstractClassArgs', {abstract: true}, function() {
            return {
                someFunction: function abstract(arg1, arg2) {}
            }
        });
        BaseAbstractClassArgs.extend('FinalClassArgsBad', function() {
           return {
               someFunction: function() {}
           }
        });
        expect(function() { new FinalClassArgsBad(); }).toThrow('Declaration of FinalClassArgsBad::someFunction must be compatible with BaseAbstractClassArgs::someFunction');
        BaseAbstractClassArgs.extend('FinalClassArgsGood', function() {
            return {
                someFunction: function(arg1, arg2) {}
            }
        });
        expect(function() { new FinalClassArgsGood(); }).not.toThrow();
    });

    it('Should only allow overrides if types are the same', function() {
        js_classes.extend('TypeClass', function() {
            return {
                variable: null
            }
        });
        TypeClass.extend('ExtendedTypeClass', function() {
            return {
                variable: function() {}
            }
        });
        expect(function() { new ExtendedTypeClass(); }).toThrow('Class ExtendedTypeClass cannot override variable of type number with type function');
    });
});
