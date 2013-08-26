/**
 * Michael Crowe (crowebird - www.crowebird.com) - 2013
 * https://github.com/crowebird/js_classes
 */
(function() {
    var _window = this;
    _window.js_classes = function() {};
    var extender = function() {
        if (arguments.length > 3 || arguments.length == 0) {
            throw {
                name: "Error",
                message: "Invalid class declaration, invalid number of arguments"
            };
        }
        var _name = arguments[0];
        if (typeof _name !== "string" || !/^[$_A-Z][$_A-Z0-9]*$/i.test(_name)) {
            throw {
                name: "Error",
                message: "Invalid class name, must be a string that represents a valid variable name that will be used as the class name"
            };
        }
        var _childClass = arguments[arguments.length == 3 ? 2 : 1];
        if (typeof _childClass !== "function") {
            throw {
                name: "Error",
                message: "Invalid class function, a js_classes class can only be created by wrapping a function"
            };
        }
        var _definition = arguments.length == 3 ? arguments[1] : {};
        if (typeof _definition !== "object") {
            throw {
                name: "Error",
                message: "Invalid class definition, expecting an Object"
            };
        }
        var _parentClass = this;

        var extendedClass = function(_preventConstruct) {
            if (_preventConstruct !== js_classes.PREVENTCONSTRUCT) {
                if (_definition.abstract) {
                    throw {
                        name: "Error",
                        message: "You cannot create an instance of abstract class " + _name
                    };
                }
            }

            var abstractMethods = [];

            var _child = new _childClass();
            var _parent = null;
            if (_parentClass !== _window.js_classes) {
                _parent = new _parentClass(js_classes.PREVENTCONSTRUCT);
                for(var i in _parent) {
                    if (_parent.hasOwnProperty(i)) {
                        if (!_child[i]) {
                            _child[i] = (function(_i, parentObj) {
                                if (parentObj.abstract) {
                                    abstractMethods.push(_i);
                                }
                                return parentObj;
                            })(i, _parent[i]);
                        } else {
                            _child[i] = (function(_i, childObj, parentObj, parent) {
                                if (typeof childObj != typeof parentObj) {
                                    throw {
                                        name: "Error",
                                        message: "Class " + _name + " cannot override " + _i + " of type "  + (typeof parentObj) + " with type " + (typeof childObj)
                                    }
                                }
                                if (typeof childObj == "function") {
                                    if (parentObj.abstract && parentObj.definedArguments != childObj.length) {
                                        throw {
                                            name: "Error",
                                            message: "Declaration of " + _name + "::" + i + " must be compatible with " + parentObj.className + "::" + _i
                                        }
                                    }
                                    return function() {
                                        return childObj.apply({ _super: parent }, arguments);
                                    };
                                } else {
                                    return childObj;
                                }
                            })(i, _child[i], _parent[i], _parent);
                        }
                    }
                }
            }

            for (var i in _child) {
                if (_child.hasOwnProperty(i)) {
                    if (typeof _child[i] == "function" && (_parent == null || (_parent != null && !_parent[i]))) {
                        _child[i] = (function(_i, childObj, parent) {
                            if (childObj.name == "abstract") {
                                abstractMethods.push(_i);
                                var childObjStr = String(childObj);
                                childObjStr = childObjStr.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:[\s;]+\/\/(?:.*)$)/gm, '');
                                if (!/^function abstract\(.*?\)\s*?{\s*?\}/m.test(String(childObjStr))) {
                                    throw {
                                        name: "Error",
                                        message: "Abstract function " + _name + "::" + i + " cannot contain a body"
                                    }
                                }
                            }
                            var _return = function() {
                                return childObj.apply(_parent ? { _super: parent } : null, arguments);
                            };
                            _return.abstract = childObj.name == "abstract";
                            _return.definedArguments = childObj.length;
                            _return.className = _name;
                            return _return;
                        })(i, _child[i], _parent);
                    }
                }
            }

            if (!_definition.abstract && abstractMethods.length > 0) {
                throw {
                    name: "Error",
                    message: "Class " + _name + " contains " + abstractMethods.length + " abstract method" + (abstractMethods.length == 1 ? "" : "s") + " and must be declared abstract or have those methods implemented (" + abstractMethods.reverse().toString() + ")"
                }
            }

            var _this = this;
            _child._instanceOf = function(_Class) {
                return (_Class === js_classes) || (_this instanceof _Class) || (_parent._instanceOf && _parent._instanceOf(_Class));
            };

            if (_child._construct && _preventConstruct !== js_classes.PREVENTCONSTRUCT) {
                _child._construct.apply(null, arguments);
                delete _child._construct;
            }

            return _child;
        }
        extendedClass.extend = extender;

        var namespace = _name.split(/\./);
        var reference = _window;
        for(var i = 0; i < namespace.length; ++i) {
            if (!reference[namespace[i]]) {
                reference[namespace[i]] = {};
            }
            if (i == namespace.length - 1) {
                reference[namespace[i]] = extendedClass;
            } else {
                reference = reference[namespace[i]];
            }
        }
    };
    js_classes.extend = extender;
    js_classes.PREVENTCONSTRUCT = 'ED7352BC-BDDD-45BA-B0B5-3577A355665A-05A4367A-7CD1-4B54-91B0-F2DA44D4871A';
})();
