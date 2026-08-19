// 🔥 أمر تهكير - أداة هاكر وهمية للتسلية
// .تهكير - يعطي انطباع بأنه يخترق حساب الشخص

const fs = require('fs');
const path = require('path');

// قائمة بأسماء الهاكرز الوهمية
const hackerNames = [
    '🕵️ 𝐀𝐍𝐎𝐍𝐘𝐌𝐎𝐔𝐒',
    '👾 𝐂𝐘𝐁𝐄𝐑 𝐆𝐇𝐎𝐒𝐓',
    '💀 𝐃𝐀𝐑𝐊 𝐇𝐀𝐂𝐊𝐄𝐑',
    '🔥 𝐍𝐄𝐓 𝐖𝐀𝐑𝐑𝐈𝐎𝐑',
    '⚡ 𝐃𝐈𝐆𝐈𝐓𝐀𝐋 𝐒𝐇𝐀𝐃𝐎𝐖',
    '🎯 𝐏𝐑𝐎𝐉𝐄𝐂𝐓 𝐙𝐄𝐑𝐎',
    '🌐 𝐃𝐄𝐀𝐃𝐋𝐘 𝐂𝐘𝐁𝐄𝐑',
    '💻 𝐄𝐋𝐈𝐓𝐄 𝐇𝐀𝐂𝐊𝐄𝐑'
];

// قائمة بأسماء الأدوات الوهمية
const tools = [
    '🔧 Nmap Scan Engine v4.2',
    '🛠️ Metasploit Framework v6.1',
    '⚙️ SQL Injection Tool v3.0',
    '🔑 Password Cracker Pro',
    '📡 Network Sniffer X',
    '🖥️ Rootkit Installer v2.1',
    '🔓 Encryption Breaker v5.0',
    '📱 WhatsApp Exploit Tool'
];

// قائمة بعمليات الهاكر الوهمية
const hackingSteps = [
    'جاري فحص المنافذ...',
    'جاري اختراق جدار الحماية...',
    'جاري تحليل البيانات المشفرة...',
    'جاري اختراق قاعدة البيانات...',
    'جاري استخراج المعلومات الشخصية...',
    'جاري كسر التشفير...',
    'جاري تحميل البرامج الضارة...',
    'جاري اختراق الحساب...',
    'جاري تنزيل الملفات...',
    'جاري اختراق الكاميرا...',
    'جاري الوصول إلى الميكروفون...',
    'جاري استخراج المحادثات...',
    'جاري تحليل السلوك...',
    'جاري تتبع الموقع...',
    'جاري اختراق الواتساب...'
];

// دالة للحصول على عنصر عشوائي من القائمة
function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// دالة لتأخير التنفيذ
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// دالة لإنشاء شريط تقدم عشوائي
function getRandomProgress() {
    const total = 30;
    const done = Math.floor(Math.random() * total);
    const progress = '█'.repeat(done) + '░'.repeat(total - done);
    const percent = Math.round((done / total) * 100);
    return { progress, percent };
}

