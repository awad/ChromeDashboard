//Other JS
function sendToOneNote(access_token, title, text) {

}

function sendToOneNote(title, text){
	chrome.storage.local.get("access_token", function(result) {
    $.ajax({
 		accept: "application/json",
 		type: "POST",
 		url: "https://www.onenote.com/api/v1.0/pages",
 		headers: { "Authorization": "Bearer " + access_token },
 		data: "<html><head><title>"+ title +"</title></head>" +
 			"<body><p>" + text + "</p>" +
 			"</body></html>",
 		contentType: "text/html",
 		success: function (data, status, xhr) {
 			alert(status);

 		},
 		complete: function (data, status, xhr) {
 			alert(status);
 		},
 		 error: function (request, status, error) {
 			alert(status);
 		}
 	 });

	});
	return false;		// Don't forget to return false, otherwise the AJAX request will be cancelled.
}

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
    // this.listenTo(app.collect.journals, 'remove', this.delToday);
    this.listenTo(app.collect.journals, 'reset', this.delAll);
  },
  render: function() {
    var that = this;
    var order = (this.options.order || 'append') + 'To';
    this.$el[order]('#' + this.options.region).html(this.template()).fadeTo(500, 1);

     app.View.journalPrompt = new app.View.JournalPrompt;
     this.$el.prepend(app.View.journalPrompt.render().$el.fadeTo(500, 1));

    //if (this.collection.length > 0) {
    //   app.View.todayJournal = new app.View.Journal({
    //     model: this.collection.at(0)
    //   });
    //   that.$el.find('ol').append(app.View.todayJournal.render().$el.fadeTo(500, 1));
    // } else {
    //   app.View.journalPrompt = new app.View.JournalPrompt;
    //   this.$el.prepend(app.View.journalPrompt.render().$el.fadeTo(500, 1));
    // }

    return this;
  },
  addToday: function(collection) {
    // var len = 0;
    // while (len < this.collection.length) {
    //   app.View.todayJournal = new app.View.Journal({
    //     model: this.collection.at(0)
    //   });
    //   that.$el.find('ol').append(app.View.todayJournal.render().$el.fadeTo(500, 1));
    //   len++;
    // }
       app.View.todayJournal = new app.View.JournalEntry({
         collection: this.collection
       });

       this.$el.find('ol').append(app.View.todayJournal.render().$el.fadeTo(500, 1));
     },
  delToday: function() {
    this.render();
  },
  delAll: function(){
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
    "keypress input": "SaveOnEnter",
		"keypress textarea": "SaveOnEnter"
  },
  initialize: function() {
    this.render();
  },
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  SaveOnEnter: function(e) {
    if (e.keyCode == 13)
			{
				this.save();
				this.sendToOnenote();
			}
  },
  sendToOnenote: function() {
		var title ='abc';
		var text = 'help';
		chrome.storage.local.get("access_token", function(result) {
			$.ajax({
			accept: "application/json",
			type: "POST",
			url: "https://www.onenote.com/api/v1.0/pages",
			headers: { "Authorization": "Bearer " + access_token },
			data: "<html><head><title>"+ title +"</title></head>" +
				"<body><p>" + text + "</p>" +
				"</body></html>",
			contentType: "text/html",
			success: function (data, status, xhr) {
				alert(status);
			},
			complete: function (data, status, xhr) {
				alert(status);
			},
				error: function (request, status, error) {
				alert(status);
			}
			});
		});
		return false;		// Don't forget to return false, otherwise the AJAX request will be cancelled.
	},
  save: function() {
    //var input = this.$el.find('input')[0];
		var input = this.$el.find('textarea')[0];
    var val = input.value;
    var that = this;
    this.$el.fadeTo(500, 0, function() {
      that.remove();
      app.collect.journals.create({
        answer: val,
        day: 'today'
      });
    });
  }
});

app.View.JournalEntry = Backbone.View.extend({
  attributes: {
    class: 'journal'
  },
  tagName: 'li',
  template: Handlebars.compile($('#journal-entry-template').html()),
  events: {
    "click .delete": "destroy"
  },
  initialize: function() {
    this.render();
  },
  render: function() {
    var len = 0;
    var str = '';
    while (len < this.collection.length ) {
      str += this.collection.at(len).get('answer') + '.' + "<br/>";
      len++;
    }
    var variables = {
      day: this.collection.at(0).get('day'),
      answer: str
    };
    this.$el.html(this.template(variables));
    return this;
  },
  destroy: function() {
    var that = this;
    this.$el.fadeTo(500, 0, function() {
      var len = that.collection.length;
      while (len-- > 0 ) {
           that.collection.at(len).destroy();
       }
      that.collection.reset();
      that.collection.sync();
      that.remove();
    });
  }
});

app.View.Journal = Backbone.View.extend({
  attributes: {
    class: 'journal'
  },
  tagName: 'li',
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
