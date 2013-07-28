/**
 * Michael Crowe (crowebird) - 2013
 * https://github.com/crowebird/js_classes
 */
(function() {
    this.js_classes = function() {};
    var extender = function(_childClass) {
        var _parentClass = this;

        var extendedClass = function(_preventConstruct) {
            var _parent = new _parentClass(js_classes.PREVENTCONSTRUCT);
            var _child = new _childClass();
            var _this = this;

            for(var i in _parent) {
                if (_parent.hasOwnProperty(i)) {
                    if (!_child[i]) {
                        _child[i] = (function(obj) {
                            return obj;
                        })(_parent[i]);
                    } else {
                        _child[i] = (function(childObj, parentObj) {
                            if (typeof childObj == "function" && typeof parentObj == "function") {
                                return function() {
                                    return childObj.apply({ _super: parentObj }, arguments);
                                };
                            }
                        })(_child[i], _parent[i] || null);
                    }
                }
            }

            if (_child._construct && _preventConstruct !== js_classes.PREVENTCONSTRUCT) {
                _child._construct.apply(null, arguments);
                delete _child._construct;
            }

            _child._instanceOf = function(_Class) {
                return (_Class === js_classes) || (_this instanceof _Class) || (_parent._instanceOf && _parent._instanceOf(_Class));
            };

            return _child;
        }
        extendedClass.extend = extender;
        return extendedClass;
    };
    js_classes.extend = extender;
    js_classes.PREVENTCONSTRUCT = 'ED7352BC-BDDD-45BA-B0B5-3577A355665A-05A4367A-7CD1-4B54-91B0-F2DA44D4871A';
})();
