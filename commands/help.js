const settings = require('../settings');
const fs = require('fs');
const path = require('path');

// قائمة مسارات الصور المتاحة
const imagePaths = [
    path.join(__dirname, '../assets/jawad.jpeg'),
    path.join(__dirname, '../assets/help1.jpeg'),
    path.join(__dirname, '../assets/help2.jpeg'),
    path.join(__dirname, '../assets/help3.jpeg'),
    path.join(__dirname, '../assets/help4.jpeg')
];

// قائمة الأسماء المستعارة للأمر
const ALIASES = ['help', 'menu', 'قائمة', 'اوامر', 'أوامر', 'بوت', 'bot'];

async function helpCommand(sock, chatId, message) {
    // استخراج النص من الرسالة
    let messageText = '';
    if (message?.message?.conversation) {
        messageText = message.message.conversation;
    } else if (message?.message?.extendedTextMessage?.text) {
        messageText = message.message.extendedTextMessage.text;
    } else if (message?.message?.imageMessage?.caption) {
        messageText = message.message.imageMessage.caption;
    } else if (message?.message?.videoMessage?.caption) {
        messageText = message.message.videoMessage.caption;
    }
    
    // استخراج الأمر (أول كلمة)
    const command = messageText.trim().split(' ')[0].toLowerCase();
    
    // التحقق مما إذا كان الأمر من الأسماء المستعارة
    const isHelpCommand = ALIASES.some(alias => command === `.${alias}`);
    
    // إذا لم يكن أمر مساعدة، نخرج من الدالة
    if (!isHelpCommand) return;

    const helpMessage = `
*╗═════════☕═════════╔*
      *𝑱𝑨𝑾𝑨𝑫.𝑩𝑶𝑻🕷️*
    *𝑽𝒆𝒓𝒔𝒊𝒐𝒏: 1.0.1🎲*
    *𝑫𝒆𝒗: 𝑫𝒂𝒓𝒌𝑿𝒆𝒄𝒖𝒕𝒐𝒓👨🏼‍💻*
*╝═════════🦊═════════╚*
⚡💫*﴿أوامر المشرفين﴾*
*╗═════════🍔═════════╔*
   ∙ᵐᵘᵗᵉ➫🔓
   ∙ᵘⁿᵐᵘᵗᵉ➫🔒
   ∙ᵏⁱᶜᵏ➫🦶🏼
   ∙ᵈᵉˡᵉᵗᵉ➫🗑️
   ∙ᶜʰᵃᵗᵇᵒᵗ➫👾
   ∙ʰⁱᵈᵉᵗᵃᵍ➫👻
   ∙ᵗᵃᵍⁿᵒᵗᵃᵈᵐⁱⁿ➫🧸
   ∙ᵗᵃᵍᵃˡˡ➫📣
   ∙ᵗᵃᵍ➫📢
   ∙ᵇᵃⁿ➫🚫
   ∙ᵖʳᵒᵐᵒᵗᵉ➫🔱
   ∙ᵈᵉᵐᵒᵗᵉ➫💤
   ∙ʷᵃʳⁿⁱⁿᵍˢ➫🚸
   ∙ʷᵃʳⁿ➫⚠️
   ∙ᵃⁿᵗⁱˡⁱⁿᵏ➫🖇️
   ∙ᵃⁿᵗⁱᵇᵃᵈʷᵒʳᵈ➫📵
   ∙ᶜˡᵉᵃʳ➫🧹
   ∙ʳᵉˢᵉᵗˡⁱⁿᵏ➫♻️
   ∙ᵃⁿᵗⁱᵗᵃᵍ➫🔇
   ∙ᵍᵒᵒᵈᵇʸᵉ➫👋🏻
   ∙ʷᵉˡᶜᵒᵐᵉ➫🫱🏻‍🫲🏻
   ∙ˢᵉᵗᵍᵈᵉˢᶜ➫📰
   ∙ˢᵉᵗᵍⁿᵃᵐᵉ➫🖋️
   ∙ˢᵉᵗᵍᵖᵖ➫⛳
   ∙ᵐᵒᵈᵉ➫🏒
   ∙ᶜˡᵉᵃʳˢᵉˢˢⁱᵒⁿ➫🔄
   ∙ᵃⁿᵗⁱᵈᵉˡᵉᵗᵉ➫🔰
   ∙ᶜˡᵉᵃʳᵗᵐᵖ➫🧽
   ∙ᵘᵖᵈᵃᵗᵉ➫♻️
   ∙ˢᵉᵗᵗⁱⁿᵍˢ➫🛠️
   ∙ˢᵉᵗᵖᵖ➫🪪
   ∙ᵃᵘᵗᵒʳᵉᵃᶜᵗ➫🥰
   ∙ᵃᵘᵗᵒˢᵗᵃᵗᵘˢ➫🫆
   ∙ᵃᵘᵗᵒᵗʸᵖⁱⁿᵍ➫😘
   ∙ᵃᵘᵗᵒʳᵉᵃᵈ➫😼
   ∙ᵃⁿᵗⁱᶜᵃˡˡ➫📵
   ∙ᵖᵐᵇˡᵒᶜᵏᵉʳ➫🔐
   ∙ˢᵉᵗᵐᵉⁿᵗⁱᵒⁿ➫〽️
   ∙ᵐᵉⁿᵗⁱᵒⁿ➫📯
*╝═════════🍇═════════╚*
🧲💎*﴿أوامر الصور & الملصقات﴾*
*╗═════════🍁═════════╔*
   ∙ᵇˡᵘʳ➫🌫️
   ∙ˢⁱᵐᵃᵍᵉ➫🖼️
   ∙ˢᵗⁱᶜᵏᵉʳ➫🏷️
   ∙ʳᵉᵐᵒᵛᵉᵇᵍ➫🧹
   ∙ʳᵉᵐⁱⁿⁱ➫✨
   ∙ᶜʳᵒᵖ➫✂️
   ∙ᵗᵍˢⁱᶜᵏᵉʳ➫🔗
   ∙ᵐᵉᵐᵉ➫😂
   ∙ᵗᵃᵏᵉ➫📦
   ∙ᵉᵐᵒʲⁱᵐⁱˣ➫😎
   ∙ⁱᵍˢ➫📸
   ∙ⁱᵍˢᶜ➫🎞️
*╝═════════🪾═════════╚*
🤹🏼🎮*﴿أوامر الألعاب والألغاز﴾*
*╗═════════🍡═════════╔*
   ∙ᵗⁱᶜᵗᵃᶜᵗᵒᵉ➫♟️
   ∙ʰᵃⁿᵍᵐᵃⁿ➫🧞
   ∙ᵍᵘᵉˢˢ➫🎲
   ∙ᵗʳⁱᵛⁱᵃ➫🧠
   ∙ᵃⁿˢʷᵉʳ➫🎯
   ∙ᵗʳᵘᵗʰ➫🫦
   ∙ᵈᵃʳᵉ➫😈
*╝═════════🌶️═════════╚*
🪔🎎*﴿أوامر الأنمي﴾*
*╗═════════🏮═════════╔*
    ∙ᵉᵈⁱᵗ➫💉
    ∙ᵘᵉʳᵃ➫⚔️
    ∙ᵃⁿⁱᵐᵉ➫🪭
    ∙ˢᵖᵃˢᵗᵒᵒⁿ➫🔮
    ∙ⁿᵒᵐ➫😾
    ∙ᵖᵒᵏᵉ➫⚡
    ∙ᶜʳʸ➫🌚
    ∙ᵖᵃᵗ➫🌾
    ∙ʰᵘᵍ➫🫎
    ∙ʷⁱⁿᵏ➫🍒
*╝═════════🪭═════════╚*
🪄📥*﴿أوامر التحميل﴾*
*╗═════════📦═════════╔*
   ∙ᵖˡᵃʸ➫🎥
   ∙ˢᵒⁿᵍ➫🎵
   ∙ᵃᵖᵏ➫🚀
   ∙ˢᵖᵒᵗⁱᶠʸ➫🎶
   ∙ⁱⁿˢᵗᵃᵍʳᵃᵐ➫🩷
   ∙ᶠᵃᶜᵉᵇᵒᵒᵏ➫💙
   ∙ᵗⁱᵏᵗᵒᵏ➫💜
   ∙ᵛⁱᵈᵉᵒ➫📽️
   ∙ʸᵗᵐᵖ⁴➫🎞️
*╝═════════🕯️═════════╚*
🧩👾*﴿أوامر ذكاء اصطناعي﴾*
*╗═════════🧠═════════╔*
   ∙ᵍᵖᵗ➫🦾
   ∙ᵍᵉᵐⁱⁿⁱ➫🎓
   ∙ⁱᵐᵃᵍⁱⁿᵉ➫🐶
   ∙ᶠˡᵘˣ➫🐯
   ∙ˢᵒʳᵃ➫🍂
*╝═════════🧞‍♂️═════════╚*
✒️📰*﴿أوامر ثأثير النصوص وزخرفة﴾*
*╗═════════🧸═════════╔*
   ∙ᵐᵉᵗᵃˡˡⁱᶜ➫🪙
   ∙ⁱᶜᵉ➫🧊
   ∙ˢⁿᵒʷ➫❄️
   ∙ⁱᵐᵖʳᵉˢˢⁱᵛᵉ➫💎
   ∙ᵐᵃᵗʳⁱˣ➫🟩
   ∙ˡⁱᵍʰᵗ➫💡
   ∙ⁿᵉᵒⁿ➫🫥
   ∙ᵈᵉᵛⁱˡ➫😈
   ∙ᵖᵘʳᵖˡᵉ➫💜
   ∙ᵗʰᵘⁿᵈᵉʳ➫⚡
   ∙ˡᵉᵃᵛᵉˢ➫🍃
   ∙ᵃʳᵉⁿᵃ➫🏟️
   ∙ʰᵃᶜᵏᵉʳ➫💻
   ∙ˢᵃⁿᵈ➫🏜️
   ∙ᵇˡᵃᶜᵏᵖⁱⁿᵏ➫🎀
   ∙ᵍˡⁱᵗᶜʰ➫👾
   ∙ᶠⁱʳᵉ➫🔥
*╝═════════📓═════════╚*
*🐞🐜﴿المزيد من أوامر﴾*
*╗═════════🐊═════════╔*
   ∙ᶜᵒᵐᵖˡⁱᵐᵉⁿᵗ➫👑
   ∙ⁱⁿˢᵘˡᵗ➫😈
   ∙ᶠˡⁱʳᵗ➫💘
   ∙ˢʰᵃʸᵃʳⁱ➫😂
   ∙ᵍᵒᵒᵈⁿⁱᵍʰᵗ➫🌙
   ∙ʳᵒˢᵉᵈᵃʸ➫🌹
   ∙ᶜʰᵃʳᵃᶜᵗᵉʳ➫🎭
   ∙ʷᵃˢᵗᵉᵈ➫💀
   ∙ˢʰⁱᵖ➫🚢
   ∙ˢⁱᵐᵖ➫🥺
   ∙ˢᵗᵘᵖⁱᵈ➫🤪
   ∙ʰᵉᵃʳᵗ➫❤️
   ∙ᶜⁱʳᶜˡᵉ➫⭕
   ∙ˡᵒˡⁱᶜᵉ➫🤡
   ∙ⁱᵗˢ⁻ˢᵒ⁻ˢᵗᵘᵖⁱᵈ➫🤦
   ∙ⁿᵃᵐᵉᶜᵃʳᵈ➫🪪
   ∙ᵒᵍʷᵃʸ➫🚶
   ∙ᵗʷᵉᵉᵗ➫🐦
   ∙ʸᵗᶜᵒᵐᵐᵉⁿᵗ➫💬
   ∙ᶜᵒᵐʳᵃᵈᵉ➫🤝
   ∙ᵍˡᵃˢ➫🥛
   ∙ʲᵃⁱˡ➫🔒
   ∙ᵖᵃˢˢᵉᵈ➫🏆
   ∙ᵗʳⁱᵍᵍᵉʳᵉᵈ➫😤
*╝═════════🐡═════════╚*
🐙🐱*﴿أمر مشروع البوت على GitHub﴾*
*╗═════════🐦‍🔥═════════╔*
   ∙ᵍⁱᵗ➫😼
   ∙ᵍⁱᵗʰᵘᵇ➫🐙
   ∙ˢᶜʳⁱᵖᵗ➫📃
   ∙ʳᵉᵖᵒ➫📬
*╝════════🌝═════════╚*

*🪀 انضم لقناتنا للحصول على التحديثات:*
`;

    try {
        // الحصول على قائمة الصور الموجودة
        const availableImages = imagePaths.filter(imgPath => fs.existsSync(imgPath));
        
        if (availableImages.length > 0) {
            // اختيار صورة عشوائية
            const randomIndex = Math.floor(Math.random() * availableImages.length);
            const selectedImage = availableImages[randomIndex];
            const imageBuffer = fs.readFileSync(selectedImage);
            
            // إرسال الصورة مع التفاعل
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.channelId || '120363427092431731@newsletter',
                        newsletterName: settings.botName || 'JAWAD.BOT',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            
        } else {
            // إذا لم توجد صور، إرسال نص فقط
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.channelId || '120363427092431731@newsletter',
                        newsletterName: settings.botName || 'JAWAD.BOT',
                        serverMessageId: -1
                    } 
                }
            }, { quoted: message });
        }
        
        // تفاعل بإيموجي 👊🏻
        await sock.sendMessage(chatId, {
            react: {
                text: '👊🏻',
                key: message.key
            }
        });
        
    } catch (error) {
        console.error('خطأ في أمر المساعدة:', error);
        await sock.sendMessage(chatId, { text: helpMessage }, { quoted: message });
    }
}

module.exports = helpCommand;