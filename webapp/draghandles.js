* Website: http://www.garzilla.net/vemaps
* Date: 22 Aug 2011
* 
* Description: 
* This module allows a given polyline or polygon to be edited.  In passing the
* shape to this module, drag handles are added to each respective point in the
* shape.  These drag handles can then be used to modify the points of the shape
* by dragging them to a new location on the map.
* 
* Usage:
*
* To implement the module:
*   // Register and load a new module
*   Microsoft.Maps.registerModule("DragHandles", "your-path-to/DragHandleModule.js");
*   Microsoft.Maps.loadModule("DragHandles", { callback: myModuleLoaded });
*
* Call back function to initialize:
*   function myModuleLoaded() {
*       myDragHandleModule = new dragHandleModule(map, options);
*   }
*
*   "options" parameter is optional and for a full list of supported options see the
*   the "Default Options" section in the code.
*
* To activate drag handles, pass polyline or polygon to edit function:
*
*   try {
*       myDragHandleModule.edit(e.target);
*   }
*   catch (err) {
*       alert(err.message);
*   }
*
* To deactivate drag handles, call dispose function:
*
*   myDragHandleModule.dispose();
*
********************************************************************************/

function dragHandleModule(map, options) {
    //Global Variables
    var _map = map;
    var _shape;
    var _pointIndex;
    var _points;
    var _shapeMask;
    var _DragHandleLayer;
    var _version = "1.1";

    //Default Options
    var _options = {
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

    //Load user defined options
    if (options) {
        for (optionName in options) {
            _options[optionName] = options[optionName];
        }
    }

    //pre-load drag handle images
    var _TempImage = new Image();
    _TempImage.src = _options.DragHandleImage;
    _TempImage = new Image();
    _TempImage.src = _options.DragHandleImageActive;
    _TempImage = null;

    //Inject CSS class to add custom pointer to handle hover
    _createCSSClass('.BM_Module_DragHandle','{ cursor:pointer; }');

    /*********************** Private Methods ****************************/

    function _createCSSClass(selector, style) {
        if (!document.styleSheets) {
            return;
        }

        if (document.getElementsByTagName("head").length == 0) {
            return;
        }

        var stylesheet;
        var mediaType;
        if (document.styleSheets.length > 0) {
            for (i = 0; i < document.styleSheets.length; i++) {
                if (document.styleSheets[i].disabled) {
                    continue;
                }
                var media = document.styleSheets[i].media;
                mediaType = typeof media;

                if (mediaType == "string") {
                    if (media == "" || (media.indexOf("screen") != -1)) {
                        styleSheet = document.styleSheets[i];
                    }
                } else if (mediaType == "object") {
                    if (media.mediaText == "" || (media.mediaText.indexOf("screen") != -1)) {
                        styleSheet = document.styleSheets[i];
                    }
                }

                if (typeof styleSheet != "undefined") {
                    break;
                }
            }
        }

        if (typeof styleSheet == "undefined") {
            var styleSheetElement = document.createElement("style");
            styleSheetElement.type = "text/css";

            document.getElementsByTagName("head")[0].appendChild(styleSheetElement);

            for (i = 0; i < document.styleSheets.length; i++) {
                if (document.styleSheets[i].disabled) {
                    continue;
                }
                styleSheet = document.styleSheets[i];
            }

            var media = styleSheet.media;
            mediaType = typeof media;
        }

        if (mediaType == "string") {
            for (i = 0; i < styleSheet.rules.length; i++) {
                if (styleSheet.rules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
                    styleSheet.rules[i].style.cssText = style;
                    return;
                }
            }

            styleSheet.addRule(selector, style);
        } else if (mediaType == "object") {
            for (i = 0; i < styleSheet.cssRules.length; i++) {
                if (styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
                    styleSheet.cssRules[i].style.cssText = style;
                    return;
                }
            }

            styleSheet.insertRule(selector + "{" + style + "}", 0);
        }
    } 

    function _init() {
        //Raise exception if incorrect shape type is passed to module
        if (_shape.toString() != '[Polyline]' && _shape.toString() != '[Polygon]') { throw 'Module can only be used for shapes that are polylines or polygons'; }

        //Get shape points
        _points = _shape.getLocations();

        //Entity Collection for Drag Hanldes
        _DragHandleLayer = new Microsoft.Maps.EntityCollection()

        //Build Shape Mask
        switch (_shape.toString()) {
            case '[Polyline]':
                _shapeMask = new Microsoft.Maps.Polyline(_points, { strokeColor: _options.shapeMaskStrokeColor, strokeThickness: _options.shapeMaskStrokeThickness, strokeDashArray: _options.shapeMaskStrokeDashArray });
                break;
            case '[Polygon]':
                _shapeMask = new Microsoft.Maps.Polygon(_points, { fillColor: new Microsoft.Maps.Color(100, 100, 000, 000), strokeColor: _options.shapeMaskStrokeColor, strokeThickness: _options.shapeMaskStrokeThickness, strokeDashArray: _options.shapeMaskStrokeDashArray });
                break;
        }

        //Add drag handles and wire events
        var lenOffset = 1
        if (_shape.toString() == '[Polygon]') { lenOffset = 2 };

        for (i = 0; i <= (_points.length - lenOffset); i++) {
            var dragHandle = new Microsoft.Maps.Pushpin(_points[i], { draggable: true, icon: _options.DragHandleImage, height: _options.DragHandleImageHeight, width: _options.DragHandleImageWidth, anchor: _options.DragHandleImageAnchor, typeName: 'BM_Module_DragHandle' });
            Microsoft.Maps.Events.addHandler(dragHandle, 'dragstart', _StartDragHandler);
            Microsoft.Maps.Events.addHandler(dragHandle, 'drag', _DragHandler);
            Microsoft.Maps.Events.addHandler(dragHandle, 'dragend', _EndDragHandler);
            Microsoft.Maps.Events.addHandler(dragHandle, 'mouseover', _MouseOverDragHandle);
            Microsoft.Maps.Events.addHandler(dragHandle, 'mouseout', _MouseOutDragHandle);
            _DragHandleLayer.push(dragHandle);
        }
        _DragHandleLayer.push(_shapeMask);

        //Add Drag Handles/Mask to Map
        map.entities.push(_DragHandleLayer);
    }

    //mouseover event handler
    function _MouseOverDragHandle(e) {
        //Update handle image
        e.target.setOptions({ icon: _options.DragHandleImageActive });
    }

    //mouseout event handler
    function _MouseOutDragHandle(e) {
        //Update handle image
        e.target.setOptions({ icon: _options.DragHandleImage });
    }

    //drag start event handler
    function _StartDragHandler(e) {
        var handleLocation = e.entity.getLocation();

        //Update handle image
        e.entity.setOptions({ icon: _options.DragHandleImageActive });

        //Determine point index
        for (i = 0; i <= (_points.length - 1); i++) {
            if (handleLocation == _points[i]) {
                _pointIndex = i;
                break;
            }
        }

    }

    //drag event handler
    function _DragHandler(e) {
        var loc = e.entity.getLocation();
        _points[_pointIndex] = loc;
        if (_pointIndex == 0 && _shape.toString() == '[Polygon]') { _points[_points.length - 1] = loc; }
        _shapeMask.setLocations(_points);
    }

    //drag end event handler
    function _EndDragHandler(e) {
        //Update handle image
        e.entity.setOptions({ icon: _options.DragHandleImage });

        //Update source shape
        _shape.setLocations(_points);
    }

    /*********************** Public Methods ****************************/

    //Dispose function
    this.dispose = function () {
        map.entities.remove(_DragHandleLayer);
        _shape = null;
    }

    //Return Module version
    this.version = function () {
        return _version;
    }

    //Edit the Shape
    this.edit = function (shape) {
        _shape = shape
        _init();
    }
}

Microsoft.Maps.moduleLoaded('DragHandles');
