/*!
 * clah v1.2.1
 * https://github.com/AlphaHydrae/clah
 *
 * By John Resig http://ejohn.org/
 * Additions by Alpha Hydrae (https://github.com/AlphaHydrae)
 * MIT Licensed.
 */

(function(exports) {

  /* Simple JavaScript Inheritance
   * By John Resig http://ejohn.org/
   * MIT Licensed.
   */

  // Inspired by base2 and Prototype
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  var Class = function(){};

  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };

  /*
   * Bound callbacks and noConflict for browsers.
   * By Alpha Hydrae (https://github.com/AlphaHydrae)
   * MIT Licensed.
   */

  var Base = Class.extend({

    callback : function(method) {

      var addArgs = Array.prototype.slice.call(arguments, 1);
      addArgs.splice(0, 0, 0, 0);

      var func = typeof(method) == 'function' ? method : this[method];
      if (typeof(func) != 'function') {
        if (typeof(method) == 'string') {
          throw new Error("Callback error: this object has no method \"" + method + "\"");
        } else {
          throw new Error("Callback error: a function or method name must be given");
        }
      }

      var self = this;

      return function() {

        var args = Array.prototype.slice.call(arguments);
        Array.prototype.splice.apply(args, addArgs);
        
        return func.apply(self, args);
      };
    }
  });

  // Provide original version.
  Base.Class = Class;

  if (typeof(module) === 'object' && module.exports === exports) {

    module.exports = Base;
  } else {

    var _Class = exports.Class;

    Base.noConflict = function(deep) {

      if (exports.Class === Base) {
        exports.Class = _Class; 
      }   

      return Base;
    };  

    exports.Class = Base;
  }

})(this);

