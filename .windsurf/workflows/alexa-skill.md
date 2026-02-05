---
description: How to build and deploy an Alexa Skill for the Chinese Calendar
---

# Alexa Skill - Calendario Chino

## Prerequisites

1. Amazon Developer Account: https://developer.amazon.com
2. AWS Account for Lambda: https://aws.amazon.com
3. ASK CLI installed: `npm install -g ask-cli`

## Project Structure

```
alexa-skill/
├── skill-package/
│   ├── skill.json
│   └── interactionModels/
│       └── custom/
│           └── es-ES.json
└── lambda/
    ├── index.ts
    ├── package.json
    └── tsconfig.json
```

## Step 1: Initialize ASK CLI

```bash
ask configure
```

## Step 2: Create Skill Package

Create `alexa-skill/skill-package/skill.json`:

```json
{
  "manifest": {
    "publishingInformation": {
      "locales": {
        "es-ES": {
          "name": "Calendario Chino",
          "summary": "Consulta el calendario lunar chino y días favorables",
          "description": "Pregunta sobre días favorables para matrimonios, mudanzas, negocios y más según el calendario lunar chino tradicional.",
          "examplePhrases": [
            "Alexa, abre calendario chino",
            "¿Qué día es hoy en el calendario lunar?",
            "¿Es buen día para casarse?"
          ]
        }
      }
    },
    "apis": {
      "custom": {
        "endpoint": {
          "uri": "arn:aws:lambda:us-east-1:XXXX:function:calendario-chino"
        }
      }
    }
  }
}
```

## Step 3: Create Interaction Model

Create `alexa-skill/skill-package/interactionModels/custom/es-ES.json`:

```json
{
  "interactionModel": {
    "languageModel": {
      "invocationName": "calendario chino",
      "intents": [
        {
          "name": "TodayInfoIntent",
          "samples": [
            "qué día es hoy",
            "información de hoy",
            "dime sobre hoy",
            "cuál es la fecha lunar"
          ]
        },
        {
          "name": "CheckActivityIntent",
          "slots": [
            {
              "name": "activity",
              "type": "ACTIVITY_TYPE"
            },
            {
              "name": "date",
              "type": "AMAZON.DATE"
            }
          ],
          "samples": [
            "es buen día para {activity}",
            "puedo {activity} hoy",
            "cuándo puedo {activity}",
            "es favorable {activity} el {date}",
            "qué tal {activity} mañana"
          ]
        },
        {
          "name": "FavorableDaysIntent",
          "slots": [
            {
              "name": "activity",
              "type": "ACTIVITY_TYPE"
            }
          ],
          "samples": [
            "cuándo es buen día para {activity}",
            "días favorables para {activity}",
            "mejor día para {activity} este mes"
          ]
        },
        {
          "name": "AMAZON.HelpIntent",
          "samples": []
        },
        {
          "name": "AMAZON.StopIntent",
          "samples": []
        },
        {
          "name": "AMAZON.CancelIntent",
          "samples": []
        }
      ],
      "types": [
        {
          "name": "ACTIVITY_TYPE",
          "values": [
            { "name": { "value": "matrimonio", "synonyms": ["casarse", "boda", "casar"] } },
            { "name": { "value": "mudanza", "synonyms": ["mudarse", "cambiar de casa"] } },
            { "name": { "value": "viaje", "synonyms": ["viajar", "salir de viaje"] } },
            { "name": { "value": "negocio", "synonyms": ["inauguración", "abrir negocio", "comercio"] } },
            { "name": { "value": "construcción", "synonyms": ["construir", "renovar", "obra"] } },
            { "name": { "value": "ceremonia", "synonyms": ["ceremonias", "ritual"] } }
          ]
        }
      ]
    }
  }
}
```

## Step 4: Create Lambda Function

Create `alexa-skill/lambda/index.ts`:

