/**
 * lib/index.js - دوال مساعدة فقط (بدون تشغيل البوت)
 */
const fs = require('fs');

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

async function isOwner(jid) {
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

async function isAdmin(sock, jid, participant) {
    try {
        const groupMetadata = await sock.groupMetadata(jid);
        const participantData = groupMetadata.participants.find(p => p.id === participant);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const botData = groupMetadata.participants.find(p => p.id === botId);
        return {
            isSenderAdmin: participantData?.admin === 'admin' || participantData?.admin === 'superadmin',
            isBotAdmin: botData?.admin === 'admin' || botData?.admin === 'superadmin'
        };
    } catch (error) {
        return { isSenderAdmin: false, isBotAdmin: false };
    }
}

module.exports = {
    isSudo,
    isOwner,
    isAdmin
};
