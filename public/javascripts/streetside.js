function base4(dec) {
   return Number(dec).toString(4);
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function getCubeDetails(n,s,e,w) {
   var streetside_api_url = "http://dev.virtualearth.net/mapcontrol/HumanScaleServices/GetBubbles.ashx";
   var ids = [];

   $.ajax({
         url: streetside_api_url,
         crossDomain: true,
         dataType: "json",
         data: {c:1, n:n, s:s, e:e, w:w},
         success: function( data ) {
            ids = data.slice(1).map(function(obj){obj["id"]});
            console.log(ids);
         }
   });

   return ids;
}

function cubeURL(id,dir) {
   var DIR_STRINGS = { "FRONT": 1, "RIGHT": 2, "BACK": 3, "LEFT": 4, "UP": 5, "DOWN": 6 };
   if (typeof dir == "string") {
      dir = DIR_STRINGS[dir];
   }
   var b4_id = base4(id);
   var b4_dir = base4(dir);
   return "http://ak.t1.tiles.virtualearth.net/tiles/hs" + pad(b4_id,16) + pad(b4_dir,2) + ".jpg?g=2981&n=z"
}