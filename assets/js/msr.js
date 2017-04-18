/*
 * Запись аудио
 * */

var mp3Data = [], mp3buf;
var channels = 1; //1 for mono or 2 for stereo
var sampleRate = 44100; //44.1khz (normal mp3 samplerate)
var kbps = 128; //encode 128kbps mp3
var mp3encoder;
var recordStopped = false;

var mediaConstraints = {
    audio: true
};

var mediaRecorder;

function captureUserMedia(mediaConstraints, successCallback, errorCallback) {
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
}

function toggleRecording(start, appendMessage) {
    var defer = $.Deferred();
    if (start === true) {
        mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
        captureUserMedia(mediaConstraints, function (stream) {
            return onMediaSuccess(defer, stream, appendMessage);
        }, function (e) {
            onMediaError(e);
            defer.reject('fail');
        });
        recordStopped = false;
    } else {
        recordStopped = true;
        mediaRecorder.stop();
        mediaRecorder.stream.stop();
    }
    return defer.promise();
}

function onMediaSuccess(defer, stream, appendMessage) {
    var audio = document.createElement('audio');
    audio = mergeProps(audio, {
        controls: true,
        muted: true,
        src: URL.createObjectURL(stream)
    });
    audio.play();
    mediaRecorder = new MediaStreamRecorder(stream);
    mediaRecorder.stream = stream;
    mediaRecorder.recorderType = MediaRecorderWrapper;
    mediaRecorder.recorderType = StereoAudioRecorder;
    mediaRecorder.audioChannels = 1;
    mediaRecorder.ondataavailable = function (blob) {
        var fileReader = new FileReader();
        fileReader.onload = function() {
            var samples  = new Int16Array(this.result);
            mp3buf = mp3encoder.encodeBuffer(samples);
            if (mp3buf.length > 0) {
                mp3Data.push(new Int8Array(mp3buf));
            }
            console.log(mp3Data.length);

            if (recordStopped) {
                console.log('e '+mp3Data.length);
                finishEncoding(mp3Data, appendMessage, defer);
            }
        };
        fileReader.readAsArrayBuffer(blob);
    };
    mediaRecorder.start(5000);
    return defer.promise();
}

function onMediaError(e) {
    console.error('media error', e);
}

function finishEncoding(mp3Data, appendMessage, defer) {
    mp3buf = mp3encoder.flush();   //finish writing mp3
    // префикс msr обязателен!
    var file = new File(mp3Data, 'msr-' + (new Date).toISOString().replace(/:|\./g, '-') + '.mp3', {
        type: 'audio/mp3'
    });

    uploadFile(file).then(function (data) {
        appendMessage(data, SERVICE_MESSAGE);
        defer.resolve('success');
    }, function (xhr, message) {
        showError('Не удалось загрузить аудио файл: ' + message);
        defer.reject('fail');
    }, function (status) {
        console.log(status);
        defer.resolve('status');
    });
}
