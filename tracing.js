// tracing.js
'use strict'
const process = require('process');
const opentelemetry = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-otlp-grpc');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { BasicTracerProvider, SimpleSpanProcessor } = require('@opentelemetry/tracing');


const collectorOptions = {
 // serviceName: 'basic-service',
  // url is optional and can be omitted - default is localhost:4317
//  url: '<collector-hostname>:<port>',
};

const provider = new BasicTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'front-end',
  }),
});

// configure the SDK to export telemetry data to the console
// enable all auto-instrumentations from the meta package
const traceExporter = new OTLPTraceExporter(collectorOptions);
provider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));
provider.register();
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => provider.shutdown().catch(console.error));
});

const sdk = new opentelemetry.NodeSDK({
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()]
  });
  
  // initialize the SDK and register with the OpenTelemetry API
  // this enables the API to record telemetry
  sdk.start()
  .then(() => console.log('Tracing initialized'))
  .catch((error) => console.log('Error initializing tracing', error));
  
  // gracefully shut down the SDK on process exit
  process.on('SIGTERM', () => {
    sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
    });
