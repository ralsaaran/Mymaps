var MapWithMarkers = function() {
    "use strict";
    var self = this;
    //google map object.
    var map;
    //info window for map markers.
    var markerInfoWindow;
    //locations to be marked on map.
    self.mapLocations = ko.observableArray([]);
    //searched text.
    self.searchQuery = ko.observable();
    //whether or not the drawer is visible.
    self.drawerVisible = ko.observable(true);

    var wikiURL;
    //map styles
    //var styles = [];

    this.initialize = function() {

        map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 40.7413549,
                lng: -73.9980244
            },
            zoom: 13,
            // styles: styles,
            mapTypeControl: false
        });

  //    $.getJSON( "./js/styles.json", function( data ) {
  //        styles = data;
        // });

        // Set the map's style to the initial value of the selector.
        // var styleSelector = document.getElementById('style-selector');
        // map.setOptions({
        //     styles: styles[styleSelector.value]
        // });

        // Apply new JSON when the user selects a different style.
        // styleSelector.addEventListener('change', function() {
        //     map.setOptions({
        //         styles: styles[styleSelector.value]
        //     });
        // });

        markerInfoWindow = new MapInfoWindow();
        initializeLocations();
    };

    var initializeLocations = function() {
        self.mapLocations = ko.observableArray([{
            name: 'Rqmnh',
            address: 'Khalid Ibn walid',
            location: {
                lat: 24.772203,
                lng: 46.755352
            },
            isVisible: ko.observable(true)
        }, {
            name: 'Elm',
            address: 'King Fahad street',
            location: {
                lat: 24.712756,
                lng: 46.672456
            },
            isVisible: ko.observable(true)
        }, {
            name: 'Smaat',
            address: 'Khalid Ibn walid',
            location: {
                lat: 24.761936,
                lng: 46.639621
            },
            isVisible: ko.observable(true)
        }, {
            name: 'King saud University',
            address: 'King Abdullah street',
            location: {
                lat: 24.712958,
                lng: 46.622599
            },
            isVisible: ko.observable(true)
        }, {
            name: 'Alfaisaliah mall',
            address: 'King Fahad Rd',
            location: {
                lat: 24.694263,
                lng: 46.685797
            },
            isVisible: ko.observable(true)
        }, {
            name: 'national museum',
            address: 'King Fahad Rd',
            location: {
                lat: 24.648176,
                lng: 46.711265
            },
            isVisible: ko.observable(true)
        }, {
            name: 'Sheraton',
            address: 'King Fahad',
            location: {
                lat: 24.727571,
                lng: 46.665598
            },
            isVisible: ko.observable(true)
        }, {
            name: 'SABIC',
            address: 'King Fahad Rd',
            location: {
                lat: 24.799624,
                lng: 46.720230
            },
            isVisible: ko.observable(true)
        }, {
            name: 'hayat-mall',
            address: 'King Abdullah Rd',
            location: {
                lat: 24.743124,
                lng: 46.680747
            },
            isVisible: ko.observable(true)
        }, {
            name: 'Al Imam Mohd Ibn Saud Islamic University',
            address: 'Othman Bn Afan Rd',
            location: {
                lat: 24.811951,
                lng: 46.693636
            },
            isVisible: ko.observable(true)
        }]);

        var bounds = new google.maps.LatLngBounds();
        var lastIndex = self.mapLocations().length - 1;
        for (var i = 0; i <= lastIndex; i++) {
            var marker = createMarker(self.mapLocations()[i], i);
            self.mapLocations()[i].marker = marker;
            bounds.extend(self.mapLocations()[i].marker.position);

        }
        map.fitBounds(bounds);
        google.maps.event.addDomListener(window, 'resize', function() {
          map.fitBounds(bounds); // `bounds` is a `LatLngBounds` object
        });
    };

    var setFlagImageURL = function(mapLocationObject, location) {
        $.ajax({
            type: 'GET',
            url: 'http://api.geonames.org/countryCode?lat=' + location.lat + '&lng=' + location.lng + '&username=jchaplin',
            async: true
        }).done(function(result) {
            if(result)
                mapLocationObject.imageHTML = "<img src='http://geotree.geonames.org/img/flags18/" + result.trim() + ".png' alt='country flag' />";
        }).fail(function() {
                mapLocationObject.imageHTML = "<span> Unable to load flag image. </span>";
        });
    };

    var wiki = function(locationName){
            var searchTerm = locationName;
            var url = "https://en.wikipedia.org/w/api.php?action=opensearch&search="+ searchTerm +"&format=json&callback=?"; 
            $.ajax({
                url: url,
                type: 'GET',
                contentType: "application/json; charset=utf-8",
                async: false,
                dataType: "json",
              // plop data
                success: function(data, status, jqXHR) {
                    wikiURL = data[3,1];
                }
            })
            .done(function() {
                console.log("success");
            })
            .fail(function() {
                console.log("error");
            });
    };

    //function to create map marker.
    var createMarker = function(mapItem, index) {
        var position = mapItem.location;
        var title = mapItem.name;
        var address = mapItem.address;
        wiki(title);

        var marker = new google.maps.Marker({
            position: position,
            title: title,
            address: address,
            animation: google.maps.Animation.DROP,
            id: index,
            wikilink: wikiURL,
        });

        setFlagImageURL(marker, position);

        //Opens the infowindow.
        marker.addListener('click', function() {
            markerInfoWindow.populateInfoWindow(marker);
        });

        marker.setMap(map);

        return marker;
    };

    // This function will loop through the markers array and display them all.
    this.showPlaces = function() {
        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < self.mapLocations().length; i++) {
            self.mapLocations()[i].marker.setMap(map);
            bounds.extend(self.mapLocations()[i].marker.position);
        }
        map.fitBounds(bounds);
    };

    this.hideRemainingEntries = function(data, event) {
        //data is corresponding data object that was cliked from view
        var lastIndex = self.mapLocations().length - 1;
        for (var i = 0; i <= lastIndex; i++) {
            var item = self.mapLocations()[i];
            item.isVisible(false);
            item.marker.setMap(null);
        }
        data.isVisible(true);
        data.marker.setMap(map);
        markerInfoWindow.populateInfoWindow(data.marker);
    };

    this.toggleDrawerControls = function() {
        self.drawerVisible(!self.drawerVisible());
    };

    this.resetEntries = function() {
        var lastIndex = self.mapLocations().length - 1;
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i <= lastIndex; i++) {
            var item = self.mapLocations()[i];
            item.isVisible(true);
            item.marker.setMap(map);
            bounds.extend(item.marker.position);
        }
        map.fitBounds(bounds);
    };

    // This function will loop through the listings and hide them all.
    this.hidePlaces = function() {
        for (var i = 0; i < self.mapLocations().length; i++) {
            self.mapLocations()[i].marker.setMap(null);
        }
    };

    self.searchQuery.subscribe(function() {
        var places = self.mapLocations;
        var searchQuery = self.searchQuery().toLowerCase();
        var bounds = new google.maps.LatLngBounds();

        ko.utils.arrayForEach(self.mapLocations(), function(element) {
            var eltName = element.name.toLowerCase();

            if (eltName.indexOf(searchQuery) === -1) {
                element.isVisible(false);
                element.marker.setMap(null);
            } else {
                element.isVisible(true);
                element.marker.setMap(map);
                bounds.extend(element.marker.position);
            }
        });

        map.fitBounds(bounds);
    });

    this.initialize();
};


