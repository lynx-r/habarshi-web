var STORE_USERNAME = 'name';
var STORE_AUTH = 'auth';
var STORE_JID = 'jid';
var STORE_SESSION = 'session';
var STORE_SEND_TO = 'to';
var STORE_USER_LIST = 'userlist';
var STORE_AFTER_MESSAGE = 'messageid';
var STORE_NUM_SENT_MESSAGES = 'numsentmessages';

var IN_MESSAGE = 1;
var OUT_MESSAGE = 0;
var SERVICE_MESSAGE = 2;

var SERVER_URL = 'https://test.habarshi.com:11999';
var STORE_UPLOAD_URL;
var MAX_FILE_SIZE = 500000000; // максимальный размер файла - 500 мб.
var POLL_INTERVAL = 5000;

var HABARSHI_MESSAGE = '<HabarshiServiceMessage>';