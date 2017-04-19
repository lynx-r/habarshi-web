function createMessageHTML(id, username, date, message, type) {
    if (type === SERVICE_MESSAGE) {
        return '<div class="srv-msg message">' + message + '</div>';
    } else {
        if (isHabarshiMessage(message)) {
            return createHabarshiHTML(message);
        } else {
            var formattedMsg = '<p><b>' + (type === IN_MESSAGE ? username : 'Я' ) + '</b> ' + date.toLocaleString() + '</p>'
                + '<div>' + message + '</div>'
                + '</div>';
            return '<div style="overflow: hidden;" data-id="' + id + '">' +
                '<div class="' + (type === IN_MESSAGE ? 'in' : 'out') + '-msg message">'
                + formattedMsg
                + '</div>';
        }
    }
}

function createHabarshiHTML(text) {
    var msgObj = parseHabarshiMessage(text);
    var message = createFileMessageHTML(msgObj['type'], msgObj['full_url'], msgObj['file_name'], msgObj['preview_url']);
    return '<div class="srv-msg message">' + message + '</div>'
}

function createFileMessageHTML(type, fullUrl, fileName, previewUrl) {
    var message, fileLink;
    if (type.startsWith('audio/')) {
        fileLink = '<audio src="' + fullUrl + '" controls></audio>';
        message = getUserName() + ' загрузил аудио файл <br>' + fileLink;
    } else if (type.startsWith('image/')) {
        fileLink = '<a href="' + fullUrl + '" target="_blank"><img src="' + previewUrl + '"/></a>';
        message = getUserName() + ' загрузил файл ' + fileLink;
    } else {
        fileLink = '<a href="' + fullUrl + '" target="_blank">' + fileName + '</a>';
        message = getUserName() + ' загрузил файл ' + fileLink;
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
    if (id === null) {
        incNumSentMessages();
    } else {
        setNumSentMessages(0);
    }
    if (scroll !== undefined && scroll) {
        scrollMessagesToBottom();
    }
}

function scrollMessagesToBottom() {
    var $messages = $('#messages');
    $messages.animate({scrollTop: $messages.scrollTop() + $messages.prop('scrollHeight')}, "slow");
}

