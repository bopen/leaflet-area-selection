## Changelog

### 0.7.1

- Fixed: map drag is restored when a polygon creation has been cancelled.
  See [#11](https://github.com/bopen/leaflet-area-selection/issues/11)

### 0.7.0

- Added: `activate` method, to make plugin activable externally

### 0.6.2

- Bugfix: drag event were called while user was just performing first click
- Bugfix: ghost markers were displayed in a fuzzy position after a zoom change

### 0.6.1

- Added message to help users on how to draw something

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
