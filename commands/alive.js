const settings = require("../settings");

async function aliveCommand(sock, chatId, message) {
    try {
        // تفاعل فوري مع المستخدم
        await sock.sendMessage(chatId, { 
            react: { 
                text: '🥑', 
                key: message.key 
            } 
        });

        // رسالة تحميل مؤقتة
        await sock.sendMessage(chatId, { 
            text: '🥑 *جاري تجهيز معلومات البوت...*' 
        }, { quoted: message });

        const now = new Date();
        const timeString = now.toLocaleString('ar-EG', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        // إحصائيات البوت
        const groups = await sock.groupFetchAllParticipating();
        const totalGroups = Object.keys(groups).length;
        const uptime = process.uptime();
        const memory = process.memoryUsage();
        const os = require('os');

        // اسم المستخدم
        const sender = message.key.remoteJid;
        const name = await sock.getName(sender) || 'صديقي';

        // اقتباسات تفاعلية مع 🥑
        const quotes = [
            '🥑 "الأفوكادو يجعل الحياة أفضل!"',
            '💚 "مع البوت والأفوكادو، كل شيء ممكن"',
            '🥑 "بوت صحي مثل الأفوكادو!"',
            '🌟 "أفوكادو بوت - اختيارك الذكي"',
            '🥑 "طازج مثل الأفوكادو، قوي مثل البوت"'
        ];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        // ردود فعل عشوائية للمستخدم
        const userReactions = ['🥑', '💚', '🌟', '✨', '🎯'];
        const randomReaction = userReactions[Math.floor(Math.random() * userReactions.length)];

        // بناء الرسالة الرئيسية
        const message1 = `*🥑 مرحباً ${name}!* JAWAD.BOT يعمل الآن!\n\n` +
                       `*📌 الإصدار:* 1.0.1 🥑\n` +
                       `*✅ الحالة:* متصل وجاهز للخدمة\n` +
                       `*🌐 الوضع:* عام - VIP\n` +
                       `*🕒 الوقت الحالي:* ${timeString}\n\n` +
                       `*📊 إحصائيات البوت:*\n` +
                       `• مجموعات نشطة: ${totalGroups} 👥\n` +
                       `• وقت التشغيل: ${Math.floor(uptime / 3600)} ساعة و ${Math.floor((uptime % 3600) / 60)} دقيقة\n` +
                       `• استخدام الذاكرة: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB\n` +
                       `• المعالج: ${os.cpus()[0].model.split('@')[0].trim()}\n\n` +
                       `*🌟 المميزات المتاحة:*\n` +
                       `• إدارة المجموعات 👥\n` +
                       `• حماية الروابط 🔗\n` +
                       `• أوامر ترفيهية 🎭\n` +
                       `• تحميل فيديوهات وأغاني 🎵\n` +
                       `• ذكاء اصطناعي متقدم 🤖\n` +
                       `• ترجمة فورية 🌍\n` +
                       `• إنشاء ملصقات 🎨\n` +
                       `• والمزيد قيد التطوير! 🚀\n\n` +
                       `*⚡ الأوامر السريعة:*\n` +
                       `• ${settings.prefix}menu - القائمة الرئيسية 📋\n` +
                       `• ${settings.prefix}help - المساعدة ❓\n` +
                       `• ${settings.prefix}owner - المطور 👨‍💻\n` +
                       `• ${settings.prefix}ping - سرعة البوت 🏓\n` +
                       `• ${settings.prefix}stats - إحصائيات مفصلة 📊\n\n` +
                       `*🎯 نصيحة اليوم:*\n${randomQuote}\n\n` +
                       `*💚 تفاعل مع البوت:*\n` +
                       `• أرسل ${randomReaction} للتفاعل\n` +
                       `• استخدم .اوامر لمشاهدة كل الأوامر\n` +
                       `• شارك البوت مع أصدقائك! 🥑\n\n` +
                       `━━━━━━━━━━━━━━━━━━━━━\n` +
                       `📢 *قناة البوت:* ${global.channelLink || 'https://whatsapp.com/channel/0029Vb7kJt29Gv7W5J0McQ09'}\n` +
                       `👨‍💻 *المطور:* ${global.developer || 'DarkXecutor'}\n` +
                       `🥑 *نسخة الأفوكادو:* 1.0.1`;

        // إرسال الرسالة مع تفاعل إضافي
        await sock.sendMessage(chatId, {
            text: message1,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.channelId || '120363427092431731@newsletter',
                    newsletterName: 'JAWAD.BOT 🥑',
                    serverMessageId: -1
                },
                externalAdReply: {
                    title: '🥑 JAWAD.BOT V1.0.1',
                    body: 'بوت الأفوكادو الذكي',
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    thumbnailUrl: 'https://i.ibb.co/your-image-link' // غير الرابط حسب رغبتك
                }
            }
        }, { quoted: message });

        // تفاعل نهائي مع المستخدم
        setTimeout(async () => {
            await sock.sendMessage(chatId, { 
                react: { 
                    text: '💚', 
                    key: message.key 
                } 
            });
        }, 1000);

        // رسالة ترحيبية إضافية للمستخدم الجديد
        if (!global.userGreeted) {
            global.userGreeted = new Set();
        }
        
        if (!global.userGreeted.has(sender)) {
            global.userGreeted.add(sender);
            await sock.sendMessage(chatId, { 
                text: `🥑 *أهلاً بك ${name}!* شكراً لاستخدامك بوت JAWAD.BOT!\n\nأتمنى لك تجربة ممتعة مع البوت 💚` 
            }, { quoted: message });
        }

    } catch (error) {
        console.error('خطأ في أمر التحقق من البوت:', error);
        await sock.sendMessage(chatId, { 
            text: '🥑 JAWAD.BOT يعمل الآن وبخدمتك! الإصدار 1.0.1' 
        }, { quoted: message });
        
        // تفاعل حتى في حالة الخطأ
        await sock.sendMessage(chatId, { 
            react: { 
                text: '💚', 
                key: message.key 
            } 
        });
    }
}

module.exports = aliveCommand;