var map;

var loadScript = function (){
  var myAPIKey = "AIzaSyDGLPKGCl-Tcpxbg95ExpfSI8saQxPWZqI"
  var JSLink = "https://maps.googleapis.com/maps/api/js?key=" +
      myAPIKey + "&callback=initMap";

  var JSElement = document.createElement('script');
  JSElement.type = "text/javascript"
  JSElement.src = JSLink;
  JSElement.async;
  JSElement.defer;
  document.getElementsByTagName('head')[0].appendChild(JSElement);
}

loadScript();
