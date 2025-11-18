const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email templates
const templates = {
  welcome: (data) => ({
    subject: 'KampüsConnect\'e Hoş Geldiniz!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #10B981 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KampüsConnect</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Hoş Geldiniz, ${data.name}!</h2>
          <p>KampüsConnect ailesine katıldığınız için teşekkür ederiz.</p>
          <p>Hesabınızı doğrulamak için aşağıdaki butona tıklayın:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationUrl}" style="background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Hesabı Doğrula
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Bu link 24 saat geçerlidir. Eğer bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.
          </p>
        </div>
        <div style="padding: 20px; background: #333; color: #999; text-align: center; font-size: 12px;">
          © 2024 KampüsConnect. Tüm hakları saklıdır.
        </div>
      </div>
    `
  }),
  
  passwordReset: (data) => ({
    subject: 'Şifre Sıfırlama Talebi',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #10B981 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KampüsConnect</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Şifre Sıfırlama</h2>
          <p>Merhaba ${data.name},</p>
          <p>Şifrenizi sıfırlamak için bir talepte bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}" style="background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Şifreyi Sıfırla
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Bu link 1 saat geçerlidir. Eğer bu talebi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.
          </p>
        </div>
        <div style="padding: 20px; background: #333; color: #999; text-align: center; font-size: 12px;">
          © 2024 KampüsConnect. Tüm hakları saklıdır.
        </div>
      </div>
    `
  }),
  
  applicationReceived: (data) => ({
    subject: 'Yeni Başvuru Alındı',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #10B981 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KampüsConnect</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Yeni Başvuru!</h2>
          <p>Merhaba,</p>
          <p><strong>${data.jobTitle}</strong> ilanınıza yeni bir başvuru alındı.</p>
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Başvuran:</strong> ${data.applicantName}</p>
            <p><strong>Üniversite:</strong> ${data.university}</p>
            <p><strong>Bölüm:</strong> ${data.department}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.applicationUrl}" style="background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Başvuruyu İncele
            </a>
          </div>
        </div>
        <div style="padding: 20px; background: #333; color: #999; text-align: center; font-size: 12px;">
          © 2024 KampüsConnect. Tüm hakları saklıdır.
        </div>
      </div>
    `
  }),
  
  applicationStatusChanged: (data) => ({
    subject: `Başvuru Durumunuz Güncellendi`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #10B981 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KampüsConnect</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Başvuru Durumu Güncellendi</h2>
          <p>Merhaba ${data.applicantName},</p>
          <p><strong>${data.jobTitle}</strong> pozisyonuna yaptığınız başvurunun durumu güncellendi.</p>
          <div style="background: ${data.status === 'ACCEPTED' ? '#10B981' : data.status === 'REJECTED' ? '#EF4444' : '#F59E0B'}; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <strong>Yeni Durum: ${data.statusText}</strong>
          </div>
          ${data.message ? `<p><strong>Mesaj:</strong> ${data.message}</p>` : ''}
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.applicationUrl}" style="background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Detayları Gör
            </a>
          </div>
        </div>
        <div style="padding: 20px; background: #333; color: #999; text-align: center; font-size: 12px;">
          © 2024 KampüsConnect. Tüm hakları saklıdır.
        </div>
      </div>
    `
  }),
  
  companyVerified: (data) => ({
    subject: 'Şirket Hesabınız Doğrulandı',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #10B981 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KampüsConnect</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Tebrikler! 🎉</h2>
          <p>Merhaba ${data.companyName},</p>
          <p>Şirket hesabınız başarıyla doğrulandı. Artık iş ilanı yayınlayabilir ve başvuruları yönetebilirsiniz.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dashboardUrl}" style="background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              İlk İlanınızı Yayınlayın
            </a>
          </div>
        </div>
        <div style="padding: 20px; background: #333; color: #999; text-align: center; font-size: 12px;">
          © 2024 KampüsConnect. Tüm hakları saklıdır.
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, templateName, data) => {
  try {
    const template = templates[templateName](data);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"KampüsConnect" <noreply@kampusconnect.com>',
      to,
      subject: template.subject,
      html: template.html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = { sendEmail };
