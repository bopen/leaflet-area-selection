import { DomUtil } from 'leaflet';
import { cls, insertAfter } from './utils';

function drawingPaneContainer(map) {
  const drawPane = DomUtil.create(
    'div',
    cls('leaflet-map-overlay-pane', 'leaflet-pane')
  );
  drawPane.addEventListener(
    'click',
    (event) => {
      event.preventDefault();
      map.fire('as:point-add', event);
    },
    { passive: false }
  );
  return drawPane;
}

export function createPane(map) {
  const standardPanesContainer = map
    .getContainer()
    .querySelector('.leaflet-map-pane');
  const overlayPanesContainer = drawingPaneContainer(map);
  insertAfter(overlayPanesContainer, standardPanesContainer);

  const pane = map.createPane('area-draw-selection', overlayPanesContainer);
  pane.style.zIndex = 550;
}
