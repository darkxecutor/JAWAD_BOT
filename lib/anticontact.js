// lib/anticontact.js
const fs = require('fs');
const path = require('path');

// ملفات التخزين
const SETTINGS_FILE = path.join(__dirname, '../settings.json');
const WARNINGS_FILE = path.join(__dirname, '../warnings.json');

// قراءة الإعدادات
function getSettings() {
    if (fs.existsSync(SETTINGS_FILE)) {
        return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    }
    return {};
}

// حفظ الإعدادات
function saveSettings(settings) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

// قراءة التحذيرات
function getWarnings() {
    if (fs.existsSync(WARNINGS_FILE)) {
        return JSON.parse(fs.readFileSync(WARNINGS_FILE, 'utf8'));
    }
    return {};
}

// حفظ التحذيرات
function saveWarnings(warnings) {
    fs.writeFileSync(WARNINGS_FILE, JSON.stringify(warnings, null, 2));
}

// دالة معالجة الأمر
async function handleAntiContactCommand(sock, chatId, message, args, ctx) {
    const groupId = chatId;
    const settings = getSettings();
    
    if (!settings.anticontact) settings.anticontact = {};
    if (!settings.anticontact[groupId]) {
        settings.anticontact[groupId] = { 
            status: 'off', 
            action: 'warn',
            maxWarnings: 3 // عدد التحذيرات المسموح بها
        };
    }

    const groupSetting = settings.anticontact[groupId];

    // عرض الحالة الحالية
    if (!args || args === '') {
        await sock.sendMessage(chatId, {
            text: `📋 *مضاد جهات الاتصال*\n` +
                  `└ الحالة: ${groupSetting.status === 'on' ? '✅ مفعل' : '❌ معطل'}\n` +
                  `└ الإجراء: ${groupSetting.action === 'delete' ? '🗑️ حذف' : 
                              groupSetting.action === 'kick' ? '🚫 طرد فوري' : '⚠️ تحذير (3 = طرد)'}\n` +
                  `└ الحد الأقصى: ${groupSetting.maxWarnings || 3} تحذيرات\n\n` +
                  `*الاستخدام:*\n` +
                  `.anticontact on/off\n` +
                  `.anticontact set delete/kick/warn\n` +
                  `.anticontact warnings [@منشن] - لعرض تحذيرات العضو\n` +
                  `.anticontact reset [@منشن] - لإعادة تعيين تحذيرات العضو`
        });
        return;
    }

    const command = args.toLowerCase();

    // تشغيل/إيقاف
    if (command === 'on' || command === 'off') {
        groupSetting.status = command;
        saveSettings(settings);
        await sock.sendMessage(chatId, {
            text: `✅ تم ${command === 'on' ? 'تفعيل' : 'تعطيل'} مضاد جهات الاتصال`
        });
        return;
    }

    // تعيين الإجراء
    if (command.startsWith('set ')) {
        const action = command.split(' ')[1];
        if (['delete', 'kick', 'warn'].includes(action)) {
            groupSetting.action = action;
            saveSettings(settings);
            await sock.sendMessage(chatId, {
                text: `✅ تم تعيين الإجراء إلى: ${action === 'delete' ? '🗑️ حذف' : 
                                                    action === 'kick' ? '🚫 طرد فوري' : '⚠️ تحذير (3 = طرد)'}`
            });
        } else {
            await sock.sendMessage(chatId, {
                text: '❌ الإجراء غير صحيح. استخدم: delete, kick, أو warn'
            });
        }
        return;
    }

    // عرض تحذيرات عضو معين
    if (command === 'warnings') {
        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const target = mentioned[0] || message.key.participant || message.key.remoteJid;
        
        const warnings = getWarnings();
        const userWarnings = warnings[groupId]?.[target] || 0;
        const maxWarn = groupSetting.maxWarnings || 3;
        
        await sock.sendMessage(chatId, {
            text: `📊 *تحذيرات العضو*\n` +
                  `└ @${target.split('@')[0]}\n` +
                  `└ التحذيرات: ${userWarnings}/${maxWarn}`,
            mentions: [target]
        });
        return;
    }

    // إعادة تعيين تحذيرات عضو
    if (command === 'reset') {
        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const target = mentioned[0];
        
        if (!target) {
            await sock.sendMessage(chatId, {
                text: '❌ يرجى منشن العضو المراد إعادة تعيين تحذيراته\nمثال: .anticontact reset @user'
            });
            return;
        }
        
        const warnings = getWarnings();
        if (warnings[groupId]) {
            delete warnings[groupId][target];
            if (Object.keys(warnings[groupId]).length === 0) {
                delete warnings[groupId];
            }
            saveWarnings(warnings);
        }
        
        await sock.sendMessage(chatId, {
            text: `✅ تم إعادة تعيين تحذيرات @${target.split('@')[0]}`,
            mentions: [target]
        });
        return;
    }

    await sock.sendMessage(chatId, {
        text: '❌ أمر غير معروف. استخدم:\n' +
              '.anticontact on/off\n' +
              '.anticontact set delete/kick/warn\n' +
              '.anticontact warnings [@منشن]\n' +
              '.anticontact reset [@منشن]'
    });
}

