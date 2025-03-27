import { mailTrapClient, mailTrapSender } from "./mailTrap.config.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./emailTemplate.js";

export const sendVerificationEmail = async (email, verificationCode) => {
  const recipient = [{ email }];

  try {
    const response = mailTrapClient.send({
      from: mailTrapSender,
      to: recipient,
      subject: "Verify Your Email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationCode
      ),
      category: "Verify Email Verification",
    });
    console.log("Verification Email Sent Successfully");
  } catch (error) {
    console.log("Error Sending Verification Email", error);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];
  try {
    const response = mailTrapClient.send({
      from: mailTrapSender,
      to: recipient,
      template_uuid: process.env.MAILTRAP_TEMPLATE_UID,
      template_variables: {
        company_info_name: "Zaryab's App",
        name: name,
      },
    });
    console.log("Welcome Email Sent Successfully");
  } catch (error) {
    console.log("Error Sending Welcome Email", error);
  }
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  const recipient = [{ email }];
  console.log(resetUrl);
  try {
    const response = mailTrapClient.send({
      from: mailTrapSender,
      to: recipient,
      subject: "Password Reset Request",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
      category: "Password Reset",
    });
    console.log("Reset Email Request Sent Successfully");
  } catch (error) {
    console.log("Error Sending Reset Email Request", error);
  }
};

export const sendPasswordSuccessEmail = async (email) => {
  const recipient = [{ email }];
  try {
    const response = mailTrapClient.send({
      from: mailTrapSender,
      to: recipient,
      subject: "Password Reset Success",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });
    console.log("Reset Password Success Email Sent Successfully");
  } catch (error) {
    console.log("Error Sending Reset Password Success Email", error);
  }
};
