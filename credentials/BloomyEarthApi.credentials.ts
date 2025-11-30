import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BloomyEarthApi implements ICredentialType {
	name = 'bloomyEarthApi';
	displayName = 'Bloomy Earth API';
	documentationUrl = '';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Bloomy Earth API key used as x-api-key header',
		},
	];
}
