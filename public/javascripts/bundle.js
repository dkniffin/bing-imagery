(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/rgreen/bing-imagery/public/javascripts/app.js":[function(require,module,exports){
Map = require('./map.js');

var map = new Map(document.getElementById("myMap"), new Microsoft.Maps.Location(40, -105.27), 15);

document.getElementById("start").onclick = function() {
  //send stuff to the backend
  alert(JSON.stringify(map.getNSEW()));
}
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

    var n = _.reduce(lats, biggest);
    var s = _.reduce(lats, smallest);
    var e = _.reduce(lons, biggest);
    var w = _.reduce(lons, smallest);

    return {n: n, s: s, e: e, w: w}
  }
}

//Oh ES6 how I wish you were everywhere... (a, b) => a > b

function biggest(acc, el) {
  return (el > acc ? el : acc);
}

function smallest(acc, el) {
  return (el < acc ? el : acc);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYXBwLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2RyYWdIYW5kbGVMYXllci5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9tYXAuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvcG9seWdvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiTWFwID0gcmVxdWlyZSgnLi9tYXAuanMnKTtcblxudmFyIG1hcCA9IG5ldyBNYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJteU1hcFwiKSwgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQwLCAtMTA1LjI3KSwgMTUpO1xuXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0XCIpLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgLy9zZW5kIHN0dWZmIHRvIHRoZSBiYWNrZW5kXG4gIGFsZXJ0KEpTT04uc3RyaW5naWZ5KG1hcC5nZXROU0VXKCkpKTtcbn0iLCJmdW5jdGlvbiBEcmFnSGFuZGxlTGF5ZXIocG9seWdvbiwgb3B0aW9ucykge1xuICB0aGlzLnBvbHlnb24gPSBwb2x5Z29uO1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB0aGlzLnNlbGVjdGVkSGFuZGxlID0gLTE7XG4gIHRoaXMucG9seWdvblBvaW50cyA9IHRoaXMucG9seWdvbi5nZXRMb2NhdGlvbnMoKTtcbiAgdGhpcy5kcmFnSGFuZGxlcyA9IFtdO1xuICB0aGlzLl9taWNyb3NvZnQgPSBuZXcgTWljcm9zb2Z0Lk1hcHMuRW50aXR5Q29sbGVjdGlvbigpOztcblxuICB0aGlzLmluaXQoKTtcbn1cblxuRHJhZ0hhbmRsZUxheWVyLnByb3RvdHlwZSA9IHtcbiAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IHRoaXMucG9seWdvblBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRyYWdIYW5kbGUgPSBuZXcgTWljcm9zb2Z0Lk1hcHMuUHVzaHBpbih0aGlzLnBvbHlnb25Qb2ludHNbaV0sIHsgZHJhZ2dhYmxlOiB0cnVlLCBpY29uOiAnaW1hZ2VzL0RyYWdIYW5kbGVXaGl0ZS5naWYnLCBoZWlnaHQ6IHRoaXMub3B0aW9ucy5EcmFnSGFuZGxlSW1hZ2VIZWlnaHQsIHdpZHRoOiB0aGlzLm9wdGlvbnMuRHJhZ0hhbmRsZUltYWdlV2lkdGgsIGFuY2hvcjogdGhpcy5vcHRpb25zLkRyYWdIYW5kbGVJbWFnZUFuY2hvciwgdHlwZU5hbWU6ICdCTV9Nb2R1bGVfRHJhZ0hhbmRsZScgfSk7XG4gICAgICBNaWNyb3NvZnQuTWFwcy5FdmVudHMuYWRkSGFuZGxlcihkcmFnSGFuZGxlLCAnZHJhZ3N0YXJ0JywgdGhpcy5zdGFydERyYWdIYW5kbGVyLmJpbmQodGhpcykpO1xuICAgICAgTWljcm9zb2Z0Lk1hcHMuRXZlbnRzLmFkZEhhbmRsZXIoZHJhZ0hhbmRsZSwgJ2RyYWcnLCB0aGlzLmRyYWdIYW5kbGVyLmJpbmQodGhpcykpO1xuICAgICAgTWljcm9zb2Z0Lk1hcHMuRXZlbnRzLmFkZEhhbmRsZXIoZHJhZ0hhbmRsZSwgJ2RyYWdlbmQnLCB0aGlzLmVuZERyYWdIYW5kbGVyLmJpbmQodGhpcykpO1xuICAgICAgTWljcm9zb2Z0Lk1hcHMuRXZlbnRzLmFkZEhhbmRsZXIoZHJhZ0hhbmRsZSwgJ21vdXNlb3ZlcicsIHRoaXMubW91c2VPdmVyRHJhZ0hhbmRsZS5iaW5kKHRoaXMpKTtcbiAgICAgIE1pY3Jvc29mdC5NYXBzLkV2ZW50cy5hZGRIYW5kbGVyKGRyYWdIYW5kbGUsICdtb3VzZW91dCcsIHRoaXMubW91c2VPdXREcmFnSGFuZGxlLmJpbmQodGhpcykpO1xuICAgICAgdGhpcy5fbWljcm9zb2Z0LnB1c2goZHJhZ0hhbmRsZSk7XG4gICAgICB0aGlzLmRyYWdIYW5kbGVzLnB1c2goZHJhZ0hhbmRsZSk7XG4gICAgfVxuICB9LFxuXG4gIHN0YXJ0RHJhZ0hhbmRsZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgaGFuZGxlTG9jYXRpb24gPSBlLmVudGl0eS5nZXRMb2NhdGlvbigpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IHRoaXMuZHJhZ0hhbmRsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChoYW5kbGVMb2NhdGlvbiA9PSB0aGlzLmRyYWdIYW5kbGVzW2ldLmdldExvY2F0aW9uKCkpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZEhhbmRsZSA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBkcmFnSGFuZGxlcjogZnVuY3Rpb24oZSkge1xuICAgIHZhciBsb2MgPSBlLmVudGl0eS5nZXRMb2NhdGlvbigpO1xuXG4gICAgaWYgKHRoaXMuc2VsZWN0ZWRIYW5kbGUgPT0gMCkge1xuICAgICAgdGhpcy5wb2x5Z29uUG9pbnRzWzFdLmxhdGl0dWRlID0gbG9jLmxhdGl0dWRlO1xuICAgICAgdGhpcy5wb2x5Z29uUG9pbnRzWzNdLmxvbmdpdHVkZSA9IGxvYy5sb25naXR1ZGU7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2VsZWN0ZWRIYW5kbGUgPT0gMSkge1xuICAgICAgdGhpcy5wb2x5Z29uUG9pbnRzWzBdLmxhdGl0dWRlID0gbG9jLmxhdGl0dWRlO1xuICAgICAgdGhpcy5wb2x5Z29uUG9pbnRzWzJdLmxvbmdpdHVkZSA9IGxvYy5sb25naXR1ZGU7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2VsZWN0ZWRIYW5kbGUgPT0gMikge1xuICAgICAgdGhpcy5wb2x5Z29uUG9pbnRzWzFdLmxvbmdpdHVkZSA9IGxvYy5sb25naXR1ZGU7XG4gICAgICB0aGlzLnBvbHlnb25Qb2ludHNbM10ubGF0aXR1ZGUgPSBsb2MubGF0aXR1ZGU7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2VsZWN0ZWRIYW5kbGUgPT0gMykge1xuICAgICAgdGhpcy5wb2x5Z29uUG9pbnRzWzJdLmxhdGl0dWRlID0gbG9jLmxhdGl0dWRlO1xuICAgICAgdGhpcy5wb2x5Z29uUG9pbnRzWzBdLmxvbmdpdHVkZSA9IGxvYy5sb25naXR1ZGU7XG4gICAgfVxuXG4gICAgdGhpcy5wb2x5Z29uUG9pbnRzW3RoaXMuc2VsZWN0ZWRIYW5kbGVdLmxhdGl0dWRlID0gbG9jLmxhdGl0dWRlO1xuICAgIHRoaXMucG9seWdvblBvaW50c1t0aGlzLnNlbGVjdGVkSGFuZGxlXS5sb25naXR1ZGUgPSBsb2MubG9uZ2l0dWRlO1xuXG4gICAgXy5lYWNoKHRoaXMuZHJhZ0hhbmRsZXMsIGZ1bmN0aW9uKGRyYWdIYW5kbGUsIGkpIHtcbiAgICAgICAgZHJhZ0hhbmRsZS5zZXRMb2NhdGlvbih0aGlzLnBvbHlnb25Qb2ludHNbaV0pO1xuICAgIH0sIHRoaXMpXG5cblxuICAgIHRoaXMucG9seWdvbi5zZXRMb2NhdGlvbnModGhpcy5wb2x5Z29uUG9pbnRzKTtcbiAgfSxcblxuICBlbmREcmFnSGFuZGxlcjogZnVuY3Rpb24oZSkge1xuICAgIGUuZW50aXR5LnNldE9wdGlvbnMoeyBpY29uOiB0aGlzLm9wdGlvbnMuRHJhZ0hhbmRsZUltYWdlIH0pO1xuICAgIF8uZWFjaCh0aGlzLmRyYWdIYW5kbGVzLCBmdW5jdGlvbihkcmFnSGFuZGxlLCBpKSB7XG4gICAgICAgIGRyYWdIYW5kbGUuc2V0TG9jYXRpb24odGhpcy5wb2x5Z29uUG9pbnRzW2ldKTtcbiAgICB9LCB0aGlzKVxuICB9LFxuXG4gIG1vdXNlT3ZlckRyYWdIYW5kbGU6IGZ1bmN0aW9uKGUpIHtcbiAgICBlLnRhcmdldC5zZXRPcHRpb25zKHsgaWNvbjogdGhpcy5vcHRpb25zLkRyYWdIYW5kbGVJbWFnZUFjdGl2ZSB9KTtcbiAgfSxcblxuICBtb3VzZU91dERyYWdIYW5kbGU6IGZ1bmN0aW9uKGUpIHtcbiAgICBlLnRhcmdldC5zZXRPcHRpb25zKHsgaWNvbjogdGhpcy4gb3B0aW9ucy5EcmFnSGFuZGxlSW1hZ2UgfSk7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERyYWdIYW5kbGVMYXllcjsiLCJQb2x5Z29uID0gcmVxdWlyZSgnLi9wb2x5Z29uLmpzJylcbkRyYWdIYW5kbGVMYXllciA9IHJlcXVpcmUoJy4vZHJhZ0hhbmRsZUxheWVyLmpzJylcblxuZnVuY3Rpb24gTWFwKGVsLCBjZW50ZXIsIHpvb20pIHtcbiAgdGhpcy5fbWljcm9zb2Z0ID0gbmV3IE1pY3Jvc29mdC5NYXBzLk1hcChlbCwge1xuICAgIGNyZWRlbnRpYWxzOlwiQW8wcGdLSmlFelZFV0tDQ2hIVEI1SkJlelc5WHZvTTRXRVNwZVl5d3o4d0JZOWtrV3JaV05kS0JabW1xejIxWVwiLFxuICAgIGNlbnRlcjogY2VudGVyLFxuICAgIHpvb206IHpvb21cbiAgfSk7XG5cbiAgdGhpcy5wb2x5Z29uID0gdGhpcy5jcmVhdGVQb2x5Z29uKCk7XG4gIHRoaXMuZHJhZ0hhbmRsZUxheWVyID0gdGhpcy5jcmVhdGVEcmFnSGFuZGxlTGF5ZXIodGhpcy5wb2x5Z29uLl9taWNyb3NvZnQpO1xuXG4gIE1pY3Jvc29mdC5NYXBzLkV2ZW50cy5hZGRIYW5kbGVyKHRoaXMucG9seWdvbi5fbWljcm9zb2Z0LCAnbW91c2Vkb3duJywgdGhpcy5kcmFnZ2FibGVTdGFydERyYWdIYW5kbGVyLmJpbmQodGhpcykpO1xuICBNaWNyb3NvZnQuTWFwcy5FdmVudHMuYWRkSGFuZGxlcih0aGlzLl9taWNyb3NvZnQsICdtb3VzZW1vdmUnLCB0aGlzLmRyYWdnYWJsZURyYWdIYW5kbGVyLmJpbmQodGhpcykpO1xuICBNaWNyb3NvZnQuTWFwcy5FdmVudHMuYWRkSGFuZGxlcih0aGlzLnBvbHlnb24uX21pY3Jvc29mdCwgJ21vdXNldXAnLCB0aGlzLmRyYWdnYWJsZUVuZERyYWdIYW5kbGVyLmJpbmQodGhpcykpO1xuICBNaWNyb3NvZnQuTWFwcy5FdmVudHMuYWRkSGFuZGxlcih0aGlzLnBvbHlnb24uX21pY3Jvc29mdCwgJ21vdXNlb3V0JywgdGhpcy5kcmFnZ2FibGVFbmREcmFnSGFuZGxlci5iaW5kKHRoaXMpKTtcbiAgTWljcm9zb2Z0Lk1hcHMuRXZlbnRzLmFkZEhhbmRsZXIodGhpcy5fbWljcm9zb2Z0LCAnbW91c2VvdXQnLCB0aGlzLmRyYWdnYWJsZUVuZERyYWdIYW5kbGVyLmJpbmQodGhpcykpO1xuXG5cbiAgdGhpcy5fbWljcm9zb2Z0LmVudGl0aWVzLnB1c2godGhpcy5wb2x5Z29uLl9taWNyb3NvZnQpO1xuICB0aGlzLl9taWNyb3NvZnQuZW50aXRpZXMucHVzaCh0aGlzLmRyYWdIYW5kbGVMYXllci5fbWljcm9zb2Z0KTtcbn1cblxuTWFwLnByb3RvdHlwZSA9IHtcbiAgY3JlYXRlUG9seWdvbjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxvY2F0aW9uMSA9IG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0MCwtMTA1LjI3KTtcbiAgICB2YXIgbG9jYXRpb24yID0gbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQwLC0xMDUuMjYpO1xuICAgIHZhciBsb2NhdGlvbjMgPSBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDAuMDEsLTEwNS4yNik7XG4gICAgdmFyIGxvY2F0aW9uNCA9IG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0MC4wMSwtMTA1LjI3KTtcbiAgICByZXR1cm4gbmV3IFBvbHlnb24oW2xvY2F0aW9uMSwgbG9jYXRpb24yLCBsb2NhdGlvbjMsIGxvY2F0aW9uNF0sIG5ldyBNaWNyb3NvZnQuTWFwcy5Db2xvcigxMDAsMTAwLDAsMTAwKSk7XG5cbiAgfSxcbiAgY3JlYXRlRHJhZ0hhbmRsZUxheWVyOiBmdW5jdGlvbihwb2x5Z29uKSB7XG4gICAgdmFyIGRyYWdIYW5kbGVPcHRpb25zID0ge1xuICAgICAgRHJhZ0hhbmRsZUltYWdlOiAnaW1hZ2VzL0RyYWdIYW5kbGVXaGl0ZS5naWYnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW1hZ2UgZm9yIGRlZmF1bHQgZHJhZyBoYW5kbGVcbiAgICAgIERyYWdIYW5kbGVJbWFnZUFjdGl2ZTogJ2ltYWdlcy9EcmFnSGFuZGxlR3JlZW4uZ2lmJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEltYWdlIGZvciBhY3RpdmUgZHJhZyBoYW5kbGVcbiAgICAgIERyYWdIYW5kbGVJbWFnZUhlaWdodDogMTAsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhlaWdodCBmb3IgZGVmYXVsdCBhbmQgYWN0aXZlIGRyYWcgaGFuZGxlIGltYWdlXG4gICAgICBEcmFnSGFuZGxlSW1hZ2VXaWR0aDogMTAsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXaWR0aCBmb3IgZGVmYXVsdCBhbmQgYWN0aXZlIGRyYWcgaGFuZGxlIGltYWdlXG4gICAgICBEcmFnSGFuZGxlSW1hZ2VBbmNob3I6IG5ldyBNaWNyb3NvZnQuTWFwcy5Qb2ludCg1LCA1KSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBbmNob3IgUG9pbnQgZm9yIGRyYWcgaGFuZGxlIGltYWdlXG4gICAgICBzaGFwZU1hc2tTdHJva2VDb2xvcjogbmV3IE1pY3Jvc29mdC5NYXBzLkNvbG9yKDIwMCwgMTAwLCAxMDAsIDEwMCksICAgICAgICAgICAgICAgICAvLyBMaW5lIGNvbG9yIG9mIHNoYXBlIG1hc2tcbiAgICAgIHNoYXBlTWFza0ZpbGxDb2xvcjogbmV3IE1pY3Jvc29mdC5NYXBzLkNvbG9yKDAwMCwgMDAwLCAwMDAsIDAwMCksICAgICAgICAgICAgICAgICAgIC8vIGZpbGwgY29sb3Igb2Ygc2hhcGUgbWFzayAocG9seWdvbiBvbmx5KVxuICAgICAgc2hhcGVNYXNrU3Ryb2tlVGhpY2tuZXNzOiAyLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGluZSB3aWR0aCBvZiBzaGFwZSBtYXNrXG4gICAgICBzaGFwZU1hc2tTdHJva2VEYXNoQXJyYXk6ICcyIDInICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBkYXNoIHBhdHRlcm4gb2Ygc2hhcGUgbWFza1xuICAgIH1cbiAgICByZXR1cm4gbmV3IERyYWdIYW5kbGVMYXllcihwb2x5Z29uLCBkcmFnSGFuZGxlT3B0aW9ucyk7XG4gIH0sXG5cbiAgZHJhZ2dhYmxlU3RhcnREcmFnSGFuZGxlcjogZnVuY3Rpb24oZSkge1xuICAgIHRoaXMucG9seWdvbi5vcmlnTG9jID0gdGhpcy5fbWljcm9zb2Z0LnRyeVBpeGVsVG9Mb2NhdGlvbihuZXcgTWljcm9zb2Z0Lk1hcHMuUG9pbnQoZS5nZXRYKCksIGUuZ2V0WSgpKSk7XG4gICAgdGhpcy5wb2x5Z29uLmRyYWdnaW5nID0gdHJ1ZTtcbiAgfSxcblxuICBkcmFnZ2FibGVEcmFnSGFuZGxlcjogZnVuY3Rpb24oZSkge1xuICAgIGlmICh0aGlzLnBvbHlnb24uZHJhZ2dpbmcpIHtcbiAgICAgIGlmKGUudGFyZ2V0VHlwZSA9PSAncG9seWdvbicpIHtcbiAgICAgICAgdmFyIGxvYyA9IHRoaXMuX21pY3Jvc29mdC50cnlQaXhlbFRvTG9jYXRpb24obmV3IE1pY3Jvc29mdC5NYXBzLlBvaW50KGUuZ2V0WCgpLCBlLmdldFkoKSkpO1xuICAgICAgICB2YXIgbGF0VmFyaWFuY2UgPSAwO1xuICAgICAgICB2YXIgbG9uZ1ZhcmlhbmNlID0gMDtcblxuICAgICAgICAvL2RldGVybWluZSB2YXJpYW5jZVxuICAgICAgICBsYXRWYXJpYW5jZSA9IGxvYy5sYXRpdHVkZSAtIHRoaXMucG9seWdvbi5vcmlnTG9jLmxhdGl0dWRlO1xuICAgICAgICBsb25nVmFyaWFuY2UgPSBsb2MubG9uZ2l0dWRlIC0gdGhpcy5wb2x5Z29uLm9yaWdMb2MubG9uZ2l0dWRlO1xuXG4gICAgICAgIHRoaXMucG9seWdvbi5vcmlnTG9jID0gbG9jO1xuXG4gICAgICAgIC8vYWRqdXN0IHBvaW50cyBpbiBjdXJyZW50IHNoYXBlXG4gICAgICAgIHZhciBjdXJyZW50UG9pbnRzID0gZS50YXJnZXQuZ2V0TG9jYXRpb25zKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY3VycmVudFBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGN1cnJlbnRQb2ludHNbaV0ubGF0aXR1ZGUgKz0gbGF0VmFyaWFuY2U7XG4gICAgICAgICAgY3VycmVudFBvaW50c1tpXS5sb25naXR1ZGUgKz0gbG9uZ1ZhcmlhbmNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9zZXQgbmV3IHBvaW50cyBmb3IgcG9seWdvblxuICAgICAgICBlLnRhcmdldC5zZXRMb2NhdGlvbnMoY3VycmVudFBvaW50cyk7XG5cbiAgICAgICAgdmFyIHBvaW50cyA9IGN1cnJlbnRQb2ludHM7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kcmFnSGFuZGxlTGF5ZXIuZHJhZ0hhbmRsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0aGlzLmRyYWdIYW5kbGVMYXllci5kcmFnSGFuZGxlc1tpXS5zZXRMb2NhdGlvbihwb2ludHNbaV0pO1xuICAgICAgICB9XG5cblxuICAgICAgICBlLmhhbmRsZWQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMucG9seWdvbi5kcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBkcmFnZ2FibGVFbmREcmFnSGFuZGxlcjogZnVuY3Rpb24oZSkge1xuICAgIHRoaXMucG9seWdvbi5kcmFnZ2luZyA9IGZhbHNlO1xuICB9LFxuXG4gIGdldE5TRVc6IGZ1bmN0aW9uKCkge1xuICAgIGxvY3MgPSB0aGlzLnBvbHlnb24uX21pY3Jvc29mdC5nZXRMb2NhdGlvbnMoKTtcbiAgICBsYXRzID0gXy5wbHVjayhsb2NzLCAnbGF0aXR1ZGUnKTtcbiAgICBsb25zID0gXy5wbHVjayhsb2NzLCAnbG9uZ2l0dWRlJyk7XG5cbiAgICB2YXIgbiA9IF8ucmVkdWNlKGxhdHMsIGJpZ2dlc3QpO1xuICAgIHZhciBzID0gXy5yZWR1Y2UobGF0cywgc21hbGxlc3QpO1xuICAgIHZhciBlID0gXy5yZWR1Y2UobG9ucywgYmlnZ2VzdCk7XG4gICAgdmFyIHcgPSBfLnJlZHVjZShsb25zLCBzbWFsbGVzdCk7XG5cbiAgICByZXR1cm4ge246IG4sIHM6IHMsIGU6IGUsIHc6IHd9XG4gIH1cbn1cblxuLy9PaCBFUzYgaG93IEkgd2lzaCB5b3Ugd2VyZSBldmVyeXdoZXJlLi4uIChhLCBiKSA9PiBhID4gYlxuXG5mdW5jdGlvbiBiaWdnZXN0KGFjYywgZWwpIHtcbiAgcmV0dXJuIChlbCA+IGFjYyA/IGVsIDogYWNjKTtcbn1cblxuZnVuY3Rpb24gc21hbGxlc3QoYWNjLCBlbCkge1xuICByZXR1cm4gKGVsIDwgYWNjID8gZWwgOiBhY2MpO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwOyIsImZ1bmN0aW9uIFBvbHlnb24odmVydGljZXMsIGNvbG9yKSB7XG4gIHRoaXMuX21pY3Jvc29mdCA9IG5ldyBNaWNyb3NvZnQuTWFwcy5Qb2x5Z29uKHZlcnRpY2VzLCB7ZmlsbENvbG9yOiBjb2xvciwgc3Ryb2tlQ29sb3I6IGNvbG9yfSk7XG4gIHRoaXMub3JpZ0xvYyA9IC0xO1xuICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUG9seWdvbjsiXX0=
