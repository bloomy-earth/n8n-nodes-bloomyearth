import {
	IExecuteFunctions,
} from 'n8n-workflow';

import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class BloomyEarth implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Bloomy Earth',
		name: 'bloomyEarth',
		icon: 'file:bloomyEarth.svg',
		group: ['transform'],
		version: 1,
		description: 'Plant trees and offset emissions with Bloomy Earth',
		defaults: {
			name: 'Bloomy Earth',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'bloomyEarthApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				options: [
					{
						name: 'Plant Trees',
						value: 'plantTrees',
						description: 'Plant trees and generate a certificate (POST /v1/trees)',
					},
					{
						name: 'Offset by Tonne',
						value: 'offsetByTonne',
						description: 'Offset emissions by tonne (POST /v1/offset-by-tonne)',
					},
					{
						name: 'Get Credits',
						value: 'getCredits',
						description: 'Get tree credit balance (GET /v1/credits)',
					},
				],
				default: 'plantTrees',
				required: true,
			},
			{
				displayName: 'Organization ID',
				name: 'organizationId',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				required: true,
				description: 'Bloomy Earth organizationId (integer ≥ 1)',
			},
			{
				displayName: 'Number of Trees',
				name: 'trees',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				required: true,
				description: 'Number of trees to plant',
				displayOptions: {
					show: {
						operation: ['plantTrees'],
					},
				},
			},
			{
				displayName: 'Project ID',
				name: 'projectId',
				type: 'string',
				default: '',
				description: 'Optional projectId to target a specific project (string)',
				displayOptions: {
					show: {
						operation: ['plantTrees'],
					},
				},
			},
			{
				displayName: 'Send Certificate Email',
				name: 'sendEmail',
				type: 'boolean',
				default: true,
				description: 'If true, Bloomy Earth will send an email using the certificate info',
				displayOptions: {
					show: {
						operation: ['plantTrees'],
					},
				},
			},
			{
				displayName: 'Is Gift',
				name: 'isGift',
				type: 'boolean',
				default: false,
				description: 'If enabled, a gift object will be sent (recipient + message)',
				displayOptions: {
					show: {
						operation: ['plantTrees'],
					},
				},
			},
			{
				displayName: 'Gift Recipient Name',
				name: 'giftRecipientName',
				type: 'string',
				default: '',
				description: 'Name of the gift recipient',
				displayOptions: {
					show: {
						operation: ['plantTrees'],
						isGift: [true],
					},
				},
			},
			{
				displayName: 'Gift Recipient Email',
				name: 'giftRecipientEmail',
				type: 'string',
				default: '',
				description: 'Email of the gift recipient',
				displayOptions: {
					show: {
						operation: ['plantTrees'],
						isGift: [true],
					},
				},
			},
			{
				displayName: 'Gift Message',
				name: 'giftMessage',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				description: 'Personal message included with the gift',
				displayOptions: {
					show: {
						operation: ['plantTrees'],
						isGift: [true],
					},
				},
			},
			{
				displayName: 'Tonnes of CO₂',
				name: 'tonnes',
				type: 'number',
				typeOptions: {
					minValue: 0.01,
				},
				default: 1,
				required: true,
				description: 'Tonnes of CO₂ to offset (must be > 0)',
				displayOptions: {
					show: {
						operation: ['offsetByTonne'],
					},
				},
			},
			{
				displayName: 'VCS Certified',
				name: 'vcs',
				type: 'boolean',
				default: false,
				description: 'If true, request a VCS-certified offset (vcs: boolean)',
				displayOptions: {
					show: {
						operation: ['offsetByTonne'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('bloomyEarthApi');
		const apiKey = credentials.apiKey as string;

		for (let i = 0; i < items.length; i++) {
			const operation = this.getNodeParameter('operation', i) as string;
			const organizationId = this.getNodeParameter('organizationId', i) as number;

			let endpoint = '';
			let method = 'GET';
			let body: any;
			let qs: any;

			if (operation === 'plantTrees') {
				endpoint = '/v1/trees';
				method = 'POST';

				const trees = this.getNodeParameter('trees', i) as number;
				const projectId = this.getNodeParameter('projectId', i, '') as string;
				const sendEmail = this.getNodeParameter('sendEmail', i) as boolean;
				const isGift = this.getNodeParameter('isGift', i) as boolean;

				body = {
					organizationId,
					trees,
					sendEmail,
				};

				if (projectId) {
					body.projectId = projectId;
				}

				if (isGift) {
					const giftRecipientName = this.getNodeParameter('giftRecipientName', i, '') as string;
					const giftRecipientEmail = this.getNodeParameter('giftRecipientEmail', i, '') as string;
					const giftMessage = this.getNodeParameter('giftMessage', i, '') as string;

					body.gift = {
						giftRecipientName,
						giftRecipientEmail,
					};

					if (giftMessage) {
						body.gift.giftMessage = giftMessage;
					}
				}
			}

			if (operation === 'offsetByTonne') {
				endpoint = '/v1/offset-by-tonne';
				method = 'POST';

				const tonnes = this.getNodeParameter('tonnes', i) as number;
				const vcs = this.getNodeParameter('vcs', i) as boolean;

				body = {
					organizationId,
					tonnes,
					vcs,
				};
			}

			if (operation === 'getCredits') {
				endpoint = '/v1/credits';
				method = 'GET';

				qs = {
					organizationId,
				};
			}

			const options: any = {
				method,
				url: `https://api.bloomy.earth${endpoint}`,
				headers: {
					'x-api-key': apiKey,
					'Content-Type': 'application/json',
				},
				json: true,
				...(body ? { body } : {}),
				...(qs ? { qs } : {}),
			};

			const responseData = await this.helpers.request(options);

			returnData.push({
				json: responseData,
			});
		}

		return [returnData];
	}
}
