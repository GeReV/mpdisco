
var _ = require('underscore'),
    Class = require('../lib/class.min.js');

describe("OVERRIDING", function() {

  describe("A subclass", function() {

    var SuperClass = Class.extend({

      init : function(value) {
        this.value = value;
      },

      worth : function() {
        return this.value;
      }
    });

    var SubClass = SuperClass.extend({

      init : function() {
        this._super(42);
        this.value += 1295;
      },

      worth : function() {
        return "About " + this._super();
      }
    });

    var instance = new SubClass(42);

    it("should be able to call its overriden init method", function() {
      expect(instance.value).toBe(1337);
    });

    it("should be able to call other overriden methods", function() {
      expect(instance.worth()).toBe('About 1337');
    });
  });
});
