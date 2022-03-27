const scraper = require('tiktok-scraper');
const { httpsStream, escape, getUnshortenedUrl } = require('./utils');

const httpsPrefixRegex = /https?:\/\//i;

exports.processUrl = function (url, id, bot, isInline, proxyHost) {
    const handler = isInline ? processInlineVideoMetadata : processTextMessage;
    getUnshortenedUrl(url)
        .then((unshortenedUrl) => getVideoMetadata(unshortenedUrl))
        .then((metadata) => { handler(metadata, id, bot, proxyHost) })
        .catch((error) => { console.error("Scraper error", error.message); });
}

function getVideoMetadata(unshortenedUrl) {
    return new Promise(function(resolve, reject) {
        scraper.getVideoMeta(unshortenedUrl)
            .then((metadata) => resolve({ metadata, unshortenedUrl }) )
            .catch((error) => reject(error))
    })
}

function processTextMessage(data, chatId, bot) {
    const { metadata } = data;
    let videoUrl = "";
    if (metadata.collector && metadata.collector.length > 0)  {
        videoUrl = metadata.collector[0].videoUrl;
    }

    try {
        httpsStream(videoUrl, metadata.headers, (stream) => {
            bot.sendVideo(chatId, stream);
        });
    } catch (e) {
        console.error("Stream error", e.message);
    }
}

function processInlineVideoMetadata(data, queryId, bot, proxyHost) {
    const { metadata, unshortenedUrl } = data;
    if (metadata.collector && metadata.collector.length > 0)  {
        const { id, text, imageUrl, authorMeta } = metadata.collector[0];
        
        const title = `*${escape(authorMeta.name)}*`;
        let description = null;
        let caption = title;
        if (text) {
            const escapedText = escape(text);
            description = escapedText;
            caption = `${caption}\n\n${escapedText}`;
        }

        bot.answerInlineQuery(queryId, [{
            "type": "video",
            "id": id,
            "video_url": `${proxyHost}/${unshortenedUrl.replace(httpsPrefixRegex, "")}`,
            "mime_type": "video/mp4",
            "thumb_url": imageUrl,
            title,
            caption,
            "parse_mode": "MarkdownV2",
            description
        }]);
    }
}