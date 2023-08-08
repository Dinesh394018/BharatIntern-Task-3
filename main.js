let client = AgoraRTC.createClient({ mode: 'rtc', 'codec': "vp8" })

let config = {

    appid: '63e459395b9e4ff8ab9b5669e593eee7',
    token: '007eJxTYNh0v1u/2amnSut49KSDLgvnqs2XbXbozHsZ7sTX8X+H7w8FBjPjVBNTS2NL0yTLVJO0NIvEJMskUzMzy1SgYGpqqvk250spDYGMDGJntzAwQiGIz8WQk1mWWlxSlJqYy8AAADwHIsk=',
    uid: null,
    channel: 'livestream',
}

let localTracks = {

    audioTrack: null,
    videoTrack: null,

}


let localTrackState = {

    audioTrackMuted:false,
    videoTrackMuted:false,
}

let remoteTracks = {



}



document.getElementById('join-btn').addEventListener('click', async () => {


    console.log('USER JOINED STREAM')
    await joinStreams()
    document.getElementById('join-btn').style.display ='none'
    document.getElementById('footer').style.display ='flex'

})



document.getElementById('mic-btn').addEventListener('click' , async () => {

 if(! localTrackState.audioTrackMuted){

    await localTracks.audioTrack.setMuted(true)
    localTrackState.audioTrackMuted=true
    document.getElementById('mic-btn').style.backgroundColor = 'rgb(225,80,80,0.7)'
 }
 else{
    await localTracks.audioTrack.setMuted(false)
    localTrackState.audioTrackMuted=false
    document.getElementById('mic-btn').style.backgroundColor = '#1f1f1f8e'


 }

})


document.getElementById('camera-btn').addEventListener('click' , async () => {

    if(! localTrackState.videoTrackMuted){
   
       await localTracks.videoTrack.setMuted(true)
       localTrackState.videoTrackMuted=true
       document.getElementById('camera-btn').style.backgroundColor = 'rgb(225,80,80,0.7)'
    }
    else{
       await localTracks.videoTrack.setMuted(false)
       localTrackState.videoTrackMuted=false
       document.getElementById('camera-btn').style.backgroundColor = '#1f1f1f8e'
   
    }
   
   })

document.getElementById('leave-btn').addEventListener('click', async () =>{

    for(trackName in localTracks){
        let track= localTracks[trackName]
        if(track){
            //stops camera and mic
            track.stop()
           //disconnect camera and mic
            track.close()

            localTracks[trackName]= null
        }
    }

    await client.leave()

    document.getElementById('user-streams').innerHTML = ' '
    document.getElementById('footer').style.display ='none'
    document.getElementById('join-btn').style.display ='block'
})





let joinStreams = async () => {


    client.on("user-published", handleUserJoined);
    
    client.on('user-left', handleUserLeft);

    [config.uid, localTracks.audioTrack, localTracks.videoTrack] = await Promise.all([
        client.join(config.appid, config.channel, config.token ||null, config.uid ||null),
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack(),
    ])


    let videoPlayer = `<div   class="video-containers" id="video-wrapper-${config.uid}" > 
                            <p class="user-uid">${config.uid}</p>
                             <div class="video-player player" id="stream-${config.uid}" ></div>
                       </div> `


    document.getElementById('user-streams').insertAdjacentHTML('beforeend', videoPlayer)
    localTracks.videoTrack.play(`stream-${config.uid}`)


    await client.publish([localTracks.audioTrack, localTracks.videoTrack])

   
}

let handleUserLeft = async () => {
    delete remoteTracks[user.uid]
    document.getElementById(`video-wrapper-${user.uid}`)
}

let handleUserJoined = async (user, mediaType) => {

   

    console.log('USER HAS JOINED THE STREAM')
    remoteTracks[user.uid] = user

    await client.subscribe(user, mediaType)


    let videoPlayer = document.getElementById(`video-wrapper-${user.uid}`)
    if(videoPlayer != null)
    {
        videoPlayer.remove()
    }

    if (mediaType === 'video') {
        let videoPlayer = `<div   class="video-containers" id="video-wrapper-${user.uid}" > 
        <p class="user-uid">${user.uid}</p>
         <div class="video-player player" id="stream-${user.uid}" ></div>
    </div> `

        document.getElementById('user-streams').insertAdjacentHTML('beforeend', videoPlayer)
        user.videoTrack.play(`stream-${user.uid}`)


    }
    if(mediaType === 'audio')
    {
        user.audioTrack.play()
    }




}