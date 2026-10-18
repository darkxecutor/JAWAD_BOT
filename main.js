// 🧹 إصلاح مشكلة ENOSPC وامتلاء المجلد المؤقت في الاستضافات
const fs = require('fs');
const path = require('path');

// إعادة توجيه التخزين المؤقت بعيداً عن مجلد /tmp الخاص بالنظام
const المجلدالمؤقت = path.join(process.cwd(), 'temp');
if (!fs.existsSync(المجلدالمؤقت)) fs.mkdirSync(المجلدالمؤقت, { recursive: true });
process.env.TMPDIR = المجلدالمؤقت;
process.env.TEMP = المجلدالمؤقت;
process.env.TMP = المجلدالمؤقت;

// التنظيف التلقائي كل 3 ساعات
setInterval(() => {
    fs.readdir(المجلدالمؤقت, (خطأ, الملفات) => {
        if (خطأ) return;
        for (const ملف of الملفات) {
            const مسارالملف = path.join(المجلدالمؤقت, ملف);
            fs.stat(مسارالملف, (خطأ, معلومات) => {
                if (!خطأ && Date.now() - معلومات.mtimeMs > 3 * 60 * 60 * 1000) {
                    fs.unlink(مسارالملف, () => { });
                }
            });
        }
    });
    console.log('🧹 تم تنظيف المجلد المؤقت تلقائياً');
}, 3 * 60 * 60 * 1000);

// ============= معلومات البوت =============
global.botName = "JAWAD.BOT";
global.developer = "DarkXecutor";
global.channelLink = "https://whatsapp.com/channel/0029Vb7kJt29Gv7W5J0McQ09";
global.supportGroup = "https://chat.whatsapp.com/LqoheqNRThHLBDbMCwvV7J?mode=gi_t";
global.ytch = "jawad_bot";
global.newsletterJid = "120363427092431731@newsletter";

// إعدادات القناة للنشر
const contextInfoChannel = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: global.newsletterJid,
            newsletterName: global.botName,
            serverMessageId: -1
        }
    }
};

// ============= ✅ استيرادات آمنة =============
function safeRequire(modulePath, fallback = null) {
    try {
        return require(modulePath);
    } catch (e) {
        console.log(`⚠️ تعذر استيراد ${modulePath}: ${e.message.split('\n')[0]}`);
        return fallback;
    }
}

const settings = safeRequire('./settings', { packname: 'JAWAD.BOT', author: 'DarkXecutor', version: '1.0.0' });
safeRequire('./config.js');

// ============= ✅ دوال احتياطية =============
const noop = async () => {};
const noopSync = () => {};

// ============= ✅ isSudo محلية (بدون استدعاء lib/index) =============
async function isSudo(jid) {
    try {
        if (!jid) return false;
        const sudoFile = './data/sudo.json';
        if (!fs.existsSync(sudoFile)) return false;
        const sudoList = JSON.parse(fs.readFileSync(sudoFile, 'utf-8'));
        if (!Array.isArray(sudoList)) return false;
        const number = jid.split('@')[0].split(':')[0];
        return sudoList.includes(number) || sudoList.includes(jid);
    } catch (e) {
        return false;
    }
}

// ============= ✅ isOwnerOrSudo محلية =============
async function isOwnerOrSudo(jid, sock, chatId) {
    try {
        if (!jid) return false;
        const ownerFile = './data/owner.json';
        if (!fs.existsSync(ownerFile)) return false;
        const ownerData = JSON.parse(fs.readFileSync(ownerFile, 'utf-8'));
        const number = jid.split('@')[0].split(':')[0];
        if (Array.isArray(ownerData)) {
            return ownerData.some(o => {
                const oNum = typeof o === 'string' ? o : (o.number || o.jid || '');
                return oNum.includes(number);
            });
        }
        if (ownerData.number) return ownerData.number.includes(number);
        return false;
    } catch (e) {
        return false;
    }
}

// ============= ✅ isAdmin محلية =============
async function isAdmin(sock, chatId, senderId) {
    try {
        const groupMetadata = await sock.groupMetadata(chatId);
        const participant = groupMetadata.participants.find(p => p.id === senderId);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const botParticipant = groupMetadata.participants.find(p => p.id === botId);
        return {
            isSenderAdmin: participant?.admin === 'admin' || participant?.admin === 'superadmin',
            isBotAdmin: botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin'
        };
    } catch (e) {
        return { isSenderAdmin: false, isBotAdmin: false };
    }
}

// ============= ✅ isBanned محلية =============
function isBanned(jid) {
    try {
        const banFile = './data/banned.json';
        if (!fs.existsSync(banFile)) return false;
        const bannedList = JSON.parse(fs.readFileSync(banFile, 'utf-8'));
        if (!Array.isArray(bannedList)) return false;
        const number = jid.split('@')[0].split(':')[0];
        return bannedList.includes(number) || bannedList.includes(jid);
    } catch (e) {
        return false;
    }
}

// ============= ✅ استيرادات آمنة للأوامر =============

// مكتبات خارجية
const yts = safeRequire('yt-search', null);
const fetch = safeRequire('node-fetch', null);
const ytdl = safeRequire('ytdl-core', null);
const axios = safeRequire('axios', null);
const ffmpeg = safeRequire('fluent-ffmpeg', null);

