
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
    }, INTERVAL_POLLING_MILLISEC);
}

/**
 * Подготовка загрзуки файлов
 */
function setupUpload() {
    if (typeof(window.FileReader) === 'undefined') {
        showError('Drag&Drop не поддерживается браузером!');
    }
    var dropZone = $('#messages');
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
        return false;
    };

    dropZone[0].ondragleave = function () {
        dropZone.removeClass('hover');
        return false;
    };
    dropZone[0].ondrop = function (event) {
        event.preventDefault();
        dropZone.removeClass('hover');
        dropZone.addClass('drop');
        var file = event.dataTransfer.files[0];
        uploadFile(file).then(function (message) {
            sendMessageToServer(message).always(function () {
                dropZone.removeClass('drop');
            });
        }, function (error) {
            showError(error);
            dropZone.addClass('error');
        }, function (progress) {
        });
    };
}

/**
 * Инициализация после всех запросов
 * @param response
 * @param jid_userInfo
 */
function init() {
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

    uploadFile(file).then(function (message) {
        // TODO поменять способ добавления сообщения
        sendMessageToServer(message).always(function () {
            dropZone.removeClass('drop');
            toggleSelectFileButton(attachIcon, 'paperclip');
        });
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
    }

    toggleRecording(startRecording).then(function (data) {
        if (startRecording === false && data['status'] === 'success') {
            clearInterval(blinkRecordingInterval);
            $('#toggleRecordAudio').removeClass('red');
            sendMessageToServer(data['message']);
        }
    });
    startRecording = !startRecording;
    if (startRecording === false) {
        // $('#toggleRecordAudio').prop('disabled', true);
    }
    setTimeout(function () {
        if (startRecording === false) {
            // $('#toggleRecordAudio').prop('disabled', false);
        }
    }, AUDIO_RECORDING_CHUNK_MILLISEC);
    return startRecording;
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
        startRecording = toggleAudioRecording(startRecording, blinkRecordingInterval);
    });
}

function ackMessage(id, clazz) {
    var $message = $('[data-id=' + id + ']');
    // удаляем предыдущие классы
    var ackClasses = ['acknowledged', 'received', 'markable'];
    ackClasses.forEach(function (c) {
        $message.removeClass(c);
    });
    $message.addClass(clazz);
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
    checkingMessagesStatus();
});
