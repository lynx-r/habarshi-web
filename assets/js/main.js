var COOKIE_NAME = 'name';
var IN_MESSAGE = 1;
var OUT_MESSAGE = 0;
var SERVICE_MESSAGE = 2;

$(document).ready(function () {
    var name = getCookie(COOKIE_NAME);
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
    })
});

function submit(e, f) {
    if (e.which === 13) {
        f.call();
        return false;    //<---- Add this line
    }
}

function sendMessage() {
    var message = createMessageHTML($('#messageInput').val(), OUT_MESSAGE);
    appendMessage(message);
    $('#messageInput').val('');
}

function login() {
    setCookie(COOKIE_NAME, $('#loginName').val());
    $('#loginName').val('');
    disableChat(false);
    appendMessage(createMessageHTML('Вы вошли в чат как ' + getCookie(COOKIE_NAME), SERVICE_MESSAGE));
}

function appendMessage(message) {
    var $messages = $('#messages');
    $messages.append(message);
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
            + (type === OUT_MESSAGE ? '<p><b>' + getCookie(COOKIE_NAME) + '</b> ' + new Date().toLocaleTimeString() + '</p>' : '')
            + '<div>' + message + '</div>'
            + '</div></div>';
    }
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