const fs = require('fs');
const path = require('path');

const antilinkFilePath = path.join(__dirname, '../data', 'antilinkSettings.json');
const warningsFilePath = path.join(__dirname, '../data', 'antilinkWarnings.json');

// ===================== إعدادات مكافحة الروابط =====================

function loadAntilinkSettings() {
    try {
        if (fs.existsSync(antilinkFilePath)) {
            const data = fs.readFileSync(antilinkFilePath, 'utf8');
            return JSON.parse(data);
        }
        return {};
    } catch (error) {
        console.error('خطأ في تحميل إعدادات مكافحة الروابط:', error);
        return {};
    }
}

function saveAntilinkSettings(settings) {
    try {
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(antilinkFilePath, JSON.stringify(settings, null, 2));
        return true;
    } catch (error) {
        console.error('خطأ في حفظ إعدادات مكافحة الروابط:', error);
        return false;
    }
}

/**
 * تعيين إعداد مكافحة الروابط لمجموعة (متوافق مع index.js)
 * @param {string} groupId - معرف المجموعة
 * @param {string} status - الحالة (on/off)
 * @param {string} action - الإجراء (delete/kick/warn)
 * @param {number} warnCount - عدد التحذيرات
 * @returns {boolean} - نجاح العملية
 */
function setAntilink(groupId, status, action, warnCount = 3) {
    const settings = loadAntilinkSettings();
    settings[groupId] = {
        enabled: status === 'on',
        action: action || 'delete',
        warnCount: warnCount || 3,
        updatedAt: new Date().toISOString()
    };
    return saveAntilinkSettings(settings);
}

/**
 * الحصول على إعداد مكافحة الروابط لمجموعة (متوافق مع index.js)
 * @param {string} groupId - معرف المجموعة
 * @param {string} status - غير مستخدم (للتوافق)
 * @returns {object} - كائن الإعدادات { enabled, action, warnCount }
 */
function getAntilink(groupId, status) {
    const settings = loadAntilinkSettings();
    const config = settings[groupId] || null;
    
    // إرجاع الكائن بتنسيق متوافق مع index.js
    if (config) {
        return {
            enabled: config.enabled || false,
            action: config.action || 'delete',
            warnCount: config.warnCount || 3
        };
    }
    return null;
}

/**
 * حذف إعدادات مكافحة الروابط لمجموعة (متوافق مع index.js)
 * @param {string} groupId - معرف المجموعة
 * @param {string} status - غير مستخدم (للتوافق)
 * @returns {boolean} - نجاح العملية
 */
function removeAntilink(groupId, status) {
    const settings = loadAntilinkSettings();
    if (settings[groupId]) {
        delete settings[groupId];
        return saveAntilinkSettings(settings);
    }
    return true;
}

/**
 * تعيين إجراء مكافحة الروابط لمجموعة
 * @param {string} groupId - معرف المجموعة
 * @param {string} action - الإجراء (delete, kick, warn)
 */
function setAntilinkAction(groupId, action) {
    const settings = loadAntilinkSettings();
    if (settings[groupId]) {
        settings[groupId].action = action;
        return saveAntilinkSettings(settings);
    }
    return false;
}

// ===================== تحذيرات مكافحة الروابط =====================

function loadWarnings() {
    try {
        if (fs.existsSync(warningsFilePath)) {
            const data = fs.readFileSync(warningsFilePath, 'utf8');
            return JSON.parse(data);
        }
        return {};
    } catch (error) {
        console.error('خطأ في تحميل تحذيرات مكافحة الروابط:', error);
        return {};
    }
}

function saveWarnings(warnings) {
    try {
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(warningsFilePath, JSON.stringify(warnings, null, 2));
        return true;
    } catch (error) {
        console.error('خطأ في حفظ تحذيرات مكافحة الروابط:', error);
        return false;
    }
}

/**
 * زيادة عدد تحذيرات مستخدم في مجموعة (متوافق مع index.js)
 * @param {string} groupId - معرف المجموعة
 * @param {string} userId - معرف المستخدم
 * @returns {number} - عدد التحذيرات الجديد
 */
async function incrementWarningCount(groupId, userId) {
    const warnings = loadWarnings();
    
    if (!warnings[groupId]) {
        warnings[groupId] = {};
    }
    
    if (!warnings[groupId][userId]) {
        warnings[groupId][userId] = 0;
    }
    
    warnings[groupId][userId]++;
    saveWarnings(warnings);
    
    console.log(`📊 [Helper] تحذير ${warnings[groupId][userId]} للمستخدم ${userId} في المجموعة ${groupId}`);
    return warnings[groupId][userId];
}

/**
 * إعادة تعيين عدد تحذيرات مستخدم في مجموعة (متوافق مع index.js)
 * @param {string} groupId - معرف المجموعة
 * @param {string} userId - معرف المستخدم
 */
async function resetWarningCount(groupId, userId) {
    const warnings = loadWarnings();
    
    if (warnings[groupId] && warnings[groupId][userId]) {
        delete warnings[groupId][userId];
        saveWarnings(warnings);
        console.log(`🔄 [Helper] تم إعادة تعيين تحذيرات المستخدم ${userId} في المجموعة ${groupId}`);
    }
}

/**
 * الحصول على عدد تحذيرات مستخدم في مجموعة
 * @param {string} groupId - معرف المجموعة
 * @param {string} userId - معرف المستخدم
 * @returns {number} - عدد التحذيرات
 */
async function getWarningCount(groupId, userId) {
    const warnings = loadWarnings();
    return warnings[groupId]?.[userId] || 0;
}

// ===================== تصدير الدوال =====================

module.exports = {
    // إعدادات مكافحة الروابط (متوافقة مع index.js)
    setAntilink,
    getAntilink,
    removeAntilink,
    setAntilinkAction,
    
    // تحذيرات مكافحة الروابط (متوافقة مع index.js)
    incrementWarningCount,
    resetWarningCount,
    getWarningCount
};