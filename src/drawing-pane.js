import { control, DomUtil, Point } from 'leaflet';
import { cls, insertAfter, setPosition } from './utils';

export const PANE_NAME = 'area-draw-selection';

function drawingPaneContainer(map) {
  const drawPane = DomUtil.create(
    'div',
    cls('leaflet-map-overlay-pane', 'leaflet-pane')
  );
  return drawPane;
}

export function createPane(map) {
  const standardPanesContainer = map
    .getContainer()
    .querySelector('.leaflet-map-pane');
  const overlayPanesContainer = drawingPaneContainer(map);
  insertAfter(overlayPanesContainer, standardPanesContainer);
  const pane = map.createPane(PANE_NAME, overlayPanesContainer);
  pane.addEventListener('click', (event) => {
    event.preventDefault();
    map.fire('as:point-add', event);
  });
  pane.style.zIndex = 550;
}

export function addEndClickArea(control, map, [x, y]) {
  const pane = map.getPane(PANE_NAME);
  const marker = DomUtil.create('div', cls('end-selection-area'), pane);
  const bbox = marker.getBoundingClientRect();
  marker.setAttribute('role', 'button');
  marker.addEventListener(
    'click',
    (event) => {
      event.stopPropagation();
      map.fire('as:creation-end');
    },
    {
      once: true,
    }
  );
  marker.addEventListener('mouseenter', control.overClosePoint.bind(control));
  marker.addEventListener('mouseleave', control.outClosePoint.bind(control));
  setPosition(
    marker,
    new Point(x, y),
    new Point(-bbox.width / 2, -bbox.height / 2)
  );
}