// lib/
const { fetchBuffer } = safeRequire('./lib/myfunc', { fetchBuffer: async () => null }) || { fetchBuffer: async () => null };
const { Antilink } = safeRequire('./lib/antilink', { Antilink: async () => {} }) || { Antilink: async () => {} };
const { handleAntiBadwordCommand, handleBadwordDetection } = safeRequire('./lib/antibadword', { handleAntiBadwordCommand: noop, handleBadwordDetection: noop }) || { handleAntiBadwordCommand: noop, handleBadwordDetection: noop };
const { handleAntiContactCommand, checkAntiContact } = safeRequire('./lib/anticontact', { handleAntiContactCommand: noop, checkAntiContact: noop }) || { handleAntiContactCommand: noop, checkAntiContact: noop };
const { addCommandReaction, handleAreactCommand } = safeRequire('./lib/reactions', { addCommandReaction: noop, handleAreactCommand: noop }) || { addCommandReaction: noop, handleAreactCommand: noop };

// commands/
const { autotypingCommand, isAutotypingEnabled, handleAutotypingForMessage, handleAutotypingForCommand, showTypingAfterCommand } = safeRequire('./commands/autotyping', { autotypingCommand: noop, isAutotypingEnabled: () => false, handleAutotypingForMessage: noop, handleAutotypingForCommand: noop, showTypingAfterCommand: noop }) || {};
const { autoreadCommand, isAutoreadEnabled, handleAutoread } = safeRequire('./commands/autoread', { autoreadCommand: noop, isAutoreadEnabled: () => false, handleAutoread: noop }) || {};

