
/**
 * Настройка приложения
 */
function setup() {
    $.ajaxSetup({cache: false});
}

/**
 * берет параметры session и to из get запроса и сохраняет в сессию
 * @returns {boolean} возвращает true если проверка успешна
 */
function checkIsValidUrl() {
    var session = getUrlVars()['session'];
    var to = getUrlVars()['to'];
    putToStore(STORE_SESSION, session);
    putToStore(STORE_SEND_TO, to);

    return session !== undefined && to !== undefined;
}

/**
 * Создает интервал для опроса сервера о новых сообщениях
 */
function startPolling() {
    setInterval(function () {
        getMessagesFromServer(getFromStore(STORE_AFTER_MESSAGE));
    }, POLL_INTERVAL);
}

/**
 * меняет иконку кнопки выбора файлов со скрепки на плюс, когда наводится файл на кнопку для D&D
 * @param attachIcon
 * @param type
 */
function toggleSelectFileButton(attachIcon, type) {
    if (type === 'plus') {
        attachIcon.removeClass('fa-paperclip');
        attachIcon.addClass('fa-plus');
    } else {
        attachIcon.removeClass('fa-plus');
        attachIcon.addClass('fa-paperclip');
    }
}

/**
 * Подготовка загрзуки файлов
 */
function setupUpload() {
    if (typeof(window.FileReader) === 'undefined') {
        showError('Drag&Drop не поддерживается браузером!');
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
            // TODO поменять способ добавления сообщения
            appendMessage(null, getUserName(), status, SERVICE_MESSAGE, true, new Date());
            dropZone.removeClass('drop');
            toggleSelectFileButton(attachIcon, 'paperclip');
        }, function (error) {
            showError(error);
            dropZone.addClass('error');
            toggleSelectFileButton(attachIcon, 'paperclip');
        }, function (progress) {
        });
    };
}

/**
 * Инициализация после всех запросов
 * @param response
 * @param jid_userInfo
 */
function init(response, jid_userInfo) {
    extractMapJid_Userinfo(response, jid_userInfo);
    putToStore(STORE_USER_LIST, JSON.stringify(jid_userInfo));
    getMessagesFromServer(null);
    startPolling();
    disableChat(false);
}

function submit(e, f) {
    if (e.which === 13) {
        f.call();
        return false;    //<---- Add this line
    }
}

/**
 * Отправляет файл на сервер
 * @param file
 */
function sendFile(file) {
    var dropZone = $('#attachButton');
    var attachIcon = $('#attachIcon');

    uploadFile(file).then(function (status) {
        // TODO поменять способ добавления сообщения
        appendMessage(null, getUserName(), status, SERVICE_MESSAGE, true, new Date());
        dropZone.removeClass('drop');
        toggleSelectFileButton(attachIcon, 'paperclip');
    }, function (error) {
        dropZone.removeClass('error');
        toggleSelectFileButton(attachIcon, 'paperclip');
        showError(error);
    }, function (progress) {
    });
    $('#uploadFile').val('');
}

/**
 * Отправляет сообщение или файл
 */
function sendMessage() {
    var msg = $('#messageInput').val();
    sendMessageToServer(msg);
    var file = $('#uploadFile')[0].files[0];
    if (file !== undefined && file.length !== 0) {
        sendFile(file);
    }
}

/**
 * Активирует или деактивирует UI
 * @param disabled
 */
function disableChat(disabled) {
    $('#sendButton').prop('disabled', disabled);
    $('#toggleRecordAudio').prop('disabled', disabled);
    $('#attachButton').prop('disabled', disabled);
    $('#messageInput').prop('disabled', disabled);
    if (disabled === false) {
        $('#messageInput').focus();
    }
}

/**
 * Включаем/выключаем запись аудио
 * @param startRecording
 * @param blinkRecordingInterval
 */
function toggleAudioRecording(startRecording, blinkRecordingInterval) {
    if (startRecording === true) {
        $('#toggleRecordAudio').toggleClass('red');
        blinkRecordingInterval = setInterval(function () {
            $('#toggleRecordAudio').toggleClass('red');
        }, 1000);
    } else {
    }
    toggleRecording(startRecording).then(function (data) {
        if (startRecording === true && data['status'] === 'success') {
            clearInterval(blinkRecordingInterval);
            $('#toggleRecordAudio').removeClass('red');
            createMessageHTML(null, getUserName(), new Date(), data['message'], SERVICE_MESSAGE);
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
}

/**
 * Устанавливаем обработчики элементов управления
 */
function setupHandlers() {
    $('#sendButton').click(sendMessage);
    $('#messageInput').keypress(function (e) {
        submit(e, sendMessage);
    });
    var startRecording = true;
    var blinkRecordingInterval;
    $('#toggleRecordAudio').click(function () {
        toggleAudioRecording(startRecording, blinkRecordingInterval);
    });
}

$(document).ready(function () {
    setup();

    if (!checkIsValidUrl()) {
        showError('Не верная ссылка!');
        return;
    }
    // в начале деактивируем UI
    disableChat(true);

    if (isAuthenticated()) {
        auth();
    }
    setupUpload();
    setupHandlers();
});
