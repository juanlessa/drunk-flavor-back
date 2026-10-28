import { OwnershipTransferChangedProps } from '../../template.dtos';
import { MJMLJsonObject } from '../mjml.types';

export const ownershipTransferChangedTemplate = ({
	userName,
	role,
}: OwnershipTransferChangedProps): [string, MJMLJsonObject] => [
	'ownership-transfer-changed',
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
										content: 'Ownership Transfer Completed',
									},
									{
										tagName: 'mj-text',
										attributes: { 'font-size': '16px' },
										content: `Hi ${userName}, the ownership transfer is complete. Your application role is now ${role}. Sign in again to continue.`,
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
