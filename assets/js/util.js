function uploadProgress(event) {
    var percent = parseInt(event.loaded / event.total * 100);
    log('Загрузка: ' + percent + '%');
}

// Read a page's GET URL variables and return them as an associative array.
function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function getFromStore(name) {
    return localStorage.getItem(name);
    // var matches = document.cookie.match(new RegExp(
    //     "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    // ));
    // return matches ? decodeURIComponent(matches[1]) : undefined;
}

function putToStore(name, value) {
    localStorage.setItem(name, value);
    // options = options || {};
    //
    // var expires = options.expires;
    //
    // if (typeof expires === "number" && expires) {
    //     var d = new Date();
    //     d.setTime(d.getTime() + expires * 1000);
    //     expires = options.expires = d;
    // }
    // if (expires && expires.toUTCString) {
    //     options.expires = expires.toUTCString();
    // }
    //
    // value = encodeURIComponent(value);
    //
    // var updatedCookie = name + "=" + value;
    //
    // for (var propName in options) {
    //     updatedCookie += "; " + propName;
    //     var propValue = options[propName];
    //     if (propValue !== true) {
    //         updatedCookie += "=" + propValue;
    //     }
    // }
    //
    // document.cookie = updatedCookie;
}

/**
 * Проверка что сообщение является сообщением с файлами
 * @param text
 * @returns {*}
 */
function isHabarshiMessage(text) {
    return text.startsWith(HABARSHI_MESSAGE);
}

/**
 Пример сообщения на входе

 <HabarshiServiceMessage>
 <file_name>|
 <20170325_125654.jpg>,
 <full_url>|
 <http://test.habarshi.com:11987/content/085e5238-be49-4946-b76e-8cdb951b8ec7.jpg>,
 <preview_url>|
 <http://test.habarshi.com:11987/content/preview_085e5238-be49-4946-b76e-8cdb951b8ec7.jpg>

 * @param text
 * @returns {{file_name: *, full_url: *, preview_url: string, type}}
 */
function parseHabarshiMessage(text) {
    var rx = /<file_name>\|<([^>]+)>,<full_url>\|<([^>]+)>(?:,<preview_url>\|<([^>]+)>)?/g;
    var match = rx.exec(text);
    var fileName = match[1];
    var fullUrl = match[2];
    var type = new Mimer().get(fullUrl);
    var previewUrl = match[3] === undefined ? "null" : match[3];
    return {
        file_name: fileName,
        full_url: fullUrl,
        preview_url: previewUrl,
        type: type
    };
}

/**
 * Сформировать сообщение с файлами в формате Habarshi
 * @param dataObj
 * @returns {*}
 */
function createHabarshiMessage(dataObj) {
    var template = '<HabarshiServiceMessage>' +
        '<file_name>|<#file_name>,' +
        '<full_url>|<#full_url>,' +
        '<preview_url>|<#preview_url>';
    var message;
    message = replaceInTemplate(template, '#file_name', dataObj['file_name']);
    message = replaceInTemplate(message, '#full_url', dataObj['full_url']);
    return replaceInTemplate(message, '#preview_url', dataObj['preview_url']);
}

function replaceInTemplate(template, key, value) {
    return template.replace(key, value);
}

function showError(msg) {
    alert(msg);
    log(msg);
}

function log(msg) {
    console.log(msg);
}


function getUserName() {
    return getFromStore(STORE_USERNAME);
}

function getJid() {
    return getFromStore(STORE_JID);
}

function getSession() {
    return getFromStore(STORE_SESSION);
}

function getSendTo() {
    return getFromStore(STORE_SEND_TO);
}

function getUploadUrl() {
    return getFromStore(STORE_UPLOAD_URL);
}

function getUserList() {
    return JSON.parse(getFromStore(STORE_USER_LIST));
}

function isAuthenticated() {
    // проверить что сессия истекла
    return getFromStore(STORE_AUTH) === 'false' || getFromStore(STORE_AUTH) === null
        || getFromStore(STORE_JID) === null;
}

/**
 * Создает мап на основе данных полученных из вызова метода /user/roster
 * @param data список пользователей и групп
 * @param jid_userInfo мап {jid: <список пользователей и групп>}
 */
function extractMapJid_Userinfo(data, jid_userInfo) {
    data.forEach(function (struc) {
        var map = {};
        struc['users'].reduce(function (p1, p2) {
            p1[p2['jid']] = p2;
            return p1;
        }, map);
        $.extend(jid_userInfo, map);
        if (struc['children'] !== undefined) {
            extractMapJid_Userinfo(struc['children'], jid_userInfo);
        }
    });
}
