// Initialize your app
var myApp = new Framework7({
    precompileTemplates: true


})
// Export selectors engine (jQuery ish )
var $$ = Dom7;
console.log("Main View " + mainView);

// Add views - this app uses only a main view stack
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true
});

var mediaResults = {};
$$('input#sliderVal').val('25');

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
    // Override default HTML alert with native dialog
    if (navigator.notification) {
        window.alert = function (message) {
            navigator.notification.alert(
                message,                // message
                null,                   // callback
                "iTunes Media Explorer", // title
                'OK'                    // buttonName
            );
        };
    } else console.log("Using default alerts, dialogs plugin (notification class) was not found.");

});


/*
    Media List Page Handling
 */
myApp.onPageInit('list', function (page) {
    // Load the template with the media data and append it to the HTML (list.html)
    $$('.page[data-page="list"] .page-content .list-block').html(Template7.templates.listTemplate(mediaResults));
    $$('.share').on('click', function (e) {
        idx = e.target.dataset.item;
        var item = mediaResults[idx];

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
        idx = e.target.dataset.item;
        var item = mediaResults[idx];
        var name = item.trackName==null?item.collectionName: item.trackName;
        alert("Previewing " + name);
        var media = new Media(item.previewUrl,  function () {console.log("Media Success");},function (error) {console.log("Media fail " + error)},null);
        media.play();
        setTimeout(function() {
            media.stop()},7000)
    });
    $$('.favorite').on('click', function (e) {
        idx = e.target.dataset.item;
        var item = mediaResults[idx];
        var name = item.trackName==null?item.collectionName: item.trackName;
        alert(name + ' added to favorites!');
    });

});

/*
    Media Item Page Handling
 */
myApp.onPageInit('media', function (page) {
    var itemIdx = page.query.itemNum;
    var item = mediaResults[itemIdx];

    if (item.trackPrice==undefined)
        item.trackPrice = item.collectionPrice;

    // Load the template with the item clicked and append it to the HTML (item.html)
    $$('.page[data-page="media"] .page-content .list-block').html( Template7.templates.itemTemplate(item));


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
    $$('.share').on('click', function (e) {
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
        console.log("Liking " + name);
        alert("I like " + name);
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
        alert("Please enter a search term.");
    }
    else {
        mediaResults = {};
        var explicit = $$("#explicit:checked").val() =='on' ? 'yes' : 'no';
        var mediaType = $$("input[name='ks-radio']:checked").val()
        var numResults = $$("#numResults").val()
        var url = "https://itunes.apple.com/search?entity=" + mediaType + "&term=" + term + "&explicit=" + explicit + "&limit=" + numResults + "&callback=?";
        console.log("URL " + url);
        $$.ajax({
            dataType: 'json',
            url: url,
            success: function (resp) {
                mediaResults = resp.results;
                mainView.router.load({url: 'list.html'});
            },
            error: function (xhr) {
                console.log("ERROR " + xhr);
            }
        });
    }
})

/*
    Menu Handlers
*/

$$(document).on('click', '#favorites', function (e) {
    alert('Show my favorites');
});

$$(document).on('click', '#about', function (e) {
    alert('Show About');
});

$$(document).on('click', '#settings', function (e) {
    alert('Show Settings');
});
$$(document).on('click', '#home', function (e) {
    // The above will auto close panel but not if we use the loader above - have to specify close
    myApp.closePanel();
    mainView.router.load({pageName: 'index'});
});
