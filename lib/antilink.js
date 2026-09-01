const { isJidGroup } = require('@whiskeysockets/baileys');
const { getAntilink } = require('./antilinkHelper');
const isAdmin = require('./isAdmin');
const config = require('../config');
const fs = require('fs');
const path = require('path');

// استخدام نظام التحذيرات الخاص بك
const warningsPath = path.join(__dirname, '../data/warnings.json');

// دالة زيادة التحذيرات (متوافقة مع نظامك)
function incrementWarning(groupId, userId) {
    try {
        let warnings = {};
        if (fs.existsSync(warningsPath)) {
            warnings = JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
        }
        
        if (!warnings[groupId]) warnings[groupId] = {};
        if (!warnings[groupId][userId]) warnings[groupId][userId] = 0;
        
        warnings[groupId][userId]++;
        fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));
        
        return warnings[groupId][userId];
    } catch (error) {
        console.error('خطأ في زيادة التحذير:', error);
        return 0;
    }
}

// دالة إعادة تعيين التحذيرات
function resetWarnings(groupId, userId) {
    try {
        let warnings = {};
        if (fs.existsSync(warningsPath)) {
            warnings = JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
        }
        
        if (warnings[groupId] && warnings[groupId][userId]) {
            delete warnings[groupId][userId];
            fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));
        }
        return true;
    } catch (error) {
        console.error('خطأ في إعادة تعيين التحذيرات:', error);
        return false;
    }
}

// دالة الحصول على عدد التحذيرات
function getWarningCount(groupId, userId) {
    try {
        let warnings = {};
        if (fs.existsSync(warningsPath)) {
            warnings = JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
        }
        return warnings[groupId]?.[userId] || 0;
    } catch (error) {
        console.error('خطأ في الحصول على التحذيرات:', error);
        return 0;
    }
}

const WARN_COUNT = config.WARN_COUNT || 3;

/**
 * التحقق من وجود رابط في النص
 */
function containsURL(str) {
    const urlRegex = /(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?/i;
    return urlRegex.test(str);
}

/**
 * معالجة خاصية مكافحة الروابط في المجموعات
 */
async function Antilink(msg, sock) {
    const jid = msg.key.remoteJid;
    
    // التحقق من أن الرسالة في مجموعة
    if (!isJidGroup(jid)) return;

    const SenderMessage = msg.message?.conversation || 
                         msg.message?.extendedTextMessage?.text || '';
    if (!SenderMessage || typeof SenderMessage !== 'string') return;

    const sender = msg.key.participant;
    if (!sender) return;
    
    // تخطي إذا كان المرسل مشرفاً
    try {
        const { isSenderAdmin } = await isAdmin(sock, jid, sender);
        if (isSenderAdmin) return;
    } catch (_) {}
    
    // التحقق من وجود رابط
    if (!containsURL(SenderMessage.trim())) return;
    
    const antilinkConfig = await getAntilink(jid, 'on');
    if (!antilinkConfig) return;

    const action = antilinkConfig.action;
    const warnCountLimit = antilinkConfig.warnCount || WARN_COUNT;
    const userName = sender.split('@')[0];
    
    try {
        // 1️⃣ إظهار التفاعل بالإيموجي 🌶️
        try {
            await sock.sendMessage(jid, {
                react: { text: '🌶️', key: msg.key }
            });
        } catch(e) {}

        // 2️⃣ حذف الرسالة بسرعة
        try {
            await sock.sendMessage(jid, { delete: msg.key });
        } catch (error) {
            console.error('❌ فشل حذف الرسالة:', error);
        }

        // 3️⃣ تنفيذ الإجراء المناسب
        switch (action) {
            case 'delete':
                await sock.sendMessage(jid, { 
                    text: `╭━━━≪•🌶️ *مـنـع الـروابـط* •≫━━━╮
┃━━━━━━━━━━━━━━━━━━━━━
┃⚠️ *@${userName} الروابط غير مسموح بها!*
┃━━━━━━━━━━━━━━━━━━━━━
╰━━━≪•🤖 *JAWAD.BOT v1.0.1* •≫━━━╯`,
                    mentions: [sender] 
                });
                break;

            case 'kick':
                try {
                    await sock.groupParticipantsUpdate(jid, [sender], 'remove');
                    await sock.sendMessage(jid, {
                        text: `╭━━━≪•🌶️ *مـنـع الـروابـط* •≫━━━╮
┃━━━━━━━━━━━━━━━━━━━━━
┃🚫 *@${userName} تم طرده لإرسال روابط!*
┃━━━━━━━━━━━━━━━━━━━━━
╰━━━≪•🤖 *JAWAD.BOT v1.0.1* •≫━━━╯`,
                        mentions: [sender]
                    });
                } catch (error) {
                    console.error('خطأ في طرد المستخدم:', error);
                }
                break;

            case 'warn':
                // استخدام نظام التحذيرات الخاص بك
                const warningCount = incrementWarning(jid, sender);
                console.log(`📊 تحذير ${warningCount}/${warnCountLimit} للمستخدم ${sender}`);
                
                if (warningCount >= warnCountLimit) {
                    try {
                        await sock.groupParticipantsUpdate(jid, [sender], 'remove');
                        resetWarnings(jid, sender);
                        await sock.sendMessage(jid, {
                            text: `╭━━━≪•🔴 *طـرد تـلقـائـي* 🔴•≫━━━╮
┃━━━━━━━━━━━━━━━━━━━━━
┃👤 *@${userName}*
┃⚠️ *عدد التحذيرات:* ${warningCount}/${warnCountLimit}
┃💢 *تم طرد العضو تلقائياً لإرسال روابط!*
┃━━━━━━━━━━━━━━━━━━━━━
╰━━━≪•🤖 *JAWAD.BOT v1.0.1* •≫━━━╯`,
                            mentions: [sender]
                        });
                    } catch (error) {
                        console.error('خطأ في طرد المستخدم:', error);
                    }
                } else {
                    // تحديد أيقونة حسب عدد التحذيرات
                    let warningIcon = '⚠️';
                    if (warningCount === 2) warningIcon = '⚠️⚠️';
                    if (warningCount >= 3) warningIcon = '🔴';
                    
                    await sock.sendMessage(jid, {
                        text: `╭━━━≪•${warningIcon} *تَـحـذيـر* ${warningIcon}•≫━━━╮
┃━━━━━━━━━━━━━━━━━━━━━
┃👤 *العضو:* @${userName}
┃⚠️ *عدد التحذيرات:* ${warningCount}/${warnCountLimit}
┃━━━━━━━━━━━━━━━━━━━━━
╰━━━≪•🌶️ *مـنـع الـروابـط* •≫━━━╯

💡 *تجنب إرسال الروابط لتجنب الطرد*
${warningCount === 1 ? '⚠️ تنبيه: تحذير واحد متبقي 2 تحذيرات للطرد!' : ''}
${warningCount === 2 ? '⚠️⚠️ تنبيه: تبقى تحذير واحد فقط قبل الطرد!' : ''}`,
                        mentions: [sender]
                    });
                }
                break;
        }
    } catch (error) {
        console.error('خطأ في مكافحة الروابط:', error);
    }
}

module.exports = { Antilink };