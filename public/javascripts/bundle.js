(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"C:\\Users\\Derek\\Dropbox\\Projects\\bing-imagery\\public\\javascripts\\app.js":[function(require,module,exports){
// Map = require('./map.js');
bi = require('./backend-interface.js');

map.init();

function getQuadrant(num, rows, cols, pos) {
  if (rows === 1 || cols === 1) return pos;

  var row = Math.floor(num / rows);
  var col = num % cols;

  subRows = rows/2;
  subCols = cols/2;

  var quad = (col < subCols ? 0 : 1) + (row < subRows ? 0 : 2);
  num = col - (col >= subCols ? subCols : 0) + subRows * (row % subRows);

  return getQuadrant(num, subRows, subCols, pos += quad.toString());
}

function createModal(id) {
  var row;
  var modal = document.createElement('div');
  modal.id = id;
  modal.className = 'modal';

  for (var j = 0; j < 64; j++) {
    if (j % 8 === 0) {
      row = document.createElement('div');
      row.className = 'modalRow'
      modal.appendChild(row);
    }

    var modalImg = document.createElement('img');
    modalImg.src = "http://ecn.t1.tiles.virtualearth.net/tiles/hs0" + id + getQuadrant(j, 8, 8, '') +".jpg?g=2981&n=z"
    row.appendChild(modalImg);
  }

  document.body.insertBefore(modal, document.body.childNodes[0]);
  $('#' + id).easyModal({
    left: parseInt($('#main').css('left')),
    top: 0
  });
  $('#' + id).trigger('openModal');
}


document.getElementById("start").onclick = function() {

  // Object for storing detections
  // Should map cube_id to arrays of detections
  var detections = {}

  var type = 'faces';

  var data = map.getNSEW();
  data['type'] = type;
  //send stuff to the backend
  bi.send(data,function(detection){
    var base4_id_string = detection.cube_id.toString(4);

  	if (detections[detection.cube_id] == null) {
  		detections[detection.cube_id] = [];
  		var marker = map.addMarker(detection.cube_id,detection.lat,detection.lon);

			var popup = marker.bindPopup(function() {
        var content = '<div class="img_popup">'
        detections[detection.cube_id].forEach(function(d){
          var w = d.detect_coords.x_max - d.detect_coords.x_min;
          // var w = 50;
          var h = d.detect_coords.y_max - d.detect_coords.y_min;
          var top = d.detect_coords.y_min;
          var left = d.detect_coords.x_min;

          var end_w = 50; // Size of the displayed detection
          var scale = end_w/w; // How much to scale the image by to get the proper end-size

          var inline_css = 'width: ' + w * scale + ';';
          inline_css += 'height: ' + h * scale + ';';
          inline_css += 'background: url(' + d.url + ') ' + left + ' ' + top + ';'
          inline_css += 'background-size: ' + 256 * scale + 'px;'
          content += '<div class="popupImage" style="' + inline_css + '"></div>';
        });

        content += '</div>'
        return content;
      }).getPopup();

      popup.on('contentupdate', function() {
        var imgs = this._contentNode.getElementsByClassName('popupImage');
        for (var i = 0; i < imgs.length; i++) {
          imgs[i].onclick = function() {
            var url = this.style.backgroundImage;
            var direction = url.slice(url.indexOf('.jpg') - 5, url.indexOf('.jpg') - 3);
            var id = base4_id_string + direction;
            if (!document.getElementById(id)) {
              createModal(id);
            }
            else {
              $('#'+id).trigger('openModal');
            }
          }

        }
      })


  	}
  	detections[detection.cube_id].push(detection)


  });
}

},{"./backend-interface.js":"C:\\Users\\Derek\\Dropbox\\Projects\\bing-imagery\\public\\javascripts\\backend-interface.js"}],"C:\\Users\\Derek\\Dropbox\\Projects\\bing-imagery\\public\\javascripts\\backend-interface.js":[function(require,module,exports){
var socket = io('http://localhost');

var bi = {
	send: function send(data,cb) {
		// boundingBox should be an object like {top: <top>, bottom: <bottom>, left: <left>, right: <right>}

		socket.on('receiveDetection', cb);
		// TODO: send lat/lon to backend
		// TODO: recieve data and/or images from backend
		//console.log(JSON.stringify(boundingBox));
		socket.emit('getDetection', data);
	}
}

},{}]},{},["C:\\Users\\Derek\\Dropbox\\Projects\\bing-imagery\\public\\javascripts\\app.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXEFwcERhdGFcXFJvYW1pbmdcXG5wbVxcbm9kZV9tb2R1bGVzXFx3YXRjaGlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYXBwLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2JhY2tlbmQtaW50ZXJmYWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIE1hcCA9IHJlcXVpcmUoJy4vbWFwLmpzJyk7XHJcbmJpID0gcmVxdWlyZSgnLi9iYWNrZW5kLWludGVyZmFjZS5qcycpO1xyXG5cclxubWFwLmluaXQoKTtcclxuXHJcbmZ1bmN0aW9uIGdldFF1YWRyYW50KG51bSwgcm93cywgY29scywgcG9zKSB7XHJcbiAgaWYgKHJvd3MgPT09IDEgfHwgY29scyA9PT0gMSkgcmV0dXJuIHBvcztcclxuXHJcbiAgdmFyIHJvdyA9IE1hdGguZmxvb3IobnVtIC8gcm93cyk7XHJcbiAgdmFyIGNvbCA9IG51bSAlIGNvbHM7XHJcblxyXG4gIHN1YlJvd3MgPSByb3dzLzI7XHJcbiAgc3ViQ29scyA9IGNvbHMvMjtcclxuXHJcbiAgdmFyIHF1YWQgPSAoY29sIDwgc3ViQ29scyA/IDAgOiAxKSArIChyb3cgPCBzdWJSb3dzID8gMCA6IDIpO1xyXG4gIG51bSA9IGNvbCAtIChjb2wgPj0gc3ViQ29scyA/IHN1YkNvbHMgOiAwKSArIHN1YlJvd3MgKiAocm93ICUgc3ViUm93cyk7XHJcblxyXG4gIHJldHVybiBnZXRRdWFkcmFudChudW0sIHN1YlJvd3MsIHN1YkNvbHMsIHBvcyArPSBxdWFkLnRvU3RyaW5nKCkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVNb2RhbChpZCkge1xyXG4gIHZhciByb3c7XHJcbiAgdmFyIG1vZGFsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgbW9kYWwuaWQgPSBpZDtcclxuICBtb2RhbC5jbGFzc05hbWUgPSAnbW9kYWwnO1xyXG5cclxuICBmb3IgKHZhciBqID0gMDsgaiA8IDY0OyBqKyspIHtcclxuICAgIGlmIChqICUgOCA9PT0gMCkge1xyXG4gICAgICByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgcm93LmNsYXNzTmFtZSA9ICdtb2RhbFJvdydcclxuICAgICAgbW9kYWwuYXBwZW5kQ2hpbGQocm93KTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbW9kYWxJbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcclxuICAgIG1vZGFsSW1nLnNyYyA9IFwiaHR0cDovL2Vjbi50MS50aWxlcy52aXJ0dWFsZWFydGgubmV0L3RpbGVzL2hzMFwiICsgaWQgKyBnZXRRdWFkcmFudChqLCA4LCA4LCAnJykgK1wiLmpwZz9nPTI5ODEmbj16XCJcclxuICAgIHJvdy5hcHBlbmRDaGlsZChtb2RhbEltZyk7XHJcbiAgfVxyXG5cclxuICBkb2N1bWVudC5ib2R5Lmluc2VydEJlZm9yZShtb2RhbCwgZG9jdW1lbnQuYm9keS5jaGlsZE5vZGVzWzBdKTtcclxuICAkKCcjJyArIGlkKS5lYXN5TW9kYWwoe1xyXG4gICAgbGVmdDogcGFyc2VJbnQoJCgnI21haW4nKS5jc3MoJ2xlZnQnKSksXHJcbiAgICB0b3A6IDBcclxuICB9KTtcclxuICAkKCcjJyArIGlkKS50cmlnZ2VyKCdvcGVuTW9kYWwnKTtcclxufVxyXG5cclxuXHJcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRcIikub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAvLyBPYmplY3QgZm9yIHN0b3JpbmcgZGV0ZWN0aW9uc1xyXG4gIC8vIFNob3VsZCBtYXAgY3ViZV9pZCB0byBhcnJheXMgb2YgZGV0ZWN0aW9uc1xyXG4gIHZhciBkZXRlY3Rpb25zID0ge31cclxuXHJcbiAgdmFyIHR5cGUgPSAnZmFjZXMnO1xyXG5cclxuICB2YXIgZGF0YSA9IG1hcC5nZXROU0VXKCk7XHJcbiAgZGF0YVsndHlwZSddID0gdHlwZTtcclxuICAvL3NlbmQgc3R1ZmYgdG8gdGhlIGJhY2tlbmRcclxuICBiaS5zZW5kKGRhdGEsZnVuY3Rpb24oZGV0ZWN0aW9uKXtcclxuICAgIHZhciBiYXNlNF9pZF9zdHJpbmcgPSBkZXRlY3Rpb24uY3ViZV9pZC50b1N0cmluZyg0KTtcclxuXHJcbiAgXHRpZiAoZGV0ZWN0aW9uc1tkZXRlY3Rpb24uY3ViZV9pZF0gPT0gbnVsbCkge1xyXG4gIFx0XHRkZXRlY3Rpb25zW2RldGVjdGlvbi5jdWJlX2lkXSA9IFtdO1xyXG4gIFx0XHR2YXIgbWFya2VyID0gbWFwLmFkZE1hcmtlcihkZXRlY3Rpb24uY3ViZV9pZCxkZXRlY3Rpb24ubGF0LGRldGVjdGlvbi5sb24pO1xyXG5cclxuXHRcdFx0dmFyIHBvcHVwID0gbWFya2VyLmJpbmRQb3B1cChmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY29udGVudCA9ICc8ZGl2IGNsYXNzPVwiaW1nX3BvcHVwXCI+J1xyXG4gICAgICAgIGRldGVjdGlvbnNbZGV0ZWN0aW9uLmN1YmVfaWRdLmZvckVhY2goZnVuY3Rpb24oZCl7XHJcbiAgICAgICAgICB2YXIgdyA9IGQuZGV0ZWN0X2Nvb3Jkcy54X21heCAtIGQuZGV0ZWN0X2Nvb3Jkcy54X21pbjtcclxuICAgICAgICAgIC8vIHZhciB3ID0gNTA7XHJcbiAgICAgICAgICB2YXIgaCA9IGQuZGV0ZWN0X2Nvb3Jkcy55X21heCAtIGQuZGV0ZWN0X2Nvb3Jkcy55X21pbjtcclxuICAgICAgICAgIHZhciB0b3AgPSBkLmRldGVjdF9jb29yZHMueV9taW47XHJcbiAgICAgICAgICB2YXIgbGVmdCA9IGQuZGV0ZWN0X2Nvb3Jkcy54X21pbjtcclxuXHJcbiAgICAgICAgICB2YXIgZW5kX3cgPSA1MDsgLy8gU2l6ZSBvZiB0aGUgZGlzcGxheWVkIGRldGVjdGlvblxyXG4gICAgICAgICAgdmFyIHNjYWxlID0gZW5kX3cvdzsgLy8gSG93IG11Y2ggdG8gc2NhbGUgdGhlIGltYWdlIGJ5IHRvIGdldCB0aGUgcHJvcGVyIGVuZC1zaXplXHJcblxyXG4gICAgICAgICAgdmFyIGlubGluZV9jc3MgPSAnd2lkdGg6ICcgKyB3ICogc2NhbGUgKyAnOyc7XHJcbiAgICAgICAgICBpbmxpbmVfY3NzICs9ICdoZWlnaHQ6ICcgKyBoICogc2NhbGUgKyAnOyc7XHJcbiAgICAgICAgICBpbmxpbmVfY3NzICs9ICdiYWNrZ3JvdW5kOiB1cmwoJyArIGQudXJsICsgJykgJyArIGxlZnQgKyAnICcgKyB0b3AgKyAnOydcclxuICAgICAgICAgIGlubGluZV9jc3MgKz0gJ2JhY2tncm91bmQtc2l6ZTogJyArIDI1NiAqIHNjYWxlICsgJ3B4OydcclxuICAgICAgICAgIGNvbnRlbnQgKz0gJzxkaXYgY2xhc3M9XCJwb3B1cEltYWdlXCIgc3R5bGU9XCInICsgaW5saW5lX2NzcyArICdcIj48L2Rpdj4nO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb250ZW50ICs9ICc8L2Rpdj4nXHJcbiAgICAgICAgcmV0dXJuIGNvbnRlbnQ7XHJcbiAgICAgIH0pLmdldFBvcHVwKCk7XHJcblxyXG4gICAgICBwb3B1cC5vbignY29udGVudHVwZGF0ZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBpbWdzID0gdGhpcy5fY29udGVudE5vZGUuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncG9wdXBJbWFnZScpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1ncy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaW1nc1tpXS5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciB1cmwgPSB0aGlzLnN0eWxlLmJhY2tncm91bmRJbWFnZTtcclxuICAgICAgICAgICAgdmFyIGRpcmVjdGlvbiA9IHVybC5zbGljZSh1cmwuaW5kZXhPZignLmpwZycpIC0gNSwgdXJsLmluZGV4T2YoJy5qcGcnKSAtIDMpO1xyXG4gICAgICAgICAgICB2YXIgaWQgPSBiYXNlNF9pZF9zdHJpbmcgKyBkaXJlY3Rpb247XHJcbiAgICAgICAgICAgIGlmICghZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpKSB7XHJcbiAgICAgICAgICAgICAgY3JlYXRlTW9kYWwoaWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICQoJyMnK2lkKS50cmlnZ2VyKCdvcGVuTW9kYWwnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcblxyXG5cclxuICBcdH1cclxuICBcdGRldGVjdGlvbnNbZGV0ZWN0aW9uLmN1YmVfaWRdLnB1c2goZGV0ZWN0aW9uKVxyXG5cclxuXHJcbiAgfSk7XHJcbn1cclxuIiwidmFyIHNvY2tldCA9IGlvKCdodHRwOi8vbG9jYWxob3N0Jyk7XHJcblxyXG52YXIgYmkgPSB7XHJcblx0c2VuZDogZnVuY3Rpb24gc2VuZChkYXRhLGNiKSB7XHJcblx0XHQvLyBib3VuZGluZ0JveCBzaG91bGQgYmUgYW4gb2JqZWN0IGxpa2Uge3RvcDogPHRvcD4sIGJvdHRvbTogPGJvdHRvbT4sIGxlZnQ6IDxsZWZ0PiwgcmlnaHQ6IDxyaWdodD59XHJcblxyXG5cdFx0c29ja2V0Lm9uKCdyZWNlaXZlRGV0ZWN0aW9uJywgY2IpO1xyXG5cdFx0Ly8gVE9ETzogc2VuZCBsYXQvbG9uIHRvIGJhY2tlbmRcclxuXHRcdC8vIFRPRE86IHJlY2lldmUgZGF0YSBhbmQvb3IgaW1hZ2VzIGZyb20gYmFja2VuZFxyXG5cdFx0Ly9jb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShib3VuZGluZ0JveCkpO1xyXG5cdFx0c29ja2V0LmVtaXQoJ2dldERldGVjdGlvbicsIGRhdGEpO1xyXG5cdH1cclxufVxyXG4iXX0=
