import { MJMLJsonObject } from '../mjml.types';
import { ForgotPasswordProps } from '../../template.dtos';

export const forgotPasswordTemplate = ({ userName, resetLink }: ForgotPasswordProps): [string, MJMLJsonObject] => {
	const templateId = 'forgot-password';
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
											content: `Reset Your Password`,
										},
										{
											tagName: 'mj-text',
											attributes: { align: 'left', 'font-size': '16px', 'padding-top': '20px' },
											content: `Hi ${userName},`,
										},
										{
											tagName: 'mj-text',
											attributes: { align: 'left', 'font-size': '16px', 'padding-top': '10px' },
											content: `It seems that you requested a password reset. You can reset your password by clicking the button below.`,
										},
										{
											tagName: 'mj-button',
											attributes: {
												href: resetLink,
												'font-size': '16px',
												padding: '20px 0px',
												color: '#ffffff',
												'background-color': '#e74c3c',
											},
											content: `Reset Password`,
										},
										{
											tagName: 'mj-text',
											attributes: { align: 'left', 'font-size': '14px', 'padding-top': '20px' },
											content: `If the button doesn't work, please copy and paste the following link into your browser:`,
										},
										{
											tagName: 'mj-text',
											attributes: {
												align: 'left',
												'font-size': '14px',
												color: '#e74c3c',
											},
											content: `${resetLink}`,
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
