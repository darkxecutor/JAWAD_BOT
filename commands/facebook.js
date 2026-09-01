const axios = require('axios');
const fs = require('fs');
const path = require('path');

// المجلد المؤقت
const TEMP_DIR = path.join(process.cwd(), 'temp');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// قائمة الأوامر المدعومة (عربي + إنجليزي)
const COMMANDS = {
    arabic: '.فيس',
    english: '.fb'
};

async function facebookCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const args = text.split(' ').slice(1).join(' ').trim();
        
        if (!args) {
            return await sock.sendMessage(chatId, { 
                text: `📘 *Facebook Video Downloader - JAWAD.BOT*

📌 *Usage:*
\`${COMMANDS.arabic} <video link or title>\`
\`${COMMANDS.english} <video link or title>\`

📝 *Examples:*
\`${COMMANDS.arabic} https://www.facebook.com/watch/?v=123456789\`
\`${COMMANDS.english} https://www.facebook.com/watch/?v=123456789\`
\`${COMMANDS.english} new song 2026\`
\`${COMMANDS.arabic} أغنية جديدة 2026\`

✨ *Search by link or title in any language*`
            }, { quoted: message });
        }

        // إظهار تفاعل البحث
        await sock.sendMessage(chatId, {
            react: { text: '🩵', key: message.key }
        });

        // إرسال رسالة البحث (ثنائية اللغة)
        const searchMsg = await sock.sendMessage(chatId, { 
            text: `🩵 *Searching for Facebook video...*\n🔍 "${args.substring(0, 50)}${args.length > 50 ? '...' : ''}"\n⏳ Please wait, this may take a few seconds.`
        }, { quoted: message });

        // التحقق من نوع البحث (رابط أم اسم)
        const isUrl = args.includes('facebook.com') || args.includes('fb.com') || args.includes('fb.watch') || args.match(/^https?:\/\//i);
        
        let videoUrl = null;
        let title = null;
        let searchResults = [];

        if (isUrl) {
            // البحث بالرابط
            const result = await searchByUrl(args);
            videoUrl = result.videoUrl;
            title = result.title;
        } else {
            // البحث بالاسم (يدعم العربية والإنجليزية وأي لغة)
            const results = await searchByName(args);
            if (results.length > 0) {
                searchResults = results;
                // اختيار أفضل نتيجة
                const bestResult = results[0];
                videoUrl = bestResult.videoUrl;
                title = bestResult.title;
            }
        }

        // إذا لم نجد نتيجة واحدة، نعرض نتائج متعددة
        if (!videoUrl && searchResults.length > 1) {
            await sock.sendMessage(chatId, { delete: searchMsg.key });
            
            // إظهار تفاعل العثور
            await sock.sendMessage(chatId, {
                react: { text: '✨', key: message.key }
            });

            let resultText = `✨ *Found ${Math.min(searchResults.length, 5)} results:*\n\n`;
            searchResults.slice(0, 5).forEach((result, index) => {
                resultText += `${index + 1}. 📹 *${result.title.substring(0, 40)}${result.title.length > 40 ? '...' : ''}*\n`;
                resultText += `   🔗 ${result.videoUrl}\n\n`;
            });
            resultText += `📌 *Send the number to select*`;

            // تخزين النتائج مؤقتاً للاستخدام لاحقاً
            global.searchResults = global.searchResults || {};
            global.searchResults[chatId] = {
                results: searchResults,
                timestamp: Date.now(),
                messageId: message.key.id,
                language: 'en'
            };

            return await sock.sendMessage(chatId, { 
                text: resultText
            }, { quoted: message });
        }

        // إذا لم نجد أي شيء
        if (!videoUrl) {
            await sock.sendMessage(chatId, { delete: searchMsg.key });
            return await sock.sendMessage(chatId, { 
                text: '❌ *Failed to find video!*\n\n📌 *Possible reasons:*\n• Video is private or deleted\n• Search term is too vague\n• Video is not available for download\n\n💡 Try a more specific search or use a direct link.'
            }, { quoted: message });
        }

        // حذف رسالة البحث
        await sock.sendMessage(chatId, { delete: searchMsg.key });

        // إظهار تفاعل العثور
        await sock.sendMessage(chatId, {
            react: { text: '✨', key: message.key }
        });

        // إرسال رسالة جاهزية الإرسال
        const readyMsg = await sock.sendMessage(chatId, { 
            text: `✨ *Video found!*\n📝 "${title.substring(0, 50)}${title.length > 50 ? '...' : ''}"\n🌍 *Preparing video for sending...*`
        }, { quoted: message });

        // محاولة إرسال الفيديو بالرابط أولاً
        try {
            const caption = `╭━━━≪•📘 *Facebook Videos* •≫━━━╮
┃━━━━━━━━━━━━━━━━━━━━━
${title ? `┃📝 *Title:* ${title.substring(0, 50)}` : '┃📝 Facebook Video'}
┃━━━━━━━━━━━━━━━━━━━━━
╰━━━≪•🌍 *JAWAD.BOT* •≫━━━╯`;
            
            await sock.sendMessage(chatId, {
                video: { url: videoUrl },
                mimetype: "video/mp4",
                caption: caption
            }, { quoted: message });
            
            await sock.sendMessage(chatId, { delete: readyMsg.key });
            
            // إظهار تفاعل الإرسال
            await sock.sendMessage(chatId, {
                react: { text: '🌍', key: message.key }
            });
            
            return;
        } catch (urlError) {
            console.error(`طريقة الرابط فشلت: ${urlError.message}`);
            
            // الاحتياط: تحميل الفيديو كـ Buffer
            try {
                const tempFile = path.join(TEMP_DIR, `fb_${Date.now()}.mp4`);

                const videoResponse = await axios({
                    method: 'GET',
                    url: videoUrl,
                    responseType: 'stream',
                    timeout: 60000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Referer': 'https://www.facebook.com/'
                    }
                });

                const writer = fs.createWriteStream(tempFile);
                videoResponse.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                if (!fs.existsSync(tempFile) || fs.statSync(tempFile).size === 0) {
                    throw new Error('فشل تحميل الفيديو');
                }

                const caption = `╭━━━≪•📘 *Facebook Videos* •≫━━━╮
┃━━━━━━━━━━━━━━━━━━━━━
${title ? `┃📝 *Title:* ${title.substring(0, 50)}` : '┃📝 Facebook Video'}
┃━━━━━━━━━━━━━━━━━━━━━
╰━━━≪•🌍 *JAWAD.BOT* •≫━━━╯`;
                
                await sock.sendMessage(chatId, {
                    video: { url: tempFile },
                    mimetype: "video/mp4",
                    caption: caption
                }, { quoted: message });

                await sock.sendMessage(chatId, { delete: readyMsg.key });

                // تنظيف الملف المؤقت
                try { fs.unlinkSync(tempFile); } catch(e) {}
                
                await sock.sendMessage(chatId, {
                    react: { text: '🌍', key: message.key }
                });
                
                return;
            } catch (bufferError) {
                console.error(`طريقة Buffer فشلت أيضاً: ${bufferError.message}`);
                throw new Error('فشلت جميع طرق التحميل');
            }
        }

    } catch (error) {
        console.error('خطأ في أمر فيسبوك:', error);
        await sock.sendMessage(chatId, { 
            text: `❌ *An error occurred!*\n⚠️ The API might be temporarily down.\n💡 Please try again later.\n\n📝 Error: ${error.message}`
        }, { quoted: message });
    }
}

