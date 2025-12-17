const axios = require('axios');

const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    // Using WhatsApp Business API or third-party service
    // For demonstration, we'll use a simple HTTP request
    // In production, you should use a proper WhatsApp API service like Twilio, 360Dialog, etc.

    const whatsappApiUrl = process.env.WHATSAPP_API_URL;
    const apiKey = process.env.WHATSAPP_API_KEY;

    // If API credentials are not configured, still attempt to send but log the message
    if (!whatsappApiUrl || !apiKey) {
      console.log('WhatsApp API not fully configured. Attempting to send message anyway...');
      console.log(`WhatsApp Message to ${phoneNumber}:`, message);

      // Try to send anyway with default configuration
      try {
        const response = await axios.post('https://api.whatsapp.com/send', {
          phone: phoneNumber,
          message: message,
          apiKey: 'default'
        });
        console.log('WhatsApp message sent successfully:', response.data);
        return response.data;
      } catch (fallbackError) {
        console.log('Fallback WhatsApp sending failed, but message logged for manual sending');
        return { success: false, logged: true, message };
      }
    }

    // Send WhatsApp message using configured API
    const response = await axios.post(whatsappApiUrl, {
      phone: phoneNumber,
      message: message,
      apiKey: apiKey
    });

    console.log('WhatsApp message sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    // Log the message for manual sending if API fails
    console.log(`Failed to send WhatsApp to ${phoneNumber}. Message logged for manual sending:`, message);
    // Don't throw error to prevent order failure
    return { success: false, logged: true, message, error: error.message };
  }
};

module.exports = sendWhatsAppMessage;
