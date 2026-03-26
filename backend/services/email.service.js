const fromName = process.env.ALERT_FROM_NAME || 'CollegeMS';

function buildLowAttendanceEmail(studentName, percentage) {
  return {
    subject: `Attendance Alert: ${studentName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">CollegeMS - Attendance Alert</h2>
        <p>Dear Parent,</p>
        <p>This is to inform you that your child <strong>${studentName}</strong> currently has an attendance of <strong style="color: #dc2626;">${percentage}%</strong>, which is below the required <strong>75%</strong>.</p>
        <p>Please ensure regular attendance to avoid any academic consequences.</p>
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
        <p>Dear Parent,</p>
        <p>This is to inform you that your child <strong>${studentName}</strong> has been <strong style="color: #dc2626;">absent for ${days} consecutive day${days > 1 ? 's' : ''}</strong>.</p>
        <p>If this absence is due to illness or personal reasons, please inform the college administration.</p>
        <br/>
        <p style="color: #6b7280; font-size: 13px;">— ${fromName}</p>
      </div>
    `,
  };
}

async function sendAlertEmail(toEmail, studentName, type, extraData) {
  const emailApiUrl = process.env.EMAIL_API_URL;
  const emailApiKey = process.env.EMAIL_API_KEY;

  if (!emailApiUrl) {
    console.warn('EMAIL_API_URL not configured — email skipped, alert still logged');
    return { sent: false, reason: 'Email API not configured' };
  }

  let emailContent;
  if (type === 'low_attendance') {
    emailContent = buildLowAttendanceEmail(studentName, extraData.percentage);
  } else {
    emailContent = buildConsecutiveAbsentEmail(studentName, extraData.days);
  }

  const response = await fetch(emailApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': emailApiKey || '',
    },
    body: JSON.stringify({
      to: toEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Email API failed');
  }

  return { sent: true };
}

module.exports = { sendAlertEmail };
