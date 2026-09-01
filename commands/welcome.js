const { handleWelcome } = require('../lib/welcome');
const { isWelcomeOn, getWelcome } = require('../lib/index');
const { channelInfo } = require('../lib/messageConfig');
const fetch = require('node-fetch');

async function welcomeCommand(sock, chatId, message, match) {
    // Check if it's a group
    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, { text: 'This command can only be used in groups.' });
        return;
    }

    // Extract match from message
    const text = message.message?.conversation || 
                message.message?.extendedTextMessage?.text || '';
    const matchText = text.split(' ').slice(1).join(' ');

    await handleWelcome(sock, chatId, message, matchText);
}

async function handleJoinEvent(sock, id, participants) {
    try {
        // ✅ تحقق من تفعيل الترحيب مع طباعة للتأكد
        const isWelcomeEnabled = await isWelcomeOn(id);
        console.log(`📊 حالة الترحيب للمجموعة ${id}: ${isWelcomeEnabled}`);
        
        if (!isWelcomeEnabled) {
            console.log('⚠️ الترحيب غير مفعل، سيتم تجاهل الحدث');
            return;
        }

        // ✅ جلب الرسالة المخصصة مع طباعة للتأكد
        const customMessage = await getWelcome(id);
        console.log(`📊 الرسالة المخصصة: ${customMessage || 'لا توجد رسالة مخصصة'}`);

        // ✅ جلب بيانات المجموعة
        const groupMetadata = await sock.groupMetadata(id);
        const groupName = groupMetadata.subject;
        const groupDesc = groupMetadata.desc || 'No description available';

        // ✅ التأكد من وجود مشاركين
        if (!participants || participants.length === 0) {
            console.log('⚠️ لا يوجد مشاركين جدد');
            return;
        }

        // ✅ إرسال رسالة ترحيب لكل مشارك جديد
        for (const participant of participants) {
            try {
                // ✅ معالجة معرف المشارك
                const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
                const user = participantString.split('@')[0];
                
                // ✅ جلب اسم العرض
                let displayName = user;
                try {
                    const contact = await sock.getBusinessProfile(participantString);
                    if (contact && contact.name) {
                        displayName = contact.name;
                    } else {
                        const groupParticipants = groupMetadata.participants;
                        const userParticipant = groupParticipants.find(p => p.id === participantString);
                        if (userParticipant && userParticipant.name) {
                            displayName = userParticipant.name;
                        }
                    }
                } catch (nameError) {
                    console.log('⚠️ لا يمكن جلب اسم المستخدم، سيتم استخدام رقم الهاتف');
                }
                
                // ✅ معالجة الرسالة النهائية
                let finalMessage;
                if (customMessage) {
                    finalMessage = customMessage
                        .replace(/{user}/g, `@${displayName}`)
                        .replace(/{group}/g, groupName)
                        .replace(/{description}/g, groupDesc);
                } else {
                    // ✅ رسالة افتراضية إذا لم تكن هناك رسالة مخصصة
                    const now = new Date();
                    const timeString = now.toLocaleString('en-US', {
                        month: '2-digit',
                        day: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                    });
                    
                    finalMessage = `╭╼━≪•𝙽𝙴𝚆 𝙼𝙴𝙼𝙱𝙴𝚁•≫━╾╮\n┃𝚆𝙴𝙻𝙲𝙾𝙼𝙴: @${displayName} 👋\n┃Member count: #${groupMetadata.participants.length}\n┃𝚃𝙸𝙼𝙴: ${timeString}⏰\n╰━━━━━━━━━━━━━━━╯\n\n*@${displayName}* Welcome to *${groupName}*! 🎉\n*Group 𝙳𝙴𝚂𝙲𝚁𝙸𝙿𝚃𝙸𝙾𝙽*\n${groupDesc}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ Knight Bot*`;
                }

                // ✅ محاولة إرسال الصورة أولاً (مع تحسين معالجة الأخطاء)
                let imageSent = false;
                try {
                    // ✅ جلب صورة الملف الشخصي
                    let profilePicUrl = `https://img.pyrocdn.com/dbKUgahg.png`;
                    try {
                        const profilePic = await sock.profilePictureUrl(participantString, 'image');
                        if (profilePic) {
                            profilePicUrl = profilePic;
                        }
                    } catch (profileError) {
                        console.log('⚠️ لا يمكن جلب صورة الملف الشخصي، سيتم استخدام الصورة الافتراضية');
                    }
                    
                    // ✅ بناء رابط API للصورة
                    const apiUrl = `https://api.some-random-api.com/welcome/img/2/gaming3?type=join&textcolor=green&username=${encodeURIComponent(displayName)}&guildName=${encodeURIComponent(groupName)}&memberCount=${groupMetadata.participants.length}&avatar=${encodeURIComponent(profilePicUrl)}`;
                    
                    // ✅ محاولة جلب الصورة
                    const response = await fetch(apiUrl);
                    if (response.ok) {
                        const imageBuffer = await response.buffer();
                        
                        // ✅ إرسال الصورة مع النص
                        await sock.sendMessage(id, {
                            image: imageBuffer,
                            caption: finalMessage,
                            mentions: [participantString],
                            ...channelInfo
                        });
                        imageSent = true;
                        console.log(`✅ تم إرسال رسالة ترحيب مع صورة للعضو ${displayName}`);
                    } else {
                        console.log('⚠️ فشل جلب صورة الترحيب من API (استجابة غير صالحة)');
                    }
                } catch (imageError) {
                    console.log('⚠️ فشل إنشاء صورة الترحيب، سيتم إرسال نص فقط:', imageError.message);
                }

                // ✅ إذا فشلت الصورة، أرسل نصاً فقط
                if (!imageSent) {
                    await sock.sendMessage(id, {
                        text: finalMessage,
                        mentions: [participantString],
                        ...channelInfo
                    });
                    console.log(`✅ تم إرسال رسالة ترحيب (نص فقط) للعضو ${displayName}`);
                }

            } catch (participantError) {
                console.error('❌ خطأ في معالجة مشارك:', participantError.message);
                
                // ✅ محاولة إرسال رسالة ترحيب بسيطة كحل أخير
                try {
                    const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
                    const user = participantString.split('@')[0];
                    
                    let fallbackMessage;
                    if (customMessage) {
                        fallbackMessage = customMessage
                            .replace(/{user}/g, `@${user}`)
                            .replace(/{group}/g, groupName)
                            .replace(/{description}/g, groupDesc);
                    } else {
                        fallbackMessage = `Welcome @${user} to ${groupName}! 🎉`;
                    }
                    
                    await sock.sendMessage(id, {
                        text: fallbackMessage,
                        mentions: [participantString],
                        ...channelInfo
                    });
                    console.log(`✅ تم إرسال رسالة ترحيب بديلة للعضو ${user}`);
                } catch (fallbackError) {
                    console.error('❌ فشل حتى إرسال رسالة الترحيب البديلة:', fallbackError.message);
                }
            }
        }
    } catch (error) {
        console.error('❌ خطأ عام في معالجة حدث الانضمام:', error.message);
        console.error('📚 Stack:', error.stack);
    }
}

module.exports = { welcomeCommand, handleJoinEvent };