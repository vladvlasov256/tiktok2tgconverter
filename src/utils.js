const https = require('https');
var { tall } = require('tall')

const mobileLinkRegex = /(?:https:\/\/)?vm\.tiktok\.com\/\w+\/?/;
const unshorteningUserAgent = "curl/7.77.0";

exports.tiktokUrlRegex = /(?:https:\/\/)?(?:www\.)?(vm\.tiktok\.com\/\w+\/?|tiktok\.com\/@.+\/video\/\d+?.*)/;

exports.httpsStream = function (url, headers, handler) {
    const [hostname, path] = splitUrl(url);
    if (hostname && path) {
        https.get({hostname, path, headers}, handler);
    } else {
        throw new Error("Invalid stream url");
    }
}

exports.escape = function(str) {
    return str.replace("_", "\\_")
    .replace("*", "\\*")
    .replace("[", "\\[")
    .replace("]", "\\]")
    .replace("(", "\\(")
    .replace(")", "\\)")
    .replace("~", "\\~")
    .replace("`", "\\`")
    .replace(">", "\\>")
    .replace("#", "\\#")
    .replace("+", "\\+")
    .replace("-", "\\-")
    .replace("=", "\\=")
    .replace("|", "\\|")
    .replace("{", "\\{")
    .replace("}", "\\}")
    .replace(".", "\\.")
    .replace("!", "\\!")
}

exports.getUnshortenedUrl = function(url) {
    return new Promise(function(resolve, reject) {
        if (url.match(mobileLinkRegex)) {
            tall(url, { 
                headers: { 'User-Agent': unshorteningUserAgent }
            })
            .then(unshortenedUrl => resolve(unshortenedUrl))
            .catch(error => reject(error))
        } else {
            resolve(url);
        }
    })
}

function splitUrl(url) {
    const urlParts = /^(?:\w+\:\/\/)?([^\/]+)(.*)$/.exec(url);
    if (urlParts && urlParts.length == 3) {
        return urlParts.slice(1);
    }
    return [];
}