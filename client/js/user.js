define(['mpdisco', 'jquery.cookie'], function(MPDisco) {
  var User = MPDisco.module('User', function(User, MPDisco, Backbone, Marionette, $, _) {
    User.Model = MPDisco.Model.extend({
      defaults : {
        displayName : 'User',
        thumbnailUrl : 'http://www.gravatar.com/avatar/00000000000000000000000000000000'
      },

      socketEvents : {
        master : 'set'
      },

      initialize : function() {
        this.listenTo(MPDisco.vent, 'networkready', function(data) {
          if (data.master) {
            this.set(data.master);
          }
        });
      },

      idAttribute : 'userid'
    });

    User.Collection = MPDisco.Collection.extend({
      model : User.Model,

      comparator : function(user) {
        var name = user.get('name');
        return (name && name.giveName) || user.get('displayName');
      },

      socketEvents : {
        identify : 'add',
        clientconnected : 'add',
        clientdisconnected : 'removeById'
      },

      initialize : function() {
        this.listenTo(MPDisco.vent, 'networkready', function(data) {
          if (data.clients) {
            this.reset(data.clients);
          }
        });
      },

      removeById : function(info) {
        this.remove(this.findWhere({
          userid : info.userid
        }));
      }
    });

    User.UserView = Marionette.ItemView.extend({
      className : 'user',

      getTemplate : function() {
        if (this.isIdentified) {
          return 'user';
        }

        return 'user_identify';
      },

      socketEvents : {
        identify : 'identified',
      },

      modelEvents : {
        change : 'showUser'
      },

      model : new User.Model(),

      events : {
        'keyup input[type="text"]' : 'enterInfo'
      },

      ui : {
        name : 'input[type="text"]'
      },

      isIdentified : false,

      render : function() {
        this.isClosed = false;

        this.triggerMethod("before:render", this);
        this.triggerMethod("item:before:render", this);

        var data = this.serializeData();
        data = this.mixinTemplateHelpers(data);

        var template = this.getTemplate();
        var html = Marionette.Renderer.render(template, data);

        this.$el.on('transitionend webkitTransitionEnd oTransitionEnd', function clearContent() {
          var that = $(this);

          if (that.find('.content').length > 1) {
            that.removeClass('switching').find('.content').first().remove();
          }

          that.off('transitionend webkitTransitionEnd oTransitionEnd', clearContent);
        });

        if (this.$el.find('.content').length) {
          this.$el.append(html);

          // TODO: Adding the class immediately after the content is appended prevents the transition from affecting the new content.
          var timeout = setTimeout( function() {

            this.$el.addClass('switching');

            clearTimeout(timeout);

          }.bind(this), 100);
        } else {
          this.$el.html(html);
        }

        this.bindUIElements();

        this.triggerMethod("render", this);
        this.triggerMethod("item:rendered", this);

        return this;
      },

      onShow : function() {
        if ($.cookie('mpdisco.name') && !this.isIdentified) {
          this.sendInfo();
        }
      },

      identified : function() {
        this.isIdentified = true;

        this.showUser();
      },

      showUser : function() {
        if (this.isIdentified) {
          this.render();

          this.$el.removeClass('loading');
        }
      },

      enterInfo : function(e) {
        if (e.which == 0x0d) {
          this.sendInfo();
        }
      },

      sendInfo : function() {
        var name = $.cookie('mpdisco.name') || this.ui.name.val();

        this.$el.addClass('loading');

        $.cookie('mpdisco.name', name, {
          expires : 7
        });

        MPDisco.network.send('identify', name);
      }
    });

    User.ListenerView = Marionette.ItemView.extend({
      tagName : 'li',

      className : 'listener',

      template : 'listener',

      onRender : function() {
        this.$el.attr('data-id', this.model.get('userid'));
      }
    });

    User.ListenersView = Marionette.CompositeView.extend({
      className : 'listeners',

      template : 'listeners',

      collectionEvents : {
        reset : 'render',
      },

      collection : new User.Collection(),

      childView : User.ListenerView,
      childViewContainer : '.list',

      appendHtml : function(collectionView, itemView, index) {
        var childrenContainer = collectionView.childViewContainer ? collectionView.$(collectionView.childViewContainer) : collectionView.$el;
        var children = childrenContainer.children();

        if (children.size() - 1 <= index) {
          childrenContainer.append(itemView.el);
        } else {
          childrenContainer.children().eq(index).before(itemView.el);
        }
      }
    });

  });

  return User;
});
