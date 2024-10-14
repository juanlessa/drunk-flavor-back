import mjml2html from 'mjml';
import { MJMLJsonObject } from '../mjml.types';
import { EmailVerificationProps } from '../../template.dtos';

export const emailVerificationTemplate = ({
	userName,
	verificationLink,
}: EmailVerificationProps): [string, MJMLJsonObject] => {
	const templateId = 'email-verification';
	return [
		templateId,
		{
			tagName: 'mjml',
			attributes: {},
			children: [
				{
					tagName: 'mj-body',
					attributes: {},
					children: [
						{
							tagName: 'mj-section',
							attributes: {},
							children: [
								{
									tagName: 'mj-column',
									attributes: {},
									children: [
										{
											tagName: 'mj-text',
											attributes: { align: 'center', 'font-size': '24px', 'font-weight': 'bold' },
											content: `Verify Your Email Address`,
										},
										{
											tagName: 'mj-text',
											attributes: { align: 'left', 'font-size': '16px', 'padding-top': '20px' },
											content: `Hi ${userName},`,
										},
										{
											tagName: 'mj-text',
											attributes: { align: 'left', 'font-size': '16px', 'padding-top': '10px' },
											content: `Thank you for signing up! To get started, please verify your email address by clicking the button below.`,
										},
										{
											tagName: 'mj-button',
											attributes: {
												href: verificationLink,
												'font-size': '16px',
												padding: '20px 0px',
												color: '#ffffff',
												'background-color': '#3498db',
											},
											content: `Verify Email`,
										},
										{
											tagName: 'mj-text',
											attributes: { align: 'left', 'font-size': '16px', 'padding-top': '10px' },
											content: `Thank you for signing up! To get started, please verify your email address by clicking the button below.`,
										},
										{
											tagName: 'mj-text',
											attributes: {
												align: 'left',
												'font-size': '14px',
												'padding-top': '20px',
											},
											content: `If the button doesn't work, please copy and paste the following link into your browser:`,
										},
										{
											tagName: 'mj-text',
											attributes: {
												align: 'left',
												'font-size': '14px',
												color: '#3498db',
											},
											content: `${verificationLink}`,
										},
										{
											tagName: 'mj-text',
											attributes: {
												align: 'left',
												'font-size': '12px',
												'padding-top': '30px',
											},
											content: `If you did not request this email, you can safely ignore it.`,
										},
									],
								},
							],
						},
					],
				},
			],
		},
	];
};
