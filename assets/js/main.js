var COOKIE_NAME = 'name';
var COOKIE_AUTH = 'auth';
var IN_MESSAGE = 1;
var OUT_MESSAGE = 0;
var SERVICE_MESSAGE = 2;
var SERVER_URL = 'https://test.habarshi.com:11999';
var UPLOAD_URL;
var USERNAME = 'director';
var PASSWORD = 'pass';
var MAX_FILE_SIZE = 50000000; // максимальный размер файла - 50 мб.

$(document).ready(function () {
    if (getCookie(COOKIE_AUTH) === 'false' || getCookie(COOKIE_AUTH) === undefined) {
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
});

function refineUpload() {
    if (typeof(window.FileReader) === 'undefined') {
        alert('Drag&Drop не поддерживается браузером!');
    }
    var dropZone = $('#attachButton');
    var attachIcon = $('#attachIcon');
    dropZone.click(function () {
        $('#uploadFile').click();
    });
    dropZone[0].ondragover = function () {
        dropZone.addClass('hover');
        attachIcon.removeClass('fa-paperclip');
        attachIcon.addClass('fa-plus');
        return false;
    };

    dropZone[0].ondragleave = function () {
        dropZone.removeClass('hover');
        attachIcon.addClass('fa-paperclip');
        attachIcon.removeClass('fa-plus');
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
            attachIcon.addClass('fa-paperclip');
            attachIcon.removeClass('fa-plus');
        }, function (error) {
            alert(error);
            dropZone.addClass('error');
            attachIcon.addClass('fa-paperclip');
            attachIcon.removeClass('fa-plus');
        }, function (progress) {
        });
    };
}

function uploadFile(file) {
    var defer = $.Deferred();
    if (file.size > MAX_FILE_SIZE) {
        return defer.reject('Файл слишком большой!');
    }
    var formData = new FormData();
    formData.append('file', file);
    var options = {
        url: UPLOAD_URL,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        xhr: function () {
            var xhr = $.ajaxSettings.xhr();
            xhr.upload.onprogress = uploadProgress;
            return xhr;
        }
    };
    $.ajax(options)
        .done(function (data) {
            var response = JSON.parse(data);
            var fileLink = '<a href="' + response['full_url'] + '" target="_blank">' + file.name + '</a>';
            var message = getUserName() + ' загрузил файл ' + fileLink;
            defer.resolve(message);
        })
        .fail(function (xhr, message) {
            defer.reject('Ошибка во время загрузки файлйа!');
        });
    return defer.promise();
}

function uploadProgress(event) {
    var percent = parseInt(event.loaded / event.total * 100);
    console.log('Загрузка: ' + percent + '%');
}

function auth() {
    $.post(SERVER_URL + '/auth/1?username=' + USERNAME + '&password=' + PASSWORD, function (data) {
        var uploads = JSON.parse(data)['uploads'];
        if (uploads === undefined) {
            console.log(data);
            alert('Не удалось авторизоваться');
            return;
        }
        UPLOAD_URL = 'http://' + uploads['address'] + ':' + uploads['port'] + '/upload';
        console.log(data);
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
    if (file.length !== 0) {
        uploadFile(file).then(function (status) {
            appendMessage(status, SERVICE_MESSAGE);
        }, function (error) {
            alert(error);
        }, function (progress) {
        });
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
    $('#sendButton').prop('disabled', disabled);
    $('#messageInput').prop('disabled', disabled);
    $('#messages').prop('disabled', disabled);
}

function createMessageHTML(message, type) {
    if (type === SERVICE_MESSAGE) {
        return '<div class="srv-msg message">' + message + '</div>';
    } else {
        return '<div style="overflow: hidden;"><div class="' + (type === IN_MESSAGE ? 'in' : 'out') + '-msg message">'
            + (type === OUT_MESSAGE ? '<p><b>' + getUserName() + '</b> ' + new Date().toLocaleTimeString() + '</p>' : '')
            + '<div>' + message + '</div>'
            + '</div></div>';
    }
}

function getUserName() {
    return getCookie(COOKIE_NAME);
}

// возвращает cookie с именем name, если есть, если нет, то undefined
function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options) {
    options = options || {};

    var expires = options.expires;

    if (typeof expires == "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    var updatedCookie = name + "=" + value;

    for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
}