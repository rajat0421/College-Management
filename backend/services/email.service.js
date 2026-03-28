const fromName = process.env.ALERT_FROM_NAME || 'CollegeMS';

async function sendHtmlEmail(to, subject, html) {
  const emailApiUrl = process.env.EMAIL_API_URL;
  const emailApiKey = process.env.EMAIL_API_KEY;

  if (!emailApiUrl) {
    console.warn('EMAIL_API_URL not configured — email skipped');
    return { sent: false, reason: 'Email API not configured' };
  }

  const response = await fetch(emailApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': emailApiKey || '',
    },
    body: JSON.stringify({ to, subject, html }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Email API failed');
  }

  return { sent: true };
}

function buildLowAttendanceEmail(studentName, percentage) {
  return {
    subject: `Attendance Alert: ${studentName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">CollegeMS - Attendance Alert</h2>
        <p>Hi <strong>${studentName}</strong>,</p>
        <p>Your current attendance is <strong style="color: #dc2626;">${percentage}%</strong>, which is below the required <strong>75%</strong>.</p>
        <p>Please improve your attendance to meet college requirements.</p>
        <br/>
        <p style="color: #6b7280; font-size: 13px;">— ${fromName}</p>
      </div>
    `,
  };
}

function buildConsecutiveAbsentEmail(studentName, days) {
  return {
    subject: `Absence Alert: ${studentName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">CollegeMS - Absence Alert</h2>
        <p>Hi <strong>${studentName}</strong>,</p>
        <p>You have been marked <strong style="color: #dc2626;">absent for ${days} consecutive day${days > 1 ? 's' : ''}</strong>.</p>
        <p>If this is due to illness or an emergency, please inform the college administration.</p>
        <br/>
        <p style="color: #6b7280; font-size: 13px;">— ${fromName}</p>
      </div>
    `,
  };
}

async function sendAlertEmail(toEmail, studentName, type, extraData) {
  let emailContent;
  if (type === 'low_attendance') {
    emailContent = buildLowAttendanceEmail(studentName, extraData.percentage);
  } else {
    emailContent = buildConsecutiveAbsentEmail(studentName, extraData.days);
  }

  return sendHtmlEmail(toEmail, emailContent.subject, emailContent.html);
}

async function sendTeacherWelcomeEmail(toEmail, teacherName, loginEmail, plainPassword) {
  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Welcome to CollegeMS</h2>
      <p>Hi <strong>${teacherName}</strong>,</p>
      <p>Your teacher account has been created. Use the credentials below to sign in:</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0 0 8px;"><strong>Login email:</strong> ${loginEmail}</p>
        <p style="margin: 0;"><strong>Temporary password:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${plainPassword}</code></p>
      </div>
      <p style="color: #6b7280; font-size: 14px;">Please sign in and change your password from your profile as soon as possible.</p>
      <br/>
      <p style="color: #6b7280; font-size: 13px;">— ${fromName}</p>
    </div>
  `;

  return sendHtmlEmail(toEmail, `Welcome to ${fromName} — your login details`, html);
}

module.exports = { sendAlertEmail, sendTeacherWelcomeEmail, sendHtmlEmail };
