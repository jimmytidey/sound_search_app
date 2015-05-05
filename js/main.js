sound_app = {};
sound_app.music_markers = [];
sound_app.current_music_distances = []

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
    
    //now attach an event when the listen marker loads, 
    sound_app.updateMusicPlaying(); 
    
    //and when the listen marker moves
    google.maps.event.addListener(sound_app.listen_marker, 'dragend', sound_app.updateMusicPlaying);
    
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

sound_app.updateMusicPlaying = function() { 
    sound_app.calculateNearestMusicMarkers();
    var sounds_to_play = sound_app.chooseNearestMarkersToPlay(); 
    $.each(sounds_to_play, function(key,val){ 
        sound_app.playSound(val.music_marker_index); 
    }); 
};

sound_app.calculateNearestMusicMarkers = function() {
    //remove any already calculated distances
    sound_app.current_music_distances = [];  
    var listen_marker_position = sound_app.fromLatLngToPoint(sound_app.listen_marker.getPosition(), sound_app.map);
    
    $.each(sound_app.music_markers, function(key,val) { 
        var music_marker_position = sound_app.fromLatLngToPoint(val.getPosition(), sound_app.map);
        var distance = sound_app.getPixelDistance(music_marker_position, listen_marker_position); 
        sound_app.current_music_distances.push({distance:distance, index:key});
    });
    
    //now order this array by distance to save time later 
    function sortByDistance(a, b){
        if(a.distance>b.distance) { 
            return 1 
        } else { 
            return 0
        } 
        
    }
    
    sound_app.current_music_distances.sort(sortByDistance);    
    
};

sound_app.fromLatLngToPoint = function (latLng, map) {
	var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
	var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
	var scale = Math.pow(2, map.getZoom());
	var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
	return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
}

sound_app.getPixelDistance = function(a,b){ 
    return Math.sqrt(Math.pow((a.x - b.x),2) + Math.pow((a.y-b.y),2)); 
} 

sound_app.chooseNearestMarkersToPlay = function () { 
    
}


sound_app.playSound = function(music_marker_index){ 
    console.log('playing ' + music_marker_index); 
}

window.onload = sound_app.initialize;

