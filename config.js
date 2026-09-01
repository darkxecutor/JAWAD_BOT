require('dotenv').config();

// ===================== إعدادات واجهات برمجة التطبيقات (APIs) =====================

global.APIs = {
    xteam: 'https://api.xteam.xyz',
    dzx: 'https://api.dhamzxploit.my.id',
    lol: 'https://api.lolhuman.xyz',
    violetics: 'https://violetics.pw',
    neoxr: 'https://api.neoxr.my.id',
    zenzapis: 'https://zenzapis.xyz',
    akuari: 'https://api.akuari.my.id',
    akuari2: 'https://apimu.my.id',
    nrtm: 'https://fg-nrtm.ddns.net',
    bg: 'http://bochil.ddns.net',
    fgmods: 'https://api-fgmods.ddns.net'
};

global.APIKeys = {
    'https://api.xteam.xyz': 'd90a9e986e18778b',
    'https://api.lolhuman.xyz': '85faf717d0545d14074659ad',
    'https://api.neoxr.my.id': 'yourkey',
    'https://violetics.pw': 'beta',
    'https://zenzapis.xyz': 'yourkey',
    'https://api-fgmods.ddns.net': 'fg-dylux'
};

// ===================== إعدادات البوت =====================

module.exports = {
    WARN_COUNT: 3,                    // عدد التحذيرات قبل طرد العضو
    APIs: global.APIs,
    APIKeys: global.APIKeys,
    
    // إعدادات إضافية (يمكنك إضافتها حسب الحاجة)
    SESSION_NAME: 'session',          // اسم مجلد الجلسة
    OWNER_NAME: 'DarkXecutor',        // اسم المطور
    BOT_NAME: 'JAWAD.BOT',            // اسم البوت
    
    // إعدادات القناة
    CHANNEL_JID: '120363427092431731@newsletter',
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029Vb7kJt29Gv7W5J0McQ09',
    
    // إعدادات مجموعة الدعم
    SUPPORT_GROUP: 'https://chat.whatsapp.com/LqoheqNRThHLBDbMCwvV7J?mode=gi_t',
    
    // إعدادات يوتيوب
    YT_CHANNEL: 'jawad_bot',
    
    // إعدادات أخرى
    MAX_UPLOAD_SIZE: 100,             // الحد الأقصى لحجم الرفع بالميجابايت
    AUTO_READ: false,                 // القراءة التلقائية
    AUTO_TYPING: false,               // الكتابة التلقائية
    ANTI_CALL: true,                  // منع المكالمات
    PM_BLOCKER: false,                // حظر الرسائل الخاصة
    ANTI_LINK: false,                 // منع الروابط
    ANTI_BADWORD: false,              // منع الكلمات السيئة
    ANTI_DELETE: false                // منع الحذف
};