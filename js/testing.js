window.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded");

  if (-180 < -170) {
    console.log("yes");
  }

  const button = document.querySelector("#menu-button");
  const menu = document.querySelector("#menu");

  button.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });

  var script = document.createElement("script");
  script.src =
    "https://maps.googleapis.com/maps/api/js?key=AIzaSyAqWH0IS8beHBRWjpwU1OP0h00gtgd7Wvc&libraries=geometry&callback=initMap";
  script.async = true;

  // mapId: "b1beacae401d047c",
  window.initMap = async function () {
    const map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 40.7749, lng: -74.4194 },
      zoom: 10,
    });
    // Define two markers
    var marker1 = new google.maps.Marker({
      position: { lat: 40.7749, lng: -74.4194 },
      map: map,
    });
    var marker2 = new google.maps.Marker({
      position: { lat: 40.7128, lng: -74.006 },
      map: map,
    });

    // Define the number of segments to use in the polyline
    var numSegments = 1000;

    // Calculate the distance and bearing between the markers
    var latLng1 = marker1.getPosition();
    var latLng2 = marker2.getPosition();
    var distance = google.maps.geometry.spherical.computeDistanceBetween(
      latLng1,
      latLng2
    );
    var heading = google.maps.geometry.spherical.computeHeading(
      latLng1,
      latLng2
    );

    // Create an array of LatLngs along the arc of a great circle between the markers
    var arcPoints = [];
    for (var i = 0; i <= numSegments; i++) {
      var fraction = i / numSegments;
      var arcLatLng = google.maps.geometry.spherical.interpolate(
        latLng1,
        latLng2,
        fraction
      );
      arcPoints.push(arcLatLng);
    }

    // Create the curved polyline
    var curvedPolyline = new google.maps.Polyline({
      path: arcPoints,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });

    // Add the curved polyline to the map
    curvedPolyline.setMap(map);

    // // Define two markers
    // var marker1 = new google.maps.Marker({
    //   position: { lat: 40.7749, lng: -74.4194 },
    //   map: map,
    // });
    // var marker2 = new google.maps.Marker({
    //   position: { lat: 40.7128, lng: -74.006 },
    //   map: map,
    // });

    // // Define the number of segments to use in the polyline
    // var numSegments = 100;

    // // Calculate the distance and bearing between the markers
    // var latLng1 = marker1.getPosition();
    // var latLng2 = marker2.getPosition();
    // var distance = google.maps.geometry.spherical.computeDistanceBetween(
    //   latLng1,
    //   latLng2
    // );
    // var heading = google.maps.geometry.spherical.computeHeading(
    //   latLng1,
    //   latLng2
    // );

    // // Create an array of LatLngs along the arc of a great circle between the markers
    // var arcPoints = [];
    // for (var i = 0; i <= numSegments; i++) {
    //   var fraction = i / numSegments;
    //   var arcLatLng = google.maps.geometry.spherical.computeOffset(
    //     latLng1,
    //     distance * fraction,
    //     heading
    //   );
    //   arcPoints.push(arcLatLng);
    // }

    // // Create the curved polyline
    // var curvedPolyline = new google.maps.Polyline({
    //   path: arcPoints,
    //   strokeColor: "#FF0000",
    //   strokeOpacity: 1.0,
    //   strokeWeight: 2,
    // });

    // // Add the curved polyline to the map
    // curvedPolyline.setMap(map);
  };
  document.head.appendChild(script);
});
