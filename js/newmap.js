var map;
var locations = [
        {title: 'Lingaraj Temple', location: {lat: 20.2382383, lng: 85.8315622}},
        {title: 'Odisha State Museum', location: {lat: 20.2562, lng: 85.8415}},
        {title: 'Dhauli', location: {lat: 20.1923517, lng: 85.8372062}},
        {title: 'Nandankanan Zoological Park', location: {lat: 20.395775, lng: 85.8237923}},
        {title: 'Udayagiri Caves', location: {lat: 20.2631, lng: 85.7857}},
        {title: 'Kalinga Stadium', location: {lat: 20.2879847, lng: 85.8215891}}
      ];
var center =[{lat : 20.2961, lng : 85.8245}]

var markers = []; // Creating a new blank array for all the listing markers.

var styles = [
  {
    featureType: 'water',
    stylers: [
      { color: '#19a0d8' }
    ]
  },{
    featureType: 'administrative',
    elementType: 'labels.text.stroke',
    stylers: [
      { color: '#ffffff' },
      { weight: 6 }
    ]
  },{
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [
      { color: '#e85113' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      { color: '#efe9e4' },
      { lightness: -40 }
    ]
  },{
    featureType: 'transit.station',
    stylers: [
      { weight: 9 },
      { hue: '#e85113' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'labels.icon',
    stylers: [
      { visibility: 'off' }
    ]
  },{
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [
      { lightness: 100 }
    ]
  },{
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      { lightness: -100 }
    ]
  },{
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [
      { visibility: 'on' },
      { color: '#f0e4d3' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [
      { color: '#efe9e4' },
      { lightness: -25 }
    ]
  }
];

function initMap() {
  // Constructor creates a new map
  map = new google.maps.Map(document.getElementById('map'), {
    center: center[0],
    zoom: 13,
    styles: styles,
    mapTypeControl: false
  });

  var largeInfowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();
  var defaultIcon = makeMarkerIcon('0091ff'); // this is the default marker icon.
  var highlightedIcon = makeMarkerIcon('FFFF24'); // this is the state of the marker when highlighted.

  for (var i = 0; i < locations.length; i++) {
    var position = locations[i].location; // Get the position from the location array.
    var title = locations[i].title;

    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i,
    });
    locations[i].marker = marker; // we made marker a property of the locations and stored info of each marker
    wikiLink(locations[i]);

    markers.push(marker); // Push the marker to our array of markers.
    // Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });
    bounds.extend(markers[i].position);
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });

    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  }
  // Extend the boundaries of the map for each marker
  map.fitBounds(bounds);

  function wikiLink(location) {
    location.url = '';
    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + title + '&format=json&callback=wikiCallback';

    //If you cant get a wiki request, throw an error message.
    var wikiError = setTimeout(function() {
      location.url = 'Unable to find the request';
    }, 8000);

    $.ajax({
      url: wikiUrl,
      dataType: "jsonp",
      jsonp: "callback",
      success: function(response) {
        console.log(response);
        var url = response[3][0];
        console.log(url);
        location.marker.wikiurl = url;
        console.log(location.url);
        clearTimeout(wikiError);
      }
    });
  };
}


// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.setContent(''); // Clearing the infowindow content to give the streetview time to load.
    infowindow.marker = marker;
    // Making sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });

    var streetViewService = new google.maps.StreetViewService();
    var radius = 500;

    // In case the status is OK, which means the pano was found, computing the position of the streetview image, then calculate the heading, then get a
    // panorama from that and set the options
    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        var nearStreetViewLocation = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(
          nearStreetViewLocation, marker.position);
          infowindow.setContent('<div>' + marker.title + '</div><hr><div id="pano"></div><div><a href=' + marker.wikiurl + '> Click here for more info </a></div>');
          var panoramaOptions = {
            position: nearStreetViewLocation,
            pov: {
              heading: heading,
              pitch: 30
            }
          };
          var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), panoramaOptions);
          } else {
            infowindow.setContent('<div>' + marker.title + '</div><hr>' + '<div>No Street View Found</div>');
          }
        }
        // Use streetview service to get the closest streetview image within 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        infowindow.open(map, marker); // Open the infowindow on the correct marker.
      }
  }


  // This function takes in a COLOR, and then creates a new marker icon of that color.
  // The icon will be 21 px wide by 34 high, have an origin of 0, 0 and be anchored at 10, 34).
  function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
      }

function viewModel(markers) {
  var self = this;
  self.filter = ko.observable(''); // this is for the search box, takes value in it and searches for it in the array
  self.items = ko.observableArray(locations); // we have made the array of locations into a ko.observableArray
  // attributed to - http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html , searching the array
  self.filteredItems = ko.computed(function() {
    var filter = self.filter().toLowerCase();
    if (!filter) {
      return self.items();
    } else {
      return ko.utils.arrayFilter(self.items(), function(id) {
        return stringStartsWith(id.title.toLowerCase(), filter);
      });
    }

  });

  var stringStartsWith = function (string, startsWith) {
       string = string || "";
       if (startsWith.length > string.length)
           return false;
       return string.substring(0, startsWith.length) === startsWith;
   };

  // this should show the infowindow if any place on the list is clicked
  this.showInfoWindow = function(place) {
       google.maps.event.trigger(place.marker, 'click');
  };

}

ko.applyBindings(new viewModel());
