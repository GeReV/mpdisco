define(function() {
  // THREEx.KeyboardState.js keep the current state of the keyboard.
  // It is possible to query it at any time. No need of an event.
  // This is particularly convenient in loop driven case, like in
  // 3D demos or games.
  //
  // # Usage
  //
  // **Step 1**: Create the object
  //
  // ```var keyboard = new THREEx.KeyboardState();```
  //
  // **Step 2**: Query the keyboard state
  //
  // This will return true if shift and A are pressed, false otherwise
  //
  // ```keyboard.pressed("shift+A")```
  //
  // **Step 3**: Stop listening to the keyboard
  //
  // ```keyboard.destroy()```
  //
  // NOTE: this library may be nice as standaline. independant from three.js
  // - rename it keyboardForGame
  //
  // # Code
  //
  
  /**
   * - NOTE: it would be quite easy to push event-driven too
   * - microevent.js for events handling
   * - in this._onkeyChange, generate a string from the DOM event
   * - use this as event name
   */
  KeyboardState = function() {
    // to store the current state
    this.keyCodes = {};
    this.modifiers = {};
    this.touch = false;
    this.touchPosition
  
    // create callback to bind/unbind keyboard events
    var self = this;
    this._onKeyDown = function(event) {
      self._onKeyChange(event, true);
    };
    this._onKeyUp = function(event) {
      self._onKeyChange(event, false);
    };
    
    // bind keyEvents
    document.addEventListener("keydown", this._onKeyDown, false);
    document.addEventListener("keyup", this._onKeyUp, false);
    
    document.addEventListener("touchstart", this._handleStart.bind(this), false);
    document.addEventListener("touchend", this._handleEnd.bind(this), false);
    //document.addEventListener("touchcancel", handleCancel, false);
    //document.addEventListener("touchleave", this._handleLeave);
    document.addEventListener("touchmove", this._handleMove.bind(this), false  );
  }
  /**
   * To stop listening of the keyboard events
   */
  KeyboardState.prototype.destroy = function() {
    // unbind keyEvents
    document.removeEventListener("keydown", this._onKeyDown, false);
    document.removeEventListener("keyup", this._onKeyUp, false);
  }
  
  KeyboardState.MODIFIERS = ['shift', 'ctrl', 'alt', 'meta'];
  KeyboardState.ALIAS = {
    'left' : 37,
    'up' : 38,
    'right' : 39,
    'down' : 40,
    'space' : 32,
    'pageup' : 33,
    'pagedown' : 34,
    'tab' : 9
  };
  
  /**
   * to process the keyboard dom event
   */
  KeyboardState.prototype._onKeyChange = function(event, pressed) {
    // log to debug
    //console.log("onKeyChange", event, pressed, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey)
  
    // update this.keyCodes
    var keyCode = event.keyCode;
    this.keyCodes[keyCode] = pressed;
  
    // update this.modifiers
    this.modifiers['shift'] = event.shiftKey;
    this.modifiers['ctrl'] = event.ctrlKey;
    this.modifiers['alt'] = event.altKey;
    this.modifiers['meta'] = event.metaKey;
  }
  /**
   * query keyboard state to know if a key is pressed of not
   *
   * @param {String} keyDesc the description of the key. format : modifiers+key e.g shift+A
   * @returns {Boolean} true if the key is pressed, false otherwise
   */
  KeyboardState.prototype.pressed = function(keyDesc) {
    var keys = keyDesc.split("+");
    for(var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var pressed;
      if(KeyboardState.MODIFIERS.indexOf(key) !== -1) {
        pressed = this.modifiers[key];
      } else if(Object.keys(KeyboardState.ALIAS).indexOf(key) != -1) {
        pressed = this.keyCodes[KeyboardState.ALIAS[key]];
      } else {
        pressed = this.keyCodes[key.toUpperCase().charCodeAt(0)]
      }
      if(!pressed)
        return false;
    };
    return true;
  }
  
  
  KeyboardState.prototype._handleStart = function(evt) {
    evt.preventDefault();
    this.touch = true;
    this.touchPosition = [evt.touches[0].pageX, evt.touches[0].pageY];
  }
  
  KeyboardState.prototype._handleMove = function(evt) {
    evt.preventDefault();
    this.touchPosition = [evt.touches[0].pageX, evt.touches[0].pageY];
  }
  
  KeyboardState.prototype._handleEnd = function(evt) {
    evt.preventDefault();
    this.touch = false;
  }
  
  return KeyboardState;
});