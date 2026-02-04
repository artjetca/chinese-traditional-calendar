import type { Handler, HandlerEvent } from '@netlify/functions';
import { generateCalendarHTML } from '../../src/calendar-view.js';

export const handler: Handler = async (event: HandlerEvent) => {
  const year = parseInt(event.queryStringParameters?.year || new Date().getFullYear().toString());
  const month = parseInt(event.queryStringParameters?.month || (new Date().getMonth() + 1).toString());
  const activity = event.queryStringParameters?.activity || undefined;
  
  const html = generateCalendarHTML(year, month, activity);
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
    body: html,
  };
};
