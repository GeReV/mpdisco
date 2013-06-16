
var _ = require('underscore'),
    Class = require('../lib/class.min.js');

describe("CALLBACKS", function() {

  var Args = Class.extend({

    init : function(initial) {
      this.initial = initial;
    },

    run : function() {

      var args = Array.prototype.slice.call(arguments);
      args.unshift(this.initial);

      return args;
    }
  });

  var test = new Args(1);

  var spec = function(func) {

    var callback = test.callback(func);
  
    it("should be a function", function() {
      expect(typeof(callback)).toBe('function');
    });

    it("should return what the method returns", function() {
      expect(callback()).toEqual([ 1 ]);
    });

    it("should pass arguments to the method", function() {
      expect(callback(2, 3, 4)).toEqual([ 1, 2, 3, 4 ]);
    });

    describe("with additional arguments", function() {

      var callbackWithArgs = test.callback(func, 5, 6);

      it("should splice its arguments before the method's", function() {
        expect(callbackWithArgs(2, 3, 4)).toEqual([ 1, 5, 6, 2, 3, 4 ]);
      });
    });
  };

  describe("A callback on a method", function() {
    spec(test.run);
  });

  describe("A callback on a method name", function() {
    spec('run');
  });
});
