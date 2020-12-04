import { DomUtil, Control, Util, Point } from 'leaflet';
import { createPane, PANE_NAME } from './drawing-pane';
import { cls, setPosition } from './utils';
import {
  onActivate,
  onAddMarker,
  onAddPoint,
  onPolygonCreationEnd,
  onRemoveMarker,
  onUpdateGhostPoints,
  onUpdatePolygon,
} from './events';
import iconImage from 'images/area-icon.svg';

export const DrawAreaSelection = Control.extend({
  options: {
    // activate automatically area selection on plugin load
    active: false,
    // callback called when draw phase is complete and at every polygon adjustement
    onPolygonReady: (polygon) => {},
  },

  initialize: function (options = {}) {
    Util.setOptions(this, options);
    // lifecycle phases: one of inactive, draw, adjust
    this.phase = options.active ? 'draw' : 'inactive';
    this.map_moving = false;
    // edge markers used for drawing, next dragging the polygon
    this.markers = [];
    // fake markers used for adding rings to the polygon
    this.ghostMarkers = [];
    // The actual polygon draw
    this.polygon = null;
    // on drawing phase: a line from the last drawn point to the first ones
    this.closeLine = null;
  },

  onAdd: function (map) {
    this._container = DomUtil.create('div', cls('leaflet-area-selector-control'));
    this.activateButton = DomUtil.create('button', '', this._container);
    this.activateButton.addEventListener('click', onActivate.bind(this));
    this.activateButton.addEventListener('dblclick', (event) => {
      event.stopPropagation();
    });
    this.options.active
      ? this.activateButton.classList.add('active')
      : this.activateButton.classList.remove('active');
    const icon = DomUtil.create('img', '', this.activateButton);
    icon.setAttribute('src', iconImage);
    this._map = map;
    createPane(map, this.options);
    map.on('movestart', this.mapMoveStart.bind(this));
    map.on('moveend', this.mapMoveEnd.bind(this));
    map.on('as:point-add', onAddPoint(this, map));
    map.on('as:marker-add', onAddMarker(this, map));
    map.on('as:marker-remove', onRemoveMarker(this, map));
    map.on('as:creation-end', onPolygonCreationEnd(this, map));
    map.on('as:update-polygon', onUpdatePolygon(this, map));
    map.on('as:update-ghost-points', onUpdateGhostPoints(this, map));
    return this._container;
  },

  setPhase(phase, forceClear = false) {
    this.phase = phase;
    this.options.active = phase === 'draw';
    // If we didn't finished to fill a polygon, let's clear all
    if (forceClear || this.phase === 'draw') {
      this.clearGhostMarkers();
      this.clearMarkers();
      this.clearPolygon();
    }
    const pane = this._map.getPane(PANE_NAME);
    const container = pane.parentNode;
    this.options.active
      ? container.classList.remove('inactive')
      : container.classList.add('inactive');
  },

  mapMoveStart: function () {
    this.map_moving = true;
  },

  mapMoveEnd: function (event) {
    global.requestAnimationFrame(() => {
      this.map_moving = false;
    });
    const map = this._map;
    // Re-position end of selection HTML element
    const pane = map.getPane(PANE_NAME);
    const touchMarker = pane.querySelector('.end-selection-area');
    if (touchMarker) {
      const firstMarker = this.markers[0].marker;
      const bbox = touchMarker.getBoundingClientRect();
      const point = map.latLngToContainerPoint(firstMarker.getLatLng());
      setPosition(touchMarker, point, new Point(-bbox.width / 2, -bbox.height / 2));
    }
    this.translatePolygon();
  },

  translatePolygon: function () {
    if (this.markers.length === 0) {
      return;
    }
    const map = this._map;
    this.markers.forEach((data) => {
      data.point = map.latLngToContainerPoint(data.marker.getLatLng());
    });
    this.ghostMarkers.forEach((data) => {
      data.point = map.latLngToContainerPoint(data.marker.getLatLng());
    });
  },

  hoverClosePoint: function (event) {
    if (this.markers.length > 2 && this.closeLine) {
      this.closeLine.removeFrom(this._map);
    }
  },

  outClosePoint: function (event) {
    if (this.closeLine) {
      this.closeLine.addTo(this._map);
    }
  },

  clearMarkers: function () {
    this.markers.forEach(({ marker }) => {
      marker.removeFrom(this._map);
    });
    this.markers = [];
  },

  clearGhostMarkers: function () {
    this.ghostMarkers.forEach(({ marker }) => {
      marker.removeFrom(this._map);
    });
    this.ghostMarkers = [];
  },

  clearPolygon: function () {
    this.polygon && this.polygon.removeFrom(this._map);
    this.polygon = null;
    this.closeLine && this.closeLine.removeFrom(this._map);
    this.closeLine = null;
  },
});

export const drawAreaSelection = function (options = {}) {
  return new DrawAreaSelection(options);
};
