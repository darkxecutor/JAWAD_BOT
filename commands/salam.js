// ⚙️ أمر طرد الجميع وتدمير المجموعة
// .سلام - يطرد جميع الأعضاء دفعة واحدة ويغير الاسم والوصف

const fs = require('fs');
const path = require('path');

async function salamCommand(sock, chatId, message, argText, command, ctx) {
    // التحقق من الصلاحيات
    if (!(await ctx.requireOwner())) return;
    if (!(await ctx.requireGroup('❌ هذا الأمر فقط للمجموعات.'))) return;

    const sender = message.key.participant || message.key.remoteJid;
    const botPhone = ((sock.user?.id || '').split(':')[0] || '').split('@')[0];

    // جلب جميع أعضاء المجموعة
    const metadata = await sock.groupMetadata(chatId);
    const allParticipants = metadata.participants.map(p => p.id);
    
    // تصفية الأعضاء: استثناء المرسل والبوت
    const toKick = allParticipants.filter(id => {
        if (id === sender) return false;
        const num = (id.split(':')[0] || '').split('@')[0];
        return num !== botPhone;
    });

    // إرسال رد فعل بدء العملية
    await sock.sendMessage(chatId, { react: { text: "⚡", key: message.key } });

    // ===== تنفيذ التغييرات دفعة واحدة =====
    try {
        // 1. تغيير اسم المجموعة إلى "هق مشا"
        await sock.groupUpdateSubject(chatId, 'هق مشا');
        
        // 2. تغيير وصف المجموعة إلى "نتوما محتارموناش"
        await sock.groupUpdateDescription(chatId, 'نتوما محتارموناش');
        
        // 3. طرد جميع الأعضاء دفعة واحدة
        if (toKick.length > 0) {
            await sock.groupParticipantsUpdate(chatId, toKick, 'remove');
        }

        // ===== رسالة التأكيد =====
        const finalMessage = `╭━━━〔 ✅ 𝑱𝑨𝑾𝑨𝑫.𝑩𝑶𝑻 〕━━━╮

✨ تم تدمير المجموعة بنجاح!

📊 عدد الأعضاء المطرودين: ${toKick.length}

📛 اسم المجموعة الجديد: هق مشا
📝 الوصف الجديد: نتوما محتارموناش

⚡ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 ${global.developer || 'JAWAD.BOT'}

╰━━━━━━━━━━━━━━━━━━━━━━╯`;

        await sock.sendMessage(chatId, {
            text: finalMessage
        });

        await sock.sendMessage(chatId, {
            react: { text: "💀", key: message.key }
        });

    } catch (error) {
        console.error('❌ خطأ في تنفيذ الأمر:', error);
        await sock.sendMessage(chatId, {
            text: `❌ حدث خطأ: ${error.message}`,
            ...ctx.channelInfo
        }, { quoted: message });
    }
}

module.exports = {
    name: 'سلام',
    aliases: ['salem', 'طرد', 'هق'],
    category: 'group',
    description: 'يطرد جميع الأعضاء دفعة واحدة ويغير الاسم والوصف',
    ownerOnly: true,
    run: salamCommand
};