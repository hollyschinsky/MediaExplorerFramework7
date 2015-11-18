Template7.registerHelper('stringify', function (context){
    var str = JSON.stringify(context);
    // Need to replace any single quotes in the data with the HTML char to avoid string being cut short
    return str.split("'").join('&#39;');
});

// Initialize your app
var myApp = new Framework7({
    precompileTemplates: true,
    template7Pages: true, // need to set this
    modalTitle: "iTunes Media Explorer"
})

// Export selectors engine (jQuery ish )
var $$ = Dom7;

// Add views - this app uses only a main view stack
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true
});

$$('input#sliderVal').val('25');

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
});

/* Media List Page Handling */
myApp.onPageInit('list', function (page) {
    $$(page.container).find('.share').on('click', function (e) {
        e.stopPropagation();
        var item = page.context[this.dataset.item]; //this.dataset.item returns data held in data-item attribute set in template

        if (window.plugins && window.plugins.socialsharing) {
            var name = item.trackName==null?item.collectionName: item.trackName;
            window.plugins.socialsharing.share("Hey! Check out this " + item.kind + " I like " + name + ".",
                'Check this out', item.artworkUrl60, item.previewUrl,
                function () {
                    console.log("Share Success")
                },
                function (error) {
                    console.log("Share fail " + error)
                });
        }
        else console.log("Share plugin not found");
    });

    $$('.preview').on('click', function (e) {
        e.stopPropagation();
        var item = page.context[this.dataset.item]; //this.dataset.item returns data held in data-item attribute set in template

        var name = item.trackName==null?item.collectionName: item.trackName;
        myApp.alert("Previewing " + name);
        var media = new Media(item.previewUrl, function () {console.log("Media Success");},function (error) {console.log("Media fail " + error)},null);
        media.play();
        setTimeout(function() {
            media.stop()},7000)
    });

    $$('.favorite').on('click', function (e) {
        e.stopPropagation();
        var item = page.context[this.dataset.item]; //this.dataset.item returns data held in data-item attribute set in template

        var name = item.trackName==null?item.collectionName: item.trackName;
        myApp.alert(name + ' added to favorites!');
    });

});

/* Media Item Page Handling */
myApp.onPageInit('media', function (page) {
    var item = page.context;

    if (item.trackPrice==undefined)
        item.trackPrice = item.collectionPrice;


    if (item.kind=='song') {
        $$("#previewVideo").addClass('hide');
        $$("#desc").addClass('hide');
        $$("#previewAudio").addClass('show');
    }
    else if (item.kind=='music-video'){
        $$("#previewVideo").addClass('show');
        $$("#previewAudio").addClass('hide');
        $$("#desc").addClass('hide');
    }
    else {
        item.kind ='audio book';
        $$("#desc").addClass('show');
        $$("#previewAudio").addClass('show');
        $$("#previewVideo").addClass('hide');
    }
    $$(page.container).find('.share').on('click', function (e) {
        if (window.plugins && window.plugins.socialsharing) {
            var name = item.trackName==null?item.collectionName: item.trackName;
            window.plugins.socialsharing.share("Hey! Check out this " + item.kind + " I like " + name + ".",
                'Check this out', item.artworkUrl60, item.previewUrl,
                function () {
                    console.log("Success")
                },
                function (error) {
                    console.log("Share fail " + error)
                });
        }
        else console.log("Share plugin not found");
    });
    $$('#like').on('click', function (e) {
        var name = item.trackName==null?item.collectionName: item.trackName;
        myApp.alert("I like " + name);
    })
});

/*
    Range Slider Handling
    - This function displays the value next to the slider as it slides for better visual indicator
*/
$$(document).on('input change', 'input[type="range"]', function (e) {
    $$('input#sliderVal').val(this.value);
})
$$('.page[data-page="index"] .color-green').on('click', function (e) {
    console.log("CLICKED!!!")
})

/*
    Search Submit Button
    - This function calls the iTunes Search API with the designated search options then makes an ajax call to load the list
      page when a response is received.
*/
$$(document).on('click', '#btnSearch', function (e) {
    var term = $$("#term").val();
    if (term.length==0) {
        myApp.alert("Please enter a search term.");
    }
    else {
        var explicit = $$("#explicit:checked").val() =='on' ? 'yes' : 'no';
        var mediaType = $$("input[name='ks-radio']:checked").val()
        var numResults = $$("#numResults").val()
        var url = "https://itunes.apple.com/search?entity=" + mediaType + "&term=" + term + "&explicit=" + explicit + "&limit=" + numResults + "&callback=?";
        $$.ajax({
            dataType: 'json',
            url: url,
            success: function (resp) {
                mainView.router.load({
                    template: Template7.templates.listTemplate,
                    context: resp.results
                });
            },
            error: function (xhr) {
                console.log("Error on ajax call " + xhr);
            }
        });
    }
})

/* Menu Handlers */
$$(document).on('click', '#favorites', function (e) {
    myApp.alert('Show my favorites');
});

$$(document).on('click', '#about', function (e) {
    myApp.alert('Show About');
});

$$(document).on('click', '#settings', function (e) {
    myApp.alert('Show Settings');
});

$$(document).on('click', '#home', function (e) {
    mainView.router.load({url: 'index.html'}); // need to fix, causes issues on mobile only when try to re-search again
    myApp.closePanel();

});
