/**
 * أمر الملف الشخصي - JAWAD PROFILE
 * @author DarkXecutor
 * @version 1.0.2
 */

const path = require('path');
const fs = require('fs');
const { delay } = require('@whiskeysockets/baileys');

// =============================================
// 📝 ضع هنا اسم ملف الصوت الخاص بالملف الشخصي
// =============================================
const PROFILE_AUDIO_FILE = 'AUD-20260902-WA0010.mp3';

module.exports = {
    name: 'profile',
    description: 'عرض الملف الشخصي للمطور',
    aliases: ['.ملفي', '.جواد'],
    
    async execute(sock, message, args) {
        try {
            const from = message.key.remoteJid;
            const sender = message.key.participant || message.key.remoteJid;
            
            console.log(`📱 تنفيذ أمر الملف الشخصي من: ${sender}`);
            
            // =============================================
            // 🍂 التفاعل مع رسالة المستخدم
            // =============================================
            await sock.sendMessage(from, {
                react: {
                    text: '🍂',
                    key: message.key
                }
            });
            
            // تأخير بسيط لتجنب Rate Limit
            await delay(1000);
            
            // =============================================
            // 🖼️ إرسال الصورة والرسالة
            // =============================================
            const imagePath = path.join(__dirname, '..', 'assets', 'darkxecutor.png');
            
            // التحقق من وجود الصورة
            let imageBuffer = null;
            try {
                if (fs.existsSync(imagePath)) {
                    imageBuffer = fs.readFileSync(imagePath);
                    console.log(`✅ تم تحميل الصورة: ${imagePath}`);
                } else {
                    console.warn(`⚠️ صورة الملف الشخصي غير موجودة: ${imagePath}`);
                }
            } catch (err) {
                console.warn(`⚠️ خطأ في قراءة الصورة: ${err.message}`);
            }
            
            // نص الملف الشخصي المحسّن والمتناسق مع هوية البوت
            const profileMessage = `🍂 𝑱𝑨𝑾𝑨𝑫 𝑷𝑹𝑶𝑭𝑰𝑳𝑬
*╔══════〔🍁ɪɴꜰᴏ〕═══════╗*
      *𝑱𝑨𝑾𝑨𝑫.𝑩𝑶𝑻🕷️*
   *ɴᴀᴍᴇ: ᴊᴀᴡᴀᴅ*👤
   *ᴀɢᴇ: 20 ʏᴇᴀʀꜱ*🕯️
   *ᴄᴏᴜɴᴛʀʏ: ᴍᴏʀᴏᴄᴄᴏ*🇲🇦
   *ꜰɪᴇʟᴅ: ᴅᴇᴠᴇʟᴏᴘᴇʀ*
   *& ᴘʀᴏɢʀᴀᴍᴍᴇʀ*👨🏼‍💻
    *𝑽𝒆𝒓𝒔𝒊𝒐𝒏: 1.0.1🎲*
    *𝑫𝒆𝒗: 𝑫𝒂𝒓𝒌𝑿𝒆𝒄𝒖𝒕𝒐𝒓👨🏼‍💻*
*╝══════════🫎══════════╚*
*╔════〔🌚ᴀʙᴏᴜᴛ ᴍᴇ〕════╗*
  ᴀ ʏᴏᴜɴɢ ᴅᴇᴠᴇʟᴏᴘᴇʀ
  ꜰʀᴏᴍ ᴍᴏʀᴏᴄᴄᴏ 🇲🇦,
  ʟᴇᴀʀɴɪɴɢ
  ꜱᴏꜰᴛᴡᴀʀᴇ ᴅᴇᴠᴇʟᴏᴘᴍᴇɴᴛ 
  ᴀɴᴅ
  ᴘʀᴏɢʀᴀᴍᴍɪɴɢ,
  ᴀʟᴡᴀʏꜱ ᴡᴏʀᴋɪɴɢ
  ᴛᴏ ɪᴍᴘʀᴏᴠᴇ ᴍʏ
  ꜱᴋɪʟʟꜱ ᴀɴᴅ ʙᴜɪʟᴅ
  ɴᴇᴡ ᴘʀᴏᴊᴇᴄᴛꜱ. ᴍʏ
  ᴘᴀꜱꜱɪᴏɴ ɪꜱ
  ᴛᴇᴄʜɴᴏʟᴏɢʏ,
  ᴘʀᴏɢʀᴀᴍᴍɪɴɢ, ʙᴏᴛ
  ᴅᴇᴠᴇʟᴏᴘᴍᴇɴᴛ ᴀɴᴅ
  ᴅɪɢɪᴛᴀʟ ᴘʀᴏᴊᴇᴄᴛꜱ.
*╝═════════💎══════════╚*
*╔════〔🖇️ ᴍʏ ʟɪɴᴋꜱ〕════╗*
🏮*YouTube*: https://www.youtube.com/@jawad_darkxecutor
🎈*Instagram*: https://www.instagram.com/tagma_123?igsi=MXhubGt0a2RjOXMyZg==
🪀*WhatsApp Channel*: https://whatsapp.com/channel/0029Vb7kJt29Gv7W5JOMcQ09
*🐙GitHub*: https://github.com/darkxecutor
*╝═════════💎══════════╚*
«🐾 ᴛʜᴀɴᴋ ʏᴏᴜ ꜰᴏʀ ᴠɪꜱɪᴛɪɴɢ ᴍʏ ᴘʀᴏꜰɪʟᴇ!»

_✨ تم التطوير بواسطة ${global.مطور || 'DarkXecutor'}_`;
            
            // =============================================
            // 📨 إرسال الصورة مع النص
            // =============================================
            let sentMessage;
            
            if (imageBuffer) {
                // إرسال الصورة مع النص كتعليق
                sentMessage = await sock.sendMessage(from, {
                    image: imageBuffer,
                    caption: profileMessage,
                    contextInfo: {
                        mentionedJid: [sender],
                        forwardingScore: 0,
                        isForwarded: false,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: global.معرف_القناة || '120363427092431731@newsletter',
                            newsletterName: global.botname || 'JAWAD.BOT',
                            serverMessageId: -1
                        }
                    }
                });
                console.log(`✅ تم إرسال الصورة مع الملف الشخصي إلى: ${from}`);
            } else {
                // إذا لم توجد الصورة، نرسل النص فقط
                sentMessage = await sock.sendMessage(from, {
                    text: profileMessage,
                    contextInfo: {
                        mentionedJid: [sender],
                        forwardingScore: 0,
                        isForwarded: false
                    }
                });
                console.log(`✅ تم إرسال الملف الشخصي (نص فقط) إلى: ${from}`);
            }
            
            // تأخير قبل التفاعل مع الرسالة
            await delay(1000);
            
            // =============================================
            // 🐾 التفاعل مع رسالة البوت
            // =============================================
            if (sentMessage && sentMessage.key) {
                await sock.sendMessage(from, {
                    react: {
                        text: '🐾',
                        key: sentMessage.key
                    }
                });
                console.log(`✅ تم التفاعل مع رسالة الملف الشخصي بـ 🐾`);
            }
            
            // تأخير قبل إرسال الصوت
            await delay(1000);
            
            // =============================================
            // 🎙️ إرسال الرسالة الصوتية - نسخة محسنة
            // =============================================
            try {
                const audioPath = path.join(__dirname, '..', 'assets', PROFILE_AUDIO_FILE);
                
                if (fs.existsSync(audioPath)) {
                    // قراءة الملف الصوتي
                    const audioBuffer = fs.readFileSync(audioPath);
                    
                    console.log(`📁 حجم الملف الصوتي: ${(audioBuffer.length / 1024).toFixed(2)} KB`);
                    
                    // التحقق من أن الملف ليس فارغاً
                    if (audioBuffer.length === 0) {
                        console.warn(`⚠️ ملف الصوت فارغ: ${audioPath}`);
                        await sock.sendMessage(from, {
                            text: '⚠️ الملف الصوتي فارغ، يرجى التحقق من الملف.'
                        });
                        return;
                    }
                    
                    // التحقق من حجم الملف (أقل من 16 ميجابايت)
                    const fileSizeMB = audioBuffer.length / (1024 * 1024);
                    if (fileSizeMB > 16) {
                        console.warn(`⚠️ ملف الصوت كبير جداً: ${fileSizeMB.toFixed(2)}MB (الحد الأقصى 16MB)`);
                        await sock.sendMessage(from, {
                            text: `⚠️ الملف الصوتي كبير جداً (${fileSizeMB.toFixed(2)}MB)، يرجى استخدام ملف أقل من 16 ميجابايت.`
                        });
                        return;
                    }
                    
                    // محاولة إرسال الصوت بتنسيقات مختلفة
                    let audioSent = false;
                    const audioFormats = [
                        { mimetype: 'audio/mpeg', label: 'MP3' },
                        { mimetype: 'audio/mp4', label: 'M4A' },
                        { mimetype: 'audio/ogg; codecs=opus', label: 'OGG' },
                        { mimetype: 'audio/aac', label: 'AAC' },
                        { mimetype: 'audio/wav', label: 'WAV' }
                    ];
                    
                    for (const format of audioFormats) {
                        try {
                            await sock.sendMessage(from, {
                                audio: audioBuffer,
                                mimetype: format.mimetype,
                                ptt: true, // Voice note
                                contextInfo: {
                                    forwardingScore: 0,
                                    isForwarded: false
                                }
                            }, {
                                mediaUploadTimeoutMs: 30000
                            });
                            
                            console.log(`✅ تم إرسال الرسالة الصوتية (${format.label}) إلى: ${from}`);
                            audioSent = true;
                            break; // نجح الإرسال، نخرج من الحلقة
                            
                        } catch (formatError) {
                            console.warn(`⚠️ فشل إرسال الصوت بتنسيق ${format.label}: ${formatError.message}`);
                            // نستمر في المحاولة مع التنسيق التالي
                        }
                    }
                    
                    if (!audioSent) {
                        console.error(`❌ فشل إرسال الصوت بجميع التنسيقات المدعومة`);
                        
                        // محاولة إرسال الملف كصوت عادي (بدون ptt)
                        try {
                            await sock.sendMessage(from, {
                                audio: audioBuffer,
                                mimetype: 'audio/mpeg'
                            }, {
                                mediaUploadTimeoutMs: 30000
                            });
                            console.log(`✅ تم إرسال الملف الصوتي (بدون ptt) إلى: ${from}`);
                            audioSent = true;
                        } catch (finalError) {
                            console.error(`❌ فشل إرسال الصوت حتى بدون ptt: ${finalError.message}`);
                        }
                        
                        if (!audioSent) {
                            await sock.sendMessage(from, {
                                text: '⚠️ عذراً، لا يمكن إرسال الملف الصوتي. قد يكون التنسيق غير مدعوم.'
                            });
                        }
                    }
                    
                } else {
                    console.warn(`⚠️ ملف الصوت غير موجود: ${audioPath}`);
                    console.warn(`📝 يرجى وضع ملف الصوت في مجلد assets باسم: ${PROFILE_AUDIO_FILE}`);
                }
            } catch (audioError) {
                console.warn(`⚠️ خطأ في إرسال الرسالة الصوتية: ${audioError.message}`);
                // لا نوقف تنفيذ البوت في حالة فشل الصوت
                try {
                    await sock.sendMessage(from, {
                        text: '⚠️ حدث خطأ في إرسال الملف الصوتي، لكن باقي المعلومات تم إرسالها بنجاح.'
                    });
                } catch (sendError) {
                    console.error(`❌ فشل إرسال رسالة التنبيه: ${sendError.message}`);
                }
            }
            
        } catch (error) {
            console.error(`❌ خطأ في أمر الملف الشخصي: ${error.message}`);
            
            // محاولة إرسال رسالة خطأ للمستخدم
            try {
                const from = message.key.remoteJid;
                await sock.sendMessage(from, {
                    text: '❌ حدث خطأ أثناء عرض الملف الشخصي، يرجى المحاولة مرة أخرى.',
                    contextInfo: {
                        forwardingScore: 0,
                        isForwarded: false
                    }
                });
            } catch (sendError) {
                console.error(`❌ فشل إرسال رسالة الخطأ: ${sendError.message}`);
            }
        }
    }
};