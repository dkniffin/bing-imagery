function Polygon(vertices, color) {
  this._microsoft = new Microsoft.Maps.Polygon(vertices, {fillColor: color, strokeColor: color});
  this.origLoc = -1;
  this.dragging = false;
}

module.exports = Polygon;