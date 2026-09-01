/**
 * Version: 1.0.1
 * APK Downloader Professional - Aptoide & APKMirror
 * Built with Node.js / Baileys
 * Developer: Darkxecutor
 * Newsletter: 120363427092431731@newsletter
 */

'use strict';

const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    name: 'apk',
    aliases: ['apkdl', 'getapk', 'تحميل', 'تنزيل'],
    description: 'بحث وتحميل تطبيقات APK من Aptoide',
    permission: 'public',
    group: true,
    private: true,
    
    async execute(message, args, sock) {
        const from = message.from || message.key?.remoteJid;
        const query = args.join(' ');
        
        if (!query) {
            await sock.sendMessage(from, {
                text: `❌ *الرجاء كتابة اسم التطبيق*

📌 *مثال:*
\`.apk واتساب\`
\`.apk فيسبوك\`
\`.apk انستغرام\`
\`.apk whatsapp\`

💡 يمكنك استخدام الاسم بالعربية أو الإنجليزية`
            });
            return;
        }

        // رسالة بحث
        await sock.sendMessage(from, {
            text: `⏳ جاري البحث عن *${query}*...`
        });

        try {
            // البحث من Aptoide API
            const { data } = await axios.get(
                `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(query)}/limit=5`,
                {
                    timeout: 20000,
                    headers: { 
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'application/json'
                    }
                }
            );

            const list = data?.datalist?.list;
            
            if (!list || list.length === 0) {
                // محاولة بحث ثانية بدون تحديد عدد النتائج
                const { data: data2 } = await axios.get(
                    `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(query)}`,
                    {
                        timeout: 20000,
                        headers: { 
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    }
                );
                
                const list2 = data2?.datalist?.list;
                if (!list2 || list2.length === 0) {
                    // محاولة البحث من APKMirror
                    await sock.sendMessage(from, {
                        text: `🔄 جاري البحث من APKMirror...`
                    });
                    
                    const mirrorResult = await searchApkMirror(query);
                    if (mirrorResult) {
                        await sendMirrorResult(sock, from, mirrorResult, query);
                        return;
                    }
                    
                    await sock.sendMessage(from, {
                        text: `❌ *لم أجد تطبيق "*${query}*"*

💡 *نصائح للبحث:*
• جرب اسم التطبيق بالإنجليزية
• اكتب اسم مختصر (مثل: fb بدل فيسبوك)
• تأكد من صحة الإملاء

📌 *مثال صحيح:* \`.apk whatsapp\``
                    });
                    return;
                }
                
                const app = list2[0];
                await processApp(sock, from, app, query);
                return;
            }

            // اختيار أفضل نتيجة
            const app = list[0];
            await processApp(sock, from, app, query);

        } catch (err) {
            console.error('[APK Error]', err.message);
            
            // محاولة البحث من APKMirror كبديل
            try {
                await sock.sendMessage(from, {
                    text: `🔄 جاري البحث من APKMirror...`
                });
                
                const mirrorResult = await searchApkMirror(query);
                if (mirrorResult) {
                    await sendMirrorResult(sock, from, mirrorResult, query);
                    return;
                }
            } catch (e) {
                console.error('[APKMirror Error]', e.message);
            }
            
            await sock.sendMessage(from, {
                text: `⚠️ *فشل البحث عن "*${query}*"*

📌 *السبب:* ${err.message}

💡 *حاول:*
• استخدام اسم التطبيق بالإنجليزية
• التحقق من الاتصال بالإنترنت
• المحاولة مرة أخرى بعد دقائق`
            });
        }
    }
};

// ============= دالة معالجة التطبيق الرئيسية =============

async function processApp(sock, from, app, query) {
    try {
        // استخراج معلومات التطبيق
        const appInfo = extractAppInfo(app, query);
        
        // إرسال صورة التطبيق
        const appImage = getAppImage(app);
        if (appImage) {
            try {
                await sock.sendMessage(from, {
                    image: { url: appImage },
                    caption: buildImageCaption(appInfo)
                });
            } catch (imgError) {
                console.error('[Image Error]', imgError.message);
            }
        }

        // تحميل وإرسال ملف APK
        await sendApkFile(sock, from, app, appInfo);

    } catch (error) {
        console.error('[Process Error]', error);
        await sendApkFallback(sock, from, app, query);
    }
}

