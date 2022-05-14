const https = require('https');

const mobileLinkRegex = /(?:https:\/\/)?\w+\.tiktok\.com\/\w+\/?/;

exports.tiktokUrlRegex = /(?:https:\/\/)?(?:www\.)?(\w+\.tiktok\.com\/\w+\/?|tiktok\.com\/@.+\/video\/\d+?.*)/;

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
            https.get(url, (res) => {
                if(res.statusCode === 301 || res.statusCode === 302) {
                    resolve(res.headers.location);
                } else {
                    reject(new Error("No redirect data for mobile request"));
                }
            })
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