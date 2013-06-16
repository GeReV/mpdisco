
var _ = require('underscore'),
    Class = require('../lib/class.min.js');

describe('BASICS', function() {

  describe("Class", function() {
    
    it("should be a function", function() {
      expect(typeof(Class)).toBe('function');
    });

    it("should be extendable", function() {
      expect(typeof(Class.extend)).toBe('function');
    });

    describe("when extended", function() {

      var methods = {
        init : function(name) { this.name = name; },
        hello : function() { return 'Hello ' + this.name + '!'; }
      };

      var extended = Class.extend(methods);

      it("should be a function", function() {
        expect(typeof(extended)).toBe('function');
      });

      it("should also be extendable", function() {
        expect(typeof(extended.extend)).toBe('function');
      });

      it("should have all given methods", function() {
        _.each(methods, function(method, name) {
          expect(extended.prototype[name]).toBe(method);
        });
      });

      it("should call the init method when instantiated", function() {
        spyOn(extended.prototype, 'init');
        new extended('World');
        expect(extended.prototype.init).toHaveBeenCalled();
      });

      describe("should create objects which", function() {
        
        var name = 'World';
        var instance = new extended(name);

        it("should be an object", function() {
          expect(typeof(instance)).toBe('object');
        });

        it("should have all given methods", function() {
          _.each(methods, function(method, name) {
            expect(instance[name]).toBe(method);
          });
        });

        it("should call its methods with the correct context", function() {
          expect(instance.hello()).toBe('Hello ' + name + '!');
        });
      });
    });
  });
});