```typescript
import * as Alexa from 'ask-sdk-core';

const LaunchRequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  async handle(handlerInput: Alexa.HandlerInput) {
    const response = await fetch('https://chinese-traditional-calendar.netlify.app/api/day');
    const data = await response.json();
    
    const speechText = `Bienvenido al Calendario Chino. Hoy es ${data.lunarMonthName} ${data.lunarDayName}, año del ${data.zodiac}. Es día ${data.jianChu}. ¿Qué actividad quieres consultar?`;
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('¿Qué actividad quieres consultar?')
      .getResponse();
  }
};

const TodayInfoIntentHandler = {
  canHandle(handlerInput: Alexa.HandlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TodayInfoIntent';
  },
  async handle(handlerInput: Alexa.HandlerInput) {
    const response = await fetch('https://chinese-traditional-calendar.netlify.app/api/day');
    const data = await response.json();
    
    const speechText = `Hoy es ${data.gregorianDate}, ${data.lunarMonthName} ${data.lunarDayName} del calendario lunar. 
      Año del ${data.zodiac}. Día ${data.jianChu}. 
      Favorable: ${data.auspicious.slice(0, 3).join(', ')}. 
      Desfavorable: ${data.inauspicious.slice(0, 3).join(', ')}.`;
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  }
};

const CheckActivityIntentHandler = {
  canHandle(handlerInput: Alexa.HandlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CheckActivityIntent';
  },
  async handle(handlerInput: Alexa.HandlerInput) {
    const slots = (handlerInput.requestEnvelope.request as any).intent.slots;
    const activity = slots.activity?.value || 'matrimonio';
    
    const response = await fetch('https://chinese-traditional-calendar.netlify.app/api/day');
    const data = await response.json();
    
    const isAuspicious = data.auspicious.some((a: string) => 
      a.toLowerCase().includes(activity.toLowerCase())
    );
    const isInauspicious = data.inauspicious.some((a: string) => 
      a.toLowerCase().includes(activity.toLowerCase())
    );
    
    let speechText: string;
    if (isAuspicious) {
      speechText = `Sí, hoy es un buen día para ${activity}. Es favorable según el calendario chino.`;
    } else if (isInauspicious) {
      speechText = `No, hoy no es recomendable para ${activity}. Es desfavorable según el calendario chino.`;
    } else {
      speechText = `Hoy es un día neutral para ${activity}. No está especialmente indicado ni contraindicado.`;
    }
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput: Alexa.HandlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput: Alexa.HandlerInput) {
    const speechText = 'Puedes preguntarme sobre días favorables para matrimonio, mudanza, viajes, negocios y más. Por ejemplo, di: ¿es buen día para casarse?';
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput: Alexa.HandlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput: Alexa.HandlerInput) {
    return handlerInput.responseBuilder
      .speak('¡Hasta luego!')
      .getResponse();
  }
};

export const handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    TodayInfoIntentHandler,
    CheckActivityIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler
  )
  .lambda();
```

## Step 5: Deploy

```bash
# Build Lambda
cd alexa-skill/lambda
npm install
npm run build

# Deploy to AWS Lambda
ask deploy

# Or deploy Lambda separately
aws lambda update-function-code --function-name calendario-chino --zip-file fileb://dist.zip
```

## Step 6: Test

```bash
ask dialog --locale es-ES
```

Example conversation:
- User: "Alexa, abre calendario chino"
- Alexa: "Bienvenido al Calendario Chino. Hoy es Mes 12 Día 16..."
- User: "¿Es buen día para casarse?"
- Alexa: "No, hoy no es recomendable para matrimonio..."

## Voice Commands

| Command | Intent |
|---------|--------|
| "¿Qué día es hoy?" | TodayInfoIntent |
| "¿Es buen día para casarse?" | CheckActivityIntent |
| "¿Cuándo puedo mudarme?" | FavorableDaysIntent |
| "Días favorables para viaje" | FavorableDaysIntent |
