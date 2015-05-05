

sound_app.audio_buffers = [];

sound_app.loadSounds = function(){ 
    
    $.each(settings.music_markers, function(key,val) {
        //console.log('loading ' + val.audio_file);
        var sound = new Howl({
            urls: ['music/' + val.audio_file],
            autoplay: true,
            loop: true,
            volume: 0.5,
            onload: function() {
                //console.log('audio file ' + key  +' loaded');
                sound_app.audio_buffers[key] = sound;
                sound_app.audio_buffers[key].volume(0);
                
                //if this has just loaded, and should be playing, start it off...
                $.each(sound_app.music_playing_now, function(playing_key, playing_val) {
                    if(playing_val.index == key) { 
                        sound_app.audio_buffers[key].volume(0.5);
                    }
                });
                
            }, 
            onloaderror: function(){ 
                console.log('----> audio file ' + key  +' FAILED to load');
                var dummy = {};
                dummy.volume = function(){};
                sound_app.audio_buffers[key] = dummy;
            }
        });
        
         
        
    });
    
}

sound_app.stopAllSounds = function(){ 
    console.log('stopping all sounds');
    $.each(sound_app.audio_buffers, function(key,val){
        try{
            sound_app.audio_buffers[key].volume(0);
        }catch(e) { 
            //console.log('sound not loaded yet --' + key );
        }
    }); 
}

sound_app.playSound = function(music_marker_index, distance){ 
    console.log('playing ' + music_marker_index);
    try { 
        sound_app.audio_buffers[music_marker_index].volume(0.5);
        console.log("playing: " + settings.music_markers[music_marker_index]); 
    }
    catch(e) { 
        console.log('sound not loaded yet -- ' + settings.music_markers[music_marker_index]);
    }
}
