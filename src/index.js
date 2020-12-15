import { Util, Control } from 'leaflet/dist/leaflet-src.esm';
import { DrawAreaSelection, drawAreaSelection } from './control';

Util.extend(Control, {
  DrawAreaSelection,
  drawAreaSelection,
});

export { DrawAreaSelection, drawAreaSelection };