// دالة معالجة مخالفة جهات الاتصال
async function handleContactViolation(sock, chatId, sender, settings) {
    const warnings = getWarnings();
    const groupId = chatId;
    const maxWarnings = settings.maxWarnings || 3;
    
    // تهيئة بيانات المجموعة
    if (!warnings[groupId]) warnings[groupId] = {};
    if (!warnings[groupId][sender]) warnings[groupId][sender] = 0;
    
    // زيادة عدد التحذيرات
    warnings[groupId][sender] += 1;
    const currentWarnings = warnings[groupId][sender];
    
    saveWarnings(warnings);
    
    // التحقق من الوصول للحد الأقصى
    if (currentWarnings >= maxWarnings) {
        // طرد العضو
        try {
            await sock.groupParticipantsUpdate(chatId, [sender], 'remove');
            
            // حذف التحذيرات بعد الطرد
            delete warnings[groupId][sender];
            if (Object.keys(warnings[groupId]).length === 0) {
                delete warnings[groupId];
            }
            saveWarnings(warnings);
            
            await sock.sendMessage(chatId, {
                text: `🚫 @${sender.split('@')[0]} تم طرده بسبب تجاوز ${maxWarnings} تحذيرات من إرسال جهات الاتصال!`,
                mentions: [sender]
            });
        } catch (error) {
            console.error('Error kicking member:', error);
            await sock.sendMessage(chatId, {
                text: `❌ فشل طرد @${sender.split('@')[0]}. تأكد من أن البوت مشرف.`,
                mentions: [sender]
            });
        }
        return true; // تم الطرد
    } else {
        // إرسال تحذير
        const remaining = maxWarnings - currentWarnings;
        await sock.sendMessage(chatId, {
            text: `⚠️ @${sender.split('@')[0]} ممنوع إرسال جهات الاتصال!\n` +
                  `└ تحذير ${currentWarnings}/${maxWarnings}\n` +
                  `└ متبقي ${remaining} تحذير${remaining > 1 ? 'ات' : ''} قبل الطرد`,
            mentions: [sender]
        });
        return false; // لم يتم الطرد
    }
}

// دالة التحقق من الرسائل (للاستخدام في حدث الرسائل)
async function checkAntiContact(sock, chatId, message, ctx) {
    const settings = getSettings();
    const groupSetting = settings.anticontact?.[chatId];
    
    if (!groupSetting || groupSetting.status !== 'on') return false;
    
    // تحقق إذا كانت الرسالة تحتوي على جهة اتصال
    const hasContact = message.message?.contactMessage || 
                       message.message?.contactsArrayMessage;
    
    if (hasContact) {
        const sender = message.key.participant || message.key.remoteJid;
        const action = groupSetting.action || 'warn';
        
        // حذف الرسالة دائماً
        try {
            await sock.sendMessage(chatId, {
                delete: message.key
            });
        } catch (error) {
            console.error('Error deleting message:', error);
        }
        
        // تنفيذ الإجراء
        if (action === 'delete') {
            await sock.sendMessage(chatId, {
                text: `🗑️ @${sender.split('@')[0]} تم حذف رسالة جهة الاتصال`,
                mentions: [sender]
            });
        } else if (action === 'kick') {
            try {
                await sock.groupParticipantsUpdate(chatId, [sender], 'remove');
                await sock.sendMessage(chatId, {
                    text: `🚫 @${sender.split('@')[0]} تم طرده فوراً لإرساله جهة اتصال!`,
                    mentions: [sender]
                });
            } catch (error) {
                console.error('Error kicking member:', error);
            }
        } else { // warn (الافتراضي)
            await handleContactViolation(sock, chatId, sender, groupSetting);
        }
        
        return true;
    }
    
    return false;
}

module.exports = {
    handleAntiContactCommand,
    checkAntiContact,
    handleContactViolation,
    getSettings,
    saveSettings,
    getWarnings,
    saveWarnings
};