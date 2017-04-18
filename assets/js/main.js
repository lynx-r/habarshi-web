$(document).ready(function () {
    if (!isValidUrl()) {
        alert('Не верная ссылка!');
        return;
    }
    if (isAuthenticated()) {
        auth();
    }
    refineUpload();
    var name = getUserName();
    if (name === undefined) {
        disableChat(true);
    } else {
        disableChat(false);
    }
    $('#loginButton').click(login);
    $('#loginName').keypress(function (e) {
        submit(e, login);
    });
    $('#sendButton').click(sendMessage);
    $('#messageInput').keypress(function (e) {
        submit(e, sendMessage);
    });
    var startRecording = true;
    var blinkRecordingInterval;
    $('#toggleRecordAudio').click(function () {
        if (startRecording === true) {
            $('#toggleRecordAudio').toggleClass('red');
            blinkRecordingInterval = setInterval(function () {
                $('#toggleRecordAudio').toggleClass('red');
            }, 1000);
        } else {
        }
        toggleRecording(startRecording, appendMessage).then(function (data) {
            if (startRecording === true && data === 'success') {
                clearInterval(blinkRecordingInterval);
                $('#toggleRecordAudio').removeClass('red');
            }
        });
        startRecording = !startRecording;
        if (startRecording === false) {
            $('#toggleRecordAudio').prop('disabled', true);
        }
        setTimeout(function () {
            if (startRecording === false) {
                $('#toggleRecordAudio').prop('disabled', false);
            }
        }, 5000);
    });
});

function isValidUrl() {
    return getUrlVars()['session'] !== undefined;
}

function toggleSelectFileButton(attachIcon, type) {
    if (type === 'plus') {
        attachIcon.removeClass('fa-paperclip');
        attachIcon.addClass('fa-plus');
    } else {
        attachIcon.removeClass('fa-plus');
        attachIcon.addClass('fa-paperclip');
    }
}
function refineUpload() {
    if (typeof(window.FileReader) === 'undefined') {
        alert('Drag&Drop не поддерживается браузером!');
    }
    var dropZone = $('#attachButton');
    var attachIcon = $('#attachIcon');

    // Простая загрузка
    dropZone.click(function () {
        $('#uploadFile').click();
    });
    $('#uploadFile').on('change', function () {
        sendMessage();
    });

    // Drag & Drop Upload
    dropZone[0].ondragover = function () {
        dropZone.addClass('hover');
        toggleSelectFileButton(attachIcon, 'plus');
        return false;
    };

    dropZone[0].ondragleave = function () {
        dropZone.removeClass('hover');
        toggleSelectFileButton(attachIcon, 'paperclip');
        return false;
    };
    dropZone[0].ondrop = function (event) {
        event.preventDefault();
        dropZone.removeClass('hover');
        dropZone.addClass('drop');
        var file = event.dataTransfer.files[0];
        uploadFile(file).then(function (status) {
            appendMessage(status, SERVICE_MESSAGE);
            dropZone.removeClass('drop');
            toggleSelectFileButton(attachIcon, 'paperclip');
        }, function (error) {
            alert(error);
            dropZone.addClass('error');
            toggleSelectFileButton(attachIcon, 'paperclip');
        }, function (progress) {
        });
    };
}

function auth() {
    // aaa62d15-ee1c-4e3f-bafe-eb15e9b1a974
    var url = new URI(SERVER_URL + '/session-config')
        .addQuery({session: getUrlVars()['session']})
    $.get(url, function (data) {
        var response = JSON.parse(data);
        var uploads = response['uploads'];
        if (uploads === undefined) {
            console.log(data);
            alert('Не удалось авторизоваться');
            return;
        }
        var uploadUrl = 'http://' + uploads['address'] + ':' + uploads['port'] + '/upload';
        setCookie(COOKIE_UPLOAD_URL, uploadUrl);
        setCookie(COOKIE_JID, response['pull'][0]['jid']);
        setCookie(COOKIE_NAME, response['username']);
        console.log(getJid());
    }).fail(function (xhr, message) {
        alert('Не удалось авторизоваться');
        console.log(message);
    });
}

function submit(e, f) {
    if (e.which === 13) {
        f.call();
        return false;    //<---- Add this line
    }
}

function sendMessage() {
    appendMessage($('#messageInput').val(), OUT_MESSAGE);
    $('#messageInput').val('');
    var file = $('#uploadFile')[0].files[0];
    if (file !== undefined && file.length !== 0) {
        var dropZone = $('#attachButton');
        var attachIcon = $('#attachIcon');

        uploadFile(file).then(function (status) {
            appendMessage(status, SERVICE_MESSAGE);
            dropZone.removeClass('drop');
            toggleSelectFileButton(attachIcon, 'paperclip');
        }, function (error) {
            dropZone.removeClass('error');
            toggleSelectFileButton(attachIcon, 'paperclip');
            alert(error);
        }, function (progress) {
        });
        $('#uploadFile').val('');
    }
}

function login() {
    setCookie(COOKIE_NAME, $('#loginName').val());
    $('#loginName').val('');
    disableChat(false);
    appendMessage('Вы вошли в чат как ' + getUserName(), SERVICE_MESSAGE);
}

function appendMessage(message, type) {
    if (message.length === 0) {
        return;
    }
    var $messages = $('#messages');
    $messages.append(createMessageHTML(message, type));
    $messages.animate({scrollTop: $messages.scrollTop() + $messages.height()}, "slow");
}

function disableChat(disabled) {
    if (disabled === true) {
        $('#loginName').prop('placeholder', 'Ваше имя?');
    } else {
        $('#loginName').prop('placeholder', 'Здравствуйте, ' + getUserName() + '!');
        $('#loginButton').text('Переименоваться');
    }
    $('#sendButton').prop('disabled', disabled);
    $('#toggleRecordAudio').prop('disabled', disabled);
    $('#attachButton').prop('disabled', disabled);
    $('#messageInput').prop('disabled', disabled);
}

function createMessageHTML(message, type) {
    if (type === SERVICE_MESSAGE) {
        return '<div class="srv-msg message">' + message + '</div>';
    } else {
        var formattedMsg = (type === OUT_MESSAGE ? '<p><b>' + getUserName() + '</b> ' + new Date().toLocaleTimeString() + '</p>' : '')
            + '<div>' + message + '</div>'
            + '</div>';
        return '<div style="overflow: hidden;"><div class="' + (type === IN_MESSAGE ? 'in' : 'out') + '-msg message">'
            + formattedMsg
            + '</div>';
    }
}

function getUserName() {
    return getCookie(COOKIE_NAME);
}

function getJid() {
    return getCookie(COOKIE_JID);
}

function getUploadUrl() {
    return getCookie(COOKIE_UPLOAD_URL);
}

function isAuthenticated() {
    // проверить что сессия истекла
    return getCookie(COOKIE_AUTH) === 'false' || getCookie(COOKIE_AUTH) === undefined
        || getCookie(COOKIE_JID) === undefined;
}
