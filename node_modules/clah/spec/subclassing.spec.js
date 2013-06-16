
var _ = require('underscore'),
    Class = require('../lib/class.min.js');

describe("SUBCLASSING", function() {

  describe("A person", function() {

    var Person = Class.extend({

      init : function(name) {
        this.name = name;
      }
    });

    var world = new Person('World');

    it("should have a name", function() {
      expect(world.name).toBe('World');
    });

    describe("who is greetable", function() {

      var GreetablePerson = Person.extend({
        
        hello : function() {
          return 'Hello ' + this.name + '!';
        }
      });

      var greetable = new GreetablePerson('John');

      it("should be greeted", function() {
        expect(greetable.hello()).toBe('Hello John!');
      });

      describe("and friendly", function() {

        var FriendlyPerson = GreetablePerson.extend({
          
          hello : function() {
            return this._super() + ' How are you?';
          }
        });

        var friendly = new FriendlyPerson('Jane');

        it("should be greeted warmly", function() {
          expect(friendly.hello()).toBe('Hello Jane! How are you?');
        });
      });

      describe("and unfriendly", function() {

        var UnfriendlyPerson = GreetablePerson.extend({
      
          hello : function() {
            return 'Damn, you again.';
          }
        });

        var unfriendly = new UnfriendlyPerson('Jack');

        it("should be greeted coldly", function() {
          expect(unfriendly.hello()).toBe('Damn, you again.');
        });
      });
    });
  });
});
