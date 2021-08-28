const https = require('https');

exports.tiktokUrlRegex = /(?:https:\/\/)?(?:www\.)?(vm\.tiktok\.com\/\w+\/?|tiktok\.com\/@.+\/video\/\d+?.*)/;

exports.httpsStream = function (url, headers, handler) {
    const [hostname, path] = splitUrl(url);
    if (hostname && path) {
        https.get({hostname, path, headers}, handler);
    } else {
        throw new Error("Invalid stream url");
    }
}

function splitUrl(url) {
    const urlParts = /^(?:\w+\:\/\/)?([^\/]+)(.*)$/.exec(url);
    if (urlParts && urlParts.length == 3) {
        return urlParts.slice(1);
    }
    return [];
}