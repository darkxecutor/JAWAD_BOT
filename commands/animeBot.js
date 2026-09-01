// =============================================
// animeBot.js - بوت تحميل فيديوهات 𝑬𝑫𝑰𝑻 𝑨𝑵𝑰𝑴𝑬🍁
// الإصدار: 2.0.1
// =============================================

const fs = require('fs');
const path = require('path');

class AnimeBot {
    constructor() {
        this.videoFolder = './anime';
        this.usedVideos = [];
        this.videoList = [];
        this.maxRetries = 50;
        this.initializeVideoList();
    }

    // تهيئة قائمة الفيديوهات من المجلد
    initializeVideoList() {
        try {
            if (!fs.existsSync(this.videoFolder)) {
                fs.mkdirSync(this.videoFolder, { recursive: true });
                console.log('📁 تم إنشاء مجلد anime');
            }

            const files = fs.readdirSync(this.videoFolder);
            
            // فلترة الملفات حسب الامتداد مع تجاهل الملفات الفارغة
            this.videoList = files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                const isVideo = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm'].includes(ext);
                
                if (isVideo) {
                    const filePath = path.join(this.videoFolder, file);
                    const stats = fs.statSync(filePath);
                    // تجاهل الملفات الفارغة (حجم 0)
                    return stats.size > 0;
                }
                return false;
            });

            if (this.videoList.length === 0) {
                console.log('⚠️ لا يوجد فيديوهات حقيقية في مجلد anime');
                console.log('📂 يرجى وضع ملفات فيديو حقيقية (غير فارغة) في مجلد anime');
            }

            console.log(`✅ تم تحميل ${this.videoList.length} فيديو من مجلد anime`);
            if (this.videoList.length > 0) {
                console.log(`📹 قائمة الفيديوهات:`, this.videoList);
            }

        } catch (error) {
            console.error('❌ خطأ في تهيئة مجلد الفيديوهات:', error);
        }
    }

    // الحصول على فيديو عشوائي غير مستخدم
    getRandomVideo() {
        // إعادة تحميل القائمة للتأكد من وجود الملفات
        this.initializeVideoList();
        
        if (this.videoList.length === 0) {
            console.log('⚠️ لا يوجد فيديوهات متاحة');
            return null;
        }

        if (this.usedVideos.length >= this.videoList.length) {
            console.log('🔄 تم استخدام جميع الفيديوهات، إعادة تعيين القائمة');
            this.usedVideos = [];
        }

        const availableVideos = this.videoList.filter(video => !this.usedVideos.includes(video));
        
        if (availableVideos.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * availableVideos.length);
        const selectedVideo = availableVideos[randomIndex];
        this.usedVideos.push(selectedVideo);
        
        console.log(`🎥 تم اختيار فيديو: ${selectedVideo}`);
        return selectedVideo;
    }

    // الحصول على مسار الفيديو الكامل
    getVideoPath(videoName) {
        return path.join(this.videoFolder, videoName);
    }

    // التحقق من وجود الفيديو
    videoExists(videoName) {
        const fullPath = this.getVideoPath(videoName);
        const exists = fs.existsSync(fullPath);
        
        if (exists) {
            const stats = fs.statSync(fullPath);
            // التحقق من أن الملف ليس فارغاً
            return stats.size > 0;
        }
        return false;
    }

    // الحصول على قائمة الملفات الموجودة فعلياً
    getActualFiles() {
        try {
            if (!fs.existsSync(this.videoFolder)) {
                return [];
            }
            return fs.readdirSync(this.videoFolder);
        } catch (error) {
            console.error('❌ خطأ في قراءة المجلد:', error);
            return [];
        }
    }

    // إضافة فيديو جديد
    addVideo(videoName) {
        const fullPath = this.getVideoPath(videoName);
        if (fs.existsSync(fullPath)) {
            const stats = fs.statSync(fullPath);
            if (stats.size > 0 && !this.videoList.includes(videoName)) {
                this.videoList.push(videoName);
                console.log(`➕ تم إضافة فيديو جديد: ${videoName}`);
                return true;
            }
        }
        console.log(`❌ الفيديو ${videoName} غير موجود أو فارغ`);
        return false;
    }

    // إعادة تعيين الفيديوهات المستخدمة
    resetUsedVideos() {
        this.usedVideos = [];
        console.log('🔄 تم إعادة تعيين قائمة الفيديوهات المستخدمة');
    }

    // تنسيق رسالة الفيديو
    formatVideoMessage(videoName) {
        return `𝑬𝑫𝑰𝑻 𝑨𝑵𝑰𝑴𝑬🍁\n*🪺تم تحميل بواسطة:* ~@ذكر_الشخص~\n\n\`👨🏼‍💻𝑫𝒂𝒓𝒌𝒙𝒆𝒄𝒖𝒕𝒐𝒓\``;
    }
}

// =============================================
// تصدير الكلاس للاستخدام في index.js
// =============================================
module.exports = AnimeBot;