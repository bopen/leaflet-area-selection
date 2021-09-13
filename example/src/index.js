/* eslint-disable no-console */
import { Map, Icon, tileLayer, marker, geoJSON } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@bopen/leaflet-area-selection/dist/index.css';
import { DrawAreaSelection } from '@bopen/leaflet-area-selection';

import './index.css';

import icon from './B-Open.svg';

// See https://github.com/Leaflet/Leaflet/issues/4968#issuecomment-483402699
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const center = [41.901493, 12.5009157];

const map = new Map('root', {
  // Fix for a bug in Leaflet 1.7.1. See https://github.com/Leaflet/Leaflet/issues/7255
  tap: false,
}).setView(center, 13);

tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const popup = document.createElement('div');
popup.innerHTML = `<div style="text-align: center; font-size: 120%">B-Open</div>
<img alt="B-Open logo" width="75" src="${icon}" />
`;

marker(center).addTo(map).bindPopup(popup);

const areaSelection = new DrawAreaSelection({
  onPolygonReady: (polygon) => {
    const preview = document.getElementById('polygon');
    preview.textContent = JSON.stringify(polygon.toGeoJSON(3), undefined, 2);
    preview.scrollTop = preview.scrollHeight;
  },
  onPolygonDblClick: (polygon, control, ev) => {
    const geojson = geoJSON(polygon.toGeoJSON(), {
      style: {
        opacity: 0.5,
        fillOpacity: 0.2,
        color: 'red',
      },
    });
    geojson.addTo(map);
    control.deactivate();
  },
  onButtonActivate: () => {
    const preview = document.getElementById('polygon');
    preview.textContent = 'Please, draw your polygon';
    console.log('Please, draw your polygon');
  },
  onButtonDeactivate: (polygon) => {
    const preview = document.getElementById('polygon');
    console.log('Deactivated');
    preview.textContent = `Deactivated! Current polygon is:

${polygon ? JSON.stringify(polygon.toGeoJSON(3), undefined, 2) : 'null'}`;
  },
  position: 'topleft',
});

map.addControl(areaSelection);
