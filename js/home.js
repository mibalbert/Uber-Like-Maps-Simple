import { mapOptions } from "./mapOptions.js";
import { drawDashedCurve } from "./bezierCurve.js";

window.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded");

  // Google Maps API script
  const script = document.createElement("script");
  script.src = mapOptions.src;
  script.async = true;

  window.initMap = async function () {
    // Initialize map
    const map = new google.maps.Map(
      document.getElementById("map"),
      mapOptions.mapSettings
    );

    // map.setOptions({ zoomControl: mapOptions.setZoomControl });

    //Set the intial tilt of the map
    mapOptions.setTilt ? map.setTilt(mapOptions.tiltValue) : null;

    // Create the places-autocompleate, markers, curved-polyline
    new AutocompleteDirectionsHandler(map);
  };

  document.head.appendChild(script);
});

class AutocompleteDirectionsHandler {
  constructor(map) {
    this.map = map;
    this.originPlaceId = "";
    this.destinationPlaceId = "";
    this.initializeServicesAndMarkers(this.map);
    this.initializeAutocompleteInputs();
    this.geocoder = new google.maps.Geocoder();
  }

  initializeServicesAndMarkers(map) {
    let polylineWidth = 1.5;
    let shadowWidth = 0.1;
    let orgMarkerSrc = "../assets/up-arrow-20px.svg";
    let dstMarkerSrc = "../assets/down-arrow-20px.svg";
    // let anchorVals = [30, 30];

    if (window.innerWidth > 600) {
      polylineWidth = 5.5;
      shadowWidth = 0.23;
      orgMarkerSrc = "../assets/up-arrow-30px.svg";
      dstMarkerSrc = "../assets/down-arrow-30px.svg";
    }

    const orgMarkerConf = {
      // url: "../assets/archive.png",
      url: orgMarkerSrc,
      // size: new google.maps.Size(24, 24),
      // The origin for this image is (0, 0).
      // origin: new google.maps.Point(0, 0),
      // The anchor for this image is the base of the flagpole at (12, 26). Gives the marker a little offset
      // anchor: new google.maps.Point(anchorVals[0], anchorVals[1]),
    };

    const dstMarkerConf = {
      url: dstMarkerSrc,
    };

    this.orgMarker = new google.maps.Marker({
      map,
      animation: google.maps.Animation.DROP,
      // icon: "../assets/archive.png",
      icon: orgMarkerConf,
    });

    this.dstMarker = new google.maps.Marker({
      map,
      animation: google.maps.Animation.DROP,
      icon: dstMarkerConf,
    });

    this.shadowLine = this.createPolyline("#000000", shadowWidth, 6);
    // this.curvedLine = this.createPolyline("#FF0000", 1, 3.5, true);
    this.curvedLine = this.createPolyline("#38a169", 1, polylineWidth, true);

    const orgInfoContentString = `Some Text`;
    const dstInfoContentString = `Some other text`;

    this.orgInfowindow = new google.maps.InfoWindow({
      content: orgInfoContentString,
      shouldFocus: false,
    });
    this.dstInfowindow = new google.maps.InfoWindow({
      content: dstInfoContentString,
      shouldFocus: false,
    });

    this.orgMarker.addListener("click", () => {
      this.orgInfowindow.open({
        anchor: this.orgMarker,
        map,
      });
    });

    this.dstMarker.addListener("click", () => {
      this.dstInfowindow.open({
        anchor: this.dstMarker,
        map,
      });
    });

    map.addListener("click", () => {
      this.orgInfowindow.close();
      this.dstInfowindow.close();
    });
  }

  createPolyline(strokeColor, strokeOpacity, scale, geodesic = false) {
    return new google.maps.Polyline({
      map: this.map,
      geodesic,
      strokeColor,
      strokeOpacity,
      scale,
    });
  }

  initializeAutocompleteInputs() {
    const originInput = document.getElementById("input-origin-home");
    const destinationInput = document.getElementById("input-destination-home");

    const originAutocomplete = this.createAutocomplete(originInput);
    const destinationAutocomplete = this.createAutocomplete(destinationInput);

    this.setupPlaceChangedListener(originAutocomplete, "ORIG");
    this.setupPlaceChangedListener(destinationAutocomplete, "DEST");
  }

  createAutocomplete(inputElement) {
    return new google.maps.places.Autocomplete(inputElement, {
      strictBounds: true,
      componentRestrictions: { country: "uk" },
      fields: ["place_id", "geometry"],
    });
  }

  setupPlaceChangedListener(autocomplete, mode) {
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      this.shadowLine.getPath().pop();
      this.shadowLine.getPath().pop();

      if (!place.place_id) {
        window.alert("Please enter a real address.");
        return;
      }
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      if (mode === "ORIG") {
        this.setOrigin(place, lat, lng);
      } else {
        this.setDestination(place, lat, lng);
      }

      this.route();
    });
  }

  setOrigin(place, lat, lng) {
    this.map.setZoom(6.35);
    this.originPlaceId = place.place_id;
    const location = place.geometry.location;
    this.orgMarker.setPlace({ placeId: place.place_id, location });
    this.orgMarker.setVisible(true);

    // console.log(place.geometry);

    // this.orgInfowindow.setOptions({
    //   content: "oooooooooooo",
    // });
    this.map.setCenter(location, { left: 100 });
  }

  setDestination(place, lat, lng) {
    this.destinationPlaceId = place.place_id;
    const location = place.geometry.location;
    this.dstMarker.setPlace({ placeId: place.place_id, location });
    this.dstMarker.setVisible(true);
  }

  route() {
    if (!this.originPlaceId || !this.destinationPlaceId) {
      return;
    }
    const markerList = [
      {
        lat: this.orgMarker.getPlace().location.lat(),
        lng: this.orgMarker.getPlace().location.lng(),
      },
      {
        lat: this.dstMarker.getPlace().location.lat(),
        lng: this.dstMarker.getPlace().location.lng(),
      },
    ];
    this.offsetMap(markerList);

    const orgLatLng = this.orgMarker.getPlace().location;
    const dstLatLng = this.dstMarker.getPlace().location;

    this.shadowLine.getPath().push(orgLatLng);
    this.shadowLine.getPath().push(dstLatLng);
    this.shadowLine.setMap(this.map);

    // This was made do to the very annoying bug of making the polyline
    // extremly big when there is a huge diffrence between the distances
    // of the previous addresses and the current addresses inputed.
    // Comment the setTimeout part and play around with the input
    // values to see for yourself

    window.setTimeout(() => {
      const path = drawDashedCurve(orgLatLng, dstLatLng, this.map);

      this.curvedLine.setPath(path);
      this.curvedLine.setMap(this.map);
    }, 10);
    mapOptions.setTilt ? this.map.setTilt(mapOptions.tiltValue) : null;
  }

  offsetMap(markerList) {
    const bounds = new google.maps.LatLngBounds();

    markerList.forEach((marker) => {
      bounds.extend(new google.maps.LatLng(marker.lat, marker.lng));
    });

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const leftMarginRatio = 0.65;
    const topMarginRatio = 0.35;

    const leftPadding = screenWidth * leftMarginRatio;
    const topPadding = screenHeight * topMarginRatio;

    if (screenWidth >= 1024) {
      this.map.fitBounds(bounds, { left: leftPadding });
      this.map.setZoom(this.map.getZoom() - 0.95);
    } else {
      this.map.fitBounds(bounds, { top: topPadding });
      this.map.setZoom(this.map.getZoom() - 0.95);
    }
  }
}
