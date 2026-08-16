// ===================== إعدادات البوت الأساسية =====================

module.exports = {
    // إصدار البوت
    version: "2.0.0",
    
    // اسم البوت
    botname: "JAWAD.BOT",
    
    // المطور
    ownerName: "DarkXecutor",
    
    // رقم المطور (ضع رقمك هنا مع @s.whatsapp.net)
    ownerNumber: "212600000000@s.whatsapp.net", // غيّر هذا إلى رقمك
    
    // بادئة الأوامر (الرمز الذي يبدأ به الأمر)
    prefix: ".",
    
    // إعدادات القناة
    channelJid: "120363427092431731@newsletter",
    channelLink: "https://whatsapp.com/channel/0029Vb7kJt29Gv7W5J0McQ09",
    
    // مجموعة الدعم
    supportGroup: "https://chat.whatsapp.com/LqoheqNRThHLBDbMCwvV7J?mode=gi_t",
    
    // قناة يوتيوب
    ytChannel: "jawad_bot",
    
    // إعدادات الحماية
    anticall: true,           // منع المكالمات
    antilink: false,          // منع الروابط
    antibadword: false,       // منع الكلمات السيئة
    antidelete: false,        // منع الحذف
    pmblocker: false,         // حظر الرسائل الخاصة
    
    // إعدادات الكتابة التلقائية
    autotyping: false,
    autoread: false,
    
    // عدد التحذيرات قبل الطرد
    warnCount: 3,
    
    // الحد الأقصى لحجم الرفع (بالميجابايت)
    maxUploadSize: 100,
    
    // مدة حفظ الجلسة (بالمللي ثانية)
    storeWriteInterval: 10000,
    
    // إعدادات الذاكرة
    maxMemoryUsage: 400,      // الحد الأقصى للرام بالميجابايت
    
    // وضع الصيانة
    maintenance: false,
    
    // اللغة
    language: "ar",
    
    // الرموز التعبيرية
    emoji: {
        success: "✅",
        error: "❌",
        warning: "⚠️",
        info: "ℹ️",
        loading: "⏳",
        done: "✔️"
    }
};
