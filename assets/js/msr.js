/*
 * Запись аудио
 * */

var mediaConstraints = {
    audio: true
};

var audiosContainer = document.getElementById('audios-container');

var mediaRecorder;

function captureUserMedia(mediaConstraints, successCallback, errorCallback) {
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
}

function toggleRecording(start, appendMessage) {
    var defer = $.Deferred();
    if (start === true) {
        captureUserMedia(mediaConstraints, function (stream) {
            return onMediaSuccess(defer, stream, appendMessage);
        }, function (e) {
            onMediaError(e);
            defer.reject('fail');
        });
    } else {
        mediaRecorder.stop();
        mediaRecorder.stream.stop();
        defer.resolve('success');
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
    audiosContainer.innerHTML = '';
    audiosContainer.appendChild(audio);
    audiosContainer.appendChild(document.createElement('hr'));
    mediaRecorder = new MediaStreamRecorder(stream);
    mediaRecorder.stream = stream;
    mediaRecorder.recorderType = MediaRecorderWrapper;
    mediaRecorder.audioChannels = 1;
    mediaRecorder.ondataavailable = function (blob) {
        var file = new File([blob], 'msr-' + (new Date).toISOString().replace(/:|\./g, '-') + '.webm', {
            type: 'audio/webm'
        });

        uploadFile(file).then(function (data) {
            appendMessage(data, SERVICE_MESSAGE);
            defer.resolve('success');
        }, function (xhr, message) {
            alert('Не удалось загрузить аудио файл: ' + message);
            defer.reject('fail');
        }, function (status) {
            console.log(status);
            defer.resolve('status');
        });
    };
    mediaRecorder.start();
    return defer.promise();
}
function onMediaError(e) {
    console.error('media error', e);
}
