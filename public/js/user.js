define(['mpdisco'], function(MPDisco) {  
  var User = MPDisco.module('User', function(User, MPDisco, Backbone, Marionette, $, _) {
    User.Model = MPDisco.Model.extend({
      defaults: {
        displayName: 'User',
        thumbnailUrl: 'http://www.gravatar.com/avatar/00000000000000000000000000000000'
      },
      
      socketEvents: {
        identify: 'set'
      },
      
      initialize: function() {
        this.listenTo(MPDisco.vent, 'networkready', function(data) {
          data.info && this.set(data.info);
        });
      }
    });
  });
  
  User.UserView = Marionette.ItemView.extend({
    className: 'frame',
    
    getTemplate: function() {
      if (this.identified) {
        return '#user_template';
      }
      
      return '#user_identify_template';
    },
    
    modelEvents: {
      change: 'showUser'
    },
    
    model: new User.Model,
    
    events: {
      'click button': 'sendInfo'
    },
    
    ui: {
      name: 'input[type="text"]'
    },
    
    identified: false,
    
    showUser: function() {
      console.log(this.model.toJSON());
      
      this.identified = true;
      
      this.render();
    },
    
    sendInfo: function() {
      MPDisco.network.send('identify', this.ui.name.val());
      
      this.$el.addClass('loading');
    }
  });
  
  return User;
});