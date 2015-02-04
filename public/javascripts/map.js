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