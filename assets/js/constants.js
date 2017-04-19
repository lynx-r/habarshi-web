var STORE_USERNAME = 'name';
var STORE_AUTH = 'auth';
var STORE_JID = 'jid';
var STORE_SESSION = 'session';
var STORE_SEND_TO = 'to';
var STORE_USER_LIST = 'userlist';
var STORE_AFTER_MESSAGE = 'messageid';
var STORE_RECENT_MESSAGES = 'recentmessages';

var OUT_MESSAGE = 0;
var IN_MESSAGE = 1;
var SERVICE_MESSAGE = 2;

var SERVER_URL = 'https://test.habarshi.com:11999';
var STORE_UPLOAD_URL;
var MAX_FILE_SIZE = 500000000; // максимальный размер файла - 500 мб.

var INTERVAL_POLLING_MILLISEC = 5000;
var INTERVAL_CHECK_MESSAGE_STATUS_MILLISEC = 4000;
var INTERVAL_REFRESH_ROSTER = 24 * 60 * 60 * 1000; // сутки

var AUDIO_RECORDING_CHUNK_MILLISEC = 60 * 60 * 1000; // размер чанка в 1 час

var HABARSHI_MESSAGE = '<HabarshiServiceMessage>';