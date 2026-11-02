import { OwnershipTransferInvitationProps } from '../../template.dtos';
import { MJMLJsonObject } from '../mjml.types';

export const ownershipTransferInvitationTemplate = ({
	userName,
	acceptanceLink,
}: OwnershipTransferInvitationProps): [string, MJMLJsonObject] => [
	'ownership-transfer-invitation',
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
										content: 'Ownership Transfer Invitation',
									},
									{
										tagName: 'mj-text',
										attributes: { 'font-size': '16px' },
										content: `Hi ${userName}, you have been invited to become the application owner. This invitation expires in 24 hours.`,
									},
									{
										tagName: 'mj-button',
										attributes: {
											href: acceptanceLink,
											'background-color': '#3498db',
											color: '#ffffff',
										},
										content: 'Review Ownership Transfer',
									},
									{
										tagName: 'mj-text',
										attributes: { 'font-size': '12px' },
										content: `If you did not expect this invitation, do not accept it. Link: ${acceptanceLink}`,
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
