import { DivIcon, Marker, Point, Polygon, Polyline } from 'leaflet';
import { cls } from './utils';
import { addEndClickArea } from './drawing-pane';

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
    if (control.markers.length === 0) {
      // this is the first point: let's add a sensible click area on the pane too
      addEndClickArea(control, map, [x, y]);
    }
    const point = new Point(x, y);
    const icon = new DivIcon({
      className: cls('area-select-marker'),
      iconSize: [16, 16],
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
    const enoughPoints = markers.length >= 3;
    if (!enoughPoints) {
      markers.forEach(({ marker }) => {
        const icon = marker.getIcon();
        icon.options.className = cls('area-select-marker', 'invalid');
        marker.setIcon(icon);
      });
    } else if (markers.length === 3) {
      // Restore colors
      markers.forEach(({ marker }, index) => {
        const icon = marker.getIcon();
        icon.options.className = cls('area-select-marker', index === 0 ? 'start-marker' : null);
        marker.setIcon(icon);
      });
    }
    // update the polygon
    const polygon = new Polygon(
      markers.map(({ marker }) => {
        return marker.getLatLng();
        // return map.containerPointToLatLng(point);
      }),
      {
        color: enoughPoints ? 'rgb(45, 123, 200)' : 'rgba(220, 53, 69, 0.7)',
        weight: 2,
        ...(!enoughPoints && { dashArray: '5, 10' }),
      }
    );
    if (control.polygon) {
      map.removeLayer(control.polygon);
    }
    control.polygon = polygon;
    map.addLayer(control.polygon);
    // close line
    if (control.closeLine) {
      map.removeLayer(control.closeLine);
    }
    if (enoughPoints) {
      control.closeLine = new Polyline(
        [
          map.containerPointToLatLng(markers[0].point),
          map.containerPointToLatLng(markers[markers.length - 1].point),
        ],
        {
          weight: 3,
          color: '#c0c0c0',
        }
      );
      map.addLayer(control.closeLine);
    }
  };
}

export function onPolygonCreationEnd(control, map) {
  return (event) => {
    map.off('as:point-add');
    map.off('as:marker-add');
    map.removeLayer(control.closeLine);
    // Remove style for the final marker icon
    control.markers[0].marker.getElement().classList.remove('start-marker');
    control.closeLine = null;
    control.setActive(false);
  };
}

export function onActivate(event) {
  event.preventDefault();
  event.target.blur();
  this.setActive(!this.options.active);
}
