cat > /home/container/lib/main.js << 'EOF'
/**
 * main.js - معالج الرسائل الرئيسي للبوت
 */

// دالة معالجة الرسائل الواردة
async function handleMessages(JawadBot, update, isGroup = false) {
    try {
        const message = update.messages[0]
        if (!message.message) return
        
        const from = message.key.remoteJid
        const isGroupMsg = from.endsWith('@g.us')
        const sender = message.key.participant || from
        const messageText = message.message.conversation || 
                           message.message.extendedTextMessage?.text || 
                           message.message.imageMessage?.caption || 
                           message.message.videoMessage?.caption || ''
        
        // تجاهل الرسائل الفارغة
        if (!messageText && !message.message.imageMessage && !message.message.videoMessage) return
        
        // التحقق من البادئة
        const prefix = '.'
        if (!messageText.startsWith(prefix)) return
        
        // استخراج الأمر والمعاملات
        const args = messageText.slice(prefix.length).trim().split(/\s+/)
        const command = args.shift().toLowerCase()
        
        console.log(`📩 أمر مستلم: ${command} من ${sender}`)
        
        // معالجة الأوامر
        switch(command) {
            case 'ping':
                await JawadBot.sendMessage(from, { 
                    text: '🏓 بونق! البوت شغال ✅',
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363427092431731@newsletter',
                            newsletterName: 'JAWAD.BOT',
                            serverMessageId: -1
                        }
                    }
                })
                break
                
            case 'owner':
                await JawadBot.sendMessage(from, {
                    text: '👤 المطور: DarkXecutor'
                })
                break
                
            case 'help':
                const helpText = `🤖 *JAWAD.BOT - الأوامر المتاحة*\n\n` +
                                `📌 *الأوامر الأساسية:*\n` +
                                `• .ping - التحقق من تشغيل البوت\n` +
                                `• .owner - معلومات المطور\n` +
                                `• .help - عرض هذه القائمة\n` +
                                `• .menu - عرض القائمة الكاملة\n\n` +
                                `📢 *القناة:* https://whatsapp.com/channel/0029Vb7kJt29Gv7W5J0McQ09`
                
                await JawadBot.sendMessage(from, { text: helpText })
                break
                
            case 'menu':
                const menuText = `🌟 *قائمة JAWAD.BOT*\n\n` +
                                `📌 *الأوامر المتاحة:*\n` +
                                `• ping - اختبار الاتصال\n` +
                                `• owner - معلومات المطور\n` +
                                `• help - عرض المساعدة\n` +
                                `• menu - عرض القائمة\n\n` +
                                `🔗 *القناة:* https://whatsapp.com/channel/0029Vb7kJt29Gv7W5J0McQ09\n` +
                                `👤 *المطور:* DarkXecutor`
                
                await JawadBot.sendMessage(from, { text: menuText })
                break
                
            default:
                // أمر غير معروف
                if (messageText.startsWith(prefix)) {
                    await JawadBot.sendMessage(from, {
                        text: `❌ الأمر *${command}* غير معروف!\nاستخدم .help لعرض الأوامر المتاحة.`
                    })
                }
                break
        }
        
    } catch (error) {
        console.error('خطأ في handleMessages:', error)
    }
}

// دالة معالجة تحديثات المجموعة
async function handleGroupParticipantUpdate(JawadBot, update) {
    try {
        const { id, participants, action } = update
        console.log(`👥 تحديث في المجموعة ${id}: ${action} - ${participants.join(', ')}`)
        
        // يمكنك إضافة منطق هنا مثل الترحيب بالأعضاء الجدد
        if (action === 'add') {
            for (const participant of participants) {
                await JawadBot.sendMessage(id, {
                    text: `👋 مرحباً @${participant.split('@')[0]}! أهلاً بك في المجموعة 🤖`,
                    mentions: [participant]
                })
            }
        }
    } catch (error) {
        console.error('خطأ في handleGroupParticipantUpdate:', error)
    }
}

// دالة معالجة الحالات (Status)
async function handleStatus(JawadBot, update) {
    try {
        // معالجة حالات الواتساب إذا أردت
        console.log('📱 تم استلام حالة جديدة')
    } catch (error) {
        console.error('خطأ في handleStatus:', error)
    }
}

module.exports = {
    handleMessages,
    handleGroupParticipantUpdate,
    handleStatus
}
EOF
