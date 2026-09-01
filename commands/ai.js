const axios = require('axios');

/**
version: 1.0.1
 * دالة مساعدة لجلب البيانات من عدة واجهات APIs مع محاولات متعددة
 * @param {Array} apiUrls - قائمة روابط الـ APIs
 * @param {string} query - سؤال المستخدم
 * @returns {Promise<string|null>} - الرد أو null إذا فشل الكل
 */
async function fetchFromApis(apiUrls, query) {
    for (const url of apiUrls) {
        try {
            const fullUrl = url + encodeURIComponent(query);
            const response = await axios.get(fullUrl, { 
                timeout: 20000, // مهلة 20 ثانية
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            // استخراج النص من أشكال مختلفة للرد
            const data = response.data;
            const answer = data?.result || data?.message || data?.data || 
                          data?.answer || data?.response || data?.text || 
                          data?.content || data?.output || data?.reply;
            
            if (answer && typeof answer === 'string' && answer.trim().length > 5) {
                return answer.trim();
            }
        } catch (error) {
            // تسجيل الخطأ ولكن الاستمرار للمحاولة التالية
            console.warn(`⚠️ فشل الاتصال بـ ${url.split('?')[0]}:`, error.message);
            continue;
        }
    }
    return null;
}

/**
 * دالة مساعدة لتقسيم النص الطويل
 */
function splitLongText(text, maxLength = 4000) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '\n\n... (تم اختصار الرد بسبب طوله)';
}

/**
 * دالة مساعدة لإرسال رد مع إيموجي تفاعلي
 */
async function sendTypingReaction(sock, chatId, message) {
    // إرسال إيموجي تفاعل
    await sock.sendMessage(chatId, {
        react: { text: '✨', key: message.key }
    });
}

async function aiCommand(sock, chatId, message) {
    try {
        // ====== 1. استخراج النص ======
        const text = message.message?.conversation || 
                     message.message?.extendedTextMessage?.text ||
                     message.message?.imageMessage?.caption ||
                     message.message?.videoMessage?.caption;

        // ====== 2. إذا مافيش نص ======
        if (!text) {
            return await sock.sendMessage(chatId, { 
                text: `✨ *بوت الذكاء الاصطناعي - JAWAD.BOT v1.0.1*\n\n` +
                      `📌 *الأوامر المتاحة:*\n` +
                      `• .gpt <سؤالك>\n` +
                      `• .gemini <سؤالك>\n` +
                      `• .ai <سؤالك> (للذكاء الاصطناعي العام)\n\n` +
                      `📝 *مثال:*\n` +
                      `.gpt ما هي عاصمة المغرب؟`
            }, { quoted: message });
        }

        // ====== 3. تحليل الأمر ======
        const parts = text.split(' ');
        const command = parts[0].toLowerCase();
        const query = parts.slice(1).join(' ').trim();

        // ====== 4. إذا مافيش سؤال ======
        if (!query) {
            return await sock.sendMessage(chatId, { 
                text: `❌ *يرجى كتابة سؤالك بعد الأمر!*\n\n` +
                      `مثال: \`.gpt ما هو الذكاء الاصطناعي؟\``
            }, { quoted: message });
        }

        // ====== 5. تفاعل بالإيموجي ✨ ======
        await sendTypingReaction(sock, chatId, message);

        // ====== 6. إرسال رسالة "جاري التفكير" ======
        const thinkingMsg = await sock.sendMessage(chatId, {
            text: `✨ *جاري البحث عن إجابة...*\n⏳ انتظر قليلاً من فضلك`
        }, { quoted: message });

        // ====== 7. معالجة الأمر ======
        let answer = null;
        let apiType = '';

        // ====== 7.1. أمر .gpt ======
        if (command === '.gpt') {
            apiType = 'GPT';
            const gptApis = [
                'https://zellapi.autos/ai/chatbot?text=',
                'https://api.siputzx.my.id/api/ai/gpt4?text=',
                'https://api.ryzendesu.vip/api/ai/chatgpt?text=',
                'https://vapis.my.id/api/gpt?text=',
                'https://api.giftedtech.my.id/api/ai/gpt4?apikey=gifted&q='
            ];
            answer = await fetchFromApis(gptApis, query);
        }

        // ====== 7.2. أمر .gemini ======
        else if (command === '.gemini') {
            apiType = 'Gemini';
            const geminiApis = [
                'https://vapis.my.id/api/gemini?q=',
                'https://api.siputzx.my.id/api/ai/gemini-pro?content=',
                'https://api.ryzendesu.vip/api/ai/gemini?text=',
                'https://zellapi.autos/ai/chatbot?text=',
                'https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=',
                'https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q='
            ];
            answer = await fetchFromApis(geminiApis, query);
        }

        // ====== 7.3. أمر .ai (عام) ======
        else if (command === '.ai') {
            apiType = 'AI (عام)';
            const allApis = [
                'https://zellapi.autos/ai/chatbot?text=',
                'https://api.siputzx.my.id/api/ai/gpt4?text=',
                'https://api.ryzendesu.vip/api/ai/chatgpt?text=',
                'https://vapis.my.id/api/gemini?q=',
                'https://api.siputzx.my.id/api/ai/gemini-pro?content='
            ];
            answer = await fetchFromApis(allApis, query);
        }

        // ====== 7.4. أمر غير معروف ======
        else {
            // حذف رسالة التفكير
            await sock.sendMessage(chatId, { delete: thinkingMsg.key });
            
            return await sock.sendMessage(chatId, {
                text: `❌ *أمر غير معروف!*\n\n` +
                      `📌 *الأوامر المتاحة:*\n` +
                      `• .gpt <سؤالك>\n` +
                      `• .gemini <سؤالك>\n` +
                      `• .ai <سؤالك>`
            }, { quoted: message });
        }

        // ====== 8. حذف رسالة "جاري التفكير" ======
        await sock.sendMessage(chatId, { delete: thinkingMsg.key });

        // ====== 9. إرسال الرد ======
        if (answer) {
            const finalText = splitLongText(answer);
            
            await sock.sendMessage(chatId, {
                text: `✨ *${apiType} - JAWAD.BOT v1.0.1*\n\n` +
                      `${finalText}\n\n` +
                      `━━━━━━━━━━━━━━━━━━\n` +
                      `📌 *ملاحظة:* النتائج تعتمد على واجهات API المتاحة`
            }, { quoted: message });
            
            // إيموجي تأكيد بعد الإرسال
            await sock.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            });
        } else {
            throw new Error('لم يتم العثور على إجابة من أي واجهة');
        }

    } catch (error) {
        // ====== 10. معالجة الأخطاء ======
        console.error('❌ خطأ في أمر الذكاء الاصطناعي:', error);

        // تحديد نوع الخطأ
        let errorMessage = '❌ *عذراً!* لم أتمكن من الحصول على رد.';
        
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            errorMessage = '⏰ *انتهت المهلة!* الخادم لم يستجب بسرعة كافية.';
        } else if (error.response?.status === 429) {
            errorMessage = '📊 *تم تجاوز الحد اليومي!* حاول مرة أخرى غداً.';
        } else if (error.response?.status === 403 || error.response?.status === 401) {
            errorMessage = '🔑 *مشكلة في الترخيص!* يرجى المحاولة لاحقاً.';
        } else if (error.response?.status >= 500) {
            errorMessage = '🔧 *الخادم غير متاح حالياً!* حاول مرة أخرى.';
        }

        // إرسال رسالة الخطأ
        await sock.sendMessage(chatId, {
            text: `${errorMessage}\n\n` +
                  `🔄 *يرجى المحاولة مرة أخرى بعد قليل.*\n` +
                  `📌 إذا استمرت المشكلة، جرب أمر آخر.`,
            contextInfo: {
                mentionedJid: [message.key.participant || message.key.remoteJid]
            }
        }, { quoted: message });

        // إيموجي خطأ
        await sock.sendMessage(chatId, {
            react: { text: '⚠️', key: message.key }
        });
    }
}

module.exports = aiCommand;