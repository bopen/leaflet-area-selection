import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@bopen/leaflet-area-selection/dist/index.css';
import { DrawAreaSelection } from '@bopen/leaflet-area-selection';

import './index.css';

// See https://github.com/Leaflet/Leaflet/issues/4968#issuecomment-483402699
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const center = [41.901493, 12.5009157];

const map = L.map('root').setView(center, 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

L.marker(center).addTo(map).bindPopup('B-Open');

const areaSelection = new DrawAreaSelection({
  active: true,
  onPolygonReady: (polygon) => {
    document.getElementById('polygon').innerText = JSON.stringify(
      polygon.toGeoJSON(2),
      undefined,
      2
    );
  },
});

map.addControl(areaSelection);
