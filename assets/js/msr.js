/*
 * Запись аудио
 * */

var mediaConstraints = {
    audio: true
};

function captureUserMedia(mediaConstraints, successCallback, errorCallback) {

    navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
}

function toggleRecording(start, appendMessage) {
    if (start === true) {
        captureUserMedia(mediaConstraints, function (stream) {
            onMediaSuccess(stream, appendMessage);
        }, onMediaError);
    } else {
        mediaRecorder.stop();
        mediaRecorder.stream.stop();
    }
}

var mediaRecorder;

function onMediaSuccess(stream, appendMessage) {
    var audio = document.createElement('audio');
    audio = mergeProps(audio, {
        controls: true,
        muted: true,
        src: URL.createObjectURL(stream)
    });
    audio.play();
    audiosContainer.innerHTML = '';
    audiosContainer.appendChild(audio);
    audiosContainer.appendChild(document.createElement('hr'));
    mediaRecorder = new MediaStreamRecorder(stream);
    mediaRecorder.stream = stream;
    // var recorderType = document.getElementById('audio-recorderType').value;
    // if (recorderType === 'MediaRecorder API') {
    mediaRecorder.recorderType = MediaRecorderWrapper;
    // }
    // if (recorderType === 'WebAudio API (WAV)') {
    //     mediaRecorder.recorderType = StereoAudioRecorder;
    //     mediaRecorder.mimeType = 'audio/wav';
    // }
    // if (recorderType === 'WebAudio API (PCM)') {
    //     mediaRecorder.recorderType = StereoAudioRecorder;
    //     mediaRecorder.mimeType = 'audio/pcm';
    // }
    // don't force any mimeType; use above "recorderType" instead.
    // mediaRecorder.mimeType = 'audio/webm'; // audio/ogg or audio/wav or audio/webm
    mediaRecorder.audioChannels = 1;//!!document.getElementById('left-channel').checked ? 1 : 2;
    mediaRecorder.ondataavailable = function (blob) {
        uploadToServer(blob, appendMessage);
    };
    // var timeInterval = document.querySelector('#time-interval').value;
    // if (timeInterval) timeInterval = parseInt(timeInterval);
    // else
    var timeInterval = 5 * 1000;
    // get blob after specific time interval
    mediaRecorder.start();
    document.querySelector('#stop-recording').disabled = false;
    document.querySelector('#pause-recording').disabled = false;
    document.querySelector('#save-recording').disabled = false;
}
function onMediaError(e) {
    console.error('media error', e);
}

function uploadToServer(blob, appendMessage) {
    var file = new File([blob], 'msr-' + (new Date).toISOString().replace(/:|\./g, '-') + '.webm', {
        type: 'audio/webm'
    });

    uploadFile(file).then(function (data) {
        appendMessage(data, SERVICE_MESSAGE);
    }, function (xhr, message) {
        alert('Не удалось загрузить аудио файл: ' + message);
    }, function (status) {
        console.log(status);
    });
}
var audiosContainer = document.getElementById('audios-container');
var index = 1;
// below function via: http://goo.gl/B3ae8c
function bytesToSize(bytes) {
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}
// below function via: http://goo.gl/6QNDcI
function getTimeLength(milliseconds) {
    var data = new Date(milliseconds);
    return data.getUTCHours() + " hours, " + data.getUTCMinutes() + " minutes and " + data.getUTCSeconds() + " second(s)";
}
window.onbeforeunload = function () {
    document.querySelector('#start-recording').disabled = false;
};