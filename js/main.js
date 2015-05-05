sound_app = {}; 

sound_app.initialize = function() {
    // replace "toner" here with "terrain" or "watercolor"
    var layer = "watercolor";
    sound_app.map = new google.maps.Map(document.getElementById("map_container"), {
        center: new google.maps.LatLng(settings.default_center.lat, settings.default_center.lng),
        zoom: settings.default_zoom,
        mapTypeId: layer,
        mapTypeControlOptions: {
            mapTypeIds: [layer]
        }
    });

    sound_app.map.mapTypes.set(layer, new google.maps.StamenMapType(layer));      

    sound_app.addMusicMarker();
}


sound_app.addMusicMarkers = function() { 

  
}

sound_app.addMusicMarker = function(){ 
    console.log('hi'); 
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(settings.music_markers[0].position.lat, settings.music_markers[0].position.lng),
        map: sound_app.map,
        title: settings.music_markers[0].name
    });
}

window.onload = sound_app.initialize;

