export const template = ({ code, name, subject }) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>${subject}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .email-container {
        max-width: 600px;
        background-color: #ffffff;
        margin: 30px auto;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 15px rgba(0,0,0,0.1);
      }
      .header {
        background-color: #007bff;
        color: white;
        padding: 20px;
        text-align: center;
        font-size: 22px;
        font-weight: bold;
      }
      .content {
        padding: 20px;
        text-align: center;
        line-height: 1.6;
        color: #333;
      }
      .code-box {
        display: inline-block;
        background-color: #f8f9fa;
        border: 2px dashed #007bff;
        padding: 15px 25px;
        font-size: 22px;
        font-weight: bold;
        margin: 20px 0;
        border-radius: 8px;
        color: #007bff;
      }
      .footer {
        background-color: #f1f1f1;
        color: #777;
        padding: 15px;
        font-size: 13px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">${subject}</div>
      <div class="content">
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for reaching out to us. Your verification code is:</p>
        <div class="code-box">${code}</div>
        <p>Please enter this code in the required field to complete the process.</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};
