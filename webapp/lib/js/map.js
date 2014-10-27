var map = null;

function createMap() {
  // Initialize the map
  map = new Microsoft.Maps.Map(document.getElementById("myMap"), {
    credentials: "AkTTTMQd-8LqyzdIwyo7y6Z5b4bOZf5KV92t7udePeDzZRp9lClaVY5c0UBrL6Xg",
    center: new Microsoft.Maps.Location(40, -105.27),
    zoom: 15
  });

  var rectangle = createRectangle();

  var dragHandles = createDragHandles(rectangle);
  var dragHandleEntityCollection = new Microsoft.Maps.EntityCollection();

  for (var i = 0; i < dragHandles.length; i++) { dragHandleEntityCollection.push(dragHandles[i]); }

  makeDraggable(rectangle, dragHandles);

  map.entities.push(rectangle);
  map.entities.push(dragHandleEntityCollection);

}

function createRectangle() {
  //points are counter-clockwise
  var vertices = [];
  vertices.push(new Microsoft.Maps.Location(40, -105.27));
  vertices.push(new Microsoft.Maps.Location(40, -105.26));
  vertices.push(new Microsoft.Maps.Location(40.01, -105.26));
  vertices.push(new Microsoft.Maps.Location(40.01, -105.27));

  var rectangleColor = new Microsoft.Maps.Color(100, 100, 0, 100);
  var rectangle = new Microsoft.Maps.Polygon(vertices, {
    fillColor: rectangleColor,
    strokeColor: rectangleColor
  });

  return rectangle;
}

function createDragHandles(rectangle) {
  var options = {
    DragHandleImage: '../../images/DragHandleWhite.gif', // Image for default drag handle
    DragHandleImageActive: '../../images/DragHandleGreen.gif' // Image for active drag handle
  }

  var rectanglePoints = rectangle.getLocations();
  var points = calculateDragHandlePoints();

  var dragHandles = [];
  var _pointIndex;

  for (i = 0; i < points.length; i++) {
    var dragHandle = new Microsoft.Maps.Pushpin(points[i], {
      draggable: true,
      icon: options.DragHandleImage,
      height: 10,
      width: 10,
      anchor: new Microsoft.Maps.Point(5, 5),
      typeName: 'DragHandle'
    });

    Microsoft.Maps.Events.addHandler(dragHandle, 'dragstart', StartDragHandler);
    Microsoft.Maps.Events.addHandler(dragHandle, 'drag', DragHandler);
    Microsoft.Maps.Events.addHandler(dragHandle, 'dragend', EndDragHandler);
    Microsoft.Maps.Events.addHandler(dragHandle, 'mouseover', MouseOverDragHandle);
    Microsoft.Maps.Events.addHandler(dragHandle, 'mouseout', MouseOutDragHandle);
    dragHandles.push(dragHandle);
  }

  return dragHandles;

  //mouseover event handler
  function MouseOverDragHandle(e) {
    //Update handle image
    e.target.setOptions({
      icon: options.DragHandleImageActive
    });
  }

  //mouseout event handler
  function MouseOutDragHandle(e) {
    //Update handle image
    e.target.setOptions({
      icon: options.DragHandleImage
    });
  }

  //drag start event handler
  function StartDragHandler(e) {
    var handleLocation = e.entity.getLocation();

    //Update handle image
    e.entity.setOptions({
      icon: options.DragHandleImageActive
    });

    //Determine point index
    for (i = 0; i <= (points.length - 1); i++) {
      if (handleLocation.latitude == points[i].latitude && handleLocation.longitude == points[i].longitude) {
        _pointIndex = i;
        break;
      }
    }
  }

  //drag event handler
  function DragHandler(e) {
    var loc = e.entity.getLocation();
    if (_pointIndex == 0) {
      rectanglePoints[0].latitude = loc.latitude;
      rectanglePoints[1].latitude = loc.latitude;
      dragHandles[0].setLocation(new Microsoft.Maps.Location(loc.latitude, points[0].longitude));
    }
    if (_pointIndex == 1) {
      rectanglePoints[1].longitude = loc.longitude;
      rectanglePoints[2].longitude = loc.longitude;
      dragHandles[1].setLocation(new Microsoft.Maps.Location(points[1].latitude, loc.longitude));
    }
    if (_pointIndex == 2) {
      rectanglePoints[2].latitude = loc.latitude;
      rectanglePoints[3].latitude = loc.latitude;
      dragHandles[2].setLocation(new Microsoft.Maps.Location(loc.latitude, points[2].longitude));

    }
    if (_pointIndex == 3) {
      rectanglePoints[3].longitude = loc.longitude;
      rectanglePoints[0].longitude = loc.longitude;
      dragHandles[3].setLocation(new Microsoft.Maps.Location(points[3].latitude, loc.longitude));
    }

    rectangle.setLocations(rectanglePoints);
  }

  //drag end event handler
  function EndDragHandler(e) {
    //Update handle image
    e.entity.setOptions({
      icon: options.DragHandleImage
    });

    //reset drag handle locations so they're centered
    points = calculateDragHandlePoints();

    for (var i = 0; i < dragHandles.length; i++) {
      dragHandles[i].setLocation(points[i]);
    }
  }

  function calculateDragHandlePoints() {
    var points = [];
    points[0] = new Microsoft.Maps.Location(rectanglePoints[0].latitude, (rectanglePoints[0].longitude + rectanglePoints[1].longitude) / 2);
    points[1] = new Microsoft.Maps.Location((rectanglePoints[1].latitude + rectanglePoints[2].latitude) / 2, rectanglePoints[1].longitude)
    points[2] = new Microsoft.Maps.Location(rectanglePoints[2].latitude, (rectanglePoints[2].longitude + rectanglePoints[3].longitude) / 2);
    points[3] = new Microsoft.Maps.Location((rectanglePoints[0].latitude + rectanglePoints[3].latitude) / 2, rectanglePoints[0].longitude)
    return points;
  }
}

