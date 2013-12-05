/**
 * Michael Crowe (crowebird - www.crowebird.com) - 2013
 * https://github.com/crowebird/js_classes
 */
(function(_window) { "use strict";
    _window.js_classes = function() {};

    var extender = function() {
        if (arguments.length > 3 || arguments.length == 0) {
            throw "Invalid class declaration, invalid number of arguments";
        }
        var _name = arguments[0];
        if (typeof _name !== "string" || !/^[$_A-Z][$_A-Z0-9]*?(?:[\.][$_A-Z][$_A-Z0-9]*?)*?$/i.test(_name)) {
            throw "Invalid class name, must be a string that represents a valid variable name that will be used as the class name";
        }
		var namespace = _name.split(/\./);
        var _childClass = arguments[1];
        if (typeof _childClass !== "function") {
            throw "Invalid class function, a js_classes class can only be created by wrapping a function";
        }
		var reference = _window;
		for(var i = 0; i < namespace.length; ++i) {
			if (!reference[namespace[i]]) {
				break;
			}
			if (i == namespace.length - 1) {
				if (reference[namespace[i]] && reference[namespace[i]].js_classes && reference[namespace[i]].js_classes.IDENT == js_classes.IDENT) {
					throw "Cannot redeclare class " + _name;
				}
			} else {
				reference = reference[namespace[i]];
			}
		}
        var _parentClass = this;
        var _abstract = false;
        if (_childClass.name == "abstract") {
            _abstract = true;
        }

        var extendedClass = function(_preventConstruct) {
            if (_preventConstruct !== js_classes.PREVENTCONSTRUCT) {
                if (_abstract) {
                    throw "You cannot create an instance of an abstract class " + _name;
                }
            }

            var abstractMethods = [];

			var _super = {};
            var _child = new _childClass();

			_child.__REDEFINE_SCOPE__ = function(name, method) {
				if (name == '__REDEFINE_SCOPE__') { return; }

				_child[name] = method;;

				if (_child._super) {
					_child._super.__REDEFINE_SCOPE__(name, method);
				}
			};

			for (var i in _child) {
				if (_child.hasOwnProperty(i)) {
					if (typeof _child[i] == "function") {
						if (_parent == null || (_parent != null && !_parent[i])) {
							_child[i] = (function(_i, childObj) {
								if (childObj.name == "abstract") {
									abstractMethods.push(_i);
									var childObjStr = String(childObj);
									childObjStr = childObjStr.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:[\s;]+\/\/(?:.*)$)/gm, '');
									if (!/^function abstract\(.*?\)\s*?{\s*?\}/m.test(String(childObjStr))) {
										throw "Abstract function " + _name + "::" + i + " cannot contain a body";
									}
								}
								return childObj;
							})(i, _child[i]);
						}
						(function(childObj) {
							childObj.abstract = childObj.name == "abstract";
							childObj.definedArguments = childObj.length;
							childObj.className = _name;
						})(_child[i]);
					}
				}
			}

			var _parent = null;
            if (_parentClass !== _window.js_classes) {
                _parent = new _parentClass(js_classes.PREVENTCONSTRUCT);
                for(var i in _parent) {
                    if (_parent.hasOwnProperty(i)) {
						_super[i] = function(_p) {
							return _p;
						}(_parent[i]);
                        if (!_child.hasOwnProperty(i)) {
                            _child[i] = (function(_i, parentObj) {
                                if (parentObj.abstract) {
                                    abstractMethods.push(_i);
                                }
								parentObj.definitonFrom = _parentClass.js_classes.NAME;
                                return parentObj;
                            })(i, _parent[i]);
                        } else {
                            _child[i] = (function(_i, childObj, parentObj) {
                                if (typeof childObj != typeof parentObj) {
                                    throw "Class " + _name + " cannot override " + _i + " of type "  + (typeof parentObj) + " with type " + (typeof childObj);
                                }
                                if (typeof childObj == "function") {
                                    if (parentObj.abstract && parentObj.definedArguments != childObj.length) {
                                        throw "Declaration of " + _name + "::" + i + " must be compatible with " + parentObj.className + "::" + _i;
                                    }
                                }
								return childObj;
                            })(i, _child[i], _parent[i]);
							_parent.__REDEFINE_SCOPE__(i, _child[i]);
                        }
                    }
                }
            }

			if (!_abstract && abstractMethods.length > 0) {
				throw "Class " + _name + " contains " + abstractMethods.length + " abstract method" + (abstractMethods.length == 1 ? "" : "s") + " and must be declared abstract or have those methods implemented (" + abstractMethods.reverse().toString() + ")";
			}

			if (_parent) {
				_child._super = _super;
			}

            var _this = this;
            _child._instanceOf = function(_Class) {
                return ((_Class === js_classes) || (_this instanceof _Class) || (_parent && _parent._instanceOf && _parent._instanceOf(_Class))) ? true : false;
            };

            if (_child._construct && _preventConstruct !== js_classes.PREVENTCONSTRUCT) {
                _child._construct.apply(null, arguments);
                delete _child._construct;
				delete _child.__REDEFINE_SCOPE__;
            }

			_child.__INSTANCE__ = _name;

            return _child;
        }

		reference = _window;
        for(i = 0; i < namespace.length; ++i) {
            if (!reference[namespace[i]]) {
                reference[namespace[i]] = {};
            }
            if (i == namespace.length - 1) {
				for(var j in reference[namespace[i]]) {
					if (reference[namespace[i]].hasOwnProperty(j)) {
						extendedClass[j] = reference[namespace[i]][j];
					}
				}
                reference[namespace[i]] = extendedClass;
            } else {
                reference = reference[namespace[i]];
            }
        }

		extendedClass.extend = extender;
		extendedClass.js_classes = {
			CREATED: new Date(),
			IDENT: js_classes.IDENT,
			NAME: _name
		};

		return js_classes;
    };
    js_classes.extend = extender;
    js_classes.PREVENTCONSTRUCT = 'ED7352BC-BDDD-45BA-B0B5-3577A355665A-05A4367A-7CD1-4B54-91B0-F2DA44D4871A';
	js_classes.IDENT = '6931988F-786C-48A0-8A45-7C2D8A05A766DEAC069B-C752-4669-B956-E6D24DF3B87A';
})(window);