var MapInfoWindow = function() {
    "use strict";
    var infoWin = new google.maps.InfoWindow();
    var streetViewService = new google.maps.StreetViewService();

    this.populateInfoWindow = function(marker) {
        // Check to make sure the infoWin is not already opened on this marker.
        if (infoWin.marker !== marker) {
            // Clear the infoWin content to give the streetview time to load.
            infoWin.setContent('');
            infoWin.marker = marker;
            // Make sure the marker property is cleared if the infoWin is closed.
            infoWin.addListener('closeclick', function() {
                infoWin.marker = null;
            });
        }

        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            window.setTimeout(function(){
                marker.setAnimation(null);
            }, 1400);
        }

        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the infowindow on the correct marker.
        infoWin.open(map, marker);
    };

    var radius = 50;
    // In case the status is OK, which means the pano was found, compute the
    // position of the streetview image, then calculate the heading, then get a
    // panorama from that and set the options
    var getStreetView = function(data, status) {
        if (status === google.maps.StreetViewStatus.OK) {
            var nearStreetViewLocation = data.location.latLng;
            var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, infoWin.marker.position);

            var flagImageHTML = infoWin.marker.imageHTML;
            infoWin.setContent( flagImageHTML + '<strong>' + infoWin.marker.title + '</strong><div>' + infoWin.marker.address + '</div><div>'+ infoWin.marker.wikilink +'</div><div id="pano" class="streetViewContainer"></div>');

            var panoramaOptions = {
                position: nearStreetViewLocation,
                pov: {
                    heading: heading,
                    pitch: 30
                }
            };
            var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
        } else {
            infoWin.setContent('<strong>' + infoWin.marker.title + '</strong><div>' + infoWin.marker.address + '</div><div>'+infoWin.marker.wikilink+'</div>');
        }
    };
};

function initMap() {
    var mapWithMarkers = new MapWithMarkers();
    ko.applyBindings(mapWithMarkers);
}

function loadError() {
    alert("Unable to load libraries. Exiting application.");
}