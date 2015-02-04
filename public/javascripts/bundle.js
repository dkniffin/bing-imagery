(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/rgreen/bing-imagery/public/javascripts/app.js":[function(require,module,exports){
Map = require('./map.js');

var map = new Map(document.getElementById("myMap"), new Microsoft.Maps.Location(40, -105.27), 15);




},{"./map.js":"/Users/rgreen/bing-imagery/public/javascripts/map.js"}],"/Users/rgreen/bing-imagery/public/javascripts/dragHandleLayer.js":[function(require,module,exports){
function DragHandleLayer(polygon, options) {
  this.polygon = polygon;
  this.options = options;
  this.selectedHandle = -1;
  this.polygonPoints = this.polygon.getLocations();
  this.dragHandles = [];
  this._microsoft = new Microsoft.Maps.EntityCollection();;

  this.init();
}

DragHandleLayer.prototype = {
  init: function() {
    for (i = 0; i < this.polygonPoints.length; i++) {
      var dragHandle = new Microsoft.Maps.Pushpin(this.polygonPoints[i], { draggable: true, icon: 'images/DragHandleWhite.gif', height: this.options.DragHandleImageHeight, width: this.options.DragHandleImageWidth, anchor: this.options.DragHandleImageAnchor, typeName: 'BM_Module_DragHandle' });
      Microsoft.Maps.Events.addHandler(dragHandle, 'dragstart', this.startDragHandler.bind(this));
      Microsoft.Maps.Events.addHandler(dragHandle, 'drag', this.dragHandler.bind(this));
      Microsoft.Maps.Events.addHandler(dragHandle, 'dragend', this.endDragHandler.bind(this));
      Microsoft.Maps.Events.addHandler(dragHandle, 'mouseover', this.mouseOverDragHandle.bind(this));
      Microsoft.Maps.Events.addHandler(dragHandle, 'mouseout', this.mouseOutDragHandle.bind(this));
      this._microsoft.push(dragHandle);
      this.dragHandles.push(dragHandle);
    }
  },

  startDragHandler: function(e) {
    var handleLocation = e.entity.getLocation();

    for (i = 0; i < this.dragHandles.length; i++) {
      if (handleLocation == this.dragHandles[i].getLocation()) {
        this.selectedHandle = i;
        break;
      }
    }
  },

  dragHandler: function(e) {
    var loc = e.entity.getLocation();

    if (this.selectedHandle == 0) {
      this.polygonPoints[1].latitude = loc.latitude;
      this.polygonPoints[3].longitude = loc.longitude;
    }

    if (this.selectedHandle == 1) {
      this.polygonPoints[0].latitude = loc.latitude;
      this.polygonPoints[2].longitude = loc.longitude;
    }

    if (this.selectedHandle == 2) {
      this.polygonPoints[1].longitude = loc.longitude;
      this.polygonPoints[3].latitude = loc.latitude;
    }

    if (this.selectedHandle == 3) {
      this.polygonPoints[2].latitude = loc.latitude;
      this.polygonPoints[0].longitude = loc.longitude;
    }

    this.polygonPoints[this.selectedHandle].latitude = loc.latitude;
    this.polygonPoints[this.selectedHandle].longitude = loc.longitude;

    _.each(this.dragHandles, function(dragHandle, i) {
        dragHandle.setLocation(this.polygonPoints[i]);
    }, this)


    this.polygon.setLocations(this.polygonPoints);
  },

  endDragHandler: function(e) {
    e.entity.setOptions({ icon: this.options.DragHandleImage });
    _.each(this.dragHandles, function(dragHandle, i) {
        dragHandle.setLocation(this.polygonPoints[i]);
    }, this)
  },

  mouseOverDragHandle: function(e) {
    e.target.setOptions({ icon: this.options.DragHandleImageActive });
  },

  mouseOutDragHandle: function(e) {
    e.target.setOptions({ icon: this. options.DragHandleImage });
  }

}

module.exports = DragHandleLayer;
},{}],"/Users/rgreen/bing-imagery/public/javascripts/map.js":[function(require,module,exports){
Polygon = require('./polygon.js')
DragHandleLayer = require('./dragHandleLayer.js')

function Map(el, center, zoom) {
  this._microsoft = new Microsoft.Maps.Map(el, {
    credentials:"Ao0pgKJiEzVEWKCChHTB5JBezW9XvoM4WESpeYywz8wBY9kkWrZWNdKBZmmqz21Y",
    center: center,
    zoom: zoom
  });

  this.polygon = this.createPolygon();
  this.dragHandleLayer = this.createDragHandleLayer(this.polygon._microsoft);

  Microsoft.Maps.Events.addHandler(this.polygon._microsoft, 'mousedown', this.draggableStartDragHandler.bind(this));
  Microsoft.Maps.Events.addHandler(this._microsoft, 'mousemove', this.draggableDragHandler.bind(this));
  Microsoft.Maps.Events.addHandler(this.polygon._microsoft, 'mouseup', this.draggableEndDragHandler.bind(this));
  Microsoft.Maps.Events.addHandler(this.polygon._microsoft, 'mouseout', this.draggableEndDragHandler.bind(this));
  Microsoft.Maps.Events.addHandler(this._microsoft, 'mouseout', this.draggableEndDragHandler.bind(this));


  this._microsoft.entities.push(this.polygon._microsoft);
  this._microsoft.entities.push(this.dragHandleLayer._microsoft);
}

Map.prototype = {
  createChildren: function() {
  },

  createPolygon: function() {
    var location1 = new Microsoft.Maps.Location(40,-105.27);
    var location2 = new Microsoft.Maps.Location(40,-105.26);
    var location3 = new Microsoft.Maps.Location(40.01,-105.26);
    var location4 = new Microsoft.Maps.Location(40.01,-105.27);
    return new Polygon([location1, location2, location3, location4], new Microsoft.Maps.Color(100,100,0,100));

  },
  createDragHandleLayer: function(polygon) {
    var dragHandleOptions = {
      DragHandleImage: 'images/DragHandleWhite.gif',                                      // Image for default drag handle
      DragHandleImageActive: 'images/DragHandleGreen.gif',                                // Image for active drag handle
      DragHandleImageHeight: 10,                                                          // Height for default and active drag handle image
      DragHandleImageWidth: 10,                                                           // Width for default and active drag handle image
      DragHandleImageAnchor: new Microsoft.Maps.Point(5, 5),                              // Anchor Point for drag handle image
      shapeMaskStrokeColor: new Microsoft.Maps.Color(200, 100, 100, 100),                 // Line color of shape mask
      shapeMaskFillColor: new Microsoft.Maps.Color(000, 000, 000, 000),                   // fill color of shape mask (polygon only)
      shapeMaskStrokeThickness: 2,                                                        // line width of shape mask
      shapeMaskStrokeDashArray: '2 2'                                                     // dash pattern of shape mask
    }
    return new DragHandleLayer(polygon, dragHandleOptions);
  },

  draggableStartDragHandler: function(e) {
    this.polygon.origLoc = this._microsoft.tryPixelToLocation(new Microsoft.Maps.Point(e.getX(), e.getY()));
    this.polygon.dragging = true;
  },

  draggableDragHandler: function(e) {
    if (this.polygon.dragging) {
      if(e.targetType == 'polygon') {
        var loc = this._microsoft.tryPixelToLocation(new Microsoft.Maps.Point(e.getX(), e.getY()));
        var latVariance = 0;
        var longVariance = 0;

        //determine variance
        latVariance = loc.latitude - this.polygon.origLoc.latitude;
        longVariance = loc.longitude - this.polygon.origLoc.longitude;

        this.polygon.origLoc = loc;

        //adjust points in current shape
        var currentPoints = e.target.getLocations();
        for (var i = 0; i < currentPoints.length; i++) {
          currentPoints[i].latitude += latVariance;
          currentPoints[i].longitude += longVariance;
        }

        //set new points for polygon
        e.target.setLocations(currentPoints);

        var points = currentPoints;
        for (var i = 0; i < this.dragHandleLayer.dragHandles.length; i++) {
          this.dragHandleLayer.dragHandles[i].setLocation(points[i]);
        }


        e.handled = true;
      }
      else {
        this.polygon.dragging = false;
      }
    }
  },

  draggableEndDragHandler: function(e) {
    this.polygon.dragging = false;
  }
}

module.exports = Map;
},{"./dragHandleLayer.js":"/Users/rgreen/bing-imagery/public/javascripts/dragHandleLayer.js","./polygon.js":"/Users/rgreen/bing-imagery/public/javascripts/polygon.js"}],"/Users/rgreen/bing-imagery/public/javascripts/polygon.js":[function(require,module,exports){
function Polygon(vertices, color) {
  this._microsoft = new Microsoft.Maps.Polygon(vertices, {fillColor: color, strokeColor: color});
  this.origLoc = -1;
  this.dragging = false;
}

module.exports = Polygon;
},{}]},{},["/Users/rgreen/bing-imagery/public/javascripts/app.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYXBwLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2RyYWdIYW5kbGVMYXllci5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9tYXAuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvcG9seWdvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIk1hcCA9IHJlcXVpcmUoJy4vbWFwLmpzJyk7XG5cbnZhciBtYXAgPSBuZXcgTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibXlNYXBcIiksIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0MCwgLTEwNS4yNyksIDE1KTtcblxuXG5cbiIsImZ1bmN0aW9uIERyYWdIYW5kbGVMYXllcihwb2x5Z29uLCBvcHRpb25zKSB7XG4gIHRoaXMucG9seWdvbiA9IHBvbHlnb247XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIHRoaXMuc2VsZWN0ZWRIYW5kbGUgPSAtMTtcbiAgdGhpcy5wb2x5Z29uUG9pbnRzID0gdGhpcy5wb2x5Z29uLmdldExvY2F0aW9ucygpO1xuICB0aGlzLmRyYWdIYW5kbGVzID0gW107XG4gIHRoaXMuX21pY3Jvc29mdCA9IG5ldyBNaWNyb3NvZnQuTWFwcy5FbnRpdHlDb2xsZWN0aW9uKCk7O1xuXG4gIHRoaXMuaW5pdCgpO1xufVxuXG5EcmFnSGFuZGxlTGF5ZXIucHJvdG90eXBlID0ge1xuICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5wb2x5Z29uUG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZHJhZ0hhbmRsZSA9IG5ldyBNaWNyb3NvZnQuTWFwcy5QdXNocGluKHRoaXMucG9seWdvblBvaW50c1tpXSwgeyBkcmFnZ2FibGU6IHRydWUsIGljb246ICdpbWFnZXMvRHJhZ0hhbmRsZVdoaXRlLmdpZicsIGhlaWdodDogdGhpcy5vcHRpb25zLkRyYWdIYW5kbGVJbWFnZUhlaWdodCwgd2lkdGg6IHRoaXMub3B0aW9ucy5EcmFnSGFuZGxlSW1hZ2VXaWR0aCwgYW5jaG9yOiB0aGlzLm9wdGlvbnMuRHJhZ0hhbmRsZUltYWdlQW5jaG9yLCB0eXBlTmFtZTogJ0JNX01vZHVsZV9EcmFnSGFuZGxlJyB9KTtcbiAgICAgIE1pY3Jvc29mdC5NYXBzLkV2ZW50cy5hZGRIYW5kbGVyKGRyYWdIYW5kbGUsICdkcmFnc3RhcnQnLCB0aGlzLnN0YXJ0RHJhZ0hhbmRsZXIuYmluZCh0aGlzKSk7XG4gICAgICBNaWNyb3NvZnQuTWFwcy5FdmVudHMuYWRkSGFuZGxlcihkcmFnSGFuZGxlLCAnZHJhZycsIHRoaXMuZHJhZ0hhbmRsZXIuYmluZCh0aGlzKSk7XG4gICAgICBNaWNyb3NvZnQuTWFwcy5FdmVudHMuYWRkSGFuZGxlcihkcmFnSGFuZGxlLCAnZHJhZ2VuZCcsIHRoaXMuZW5kRHJhZ0hhbmRsZXIuYmluZCh0aGlzKSk7XG4gICAgICBNaWNyb3NvZnQuTWFwcy5FdmVudHMuYWRkSGFuZGxlcihkcmFnSGFuZGxlLCAnbW91c2VvdmVyJywgdGhpcy5tb3VzZU92ZXJEcmFnSGFuZGxlLmJpbmQodGhpcykpO1xuICAgICAgTWljcm9zb2Z0Lk1hcHMuRXZlbnRzLmFkZEhhbmRsZXIoZHJhZ0hhbmRsZSwgJ21vdXNlb3V0JywgdGhpcy5tb3VzZU91dERyYWdIYW5kbGUuYmluZCh0aGlzKSk7XG4gICAgICB0aGlzLl9taWNyb3NvZnQucHVzaChkcmFnSGFuZGxlKTtcbiAgICAgIHRoaXMuZHJhZ0hhbmRsZXMucHVzaChkcmFnSGFuZGxlKTtcbiAgICB9XG4gIH0sXG5cbiAgc3RhcnREcmFnSGFuZGxlcjogZnVuY3Rpb24oZSkge1xuICAgIHZhciBoYW5kbGVMb2NhdGlvbiA9IGUuZW50aXR5LmdldExvY2F0aW9uKCk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5kcmFnSGFuZGxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGhhbmRsZUxvY2F0aW9uID09IHRoaXMuZHJhZ0hhbmRsZXNbaV0uZ2V0TG9jYXRpb24oKSkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkSGFuZGxlID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGRyYWdIYW5kbGVyOiBmdW5jdGlvbihlKSB7XG4gICAgdmFyIGxvYyA9IGUuZW50aXR5LmdldExvY2F0aW9uKCk7XG5cbiAgICBpZiAodGhpcy5zZWxlY3RlZEhhbmRsZSA9PSAwKSB7XG4gICAgICB0aGlzLnBvbHlnb25Qb2ludHNbMV0ubGF0aXR1ZGUgPSBsb2MubGF0aXR1ZGU7XG4gICAgICB0aGlzLnBvbHlnb25Qb2ludHNbM10ubG9uZ2l0dWRlID0gbG9jLmxvbmdpdHVkZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zZWxlY3RlZEhhbmRsZSA9PSAxKSB7XG4gICAgICB0aGlzLnBvbHlnb25Qb2ludHNbMF0ubGF0aXR1ZGUgPSBsb2MubGF0aXR1ZGU7XG4gICAgICB0aGlzLnBvbHlnb25Qb2ludHNbMl0ubG9uZ2l0dWRlID0gbG9jLmxvbmdpdHVkZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zZWxlY3RlZEhhbmRsZSA9PSAyKSB7XG4gICAgICB0aGlzLnBvbHlnb25Qb2ludHNbMV0ubG9uZ2l0dWRlID0gbG9jLmxvbmdpdHVkZTtcbiAgICAgIHRoaXMucG9seWdvblBvaW50c1szXS5sYXRpdHVkZSA9IGxvYy5sYXRpdHVkZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zZWxlY3RlZEhhbmRsZSA9PSAzKSB7XG4gICAgICB0aGlzLnBvbHlnb25Qb2ludHNbMl0ubGF0aXR1ZGUgPSBsb2MubGF0aXR1ZGU7XG4gICAgICB0aGlzLnBvbHlnb25Qb2ludHNbMF0ubG9uZ2l0dWRlID0gbG9jLmxvbmdpdHVkZTtcbiAgICB9XG5cbiAgICB0aGlzLnBvbHlnb25Qb2ludHNbdGhpcy5zZWxlY3RlZEhhbmRsZV0ubGF0aXR1ZGUgPSBsb2MubGF0aXR1ZGU7XG4gICAgdGhpcy5wb2x5Z29uUG9pbnRzW3RoaXMuc2VsZWN0ZWRIYW5kbGVdLmxvbmdpdHVkZSA9IGxvYy5sb25naXR1ZGU7XG5cbiAgICBfLmVhY2godGhpcy5kcmFnSGFuZGxlcywgZnVuY3Rpb24oZHJhZ0hhbmRsZSwgaSkge1xuICAgICAgICBkcmFnSGFuZGxlLnNldExvY2F0aW9uKHRoaXMucG9seWdvblBvaW50c1tpXSk7XG4gICAgfSwgdGhpcylcblxuXG4gICAgdGhpcy5wb2x5Z29uLnNldExvY2F0aW9ucyh0aGlzLnBvbHlnb25Qb2ludHMpO1xuICB9LFxuXG4gIGVuZERyYWdIYW5kbGVyOiBmdW5jdGlvbihlKSB7XG4gICAgZS5lbnRpdHkuc2V0T3B0aW9ucyh7IGljb246IHRoaXMub3B0aW9ucy5EcmFnSGFuZGxlSW1hZ2UgfSk7XG4gICAgXy5lYWNoKHRoaXMuZHJhZ0hhbmRsZXMsIGZ1bmN0aW9uKGRyYWdIYW5kbGUsIGkpIHtcbiAgICAgICAgZHJhZ0hhbmRsZS5zZXRMb2NhdGlvbih0aGlzLnBvbHlnb25Qb2ludHNbaV0pO1xuICAgIH0sIHRoaXMpXG4gIH0sXG5cbiAgbW91c2VPdmVyRHJhZ0hhbmRsZTogZnVuY3Rpb24oZSkge1xuICAgIGUudGFyZ2V0LnNldE9wdGlvbnMoeyBpY29uOiB0aGlzLm9wdGlvbnMuRHJhZ0hhbmRsZUltYWdlQWN0aXZlIH0pO1xuICB9LFxuXG4gIG1vdXNlT3V0RHJhZ0hhbmRsZTogZnVuY3Rpb24oZSkge1xuICAgIGUudGFyZ2V0LnNldE9wdGlvbnMoeyBpY29uOiB0aGlzLiBvcHRpb25zLkRyYWdIYW5kbGVJbWFnZSB9KTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gRHJhZ0hhbmRsZUxheWVyOyIsIlBvbHlnb24gPSByZXF1aXJlKCcuL3BvbHlnb24uanMnKVxuRHJhZ0hhbmRsZUxheWVyID0gcmVxdWlyZSgnLi9kcmFnSGFuZGxlTGF5ZXIuanMnKVxuXG5mdW5jdGlvbiBNYXAoZWwsIGNlbnRlciwgem9vbSkge1xuICB0aGlzLl9taWNyb3NvZnQgPSBuZXcgTWljcm9zb2Z0Lk1hcHMuTWFwKGVsLCB7XG4gICAgY3JlZGVudGlhbHM6XCJBbzBwZ0tKaUV6VkVXS0NDaEhUQjVKQmV6VzlYdm9NNFdFU3BlWXl3ejh3Qlk5a2tXclpXTmRLQlptbXF6MjFZXCIsXG4gICAgY2VudGVyOiBjZW50ZXIsXG4gICAgem9vbTogem9vbVxuICB9KTtcblxuICB0aGlzLnBvbHlnb24gPSB0aGlzLmNyZWF0ZVBvbHlnb24oKTtcbiAgdGhpcy5kcmFnSGFuZGxlTGF5ZXIgPSB0aGlzLmNyZWF0ZURyYWdIYW5kbGVMYXllcih0aGlzLnBvbHlnb24uX21pY3Jvc29mdCk7XG5cbiAgTWljcm9zb2Z0Lk1hcHMuRXZlbnRzLmFkZEhhbmRsZXIodGhpcy5wb2x5Z29uLl9taWNyb3NvZnQsICdtb3VzZWRvd24nLCB0aGlzLmRyYWdnYWJsZVN0YXJ0RHJhZ0hhbmRsZXIuYmluZCh0aGlzKSk7XG4gIE1pY3Jvc29mdC5NYXBzLkV2ZW50cy5hZGRIYW5kbGVyKHRoaXMuX21pY3Jvc29mdCwgJ21vdXNlbW92ZScsIHRoaXMuZHJhZ2dhYmxlRHJhZ0hhbmRsZXIuYmluZCh0aGlzKSk7XG4gIE1pY3Jvc29mdC5NYXBzLkV2ZW50cy5hZGRIYW5kbGVyKHRoaXMucG9seWdvbi5fbWljcm9zb2Z0LCAnbW91c2V1cCcsIHRoaXMuZHJhZ2dhYmxlRW5kRHJhZ0hhbmRsZXIuYmluZCh0aGlzKSk7XG4gIE1pY3Jvc29mdC5NYXBzLkV2ZW50cy5hZGRIYW5kbGVyKHRoaXMucG9seWdvbi5fbWljcm9zb2Z0LCAnbW91c2VvdXQnLCB0aGlzLmRyYWdnYWJsZUVuZERyYWdIYW5kbGVyLmJpbmQodGhpcykpO1xuICBNaWNyb3NvZnQuTWFwcy5FdmVudHMuYWRkSGFuZGxlcih0aGlzLl9taWNyb3NvZnQsICdtb3VzZW91dCcsIHRoaXMuZHJhZ2dhYmxlRW5kRHJhZ0hhbmRsZXIuYmluZCh0aGlzKSk7XG5cblxuICB0aGlzLl9taWNyb3NvZnQuZW50aXRpZXMucHVzaCh0aGlzLnBvbHlnb24uX21pY3Jvc29mdCk7XG4gIHRoaXMuX21pY3Jvc29mdC5lbnRpdGllcy5wdXNoKHRoaXMuZHJhZ0hhbmRsZUxheWVyLl9taWNyb3NvZnQpO1xufVxuXG5NYXAucHJvdG90eXBlID0ge1xuICBjcmVhdGVDaGlsZHJlbjogZnVuY3Rpb24oKSB7XG4gIH0sXG5cbiAgY3JlYXRlUG9seWdvbjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxvY2F0aW9uMSA9IG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0MCwtMTA1LjI3KTtcbiAgICB2YXIgbG9jYXRpb24yID0gbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQwLC0xMDUuMjYpO1xuICAgIHZhciBsb2NhdGlvbjMgPSBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDAuMDEsLTEwNS4yNik7XG4gICAgdmFyIGxvY2F0aW9uNCA9IG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0MC4wMSwtMTA1LjI3KTtcbiAgICByZXR1cm4gbmV3IFBvbHlnb24oW2xvY2F0aW9uMSwgbG9jYXRpb24yLCBsb2NhdGlvbjMsIGxvY2F0aW9uNF0sIG5ldyBNaWNyb3NvZnQuTWFwcy5Db2xvcigxMDAsMTAwLDAsMTAwKSk7XG5cbiAgfSxcbiAgY3JlYXRlRHJhZ0hhbmRsZUxheWVyOiBmdW5jdGlvbihwb2x5Z29uKSB7XG4gICAgdmFyIGRyYWdIYW5kbGVPcHRpb25zID0ge1xuICAgICAgRHJhZ0hhbmRsZUltYWdlOiAnaW1hZ2VzL0RyYWdIYW5kbGVXaGl0ZS5naWYnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW1hZ2UgZm9yIGRlZmF1bHQgZHJhZyBoYW5kbGVcbiAgICAgIERyYWdIYW5kbGVJbWFnZUFjdGl2ZTogJ2ltYWdlcy9EcmFnSGFuZGxlR3JlZW4uZ2lmJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEltYWdlIGZvciBhY3RpdmUgZHJhZyBoYW5kbGVcbiAgICAgIERyYWdIYW5kbGVJbWFnZUhlaWdodDogMTAsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhlaWdodCBmb3IgZGVmYXVsdCBhbmQgYWN0aXZlIGRyYWcgaGFuZGxlIGltYWdlXG4gICAgICBEcmFnSGFuZGxlSW1hZ2VXaWR0aDogMTAsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXaWR0aCBmb3IgZGVmYXVsdCBhbmQgYWN0aXZlIGRyYWcgaGFuZGxlIGltYWdlXG4gICAgICBEcmFnSGFuZGxlSW1hZ2VBbmNob3I6IG5ldyBNaWNyb3NvZnQuTWFwcy5Qb2ludCg1LCA1KSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBbmNob3IgUG9pbnQgZm9yIGRyYWcgaGFuZGxlIGltYWdlXG4gICAgICBzaGFwZU1hc2tTdHJva2VDb2xvcjogbmV3IE1pY3Jvc29mdC5NYXBzLkNvbG9yKDIwMCwgMTAwLCAxMDAsIDEwMCksICAgICAgICAgICAgICAgICAvLyBMaW5lIGNvbG9yIG9mIHNoYXBlIG1hc2tcbiAgICAgIHNoYXBlTWFza0ZpbGxDb2xvcjogbmV3IE1pY3Jvc29mdC5NYXBzLkNvbG9yKDAwMCwgMDAwLCAwMDAsIDAwMCksICAgICAgICAgICAgICAgICAgIC8vIGZpbGwgY29sb3Igb2Ygc2hhcGUgbWFzayAocG9seWdvbiBvbmx5KVxuICAgICAgc2hhcGVNYXNrU3Ryb2tlVGhpY2tuZXNzOiAyLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGluZSB3aWR0aCBvZiBzaGFwZSBtYXNrXG4gICAgICBzaGFwZU1hc2tTdHJva2VEYXNoQXJyYXk6ICcyIDInICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBkYXNoIHBhdHRlcm4gb2Ygc2hhcGUgbWFza1xuICAgIH1cbiAgICByZXR1cm4gbmV3IERyYWdIYW5kbGVMYXllcihwb2x5Z29uLCBkcmFnSGFuZGxlT3B0aW9ucyk7XG4gIH0sXG5cbiAgZHJhZ2dhYmxlU3RhcnREcmFnSGFuZGxlcjogZnVuY3Rpb24oZSkge1xuICAgIHRoaXMucG9seWdvbi5vcmlnTG9jID0gdGhpcy5fbWljcm9zb2Z0LnRyeVBpeGVsVG9Mb2NhdGlvbihuZXcgTWljcm9zb2Z0Lk1hcHMuUG9pbnQoZS5nZXRYKCksIGUuZ2V0WSgpKSk7XG4gICAgdGhpcy5wb2x5Z29uLmRyYWdnaW5nID0gdHJ1ZTtcbiAgfSxcblxuICBkcmFnZ2FibGVEcmFnSGFuZGxlcjogZnVuY3Rpb24oZSkge1xuICAgIGlmICh0aGlzLnBvbHlnb24uZHJhZ2dpbmcpIHtcbiAgICAgIGlmKGUudGFyZ2V0VHlwZSA9PSAncG9seWdvbicpIHtcbiAgICAgICAgdmFyIGxvYyA9IHRoaXMuX21pY3Jvc29mdC50cnlQaXhlbFRvTG9jYXRpb24obmV3IE1pY3Jvc29mdC5NYXBzLlBvaW50KGUuZ2V0WCgpLCBlLmdldFkoKSkpO1xuICAgICAgICB2YXIgbGF0VmFyaWFuY2UgPSAwO1xuICAgICAgICB2YXIgbG9uZ1ZhcmlhbmNlID0gMDtcblxuICAgICAgICAvL2RldGVybWluZSB2YXJpYW5jZVxuICAgICAgICBsYXRWYXJpYW5jZSA9IGxvYy5sYXRpdHVkZSAtIHRoaXMucG9seWdvbi5vcmlnTG9jLmxhdGl0dWRlO1xuICAgICAgICBsb25nVmFyaWFuY2UgPSBsb2MubG9uZ2l0dWRlIC0gdGhpcy5wb2x5Z29uLm9yaWdMb2MubG9uZ2l0dWRlO1xuXG4gICAgICAgIHRoaXMucG9seWdvbi5vcmlnTG9jID0gbG9jO1xuXG4gICAgICAgIC8vYWRqdXN0IHBvaW50cyBpbiBjdXJyZW50IHNoYXBlXG4gICAgICAgIHZhciBjdXJyZW50UG9pbnRzID0gZS50YXJnZXQuZ2V0TG9jYXRpb25zKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY3VycmVudFBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGN1cnJlbnRQb2ludHNbaV0ubGF0aXR1ZGUgKz0gbGF0VmFyaWFuY2U7XG4gICAgICAgICAgY3VycmVudFBvaW50c1tpXS5sb25naXR1ZGUgKz0gbG9uZ1ZhcmlhbmNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9zZXQgbmV3IHBvaW50cyBmb3IgcG9seWdvblxuICAgICAgICBlLnRhcmdldC5zZXRMb2NhdGlvbnMoY3VycmVudFBvaW50cyk7XG5cbiAgICAgICAgdmFyIHBvaW50cyA9IGN1cnJlbnRQb2ludHM7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kcmFnSGFuZGxlTGF5ZXIuZHJhZ0hhbmRsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0aGlzLmRyYWdIYW5kbGVMYXllci5kcmFnSGFuZGxlc1tpXS5zZXRMb2NhdGlvbihwb2ludHNbaV0pO1xuICAgICAgICB9XG5cblxuICAgICAgICBlLmhhbmRsZWQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMucG9seWdvbi5kcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBkcmFnZ2FibGVFbmREcmFnSGFuZGxlcjogZnVuY3Rpb24oZSkge1xuICAgIHRoaXMucG9seWdvbi5kcmFnZ2luZyA9IGZhbHNlO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwOyIsImZ1bmN0aW9uIFBvbHlnb24odmVydGljZXMsIGNvbG9yKSB7XG4gIHRoaXMuX21pY3Jvc29mdCA9IG5ldyBNaWNyb3NvZnQuTWFwcy5Qb2x5Z29uKHZlcnRpY2VzLCB7ZmlsbENvbG9yOiBjb2xvciwgc3Ryb2tlQ29sb3I6IGNvbG9yfSk7XG4gIHRoaXMub3JpZ0xvYyA9IC0xO1xuICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUG9seWdvbjsiXX0=
