import { DivIcon, Marker, Point, Polygon } from 'leaflet';
import { cls } from './utils';

export function onAddPoint(control, map) {
  return (event) => {
    // Default behavior while dragging
    if (control.map_moving) {
      return;
    }
    const { clientX, clientY } = event;
    const container = map.getContainer();
    const bbox = container.getBoundingClientRect();
    const x = clientX - bbox.left;
    const y = clientY - bbox.top;
    const point = new Point(x, y);
    const icon = new DivIcon({
      className: cls('area-select-marker'),
    });
    const marker = new Marker(map.containerPointToLatLng(point), {
      icon,
    });
    const newEdge = {
      point,
      icon,
      marker,
    };
    map.fire('as:marker-add', newEdge);
    marker.addTo(map);
  };
}

export function onAddMarker(control, map) {
  return (edge) => {
    const { markers } = control;
    markers.push(edge);
    if (markers.length < 3) {
      markers.forEach(({ marker }) => {
        const icon = marker.getIcon();
        icon.options.className = cls('area-select-marker', 'invalid');
        marker.setIcon(icon);
      });
      return;
    } else if (markers.length === 3) {
      // Restore colors
      markers.forEach(({ marker }) => {
        const icon = marker.getIcon();
        icon.options.className = cls('area-select-marker');
        marker.setIcon(icon);
      });
    }
    // update the polygon
    const polygon = new Polygon(
      markers.map(({ point }) => map.containerPointToLatLng(point)),
      { color: 'rgb(45, 123, 200)' }
    );
    if (control.polygon) {
      map.removeLayer(control.polygon);
    }
    control.polygon = polygon;
    map.addLayer(control.polygon);
  };
}