const tagAllCommand = safeRequire('./commands/tagall', noop);
const helpCommand = safeRequire('./commands/help', async (sock, chatId) => {
    await sock.sendMessage(chatId, { text: `🤖 *${global.botName}*\n\n📌 الأوامر:\n• .ping\n• .owner\n• .help\n• .menu\n• .jid\n\n📢 ${global.channelLink}` });
});
const banCommand = safeRequire('./commands/ban', noop);
const { promoteCommand } = safeRequire('./commands/promote', { promoteCommand: noop }) || { promoteCommand: noop };
const { demoteCommand } = safeRequire('./commands/demote', { demoteCommand: noop }) || { demoteCommand: noop };
const muteCommand = safeRequire('./commands/mute', noop);
const unmuteCommand = safeRequire('./commands/unmute', noop);
const stickerCommand = safeRequire('./commands/sticker', noop);
const warnCommand = safeRequire('./commands/warn', noop);
const warningsCommand = safeRequire('./commands/warnings', noop);
const ttsCommand = safeRequire('./commands/tts', noop);
const { tictactoeCommand, handleTicTacToeMove } = safeRequire('./commands/tictactoe', { tictactoeCommand: noop, handleTicTacToeMove: noop }) || { tictactoeCommand: noop, handleTicTacToeMove: noop };
const { incrementMessageCount, topMembers } = safeRequire('./commands/topmembers', { incrementMessageCount: noopSync, topMembers: noopSync }) || { incrementMessageCount: noopSync, topMembers: noopSync };
const ownerCommand = safeRequire('./commands/owner', async (sock, chatId) => {
    await sock.sendMessage(chatId, { text: `👤 *المطور:* ${global.developer}\n📢 *القناة:* ${global.channelLink}` });
});
const deleteCommand = safeRequire('./commands/delete', noop);
const { handleAntilinkCommand, handleLinkDetection } = safeRequire('./commands/antilink', { handleAntilinkCommand: noop, handleLinkDetection: noop }) || { handleAntilinkCommand: noop, handleLinkDetection: noop };
const { handleAntitagCommand, handleTagDetection } = safeRequire('./commands/antitag', { handleAntitagCommand: noop, handleTagDetection: noop }) || { handleAntitagCommand: noop, handleTagDetection: noop };
const { handleMentionDetection, mentionToggleCommand, setMentionCommand } = safeRequire('./commands/mention', { handleMentionDetection: noop, mentionToggleCommand: noop, setMentionCommand: noop }) || { handleMentionDetection: noop, mentionToggleCommand: noop, setMentionCommand: noop };
const memeCommand = safeRequire('./commands/meme', noop);
const tagCommand = safeRequire('./commands/tag', noop);
const tagNotAdminCommand = safeRequire('./commands/tagnotadmin', noop);
const hideTagCommand = safeRequire('./commands/hidetag', noop);
const jokeCommand = safeRequire('./commands/joke', noop);
const quoteCommand = safeRequire('./commands/quote', noop);
const factCommand = safeRequire('./commands/fact', noop);
const weatherCommand = safeRequire('./commands/weather', noop);
const newsCommand = safeRequire('./commands/news', noop);
const kickCommand = safeRequire('./commands/kick', noop);
const simageCommand = safeRequire('./commands/simage', noop);
const attpCommand = safeRequire('./commands/attp', noop);
const { startHangman, guessLetter } = safeRequire('./commands/hangman', { startHangman: noop, guessLetter: noop }) || { startHangman: noop, guessLetter: noop };
const { startTrivia, answerTrivia } = safeRequire('./commands/trivia', { startTrivia: noop, answerTrivia: noop }) || { startTrivia: noop, answerTrivia: noop };
const { complimentCommand } = safeRequire('./commands/compliment', { complimentCommand: noop }) || { complimentCommand: noop };
const { insultCommand } = safeRequire('./commands/insult', { insultCommand: noop }) || { insultCommand: noop };
const { eightBallCommand } = safeRequire('./commands/eightball', { eightBallCommand: noop }) || { eightBallCommand: noop };
const { lyricsCommand } = safeRequire('./commands/lyrics', { lyricsCommand: noop }) || { lyricsCommand: noop };
const { dareCommand } = safeRequire('./commands/dare', { dareCommand: noop }) || { dareCommand: noop };
const { truthCommand } = safeRequire('./commands/truth', { truthCommand: noop }) || { truthCommand: noop };
const { clearCommand } = safeRequire('./commands/clear', { clearCommand: noop }) || { clearCommand: noop };
const pingCommand = safeRequire('./commands/ping', async (sock, chatId, message) => {
    await sock.sendMessage(chatId, { text: '🏓 بونق! البوت شغال ✅', ...contextInfoChannel }, { quoted: message });
});
const aliveCommand = safeRequire('./commands/alive', noop);
const blurCommand = safeRequire('./commands/img-blur', noop);
const { welcomeCommand, handleJoinEvent } = safeRequire('./commands/welcome', { welcomeCommand: noop, handleJoinEvent: noop }) || { welcomeCommand: noop, handleJoinEvent: noop };
const { goodbyeCommand, handleLeaveEvent } = safeRequire('./commands/goodbye', { goodbyeCommand: noop, handleLeaveEvent: noop }) || { goodbyeCommand: noop, handleLeaveEvent: noop };
const githubCommand = safeRequire('./commands/github', noop);
const antibadwordCommand = safeRequire('./commands/antibadword', noop);
const { handleChatbotCommand, handleChatbotResponse } = safeRequire('./commands/chatbot', { handleChatbotCommand: noop, handleChatbotResponse: noop }) || { handleChatbotCommand: noop, handleChatbotResponse: noop };
const takeCommand = safeRequire('./commands/take', noop);
const { flirtCommand } = safeRequire('./commands/flirt', { flirtCommand: noop }) || { flirtCommand: noop };
const characterCommand = safeRequire('./commands/character', noop);
const wastedCommand = safeRequire('./commands/wasted', noop);
const shipCommand = safeRequire('./commands/ship', noop);
const groupInfoCommand = safeRequire('./commands/groupinfo', noop);
const resetlinkCommand = safeRequire('./commands/resetlink', noop);
const staffCommand = safeRequire('./commands/staff', noop);
const unbanCommand = safeRequire('./commands/unban', noop);
const emojimixCommand = safeRequire('./commands/emojimix', noop);
const { handlePromotionEvent } = safeRequire('./commands/promote', { handlePromotionEvent: noop }) || { handlePromotionEvent: noop };
const { handleDemotionEvent } = safeRequire('./commands/demote', { handleDemotionEvent: noop }) || { handleDemotionEvent: noop };
const viewOnceCommand = safeRequire('./commands/viewonce', noop);
const clearSessionCommand = safeRequire('./commands/clearsession', noop);
const { autoStatusCommand, handleStatusUpdate } = safeRequire('./commands/autostatus', { autoStatusCommand: noop, handleStatusUpdate: noop }) || { autoStatusCommand: noop, handleStatusUpdate: noop };
const { simpCommand } = safeRequire('./commands/simp', { simpCommand: noop }) || { simpCommand: noop };
const { stupidCommand } = safeRequire('./commands/stupid', { stupidCommand: noop }) || { stupidCommand: noop };
const stickerTelegramCommand = safeRequire('./commands/stickertelegram', noop);
const textmakerCommand = safeRequire('./commands/textmaker', noop);
const { handleAntideleteCommand, handleMessageRevocation, storeMessage } = safeRequire('./commands/antidelete', { handleAntideleteCommand: noop, handleMessageRevocation: noop, storeMessage: noopSync }) || { handleAntideleteCommand: noop, handleMessageRevocation: noop, storeMessage: noopSync };
const clearTmpCommand = safeRequire('./commands/cleartmp', noop);
const setProfilePicture = safeRequire('./commands/setpp', noop);
const { setGroupDescription, setGroupName, setGroupPhoto } = safeRequire('./commands/groupmanage', { setGroupDescription: noop, setGroupName: noop, setGroupPhoto: noop }) || { setGroupDescription: noop, setGroupName: noop, setGroupPhoto: noop };
const instagramCommand = safeRequire('./commands/instagram', noop);
const facebookCommand = safeRequire('./commands/facebook', noop);
const spotifyCommand = safeRequire('./commands/spotify', noop);
const playCommand = safeRequire('./commands/play', noop);
const tiktokCommand = safeRequire('./commands/tiktok', noop);
const songCommand = safeRequire('./commands/song', noop);
const aiCommand = safeRequire('./commands/ai', noop);
const urlCommand = safeRequire('./commands/url', noop);
const { handleTranslateCommand } = safeRequire('./commands/translate', { handleTranslateCommand: noop }) || { handleTranslateCommand: noop };
const { handleSsCommand } = safeRequire('./commands/ss', { handleSsCommand: noop }) || { handleSsCommand: noop };
const { goodnightCommand } = safeRequire('./commands/goodnight', { goodnightCommand: noop }) || { goodnightCommand: noop };
const { shayariCommand } = safeRequire('./commands/shayari', { shayariCommand: noop }) || { shayariCommand: noop };
const { rosedayCommand } = safeRequire('./commands/roseday', { rosedayCommand: noop }) || { rosedayCommand: noop };
const imagineCommand = safeRequire('./commands/imagine', noop);
const videoCommand = safeRequire('./commands/video', noop);
const sudoCommand = safeRequire('./commands/sudo', noop);
const { miscCommand, handleHeart } = safeRequire('./commands/misc', { miscCommand: noop, handleHeart: noop }) || { miscCommand: noop, handleHeart: noop };
const { animeCommand } = safeRequire('./commands/anime', { animeCommand: noop }) || { animeCommand: noop };
const { piesCommand, piesAlias } = safeRequire('./commands/pies', { piesCommand: noop, piesAlias: noop }) || { piesCommand: noop, piesAlias: noop };
const stickercropCommand = safeRequire('./commands/stickercrop', noop);
const updateCommand = safeRequire('./commands/update', noop);
const removebgCommand = safeRequire('./commands/removebg', { exec: noop }) || { exec: noop };
const { reminiCommand } = safeRequire('./commands/remini', { reminiCommand: noop }) || { reminiCommand: noop };
const { igsCommand } = safeRequire('./commands/igs', { igsCommand: noop }) || { igsCommand: noop };
const { anticallCommand, readState: readAnticallState } = safeRequire('./commands/anticall', { anticallCommand: noop, readState: () => ({ enabled: false }) }) || { anticallCommand: noop, readState: () => ({ enabled: false }) };
const { pmblockerCommand, readState: readPmBlockerState } = safeRequire('./commands/pmblocker', { pmblockerCommand: noop, readState: () => ({ enabled: false, message: '' }) }) || { pmblockerCommand: noop, readState: () => ({ enabled: false, message: '' }) };
const settingsCommand = safeRequire('./commands/settings', noop);
const soraCommand = safeRequire('./commands/sora', noop);
const salamCommand = safeRequire('./commands/salam', { run: noop }) || { run: noop };
const hackCommand = safeRequire('./commands/hack', { run: noop }) || { run: noop };

