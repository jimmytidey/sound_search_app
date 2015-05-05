sound_app = {};
sound_app.music_markers = [];

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

    //add each of the markers where there is some music taking place
    sound_app.addMusicMarkers();
    
    //add the icon that determins where the sounds come from 
    sound_app.addListenMarker();
}

sound_app.addMusicMarkers = function() { 
    $.each(settings.music_markers, function(key, val){ 
        var marker = sound_app.addMusicMarker(val); 
        sound_app.music_markers.push(marker); 
    })
}

sound_app.addMusicMarker = function(music_marker){ 

    var image = {
        url: '/images/music_marker.png',
        size: new google.maps.Size(100, 115),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(0, 57)
      }; 
 
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(music_marker.position.lat, music_marker.position.lng),
        map: sound_app.map,
        icon:image, 
        title: music_marker.name
    });
    
    return marker;
}

sound_app.addListenMarker = function(){
    
    var image = {
        url: '/images/listen_marker.png',
        size: new google.maps.Size(100, 113),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(50, 56)
      }; 
 
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(settings.default_center.lat, settings.default_center.lng),
        map: sound_app.map,
        icon:image, 
        title: 'current location', 
        draggable: true
    });
    
    sound_app.listen_marker = marker; 
    
    return marker;     
    
}

window.onload = sound_app.initialize;

