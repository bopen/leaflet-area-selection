import { DivIcon, Marker, Point, Polygon, Polyline } from 'leaflet';
import { cls } from './utils';
import { addEndClickArea } from './drawing-pane';

export function onAddPoint(control, map) {
  return (event) => {
    // Default behavior while dragging
    if (control.map_moving) {
      return;
    }
    const { clientX, clientY, index = null } = event;
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
      draggable: true,
    });
    marker.on('drag', onMarkerDrag(control, map, index === null ? control.markers.length : index));
    marker.on('dragstart', (event) => {
      event.target.getElement().classList.add('active');
    });
    marker.on('dragend', (event) => {
      event.target.getElement().classList.remove('active');
    });
    const newEdge = {
      point,
      marker,
      index,
    };
    marker.on(
      'dblclick',
      ((length) => (event) => {
        map.fire('as:marker-remove', {
          ...newEdge,
          index: index === null ? length : index,
        });
      })(control.markers.length)
    );
    marker.addTo(map);
    map.fire('as:marker-add', newEdge);
    // If this point as not been added at the end, we need to update even handlers HOC params to update index
    if (index !== null) {
      for (let i = index + 1; i < control.markers.length; i++) {
        control.markers[i].marker.off('drag');
        control.markers[i].marker.on('drag', onMarkerDrag(control, map, i));
        control.markers[i].marker.off('dblclick');
        control.markers[i].marker.on('dblclick', (event) => {
          map.fire('as:marker-remove', {
            ...control.markers[i],
            index: i,
          });
        });
      }
    }
  };
}

export function onAddMarker(control, map) {
  return ({ index = null, ...rest }) => {
    const edge = {
      marker: rest.marker,
      point: rest.point,
    };
    const { markers } = control;
    if (index === null) {
      markers.push(edge);
    } else {
      markers.splice(index, 0, edge);
    }
    const enoughPoints = markers.length >= 3;
    if (control.phase === 'draw') {
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
    }
    map.fire('as:update-polygon');
    if (control.phase === 'adjust') {
      map.fire('as:update-ghost-points');
    }

    if (control.phase === 'draw') {
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
    }
  };
}

export function onRemoveMarker(control, map) {
  return ({ index = 0, marker }) => {
    const { markers } = control;
    const enoughPoints = markers.length > 3;
    if (!enoughPoints) {
      return;
    }
    const removed = control.markers.splice(index || 0, 1);
    removed[0].marker.removeFrom(map);
    map.fire('as:update-polygon');
    if (control.phase === 'adjust') {
      map.fire('as:update-ghost-points');
    }
    for (let i = index; i < control.markers.length; i++) {
      control.markers[i].marker.off('drag');
      control.markers[i].marker.on('drag', onMarkerDrag(control, map, i));
      control.markers[i].marker.off('dblclick');
      control.markers[i].marker.on('dblclick', (event) => {
        map.fire('as:marker-remove', {
          ...control.markers[i],
          index: i,
        });
      });
    }
  };
}

/**
 * Refresh the polygon on the map
 * @param {Control} control
 * @param {Map} map
 */
export function onUpdatePolygon(control, map) {
  return (event) => {
    const { markers } = control;
    const enoughPoints = markers.length >= 3;
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
  };
}

export function onUpdateGhostPoints(control, map) {
  return (event) => {
    global.requestAnimationFrame(() => {
      control.clearGhostMarkers();
      const { markers, ghostMarkers } = control;
      markers.forEach((currentMarker, index) => {
        const nextMarker = markers[index + 1] ? markers[index + 1] : markers[0];
        const currentLatLng = currentMarker.marker.getLatLng();
        const nextLatLng = nextMarker.marker.getLatLng();
        const point = map.latLngToContainerPoint([
          (currentLatLng.lat + nextLatLng.lat) / 2,
          (currentLatLng.lng + nextLatLng.lng) / 2,
        ]);

        const icon = new DivIcon({
          className: cls('area-select-ghost-marker'),
          iconSize: [16, 16],
        });
        const marker = new Marker(map.containerPointToLatLng(point), {
          icon,
          draggable: true,
        });
        const newGhostMarker = {
          point,
          marker,
        };
        marker.on('drag', onGhostMarkerDrag(control, map, ghostMarkers.length));
        marker.on('dragstart', onGhostMarkerDragStart(control, map));
        marker.on('dragend', onGhostMarkerDragEnd(control, map, ghostMarkers.length));
        ghostMarkers.push(newGhostMarker);
        marker.addTo(map);
      });
    });
  };
}

export function onPolygonCreationEnd(control, map) {
  return (event) => {
    map.removeLayer(control.closeLine);
    control.closeLine = null;
    // Remove style for the final marker icon
    control.markers[0].marker.getElement().classList.remove('start-marker');
    control.setPhase('adjust');
    map.fire('as:update-ghost-points');
    control.options.onPolygonReady(control.polygon);
  };
}

export function onActivate(event) {
  event.preventDefault();
  event.target.blur();
  // if current state is active, we need to deactivate
  this.options.active
    ? this.activateButton.classList.add('active')
    : this.activateButton.classList.remove('active');
  this.setPhase(this.options.active ? 'inactive' : 'draw', true);
}

export function onMarkerDrag(control, map, index) {
  return (event) => {
    const { latlng } = event;
    global.requestAnimationFrame(() => {
      const newPoint = map.latLngToContainerPoint(latlng);
      const { point } = control.markers[index];
      point.x = newPoint.x;
      point.y = newPoint.y;
      map.fire('as:update-polygon');
      map.fire('as:update-ghost-points');
    });
  };
}

export function onGhostMarkerDrag(control, map, index) {
  return (event) => {
    const { latlng } = event;
    global.requestAnimationFrame(() => {
      // Given a ghost point, markers to be used as edges are the one at +0 and +1
      const firstPoint = control.markers[index];
      const lastPoint = control.markers[index + 1]
        ? control.markers[index + 1]
        : control.markers[0];
      if (control.ghostPolygon) {
        map.removeLayer(control.ghostPolygon);
      }
      control.ghostPolygon = new Polygon(
        [
          map.containerPointToLatLng(firstPoint.point),
          latlng,
          map.containerPointToLatLng(lastPoint.point),
        ],
        {
          color: 'rgb(45, 123, 200)',
          weight: 2,
          opacity: 0.5,
          fillOpacity: 0.1,
          dashArray: '5, 10',
        }
      );
      map.addLayer(control.ghostPolygon);
      map.fire('as:update-polygon');
    });
  };
}

export function onGhostMarkerDragStart(control, map) {
  return (event) => {
    event.target.getElement().classList.add('active');
  };
}

export function onGhostMarkerDragEnd(control, map, index) {
  return (event) => {
    const { target } = event;
    target.getElement().classList.remove('active');
    target.removeFrom(map);
    if (control.ghostPolygon) {
      map.removeLayer(control.ghostPolygon);
    }
    const newPoint = map.latLngToContainerPoint(target.getLatLng());
    const fakeEvent = {
      clientX: newPoint.x,
      clientY: newPoint.y,
      index: index + 1,
    };
    map.fire('as:point-add', fakeEvent);
  };
}
