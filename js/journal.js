// create namespace for our app
window.app = {
  model: {},
  View: {},
  collect: {}
};

//Models
app.model.journal = Backbone.Model.extend({
  defaults: {
    answer: '',
    day: ''
  }
});

//Collections
app.collect.Journals = Backbone.Collection.extend({
  model: app.model.journal,
  localStorage: new Store("quickjournal")
});

// instance of the Collection
app.collect.journals = new app.collect.Journals();

//Views
app.View.Journals = Backbone.View.extend({
  attributes: {
    id: 'journals'
  },
  template: Handlebars.compile($('#journals-template').html()),
  initialize: function() {
    this.render();
    //this.listenTo(this.model, 'change:dayEnd', this.changeDay);
    this.listenTo(app.collect.journals, 'add', this.addToday);
    this.listenTo(app.collect.journals, 'remove', this.delToday);
  },
  render: function() {
    var that = this;
    var order = (this.options.order || 'append') + 'To';
    this.$el[order]('#' + this.options.region).html(this.template()).fadeTo(500, 1);

    if (this.collection.length > 0) {
      app.View.todayJournal = new app.View.Journal({
        model: this.collection.at(0)
      });
      that.$el.find('ol').append(app.View.todayJournal.render().$el.fadeTo(500, 1));
    } else {
      app.View.journalPrompt = new app.View.JournalPrompt;
      this.$el.prepend(app.View.journalPrompt.render().$el.fadeTo(500, 1));
    }

    return this;
  },
  addToday: function(model) {
    app.View.todayJournal = new app.View.Journal({
      model: model
    });
    this.$el.find('ol').append(app.View.todayJournal.render().$el.fadeTo(500, 1));
  },
  delToday: function() {
    this.render();
  },
  changeDay: function() {
    var that = this;
    // JO: This will eventually handle setting today's focus to yesterday's and re-rendering. For now it's just clearing today's focus.
    if (this.collection.at(0)) {
      app.View.todayJournal.$el.fadeTo(500, 0, function() {
        that.collection.at(0).destroy();
        app.View.todayJournal.remove();
      });
    }
  },
});

app.View.JournalPrompt = Backbone.View.extend({
  attributes: {
    class: 'prompt'
  },
  template: Handlebars.compile($('#journal-prompt-template').html()),
  events: {
    "keypress input": "SaveOnEnter"
  },
  initialize: function() {
    this.render();
  },
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  SaveOnEnter: function(e) {
    if (e.keyCode == 13) this.save();
  },
  save: function() {
    var input = this.$el.find('input')[0];
    var val = input.value;
    var that = this;
    this.$el.fadeTo(500, 0, function() {
      that.remove();
      app.collect.journals.create({
        answer: val,
        day: 'today'
      });
    });

  },
});

app.View.Journal = Backbone.View.extend({
  attributes: {
    class: 'journal'
  },
  tagName: 'li',
  //attributes: { class: 'focus' },
  template: Handlebars.compile($('#journal-template').html()),
  events: {
    "click .delete": "destroy"
  },
  initialize: function() {
    this.render();
  },
  render: function() {
    var variables = {
      journal: this.model.get('answer'),
      day: this.model.get('day')
    };
    this.$el.html(this.template(variables));
    return this;
  },
  destroy: function() {
    var that = this;

    this.$el.fadeTo(500, 0, function() {
      that.model.destroy();
      that.remove();
    });
  }
});

app.View.AppView = Backbone.View.extend({
  initialize: function() {
    //app.collect.journals.fetch();
    this.render();
  },
  render: function() {
    app.collect.journals = new app.collect.Journals();
    app.collect.journals.fetch({
      success: function(response, xhr) {
        app.View.journal = new app.View.Journals({
          collection: app.collect.journals,
          model: app.model.journal,
          region: 'center',
          order: 'append'
        });
      },
      error: function(errorResponse) {
        console.log(errorResponse)
      }
    });
  }
});

// Initializers
app.appView = new app.View.AppView();
