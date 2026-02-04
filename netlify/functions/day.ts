import type { Handler, HandlerEvent } from '@netlify/functions';
import { getDayInfo } from '../../src/index.js';

export const handler: Handler = async (event: HandlerEvent) => {
  const dateParam = event.queryStringParameters?.date;
  
  if (!dateParam) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing date parameter' }),
    };
  }
  
  const [y, m, d] = dateParam.split('-').map(Number);
  const info = getDayInfo(y, m, d);
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(info),
  };
};
