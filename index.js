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

// ✅ QR Code حقيقي
let qrcode
try {
    qrcode = require('qrcode-terminal')
} catch (e) {
    qrcode = null
    console.log('⚠️ qrcode-terminal غير مثبت')
}

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

// ============= ✅ استيرادات آمنة =============
function safeRequire(modulePath, fallback = null) {
    try {
        return require(modulePath);
    } catch (e) {
        console.log(`⚠️ تعذر استيراد ${modulePath}: ${e.message.split('\n')[0]}`);
        return fallback;
    }
}

// ✅ متجر خفيف الوزن
let store
try {
    store = require('./lib/lightweight_store')
    store.readFromFile()
} catch (e) {
    console.log('⚠️ lib/lightweight_store.js مفقود')
    store = {
        readFromFile: () => {},
        writeToFile: () => {},
        bind: () => {},
        loadMessage: async () => null,
        contacts: {}
    }
}

// ✅ أمر APK
let apkCommand
try {
    apkCommand = require('./commands/apk')
} catch (e) {
    console.log('⚠️ commands/apk.js مفقود')
    apkCommand = null
}

// ✅ أمر الملف الشخصي
let profileCommand
try {
    profileCommand = require('./commands/profile')
} catch (e) {
    console.log('⚠️ commands/profile.js مفقود')
    profileCommand = null
}

// ✅ بوت الأنمي
let animeBot = null
try {
    const AnimeBot = require('./commands/animeBot')
    animeBot = new AnimeBot()
} catch (e) {
    console.log('⚠️ commands/animeBot.js مفقود — سيتم تعطيل أوامر الأنمي')
}

// ✅ مكافحة الروابط
let Antilink
try {
    ({ Antilink } = require('./lib/antilink'))
} catch (e) {
    console.log('⚠️ lib/antilink.js مفقود')
    Antilink = async () => {}
}

// ✅ أمر فيسبوك
let facebookCommand, handleSelection, COMMANDS
try {
    ({ facebookCommand, handleSelection, COMMANDS } = require('./commands/facebook'))
} catch (e) {
    console.log('⚠️ commands/facebook.js مفقود')
    facebookCommand = null
    handleSelection = null
    COMMANDS = {}
}

// ✅ أمر مكافحة الروابط
let handleAntilinkCommand
try {
    ({ handleAntilinkCommand } = require('./commands/antilink'))
} catch (e) {
    console.log('⚠️ commands/antilink.js مفقود')
    handleAntilinkCommand = async () => {}
}

const settings = require('./settings')
setInterval(() => store.writeToFile(), settings.storeWriteInterval || 10000)

// ✅ isAdmin (ترجع كائن)
async function isAdmin(sock, jid, participant) {
    try {
        const groupMetadata = await sock.groupMetadata(jid);
        const participantData = groupMetadata.participants.find(p => p.id === participant);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const botData = groupMetadata.participants.find(p => p.id === botId);
        return {
            isSenderAdmin: participantData?.admin === 'admin' || participantData?.admin === 'superadmin',
            isBotAdmin: botData?.admin === 'admin' || botData?.admin === 'superadmin'
        };
    } catch (error) {
        console.error('خطأ في isAdmin:', error.message);
        return { isSenderAdmin: false, isBotAdmin: false };
    }
}

// ✅ isSudo محلية
async function isSudo(jid) {
    try {
        if (!jid) return false;
        const sudoFile = './data/sudo.json';
        if (!fs.existsSync(sudoFile)) return false;
        const sudoList = JSON.parse(fs.readFileSync(sudoFile, 'utf-8'));
        if (!Array.isArray(sudoList)) return false;
        const number = jid.split('@')[0].split(':')[0];
        return sudoList.includes(number) || sudoList.includes(jid);
    } catch (e) {
        return false;
    }
}

// تحسين الذاكرة
setInterval(() => {
    if (global.gc) {
        global.gc()
        console.log('🧹 تم تنظيف الذاكرة')
    }
}, 60_000)

// مراقبة الذاكرة
setInterval(() => {
    const المستخدم = process.memoryUsage().rss / 1024 / 1024
    if (المستخدم > 400) {
        console.log('⚠️ الرام مرتفع جداً (>400MB)، جاري إعادة تشغيل البوت...')
        process.exit(1)
    }
}, 30_000)

