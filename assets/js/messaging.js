function formattedHTMLMessage(type, username, date, message, id) {
    var formattedMsg = '<p><b>' + (type === IN_MESSAGE ? username : 'Я' ) + '</b> ' + date.toLocaleString() +
        '<span class="fa-lg check-success">' +
        '<i class="fa fa-check" style="margin-left:4px"></i>' +
        '</span>' +
        '<span class="fa-stack fa-lg double-check-success">' +
        '<i class="fa fa-check fa-stack-1x" style="margin-left:4px"></i>' +
        '<i class="fa fa-check  fa-stack-1x" style="margin-left:-4px"></i>' +
        '</span>' +
        '</p>'
        + '<div>' + message + '</div>'
        + '</div>';
    return '<div style="overflow: hidden;" data-id="' + id + '">' +
        '<div class="' + (type === IN_MESSAGE ? 'in' : 'out') + '-msg message">'
        + formattedMsg
        + '</div>';
}
function createMessageHTML(id, username, date, message, type) {
    if (type === SERVICE_MESSAGE) {
        return '<div class="srv-msg message">' + message + '</div>';
    } else {
        if (isHabarshiMessage(message)) {
            message = createHabarshiHTML(message);
        }
        return formattedHTMLMessage(type, username, date, message, id);
    }
}

function createHabarshiHTML(text) {
    var msgObj = parseHabarshiMessage(text);
    return createFileMessageHTML(msgObj['type'], msgObj['full_url'], msgObj['file_name'], msgObj['preview_url']);
}

function createFileMessageHTML(type, fullUrl, fileName, previewUrl) {
    var message;
    if (type.startsWith('audio/')) {
        message = '<audio src="' + fullUrl + '" controls></audio>';
    } else if (type.startsWith('image/')) {
        message = '<a href="' + fullUrl + '" target="_blank"><img src="' + previewUrl + '"/></a>';
    } else {
        message = '<a href="' + fullUrl + '" target="_blank">' + fileName + '</a>';
    }
    return message;
}

function appendMessage(id, username, message, type, scroll, date) {
    if (scroll === undefined) {
        scroll = true;
    }
    date = date || new Date().toLocaleTimeString();
    if (message.length === 0) {
        return;
    }
    var $messages = $('#messages');
    $messages.append(createMessageHTML(id, username, date, message, type));
    if (scroll !== undefined && scroll) {
        scrollMessagesToBottom();
    }
}

function scrollMessagesToBottom() {
    var $messages = $('#messages');
    $messages.animate({scrollTop: $messages.scrollTop() + $messages.prop('scrollHeight')}, "slow");
}
