import { DomEvent, DomUtil, Control, Util } from 'leaflet';
import { createPane } from './drawing-pane';
import { cls } from './utils';
import { onAddPoint, onAddMarker } from './events';

export const DrawAreaSelection = Control.extend({
  options: {},

  initialize: function (options = {}) {
    Util.setOptions(this, options);
    this.map_moving = false;
    this.markers = [];
    this.polygon = null;
  },

  mapMoveStart: function () {
    this.map_moving = true;
  },

  mapMoveEnd: function () {
    global.requestAnimationFrame(() => {
      this.map_moving = false;
    });
  },

  onAdd: function (map) {
    this._container = DomUtil.create(
      'div',
      cls('leaflet-area-selector-control')
    );
    createPane(map);
    map.on('movestart', this.mapMoveStart.bind(this));
    map.on('moveend', this.mapMoveEnd.bind(this));
    map.on('as:point-add', onAddPoint(this, map));
    map.on('as:marker-add', onAddMarker(this, map));
    return this._container;
  },
});

export const drawAreaSelection = function (options = {}) {
  return new DrawAreaSelection(options);
};
