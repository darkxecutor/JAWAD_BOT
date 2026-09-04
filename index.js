/**
 * JAWAD.BOT - بوت واتساب v1.0.1
 * المطور: DarkXecutor
 * 
 * هذا البرنامج مجاني: يمكنك إعادة توزيعه وتعديله
 * وفقاً لرخصة MIT.
 * 
 * الاعتمادات:
 * - مكتبة Baileys بواسطة @adiwajshing
 * - كود الاقتران مستوحى من TechGod143 & DGXEON
 */
require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const axios = require('axios')
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main');
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, await, sleep, reSize } = require('./lib/myfunc')
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    jidDecode,
    proto,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys")
const NodeCache = require("node-cache")
const pino = require("pino")
const readline = require("readline")
const { parsePhoneNumber } = require("libphonenumber-js")
const { PHONENUMBER_MCC } = require('@whiskeysockets/baileys/lib/Utils/generics')
const { rmSync, existsSync } = require('fs')
const { join } = require('path')

// استيراد متجر خفيف الوزن
const store = require('./lib/lightweight_store')

// استيراد أمر APK
const apkCommand = require('./commands/apk');

// ===== استيراد أمر الملف الشخصي =====
const profileCommand = require('./commands/profile');

// استيراد بوت الأنمي
const AnimeBot = require('./commands/animeBot');
const animeBot = new AnimeBot();

// استيراد مكافحة الروابط
const { Antilink } = require('./lib/antilink');

// ===== استيراد أمر فيسبوك =====
const { facebookCommand, handleSelection, COMMANDS } = require('./commands/facebook');

// تهيئة المتجر
store.readFromFile()
const settings = require('./settings')
setInterval(() => store.writeToFile(), settings.storeWriteInterval || 10000)

// تحسين الذاكرة - تنظيف الذاكرة التلقائي
setInterval(() => {
    if (global.gc) {
        global.gc()
        console.log('🧹 تم تنظيف الذاكرة')
    }
}, 60_000) // كل دقيقة

// مراقبة الذاكرة - إعادة التشغيل إذا أصبحت مرتفعة جداً
setInterval(() => {
    const المستخدم = process.memoryUsage().rss / 1024 / 1024
    if (المستخدم > 400) {
        console.log('⚠️ الرام مرتفع جداً (>400MB)، جاري إعادة تشغيل البوت...')
        process.exit(1)
    }
}, 30_000) // كل 30 ثانية

// ============= تم التعديل - تعطيل رمز الاقتران =============
let phoneNumber = ""  // فارغة لاستخدام QR Code
let owner = JSON.parse(fs.readFileSync('./data/owner.json'))

// ============= معلومات البوت =============
global.botname = "JAWAD.BOT"
global.motif_emoji = "•"
global.قناة_اليوتيوب = "jawad_bot"
global.مطور = "DarkXecutor"
global.رابط_القناة = "https://whatsapp.com/channel/0029Vb7kJt29Gv7W5J0McQ09"
global.معرف_القناة = "120363427092431731@newsletter"
global.مجموعة_الدعم = "https://chat.whatsapp.com/LqoheqNRThHLBDbMCwvV7J?mode=gi_t"

// ============= تم التعديل - تعطيل رمز الاقتران =============
const pairingCode = false  // QR Code
const useMobile = process.argv.includes("--mobile")