// دالة البحث بالرابط
async function searchByUrl(url) {
    try {
        // تحويل الرابط المختصر إلى الرابط النهائي
        let resolvedUrl = url;
        try {
            const res = await axios.get(url, { 
                timeout: 20000, 
                maxRedirects: 10, 
                headers: { 'User-Agent': 'Mozilla/5.0' } 
            });
            const possible = res?.request?.res?.responseUrl;
            if (possible && typeof possible === 'string') {
                resolvedUrl = possible;
            }
        } catch(e) {
            // استخدام الرابط الأصلي
        }

        const result = await fetchFromApi(resolvedUrl);
        return {
            videoUrl: result.videoUrl,
            title: result.title || "Facebook Video"
        };
    } catch(e) {
        // محاولة الرابط الأصلي
        const result = await fetchFromApi(url);
        return {
            videoUrl: result.videoUrl,
            title: result.title || "Facebook Video"
        };
    }
}

// دالة البحث بالاسم (تدعم جميع اللغات)
async function searchByName(query) {
    try {
        // محاولة البحث باستخدام API أولاً
        const searchUrl = `https://api.hanggts.xyz/search/facebook?q=${encodeURIComponent(query)}`;
        
        const response = await axios.get(searchUrl, {
            timeout: 30000,
            headers: {
                'accept': '*/*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            maxRedirects: 5,
            validateStatus: s => s >= 200 && s < 500
        });

        const results = [];
        
        if (response.data && response.data.result) {
            const items = Array.isArray(response.data.result) ? response.data.result : [response.data.result];
            
            for (const item of items) {
                if (item.video_url || item.url || item.download_url) {
                    let videoUrl = item.video_url || item.url || item.download_url;
                    let title = item.title || item.name || item.caption || "Facebook Video";
                    
                    // تجربة الحصول على الفيديو من الرابط
                    try {
                        const videoResult = await fetchFromApi(videoUrl);
                        if (videoResult.videoUrl) {
                            results.push({
                                videoUrl: videoResult.videoUrl,
                                title: videoResult.title || title,
                                thumbnail: item.thumbnail || item.picture
                            });
                        }
                    } catch(e) {
                        // إذا فشل، استخدم الرابط كما هو
                        results.push({
                            videoUrl: videoUrl,
                            title: title,
                            thumbnail: item.thumbnail || item.picture
                        });
                    }
                }
            }
        }

        // إذا لم نجد نتائج، نجرب طريقة بديلة (بحث في YouTube كبديل)
        if (results.length === 0) {
            try {
                const youtubeSearch = await searchYouTube(query);
                if (youtubeSearch.length > 0) {
                    return youtubeSearch;
                }
            } catch(e) {
                // تجاهل
            }
        }

        // إذا لم نجد نتائج، نجرب طريقة أخرى
        if (results.length === 0) {
            // استخدام بحث عام مع كلمات مفتاحية
            const fallbackUrl = `https://api.hanggts.xyz/download/facebook?url=${encodeURIComponent(query)}`;
            try {
                const fallbackResponse = await axios.get(fallbackUrl, {
                    timeout: 20000,
                    headers: {
                        'accept': '*/*',
                        'User-Agent': 'Mozilla/5.0'
                    }
                });
                
                if (fallbackResponse.data && fallbackResponse.data.result) {
                    const data = fallbackResponse.data.result;
                    let videoUrl = data.video_url || data.url || data.download_url || data.video;
                    if (videoUrl) {
                        results.push({
                            videoUrl: videoUrl,
                            title: data.title || data.caption || "Facebook Video"
                        });
                    }
                }
            } catch(e) {
                // تجاهل
            }
        }

        return results;
    } catch(error) {
        console.error(`خطأ في البحث بالاسم: ${error.message}`);
        return [];
    }
}

// دالة البحث في YouTube كبديل (اختياري)
async function searchYouTube(query) {
    try {
        // استخدام API بسيط للبحث في YouTube
        const youtubeApi = `https://api.hanggts.xyz/download/youtube?url=${encodeURIComponent(query)}`;
        const response = await axios.get(youtubeApi, {
            timeout: 15000,
            headers: {
                'accept': '*/*',
                'User-Agent': 'Mozilla/5.0'
            }
        });

        const results = [];
        if (response.data && response.data.result) {
            const items = Array.isArray(response.data.result) ? response.data.result : [response.data.result];
            for (const item of items) {
                if (item.url || item.video_url) {
                    results.push({
                        videoUrl: item.url || item.video_url,
                        title: item.title || "Video",
                        thumbnail: item.thumbnail
                    });
                }
            }
        }
        return results;
    } catch(error) {
        console.error(`خطأ في بحث YouTube: ${error.message}`);
        return [];
    }
}

// دالة جلب الفيديو من API
async function fetchFromApi(url) {
    const apiUrl = `https://api.hanggts.xyz/download/facebook?url=${encodeURIComponent(url)}`;
    
    try {
        const response = await axios.get(apiUrl, {
            timeout: 20000,
            headers: {
                'accept': '*/*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            maxRedirects: 5,
            validateStatus: s => s >= 200 && s < 500
        });
        
        const data = response.data;
        let videoUrl = null;
        let title = null;

        // معالجة رد API
        if (data) {
            // معالجة data.result
            if (data.result) {
                if (data.result.media) {
                    videoUrl = data.result.media.video_hd || data.result.media.video_sd;
                    title = data.result.info?.title || data.result.title || data.title;
                } else if (typeof data.result === 'object') {
                    videoUrl = data.result.url || data.result.download_url || data.result.video_url || data.result.download || data.result.video;
                    title = data.result.title || data.result.caption || data.title;
                } else if (typeof data.result === 'string' && data.result.startsWith('http')) {
                    videoUrl = data.result;
                    title = data.title || "Facebook Video";
                }
            }
            
            // معالجة data.data
            if (!videoUrl && data.data) {
                if (typeof data.data === 'object') {
                    videoUrl = data.data.url || data.data.download_url || data.data.video_url || data.data.download || data.data.video;
                    title = data.data.title || data.data.caption || data.title;
                } else if (typeof data.data === 'string' && data.data.startsWith('http')) {
                    videoUrl = data.data;
                    title = data.title || "Facebook Video";
                } else if (Array.isArray(data.data)) {
                    const hdVideo = data.data.find(item => (item.quality === 'HD' || item.quality === 'high') && (item.format === 'mp4' || !item.format));
                    const sdVideo = data.data.find(item => (item.quality === 'SD' || item.quality === 'low') && (item.format === 'mp4' || !item.format));
                    videoUrl = hdVideo?.url || sdVideo?.url || data.data[0]?.url;
                    title = hdVideo?.title || sdVideo?.title || data.data[0]?.title || data.title;
                }
            }
            
            // معالجة حقول مباشرة
            if (!videoUrl) {
                videoUrl = data.url || data.download_url || data.video_url || data.download || data.video || data.hd_url || data.sd_url;
                title = data.title || data.caption || "Facebook Video";
            }
            
            // إذا كان video كائن
            if (!videoUrl && typeof data.video === 'object') {
                videoUrl = data.video.url || data.video.hd_url || data.video.sd_url;
                title = data.video.title || data.title || "Facebook Video";
            }
        }

        if (!videoUrl) {
            throw new Error('لم يتم العثور على رابط الفيديو');
        }

        return { videoUrl, title: title || "Facebook Video" };
    } catch (error) {
        console.error(`API فشل: ${error.message}`);
        throw error;
    }
}

// دالة معالجة اختيار نتيجة من القائمة
async function handleSelection(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const selection = parseInt(text.trim());
        
        if (isNaN(selection) || selection < 1) {
            return false;
        }

        const stored = global.searchResults?.[chatId];
        if (!stored || Date.now() - stored.timestamp > 600000) { // 10 دقائق
            delete global.searchResults[chatId];
            return false;
        }

        const results = stored.results;
        if (selection > results.length) {
            return false;
        }

        const selected = results[selection - 1];
        
        // إظهار تفاعل العثور
        await sock.sendMessage(chatId, {
            react: { text: '✨', key: message.key }
        });

        // إرسال الفيديو المختار
        const caption = `╭━━━≪•📘 *Facebook Videos* •≫━━━╮
┃━━━━━━━━━━━━━━━━━━━━━
${selected.title ? `┃📝 *Title:* ${selected.title.substring(0, 50)}` : '┃📝 Facebook Video'}
┃━━━━━━━━━━━━━━━━━━━━━
╰━━━≪•🌍 *JAWAD.BOT* •≫━━━╯`;

        await sock.sendMessage(chatId, {
            video: { url: selected.videoUrl },
            mimetype: "video/mp4",
            caption: caption
        }, { quoted: message });

        await sock.sendMessage(chatId, {
            react: { text: '🌍', key: message.key }
        });

        delete global.searchResults[chatId];
        return true;
    } catch(error) {
        console.error('خطأ في معالجة الاختيار:', error);
        return false;
    }
}

// تصدير الدوال
module.exports = { facebookCommand, handleSelection, COMMANDS };