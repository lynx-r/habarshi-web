function sendMessageToServer(msg) {
    var defer = $.Deferred();
    var sendUrl = new URI(SERVER_URL + '/v1/chat/send')
        .addQuery('session', getSession())
        .addQuery('text', msg)
        .addQuery('to', getSendTo());
    $.get(sendUrl, function (data) {
        var response = JSON.parse(data);
        if (response['ok'] === true) {
            appendMessage(response['id'], getUserName(), msg, OUT_MESSAGE, true, new Date());
            $('#messageInput').val('');
            defer.resolve();
        } else {
            showError('Ошибка отправки файла!');
            defer.reject();
        }
    });
    return defer.promise();
}

function uploadFile(file) {
    var defer = $.Deferred();
    if (file === undefined || file.size > MAX_FILE_SIZE) {
        return defer.reject('Файл слишком большой!');
    }
    var audioFile = file.type === 'audio/mp3';
    var formData = new FormData();
    formData.append('file', file);
    var options = {
        url: getUploadUrl(),
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
    document.body.style.cursor = 'wait!important';
    $.ajax(options)
        .done(function (data) {
            var response = JSON.parse(data);
            var dataObj = {
                file_name: file.name,
                full_url: response['full_url'],
                preview_url: response['preview_url']
            };
            var message = createHabarshiMessage(dataObj);
            defer.resolve(message);
        })
        .fail(function (xhr, message) {
            document.body.style.cursor = 'auto';
            defer.reject('Ошибка во время загрузки файлйа!');
        });
    return defer.promise();
}

function auth() {
    // aaa62d15-ee1c-4e3f-bafe-eb15e9b1a974
    var sessionConfigUrl = new URI(SERVER_URL + '/session-config')
        .addQuery({session: getUrlVars()['session']});
    $.get(sessionConfigUrl, function (data) {
        var response = JSON.parse(data);
        var uploads = response['uploads'];
        if (uploads === undefined) {
            showError('Не удалось авторизоваться');
            return;
        }
        var uploadUrl = 'http://' + uploads['address'] + ':' + uploads['port'] + '/upload';
        putToStore(STORE_UPLOAD_URL, uploadUrl);
        putToStore(STORE_JID, response['pull'][0]['jid']);
        putToStore(STORE_USERNAME, response['username']);
        var rosterUrl = new URI(SERVER_URL + '/user/roster')
            .addQuery('session', getSession());
        $.get(rosterUrl, function (data) {
            var response = JSON.parse(data);
            var jid_userInfo = {};
            init(response, jid_userInfo);
        });
    }).fail(function (xhr, message) {
        showError('Не удалось авторизоваться');
    });
}

function getMessagesFromServer(after) {
    var userMamUrl = new URI(SERVER_URL + '/user/mam')
        .addQuery('session', getSession());
    if (after !== null && after !== "null") {
        userMamUrl.addQuery('after', after);
    }
    $.get(userMamUrl, function (data) {
        var response = JSON.parse(data);
        var history = response['mam']['history'];
        if (history.length === 0) {
            return;
        }
        var msgIds = [];
        history.forEach(function (item) {
            var msgId = item['id'];
            msgIds.push(msgId);
            // putToStore(STORE_AFTER_MESSAGE, null);
            var jidFrom = item['from'];
            var to = item['to'].split('@');
            var type = item['to'] === getJid() ? IN_MESSAGE : OUT_MESSAGE;
            if (item['from'] === 'security_bot@habarshi.com') {
                type = SERVICE_MESSAGE;
            }
            var userinfoFrom = getUserList()[jidFrom];
            var receivedFrom;
            if (userinfoFrom !== undefined) {
                receivedFrom = userinfoFrom['name'];
            } else {
                receivedFrom = jidFrom;
            }
            var date = new Date(parseInt(item['stamp']) * 1000);
            if (after === null || type === IN_MESSAGE) {
                var username = type === IN_MESSAGE ? receivedFrom : getUserName();
                appendMessage(msgId, username, item['text'], type, false, date);
            }
        });

        // сохраняем id последнего сообщения
        putToStore(STORE_AFTER_MESSAGE, msgIds[msgIds.length - 1]);

        var userMamAck = new URI(SERVER_URL + '/user/mam_ack')
            .addQuery('session', getSession())
            .addQuery('ids', JSON.stringify(msgIds));
        $.get(userMamAck, function (data) {
            log(data);
        });
        scrollMessagesToBottom();
    })
}
