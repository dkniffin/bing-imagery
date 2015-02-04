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