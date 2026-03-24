/**
 * Example: Standplaatsvergunning issuance via AWS Lambda
 *
 * This example shows how Gemeente Nijmegen uses ARC with:
 * - OpenProduct as the data source
 * - Ver.ID as the attestation provider
 * - DynamoDB for ephemeral session state
 * - Four Lambda functions: issue, callback, status, revoke
 */

import {
  ARC, OpenProduct, OpenProductStandplaatsvergunning, VerID, DynamoDb,
} from '../src';

// --------------------------------------------------------------------------
// Shared ARC instance (created per Lambda invocation)
// --------------------------------------------------------------------------

function createARC() {
  const arc = new ARC({
    provider: new VerID(
      {
        issuerUri: process.env.VERID_ISSUER_URI!,
        redirectUri: process.env.VERID_REDIRECT_URI!,
        clientSecret: process.env.VERID_CLIENT_SECRET!,
      },
      {
        'standplaatsvergunning': {
          flowUuid: process.env.VERID_FLOW_STANDPLAATSVERGUNNING!,
        },
      },
    ),
    store: new DynamoDb({
      tableName: process.env.ARC_STATE_TABLE!,
      defaultTtlSeconds: 3600,
    }),
    sources: [
      new OpenProduct({
        baseUrl: process.env.OPEN_PRODUCT_BASE_URL!,
        apiToken: process.env.OPEN_PRODUCT_API_TOKEN!,
      }),
    ],
    attestations: [
      new OpenProductStandplaatsvergunning(),
    ],
  });

  arc.on('issuance', async (event) => {
    // Update your own database with the session state change
    console.log(`Session ${event.sessionId} → ${event.status}`, event.context);

    // Example: update a "mijn producten" table
    // await myProductsTable.update({
    //   sessionId: event.sessionId,
    //   status: event.status,
    //   source: event.context.source,
    //   sourceId: event.context.id,
    //   attestation: event.context.attestation,
    //   updatedAt: new Date().toISOString(),
    // });
  });

  return arc;
}

// --------------------------------------------------------------------------
// Lambda: POST /issue
// Called by the portal backend to start an issuance flow
// --------------------------------------------------------------------------

export async function issueHandler(event: { body: string }) {
  const arc = createARC();
  const body = JSON.parse(event.body);

  const result = await arc.issue({
    source: 'openproduct',
    id: body.productId,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      url: result.url,
      sessionId: result.sessionId,
    }),
  };
}

// --------------------------------------------------------------------------
// Lambda: GET /callback?state=xxx&code=yyy
// Hit by the user's browser after completing the Ver.ID wallet flow
// --------------------------------------------------------------------------

export async function callbackHandler(event: { queryStringParameters: Record<string, string> }) {
  const arc = createARC();
  const searchParams = new URLSearchParams(event.queryStringParameters);

  const result = await arc.provider.callback(searchParams);

  if (result.success) {
    return {
      statusCode: 302,
      headers: { Location: `${process.env.PORTAL_URL}/mijn-producten?issued=${result.sessionId}` },
    };
  }

  return {
    statusCode: 302,
    headers: { Location: `${process.env.PORTAL_URL}/mijn-producten?error=issuance-failed` },
  };
}

// --------------------------------------------------------------------------
// Lambda: GET /status?sessionId=xxx
// Called by the portal to check issuance status (e.g. polling after redirect)
// --------------------------------------------------------------------------

export async function statusHandler(event: { queryStringParameters: Record<string, string> }) {
  const arc = createARC();

  const result = await arc.status({
    sessionId: event.queryStringParameters.sessionId,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
}

// --------------------------------------------------------------------------
// Lambda: POST /revoke
// Called by the portal to revoke an issuance
// --------------------------------------------------------------------------

export async function revokeHandler(event: { body: string }) {
  const arc = createARC();
  const body = JSON.parse(event.body);

  const result = await arc.revoke({
    sessionId: body.sessionId,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
}