// الإعدادات العامة
global.packname = settings.packname || 'JAWAD.BOT';
global.author = settings.author || 'DarkXecutor';

// ✅ معالجة الأخطاء العامة
process.on('uncaughtException', (error) => {
    console.error('❌ خطأ غير متوقع:', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ وعد مرفوض:', reason);
});

// ✅ دالة مساعدة لجلب بيانات المجموعة مع إعادة المحاولة
async function getGroupMetadataSafe(sock, chatId, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await sock.groupMetadata(chatId);
        } catch (error) {
            if (i === retries - 1) throw error;
            console.log(`🔄 محاولة جلب بيانات المجموعة ${i + 2}/${retries}`);
            await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        }
    }
}

async function handleMessages(sock, messageUpdate, printLog) {
    let chatId = null;
    let isGroup = false;
    let senderId = null;
    let isSenderAdmin = false;
    let isBotAdmin = false;
    let senderIsSudo = false;
    let senderIsOwnerOrSudo = false;
    let userMessage = '';
    let rawText = '';
    let message = null;

    try {
        const { messages, type } = messageUpdate;
        if (type !== 'notify') return;

        message = messages[0];
        if (!message?.message) return;

        // ✅ استدعاءات آمنة
        try { await handleAutoread(sock, message); } catch (e) {}
        try { if (message.message) storeMessage(sock, message); } catch (e) {}

        if (message.message?.protocolMessage?.type === 0) {
            try { await handleMessageRevocation(sock, message); } catch (e) {}
            return;
        }

        chatId = message.key.remoteJid;
        senderId = message.key.participant || message.key.remoteJid;
        isGroup = chatId?.endsWith('@g.us') || false;
        
        try { senderIsSudo = await isSudo(senderId); } catch (e) { senderIsSudo = false; }
        try { senderIsOwnerOrSudo = await isOwnerOrSudo(senderId, sock, chatId); } catch (e) { senderIsOwnerOrSudo = false; }

        if (message.message?.buttonsResponseMessage) {
            const buttonId = message.message.buttonsResponseMessage.selectedButtonId;
            const btnChatId = message.key.remoteJid;

            if (buttonId === 'channel') {
                await sock.sendMessage(btnChatId, {
                    text: `📢 *انضم لقناتنا:*\n${global.channelLink}`
                }, { quoted: message });
                return;
            } else if (buttonId === 'owner') {
                await ownerCommand(sock, btnChatId);
                return;
            } else if (buttonId === 'support') {
                await sock.sendMessage(btnChatId, {
                    text: `🔗 *الدعم*\n\n${global.supportGroup}`
                }, { quoted: message });
                return;
            }
        }

        userMessage = (
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            message.message?.buttonsResponseMessage?.selectedButtonId?.trim() ||
            ''
        ).toLowerCase().replace(/\.\s+/g, '.').trim();

        rawText = message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            '';

        if (userMessage.startsWith('.')) {
            console.log(`📝 أمر مستخدم في ${isGroup ? 'مجموعة' : 'خاص'}: ${userMessage}`);
        }

        let isPublic = true;
        try {
            const data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
            if (typeof data.isPublic === 'boolean') isPublic = data.isPublic;
        } catch (error) {
            // تجاهل
        }

        const isOwnerOrSudoCheck = message.key.fromMe || senderIsOwnerOrSudo;

        if (isBanned(senderId) && !userMessage.startsWith('.unban')) {
            if (Math.random() < 0.1) {
                await sock.sendMessage(chatId, {
                    text: '❌ لقد تم حظرك من استخدام البوت.',
                    ...contextInfoChannel
                });
            }
            return;
        }

        if (/^[1-9]$/.test(userMessage) || userMessage.toLowerCase() === 'surrender') {
            try { await handleTicTacToeMove(sock, chatId, senderId, userMessage); } catch (e) {}
            return;
        }

        if (!message.key.fromMe) try { incrementMessageCount(chatId, senderId); } catch (e) {}

        if (isGroup) {
            if (userMessage) {
                try { await handleBadwordDetection(sock, chatId, message, userMessage, senderId); } catch (e) {}
            }
            try { await Antilink(message, sock); } catch (e) {}
            try { await checkAntiContact(sock, chatId, message, { requireGroup: async () => true }); } catch (e) {}
        }

        if (!isGroup && !message.key.fromMe && !senderIsSudo) {
            try {
                const pmState = readPmBlockerState();
                if (pmState.enabled) {
                    await sock.sendMessage(chatId, { text: pmState.message || 'الرسائل الخاصة مغلقة.' });
                    await new Promise(r => setTimeout(r, 1500));
                    try { await sock.updateBlockStatus(chatId, 'block'); } catch (e) { }
                    return;
                }
            } catch (e) { }
        }

        if (!userMessage.startsWith('.')) {
            try { await handleAutotypingForMessage(sock, chatId, userMessage); } catch (e) {}

            if (isGroup) {
                try { await handleTagDetection(sock, chatId, message, senderId); } catch (e) {}
                try { await handleMentionDetection(sock, chatId, message); } catch (e) {}

                if (isPublic || isOwnerOrSudoCheck) {
                    try { await handleChatbotResponse(sock, chatId, message, userMessage, senderId); } catch (e) {}
                }
            }
            return;
        }

        if (!isPublic && !isOwnerOrSudoCheck) {
            return;
        }

        const adminCommands = ['.mute', '.unmute', '.ban', '.unban', '.promote', '.demote', '.kick', '.tagall', '.tagnotadmin', '.hidetag', '.antilink', '.antitag', '.setgdesc', '.setgname', '.setgpp'];
        const isAdminCommand = adminCommands.some(cmd => userMessage.startsWith(cmd));

        const ownerCommands = ['.mode', '.autostatus', '.antidelete', '.cleartmp', '.setpp', '.clearsession', '.areact', '.autoreact', '.autotyping', '.autoread', '.pmblocker'];
        const isOwnerCommand = ownerCommands.some(cmd => userMessage.startsWith(cmd));

        if (isGroup && isAdminCommand) {
            const adminStatus = await isAdmin(sock, chatId, senderId);
            isSenderAdmin = adminStatus.isSenderAdmin;
            isBotAdmin = adminStatus.isBotAdmin;

            if (!isBotAdmin) {
                await sock.sendMessage(chatId, { text: 'الرجاء جعل البوت مشرفاً لاستخدام أوامر المشرفين.', ...contextInfoChannel }, { quoted: message });
                return;
            }

            if (
                userMessage.startsWith('.mute') ||
                userMessage === '.unmute' ||
                userMessage.startsWith('.ban') ||
                userMessage.startsWith('.unban') ||
                userMessage.startsWith('.promote') ||
                userMessage.startsWith('.demote')
            ) {
                if (!isSenderAdmin && !message.key.fromMe) {
                    await sock.sendMessage(chatId, {
                        text: 'عذراً، فقط مشرفي المجموعة يمكنهم استخدام هذا الأمر.',
                        ...contextInfoChannel
                    }, { quoted: message });
                    return;
                }
            }
        }

        if (isOwnerCommand) {
            if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                await sock.sendMessage(chatId, { text: '❌ هذا الأمر متاح فقط للمالك أو المشرف الخاص!' }, { quoted: message });
                return;
            }
        }

        let commandExecuted = false;

        switch (true) {
            // ===== أمر سلام (طرد المجموعة) =====
            case userMessage.startsWith('.سلام') || userMessage.startsWith('.salem') || userMessage.startsWith('.طرد'):
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: '❌ هذا الأمر يمكن استخدامه فقط في المجموعات.', ...contextInfoChannel }, { quoted: message });
                    break;
                }
                if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                    await sock.sendMessage(chatId, { text: '❌ هذا الأمر متاح فقط للمالك!', ...contextInfoChannel }, { quoted: message });
                    break;
                }
                {
                    const ctxSalam = {
                        requireOwner: async () => true,
                        requireGroup: async (msg) => true,
                        channelInfo: contextInfoChannel
                    };
                    const argsSalam = userMessage.split(' ').slice(1).join(' ');
                    try { await salamCommand.run(sock, chatId, message, argsSalam, 'سلام', ctxSalam); } catch (e) { console.error('salam error:', e.message); }
                    commandExecuted = true;
                }
                break;

            // ===== أمر التهكير =====
            case userMessage.startsWith('.تهكير') || userMessage.startsWith('.hack') || userMessage.startsWith('.اختراق') || userMessage.startsWith('.هاك'):
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: '❌ هذا الأمر يمكن استخدامه فقط في المجموعات.', ...contextInfoChannel }, { quoted: message });
                    break;
                }
                if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                    await sock.sendMessage(chatId, { text: '❌ هذا الأمر متاح فقط للمالك!', ...contextInfoChannel }, { quoted: message });
                    break;
                }
                {
                    const ctxHack = {
                        requireOwner: async () => true,
                        requireGroup: async (msg) => true,
                        channelInfo: contextInfoChannel
                    };
                    const argsHack = userMessage.split(' ').slice(1).join(' ');
                    try { await hackCommand.run(sock, chatId, message, argsHack, 'تهكير', ctxHack); } catch (e) { console.error('hack error:', e.message); }
                    commandExecuted = true;
                }
                break;

            case userMessage === '.simage': {
                const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                if (quotedMessage?.stickerMessage) {
                    try { await simageCommand(sock, quotedMessage, chatId); } catch (e) {}
                } else {
                    await sock.sendMessage(chatId, { text: 'الرجاء الرد على ملصق.', ...contextInfoChannel }, { quoted: message });
                }
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.kick'):
                try {
                    const mentionedJidListKick = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                    await kickCommand(sock, chatId, senderId, mentionedJidListKick, message);
                } catch (e) { console.error('kick error:', e.message); }
                break;
            case userMessage.startsWith('.mute'):
                try {
                    const parts = userMessage.trim().split(/\s+/);
                    const muteArg = parts[1];
                    const muteDuration = muteArg !== undefined ? parseInt(muteArg, 10) : undefined;
                    if (muteArg !== undefined && (isNaN(muteDuration) || muteDuration <= 0)) {
                        await sock.sendMessage(chatId, { text: 'الرجاء إدخال عدد دقائق صحيح.', ...contextInfoChannel }, { quoted: message });
                    } else {
                        await muteCommand(sock, chatId, senderId, message, muteDuration);
                    }
                } catch (e) {}
                break;
            case userMessage === '.unmute':
                try { await unmuteCommand(sock, chatId, senderId); } catch (e) {}
                break;
            case userMessage.startsWith('.ban'):
                if (!isGroup && !message.key.fromMe && !senderIsSudo) {
                    await sock.sendMessage(chatId, { text: 'فقط المالك يمكنه استخدام .ban في الخاص.' }, { quoted: message });
                    break;
                }
                try { await banCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage.startsWith('.unban'):
                if (!isGroup && !message.key.fromMe && !senderIsSudo) {
                    await sock.sendMessage(chatId, { text: 'فقط المالك يمكنه استخدام .unban في الخاص.' }, { quoted: message });
                    break;
                }
                try { await unbanCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage === '.help' || userMessage === '.menu' || userMessage === '.bot' || userMessage === '.list':
                try { await helpCommand(sock, chatId, message, global.channelLink); } catch (e) { console.error('help error:', e.message); }
                commandExecuted = true;
                break;
            case userMessage === '.sticker' || userMessage === '.s':
                try { await stickerCommand(sock, chatId, message); } catch (e) {}
                commandExecuted = true;
                break;
            case userMessage === '.owner':
                try { await ownerCommand(sock, chatId); } catch (e) {}
                break;
            case userMessage === '.ping':
                try { await pingCommand(sock, chatId, message); } catch (e) {
                    await sock.sendMessage(chatId, { text: '🏓 بونق!', ...contextInfoChannel }, { quoted: message });
                }
                break;
            case userMessage === '.jid':
                await sock.sendMessage(chatId, { text: `🆔 معرف المحادثة: ${chatId}` }, { quoted: message });
                break;
            case userMessage === '.alive':
                try { await aliveCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage === '.mode':
                if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                    await sock.sendMessage(chatId, { text: 'فقط المالك يمكنه استخدام هذا الأمر!' }, { quoted: message });
                    break;
                }
                try {
                    let data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
                    const action = userMessage.split(' ')[1]?.toLowerCase();
                    if (action === 'عام' || action === 'خاص') {
                        data.isPublic = action === 'عام';
                        fs.writeFileSync('./data/messageCount.json', JSON.stringify(data, null, 2));
                        await sock.sendMessage(chatId, { text: `البوت الآن في وضع *${action}*`, ...contextInfoChannel });
                    } else {
                        const currentMode = data.isPublic ? 'عام' : 'خاص';
                        await sock.sendMessage(chatId, { text: `الوضع الحالي: *${currentMode}*\n\nالاستخدام: .mode عام/خاص`, ...contextInfoChannel }, { quoted: message });
                    }
                } catch (e) {
                    await sock.sendMessage(chatId, { text: 'فشل في قراءة حالة البوت', ...contextInfoChannel });
                }
                break;
            case userMessage === '.settings':
                try { await settingsCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage.startsWith('.anticall'):
                if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                    await sock.sendMessage(chatId, { text: 'فقط المالك يمكنه استخدام هذا الأمر.' }, { quoted: message });
                    break;
                }
                try {
                    const args = userMessage.split(' ').slice(1).join(' ');
                    await anticallCommand(sock, chatId, message, args);
                } catch (e) {}
                break;
            case userMessage.startsWith('.pmblocker'):
                try {
                    const args = userMessage.split(' ').slice(1).join(' ');
                    await pmblockerCommand(sock, chatId, message, args);
                } catch (e) {}
                commandExecuted = true;
                break;
            case userMessage.startsWith('.antilink'):
                if (!isGroup || !isBotAdmin) {
                    await sock.sendMessage(chatId, { text: 'هذا الأمر للمجموعات فقط ومع البوت مشرف.', ...contextInfoChannel }, { quoted: message });
                    break;
                }
                try { await handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message); } catch (e) {}
                break;
            case userMessage.startsWith('.antitag'):
                if (!isGroup || !isBotAdmin) {
                    await sock.sendMessage(chatId, { text: 'هذا الأمر للمجموعات فقط ومع البوت مشرف.', ...contextInfoChannel }, { quoted: message });
                    break;
                }
                try { await handleAntitagCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message); } catch (e) {}
                break;
            case userMessage === '.tagall':
                try { await tagAllCommand(sock, chatId, senderId, message); } catch (e) {}
                break;
            case userMessage === '.tagnotadmin':
                try { await tagNotAdminCommand(sock, chatId, senderId, message); } catch (e) {}
                break;
            case userMessage.startsWith('.hidetag'):
                try {
                    const messageText = rawText.slice(8).trim();
                    const replyMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
                    await hideTagCommand(sock, chatId, senderId, messageText, replyMessage, message);
                } catch (e) {}
                break;
            case userMessage.startsWith('.tag '):
                try {
                    const messageText = rawText.slice(4).trim();
                    const replyMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
                    await tagCommand(sock, chatId, senderId, messageText, replyMessage, message);
                } catch (e) {}
                break;
            case userMessage.startsWith('.promote'):
                try {
                    const mentionedJidListPromote = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                    await promoteCommand(sock, chatId, mentionedJidListPromote, message);
                } catch (e) {}
                break;
            case userMessage.startsWith('.demote'):
                try {
                    const mentionedJidListDemote = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                    await demoteCommand(sock, chatId, mentionedJidListDemote, message);
                } catch (e) {}
                break;
            case userMessage === '.meme':
                try { await memeCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage === '.joke':
                try { await jokeCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage === '.quote':
                try { await quoteCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage === '.fact':
                try { await factCommand(sock, chatId, message, message); } catch (e) {}
                break;
            case userMessage.startsWith('.weather'):
                try {
                    const city = userMessage.slice(9).trim();
                    if (city) await weatherCommand(sock, chatId, message, city);
                    else await sock.sendMessage(chatId, { text: 'الرجاء تحديد مدينة.', ...contextInfoChannel }, { quoted: message });
                } catch (e) {}
                break;
            case userMessage === '.news':
                try { await newsCommand(sock, chatId); } catch (e) {}
                break;
            case userMessage.startsWith('.warn'):
                try {
                    const mentionedJidListWarn = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                    await warnCommand(sock, chatId, senderId, mentionedJidListWarn, message);
                } catch (e) {}
                break;
            case userMessage.startsWith('.warnings'):
                try {
                    const mentionedJidListWarnings = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                    await warningsCommand(sock, chatId, mentionedJidListWarnings);
                } catch (e) {}
                break;
            case userMessage.startsWith('.tts'):
                try {
                    const text = userMessage.slice(4).trim();
                    await ttsCommand(sock, chatId, text, message);
                } catch (e) {}
                break;
            case userMessage.startsWith('.delete') || userMessage.startsWith('.del'):
                try { await deleteCommand(sock, chatId, message, senderId); } catch (e) {}
                break;
            case userMessage.startsWith('.ttt') || userMessage.startsWith('.tictactoe'):
                try {
                    const tttText = userMessage.split(' ').slice(1).join(' ');
                    await tictactoeCommand(sock, chatId, senderId, tttText);
                } catch (e) {}
                break;
            case userMessage === '.topmembers':
                try { topMembers(sock, chatId, isGroup); } catch (e) {}
                break;
            case userMessage.startsWith('.compliment'):
                try { await complimentCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage.startsWith('.insult'):
                try { await insultCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage.startsWith('.8ball'):
                try {
                    const question = userMessage.split(' ').slice(1).join(' ');
                    await eightBallCommand(sock, chatId, question);
                } catch (e) {}
                break;
            case userMessage.startsWith('.lyrics'):
                try {
                    const songTitle = userMessage.split(' ').slice(1).join(' ');
                    await lyricsCommand(sock, chatId, songTitle, message);
                } catch (e) {}
                break;
            case userMessage === '.dare':
                try { await dareCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage === '.truth':
                try { await truthCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage === '.clear':
                if (isGroup) try { await clearCommand(sock, chatId); } catch (e) {}
                break;
            case userMessage === '.ship':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'هذا الأمر للمجموعات فقط!', ...contextInfoChannel }, { quoted: message });
                    break;
                }
                try { await shipCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage === '.groupinfo' || userMessage === '.infogp':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'هذا الأمر للمجموعات فقط!', ...contextInfoChannel }, { quoted: message });
                    break;
                }
                try { await groupInfoCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage === '.resetlink' || userMessage === '.revoke':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'هذا الأمر للمجموعات فقط!', ...contextInfoChannel }, { quoted: message });
                    break;
                }
                try { await resetlinkCommand(sock, chatId, senderId); } catch (e) {}
                break;
            case userMessage === '.staff' || userMessage === '.admins':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'هذا الأمر للمجموعات فقط!', ...contextInfoChannel }, { quoted: message });
                    break;
                }
                try { await staffCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage.startsWith('.url') || userMessage.startsWith('.tourl'):
                try { await urlCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage.startsWith('.emojimix') || userMessage.startsWith('.emix'):
                try { await emojimixCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage.startsWith('.tg') || userMessage.startsWith('.stickertelegram'):
                try { await stickerTelegramCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage === '.vv':
                try { await viewOnceCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage === '.clearsession':
                try { await clearSessionCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage.startsWith('.autostatus'):
                try {
                    const autoStatusArgs = userMessage.split(' ').slice(1);
                    await autoStatusCommand(sock, chatId, message, autoStatusArgs);
                } catch (e) {}
                break;
            case userMessage.startsWith('.antidelete'):
                try {
                    const antideleteMatch = userMessage.slice(11).trim();
                    await handleAntideleteCommand(sock, chatId, message, antideleteMatch);
                } catch (e) {}
                break;
            case userMessage === '.cleartmp':
                try { await clearTmpCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage === '.setpp':
                try { await setProfilePicture(sock, chatId, message); } catch (e) {}
                break;
            case userMessage.startsWith('.instagram') || userMessage.startsWith('.insta') || userMessage === '.ig':
                try { await instagramCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage.startsWith('.fb') || userMessage.startsWith('.facebook'):
                try { await facebookCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage.startsWith('.spotify'):
                try { await spotifyCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage.startsWith('.play') || userMessage.startsWith('.mp3') || userMessage.startsWith('.song'):
                try { await songCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage.startsWith('.video') || userMessage.startsWith('.ytmp4'):
                try { await videoCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage.startsWith('.tiktok') || userMessage.startsWith('.tt'):
                try { await tiktokCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage.startsWith('.gpt') || userMessage.startsWith('.gemini'):
                try { await aiCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage.startsWith('.areact') || userMessage.startsWith('.autoreact'):
                try { await handleAreactCommand(sock, chatId, message, isOwnerOrSudoCheck); } catch (e) {}
                break;
            case userMessage.startsWith('.sudo'):
                try { await sudoCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage === '.goodnight' || userMessage === '.gn':
                try { await goodnightCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage === '.shayari':
                try { await shayariCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage === '.roseday':
                try { await rosedayCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage.startsWith('.imagine') || userMessage.startsWith('.flux'):
                try { await imagineCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage.startsWith('.autotyping'):
                try { await autotypingCommand(sock, chatId, message); } catch (e) {}
                commandExecuted = true;
                break;
            case userMessage.startsWith('.autoread'):
                try { await autoreadCommand(sock, chatId, message); } catch (e) {}
                commandExecuted = true;
                break;
            case userMessage.startsWith('.heart'):
                try { await handleHeart(sock, chatId, message); } catch (e) {}
                break;
            case userMessage.startsWith('.misc') || userMessage.startsWith('.horny') || userMessage.startsWith('.circle'):
                try {
                    const parts = userMessage.trim().split(/\s+/);
                    const args = parts.slice(1);
                    await miscCommand(sock, chatId, message, args);
                } catch (e) {}
                break;
            case userMessage.startsWith('.sora'):
                try { await soraCommand(sock, chatId, message); } catch (e) {}
                break;
            case userMessage.startsWith('.removebg') || userMessage.startsWith('.rmbg'):
                try { await removebgCommand.exec(sock, message, userMessage.split(' ').slice(1)); } catch (e) {}
                break;
            case userMessage.startsWith('.remini') || userMessage.startsWith('.enhance'):
                try { await reminiCommand(sock, chatId, message, userMessage.split(' ').slice(1)); } catch (e) {}
                break;
            case userMessage.startsWith('.anticontact'):
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: '❌ للمجموعات فقط.', ...contextInfoChannel }, { quoted: message });
                    break;
                }
                try {
                    const antiContactArgs = userMessage.split(' ').slice(1).join(' ');
                    await handleAntiContactCommand(sock, chatId, message, antiContactArgs, { requireGroup: async () => true, requireBotAdmin: async () => true, requireSenderAdmin: async () => true });
                } catch (e) {}
                commandExecuted = true;
                break;

            default:
                if (isGroup) {
                    try { if (userMessage) await handleChatbotResponse(sock, chatId, message, userMessage, senderId); } catch (e) {}
                    try { await handleTagDetection(sock, chatId, message, senderId); } catch (e) {}
                    try { await handleMentionDetection(sock, chatId, message); } catch (e) {}
                }
                commandExecuted = false;
                break;
        }

        if (commandExecuted !== false) {
            try { await showTypingAfterCommand(sock, chatId); } catch (e) {}
        }

        if (userMessage.startsWith('.')) {
            try { await addCommandReaction(sock, message); } catch (e) {}
        }
    } catch (error) {
        console.error('❌ خطأ في معالج الرسائل:', error.message);
        if (chatId) {
            try {
                await sock.sendMessage(chatId, { text: '❌ فشل في معالجة الأمر!' });
            } catch (sendError) {
                console.error('❌ فشل في إرسال رسالة الخطأ:', sendError.message);
            }
        }
    }
}

async function handleGroupParticipantUpdate(sock, update) {
    try {
        const { id, participants, action, author } = update;
        if (!id?.endsWith('@g.us')) return;

        let isPublic = true;
        try {
            const modeData = JSON.parse(fs.readFileSync('./data/messageCount.json'));
            if (typeof modeData.isPublic === 'boolean') isPublic = modeData.isPublic;
        } catch (e) {}

        if (action === 'promote') {
            if (!isPublic) return;
            try { await handlePromotionEvent(sock, id, participants, author); } catch (e) {}
            return;
        }
        if (action === 'demote') {
            if (!isPublic) return;
            try { await handleDemotionEvent(sock, id, participants, author); } catch (e) {}
            return;
        }
        if (action === 'add') {
            try { await handleJoinEvent(sock, id, participants); } catch (e) {}
        }
        if (action === 'remove') {
            try { await handleLeaveEvent(sock, id, participants); } catch (e) {}
        }
    } catch (error) {
        console.error('❌ خطأ في معالجة تحديث المشاركين:', error.message);
    }
}

module.exports = {
    handleMessages,
    handleGroupParticipantUpdate,
    handleStatus: async (sock, status) => {
        try {
            await handleStatusUpdate(sock, status);
        } catch (error) {
            console.error('❌ خطأ في معالجة تحديث الحالة:', error.message);
        }
    },
    isSudo,
    isOwnerOrSudo,
    isAdmin,
    isBanned
};
