import { DomUtil, Control, Util, Point } from 'leaflet';
import { createPane, PANE_NAME } from './drawing-pane';
import { cls, setPosition } from './utils';
import { onAddPoint, onAddMarker, onPolygonCreationEnd } from './events';

export const DrawAreaSelection = Control.extend({
  options: {},

  initialize: function (options = {}) {
    Util.setOptions(this, options);
    this.map_moving = false;
    this.markers = [];
    this.polygon = null;
    this.closeLine = null;
    this._originPoint = null;
  },

  mapMoveStart: function () {
    this.map_moving = true;
    if (this.markers.length > 0) {
      this._originPoint = this.markers[0].point;
    }
  },

  mapDragEnd: function (event) {
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
      setPosition(
        touchMarker,
        point,
        new Point(-bbox.width / 2, -bbox.height / 2)
      );
    }
    this.translatePolygon();
  },

  translatePolygon: function () {
    if (this.markers.length === 0) {
      return;
    }
    this.markers.forEach((data) => {
      data.point = data.point.add(this.getOriginOffset());
    });
  },

  getOriginOffset: function () {
    return this.markers.length > 0 && this._originPoint
      ? this._map
          .latLngToContainerPoint(this.markers[0].marker.getLatLng())
          .subtract(this._originPoint)
      : new Point(0, 0);
  },

  onAdd: function (map) {
    this._container = DomUtil.create(
      'div',
      cls('leaflet-area-selector-control')
    );
    this._map = map;
    createPane(map);
    map.on('movestart', this.mapMoveStart.bind(this));
    map.on('moveend', this.mapDragEnd.bind(this));
    map.on('as:point-add', onAddPoint(this, map));
    map.on('as:marker-add', onAddMarker(this, map));
    map.on('as:creation-end', onPolygonCreationEnd(this, map));
    return this._container;
  },

  overClosePoint: function (event) {
    if (this.markers.length > 2 && this.closeLine) {
      this.closeLine.removeFrom(this._map);
    }
  },

  outClosePoint: function (event) {
    if (this.closeLine) {
      this.closeLine.addTo(this._map);
    }
  },
});

export const drawAreaSelection = function (options = {}) {
  return new DrawAreaSelection(options);
};
