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
  },

  getNSEW: function() {
    locs = this.polygon._microsoft.getLocations();
    lats = _.pluck(locs, 'latitude');
    lons = _.pluck(locs, 'longitude');

    var n = reduceHelper(lats, (greaterThan));
    var s = reduceHelper(lats, lessThan);
    var e = reduceHelper(lons, greaterThan);
    var w = reduceHelper(lons, lessThan);

    return {n: n, s: s, e: e, w: w}
  }
}

//Oh ES6 how I wish you were everywhere... (a, b) => a > b

function greaterThan(a, b) {
  return a > b;
}

function lessThan(a, b) {
  return a < b;
}

function reduceHelper(col, compareFunc) {
  return _.reduce(col, function(acc, el) {
    return (compareFunc(el, acc) ? el : acc)
  })
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYXBwLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2RyYWdIYW5kbGVMYXllci5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9tYXAuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvcG9seWdvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJNYXAgPSByZXF1aXJlKCcuL21hcC5qcycpO1xuXG52YXIgbWFwID0gbmV3IE1hcChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm15TWFwXCIpLCBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDAsIC0xMDUuMjcpLCAxNSk7IiwiZnVuY3Rpb24gRHJhZ0hhbmRsZUxheWVyKHBvbHlnb24sIG9wdGlvbnMpIHtcbiAgdGhpcy5wb2x5Z29uID0gcG9seWdvbjtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgdGhpcy5zZWxlY3RlZEhhbmRsZSA9IC0xO1xuICB0aGlzLnBvbHlnb25Qb2ludHMgPSB0aGlzLnBvbHlnb24uZ2V0TG9jYXRpb25zKCk7XG4gIHRoaXMuZHJhZ0hhbmRsZXMgPSBbXTtcbiAgdGhpcy5fbWljcm9zb2Z0ID0gbmV3IE1pY3Jvc29mdC5NYXBzLkVudGl0eUNvbGxlY3Rpb24oKTs7XG5cbiAgdGhpcy5pbml0KCk7XG59XG5cbkRyYWdIYW5kbGVMYXllci5wcm90b3R5cGUgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnBvbHlnb25Qb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkcmFnSGFuZGxlID0gbmV3IE1pY3Jvc29mdC5NYXBzLlB1c2hwaW4odGhpcy5wb2x5Z29uUG9pbnRzW2ldLCB7IGRyYWdnYWJsZTogdHJ1ZSwgaWNvbjogJ2ltYWdlcy9EcmFnSGFuZGxlV2hpdGUuZ2lmJywgaGVpZ2h0OiB0aGlzLm9wdGlvbnMuRHJhZ0hhbmRsZUltYWdlSGVpZ2h0LCB3aWR0aDogdGhpcy5vcHRpb25zLkRyYWdIYW5kbGVJbWFnZVdpZHRoLCBhbmNob3I6IHRoaXMub3B0aW9ucy5EcmFnSGFuZGxlSW1hZ2VBbmNob3IsIHR5cGVOYW1lOiAnQk1fTW9kdWxlX0RyYWdIYW5kbGUnIH0pO1xuICAgICAgTWljcm9zb2Z0Lk1hcHMuRXZlbnRzLmFkZEhhbmRsZXIoZHJhZ0hhbmRsZSwgJ2RyYWdzdGFydCcsIHRoaXMuc3RhcnREcmFnSGFuZGxlci5iaW5kKHRoaXMpKTtcbiAgICAgIE1pY3Jvc29mdC5NYXBzLkV2ZW50cy5hZGRIYW5kbGVyKGRyYWdIYW5kbGUsICdkcmFnJywgdGhpcy5kcmFnSGFuZGxlci5iaW5kKHRoaXMpKTtcbiAgICAgIE1pY3Jvc29mdC5NYXBzLkV2ZW50cy5hZGRIYW5kbGVyKGRyYWdIYW5kbGUsICdkcmFnZW5kJywgdGhpcy5lbmREcmFnSGFuZGxlci5iaW5kKHRoaXMpKTtcbiAgICAgIE1pY3Jvc29mdC5NYXBzLkV2ZW50cy5hZGRIYW5kbGVyKGRyYWdIYW5kbGUsICdtb3VzZW92ZXInLCB0aGlzLm1vdXNlT3ZlckRyYWdIYW5kbGUuYmluZCh0aGlzKSk7XG4gICAgICBNaWNyb3NvZnQuTWFwcy5FdmVudHMuYWRkSGFuZGxlcihkcmFnSGFuZGxlLCAnbW91c2VvdXQnLCB0aGlzLm1vdXNlT3V0RHJhZ0hhbmRsZS5iaW5kKHRoaXMpKTtcbiAgICAgIHRoaXMuX21pY3Jvc29mdC5wdXNoKGRyYWdIYW5kbGUpO1xuICAgICAgdGhpcy5kcmFnSGFuZGxlcy5wdXNoKGRyYWdIYW5kbGUpO1xuICAgIH1cbiAgfSxcblxuICBzdGFydERyYWdIYW5kbGVyOiBmdW5jdGlvbihlKSB7XG4gICAgdmFyIGhhbmRsZUxvY2F0aW9uID0gZS5lbnRpdHkuZ2V0TG9jYXRpb24oKTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLmRyYWdIYW5kbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoaGFuZGxlTG9jYXRpb24gPT0gdGhpcy5kcmFnSGFuZGxlc1tpXS5nZXRMb2NhdGlvbigpKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRIYW5kbGUgPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgZHJhZ0hhbmRsZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgbG9jID0gZS5lbnRpdHkuZ2V0TG9jYXRpb24oKTtcblxuICAgIGlmICh0aGlzLnNlbGVjdGVkSGFuZGxlID09IDApIHtcbiAgICAgIHRoaXMucG9seWdvblBvaW50c1sxXS5sYXRpdHVkZSA9IGxvYy5sYXRpdHVkZTtcbiAgICAgIHRoaXMucG9seWdvblBvaW50c1szXS5sb25naXR1ZGUgPSBsb2MubG9uZ2l0dWRlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNlbGVjdGVkSGFuZGxlID09IDEpIHtcbiAgICAgIHRoaXMucG9seWdvblBvaW50c1swXS5sYXRpdHVkZSA9IGxvYy5sYXRpdHVkZTtcbiAgICAgIHRoaXMucG9seWdvblBvaW50c1syXS5sb25naXR1ZGUgPSBsb2MubG9uZ2l0dWRlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNlbGVjdGVkSGFuZGxlID09IDIpIHtcbiAgICAgIHRoaXMucG9seWdvblBvaW50c1sxXS5sb25naXR1ZGUgPSBsb2MubG9uZ2l0dWRlO1xuICAgICAgdGhpcy5wb2x5Z29uUG9pbnRzWzNdLmxhdGl0dWRlID0gbG9jLmxhdGl0dWRlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNlbGVjdGVkSGFuZGxlID09IDMpIHtcbiAgICAgIHRoaXMucG9seWdvblBvaW50c1syXS5sYXRpdHVkZSA9IGxvYy5sYXRpdHVkZTtcbiAgICAgIHRoaXMucG9seWdvblBvaW50c1swXS5sb25naXR1ZGUgPSBsb2MubG9uZ2l0dWRlO1xuICAgIH1cblxuICAgIHRoaXMucG9seWdvblBvaW50c1t0aGlzLnNlbGVjdGVkSGFuZGxlXS5sYXRpdHVkZSA9IGxvYy5sYXRpdHVkZTtcbiAgICB0aGlzLnBvbHlnb25Qb2ludHNbdGhpcy5zZWxlY3RlZEhhbmRsZV0ubG9uZ2l0dWRlID0gbG9jLmxvbmdpdHVkZTtcblxuICAgIF8uZWFjaCh0aGlzLmRyYWdIYW5kbGVzLCBmdW5jdGlvbihkcmFnSGFuZGxlLCBpKSB7XG4gICAgICAgIGRyYWdIYW5kbGUuc2V0TG9jYXRpb24odGhpcy5wb2x5Z29uUG9pbnRzW2ldKTtcbiAgICB9LCB0aGlzKVxuXG5cbiAgICB0aGlzLnBvbHlnb24uc2V0TG9jYXRpb25zKHRoaXMucG9seWdvblBvaW50cyk7XG4gIH0sXG5cbiAgZW5kRHJhZ0hhbmRsZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICBlLmVudGl0eS5zZXRPcHRpb25zKHsgaWNvbjogdGhpcy5vcHRpb25zLkRyYWdIYW5kbGVJbWFnZSB9KTtcbiAgICBfLmVhY2godGhpcy5kcmFnSGFuZGxlcywgZnVuY3Rpb24oZHJhZ0hhbmRsZSwgaSkge1xuICAgICAgICBkcmFnSGFuZGxlLnNldExvY2F0aW9uKHRoaXMucG9seWdvblBvaW50c1tpXSk7XG4gICAgfSwgdGhpcylcbiAgfSxcblxuICBtb3VzZU92ZXJEcmFnSGFuZGxlOiBmdW5jdGlvbihlKSB7XG4gICAgZS50YXJnZXQuc2V0T3B0aW9ucyh7IGljb246IHRoaXMub3B0aW9ucy5EcmFnSGFuZGxlSW1hZ2VBY3RpdmUgfSk7XG4gIH0sXG5cbiAgbW91c2VPdXREcmFnSGFuZGxlOiBmdW5jdGlvbihlKSB7XG4gICAgZS50YXJnZXQuc2V0T3B0aW9ucyh7IGljb246IHRoaXMuIG9wdGlvbnMuRHJhZ0hhbmRsZUltYWdlIH0pO1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEcmFnSGFuZGxlTGF5ZXI7IiwiUG9seWdvbiA9IHJlcXVpcmUoJy4vcG9seWdvbi5qcycpXG5EcmFnSGFuZGxlTGF5ZXIgPSByZXF1aXJlKCcuL2RyYWdIYW5kbGVMYXllci5qcycpXG5cbmZ1bmN0aW9uIE1hcChlbCwgY2VudGVyLCB6b29tKSB7XG4gIHRoaXMuX21pY3Jvc29mdCA9IG5ldyBNaWNyb3NvZnQuTWFwcy5NYXAoZWwsIHtcbiAgICBjcmVkZW50aWFsczpcIkFvMHBnS0ppRXpWRVdLQ0NoSFRCNUpCZXpXOVh2b000V0VTcGVZeXd6OHdCWTlra1dyWldOZEtCWm1tcXoyMVlcIixcbiAgICBjZW50ZXI6IGNlbnRlcixcbiAgICB6b29tOiB6b29tXG4gIH0pO1xuXG4gIHRoaXMucG9seWdvbiA9IHRoaXMuY3JlYXRlUG9seWdvbigpO1xuICB0aGlzLmRyYWdIYW5kbGVMYXllciA9IHRoaXMuY3JlYXRlRHJhZ0hhbmRsZUxheWVyKHRoaXMucG9seWdvbi5fbWljcm9zb2Z0KTtcblxuICBNaWNyb3NvZnQuTWFwcy5FdmVudHMuYWRkSGFuZGxlcih0aGlzLnBvbHlnb24uX21pY3Jvc29mdCwgJ21vdXNlZG93bicsIHRoaXMuZHJhZ2dhYmxlU3RhcnREcmFnSGFuZGxlci5iaW5kKHRoaXMpKTtcbiAgTWljcm9zb2Z0Lk1hcHMuRXZlbnRzLmFkZEhhbmRsZXIodGhpcy5fbWljcm9zb2Z0LCAnbW91c2Vtb3ZlJywgdGhpcy5kcmFnZ2FibGVEcmFnSGFuZGxlci5iaW5kKHRoaXMpKTtcbiAgTWljcm9zb2Z0Lk1hcHMuRXZlbnRzLmFkZEhhbmRsZXIodGhpcy5wb2x5Z29uLl9taWNyb3NvZnQsICdtb3VzZXVwJywgdGhpcy5kcmFnZ2FibGVFbmREcmFnSGFuZGxlci5iaW5kKHRoaXMpKTtcbiAgTWljcm9zb2Z0Lk1hcHMuRXZlbnRzLmFkZEhhbmRsZXIodGhpcy5wb2x5Z29uLl9taWNyb3NvZnQsICdtb3VzZW91dCcsIHRoaXMuZHJhZ2dhYmxlRW5kRHJhZ0hhbmRsZXIuYmluZCh0aGlzKSk7XG4gIE1pY3Jvc29mdC5NYXBzLkV2ZW50cy5hZGRIYW5kbGVyKHRoaXMuX21pY3Jvc29mdCwgJ21vdXNlb3V0JywgdGhpcy5kcmFnZ2FibGVFbmREcmFnSGFuZGxlci5iaW5kKHRoaXMpKTtcblxuXG4gIHRoaXMuX21pY3Jvc29mdC5lbnRpdGllcy5wdXNoKHRoaXMucG9seWdvbi5fbWljcm9zb2Z0KTtcbiAgdGhpcy5fbWljcm9zb2Z0LmVudGl0aWVzLnB1c2godGhpcy5kcmFnSGFuZGxlTGF5ZXIuX21pY3Jvc29mdCk7XG59XG5cbk1hcC5wcm90b3R5cGUgPSB7XG4gIGNyZWF0ZVBvbHlnb246IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsb2NhdGlvbjEgPSBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDAsLTEwNS4yNyk7XG4gICAgdmFyIGxvY2F0aW9uMiA9IG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0MCwtMTA1LjI2KTtcbiAgICB2YXIgbG9jYXRpb24zID0gbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQwLjAxLC0xMDUuMjYpO1xuICAgIHZhciBsb2NhdGlvbjQgPSBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDAuMDEsLTEwNS4yNyk7XG4gICAgcmV0dXJuIG5ldyBQb2x5Z29uKFtsb2NhdGlvbjEsIGxvY2F0aW9uMiwgbG9jYXRpb24zLCBsb2NhdGlvbjRdLCBuZXcgTWljcm9zb2Z0Lk1hcHMuQ29sb3IoMTAwLDEwMCwwLDEwMCkpO1xuXG4gIH0sXG4gIGNyZWF0ZURyYWdIYW5kbGVMYXllcjogZnVuY3Rpb24ocG9seWdvbikge1xuICAgIHZhciBkcmFnSGFuZGxlT3B0aW9ucyA9IHtcbiAgICAgIERyYWdIYW5kbGVJbWFnZTogJ2ltYWdlcy9EcmFnSGFuZGxlV2hpdGUuZ2lmJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEltYWdlIGZvciBkZWZhdWx0IGRyYWcgaGFuZGxlXG4gICAgICBEcmFnSGFuZGxlSW1hZ2VBY3RpdmU6ICdpbWFnZXMvRHJhZ0hhbmRsZUdyZWVuLmdpZicsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJbWFnZSBmb3IgYWN0aXZlIGRyYWcgaGFuZGxlXG4gICAgICBEcmFnSGFuZGxlSW1hZ2VIZWlnaHQ6IDEwLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBIZWlnaHQgZm9yIGRlZmF1bHQgYW5kIGFjdGl2ZSBkcmFnIGhhbmRsZSBpbWFnZVxuICAgICAgRHJhZ0hhbmRsZUltYWdlV2lkdGg6IDEwLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2lkdGggZm9yIGRlZmF1bHQgYW5kIGFjdGl2ZSBkcmFnIGhhbmRsZSBpbWFnZVxuICAgICAgRHJhZ0hhbmRsZUltYWdlQW5jaG9yOiBuZXcgTWljcm9zb2Z0Lk1hcHMuUG9pbnQoNSwgNSksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQW5jaG9yIFBvaW50IGZvciBkcmFnIGhhbmRsZSBpbWFnZVxuICAgICAgc2hhcGVNYXNrU3Ryb2tlQ29sb3I6IG5ldyBNaWNyb3NvZnQuTWFwcy5Db2xvcigyMDAsIDEwMCwgMTAwLCAxMDApLCAgICAgICAgICAgICAgICAgLy8gTGluZSBjb2xvciBvZiBzaGFwZSBtYXNrXG4gICAgICBzaGFwZU1hc2tGaWxsQ29sb3I6IG5ldyBNaWNyb3NvZnQuTWFwcy5Db2xvcigwMDAsIDAwMCwgMDAwLCAwMDApLCAgICAgICAgICAgICAgICAgICAvLyBmaWxsIGNvbG9yIG9mIHNoYXBlIG1hc2sgKHBvbHlnb24gb25seSlcbiAgICAgIHNoYXBlTWFza1N0cm9rZVRoaWNrbmVzczogMiwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxpbmUgd2lkdGggb2Ygc2hhcGUgbWFza1xuICAgICAgc2hhcGVNYXNrU3Ryb2tlRGFzaEFycmF5OiAnMiAyJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZGFzaCBwYXR0ZXJuIG9mIHNoYXBlIG1hc2tcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEcmFnSGFuZGxlTGF5ZXIocG9seWdvbiwgZHJhZ0hhbmRsZU9wdGlvbnMpO1xuICB9LFxuXG4gIGRyYWdnYWJsZVN0YXJ0RHJhZ0hhbmRsZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICB0aGlzLnBvbHlnb24ub3JpZ0xvYyA9IHRoaXMuX21pY3Jvc29mdC50cnlQaXhlbFRvTG9jYXRpb24obmV3IE1pY3Jvc29mdC5NYXBzLlBvaW50KGUuZ2V0WCgpLCBlLmdldFkoKSkpO1xuICAgIHRoaXMucG9seWdvbi5kcmFnZ2luZyA9IHRydWU7XG4gIH0sXG5cbiAgZHJhZ2dhYmxlRHJhZ0hhbmRsZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAodGhpcy5wb2x5Z29uLmRyYWdnaW5nKSB7XG4gICAgICBpZihlLnRhcmdldFR5cGUgPT0gJ3BvbHlnb24nKSB7XG4gICAgICAgIHZhciBsb2MgPSB0aGlzLl9taWNyb3NvZnQudHJ5UGl4ZWxUb0xvY2F0aW9uKG5ldyBNaWNyb3NvZnQuTWFwcy5Qb2ludChlLmdldFgoKSwgZS5nZXRZKCkpKTtcbiAgICAgICAgdmFyIGxhdFZhcmlhbmNlID0gMDtcbiAgICAgICAgdmFyIGxvbmdWYXJpYW5jZSA9IDA7XG5cbiAgICAgICAgLy9kZXRlcm1pbmUgdmFyaWFuY2VcbiAgICAgICAgbGF0VmFyaWFuY2UgPSBsb2MubGF0aXR1ZGUgLSB0aGlzLnBvbHlnb24ub3JpZ0xvYy5sYXRpdHVkZTtcbiAgICAgICAgbG9uZ1ZhcmlhbmNlID0gbG9jLmxvbmdpdHVkZSAtIHRoaXMucG9seWdvbi5vcmlnTG9jLmxvbmdpdHVkZTtcblxuICAgICAgICB0aGlzLnBvbHlnb24ub3JpZ0xvYyA9IGxvYztcblxuICAgICAgICAvL2FkanVzdCBwb2ludHMgaW4gY3VycmVudCBzaGFwZVxuICAgICAgICB2YXIgY3VycmVudFBvaW50cyA9IGUudGFyZ2V0LmdldExvY2F0aW9ucygpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGN1cnJlbnRQb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjdXJyZW50UG9pbnRzW2ldLmxhdGl0dWRlICs9IGxhdFZhcmlhbmNlO1xuICAgICAgICAgIGN1cnJlbnRQb2ludHNbaV0ubG9uZ2l0dWRlICs9IGxvbmdWYXJpYW5jZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vc2V0IG5ldyBwb2ludHMgZm9yIHBvbHlnb25cbiAgICAgICAgZS50YXJnZXQuc2V0TG9jYXRpb25zKGN1cnJlbnRQb2ludHMpO1xuXG4gICAgICAgIHZhciBwb2ludHMgPSBjdXJyZW50UG9pbnRzO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZHJhZ0hhbmRsZUxheWVyLmRyYWdIYW5kbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdGhpcy5kcmFnSGFuZGxlTGF5ZXIuZHJhZ0hhbmRsZXNbaV0uc2V0TG9jYXRpb24ocG9pbnRzW2ldKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgZS5oYW5kbGVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnBvbHlnb24uZHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgZHJhZ2dhYmxlRW5kRHJhZ0hhbmRsZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICB0aGlzLnBvbHlnb24uZHJhZ2dpbmcgPSBmYWxzZTtcbiAgfSxcblxuICBnZXROU0VXOiBmdW5jdGlvbigpIHtcbiAgICBsb2NzID0gdGhpcy5wb2x5Z29uLl9taWNyb3NvZnQuZ2V0TG9jYXRpb25zKCk7XG4gICAgbGF0cyA9IF8ucGx1Y2sobG9jcywgJ2xhdGl0dWRlJyk7XG4gICAgbG9ucyA9IF8ucGx1Y2sobG9jcywgJ2xvbmdpdHVkZScpO1xuXG4gICAgdmFyIG4gPSByZWR1Y2VIZWxwZXIobGF0cywgKGdyZWF0ZXJUaGFuKSk7XG4gICAgdmFyIHMgPSByZWR1Y2VIZWxwZXIobGF0cywgbGVzc1RoYW4pO1xuICAgIHZhciBlID0gcmVkdWNlSGVscGVyKGxvbnMsIGdyZWF0ZXJUaGFuKTtcbiAgICB2YXIgdyA9IHJlZHVjZUhlbHBlcihsb25zLCBsZXNzVGhhbik7XG5cbiAgICByZXR1cm4ge246IG4sIHM6IHMsIGU6IGUsIHc6IHd9XG4gIH1cbn1cblxuLy9PaCBFUzYgaG93IEkgd2lzaCB5b3Ugd2VyZSBldmVyeXdoZXJlLi4uIChhLCBiKSA9PiBhID4gYlxuXG5mdW5jdGlvbiBncmVhdGVyVGhhbihhLCBiKSB7XG4gIHJldHVybiBhID4gYjtcbn1cblxuZnVuY3Rpb24gbGVzc1RoYW4oYSwgYikge1xuICByZXR1cm4gYSA8IGI7XG59XG5cbmZ1bmN0aW9uIHJlZHVjZUhlbHBlcihjb2wsIGNvbXBhcmVGdW5jKSB7XG4gIHJldHVybiBfLnJlZHVjZShjb2wsIGZ1bmN0aW9uKGFjYywgZWwpIHtcbiAgICByZXR1cm4gKGNvbXBhcmVGdW5jKGVsLCBhY2MpID8gZWwgOiBhY2MpXG4gIH0pXG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXA7IiwiZnVuY3Rpb24gUG9seWdvbih2ZXJ0aWNlcywgY29sb3IpIHtcbiAgdGhpcy5fbWljcm9zb2Z0ID0gbmV3IE1pY3Jvc29mdC5NYXBzLlBvbHlnb24odmVydGljZXMsIHtmaWxsQ29sb3I6IGNvbG9yLCBzdHJva2VDb2xvcjogY29sb3J9KTtcbiAgdGhpcy5vcmlnTG9jID0gLTE7XG4gIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQb2x5Z29uOyJdfQ==
