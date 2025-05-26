const getPasswordResetEmail = (name, resetLink) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: right;">مرحباً ${name}</h2>
      <p style="color: #666; text-align: right; line-height: 1.6;">
        لقد تلقيت هذا البريد الإلكتروني لأنك طلبت إعادة تعيين كلمة المرور لحسابك.
      </p>
      <p style="color: #666; text-align: right; line-height: 1.6;">
        انقر على الرابط أدناه لإعادة تعيين كلمة المرور الخاصة بك:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          إعادة تعيين كلمة المرور
        </a>
      </div>
      <p style="color: #666; text-align: right; line-height: 1.6;">
        إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.
      </p>
      <p style="color: #666; text-align: right; line-height: 1.6;">
        هذا الرابط صالح لمدة 10 دقائق فقط.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; text-align: center; font-size: 12px;">
        هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه.
      </p>
    </div>
  `;
};

const getWelcomeEmail = (name) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: right;">مرحباً ${name}</h2>
      <p style="color: #666; text-align: right; line-height: 1.6;">
        مرحباً بك في تطبيق تورا! نحن سعداء بانضمامك إلينا.
      </p>
      <p style="color: #666; text-align: right; line-height: 1.6;">
        يمكنك الآن الاستمتاع بجميع ميزات التطبيق، بما في ذلك:
      </p>
      <ul style="color: #666; text-align: right; line-height: 1.6;">
        <li>تصفح القصائد والأشعار</li>
        <li>الاستماع إلى التسجيلات الصوتية</li>
        <li>مشاهدة الفيديوهات</li>
        <li>إنشاء قوائم التشغيل المفضلة</li>
      </ul>
      <p style="color: #666; text-align: right; line-height: 1.6;">
        إذا كان لديك أي أسئلة أو استفسارات، لا تتردد في التواصل معنا.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; text-align: center; font-size: 12px;">
        هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه.
      </p>
    </div>
  `;
};

const getVerificationEmail = (name, verificationLink) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: right;">مرحباً ${name}</h2>
      <p style="color: #666; text-align: right; line-height: 1.6;">
        شكراً لانضمامك إلى تطبيق تورا! يرجى تأكيد بريدك الإلكتروني لتفعيل حسابك.
      </p>
      <p style="color: #666; text-align: right; line-height: 1.6;">
        انقر على الرابط أدناه لتأكيد بريدك الإلكتروني:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          تأكيد البريد الإلكتروني
        </a>
      </div>
      <p style="color: #666; text-align: right; line-height: 1.6;">
        إذا لم تقم بإنشاء حساب في تورا، يمكنك تجاهل هذا البريد الإلكتروني.
      </p>
      <p style="color: #666; text-align: right; line-height: 1.6;">
        هذا الرابط صالح لمدة 24 ساعة.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; text-align: center; font-size: 12px;">
        هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه.
      </p>
    </div>
  `;
};

module.exports = {
  getPasswordResetEmail,
  getWelcomeEmail,
  getVerificationEmail
}; 