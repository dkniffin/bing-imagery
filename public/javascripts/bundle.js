(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
Map = require('./map.js');
BI = require('./backend-interface.js');

var map = new Map(document.getElementById("myMap"), new Microsoft.Maps.Location(40, -105.27), 15);

document.getElementById("start").onclick = function() {
  //send stuff to the backend
  BI(map.getNSEW());
}
},{"./backend-interface.js":2,"./map.js":4}],2:[function(require,module,exports){
map = require('./map.js');
var socket = io('http://localhost');

function send(boundingBox) {
	// boundingBox should be an object like {top: <top>, bottom: <bottom>, left: <left>, right: <right>}

	socket.on('receiveDetection', function (data) {
		console.log(data);
	});
	// TODO: send lat/lon to backend
	// TODO: recieve data and/or images from backend
	//console.log(JSON.stringify(boundingBox));
	socket.emit('getDetection', boundingBox);
}

module.exports = send;
},{"./map.js":4}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
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
},{"./dragHandleLayer.js":3,"./polygon.js":5}],5:[function(require,module,exports){
function Polygon(vertices, color) {
  this._microsoft = new Microsoft.Maps.Polygon(vertices, {fillColor: color, strokeColor: color});
  this.origLoc = -1;
  this.dragging = false;
}

module.exports = Polygon;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcQXBwRGF0YVxcUm9hbWluZ1xcbnBtXFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9hcHAuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYmFja2VuZC1pbnRlcmZhY2UuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvZHJhZ0hhbmRsZUxheWVyLmpzIiwicHVibGljL2phdmFzY3JpcHRzL21hcC5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9wb2x5Z29uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIk1hcCA9IHJlcXVpcmUoJy4vbWFwLmpzJyk7XHJcbkJJID0gcmVxdWlyZSgnLi9iYWNrZW5kLWludGVyZmFjZS5qcycpO1xyXG5cclxudmFyIG1hcCA9IG5ldyBNYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJteU1hcFwiKSwgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQwLCAtMTA1LjI3KSwgMTUpO1xyXG5cclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFwiKS5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgLy9zZW5kIHN0dWZmIHRvIHRoZSBiYWNrZW5kXHJcbiAgQkkobWFwLmdldE5TRVcoKSk7XHJcbn0iLCJtYXAgPSByZXF1aXJlKCcuL21hcC5qcycpO1xyXG52YXIgc29ja2V0ID0gaW8oJ2h0dHA6Ly9sb2NhbGhvc3QnKTtcclxuXHJcbmZ1bmN0aW9uIHNlbmQoYm91bmRpbmdCb3gpIHtcclxuXHQvLyBib3VuZGluZ0JveCBzaG91bGQgYmUgYW4gb2JqZWN0IGxpa2Uge3RvcDogPHRvcD4sIGJvdHRvbTogPGJvdHRvbT4sIGxlZnQ6IDxsZWZ0PiwgcmlnaHQ6IDxyaWdodD59XHJcblxyXG5cdHNvY2tldC5vbigncmVjZWl2ZURldGVjdGlvbicsIGZ1bmN0aW9uIChkYXRhKSB7XHJcblx0XHRjb25zb2xlLmxvZyhkYXRhKTtcclxuXHR9KTtcclxuXHQvLyBUT0RPOiBzZW5kIGxhdC9sb24gdG8gYmFja2VuZFxyXG5cdC8vIFRPRE86IHJlY2lldmUgZGF0YSBhbmQvb3IgaW1hZ2VzIGZyb20gYmFja2VuZFxyXG5cdC8vY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoYm91bmRpbmdCb3gpKTtcclxuXHRzb2NrZXQuZW1pdCgnZ2V0RGV0ZWN0aW9uJywgYm91bmRpbmdCb3gpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHNlbmQ7IiwiZnVuY3Rpb24gRHJhZ0hhbmRsZUxheWVyKHBvbHlnb24sIG9wdGlvbnMpIHtcclxuICB0aGlzLnBvbHlnb24gPSBwb2x5Z29uO1xyXG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgdGhpcy5zZWxlY3RlZEhhbmRsZSA9IC0xO1xyXG4gIHRoaXMucG9seWdvblBvaW50cyA9IHRoaXMucG9seWdvbi5nZXRMb2NhdGlvbnMoKTtcclxuICB0aGlzLmRyYWdIYW5kbGVzID0gW107XHJcbiAgdGhpcy5fbWljcm9zb2Z0ID0gbmV3IE1pY3Jvc29mdC5NYXBzLkVudGl0eUNvbGxlY3Rpb24oKTs7XHJcblxyXG4gIHRoaXMuaW5pdCgpO1xyXG59XHJcblxyXG5EcmFnSGFuZGxlTGF5ZXIucHJvdG90eXBlID0ge1xyXG4gIGluaXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgZm9yIChpID0gMDsgaSA8IHRoaXMucG9seWdvblBvaW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgZHJhZ0hhbmRsZSA9IG5ldyBNaWNyb3NvZnQuTWFwcy5QdXNocGluKHRoaXMucG9seWdvblBvaW50c1tpXSwgeyBkcmFnZ2FibGU6IHRydWUsIGljb246ICdpbWFnZXMvRHJhZ0hhbmRsZVdoaXRlLmdpZicsIGhlaWdodDogdGhpcy5vcHRpb25zLkRyYWdIYW5kbGVJbWFnZUhlaWdodCwgd2lkdGg6IHRoaXMub3B0aW9ucy5EcmFnSGFuZGxlSW1hZ2VXaWR0aCwgYW5jaG9yOiB0aGlzLm9wdGlvbnMuRHJhZ0hhbmRsZUltYWdlQW5jaG9yLCB0eXBlTmFtZTogJ0JNX01vZHVsZV9EcmFnSGFuZGxlJyB9KTtcclxuICAgICAgTWljcm9zb2Z0Lk1hcHMuRXZlbnRzLmFkZEhhbmRsZXIoZHJhZ0hhbmRsZSwgJ2RyYWdzdGFydCcsIHRoaXMuc3RhcnREcmFnSGFuZGxlci5iaW5kKHRoaXMpKTtcclxuICAgICAgTWljcm9zb2Z0Lk1hcHMuRXZlbnRzLmFkZEhhbmRsZXIoZHJhZ0hhbmRsZSwgJ2RyYWcnLCB0aGlzLmRyYWdIYW5kbGVyLmJpbmQodGhpcykpO1xyXG4gICAgICBNaWNyb3NvZnQuTWFwcy5FdmVudHMuYWRkSGFuZGxlcihkcmFnSGFuZGxlLCAnZHJhZ2VuZCcsIHRoaXMuZW5kRHJhZ0hhbmRsZXIuYmluZCh0aGlzKSk7XHJcbiAgICAgIE1pY3Jvc29mdC5NYXBzLkV2ZW50cy5hZGRIYW5kbGVyKGRyYWdIYW5kbGUsICdtb3VzZW92ZXInLCB0aGlzLm1vdXNlT3ZlckRyYWdIYW5kbGUuYmluZCh0aGlzKSk7XHJcbiAgICAgIE1pY3Jvc29mdC5NYXBzLkV2ZW50cy5hZGRIYW5kbGVyKGRyYWdIYW5kbGUsICdtb3VzZW91dCcsIHRoaXMubW91c2VPdXREcmFnSGFuZGxlLmJpbmQodGhpcykpO1xyXG4gICAgICB0aGlzLl9taWNyb3NvZnQucHVzaChkcmFnSGFuZGxlKTtcclxuICAgICAgdGhpcy5kcmFnSGFuZGxlcy5wdXNoKGRyYWdIYW5kbGUpO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHN0YXJ0RHJhZ0hhbmRsZXI6IGZ1bmN0aW9uKGUpIHtcclxuICAgIHZhciBoYW5kbGVMb2NhdGlvbiA9IGUuZW50aXR5LmdldExvY2F0aW9uKCk7XHJcblxyXG4gICAgZm9yIChpID0gMDsgaSA8IHRoaXMuZHJhZ0hhbmRsZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKGhhbmRsZUxvY2F0aW9uID09IHRoaXMuZHJhZ0hhbmRsZXNbaV0uZ2V0TG9jYXRpb24oKSkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRIYW5kbGUgPSBpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgZHJhZ0hhbmRsZXI6IGZ1bmN0aW9uKGUpIHtcclxuICAgIHZhciBsb2MgPSBlLmVudGl0eS5nZXRMb2NhdGlvbigpO1xyXG5cclxuICAgIGlmICh0aGlzLnNlbGVjdGVkSGFuZGxlID09IDApIHtcclxuICAgICAgdGhpcy5wb2x5Z29uUG9pbnRzWzFdLmxhdGl0dWRlID0gbG9jLmxhdGl0dWRlO1xyXG4gICAgICB0aGlzLnBvbHlnb25Qb2ludHNbM10ubG9uZ2l0dWRlID0gbG9jLmxvbmdpdHVkZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5zZWxlY3RlZEhhbmRsZSA9PSAxKSB7XHJcbiAgICAgIHRoaXMucG9seWdvblBvaW50c1swXS5sYXRpdHVkZSA9IGxvYy5sYXRpdHVkZTtcclxuICAgICAgdGhpcy5wb2x5Z29uUG9pbnRzWzJdLmxvbmdpdHVkZSA9IGxvYy5sb25naXR1ZGU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuc2VsZWN0ZWRIYW5kbGUgPT0gMikge1xyXG4gICAgICB0aGlzLnBvbHlnb25Qb2ludHNbMV0ubG9uZ2l0dWRlID0gbG9jLmxvbmdpdHVkZTtcclxuICAgICAgdGhpcy5wb2x5Z29uUG9pbnRzWzNdLmxhdGl0dWRlID0gbG9jLmxhdGl0dWRlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLnNlbGVjdGVkSGFuZGxlID09IDMpIHtcclxuICAgICAgdGhpcy5wb2x5Z29uUG9pbnRzWzJdLmxhdGl0dWRlID0gbG9jLmxhdGl0dWRlO1xyXG4gICAgICB0aGlzLnBvbHlnb25Qb2ludHNbMF0ubG9uZ2l0dWRlID0gbG9jLmxvbmdpdHVkZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnBvbHlnb25Qb2ludHNbdGhpcy5zZWxlY3RlZEhhbmRsZV0ubGF0aXR1ZGUgPSBsb2MubGF0aXR1ZGU7XHJcbiAgICB0aGlzLnBvbHlnb25Qb2ludHNbdGhpcy5zZWxlY3RlZEhhbmRsZV0ubG9uZ2l0dWRlID0gbG9jLmxvbmdpdHVkZTtcclxuXHJcbiAgICBfLmVhY2godGhpcy5kcmFnSGFuZGxlcywgZnVuY3Rpb24oZHJhZ0hhbmRsZSwgaSkge1xyXG4gICAgICAgIGRyYWdIYW5kbGUuc2V0TG9jYXRpb24odGhpcy5wb2x5Z29uUG9pbnRzW2ldKTtcclxuICAgIH0sIHRoaXMpXHJcblxyXG5cclxuICAgIHRoaXMucG9seWdvbi5zZXRMb2NhdGlvbnModGhpcy5wb2x5Z29uUG9pbnRzKTtcclxuICB9LFxyXG5cclxuICBlbmREcmFnSGFuZGxlcjogZnVuY3Rpb24oZSkge1xyXG4gICAgZS5lbnRpdHkuc2V0T3B0aW9ucyh7IGljb246IHRoaXMub3B0aW9ucy5EcmFnSGFuZGxlSW1hZ2UgfSk7XHJcbiAgICBfLmVhY2godGhpcy5kcmFnSGFuZGxlcywgZnVuY3Rpb24oZHJhZ0hhbmRsZSwgaSkge1xyXG4gICAgICAgIGRyYWdIYW5kbGUuc2V0TG9jYXRpb24odGhpcy5wb2x5Z29uUG9pbnRzW2ldKTtcclxuICAgIH0sIHRoaXMpXHJcbiAgfSxcclxuXHJcbiAgbW91c2VPdmVyRHJhZ0hhbmRsZTogZnVuY3Rpb24oZSkge1xyXG4gICAgZS50YXJnZXQuc2V0T3B0aW9ucyh7IGljb246IHRoaXMub3B0aW9ucy5EcmFnSGFuZGxlSW1hZ2VBY3RpdmUgfSk7XHJcbiAgfSxcclxuXHJcbiAgbW91c2VPdXREcmFnSGFuZGxlOiBmdW5jdGlvbihlKSB7XHJcbiAgICBlLnRhcmdldC5zZXRPcHRpb25zKHsgaWNvbjogdGhpcy4gb3B0aW9ucy5EcmFnSGFuZGxlSW1hZ2UgfSk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEcmFnSGFuZGxlTGF5ZXI7IiwiUG9seWdvbiA9IHJlcXVpcmUoJy4vcG9seWdvbi5qcycpXHJcbkRyYWdIYW5kbGVMYXllciA9IHJlcXVpcmUoJy4vZHJhZ0hhbmRsZUxheWVyLmpzJylcclxuXHJcbmZ1bmN0aW9uIE1hcChlbCwgY2VudGVyLCB6b29tKSB7XHJcbiAgdGhpcy5fbWljcm9zb2Z0ID0gbmV3IE1pY3Jvc29mdC5NYXBzLk1hcChlbCwge1xyXG4gICAgY3JlZGVudGlhbHM6XCJBbzBwZ0tKaUV6VkVXS0NDaEhUQjVKQmV6VzlYdm9NNFdFU3BlWXl3ejh3Qlk5a2tXclpXTmRLQlptbXF6MjFZXCIsXHJcbiAgICBjZW50ZXI6IGNlbnRlcixcclxuICAgIHpvb206IHpvb21cclxuICB9KTtcclxuXHJcbiAgdGhpcy5wb2x5Z29uID0gdGhpcy5jcmVhdGVQb2x5Z29uKCk7XHJcbiAgdGhpcy5kcmFnSGFuZGxlTGF5ZXIgPSB0aGlzLmNyZWF0ZURyYWdIYW5kbGVMYXllcih0aGlzLnBvbHlnb24uX21pY3Jvc29mdCk7XHJcblxyXG4gIE1pY3Jvc29mdC5NYXBzLkV2ZW50cy5hZGRIYW5kbGVyKHRoaXMucG9seWdvbi5fbWljcm9zb2Z0LCAnbW91c2Vkb3duJywgdGhpcy5kcmFnZ2FibGVTdGFydERyYWdIYW5kbGVyLmJpbmQodGhpcykpO1xyXG4gIE1pY3Jvc29mdC5NYXBzLkV2ZW50cy5hZGRIYW5kbGVyKHRoaXMuX21pY3Jvc29mdCwgJ21vdXNlbW92ZScsIHRoaXMuZHJhZ2dhYmxlRHJhZ0hhbmRsZXIuYmluZCh0aGlzKSk7XHJcbiAgTWljcm9zb2Z0Lk1hcHMuRXZlbnRzLmFkZEhhbmRsZXIodGhpcy5wb2x5Z29uLl9taWNyb3NvZnQsICdtb3VzZXVwJywgdGhpcy5kcmFnZ2FibGVFbmREcmFnSGFuZGxlci5iaW5kKHRoaXMpKTtcclxuICBNaWNyb3NvZnQuTWFwcy5FdmVudHMuYWRkSGFuZGxlcih0aGlzLnBvbHlnb24uX21pY3Jvc29mdCwgJ21vdXNlb3V0JywgdGhpcy5kcmFnZ2FibGVFbmREcmFnSGFuZGxlci5iaW5kKHRoaXMpKTtcclxuICBNaWNyb3NvZnQuTWFwcy5FdmVudHMuYWRkSGFuZGxlcih0aGlzLl9taWNyb3NvZnQsICdtb3VzZW91dCcsIHRoaXMuZHJhZ2dhYmxlRW5kRHJhZ0hhbmRsZXIuYmluZCh0aGlzKSk7XHJcblxyXG5cclxuICB0aGlzLl9taWNyb3NvZnQuZW50aXRpZXMucHVzaCh0aGlzLnBvbHlnb24uX21pY3Jvc29mdCk7XHJcbiAgdGhpcy5fbWljcm9zb2Z0LmVudGl0aWVzLnB1c2godGhpcy5kcmFnSGFuZGxlTGF5ZXIuX21pY3Jvc29mdCk7XHJcbn1cclxuXHJcbk1hcC5wcm90b3R5cGUgPSB7XHJcbiAgY3JlYXRlUG9seWdvbjogZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbG9jYXRpb24xID0gbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQwLC0xMDUuMjcpO1xyXG4gICAgdmFyIGxvY2F0aW9uMiA9IG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0MCwtMTA1LjI2KTtcclxuICAgIHZhciBsb2NhdGlvbjMgPSBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDAuMDEsLTEwNS4yNik7XHJcbiAgICB2YXIgbG9jYXRpb240ID0gbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQwLjAxLC0xMDUuMjcpO1xyXG4gICAgcmV0dXJuIG5ldyBQb2x5Z29uKFtsb2NhdGlvbjEsIGxvY2F0aW9uMiwgbG9jYXRpb24zLCBsb2NhdGlvbjRdLCBuZXcgTWljcm9zb2Z0Lk1hcHMuQ29sb3IoMTAwLDEwMCwwLDEwMCkpO1xyXG5cclxuICB9LFxyXG4gIGNyZWF0ZURyYWdIYW5kbGVMYXllcjogZnVuY3Rpb24ocG9seWdvbikge1xyXG4gICAgdmFyIGRyYWdIYW5kbGVPcHRpb25zID0ge1xyXG4gICAgICBEcmFnSGFuZGxlSW1hZ2U6ICdpbWFnZXMvRHJhZ0hhbmRsZVdoaXRlLmdpZicsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJbWFnZSBmb3IgZGVmYXVsdCBkcmFnIGhhbmRsZVxyXG4gICAgICBEcmFnSGFuZGxlSW1hZ2VBY3RpdmU6ICdpbWFnZXMvRHJhZ0hhbmRsZUdyZWVuLmdpZicsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJbWFnZSBmb3IgYWN0aXZlIGRyYWcgaGFuZGxlXHJcbiAgICAgIERyYWdIYW5kbGVJbWFnZUhlaWdodDogMTAsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhlaWdodCBmb3IgZGVmYXVsdCBhbmQgYWN0aXZlIGRyYWcgaGFuZGxlIGltYWdlXHJcbiAgICAgIERyYWdIYW5kbGVJbWFnZVdpZHRoOiAxMCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdpZHRoIGZvciBkZWZhdWx0IGFuZCBhY3RpdmUgZHJhZyBoYW5kbGUgaW1hZ2VcclxuICAgICAgRHJhZ0hhbmRsZUltYWdlQW5jaG9yOiBuZXcgTWljcm9zb2Z0Lk1hcHMuUG9pbnQoNSwgNSksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQW5jaG9yIFBvaW50IGZvciBkcmFnIGhhbmRsZSBpbWFnZVxyXG4gICAgICBzaGFwZU1hc2tTdHJva2VDb2xvcjogbmV3IE1pY3Jvc29mdC5NYXBzLkNvbG9yKDIwMCwgMTAwLCAxMDAsIDEwMCksICAgICAgICAgICAgICAgICAvLyBMaW5lIGNvbG9yIG9mIHNoYXBlIG1hc2tcclxuICAgICAgc2hhcGVNYXNrRmlsbENvbG9yOiBuZXcgTWljcm9zb2Z0Lk1hcHMuQ29sb3IoMDAwLCAwMDAsIDAwMCwgMDAwKSwgICAgICAgICAgICAgICAgICAgLy8gZmlsbCBjb2xvciBvZiBzaGFwZSBtYXNrIChwb2x5Z29uIG9ubHkpXHJcbiAgICAgIHNoYXBlTWFza1N0cm9rZVRoaWNrbmVzczogMiwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxpbmUgd2lkdGggb2Ygc2hhcGUgbWFza1xyXG4gICAgICBzaGFwZU1hc2tTdHJva2VEYXNoQXJyYXk6ICcyIDInICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBkYXNoIHBhdHRlcm4gb2Ygc2hhcGUgbWFza1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBEcmFnSGFuZGxlTGF5ZXIocG9seWdvbiwgZHJhZ0hhbmRsZU9wdGlvbnMpO1xyXG4gIH0sXHJcblxyXG4gIGRyYWdnYWJsZVN0YXJ0RHJhZ0hhbmRsZXI6IGZ1bmN0aW9uKGUpIHtcclxuICAgIHRoaXMucG9seWdvbi5vcmlnTG9jID0gdGhpcy5fbWljcm9zb2Z0LnRyeVBpeGVsVG9Mb2NhdGlvbihuZXcgTWljcm9zb2Z0Lk1hcHMuUG9pbnQoZS5nZXRYKCksIGUuZ2V0WSgpKSk7XHJcbiAgICB0aGlzLnBvbHlnb24uZHJhZ2dpbmcgPSB0cnVlO1xyXG4gIH0sXHJcblxyXG4gIGRyYWdnYWJsZURyYWdIYW5kbGVyOiBmdW5jdGlvbihlKSB7XHJcbiAgICBpZiAodGhpcy5wb2x5Z29uLmRyYWdnaW5nKSB7XHJcbiAgICAgIGlmKGUudGFyZ2V0VHlwZSA9PSAncG9seWdvbicpIHtcclxuICAgICAgICB2YXIgbG9jID0gdGhpcy5fbWljcm9zb2Z0LnRyeVBpeGVsVG9Mb2NhdGlvbihuZXcgTWljcm9zb2Z0Lk1hcHMuUG9pbnQoZS5nZXRYKCksIGUuZ2V0WSgpKSk7XHJcbiAgICAgICAgdmFyIGxhdFZhcmlhbmNlID0gMDtcclxuICAgICAgICB2YXIgbG9uZ1ZhcmlhbmNlID0gMDtcclxuXHJcbiAgICAgICAgLy9kZXRlcm1pbmUgdmFyaWFuY2VcclxuICAgICAgICBsYXRWYXJpYW5jZSA9IGxvYy5sYXRpdHVkZSAtIHRoaXMucG9seWdvbi5vcmlnTG9jLmxhdGl0dWRlO1xyXG4gICAgICAgIGxvbmdWYXJpYW5jZSA9IGxvYy5sb25naXR1ZGUgLSB0aGlzLnBvbHlnb24ub3JpZ0xvYy5sb25naXR1ZGU7XHJcblxyXG4gICAgICAgIHRoaXMucG9seWdvbi5vcmlnTG9jID0gbG9jO1xyXG5cclxuICAgICAgICAvL2FkanVzdCBwb2ludHMgaW4gY3VycmVudCBzaGFwZVxyXG4gICAgICAgIHZhciBjdXJyZW50UG9pbnRzID0gZS50YXJnZXQuZ2V0TG9jYXRpb25zKCk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjdXJyZW50UG9pbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBjdXJyZW50UG9pbnRzW2ldLmxhdGl0dWRlICs9IGxhdFZhcmlhbmNlO1xyXG4gICAgICAgICAgY3VycmVudFBvaW50c1tpXS5sb25naXR1ZGUgKz0gbG9uZ1ZhcmlhbmNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9zZXQgbmV3IHBvaW50cyBmb3IgcG9seWdvblxyXG4gICAgICAgIGUudGFyZ2V0LnNldExvY2F0aW9ucyhjdXJyZW50UG9pbnRzKTtcclxuXHJcbiAgICAgICAgdmFyIHBvaW50cyA9IGN1cnJlbnRQb2ludHM7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRyYWdIYW5kbGVMYXllci5kcmFnSGFuZGxlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgdGhpcy5kcmFnSGFuZGxlTGF5ZXIuZHJhZ0hhbmRsZXNbaV0uc2V0TG9jYXRpb24ocG9pbnRzW2ldKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBlLmhhbmRsZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMucG9seWdvbi5kcmFnZ2luZyA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgZHJhZ2dhYmxlRW5kRHJhZ0hhbmRsZXI6IGZ1bmN0aW9uKGUpIHtcclxuICAgIHRoaXMucG9seWdvbi5kcmFnZ2luZyA9IGZhbHNlO1xyXG4gIH0sXHJcblxyXG4gIGdldE5TRVc6IGZ1bmN0aW9uKCkge1xyXG4gICAgbG9jcyA9IHRoaXMucG9seWdvbi5fbWljcm9zb2Z0LmdldExvY2F0aW9ucygpO1xyXG4gICAgbGF0cyA9IF8ucGx1Y2sobG9jcywgJ2xhdGl0dWRlJyk7XHJcbiAgICBsb25zID0gXy5wbHVjayhsb2NzLCAnbG9uZ2l0dWRlJyk7XHJcblxyXG4gICAgdmFyIG4gPSBfLnJlZHVjZShsYXRzLCBiaWdnZXN0KTtcclxuICAgIHZhciBzID0gXy5yZWR1Y2UobGF0cywgc21hbGxlc3QpO1xyXG4gICAgdmFyIGUgPSBfLnJlZHVjZShsb25zLCBiaWdnZXN0KTtcclxuICAgIHZhciB3ID0gXy5yZWR1Y2UobG9ucywgc21hbGxlc3QpO1xyXG5cclxuICAgIHJldHVybiB7bjogbiwgczogcywgZTogZSwgdzogd31cclxuICB9XHJcbn1cclxuXHJcbi8vT2ggRVM2IGhvdyBJIHdpc2ggeW91IHdlcmUgZXZlcnl3aGVyZS4uLiAoYSwgYikgPT4gYSA+IGJcclxuXHJcbmZ1bmN0aW9uIGJpZ2dlc3QoYWNjLCBlbCkge1xyXG4gIHJldHVybiAoZWwgPiBhY2MgPyBlbCA6IGFjYyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNtYWxsZXN0KGFjYywgZWwpIHtcclxuICByZXR1cm4gKGVsIDwgYWNjID8gZWwgOiBhY2MpO1xyXG59XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNYXA7IiwiZnVuY3Rpb24gUG9seWdvbih2ZXJ0aWNlcywgY29sb3IpIHtcclxuICB0aGlzLl9taWNyb3NvZnQgPSBuZXcgTWljcm9zb2Z0Lk1hcHMuUG9seWdvbih2ZXJ0aWNlcywge2ZpbGxDb2xvcjogY29sb3IsIHN0cm9rZUNvbG9yOiBjb2xvcn0pO1xyXG4gIHRoaXMub3JpZ0xvYyA9IC0xO1xyXG4gIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQb2x5Z29uOyJdfQ==
