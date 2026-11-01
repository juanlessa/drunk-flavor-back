import { UserSessionsRevokedProps } from '../../template.dtos';
import { MJMLJsonObject } from '../mjml.types';

export const userSessionsRevokedTemplate = ({ userName }: UserSessionsRevokedProps): [string, MJMLJsonObject] => [
	'user-sessions-revoked',
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
										content: 'Your sessions were ended',
									},
									{
										tagName: 'mj-text',
										attributes: { 'font-size': '16px' },
										content: `Hi ${userName}, all of your Drunk Flavor sessions were ended by an administrative action. If you do not recognize this activity, contact support.`,
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
