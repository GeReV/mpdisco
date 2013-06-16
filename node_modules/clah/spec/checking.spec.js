
var _ = require('underscore'),
    Class = require('../lib/class.min.js');

describe("CHECKING", function() {

  var World = Class.extend({
    hello : function() {
      return 'Hello World!';
    }
  });

  var earth = new World();

  describe("#callback", function() {
    
    it("should accept a function", function() {
      expect(function() {
        earth.callback(earth.hello);
      }).not.toThrow();
    });

    it("should accept the name of a method", function() {
      expect(function() {
        earth.callback('hello');
      }).not.toThrow();
    });

    it("should not accept an unknown method name", function() {
      expect(function() {
        earth.callback('unknown');
      }).toThrow();
    });

    _.each([ undefined, null, -1, 0, 2, true, false, [], {}, 2.4, NaN ], function(invalid) {
      it("should not accept " + invalid, function() {
        expect(function() {
          earth.callback(invalid);
        }).toThrow();
      });
    });

    it("should warn that a method name is unknown", function() {
      try {
        earth.callback('unknown');
        expect(false).toBe(true);
      } catch (err) {
        expect(err.message).toBe('Callback error: this object has no method "unknown"');
      }
    });
  });
});