async function hackCommand(sock, chatId, message, argText, command, ctx) {
    if (!(await ctx.requireOwner())) return;
    if (!(await ctx.requireGroup('❌ هذا الأمر فقط للمجموعات.'))) return;

    // جلب معلومات المستخدم المستهدف
    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    let targetJid = null;
    let targetName = 'المستخدم';

    // تحديد المستهدف (المرسل إليه أو المذكور أو الراد عليه)
    if (quotedMsg) {
        targetJid = message.message.extendedTextMessage.contextInfo.participant || 
                   message.message.extendedTextMessage.contextInfo.mentionedJid?.[0];
    } else if (mentionedJids.length > 0) {
        targetJid = mentionedJids[0];
    } else {
        targetJid = message.key.participant || message.key.remoteJid;
    }

    // محاولة جلب اسم المستخدم
    try {
        const contactInfo = await sock.onWhatsApp(targetJid);
        if (contactInfo && contactInfo[0]) {
            const contact = await sock.getContactById(targetJid);
            if (contact) {
                targetName = contact.name || contact.notify || targetJid.split('@')[0];
            }
        }
    } catch (e) {
        // إذا فشل جلب الاسم، نستخدم الرقم
        targetName = targetJid.split('@')[0] || 'المستخدم';
    }

    // إذا كان المستهدف هو البوت نفسه
    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    if (targetJid === botJid) {
        await sock.sendMessage(chatId, {
            text: '❌ لا يمكنك اختراق البوت نفسه! 😅',
            ...ctx.channelInfo
        }, { quoted: message });
        return;
    }

    // اختيار هاكر عشوائي
    const hacker = getRandomItem(hackerNames);
    const tool = getRandomItem(tools);

    // ===== بدء عملية الاختراق الوهمية =====
    
    // 1. إرسال رسالة البدء
    await sock.sendMessage(chatId, {
        text: `╭━━━〔 🔥 𝙃𝘼𝘾𝙆𝙄𝙉𝙂 𝘼𝙏𝙏𝘼𝘾𝙆 🔥 〕━━━╮

🎯 المستهدف: *${targetName}*
🆔 المعرف: *${targetJid.split('@')[0]}*
👤 الهاكر: *${hacker}*

━━━━━━━━━━━━━━━━━━━━━━

⚡ جاري بدء عملية الاختراق...

🛠️ الأداة المستخدمة: ${tool}

╰━━━━━━━━━━━━━━━━━━━━━━╯`,
        ...ctx.channelInfo
    }, { quoted: message });

    await delay(1500);

    // 2. إرسال رسالة "جاري الاختراق" مع تقدم وهمي
    for (let i = 0; i < 5; i++) {
        const step = getRandomItem(hackingSteps);
        const progress = getRandomProgress();
        
        await sock.sendMessage(chatId, {
            text: `⚡ *جاري الاختراق...*
            
${step}

[${progress.progress}] ${progress.percent}%

⏳ الوقت المتبقي: ${Math.floor(Math.random() * 10 + 2)} ثانية

━━━━━━━━━━━━━━━━━━━━━━
👤 ${hacker}`,
            ...ctx.channelInfo
        }, { quoted: message });

        // تأخير عشوائي بين 1.5 و 3 ثواني
        await delay(Math.floor(Math.random() * 1500 + 1500));
    }

    // 3. رسالة "تم اختراق الحساب"
    await sock.sendMessage(chatId, {
        text: `╭━━━〔 ✅ 𝙃𝘼𝘾𝙆𝙄𝙉𝙂 𝙎𝙐𝘾𝘾𝙀𝙎𝙎𝙁𝙐𝙇 ✅ 〕━━━╮

🎯 المستهدف: *${targetName}*
🆔 المعرف: *${targetJid.split('@')[0]}*
👤 الهاكر: *${hacker}*

━━━━━━━━━━━━━━━━━━━━━━

✅ *تم اختراق الحساب بنجاح!*

📊 المعلومات المسروقة:
• 🆔 معرف الجهاز: *${targetJid}*
• 📱 رقم الهاتف: *${targetJid.split('@')[0]}*
• 🌐 نظام التشغيل: *${Math.random() > 0.5 ? 'Android' : 'iOS'}*
• 📶 نوع الشبكة: *${Math.random() > 0.5 ? 'WiFi' : '4G'}*
• 🔒 مستوى التشفير: *${Math.floor(Math.random() * 100)}%*
• 📝 عدد المحادثات: *${Math.floor(Math.random() * 500 + 50)}*
• 📁 حجم البيانات: *${(Math.random() * 50 + 10).toFixed(1)} MB*

━━━━━━━━━━━━━━━━━━━━━━

⚠️ *تم إرسال تقرير مفصل إلى الخاص!*

📢 *تم الاختراق بواسطة:* ${hacker}

╰━━━━━━━━━━━━━━━━━━━━━━╯`,
        ...ctx.channelInfo
    }, { quoted: message });

    await delay(1000);

    // 4. إرسال تقرير مفصل في الخاص
    try {
        const report = `╭━━━〔 📊 𝙃𝘼𝘾𝙆 𝙍𝙀𝙋𝙊𝙍𝙏 📊 〕━━━╮

📋 *تقرير الاختراق المفصل*

👤 المستهدف: *${targetName}*
🆔 المعرف: *${targetJid}*
📱 الرقم: *${targetJid.split('@')[0]}*

━━━━━━━━━━━━━━━━━━━━━━

📁 *البيانات المسروقة:*

1️⃣ 📱 معلومات الجهاز:
   • النظام: ${Math.random() > 0.5 ? 'Android 13' : 'iOS 16.4'}
   • الذاكرة: ${Math.floor(Math.random() * 8 + 4)}GB RAM
   • التخزين: ${Math.floor(Math.random() * 128 + 32)}GB
   • البطارية: ${Math.floor(Math.random() * 100)}%

2️⃣ 🌐 معلومات الشبكة:
   • IP: ${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}
   • الموقع: ${['الدار البيضاء', 'الرباط', 'مراكش', 'فاس', 'طنجة', 'أكادير'][Math.floor(Math.random() * 6)]}
   • المزود: ${['Maroc Telecom', 'Orange', 'Inwi'][Math.floor(Math.random() * 3)]}

3️⃣ 💬 معلومات الحساب:
   • عدد جهات الاتصال: ${Math.floor(Math.random() * 200 + 20)}
   • عدد المجموعات: ${Math.floor(Math.random() * 50 + 5)}
   • عدد المحادثات: ${Math.floor(Math.random() * 1000 + 100)}
   • عدد الصور: ${Math.floor(Math.random() * 500 + 50)}
   • عدد الفيديوهات: ${Math.floor(Math.random() * 100 + 10)}

4️⃣ 🔐 معلومات الأمان:
   • كلمات المرور: ${Math.floor(Math.random() * 10 + 1)} كلمة
   • درجة الأمان: ${Math.floor(Math.random() * 100)}%
   • ثغرات مكتشفة: ${Math.floor(Math.random() * 5 + 1)}

━━━━━━━━━━━━━━━━━━━━━━

⚡ *تم تنفيذ العملية بواسطة:*
${hacker}

🕐 الوقت: ${new Date().toLocaleString('ar-MA')}

⚠️ *هذا التقرير للتسلية فقط!*

╰━━━━━━━━━━━━━━━━━━━━━━╯`;

        await sock.sendMessage(targetJid, {
            text: report,
            ...ctx.channelInfo
        });

        await sock.sendMessage(chatId, {
            text: `✅ تم إرسال التقرير المفصل إلى الخاص بنجاح! 📨`,
            ...ctx.channelInfo
        }, { quoted: message });

    } catch (error) {
        // إذا فشل إرسال التقرير للخاص
        await sock.sendMessage(chatId, {
            text: `⚠️ تعذر إرسال التقرير للخاص. قد يكون المستخدم قام بحظر البوت.`,
            ...ctx.channelInfo
        }, { quoted: message });
    }

    // 5. إرسال رسالة نهائية
    await delay(1000);
    await sock.sendMessage(chatId, {
        text: `╭━━━〔 💀 𝙃𝘼𝘾𝙆 𝘾𝙊𝙈𝙋𝙇𝙀𝙏𝙀 💀 〕━━━╮

🎯 *تم اختراق:* ${targetName}

💀 *الحالة:* ✅ مكتمل

📊 *البيانات المستخرجة:* ${Math.floor(Math.random() * 100 + 10)} ملف

⚡ *تم بواسطة:* ${hacker}

━━━━━━━━━━━━━━━━━━━━━━

🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 ${global.botName || 'JAWAD.BOT'}

╰━━━━━━━━━━━━━━━━━━━━━━╯`,
        ...ctx.channelInfo
    }, { quoted: message });

    // رد فعل نهائي
    await sock.sendMessage(chatId, {
        react: { text: "💀", key: message.key }
    });
}

module.exports = {
    name: 'تهكير',
    aliases: ['hack', 'اختراق', 'هاك'],
    category: 'group',
    description: 'أداة هاكر وهمية للتسلية (ترسل تقرير للخاص)',
    ownerOnly: true,
    run: hackCommand
};