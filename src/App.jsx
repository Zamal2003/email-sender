import { useState } from 'react';
import './App.css';

function App() {
  // Generate 100 email addresses
  const generateEmails = () => {
    const emails = [];
    for (let i = 1; i <= 100; i++) {
      emails.push(`user${i}@example.com`);
    }
    return emails.join(', ');
  };

  const [formData, setFormData] = useState({
    sender: '',
    recipients: generateEmails(), // Pre-fill with 100 emails
    subject: '',
    body: '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
  event.preventDefault();
  setIsLoading(true);
  setMessage({ text: '', type: '' });

  try {
    const recipients = formData.recipients.split(',').map((email) => email.trim());
    const response = await fetch('http://localhost:5000/api/send-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: formData.sender,
        recipients,
        subject: formData.subject,
        body: formData.body,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Success:', data);
    setMessage({ text: data.message || 'Emails sent successfully', type: 'success' });
  } catch (error) {
    console.error('Fetch error:', error);
    let errorMessage = 'Failed to send emails: ' + error.message;
    if (error.message.includes('Not allowed by CORS')) {
      errorMessage = 'CORS error: Ensure the backend allows requests from http://localhost:5173';
    } else if (error.message.includes('400')) {
      errorMessage = 'Bad request: Check sender email, recipients, subject, or body for errors.';
    } else if (error.message.includes('500')) {
      errorMessage = 'Server error: Check backend logs for SMTP or MongoDB issues.';
    }
    setMessage({ text: errorMessage, type: 'error' });
  } finally {
    setIsLoading(false);
  }
};
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container">
      <h1>Email Sender</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="sender">
            Sender Email
            <span className="tooltip" data-tooltip="Enter a valid email">?</span>
          </label>
          <input
            type="email"
            id="sender"
            name="sender"
            value={formData.sender}
            onChange={handleChange}
            placeholder="your-email@ethereal.email"
            required
          />
          <span className="error-message">Please enter a valid email address.</span>
        </div>
        <div className="form-group">
          <label htmlFor="recipients">
            Recipients
            <span className="tooltip" data-tooltip="Comma-separated emails">?</span>
          </label>
          <textarea
            id="recipients"
            name="recipients"
            value={formData.recipients}
            onChange={handleChange}
            placeholder="recipient@example.com"
            required
            className="recipients-textarea"
          />
          <span className="error-message">Please enter at least one recipient.</span>
        </div>
        <div className="form-group">
          <label htmlFor="subject">
            Subject
            <span className="tooltip" data-tooltip="Enter the email subject">?</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Email Subject"
            required
          />
          <span className="error-message">Subject is required.</span>
        </div>
        <div className="form-group">
          <label htmlFor="body">
            Body
            <span className="tooltip" data-tooltip="Enter the email content">?</span>
          </label>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleChange}
            placeholder="Email Body"
            required
          />
          <span className="error-message">Body is required.</span>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner"></span> Sending...
            </>
          ) : (
            'Send Emails'
          )}
        </button>
      </form>
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}

export default App;