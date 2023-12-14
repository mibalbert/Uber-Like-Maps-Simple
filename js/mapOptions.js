
const api_key = "AIzaSyCT9NrHuBQBgnTBOjsyiD-sm5kdzsMbeb8"
export const mapOptions = {
  src: `https://maps.googleapis.com/maps/api/js?key=${api_key}&libraries=places,geometry&callback=initMap`,
  mapSettings: {
    mapId: "b1beacae401d047c",
    rotateControl: false,
    disableDefaultUI: true,
    zoomControl: true,
    center: { lat: 52.713709, lng: -1.58632 },
    zoom: 6.65,
    restriction: {
      latLngBounds: {
        east: 179.9999,
        north: 82,
        south: -85,
        west: -179.9999,
      },
      strictBounds: true,
    },
  },
  setTilt: true, // tilts the map
  tiltValue: 45, // values from 0 to 45
};

// Hide zoom-controls if window is smaller than 640px
// window.addEventListener("resize", () => {
//   const screenWidth = window.screen.width;
//   let zoom = mapOptions.setZoomControl;
//   screenWidth >= 640 ? zoom == true : zoom == false;
//   // map.setOptions({ zoomControl: screenWidth >= 640 });
// });
