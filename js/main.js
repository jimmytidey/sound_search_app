sound_app = {};
sound_app.music_markers = [];
sound_app.current_music_distances = [];
sound_app.music_playing_now = [];

sound_app.initialize = function() {
    
    sound_app.loadSounds(); 
    $('.close_btn').click(function() { 
        $('.popup').hide();
    }); 

    // replace "toner" here with "terrain" or "watercolor"
    var layer = "watercolor";
    sound_app.map = new google.maps.Map(document.getElementById("map_container"), {
        center: new google.maps.LatLng(settings.default_center.lat, settings.default_center.lng),
        zoom: settings.default_zoom,
        mapTypeId: layer,
        zoomControl: false,
        streetViewControl:false, 
        mapTypeControl:false, 
        panControl:false,
        mapTypeControlOptions: {
            mapTypeIds: [layer]
        }
    });

    sound_app.map.mapTypes.set(layer, new google.maps.StamenMapType(layer));      

    //add each of the markers where there is some music taking place
    sound_app.addMusicMarkers();
    
    //add the icon that determins where the sounds come from 
    sound_app.addListenMarker();
    
    //and when the listen marker moves
    google.maps.event.addListener(sound_app.listen_marker, 'dragend', sound_app.updateMusicPlaying);

    sound_app.updateMusicPlaying();
    sound_app.addHomeMarker(); 
}

sound_app.addHomeMarker = function() { 
    var image = {
        url: '/images/home_marker.png',
        size: new google.maps.Size(70, 61),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(35, 30)
      }; 
 
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(settings.home_marker.lat, settings.home_marker.lng),
        map: sound_app.map,
        icon:image, 
        title: 'home marker', 
        draggable: false
    });
    
    sound_app.home_marker = marker; 
    
    return marker;    
}

sound_app.resetMap = function() { 
    var default_center = new google.maps.LatLng(settings.default_center.lat, settings.default_center.lng); 
    sound_app.map.setCenter(default_center);
    sound_app.map.setZoom(settings.default_zoom);
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
        size: new google.maps.Size(33, 33),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(16, 16)
      }; 
 
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(music_marker.position.lat, music_marker.position.lng),
        map: sound_app.map,
        icon:image, 
        title: music_marker.name,
    });
    
    google.maps.event.addListener(marker, 'click', function() {
        $('.details img').attr("src", "images/venue_images/" + music_marker.details_image_url);
        $('.details').animate({
            width: "300"
        });
    });

    return marker;
}

sound_app.attachDetailsEvents = function(){ 
    $(".details").on("swipe",function(){
        $('.details').animate({
            width: "300"
        });        
    });
}

sound_app.addListenMarker = function(){
    
    var image = {
        url: '/images/listen_marker.png',
        size: new google.maps.Size(50, 68),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(25, 34)
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

sound_app.resetListenMarker = function(){
    var position = new google.maps.LatLng(settings.default_center.lat, settings.default_center.lng); 
    sound_app.listen_marker.setPosition(position); 
}

sound_app.updateMusicPlaying = function() { 
    
    sound_app.calculateNearestMusicMarkers();
    sound_app.chooseNearestMarkersToPlay(); 
    
    sound_app.stopAllSounds();

    var image = {
        url: '/images/music_marker_active.png',
        size: new google.maps.Size(33, 33),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(16, 16)
    }; 
    
    $.each(sound_app.music_playing_now, function(key,val){ 
        sound_app.playSound(val.index, val.distance);
        sound_app.music_markers[val.index].setIcon(image);
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
            return -1
        } 
        
    }
    
    sound_app.current_music_distances = sound_app.current_music_distances.sort(sortByDistance);    
    console.log(sound_app.current_music_distances);
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
    sound_app.music_playing_now = []; 
    
    //if there is a sound so close to the listen marker that we only want to play one peice of music
    if(sound_app.current_music_distances[0].distance < settings.solo_playback_pixel_radius) { 
        console.log('solo mode');
        sound_app.music_playing_now.push(sound_app.current_music_distances[0]) ;
    }
    
    //if we are going to play back multiple music files 
    else { 
        console.log('multi mode');
        $.each(sound_app.current_music_distances, function(key, val){ 
            if( key < settings.max_simultaneous_playback && val.distance < settings.playback_pixel_radius) { 
                 sound_app.music_playing_now.push(sound_app.current_music_distances[key]) ;
            } else { 
                return false;
            } 
       }); 
    }
}


//lets's go! 
window.onload = sound_app.initialize;


// click events 

$('.logo').click(function(){ 
    sound_app.resetMap(); 
    sound_app.resetListenMarker();
    sound_app.updateMusicPlaying();
}); 








