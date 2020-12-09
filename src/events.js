import { DivIcon, Marker, Point, Polygon, Polyline } from 'leaflet';
import { cls } from './utils';
import { addEndClickArea } from './drawing-pane';

/**
 * Event handler reacting to an add point action
 * @param {MouseEvent|TouchEvent} event
 */
export function onAddPoint(event) {
  // Default behavior while dragging
  if (this.map_moving) {
    return;
  }
  const { index = null } = event;
  let { clientX, clientY } = event;
  if (clientX === undefined && clientY === undefined) {
    const touch = event.touches[0];
    clientX = touch.clientX;
    clientY = touch.clientY;
  }
  const map = this.getMap();
  const container = map.getContainer();
  const bbox = container.getBoundingClientRect();
  const x = clientX - bbox.left;
  const y = clientY - bbox.top;
  if (this.markers.length === 0) {
    // this is the first point: let's add a sensible click area on the pane too
    addEndClickArea(this, [x, y]);
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
  const _onMarkerDrag = onMarkerDrag.bind(this);
  marker.on('drag', _onMarkerDrag(index === null ? this.markers.length : index));
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
    })(this.markers.length)
  );
  marker.addTo(map);
  map.fire('as:marker-add', newEdge);
  // If this point as not been added at the end, we need to update even handlers HOC params to update index
  if (index !== null) {
    for (let i = index + 1; i < this.markers.length; i++) {
      this.markers[i].marker.off('drag');
      this.markers[i].marker.on('drag', _onMarkerDrag(i));
      this.markers[i].marker.off('dblclick');
      this.markers[i].marker.on('dblclick', (event) => {
        map.fire('as:marker-remove', {
          ...this.markers[i],
          index: i,
        });
      });
    }
  }
}

export function onAddMarker({ index = null, ...rest }) {
  const map = this.getMap();
  const edge = {
    marker: rest.marker,
    point: rest.point,
  };
  const { markers } = this;
  if (index === null) {
    markers.push(edge);
  } else {
    markers.splice(index, 0, edge);
  }
  const enoughPoints = markers.length >= 3;
  if (this.phase === 'draw') {
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
  if (this.phase === 'adjust') {
    map.fire('as:update-ghost-points');
    this.onPolygonReady();
  }

  if (this.phase === 'draw') {
    // close line
    if (this.closeLine) {
      map.removeLayer(this.closeLine);
    }
    if (enoughPoints) {
      this.closeLine = new Polyline(
        [
          map.containerPointToLatLng(markers[0].point),
          map.containerPointToLatLng(markers[markers.length - 1].point),
        ],
        {
          weight: 3,
          color: '#c0c0c0',
        }
      );
      map.addLayer(this.closeLine);
    }
  }
}

export function onRemoveMarker({ index = 0 }) {
  const map = this.getMap();
  const { markers } = this;
  const enoughPoints = markers.length > 3;
  if (!enoughPoints) {
    return;
  }
  const removed = this.markers.splice(index || 0, 1);
  removed[0].marker.removeFrom(map);
  map.fire('as:update-polygon');
  if (this.phase === 'adjust') {
    map.fire('as:update-ghost-points');
  }
  for (let i = index; i < this.markers.length; i++) {
    this.markers[i].marker.off('drag');
    this.markers[i].marker.on('drag', onMarkerDrag.bind(this)(i));
    this.markers[i].marker.off('dblclick');
    this.markers[i].marker.on('dblclick', (event) => {
      map.fire('as:marker-remove', {
        ...this.markers[i],
        index: i,
      });
    });
  }
}

/**
 * Refresh the polygon on the map
 */
export function onUpdatePolygon() {
  const map = this.getMap();
  const { markers } = this;
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
  if (this.polygon) {
    map.removeLayer(this.polygon);
  }
  this.polygon = polygon;
  map.addLayer(this.polygon);
}

export function onUpdateGhostPoints() {
  const map = this.getMap();
  requestAnimationFrame(() => {
    this.clearGhostMarkers();
    const { markers, ghostMarkers } = this;
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
      marker.on('drag', onGhostMarkerDrag.bind(this)(ghostMarkers.length));
      marker.on('dragstart', onGhostMarkerDragStart.bind(this)());
      marker.on('dragend', onGhostMarkerDragEnd.bind(this)(ghostMarkers.length));
      ghostMarkers.push(newGhostMarker);
      marker.addTo(map);
    });
  });
}

export function onPolygonCreationEnd() {
  const map = this.getMap();
  map.removeLayer(this.closeLine);
  this.closeLine = null;
  // Remove style for the final marker icon
  this.markers[0].marker.getElement().classList.remove('start-marker');
  this.setPhase('adjust');
  map.fire('as:update-ghost-points');
  this.onPolygonReady();
}

export function onActivate(event) {
  event.preventDefault();
  event.target.blur();
  // if current state is active, we need to deactivate
  const activeState = this.options.active || this.phase === 'adjust';
  activeState
    ? this.activateButton.classList.remove('active')
    : this.activateButton.classList.add('active');
  this.setPhase(activeState ? 'inactive' : 'draw', true);
}

export function onMarkerDrag(index) {
  const map = this.getMap();
  return (event) => {
    const { latlng } = event;
    requestAnimationFrame(() => {
      const newPoint = map.latLngToContainerPoint(latlng);
      const { point } = this.markers[index];
      point.x = newPoint.x;
      point.y = newPoint.y;
      map.fire('as:update-polygon');
      map.fire('as:update-ghost-points');
    });
  };
}

export function onGhostMarkerDrag(index) {
  const map = this.getMap();
  return (event) => {
    const { latlng } = event;
    requestAnimationFrame(() => {
      // Given a ghost point, markers to be used as edges are the one at +0 and +1
      const firstPoint = this.markers[index];
      const lastPoint = this.markers[index + 1] ? this.markers[index + 1] : this.markers[0];
      if (this.ghostPolygon) {
        map.removeLayer(this.ghostPolygon);
      }
      this.ghostPolygon = new Polygon(
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
      map.addLayer(this.ghostPolygon);
      map.fire('as:update-polygon');
    });
  };
}

export function onGhostMarkerDragStart() {
  return (event) => {
    event.target.getElement().classList.add('active');
  };
}

export function onGhostMarkerDragEnd(index) {
  const map = this.getMap();
  return (event) => {
    const { target } = event;
    target.getElement().classList.remove('active');
    target.removeFrom(map);
    if (this.ghostPolygon) {
      map.removeLayer(this.ghostPolygon);
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
