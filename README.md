# Nightfall Node.js SDK

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/nightfallai/nightfall-nodejs-sdk/test)
![GitHub](https://img.shields.io/github/license/nightfallai/nightfall-nodejs-sdk)

**Embed Nightfall scanning and detection functionality into Node.js applications**

## Features

This SDK provides JavaScript/TypeScript bindings for the Nightfall API. It allows you to add functionality to your applications to
scan plain text and files in order to detect different categories of information. You can leverage any of
the detectors in Nightfall's pre-built library, or you may programmatically define your own custom detectors.

Additionally, this library provides convenience features such as encapsulating the steps to chunk and upload files.

To obtain an API Key, login to the [Nightfall dashboard](https://app.nightfall.ai/) and click the section
titled "Manage API Keys".

See our [developer documentation](https://docs.nightfall.ai/docs/entities-and-terms-to-know) for more details about
integrating with the Nightfall API.

## Dependencies

The Nightfall Node.js SDK is compiled to ES2018 and supports Node.js v10.0.0 or later.

For a full list of external dependencies please consult `package.json`.

## Installation

### NPM

`npm install nightfall-js`

### Yarn

`yarn add nightfall-js`

### Building Locally

Alternatively, if you would like to build the project yourself:

1. Clone this git repository
2. Run `npm install` from the top-level directory
3. Run `npm run build` to compile the TypeScript codebase into the ./dist folder (in some cases, you may be required to manually create the ./dist folder before you run this command)
4. Import the client like so: `import { Nightfall } from './dist'`

## Usage

### Scanning Plain Text

Nightfall provides pre-built detector types, covering data types ranging from PII to PHI to credentials. The following snippet shows an example of how to scan using pre-built detectors.

#### Sample Code

To run this sample script you must compile it as TypesScript. Save it as a `.tsc` file and run `tsc <yourfilename>.ts -lib ES2015,DOM `

You can this run the resulting JavaScript file:

`NIGHTFALL_API_KEY=<YourApiKey> node nodesdksample.js`

```typescript
// By default, the client reads your API key from the environment variable NIGHTFALL_API_KEY
import { Nightfall } from "nightfall-js";
import { Detector } from "nightfall-js/dist/types"

const nfClient = new Nightfall();

var scanText = async function () {
  return await nfClient.scanText(['The customer social security number is 111-22-3333'], {
    detectionRules: [
      {
        name: 'Secrets Scanner',
        logicalOp: 'ANY',
        detectors: [
          {
            minNumFindings: 1,
            minConfidence: Detector.Confidence.Possible, //'POSSIBLE', //
            displayName: 'SSN Detector',
            detectorType: Detector.Type.Nightfall, //'NIGHTFALL_DETECTOR', //
            nightfallDetector: 'US_SOCIAL_SECURITY_NUMBER',
          },
        ],
      },
    ],
  });
};

async function main() {
  const response = await scanText();

  if (response.isError) {
    console.log(response.getError());
  } else if (response.data) {
    response.data.findings.forEach((finding) => {
      if (finding.length > 0) {
        finding.forEach((result) => {
          console.log(`Finding: ${result.finding}, Confidence: ${result.confidence}`);
        });
      }
    });
  }
}

main();
```

### Scanning Files

Scanning common file types like PDF's or office documents typically requires cumbersome text
extraction methods like OCR.

Rather than implementing this functionality yourself, the Nightfall API allows you to upload the
original files, and then we'll handle the heavy lifting.

The file upload process is implemented as a series of requests to upload the file in chunks. This library
provides a single method that wraps the steps required to upload your file. Please refer to the
[API Reference](https://docs.nightfall.ai/reference) for more details.

This script assumes a file named `./customer-details.txt` local to where the script is executed.

The file is uploaded synchronously, but as files can be arbitrarily large, the scan itself is conducted asynchronously.
The results from the scan are delivered by webhook; for more information about setting up a webhook server, refer to
[the docs](https://docs.nightfall.ai/docs/creating-a-webhook-server).

This script assumes a webhook a the location `https://my-service.com/nightfall/listener`.  Update this to your webhook server address.

#### Sample Code

To run this sample script you must compile it as TypesScript. Save it as a `.tsc` file and run `tsc <yourfilename>.ts -lib ES2015,DOM `

You can this run the resulting JavaScript file:

`NIGHTFALL_API_KEY=<YourApiKey> node nodesdksample.js`

```typescript
// By default, the client reads your API key from the environment variable NIGHTFALL_API_KEY
import { Nightfall } from "nightfall-js";
import { Detector } from "nightfall-js/dist/types"

// By default, the client reads your API key from the environment variable NIGHTFALL_API_KEY
const nfClient = new Nightfall();

async function main() {
	const response = await nfClient.scanFile('./customer-details.txt', {
	  detectionRules: [
		{
		  name: 'Secrets Scanner',
		  logicalOp: 'ANY',
		  detectors: [
			{
			  minNumFindings: 1,
			  minConfidence: Detector.Confidence.Possible,
			  displayName: 'Credit Card Number',
			  detectorType: Detector.Type.Nightfall,
			  nightfallDetector: 'CREDIT_CARD_NUMBER',
			},
		  ],
		},
	  ],
	  webhookURL: 'https://my-service.com/nightfall/listener',
	});

	if (response.isError) {
	  console.log(response.getError());
	}

	// Save this ID to check for findings when you receive a webhook event from us
	console.log(response.data.id);
}

scanFile();
```

## Contributing

Contributions are welcome! Open a pull request to fix a bug, or open an issue to discuss a new feature
or change.

Refer to `CONTRIBUTING.md` for the full details.

## License

This code is licensed under the terms of the MIT License. See [here](https://opensource.org/licenses/MIT)
for more information.
