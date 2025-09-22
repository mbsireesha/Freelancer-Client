// Email service for notifications (placeholder implementation)
// In production, integrate with services like SendGrid, Mailgun, or AWS SES

class EmailService {
  constructor() {
    this.enabled = process.env.EMAIL_ENABLED === 'true';
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@skillbridge.com';
  }

  async sendWelcomeEmail(user) {
    if (!this.enabled) {
      console.log(`[EMAIL] Welcome email would be sent to: ${user.email}`);
      return;
    }

    // Implement actual email sending logic here
    const emailData = {
      to: user.email,
      from: this.fromEmail,
      subject: 'Welcome to SkillBridge!',
      html: this.getWelcomeEmailTemplate(user)
    };

    console.log('[EMAIL] Sending welcome email:', emailData);
    // await this.sendEmail(emailData);
  }

  async sendProposalNotification(client, project, proposal) {
    if (!this.enabled) {
      console.log(`[EMAIL] Proposal notification would be sent to: ${client.email}`);
      return;
    }

    const emailData = {
      to: client.email,
      from: this.fromEmail,
      subject: `New Proposal for "${project.title}"`,
      html: this.getProposalNotificationTemplate(client, project, proposal)
    };

    console.log('[EMAIL] Sending proposal notification:', emailData);
    // await this.sendEmail(emailData);
  }

  async sendProposalStatusUpdate(freelancer, project, proposal) {
    if (!this.enabled) {
      console.log(`[EMAIL] Proposal status update would be sent to: ${freelancer.email}`);
      return;
    }

    const emailData = {
      to: freelancer.email,
      from: this.fromEmail,
      subject: `Proposal ${proposal.status} for "${project.title}"`,
      html: this.getProposalStatusTemplate(freelancer, project, proposal)
    };

    console.log('[EMAIL] Sending proposal status update:', emailData);
    // await this.sendEmail(emailData);
  }

  getWelcomeEmailTemplate(user) {
    return `
      <h1>Welcome to SkillBridge, ${user.name}!</h1>
      <p>Thank you for joining our platform as a ${user.userType}.</p>
      <p>You can now start ${user.userType === 'client' ? 'posting projects and finding talent' : 'browsing projects and submitting proposals'}.</p>
      <p>Best regards,<br>The SkillBridge Team</p>
    `;
  }

  getProposalNotificationTemplate(client, project, proposal) {
    return `
      <h1>New Proposal Received!</h1>
      <p>Hi ${client.name},</p>
      <p>You have received a new proposal for your project "${project.title}".</p>
      <p><strong>Proposed Budget:</strong> $${proposal.proposed_budget}</p>
      <p><strong>Timeline:</strong> ${proposal.timeline}</p>
      <p>Log in to your dashboard to review the full proposal.</p>
      <p>Best regards,<br>The SkillBridge Team</p>
    `;
  }

  getProposalStatusTemplate(freelancer, project, proposal) {
    return `
      <h1>Proposal Update</h1>
      <p>Hi ${freelancer.name},</p>
      <p>Your proposal for "${project.title}" has been ${proposal.status}.</p>
      ${proposal.status === 'accepted' ? 
        '<p>Congratulations! You can now start working on this project.</p>' : 
        '<p>Don\'t worry, there are many other opportunities available.</p>'
      }
      <p>Best regards,<br>The SkillBridge Team</p>
    `;
  }

  // Placeholder for actual email sending implementation
  async sendEmail(emailData) {
    // Implement with your preferred email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send(emailData);
  }
}

module.exports = new EmailService();