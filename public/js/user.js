define(['mpdisco', 'jquery.cookie'], function(MPDisco) {  
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
    className: 'user',
    
    getTemplate: function() {
      if (this.identified) {
        return '#user_template';
      }
      
      return '#user_identify_template';
    },
    
    modelEvents: {
      'change': 'showUser',
    },
    
    model: new User.Model,
    
    events: {
      'click button': 'sendInfo'
    },
    
    ui: {
      name: 'input[type="text"]'
    },
    
    identified: false,
    
    onShow: function() {
      if ($.cookie('mpdisco.name') && !this.identified) {
        this.sendInfo();
      }
    },
    
    showUser: function(model) {
      if (_.any(['name', 'thumbnailUrl', 'displayName'], function(k) { return model.changedAttributes().hasOwnProperty(k); })) {
        this.identified = true;
      
        this.render();
        
        this.$el.removeClass('loading');
      }
    },
    
    sendInfo: function() {
      var name = $.cookie('mpdisco.name') || this.ui.name.val();
      
      this.$el.addClass('loading');
      
      $.cookie('mpdisco.name', name, { expires: 7 });
      
      MPDisco.network.send('identify', name);
    }
  });
  
  return User;
});