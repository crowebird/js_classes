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
        expect(function() { js_classes.extend('TestClass', function() {}); }).not.toThrow();
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
        var methodDSpy = jasmine.createSpy('methodD');
        var methodESpy = jasmine.createSpy('methodE');
        js_classes.extend('TestClass', function() {
            return {
                methodA: methodASpy,
                methodB: methodBSpy,
                methodC: methodCSpy,
				methodD: methodDSpy,
				methodE: methodESpy
            }
        });
        TestClass.extend('TestClassExtended', function() {
			var self;
            return self = {
                childMethodA: function() {
					self._super.methodA();
                },
                childMethodB_C: function() {
					self._super.methodB();
					self._super.methodC();
                },
				methodD: function() {
					self._super.methodD();
				}
            }
        });
        var instance = new TestClassExtended();
        instance.childMethodA();
        instance.childMethodB_C();
		instance.methodD();
		instance.methodE();
        expect(methodASpy).toHaveBeenCalled();
        expect(methodBSpy).toHaveBeenCalled();
        expect(methodCSpy).toHaveBeenCalled();
		expect(methodDSpy).toHaveBeenCalled();
		expect(methodESpy).toHaveBeenCalled();
    });

    it('Should handle abstract classes properly', function() {
        //Check that abstract class cannot be instantiated but the extended class can be
        js_classes.extend('AbstractTestClass', function abstract() {});
        expect(function() { new AbstractTestClass() }).toThrow('You cannot create an instance of abstract class AbstractTestClass');
        AbstractTestClass.extend('ExtendedClass', function() {});
        expect(function() { new ExtendedClass() }).not.toThrow();

        //Check that an abstract class with an abstract method cannot have a body
        js_classes.extend('AbstractBadMethodClass', function abstract() {
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
        js_classes.extend('AbstractClass', function abstract() {
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
        js_classes.extend('BaseAbstractClass', function abstract() {
            return {
                someFunction: function abstract(){}
            };
        });
        BaseAbstractClass.extend('ExtendedAbstractClass', function abstract() {
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
        js_classes.extend('BaseAbstractClassArgs', function abstract() {
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
        expect(function() { new ExtendedTypeClass(); }).toThrow('Class ExtendedTypeClass cannot override variable of type object with type function');
    });

    it('Should correctly identify js_classes with _instanceOf', function() {
        js_classes.extend('ClassA', function() {});
        ClassA.extend('ClassB', function() {});
        ClassB.extend('ClassC', function() {});
        ClassA.extend('ClassD', function() {});

        var instanceA = new ClassA();
        var instanceB = new ClassB();
        var instanceC = new ClassC();
        var instanceD = new ClassD();

        expect(instanceA._instanceOf(js_classes)).toBeTruthy();

        expect(instanceA._instanceOf(ClassA)).toBeTruthy();
        expect(instanceA._instanceOf(ClassB)).toBeFalsy();
        expect(instanceA._instanceOf(ClassC)).toBeFalsy();
        expect(instanceA._instanceOf(ClassD)).toBeFalsy();

        expect(instanceB._instanceOf(ClassA)).toBeTruthy();
        expect(instanceB._instanceOf(ClassB)).toBeTruthy();
        expect(instanceB._instanceOf(ClassC)).toBeFalsy();
        expect(instanceB._instanceOf(ClassD)).toBeFalsy();

        expect(instanceC._instanceOf(ClassA)).toBeTruthy();
        expect(instanceC._instanceOf(ClassB)).toBeTruthy();
        expect(instanceC._instanceOf(ClassC)).toBeTruthy();
        expect(instanceC._instanceOf(ClassD)).toBeFalsy();

        expect(instanceD._instanceOf(ClassA)).toBeTruthy();
        expect(instanceD._instanceOf(ClassB)).toBeFalsy();
        expect(instanceD._instanceOf(ClassC)).toBeFalsy();
        expect(instanceD._instanceOf(ClassD)).toBeTruthy();
    });

    it('Should namespace correctly', function() {
        js_classes.extend('My.Namespaced.ClassName', function() {});
        js_classes.extend('My.Namespaced.ClassName2', function() {});
        My.Namespaced.ClassName.extend('My.Namespaced.ClassName3', function() {});
		js_classes.extend('My', function() {});
        expect(My).toBeDefined();
        expect(My.Namespaced).toBeDefined();
        expect(My.Namespaced.ClassName).toBeDefined();
        expect(My.Namespaced.ClassName2).toBeDefined();
        expect(My.Namespaced.ClassName3).toBeDefined();
        var instance = new My.Namespaced.ClassName();
        expect(instance._instanceOf).toBeDefined();
        expect(instance._instanceOf(js_classes)).toBeTruthy();
        var instance2 = new My.Namespaced.ClassName2();
        expect(instance2._instanceOf).toBeDefined();
        expect(instance2._instanceOf(js_classes)).toBeTruthy();
        var instance3 = new My.Namespaced.ClassName3();
        expect(instance3._instanceOf).toBeDefined();
        expect(instance3._instanceOf(js_classes)).toBeTruthy();
        expect(instance3._instanceOf(My.Namespaced.ClassName)).toBeTruthy();
    });

	it('Should not allow a class to be redeclared', function() {
		expect(function() { js_classes.extend('MyTestClass', function() {}); }).not.toThrow();
		expect(function() { js_classes.extend('MyTestClass', function() {}); }).toThrow('Cannot redeclare class MyTestClass');
		expect(function() { js_classes.extend('MyTestClass.Extended', function() {}); }).not.toThrow();
		expect(function() { js_classes.extend('MyTestClass.Extended', function() {}); }).toThrow('Cannot redeclare class MyTestClass.Extended');
		expect(function() { js_classes.extend('SomeOtherClass.Extended', function() {}); }).not.toThrow();
		expect(function() { js_classes.extend('MyTestClass.Extended.Another', function() {}); }).not.toThrow();
	});
});
