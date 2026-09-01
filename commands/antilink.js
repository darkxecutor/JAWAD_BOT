const { bots } = require('../lib/antilink');
const { setAntilink, getAntilink, removeAntilink } = require('../lib/antilinkHelper');
const isAdmin = require('../lib/isAdmin');
const fs = require('fs');
const path = require('path');

// استخدام نظام التحذيرات الخاص بك
const warningsPath = path.join(__dirname, '../data/warnings.json');

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

async function handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '⛔ *فقط مشرفي المجموعة يمكنهم استخدام هذا الأمر!*' }, { quoted: message });
            return;
        }

        const prefix = '.';
        const args = userMessage.slice(9).toLowerCase().trim().split(' ');
        const action = args[0];

        if (!action) {
            const usage = `🛡️ *مكافحة الروابط - JAWAD.BOT v1.0.1*\n\n📌 *الأوامر:*\n${prefix}منع الروابط تفعيل\n${prefix}منع الروابط اجراء حذف | طرد | تحذير\n${prefix}منع الروابط تعطيل\n${prefix}منع الروابط حالة\n${prefix}منع الروابط تحذيرات [العدد]\n\n✨ *سيتم منع الروابط في المجموعة*\n⚡ *يتم حذف الروابط بسرعة فائقة*`;
            await sock.sendMessage(chatId, { text: usage }, { quoted: message });
            return;
        }

        switch (action) {
            case 'on':
            case 'تفعيل':
                const existingConfig = await getAntilink(chatId, 'on');
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, { text: '⚠️ *مكافحة الروابط مفعلة بالفعل!*' }, { quoted: message });
                    return;
                }
                const result = await setAntilink(chatId, 'on', 'حذف', 3);
                await sock.sendMessage(chatId, { 
                    text: result ? '✅ *تم تفعيل مكافحة الروابط!*' : '❌ *فشل في تفعيل مكافحة الروابط!*' 
                }, { quoted: message });
                break;

            case 'off':
            case 'تعطيل':
                await removeAntilink(chatId, 'on');
                await sock.sendMessage(chatId, { text: '✅ *تم تعطيل مكافحة الروابط!*' }, { quoted: message });
                break;

            case 'set':
            case 'action':
            case 'اجراء':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, { 
                        text: `📌 *يرجى تحديد الإجراء:* ${prefix}منع الروابط اجراء حذف | طرد | تحذير` 
                    }, { quoted: message });
                    return;
                }
                let setAction = args[1];
                if (setAction === 'حذف') setAction = 'delete';
                if (setAction === 'طرد') setAction = 'kick';
                if (setAction === 'تحذير') setAction = 'warn';
                
                if (!['delete', 'kick', 'warn'].includes(setAction)) {
                    await sock.sendMessage(chatId, { 
                        text: '❌ *إجراء غير صالح!*\n📌 اختر: حذف، طرد، أو تحذير' 
                    }, { quoted: message });
                    return;
                }
                const currentConfig = await getAntilink(chatId, 'on');
                const currentWarnCount = currentConfig?.warnCount || 3;
                const setResult = await setAntilink(chatId, 'on', setAction, currentWarnCount);
                const actionText = setAction === 'delete' ? 'حذف' : (setAction === 'kick' ? 'طرد' : 'تحذير');
                await sock.sendMessage(chatId, { 
                    text: setResult ? `✅ *تم تعيين إجراء مكافحة الروابط إلى: ${actionText}*` : '❌ *فشل في تعيين الإجراء!*' 
                }, { quoted: message });
                break;

            case 'status':
            case 'حالة':
                const status = await getAntilink(chatId, 'on');
                const statusText = status?.enabled ? '🟢 مفعل' : '🔴 معطل';
                const actionTextConfig = status?.action === 'delete' ? 'حذف' : (status?.action === 'kick' ? 'طرد' : (status?.action === 'warn' ? 'تحذير' : 'غير محدد'));
                const warnCount = status?.warnCount || 3;
                await sock.sendMessage(chatId, { 
                    text: `🛡️ *إعدادات مكافحة الروابط*\n\n📌 *الحالة:* ${statusText}\n⚙️ *الإجراء:* ${actionTextConfig}\n📊 *عدد التحذيرات:* ${warnCount}\n\n💡 *الروابط المخالفة سيتم ${actionTextConfig === 'حذف' ? 'حذفها' : (actionTextConfig === 'طرد' ? 'طرد مرسلها' : 'تحذير مرسلها')}*` 
                }, { quoted: message });
                break;

            case 'تحذيرات':
            case 'warn':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, { 
                        text: `📌 *يرجى تحديد عدد التحذيرات:* ${prefix}منع الروابط تحذيرات 3` 
                    }, { quoted: message });
                    return;
                }
                const warnCountNew = parseInt(args[1]);
                if (isNaN(warnCountNew) || warnCountNew < 1) {
                    await sock.sendMessage(chatId, { 
                        text: '❌ *يرجى إدخال عدد صحيح للتحذيرات (1 فأكثر)!*' 
                    }, { quoted: message });
                    return;
                }
                const currentAction = (await getAntilink(chatId, 'on'))?.action || 'delete';
                const updatedConfig = await setAntilink(chatId, 'on', currentAction, warnCountNew);
                await sock.sendMessage(chatId, { 
                    text: updatedConfig ? `✅ *تم تعيين عدد التحذيرات إلى: ${warnCountNew}*` : '❌ *فشل في تعيين عدد التحذيرات!*' 
                }, { quoted: message });
                break;

            case 'حذف تحذيرات':
            case 'reset':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, { 
                        text: `📌 *يرجى تحديد المستخدم:* ${prefix}منع الروابط حذف تحذيرات @مستخدم` 
                    }, { quoted: message });
                    return;
                }
                const targetUser = args[1].replace('@', '') + '@s.whatsapp.net';
                const resetResult = resetWarnings(chatId, targetUser);
                await sock.sendMessage(chatId, { 
                    text: resetResult ? `✅ *تم حذف تحذيرات المستخدم!*` : '❌ *فشل في حذف التحذيرات!*' 
                }, { quoted: message });
                break;

            default:
                await sock.sendMessage(chatId, { text: `❌ *أمر غير صالح!*\n📌 استخدم ${prefix}منع الروابط لمعرفة الأوامر المتاحة.` });
        }
    } catch (error) {
        console.error('خطأ في أمر مكافحة الروابط:', error);
        await sock.sendMessage(chatId, { text: '❌ *حدث خطأ أثناء معالجة الأمر!*' });
    }
}

// تصدير الدوال
module.exports = {
    handleAntilinkCommand,
};