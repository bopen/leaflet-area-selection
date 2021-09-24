## Changelog

### 0.6.0

- Added: square selection during drawing phase
- Fixed: plugin was not working on mobile if [dragging](https://leafletjs.com/reference-1.7.1.html#map-dragging) was disabled

### 0.5.0

- Added: `onButtonActivate`
- Added: `onButtonDeactivate`

### 0.4.0

- Do not ever ever ever use leaflet-src.esm. _Never_.
- Prevent click events on markers from being propagated to the map
- Fixed issue positioning new markers when the map is not fullscreen
- Added a `drawing-area` CSS class to the map container when plugin is active
