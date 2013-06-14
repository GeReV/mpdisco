(function() {
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (obj) {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      if (typeof this !== 'function') {
          throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }
      var slice = [].slice,
          args = slice.call(arguments, 1),
          self = this,
          nop = function () { },
          bound = function () {
              return self.apply(this instanceof nop ? this : (obj || {}),
                                args.concat(slice.call(arguments)));
          };
      bound.prototype = this.prototype;
      return bound;
    };
  }
})();