// ============= دالة استخراج معلومات التطبيق =============

function extractAppInfo(app, query) {
    const name = app.name || query || 'غير معروف';
    const sizeMB = app.size ? (app.size / 1048576).toFixed(2) : 'غير معروف';
    const version = app.version || app.ver || 'غير معروف';
    const developer = app.developer?.name || app.store?.name || 'Darkxecutor';
    const downloads = app.downloads || app.downloads_count || 'غير معروف';
    const packageName = app.package || app.pkg || 'غير معروف';
    
    return {
        name,
        sizeMB,
        version,
        developer,
        downloads,
        packageName
    };
}

// ============= دالة استخراج صورة التطبيق =============

function getAppImage(app) {
    if (!app) return null;
    
    // قائمة الحقول المحتملة للصورة
    const imageFields = [
        'icon',
        'graphic',
        'thumbnail',
        'icon_url',
        'image',
        'logo',
        'avatar',
        'icon_path',
        'media.icon',
        'media.graphic'
    ];
    
    for (const field of imageFields) {
        const value = getNestedValue(app, field);
        if (value && typeof value === 'string') {
            const url = value.trim();
            if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                return url;
            }
        }
    }
    
    // محاولة الحصول على الصورة من file object
    if (app.file && typeof app.file === 'object') {
        const fileIcon = app.file.icon || app.file.thumbnail || app.file.icon_path;
        if (fileIcon && typeof fileIcon === 'string') {
            const url = fileIcon.trim();
            if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                return url;
            }
        }
    }
    
    return null;
}

// ============= دالة مساعدة للوصول إلى القيم المتداخلة =============

function getNestedValue(obj, path) {
    if (!obj || !path) return null;
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
            current = current[part];
        } else {
            return null;
        }
    }
    return current;
}

// ============= دالة بناء Caption الصورة =============

function buildImageCaption(info) {
    return `📱 *${info.name}*

━━━━━━━━━━━━━━
📦 الحجم: ${info.sizeMB} MB
📌 الإصدار: ${info.version}
👨‍💻 المطور: ${info.developer}
📥 التحميلات: ${info.downloads}
📋 Package: ${info.packageName}
━━━━━━━━━━━━━━
🚀 جاري تجهيز ملف التطبيق...`;
}

// ============= دالة إرسال ملف APK =============

async function sendApkFile(sock, from, app, info) {
    const downloadUrl = app.file?.path_alt || app.file?.path || app.path;
    
    if (!downloadUrl) {
        await sendApkFallback(sock, from, app, info.name);
        return;
    }

    try {
        // تحميل الملف
        const response = await axios.get(downloadUrl, {
            timeout: 60000,
            responseType: 'arraybuffer',
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/vnd.android.package-archive'
            },
            maxContentLength: 100 * 1024 * 1024 // 100MB max
        });

        // التحقق من الاستجابة
        if (response.status !== 200) {
            throw new Error(`HTTP ${response.status}`);
        }

        const buffer = Buffer.from(response.data);
        
        // التحقق من حجم الملف
        if (buffer.length === 0) {
            throw new Error('ملف فارغ');
        }

        if (buffer.length > 50 * 1024 * 1024) {
            await sock.sendMessage(from, {
                text: `⚠️ حجم الملف كبير جداً (${(buffer.length / 1048576).toFixed(2)} MB)

📱 *${info.name}*
📌 الإصدار: ${info.version}

🔗 *رابط التحميل:*
${downloadUrl}

📌 يمكنك التحميل مباشرة من الرابط أعلاه`
            });
            return;
        }

        // تنظيف اسم الملف
        const fileName = sanitizeFileName(info.name) + '.apk';

        // إرسال ملف APK
        await sock.sendMessage(from, {
            document: buffer,
            fileName: fileName,
            mimetype: 'application/vnd.android.package-archive',
            caption: buildApkCaption(info)
        });

    } catch (error) {
        console.error('[Download Error]', error.message);
        await sendApkFallback(sock, from, app, info.name, downloadUrl);
    }
}

// ============= دالة بناء Caption APK =============

function buildApkCaption(info) {
    return `📱 *${info.name}*
📦 الحجم: ${info.sizeMB} MB
📌 الإصدار: ${info.version}
👨‍💻 المطور: Darkxecutor
📥 التحميلات: ${info.downloads}
📋 Package: ${info.packageName}

━━━━━━━━━━━━━━
🤖 APK Downloader v1.0.1
✅ تم تجهيز التطبيق بنجاح

📢 قناة التحديثات:
120363427092431731@newsletter`;
}