function makeDraggable(rectangle, dragHandles) {

  Microsoft.Maps.Events.addHandler(rectangle, 'mousedown', DraggableStartDragHandler);
  Microsoft.Maps.Events.addHandler(map, 'mousemove', DraggableDragHandler);
  Microsoft.Maps.Events.addHandler(rectangle, 'mouseup', DraggableEndDragHandler);
  Microsoft.Maps.Events.addHandler(rectangle, 'mouseout', DraggableEndDragHandler);

  dragging = false;

  //mousedown handler
  function DraggableStartDragHandler(e) {
    dragging = true;
    previousLoc = map.tryPixelToLocation(new Microsoft.Maps.Point(e.getX(), e.getY()));
  }

  //mousemove handler
  function DraggableDragHandler(e) {
    if (dragging) {
      if (e.targetType == 'polygon') {
        var loc = map.tryPixelToLocation(new Microsoft.Maps.Point(e.getX(), e.getY()));
        var latVariance = 0;
        var longVariance = 0;

        //determine variance
        latVariance = loc.latitude - previousLoc.latitude;
        longVariance = loc.longitude - previousLoc.longitude;

        previousLoc = loc;

        //adjust points in current shape
        var currentPoints = e.target.getLocations();
        for (var i = 0; i < currentPoints.length; i++) {
          currentPoints[i].latitude += latVariance;
          currentPoints[i].longitude += longVariance;
        }

        //set new points for rectangle
        e.target.setLocations(currentPoints);

        e.handled = true;
      } else {
        dragging = false;
      }
    }
  }

  //mouseup & mouseout handler
  function DraggableEndDragHandler(e) {
    dragging = false;
    var rectanglePoints = e.target.getLocations();
    var points = [];
    points[0] = new Microsoft.Maps.Location(rectanglePoints[0].latitude, (rectanglePoints[0].longitude + rectanglePoints[1].longitude) / 2);
    //East
    points[1] = new Microsoft.Maps.Location((rectanglePoints[1].latitude + rectanglePoints[2].latitude) / 2, rectanglePoints[1].longitude)
    //North 
    points[2] = new Microsoft.Maps.Location(rectanglePoints[2].latitude, (rectanglePoints[2].longitude + rectanglePoints[3].longitude) / 2);
    //West
    points[3] = new Microsoft.Maps.Location((rectanglePoints[0].latitude + rectanglePoints[3].latitude) / 2, rectanglePoints[0].longitude);
    for (var i = 0; i < dragHandles.length; i++) {
      dragHandles[i].setLocation(points[i]);
    }
  }
}