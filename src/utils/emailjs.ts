import emailjs from '@emailjs/browser';

// EmailJS 설정
// https://www.emailjs.com 에서 무료 계정 생성 후 아래 값을 변경하세요
const EMAILJS_SERVICE_ID = 'your_service_id';      // EmailJS 서비스 ID
const EMAILJS_TEMPLATE_ID = 'your_template_id';    // EmailJS 템플릿 ID
const EMAILJS_PUBLIC_KEY = 'your_public_key';      // EmailJS 공개 키

// EmailJS 초기화
if (EMAILJS_PUBLIC_KEY !== 'your_public_key') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationEmail(
  email: string, 
  displayName: string
): Promise<string | null> {
  const code = generateVerificationCode();
  
  // EmailJS가 설정되지 않은 경우 콘솔에 코드 출력
  if (EMAILJS_SERVICE_ID === 'your_service_id') {
    console.log('=================================');
    console.log('이메일 인증 코드 (개발 모드):');
    console.log(`이메일: ${email}`);
    console.log(`인증 코드: ${code}`);
    console.log('=================================');
    return code;
  }

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: email,
        to_name: displayName,
        verification_code: code,
        app_name: 'Infinitex',
      }
    );
    console.log('인증 이메일 발송 성공');
    return code;
  } catch (error) {
    console.error('인증 이메일 발송 실패:', error);
    return null;
  }
}