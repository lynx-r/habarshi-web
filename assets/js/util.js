function uploadFile(file) {
    var defer = $.Deferred();
    if (file === undefined || file.size > MAX_FILE_SIZE) {
        return defer.reject('Файл слишком большой!');
    }
    var audioFile = file.name.startsWith('msr-');
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
            var fullUrl = response['full_url'];
            var fileLink, message;
            if (audioFile) {
                fileLink = '<audio src="' + fullUrl + '" controls></audio>';
                message = getUserName() + ' загрузил аудио файл <br>' + fileLink;
            } else {
                fileLink = '<a href="' + fullUrl + '" target="_blank">' + file.name + '</a>';
                message = getUserName() + ' загрузил файл ' + fileLink;
            }
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
