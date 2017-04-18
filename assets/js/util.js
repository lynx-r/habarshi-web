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
    document.body.style.cursor = 'wait';
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
            document.body.style.cursor = 'auto';
            defer.resolve(message);
        })
        .fail(function (xhr, message) {
            document.body.style.cursor = 'auto';
            defer.reject('Ошибка во время загрузки файлйа!');
        });
    return defer.promise();
}

function uploadProgress(event) {
    var percent = parseInt(event.loaded / event.total * 100);
    console.log('Загрузка: ' + percent + '%');
}

// Read a page's GET URL variables and return them as an associative array.
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
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

    if (typeof expires === "number" && expires) {
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