// ============= دالة تنظيف اسم الملف =============

function sanitizeFileName(name) {
    if (!name) return 'app';
    return name
        .toString()
        .replace(/[<>:"/\\|?*]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);
}

// ============= دالة Fallback لإرسال الرابط =============

async function sendApkFallback(sock, from, app, query, url = null) {
    const downloadUrl = url || app.file?.path_alt || app.file?.path || app.path;
    const name = app.name || query || 'غير معروف';
    const version = app.version || app.ver || 'غير معروف';
    const sizeMB = app.size ? (app.size / 1048576).toFixed(2) : 'غير معروف';
    
    let message = `⚠️ *تعذر تحميل ملف ${name}*

📱 *${name}*
📌 الإصدار: ${version}
📦 الحجم: ${sizeMB} MB`;

    if (downloadUrl) {
        message += `

🔗 *رابط التحميل:*
${downloadUrl}

📌 يمكنك التحميل مباشرة من الرابط أعلاه`;
    } else {
        message += `

❌ *عذراً، لا يوجد رابط تحميل متاح*

💡 جرب البحث باسم آخر أو استخدم الإصدار المباشر من المتجر.`;
    }

    await sock.sendMessage(from, { text: message });
}

// ============= دالة إرسال نتيجة APKMirror =============

async function sendMirrorResult(sock, from, result, query) {
    const message = `📱 *${result.name}*

✅ تم العثور على التطبيق من APKMirror

📌 *النسخة:* ${result.version || 'غير معروف'}
📦 *المصدر:* APKMirror

🔗 *رابط التحميل:*
${result.url}

📌 *ملاحظة:* تأكد من تفعيل "التثبيت من مصادر غير معروفة"

━━━━━━━━━━━━━━
🤖 APK Downloader v1.0.1
👨‍💻 المطور: Darkxecutor
📢 قناة التحديثات:
120363427092431731@newsletter`;

    await sock.sendMessage(from, { text: message });
}

// ============= دالة البحث من APKMirror (محسنة) =============

async function searchApkMirror(appName) {
    if (!appName) return null;
    
    try {
        const searchUrl = `https://www.apkmirror.com/?s=${encodeURIComponent(appName)}&post_type=post`;
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 30000
        });

        const $ = cheerio.load(response.data);
        
        // البحث عن أول نتيجة
        let firstResult = $('.search-results .appRow a').first();
        if (!firstResult || firstResult.length === 0) {
            firstResult = $('.search-results .appRow .appRowTitle a').first();
        }
        
        if (!firstResult || firstResult.length === 0) {
            return null;
        }

        const appLink = firstResult.attr('href');
        if (!appLink) return null;
        
        const fullAppLink = appLink.startsWith('http') ? appLink : 'https://www.apkmirror.com' + appLink;
        
        // جلب صفحة التطبيق
        const appPage = await axios.get(fullAppLink, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 30000
        });

        const $$ = cheerio.load(appPage.data);
        
        // استخراج اسم التطبيق
        const appNameText = $$('.app-title h1').text().trim() || 
                           $$('h1').first().text().trim() || 
                           appName;
        
        // استخراج الإصدار
        const versionText = $$('.app-title .version').text().trim() || 
                           $$('.app-title .date').text().trim() || 
                           'غير معروف';
        
        // استخراج رابط التحميل
        let downloadLink = $$('.downloadButton a').first().attr('href');
        if (!downloadLink) {
            downloadLink = $$('.downloadBtn a').first().attr('href');
        }
        
        if (!downloadLink) {
            // محاولة البحث عن رابط في التصنيفات
            const variantLinks = $$('.variants-table .download a');
            if (variantLinks.length > 0) {
                downloadLink = variantLinks.first().attr('href');
            }
        }
        
        if (!downloadLink) {
            return null;
        }

        const fullDownloadLink = downloadLink.startsWith('http') ? downloadLink : 'https://www.apkmirror.com' + downloadLink;

        return {
            name: appNameText,
            version: versionText,
            url: fullDownloadLink,
            source: 'APKMirror'
        };
    } catch (error) {
        console.error('[APKMirror Error]', error.message);
        return null;
    }
}