// دالة بدء البوت
async function startJawadBot() {
    try {
        let { version, isLatest } = await fetchLatestBaileysVersion()
        const { state, saveCreds } = await useMultiFileAuthState(`./session`)
        const msgRetryCounterCache = new NodeCache()

        const JawadBot = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: true,  // QR Code
            browser: ["JAWAD.BOT", "Chrome", "120.0.0"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            getMessage: async (مفتاح) => {
                let jid = jidNormalizedUser(مفتاح.remoteJid)
                let رسالة = await store.loadMessage(jid, مفتاح.id)
                return رسالة?.message || ""
            },
            msgRetryCounterCache,
            defaultQueryTimeoutMs: 60000,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 10000,
            // إضافة تأخير بين الطلبات لتجنب rate limit
            requestTimeoutMs: 30000,
            patchMessageBeforeSending: (message) => {
                // تقليل حجم البيانات المرسلة
                const requiresPatch = !!(
                    message.buttonsMessage ||
                    message.templateMessage ||
                    message.listMessage
                );
                if (requiresPatch) {
                    message = {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadataVersion: 2,
                                    deviceListMetadata: {}
                                },
                                ...message
                            }
                        }
                    };
                }
                return message;
            }
        })

        // حفظ بيانات الدخول عند تحديثها
        JawadBot.ev.on('creds.update', saveCreds)

        store.bind(JawadBot.ev)

        // ============= دوال معالجة أوامر الأنمي المعدلة =============
        async function handleEditCommand(sock, message) {
            try {
                const from = message.key.remoteJid;
                const sender = message.key.participant || message.key.remoteJid;
                
                // 🔍 تفاعل عند بدء البحث
                await sock.sendMessage(from, {
                    react: { text: '🔍', key: message.key }
                });
                
                // تأخير بسيط لتجنب rate limit
                await delay(1000);
                
                const videoName = animeBot.getRandomVideo();
                
                if (!videoName) {
                    await sock.sendMessage(from, {
                        text: '❌ عذراً، لا يوجد فيديوهات متاحة حالياً في مجلد anime'
                    });
                    return;
                }

                const videoPath = animeBot.getVideoPath(videoName);
                
                if (!animeBot.videoExists(videoName)) {
                    await sock.sendMessage(from, {
                        text: `❌ الفيديو ${videoName} غير موجود في المجلد`
                    });
                    return;
                }

                const videoBuffer = fs.readFileSync(videoPath);
                
                if (videoBuffer.length === 0) {
                    await sock.sendMessage(from, {
                        text: `⚠️ الفيديو ${videoName} فارغ. يرجى تحميل فيديو حقيقي`
                    });
                    return;
                }

                // 🕯️ تفاعل عند النجاح في العثور على فيديو
                await sock.sendMessage(from, {
                    react: { text: '🕯️', key: message.key }
                });

                // تأخير بسيط
                await delay(1000);

                // تنسيق الرسالة الجديد بدون إحصائيات
                const caption = `𝑬𝑫𝑰𝑻 𝑨𝑵𝑰𝑴𝑬🍁\n*🪺تم تحميل بواسطة:* ~@${sender.split('@')[0]}~\n\n\`👨🏼‍💻𝑫𝒂𝒓𝒌𝒙𝒆𝒄𝒖𝒕𝒐𝒓\``;

                await sock.sendMessage(from, {
                    video: videoBuffer,
                    caption: caption,
                    contextInfo: {
                        mentionedJid: [sender],
                        forwardingScore: 0,
                        isForwarded: false
                    }
                }, {
                    mediaUploadTimeoutMs: 60000
                });

                // 💎 تفاعل بعد إرسال الفيديو بنجاح
                await sock.sendMessage(from, {
                    react: { text: '💎', key: message.key }
                });

                console.log(`✅ تم إرسال: ${videoName}`);

            } catch (error) {
                console.error('❌ خطأ في أمر .edit:', error);
                const from = message.key.remoteJid;
                
                // تأخير قبل إرسال رسالة الخطأ
                await delay(2000);
                
                await sock.sendMessage(from, {
                    text: '❌ حدث خطأ أثناء تحميل الفيديو. حاول مرة أخرى.'
                });
            }
        }

        async function handleResetCommand(sock, message) {
            try {
                const from = message.key.remoteJid;
                animeBot.resetUsedVideos();
                
                await delay(1000);
                
                await sock.sendMessage(from, {
                    text: `🔄 *تم إعادة تعيين قائمة الفيديوهات*\n\n` +
                          `📹 جميع الفيديوهات متاحة الآن\n\n` +
                          `_استخدم .edit للحصول على فيديو عشوائي_`
                });
            } catch (error) {
                console.error('❌ خطأ في أمر .reset:', error);
            }
        }

        async function handleHelpCommand(sock, message) {
            try {
                const from = message.key.remoteJid;
                
                await delay(1000);
                
                await sock.sendMessage(from, {
                    text: `🎬 *𝑬𝑫𝑰𝑻 𝑨𝑵𝑰𝑴𝑬🍁*\n\n` +
                          `📋 *الأوامر المتاحة:*\n\n` +
                          `🎥 *.edit* - تحميل فيديو عشوائي\n` +
                          `🔄 *.reset* - إعادة تعيين القائمة\n` +
                          `❓ *.help* - عرض هذه المساعدة\n\n` +
                          `👨🏼‍💻 *𝑫𝒂𝒓𝒌𝒙𝒆𝒄𝒖𝒕𝒐𝒓*`
                });
            } catch (error) {
                console.error('❌ خطأ في أمر .help:', error);
            }
        }

        // ===== دالة معالجة أوامر فيسبوك =====
        async function handleFacebookCommand(message, from) {
            try {
                const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
                
                // التحقق من الأوامر
                if (text.startsWith('.فيس') || text.startsWith('.fb')) {
                    await facebookCommand(JawadBot, from, message);
                    return true;
                }
                return false;
            } catch (error) {
                console.error('[Facebook Error]', error);
                return false;
            }
        }

        // ============= دالة معالجة الأوامر =============
        async function handleCommands(message, from) {
            try {
                // التحقق من أن الرسالة تحتوي على نص
                if (!message.message?.conversation && !message.message?.extendedTextMessage?.text) {
                    return false;
                }

                // استخراج النص
                let text = message.message?.conversation || 
                           message.message?.extendedTextMessage?.text || 
                           '';
                
                // ===== معالجة اختيار نتائج فيسبوك =====
                if (global.searchResults && global.searchResults[from]) {
                    const handled = await handleSelection(JawadBot, from, message);
                    if (handled) return true;
                }

                // ===== معالجة أمر فيسبوك =====
                const facebookHandled = await handleFacebookCommand(message, from);
                if (facebookHandled) return true;

                // التحقق من أن النص يبدأ بالأمر
                const prefixes = ['!', '.', '#', '/', '?'];
                let command = '';
                let args = [];
                
                for (const p of prefixes) {
                    if (text.startsWith(p)) {
                        const parts = text.slice(1).trim().split(' ');
                        command = parts[0].toLowerCase();
                        args = parts.slice(1);
                        break;
                    }
                }
                
                if (!command) return false;
                
                // ===== معالجة أوامر APK =====
                const apkAliases = ['apk', 'apkdl', 'getapk', 'تحميل', 'تنزيل'];
                if (apkAliases.includes(command)) {
                    if (args.length === 0) {
                        await JawadBot.sendMessage(from, {
                            text: `❌ *الرجاء كتابة اسم التطبيق*

📌 *مثال:*
\`.apk واتساب\`
\`.apk فيسبوك\`
\`.apk انستغرام\`
\`.apk whatsapp\`

💡 يمكنك استخدام الاسم بالعربية أو الإنجليزية`
                        });
                        return true;
                    }
                    
                    await apkCommand.execute(message, args, JawadBot);
                    return true;
                }
                
                // ===== معالجة أمر الملف الشخصي =====
                const profileAliases = ['profile', 'ملفي', 'جواد'];
                if (profileAliases.includes(command)) {
                    await profileCommand.execute(JawadBot, message, args);
                    return true;
                }
                
                // ===== معالجة أوامر مكافحة الروابط =====
                const antilinkAliases = ['منع الروابط', 'antilink', 'الروابط'];
                if (antilinkAliases.includes(command)) {
                    const { handleAntilinkCommand } = require('./commands/antilink');
                    const sender = message.key.participant || message.key.remoteJid;
                    const isSenderAdmin = await isAdmin(JawadBot, from, sender);
                    await handleAntilinkCommand(JawadBot, from, text, sender, isSenderAdmin, message);
                    return true;
                }
                
                // ===== معالجة أوامر الأنمي المعدلة =====
                switch(command) {
                    case 'edit':
                        await handleEditCommand(JawadBot, message);
                        return true;
                        
                    case 'reset':
                        await handleResetCommand(JawadBot, message);
                        return true;
                        
                    case 'help':
                    case 'مساعدة':
                        await handleHelpCommand(JawadBot, message);
                        return true;
                        
                    default:
                        return false;
                }
                
            } catch (error) {
                console.error('[Command Error]', error);
                return false;
            }
        }

        // ============= معالجة الرسائل =============
        JawadBot.ev.on('messages.upsert', async تحديث_المحادثة => {
            try {
                const الرسالة = تحديث_المحادثة.messages[0]
                if (!الرسالة.message) return
                الرسالة.message = (Object.keys(الرسالة.message)[0] === 'ephemeralMessage') ? الرسالة.message.ephemeralMessage.message : الرسالة.message
                if (الرسالة.key && الرسالة.key.remoteJid === 'status@broadcast') {
                    await handleStatus(JawadBot, تحديث_المحادثة);
                    return;
                }
                
                if (!JawadBot.public && !الرسالة.key.fromMe && تحديث_المحادثة.type === 'notify') {
                    const هل_مجموعة = الرسالة.key?.remoteJid?.endsWith('@g.us')
                    if (!هل_مجموعة) return
                }
                
                if (الرسالة.key.id.startsWith('BAE5') && الرسالة.key.id.length === 16) return

                // تنظيف ذاكرة التخزين المؤقت للرسائل
                if (JawadBot?.msgRetryCounterCache) {
                    JawadBot.msgRetryCounterCache.clear()
                }

                // ===== معالجة مكافحة الروابط (قبل الأوامر) =====
                const from = الرسالة.key?.remoteJid;
                if (from && from.endsWith('@g.us')) {
                    // تشغيل مكافحة الروابط
                    try {
                        await Antilink(الرسالة, JawadBot);
                    } catch (error) {
                        console.error('خطأ في مكافحة الروابط:', error);
                    }
                }

                // ===== معالجة الأوامر =====
                if (from) {
                    const isCommandHandled = await handleCommands(الرسالة, from);
                    if (isCommandHandled) {
                        return; // تم تنفيذ الأمر، لا حاجة لمعالجة أخرى
                    }
                }
                // ===== نهاية معالجة الأوامر =====

                try {
                    await handleMessages(JawadBot, تحديث_المحادثة, true)
                } catch (خطأ) {
                    // تجاهل أخطاء rate limit
                    if (خطأ?.data === 429 || خطأ?.output?.statusCode === 429) {
                        console.log('⚠️ تم تجاوز معدل الطلبات، جاري الانتظار...');
                        await delay(5000);
                        return;
                    }
                    console.error("خطأ في معالجة الرسائل:", خطأ)
                    if (الرسالة.key && الرسالة.key.remoteJid) {
                        await JawadBot.sendMessage(الرسالة.key.remoteJid, {
                            text: '❌ حدث خطأ أثناء معالجة رسالتك.',
                            contextInfo: {
                                forwardingScore: 1,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: global.معرف_القناة,
                                    newsletterName: global.botname,
                                    serverMessageId: -1
                                }
                            }
                        }).catch(console.error);
                    }
                }
            } catch (خطأ) {
                // تجاهل أخطاء rate limit
                if (خطأ?.data === 429 || خطأ?.output?.statusCode === 429) {
                    console.log('⚠️ تم تجاوز معدل الطلبات، جاري الانتظار...');
                    await delay(5000);
                    return;
                }
                console.error("خطأ في تحديث الرسائل:", خطأ)
            }
        })

        // فك تشفير المعرفات
        JawadBot.decodeJid = (jid) => {
            if (!jid) return jid
            if (/:\d+@/gi.test(jid)) {
                let فك = jidDecode(jid) || {}
                return فك.user && فك.server && فك.user + '@' + فك.server || jid
            } else return jid
        }

        JawadBot.ev.on('contacts.update', تحديث => {
            for (let جهة_اتصال of تحديث) {
                let id = JawadBot.decodeJid(جهة_اتصال.id)
                if (store && store.contacts) store.contacts[id] = { id, name: جهة_اتصال.notify }
            }
        })

        JawadBot.getName = (jid, بدون_جهة_اتصال = false) => {
            id = JawadBot.decodeJid(jid)
            بدون_جهة_اتصال = JawadBot.withoutContact || بدون_جهة_اتصال
            let v
            if (id.endsWith("@g.us")) return new Promise(async (حل) => {
                v = store.contacts[id] || {}
                if (!(v.name || v.subject)) v = JawadBot.groupMetadata(id) || {}
                حل(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
            })
            else v = id === '0@s.whatsapp.net' ? {
                id,
                name: 'WhatsApp'
            } : id === JawadBot.decodeJid(JawadBot.user.id) ?
                JawadBot.user :
                (store.contacts[id] || {})
            return (بدون_جهة_اتصال ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
        }

        JawadBot.public = true
        JawadBot.serializeM = (m) => smsg(JawadBot, m, store)

        // ============= معالجة الاتصال =============
        JawadBot.ev.on('connection.update', async (s) => {
            const { connection, lastDisconnect, qr } = s
            
            if (qr) {
                // عرض رابط QR كصورة في الطرفية
                console.log(chalk.yellow('\n📱 امسح رمز QR التالي باستخدام واتساب:\n'))
                console.log(qr)
                console.log(chalk.yellow('\n🔗 إذا لم يظهر الرمز بشكل صحيح، استخدم هذا الرابط:'))
                console.log(chalk.blue(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qr)}`))
                console.log(chalk.yellow('\nالخطوات:'))
                console.log(chalk.white('1. افتح الرابط أعلاه في المتصفح'))
                console.log(chalk.white('2. امسح رمز QR الذي يظهر'))
                console.log(chalk.white('3. افتح واتساب > الإعدادات > الأجهزة المرتبطة > ربط جهاز'))
                console.log(chalk.white('4. امسح الرمز\n'))
            }
            
            if (connection === 'connecting') {
                console.log(chalk.yellow('🔄 جاري الاتصال بـ واتساب...'))
            }
            
            if (connection == "open") {
                console.log(chalk.magenta(` `))
                console.log(chalk.green(`✅ تم الاتصال بنجاح!`))
                console.log(chalk.yellow(`📱 معلومات البوت: ` + JSON.stringify(JawadBot.user, null, 2)))

                try {
                    const رقم_البوت = JawadBot.user.id.split(':')[0] + '@s.whatsapp.net';
                    await JawadBot.sendMessage(رقم_البوت, {
                        text: `🤖 ${global.botname} v1.0.1 متصل بنجاح!\n\n⏰ الوقت: ${new Date().toLocaleString('ar-MA')}\n✅ الحالة: متصل وجاهز!\n\n✅ تأكد من الانضمام إلى القناة أدناه`,
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: global.معرف_القناة,
                                newsletterName: global.botname,
                                serverMessageId: -1
                            }
                        }
                    });
                } catch (خطأ) {
                    console.error('خطأ في إرسال رسالة الاتصال:', خطأ.message)
                }

                await delay(1999)
                console.log(chalk.yellow(`\n\n                  ${chalk.bold.blue(`[ ${global.botname} v1.0.1 ]`)}\n\n`))
                console.log(chalk.cyan(`< ================================================== >`))
                console.log(chalk.magenta(`\n${global.motif_emoji} قناة يوتيوب: ${global.قناة_اليوتيوب}`))
                console.log(chalk.magenta(`${global.motif_emoji} المطور: ${global.مطور}`))
                console.log(chalk.green(`${global.motif_emoji} 🤖 البوت متصل بنجاح! ✅`))
                console.log(chalk.blue(`نسخة البوت: ${settings.version}`))
            }
            
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
                const رمز_الحالة = lastDisconnect?.error?.output?.statusCode
                
                console.log(chalk.red(`تم إغلاق الاتصال بسبب ${lastDisconnect?.error}, إعادة الاتصال ${shouldReconnect}`))
                
                if (رمز_الحالة === DisconnectReason.loggedOut || رمز_الحالة === 401) {
                    try {
                        rmSync('./session', { recursive: true, force: true })
                        console.log(chalk.yellow('تم حذف مجلد الجلسة. الرجاء إعادة المصادقة.'))
                    } catch (خطأ) {
                        console.error('خطأ في حذف الجلسة:', خطأ)
                    }
                    console.log(chalk.red('تم تسجيل الخروج من الجلسة. الرجاء إعادة المصادقة.'))
                }
                
                if (shouldReconnect) {
                    console.log(chalk.yellow('جاري إعادة الاتصال...'))
                    await delay(5000)
                    startJawadBot()
                }
            }
        })

        // ============= مكافحة المكالمات =============
        const المبلغ_عنهم = new Set();

        JawadBot.ev.on('call', async (المكالمات) => {
            try {
                const { readState: readAnticallState } = require('./commands/anticall');
                const الحالة = readAnticallState();
                if (!الحالة.enabled) return;
                for (const مكالمة of المكالمات) {
                    const رقم_المتصل = مكالمة.from || مكالمة.peerJid || مكالمة.chatId;
                    if (!رقم_المتصل) continue;
                    try {
                        try {
                            if (typeof JawadBot.rejectCall === 'function' && مكالمة.id) {
                                await JawadBot.rejectCall(مكالمة.id, رقم_المتصل);
                            } else if (typeof JawadBot.sendCallOfferAck === 'function' && مكالمة.id) {
                                await JawadBot.sendCallOfferAck(مكالمة.id, رقم_المتصل, 'reject');
                            }
                        } catch {}

                        if (!المبلغ_عنهم.has(رقم_المتصل)) {
                            المبلغ_عنهم.add(رقم_المتصل);
                            setTimeout(() => المبلغ_عنهم.delete(رقم_المتصل), 60000);
                            await JawadBot.sendMessage(رقم_المتصل, { text: '📵 مكافحة المكالمات مفعلة. تم رفض مكالمتك وسيتم حظرك.' });
                        }
                    } catch {}
                    setTimeout(async () => {
                        try { await JawadBot.updateBlockStatus(رقم_المتصل, 'block'); } catch {}
                    }, 800);
                }
            } catch (خطأ) {}
        });

        // ============= معالجة تحديثات المجموعة =============
        JawadBot.ev.on('group-participants.update', async (تحديث) => {
            await handleGroupParticipantUpdate(JawadBot, تحديث);
        });

        // ============= معالجة الحالات =============
        JawadBot.ev.on('messages.upsert', async (m) => {
            if (m.messages[0].key && m.messages[0].key.remoteJid === 'status@broadcast') {
                await handleStatus(JawadBot, m);
            }
        });

        JawadBot.ev.on('status.update', async (حالة) => {
            await handleStatus(JawadBot, حالة);
        });

        JawadBot.ev.on('messages.reaction', async (تفاعل) => {
            await handleStatus(JawadBot, تفاعل);
        });

        return JawadBot
    } catch (خطأ) {
        console.error('خطأ في بدء البوت:', خطأ)
        await delay(5000)
        startJawadBot()
    }
}

// دالة isAdmin
async function isAdmin(sock, jid, participant) {
    try {
        const groupMetadata = await sock.groupMetadata(jid);
        const participantData = groupMetadata.participants.find(p => p.id === participant);
        return participantData?.admin === 'admin' || participantData?.admin === 'superadmin';
    } catch (error) {
        console.error('خطأ في التحقق من صلاحيات المشرف:', error);
        return false;
    }
}

// بدء البوت مع معالجة الأخطاء
startJawadBot().catch(خطأ => {
    console.error('خطأ فادح:', خطأ)
    process.exit(1)
})

process.on('uncaughtException', (خطأ) => {
    console.error('استثناء غير ملتقط:', خطأ)
})

process.on('unhandledRejection', (خطأ) => {
    console.error('رفض غير معالج:', خطأ)
})

let الملف = require.resolve(__filename)
fs.watchFile(الملف, () => {
    fs.unwatchFile(الملف)
    console.log(chalk.redBright(`تم تحديث ${__filename}`))
    delete require.cache[الملف]
    require(الملف)
})