// ============= معلومات البوت =============
let phoneNumber = ""
let owner = []
try {
    owner = JSON.parse(fs.readFileSync('./data/owner.json'))
} catch (e) {
    console.log('⚠️ data/owner.json مفقود')
    owner = []
}

global.botname = "JAWAD.BOT"
global.motif_emoji = "•"
global.قناة_اليوتيوب = "jawad_bot"
global.مطور = "DarkXecutor"
global.رابط_القناة = "https://whatsapp.com/channel/0029Vb7kJt29Gv7W5J0McQ09"
global.معرف_القناة = "120363427092431731@newsletter"
global.مجموعة_الدعم = "https://chat.whatsapp.com/LqoheqNRThHLBDbMCwvV7J?mode=gi_t"

const pairingCode = false
const useMobile = process.argv.includes("--mobile")

// ✅ منع تشغيل نسختين في نفس العملية
if (global.__JAWAD_BOT_STARTED__) {
    console.log('⚠️ البوت يعمل بالفعل — تم تجاهل التشغيل المكرر')
    return
}
global.__JAWAD_BOT_STARTED__ = true

// دالة بدء البوت
async function startJawadBot() {
    try {
        let { version, isLatest } = await fetchLatestBaileysVersion()
        const { state, saveCreds } = await useMultiFileAuthState(`./session`)
        const msgRetryCounterCache = new NodeCache()

        const JawadBot = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,  // ✅ سنستخدم qrcode-terminal
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
            requestTimeoutMs: 30000,
            patchMessageBeforeSending: (message) => {
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

        JawadBot.ev.on('creds.update', saveCreds)
        store.bind(JawadBot.ev)

        // ============= دوال معالجة أوامر الأنمي =============
        async function handleEditCommand(sock, message) {
            try {
                const from = message.key.remoteJid;
                const sender = message.key.participant || message.key.remoteJid;
                
                if (!animeBot) {
                    await sock.sendMessage(from, { text: '❌ أوامر الأنمي معطلة (ملف animeBot.js مفقود)' });
                    return;
                }
                
                await sock.sendMessage(from, { react: { text: '🔍', key: message.key } });
                await delay(1000);
                
                const videoName = animeBot.getRandomVideo();
                
                if (!videoName) {
                    await sock.sendMessage(from, { text: '❌ عذراً، لا يوجد فيديوهات متاحة حالياً' });
                    return;
                }

                const videoPath = animeBot.getVideoPath(videoName);
                
                if (!animeBot.videoExists(videoName)) {
                    await sock.sendMessage(from, { text: `❌ الفيديو ${videoName} غير موجود` });
                    return;
                }

                const videoBuffer = fs.readFileSync(videoPath);
                
                if (videoBuffer.length === 0) {
                    await sock.sendMessage(from, { text: `⚠️ الفيديو فارغ` });
                    return;
                }

                await sock.sendMessage(from, { react: { text: '🕯️', key: message.key } });
                await delay(1000);

                const caption = `𝑬𝑫𝑰𝑻 𝑨𝑵𝑰𝑴𝑬🍁\n*🪺تم تحميل بواسطة:* ~@${sender.split('@')[0]}~\n\n\`👨🏼‍💻𝑫𝒂𝒓𝒌𝒙𝒆𝒄𝒖𝒕𝒐𝒓\``;

                await sock.sendMessage(from, {
                    video: videoBuffer,
                    caption: caption,
                    contextInfo: {
                        mentionedJid: [sender],
                        forwardingScore: 0,
                        isForwarded: false
                    }
                }, { mediaUploadTimeoutMs: 60000 });

                await sock.sendMessage(from, { react: { text: '💎', key: message.key } });
                console.log(`✅ تم إرسال: ${videoName}`);

            } catch (error) {
                console.error('❌ خطأ في أمر .edit:', error);
                const from = message.key.remoteJid;
                await delay(2000);
                await sock.sendMessage(from, { text: '❌ حدث خطأ أثناء تحميل الفيديو.' });
            }
        }

        async function handleResetCommand(sock, message) {
            try {
                const from = message.key.remoteJid;
                if (animeBot) animeBot.resetUsedVideos();
                await delay(1000);
                await sock.sendMessage(from, {
                    text: `🔄 *تم إعادة تعيين قائمة الفيديوهات*\n\n📹 جميع الفيديوهات متاحة الآن`
                });
            } catch (error) {
                console.error('❌ خطأ في أمر .reset:', error);
            }
        }

        // ===== دالة معالجة أوامر فيسبوك =====
        async function handleFacebookCommand(message, from) {
            try {
                if (!facebookCommand) return false;
                const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
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

        // ============= دالة معالجة الأوامر الخاصة =============
        // ✅ هذه الدالة تعالج فقط: edit, reset, facebook
        // ✅ باقي الأوامر يمررها main.js
        async function handleCommands(message, from) {
            try {
                if (!message.message?.conversation && !message.message?.extendedTextMessage?.text) {
                    return false;
                }

                let text = message.message?.conversation || 
                           message.message?.extendedTextMessage?.text || 
                           '';
                
                // ===== معالجة اختيار نتائج فيسبوك =====
                if (handleSelection && global.searchResults && global.searchResults[from]) {
                    const handled = await handleSelection(JawadBot, from, message);
                    if (handled) return true;
                }

                // ===== معالجة أمر فيسبوك =====
                const facebookHandled = await handleFacebookCommand(message, from);
                if (facebookHandled) return true;

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
                if (apkAliases.includes(command) && apkCommand) {
                    if (args.length === 0) {
                        await JawadBot.sendMessage(from, {
                            text: `❌ *الرجاء كتابة اسم التطبيق*\n\n📌 *مثال:*\n\`.apk واتساب\``
                        });
                        return true;
                    }
                    await apkCommand.execute(message, args, JawadBot);
                    return true;
                }
                
                // ===== معالجة أمر الملف الشخصي =====
                const profileAliases = ['profile', 'ملفي', 'جواد'];
                if (profileAliases.includes(command) && profileCommand) {
                    await profileCommand.execute(JawadBot, message, args);
                    return true;
                }
                
                // ===== معالجة أوامر مكافحة الروابط =====
                const antilinkAliases = ['منع الروابط', 'antilink', 'الروابط'];
                if (antilinkAliases.includes(command)) {
                    const sender = message.key.participant || message.key.remoteJid;
                    const adminStatus = await isAdmin(JawadBot, from, sender);
                    await handleAntilinkCommand(JawadBot, from, text, sender, adminStatus.isSenderAdmin, message);
                    return true;
                }
                
                // ===== معالجة أوامر الأنمي =====
                switch(command) {
                    case 'edit':
                        await handleEditCommand(JawadBot, message);
                        return true;
                    case 'reset':
                        await handleResetCommand(JawadBot, message);
                        return true;
                    default:
                        return false;  // ✅ باقي الأوامر تذهب إلى main.js
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

                if (JawadBot?.msgRetryCounterCache) {
                    JawadBot.msgRetryCounterCache.clear()
                }

                // ===== معالجة مكافحة الروابط =====
                const from = الرسالة.key?.remoteJid;
                if (from && from.endsWith('@g.us')) {
                    try {
                        await Antilink(الرسالة, JawadBot);
                    } catch (error) {
                        console.error('خطأ في مكافحة الروابط:', error.message);
                    }
                }

                // ===== معالجة الأوامر الخاصة (edit/reset/facebook/apk/profile) =====
                if (from) {
                    const isCommandHandled = await handleCommands(الرسالة, from);
                    if (isCommandHandled) {
                        return;
                    }
                }

                // ===== تمرير كل الأوامر الأخرى إلى main.js =====
                try {
                    await handleMessages(JawadBot, تحديث_المحادثة, true)
                } catch (خطأ) {
                    if (خطأ?.data === 429 || خطأ?.output?.statusCode === 429) {
                        console.log('⚠️ rate limit، انتظار 5 ثوان...');
                        await delay(5000);
                        return;
                    }
                    console.error("خطأ في معالجة الرسائل:", خطأ.message)
                }
            } catch (خطأ) {
                if (خطأ?.data === 429 || خطأ?.output?.statusCode === 429) {
                    console.log('⚠️ rate limit، انتظار...');
                    await delay(5000);
                    return;
                }
                console.error("خطأ في تحديث الرسائل:", خطأ.message)
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
        JawadBot.serializeM = (m) => smsg ? smsg(JawadBot, m, store) : null

        // ============= معالجة الاتصال =============
        let qrShownCount = 0;  // ✅ عدّاد لمنع تكرار QR
        JawadBot.ev.on('connection.update', async (s) => {
            const { connection, lastDisconnect, qr } = s
            
            if (qr) {
                qrShownCount++;
                console.log(chalk.yellow(`\n📱 امسح رمز QR (محاولة ${qrShownCount}):\n`))
                if (qrcode) {
                    qrcode.generate(qr, { small: true })
                } else {
                    console.log(chalk.blue(qr))
                }
                console.log(chalk.white('\nالخطوات:'))
                console.log(chalk.white('1. امسح QR أعلاه مباشرة من واتساب'))
                console.log(chalk.white('2. واتساب > الإعدادات > الأجهزة المرتبطة > ربط جهاز'))
                console.log(chalk.white('3. لا تنتظر — امسح فورًا\n'))
            }
            
            if (connection === 'connecting') {
                console.log(chalk.yellow('🔄 جاري الاتصال بـ واتساب...'))
            }
            
            if (connection == "open") {
                qrShownCount = 0;  // ✅ إعادة تعيين عند النجاح
                console.log(chalk.green(`\n✅ تم الاتصال بنجاح!`))
                console.log(chalk.yellow(`📱 معلومات البوت: ` + JSON.stringify(JawadBot.user, null, 2)))

                try {
                    const رقم_البوت = JawadBot.user.id.split(':')[0] + '@s.whatsapp.net';
                    await JawadBot.sendMessage(رقم_البوت, {
                        text: `🤖 ${global.botname} v1.0.1 متصل بنجاح!\n\n⏰ ${new Date().toLocaleString('ar-MA')}`
                    });
                } catch (خطأ) {
                    console.error('خطأ في إرسال رسالة الاتصال:', خطأ.message)
                }

                await delay(1999)
                console.log(chalk.cyan(`< ================================================== >`))
                console.log(chalk.magenta(`${global.motif_emoji} قناة يوتيوب: ${global.قناة_اليوتيوب}`))
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
                        console.log(chalk.yellow('تم حذف مجلد الجلسة.'))
                    } catch (خطأ) {
                        console.error('خطأ في حذف الجلسة:', خطأ)
                    }
                }
                
                if (shouldReconnect) {
                    // ✅ انتظار أطول عند conflict
                    const waitTime = (رمز_الحالة === 515 || رمز_الحالة === 440 || رمز_الحالة === 428) ? 30000 : 5000
                    console.log(chalk.yellow(`جاري إعادة الاتصال بعد ${waitTime/1000} ثانية...`))
                    await delay(waitTime)
                    // ✅ منع التشغيل المكرر — إعادة تعيين العلم
                    global.__JAWAD_BOT_STARTED__ = false
                    startJawadBot()
                }
            }
        })

        // ============= مكافحة المكالمات =============
        const المبلغ_عنهم = new Set();

        JawadBot.ev.on('call', async (المكالمات) => {
            try {
                let readAnticallState
                try {
                    ({ readState: readAnticallState } = require('./commands/anticall'));
                } catch {
                    return;
                }
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
                            await JawadBot.sendMessage(رقم_المتصل, { text: '📵 مكافحة المكالمات مفعلة.' });
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
            try { await handleGroupParticipantUpdate(JawadBot, تحديث); } catch (e) {}
        });

        // ============= معالجة الحالات =============
        JawadBot.ev.on('status.update', async (حالة) => {
            try { await handleStatus(JawadBot, حالة); } catch (e) {}
        });

        JawadBot.ev.on('messages.reaction', async (تفاعل) => {
            try { await handleStatus(JawadBot, تفاعل); } catch (e) {}
        });

        return JawadBot
    } catch (خطأ) {
        console.error('خطأ في بدء البوت:', خطأ)
        await delay(5000)
        global.__JAWAD_BOT_STARTED__ = false
        startJawadBot()
    }
}

// ✅ تصدير الدوال
module.exports = {
    isSudo,
    isAdmin,
    startJawadBot
}

// بدء البوت مع معالجة الأخطاء
startJawadBot().catch(خطأ => {
    console.error('خطأ فادح:', خطأ)
    process.exit(1)
})

process.on('uncaughtException', (خطأ) => {
    console.error('استثناء غير ملتقط:', خطأ.message)
})

process.on('unhandledRejection', (خطأ) => {
    console.error('رفض غير معالج:', خطأ?.message || خطأ)
})

let الملف = require.resolve(__filename)
fs.watchFile(الملف, () => {
    fs.unwatchFile(الملف)
    console.log(chalk.redBright(`تم تحديث ${__filename}`))
    delete require.cache[الملف]
    require(الملف)
})
