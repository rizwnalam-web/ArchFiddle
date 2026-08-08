import { InterviewQuestion } from './interviewPrepData';

export const TOP_20_AZURE_IOT: InterviewQuestion[] = [
  {
    id: 'az-iot-01',
    category: 'Microsoft Azure IoT',
    question: '1. What is the fundamental architectural difference between Azure IoT Hub, Azure Event Hubs, and Azure Service Bus in high-throughput enterprise IoT solutions?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Microsoft Azure IoT', 'Azure IoT Hub', 'Event Hubs', 'Service Bus', 'Architecture', 'Protocols'],
    shortSummary: 'Compares bidirectional per-device identity authentication, streaming event ingestion, and enterprise transactional AMQP messaging.',
    detailedAnswer: {
      executiveSummary: 'Azure IoT Hub is purpose-built for bidirectional Internet of Things communication, providing individual per-device identity registries, per-device security credentials (X.509, SAS tokens, TPM), Device Twins, Direct Methods, and native protocol endpoints (MQTT, AMQP, HTTPS). Azure Event Hubs is a unidirectional, massive-scale distributed event streaming ingest engine (millions of events/sec) without per-device identities or cloud-to-device control. Azure Service Bus is an enterprise transactional message broker providing strict FIFO ordering, pub/sub topics, dead-lettering, and distributed two-phase commit transactions.',
      keyPoints: [
        'Azure IoT Hub: Bidirectional (Device-to-Cloud telemetry and Cloud-to-Device commands), per-device cryptographic identity registry, device twins (desired/reported state), file uploads, and firmware updates.',
        'Azure Event Hubs: Unidirectional pub/sub partitioned consumer log (Kafka-compatible), designed for massive data ingestion pipelines (e.g. log streams, financial ticks) where individual device management is not required.',
        'Azure Service Bus: High-value transactional message broker for financial orders and decoupled business logic with deduplication, sessions, and sagas.',
        'Combined Architecture: Devices connect to Azure IoT Hub -> IoT Hub routes messages via built-in endpoints to Event Hubs (for real-time analytics) and Service Bus (for urgent business workflows).'
      ],
      codeOrQuerySnippet: {
        title: 'Azure IoT Hub Device-to-Cloud Telemetry Sender (C# .NET 8)',
        language: 'csharp',
        code: `using Microsoft.Azure.Devices.Client;
using System.Text;
using System.Text.Json;

public class MortgageOfficeSensorNode
{
    private readonly DeviceClient _deviceClient;

    public MortgageOfficeSensorNode(string connectionString)
    {
        // Connect over secure MQTT with TLS 1.2/1.3
        _deviceClient = DeviceClient.CreateFromConnectionString(
            connectionString, 
            TransportType.Mqtt_Tcp_Only);
    }

    public async Task SendEnvironmentalTelemetryAsync(float temperature, float humidity)
    {
        var telemetryPayload = new
        {
            deviceId = "sensor-branch-chicago-04",
            temperature = temperature,
            humidity = humidity,
            timestampUtc = DateTime.UtcNow
        };

        string json = JsonSerializer.Serialize(telemetryPayload);
        using var message = new Message(Encoding.UTF8.GetBytes(json))
        {
            ContentType = "application/json",
            ContentEncoding = "utf-8"
        };

        // Add application properties for dynamic IoT Hub routing queries
        message.Properties.Add("sensorType", "environmental");
        message.Properties.Add("criticalAlert", temperature > 38.0 ? "true" : "false");

        await _deviceClient.SendEventAsync(message);
        Console.WriteLine($"[Telemetry Sent] Temp: {temperature}°C");
    }
}`
      },
      secondaryCodeSnippet: {
        title: 'Architecture Routing Flow & Decision Matrix',
        language: 'json',
        code: `{
  "Message_Flow": {
    "Device_Telemetry": "IoT Device -> IoT Hub (MQTT/AMQP with X.509)",
    "High_Velocity_Analytics_Route": "IoT Hub -> Event Hubs -> Azure Stream Analytics / ADX",
    "Critical_Alert_Route": "IoT Hub Message Routing ($app.criticalAlert = 'true') -> Service Bus Queue -> Workflow Function",
    "Cold_Storage_Archive_Route": "IoT Hub -> Azure Blob Storage / Delta Lake (Avro / Parquet)"
  }
}`
      },
      proTipOrPitfall: 'Never use Azure Event Hubs directly for field IoT devices—Event Hubs lacks per-device credential revocation. If one device key is compromised in Event Hubs, all devices sharing that shared access policy must be rekeyed.',
      studyResources: [
        {
          title: 'Comparison of Azure IoT Hub and Azure Event Hubs',
          url: 'https://learn.microsoft.com/en-us/azure/iot-hub/iot-hub-compare-event-hubs',
          source: 'Microsoft Learn',
          description: 'Official architectural decision guide between IoT Hub, Event Hubs, and Service Bus.'
        }
      ]
    }
  },
  {
    id: 'az-iot-02',
    category: 'Microsoft Azure IoT',
    question: '2. How does Azure IoT Device Provisioning Service (DPS) achieve zero-touch secure enrollment for millions of devices using TPM 2.0 and X.509 Certificate Chains?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Microsoft Azure IoT', 'DPS', 'Security', 'X.509', 'TPM 2.0', 'Zero-Touch'],
    shortSummary: 'Explains Global Provisioning Endpoints, Attestation mechanisms, HSM hardware roots of trust, and automated Geo-load-balanced IoT Hub assignment.',
    detailedAnswer: {
      executiveSummary: 'Azure IoT Device Provisioning Service (DPS) enables secure, automated, zero-touch provisioning of IoT hardware to designated IoT Hubs without hardcoding connection strings at manufacturing time. Devices connect to a single global DPS endpoint (global.azure-devices-provisioning.net). DPS authenticates the device using hardware-backed cryptographic attestation (TPM 2.0 Endorsement Keys or X.509 Certificate Chains signed by a trusted Root CA), applies enrollment allocation policies (e.g. lowest latency, geo-distribution, or custom Azure Function allocation), assigns the device to an IoT Hub, and provisions initial Device Twin state.',
      keyPoints: [
        'Zero-Touch Manufacturing: Factory firmware flashes only the DPS ID Scope and global endpoint; no secret connection strings are baked into hardware.',
        'X.509 CA Attestation: Individual device certificates (signed by enterprise intermediate/root CA) authenticate without pre-registering each individual device ID in DPS.',
        'TPM 2.0 Attestation: Hardware Security Module (HSM) uses non-exportable Endorsement Keys (EK) and Storage Root Keys for challenge-response authentication.',
        'Allocation Policies: Evenly Weighted Distribution, Lowest Latency (geographical geo-routing), Static Hub Assignment, or Custom Allocation via Webhook Azure Function.'
      ],
      codeOrQuerySnippet: {
        title: 'Zero-Touch Device Enrollment via DPS with X.509 Certificate (C#)',
        language: 'csharp',
        code: `using Microsoft.Azure.Devices.Provisioning.Client;
using Microsoft.Azure.Devices.Provisioning.Client.Transport;
using Microsoft.Azure.Devices.Client;
using System.Security.Cryptography.X509Certificates;

public class DeviceBootloader
{
    private const string GlobalDpsEndpoint = "global.azure-devices-provisioning.net";
    private const string IdScope = "0ne004A81BC"; // DPS ID Scope

    public static async Task<DeviceClient> BootstrapAndProvisionAsync(string certPath, string certPassword)
    {
        // 1. Load Hardware X.509 Certificate
        var certificate = new X509Certificate2(certPath, certPassword);
        using var security = new SecurityProviderX509Certificate(certificate);
        using var transport = new ProvisioningTransportHandlerMqtt();

        // 2. Initialize DPS Client
        var provClient = ProvisioningDeviceClient.Create(
            GlobalDpsEndpoint, 
            IdScope, 
            security, 
            transport);

        Console.WriteLine("[DPS] Contacting Global DPS Endpoint for Enrollment...");
        DeviceRegistrationResult result = await provClient.RegisterAsync();

        if (result.Status != ProvisioningRegistrationStatusType.Assigned)
        {
            throw new Exception($"DPS Registration failed with status: {result.Status}");
        }

        Console.WriteLine($"[DPS Assigned] Assigned to IoT Hub: {result.AssignedHub}, DeviceId: {result.DeviceId}");

        // 3. Connect directly to Assigned IoT Hub using X.509 Authentication
        var auth = new DeviceAuthenticationWithX509Certificate(result.DeviceId, certificate);
        var deviceClient = DeviceClient.Create(result.AssignedHub, auth, TransportType.Mqtt);
        await deviceClient.OpenAsync();

        return deviceClient;
    }
}`
      },
      secondaryCodeSnippet: {
        title: 'Custom DPS Allocation Policy Webhook (Azure Function)',
        language: 'csharp',
        code: `[FunctionName("CustomDpsAllocation")]
public static async Task<IActionResult> Run(
    [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest req)
{
    string requestBody = await new StreamReader(req.Body).ReadToEnd();
    dynamic data = JsonConvert.DeserializeObject(requestBody);

    // Read device registration payload & geographic country
    string countryCode = data?.deviceRuntimeContext?.payload?.country ?? "US";
    string targetHub = countryCode == "EU" ? "eu-central-hub.azure-devices.net" : "us-east-hub.azure-devices.net";

    return new OkObjectResult(new { iotHubHostName = targetHub });
}`
      },
      proTipOrPitfall: 'Always use Proof-of-Possession challenge when uploading Root/Intermediate X.509 Certificates to Azure DPS. This cryptographically validates that your organization owns the corresponding private key before enabling enrollment groups.',
      studyResources: [
        {
          title: 'Azure IoT Hub Device Provisioning Service (DPS) Architecture',
          url: 'https://learn.microsoft.com/en-us/azure/iot-dps/about-iot-dps',
          source: 'Microsoft Learn',
          description: 'Comprehensive guide to zero-touch enrollment, X.509 certificates, and TPM attestation.'
        }
      ]
    }
  },
  {
    id: 'az-iot-03',
    category: 'Microsoft Azure IoT',
    question: '3. How does the Azure IoT Edge Runtime (edgeAgent and edgeHub) enable offline processing, containerized module orchestration, and local store-and-forward telemetry?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Microsoft Azure IoT', 'IoT Edge', 'edgeHub', 'edgeAgent', 'Docker', 'Offline Storage'],
    shortSummary: 'Explains the Edge Daemon, Moby container engine, inter-module routing, message buffering, and intermittent connectivity synchronization.',
    detailedAnswer: {
      executiveSummary: 'Azure IoT Edge deploys cloud workloads (AI inference models, Azure Functions, Stream Analytics, custom code) onto on-premise hardware using Docker containers. The Edge Runtime consists of two system modules: 1) edgeAgent (manages deployment manifests, pulls container images from ACR, monitors module health, and restarts crashed containers), and 2) edgeHub (acts as a local MQTT/AMQP message broker, handles inter-module routing, and provides local persistent message buffering with Store-and-Forward synchronization during network outages).',
      keyPoints: [
        'edgeAgent: Reconciles the local container state with the cloud deployment manifest, reporting module status back to Azure.',
        'edgeHub: Emulates Azure IoT Hub locally on the edge device. Downstream leaf devices connect to edgeHub as transparent gateways.',
        'Extended Offline Operation: edgeHub buffers incoming telemetry to local disk (RocksDB/SQLite) when internet is severed; on reconnection, it automatically streams buffered records to the cloud in chronological order.',
        'Module Routing: Uses declarative SQL-like routing queries (e.g. `FROM /messages/modules/cameraAI/outputs/alert INTO BrokeredEndpoint("/modules/alertFilter/inputs/in")`).'
      ],
      codeOrQuerySnippet: {
        title: 'Azure IoT Edge Deployment Manifest Routing Configuration (deployment.json)',
        language: 'json',
        code: `{
  "$edge-hub": {
    "properties.desired": {
      "schemaVersion": "1.2",
      "routes": {
        "AIInferenceToFilter": "FROM /messages/modules/visionInference/outputs/detection INTO BrokeredEndpoint('/modules/filterService/inputs/detections')",
        "FilterToCloud": "FROM /messages/modules/filterService/outputs/critical INTO $upstream",
        "LeafDevicesToCloud": "FROM /messages/* WHERE NOT IS_DEFINED($connectionModuleId) INTO $upstream"
      },
      "storeAndForwardConfiguration": {
        "timeToLiveSecs": 604800 // Buffer offline data for up to 7 days on local disk
      }
    }
  }
}`
      },
      secondaryCodeSnippet: {
        title: 'C# IoT Edge Custom Module Message Handler',
        language: 'csharp',
        code: `using Microsoft.Azure.Devices.Client;
using System.Text;

public class EdgeFilterModule
{
    private static async Task<MessageResponse> FilterMessageHandler(Message message, object userContext)
    {
        var moduleClient = (ModuleClient)userContext;
        byte[] messageBytes = message.GetBytes();
        string messageString = Encoding.UTF8.GetString(messageBytes);
        
        var data = JsonSerializer.Deserialize<DetectionPayload>(messageString);

        if (data.ConfidenceScore > 0.85) // High-value event
        {
            using var forwardMessage = new Message(messageBytes);
            // Route to cloud ($upstream)
            await moduleClient.SendEventAsync("critical", forwardMessage);
        }

        return MessageResponse.Completed;
    }
}`
      },
      proTipOrPitfall: 'Set a non-zero `timeToLiveSecs` and mount a persistent host volume for `/edgeHubStorage` in Docker container create options. If edgeHub stores buffered offline telemetry in container ephemeral storage, restarting the container will wipe out all buffered field telemetry.',
      studyResources: [
        {
          title: 'Understand the Azure IoT Edge Runtime and its Architecture',
          url: 'https://learn.microsoft.com/en-us/azure/iot-edge/iot-edge-runtime',
          source: 'Microsoft Learn',
          description: 'Official architecture guide for edgeAgent, edgeHub, and containerized edge workloads.'
        }
      ]
    }
  },
  {
    id: 'az-iot-04',
    category: 'Microsoft Azure IoT',
    question: '4. Device Twins (Desired vs Reported vs Tags) vs Direct Methods vs Cloud-to-Device (C2D) Messages: When should each communication pattern be used?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Microsoft Azure IoT', 'Device Twins', 'Direct Methods', 'C2D', 'Communication Patterns'],
    shortSummary: 'Compares asynchronous JSON state synchronization, synchronous RPC request-response execution, and reliable command queues.',
    detailedAnswer: {
      executiveSummary: 'Azure IoT Hub provides three distinct Cloud-to-Device communication patterns: 1) Device Twins (JSON documents synchronizing state, metadata, and configurations across intermittent connectivity), 2) Direct Methods (synchronous request-reply RPC calls that execute immediately on online devices and return HTTP-like status codes), and 3) Cloud-to-Device (C2D) Messages (reliable asynchronous command queues with durable acknowledgment, delivery receipts, and dead-lettering for disconnected devices).',
      keyPoints: [
        'Device Twins - Desired Properties: Set by cloud backend (e.g. `{"targetTemperature": 22.5}`); device synchronizes and reports actual status.',
        'Device Twins - Reported Properties: Set by device (e.g. `{"firmwareVersion": "v2.1.4", "batteryLevel": 88}`); cloud reads state.',
        'Device Twins - Tags: Read/write by cloud backend ONLY; device cannot read tags (used for fleet categorization e.g. `{"location": "Plant-3", "tier": "Gold"}`).',
        'Direct Methods: Synchronous invocation (e.g. `rebootDevice()`, `triggerDiagnostic()`) with immediate response payload; fails with 404/504 if device is currently offline.',
        'C2D Messages: One-way durable queue with delivery timeouts (TTL), feedback records (delivered/expired), and retry policies.'
      ],
      codeOrQuerySnippet: {
        title: 'Device Twin Desired Property Handler & Direct Method Registration in C#',
        language: 'csharp',
        code: `public class SmartLockDevice
{
    private readonly DeviceClient _deviceClient;

    public async Task InitializeTwinAndMethodsAsync()
    {
        // 1. Register Direct Method for Synchronous Command Execution
        await _deviceClient.SetMethodHandlerAsync("UnlockDoor", async (methodRequest, userContext) =>
        {
            Console.WriteLine($"[Direct Method] Received Unlock command with payload: {methodRequest.DataAsJson}");
            
            // Execute physical unlock solenoid...
            bool unlockSuccess = true;

            var responseJson = JsonSerializer.Serialize(new { success = unlockSuccess, timestamp = DateTime.UtcNow });
            return new MethodResponse(Encoding.UTF8.GetBytes(responseJson), 200);
        }, null);

        // 2. Subscribe to Desired Property Updates (Configuration Changes)
        await _deviceClient.SetDesiredPropertyUpdateCallbackAsync(async (desiredProperties, userContext) =>
        {
            if (desiredProperties.Contains("autoLockDelaySec"))
            {
                int delay = desiredProperties["autoLockDelaySec"];
                Console.WriteLine($"Updating AutoLock Delay to {delay}s");

                // Report back confirmation via Reported Properties
                var reported = new TwinCollection();
                reported["autoLockDelaySec"] = delay;
                reported["lastConfigUpdateUtc"] = DateTime.UtcNow;
                await _deviceClient.UpdateReportedPropertiesAsync(reported);
            }
        }, null);
    }
}`
      },
      secondaryCodeSnippet: {
        title: 'Invoking Direct Method from Backend Cloud Service (C# .NET)',
        language: 'csharp',
        code: `// Cloud Service invoking Direct Method on remote field device
var serviceClient = ServiceClient.CreateFromConnectionString(serviceConnString);
var cloudMethod = new CloudToDeviceMethod("UnlockDoor", TimeSpan.FromSeconds(15));
cloudMethod.SetPayloadJson(JsonSerializer.Serialize(new { operatorId = "admin_88" }));

CloudToDeviceMethodResult result = await serviceClient.InvokeDeviceMethodAsync("smart-lock-001", cloudMethod);
Console.WriteLine($"Device responded with status: {result.Status}");`
      },
      proTipOrPitfall: 'Never use Direct Methods for configuration changes (e.g. changing telemetry reporting interval)—if the device is offline or sleeping, the direct method will fail immediately. Always use Device Twin Desired Properties for state and configurations.',
      studyResources: [
        {
          title: 'Understand and Use Device Twins in IoT Hub',
          url: 'https://learn.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-device-twins',
          source: 'Microsoft Learn',
          description: 'Official guide to Desired Properties, Reported Properties, and Tags queries.'
        }
      ]
    }
  },
  {
    id: 'az-iot-05',
    category: 'Microsoft Azure IoT',
    question: '5. Which protocol should you choose between MQTT, AMQP, and HTTPS in Azure IoT, and how do connection multiplexing and keep-alive timers impact battery and data costs?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Microsoft Azure IoT', 'MQTT', 'AMQP', 'HTTPS', 'Protocols', 'Networking', 'Low-Power'],
    shortSummary: 'Compares binary packet overhead, bidirectional socket persistence, AMQP multiplexing, and HTTPS battery drain.',
    detailedAnswer: {
      executiveSummary: 'Protocol selection directly determines network bandwidth, device battery life, and cloud messaging costs. MQTT (over TCP port 8883) is the primary choice for constrained devices due to its ultra-compact 2-byte header overhead, bidirectional persistent TCP socket, and low memory footprint. AMQP (port 5671) excels in gateway and multi-tenant scenarios requiring connection multiplexing (multiple device identities multiplexed over a single TCP connection). HTTPS (port 443) is suitable only for intermittent batch uploads (e.g. wake up once per day), as opening a TLS handshake on every request incurs huge CPU, battery, and packet overhead.',
      keyPoints: [
        'MQTT (Message Queuing Telemetry Transport): Minimal 2-byte header, QoS 0/1 support, low bandwidth, persistent socket with configurable keep-alive (PINGREQ/PINGRESP).',
        'AMQP (Advanced Message Queuing Protocol): Richer messaging semantics, link credit flow control, and supports connection multiplexing for Edge gateways.',
        'HTTPS: High overhead per request (TLS negotiation ~3.5KB data transfer + multiple roundtrips); cannot receive real-time Direct Methods or C2D messages without inefficient long-polling.',
        'WebSockets Fallback: MQTT over WebSockets (port 443) and AMQP over WebSockets are used when enterprise corporate firewalls block ports 8883 and 5671.'
      ],
      codeOrQuerySnippet: {
        title: 'Configuring MQTT Keep-Alive and TLS Options in Azure IoT C# SDK',
        language: 'csharp',
        code: `var mqttSetting = new MqttTransportSettings(TransportType.Mqtt_Tcp_Only)
{
    // Adjust keep-alive timer for low-power or cellular devices
    // Default is 320 seconds; reduce for fast dead-peer detection or increase to save cellular data
    IdleTimeout = TimeSpan.FromMinutes(10),
    
    // Fallback to WebSockets port 443 if outbound port 8883 is blocked
    // TransportType.Mqtt_WebSocket_Only
};

var deviceClient = DeviceClient.CreateFromConnectionString(
    connectionString, 
    new ITransportSettings[] { mqttSetting });`
      },
      secondaryCodeSnippet: {
        title: 'Protocol Feature & Resource Comparison Matrix',
        language: 'json',
        code: `{
  "Protocols": {
    "MQTT": { "Header_Size": "2 bytes", "Connection": "Persistent TCP", "Bidirectional": true, "Best_For": "Constrained Microcontrollers / Field Sensors" },
    "AMQP": { "Header_Size": "8+ bytes", "Connection": "Persistent TCP (Multiplexed)", "Bidirectional": true, "Best_For": "Field Gateways aggregating 100+ devices" },
    "HTTPS": { "Header_Size": "200-800 bytes", "Connection": "Stateless Request/Reply", "Bidirectional": false, "Best_For": "Daily batch telemetry / Legacy devices" }
  }
}`
      },
      proTipOrPitfall: 'On cellular LTE-M / NB-IoT connections where carriers bill per megabyte, frequent TLS handshakes can quadruple your cloud bill. Keep the MQTT socket open or use connection caching with TLS Session Resumption.',
      studyResources: [
        {
          title: 'Choose a Communication Protocol for Azure IoT Hub',
          url: 'https://learn.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-protocols',
          source: 'Microsoft Learn',
          description: 'Official comparison of MQTT, AMQP, HTTPS, and WebSocket performance trade-offs.'
        }
      ]
    }
  },
  {
    id: 'az-iot-06',
    category: 'Microsoft Azure IoT',
    question: '6. What is Azure Digital Twins (ADT), how do you model physical environments using Digital Twins Definition Language (DTDL), and how do you synchronize ADT with Azure Data Explorer (ADX)?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Microsoft Azure IoT', 'Azure Digital Twins', 'DTDL', 'Azure Data Explorer', 'Ontologies', 'Graph DB'],
    shortSummary: 'Covers spatial graph topology, DTDL v2/v3 schemas, event-driven twin updates, and ADX Data History synchronization.',
    detailedAnswer: {
      executiveSummary: 'Azure Digital Twins (ADT) is an enterprise PaaS graph engine that models digital representations of real-world environments (smart buildings, factories, mortgage processing centers). Environments are defined using DTDL (Digital Twins Definition Language), a JSON-LD ontology defining Interfaces, Telemetry, Properties, Components, and Relationships. ADT maintains the living graph state, propagating telemetry updates from IoT Hub via Azure Functions, and streams historic state changes to Azure Data Explorer (ADX) using ADT Data History for temporal graph analytics and 3D visualization.',
      keyPoints: [
        'DTDL Schema: Object-oriented JSON-LD standard declaring `@type: Interface`, `contents: [Telemetry, Property, Relationship]`.',
        'Twin Graph Relationships: Directed edges representing physical or logical connections (e.g. `Building -> contains -> Floor -> contains -> Room -> contains -> Sensor`).',
        'Event-Driven Ingestion: IoT Hub telemetry triggers an Azure Function -> Function invokes ADT SDK `updateDigitalTwin()` using JSON Patch operations.',
        'Data History via ADX: Native integration automatically historizes twin property changes and relationship updates into Azure Data Explorer (Kusto) tables without writing code.'
      ],
      codeOrQuerySnippet: {
        title: 'DTDL v3 Model Definition for Smart Facility HVAC Zone (JSON-LD)',
        language: 'json',
        code: `{
  "@context": "dtmi:dtdl:context;3",
  "@id": "dtmi:com:mortgagecorp:facility:HvacZone;1",
  "@type": "Interface",
  "displayName": "HVAC Smart Zone",
  "contents": [
    {
      "@type": "Property",
      "name": "zoneId",
      "schema": "string"
    },
    {
      "@type": "Telemetry",
      "name": "currentTemperature",
      "schema": "double"
    },
    {
      "@type": "Property",
      "name": "targetTemperature",
      "schema": "double",
      "writable": true
    },
    {
      "@type": "Relationship",
      "name": "containsSensors",
      "target": "dtmi:com:mortgagecorp:facility:TemperatureSensor;1"
    }
  ]
}`
      },
      secondaryCodeSnippet: {
        title: 'Updating Digital Twin Graph via JSON Patch (C# Azure Function)',
        language: 'csharp',
        code: `using Azure.DigitalTwins.Core;
using Azure.JsonPatch;

public class TwinUpdateFunction
{
    private readonly DigitalTwinsClient _adtClient;

    public async Task ProcessTelemetryToTwinAsync(string twinId, double currentTemp)
    {
        var patch = new JsonPatchDocument();
        // Update twin property
        patch.AppendReplace("/currentTemperature", currentTemp);
        patch.AppendReplace("/lastTelemetryReceivedUtc", DateTime.UtcNow);

        await _adtClient.UpdateDigitalTwinAsync(twinId, patch);
        Console.WriteLine($"[ADT Graph Updated] Twin: {twinId}");
    }
}`
      },
      proTipOrPitfall: 'When updating Azure Digital Twins from high-frequency telemetry, always use JSON Patch operations (`AppendReplace`) rather than overwriting full twin documents. Ensure you include ETag validation if concurrent writers modify the same twin.',
      studyResources: [
        {
          title: 'Digital Twins Definition Language (DTDL) Specification v3',
          url: 'https://github.com/Azure/opendigitaltwins-dtdl',
          source: 'GitHub / Microsoft',
          description: 'Official open specification for spatial and entity graph ontologies.'
        }
      ]
    }
  },
  {
    id: 'az-iot-07',
    category: 'Microsoft Azure IoT',
    question: '7. How do you design an End-to-End Real-Time IoT Telemetry Ingestion Pipeline using IoT Hub Message Routing, Azure Stream Analytics, and Azure Data Explorer (ADX)?',
    difficulty: 'Principal Architect',
    tags: ['Microsoft Azure IoT', 'Message Routing', 'Stream Analytics', 'Azure Data Explorer', 'Kusto', 'Big Data'],
    shortSummary: 'Details cold-path vs hot-path lambda architecture, custom routing endpoints, windowing queries, and high-speed Kusto indexing.',
    detailedAnswer: {
      executiveSummary: 'An enterprise IoT ingestion pipeline uses a Lambda / Kappa Architecture to split telemetry into Hot Path (immediate real-time alerting and sub-second dashboards) and Cold Path (historical analytics, ML model training, and long-term compliance storage). IoT Hub Message Routing filters incoming telemetry based on message body queries (`$body.temperature > 50`) and directs hot streams to Azure Stream Analytics / Event Hubs and cold streams to Azure Data Explorer (ADX) and Azure Data Lake Storage Gen2 (Parquet format). ADX indexes billions of streaming events per day with Kusto Query Language (KQL) for sub-second analytical aggregations.',
      keyPoints: [
        'IoT Hub Native Routing: Evaluates routing queries on message headers and JSON body payloads, dispatching up to 10 custom endpoints with zero code.',
        'Hot Path (Stream Analytics): Performs tumbling, hopping, or sliding window aggregations (e.g. `GROUP BY TumblingWindow(minute, 5)`) to detect anomalies and trigger real-time webhooks.',
        'Warm/Analytical Path (ADX): Streaming ingestion appends uncompressed data directly into memory rowstores, automatically sealing into columnar indexed shards.',
        'Cold Path (Data Lake Gen2): IoT Hub writes directly to Azure Blob/Data Lake partitioned by `{iothub}/{partition}/{YYYY}/{MM}/{DD}/{HH}` in Avro or Parquet format.'
      ],
      codeOrQuerySnippet: {
        title: 'Azure Stream Analytics Real-Time Anomaly Detection Query (SQL)',
        language: 'sql',
        code: `WITH FilteredTelemetry AS (
    SELECT 
        deviceId,
        temperature,
        humidity,
        EventProcessedUtcTime AS readingTime
    FROM [IoTHubInput]
    WHERE temperature IS NOT NULL
)

-- Hot Path Alert: Temperature Spike over 1-minute Tumbling Window
SELECT 
    deviceId,
    AVG(temperature) AS avgTemp,
    MAX(temperature) AS maxTemp,
    System.Timestamp() AS windowEndTime
INTO [AlertServiceBusQueueOutput]
FROM FilteredTelemetry
GROUP BY deviceId, TumblingWindow(minute, 1)
HAVING AVG(temperature) > 42.0;

-- Raw Stream to Azure Data Explorer (ADX) Table
SELECT *
INTO [ADXHotTelemetryOutput]
FROM FilteredTelemetry;`
      },
      secondaryCodeSnippet: {
        title: 'Fast Kusto Analytical Query in Azure Data Explorer (KQL)',
        language: 'text',
        code: `// Sub-second 30-day time-series aggregation across 100,000 devices in KQL
DeviceTelemetry
| where TimestampUtc >= ago(30d)
| where SensorType == "environmental"
| summarize AvgTemp = avg(Temperature), P99Temp = percentile(Temperature, 99) by bin(TimestampUtc, 1h), DeviceLocation
| render timechart`
      },
      proTipOrPitfall: 'Always declare message content type as `application/json` and content encoding as `utf-8` on the device `Message` object. If these headers are missing, IoT Hub cannot decode the JSON body and message routing queries based on `$body` will evaluate to null and fail.',
      studyResources: [
        {
          title: 'Use IoT Hub Message Routing to Send Device-to-Cloud Messages',
          url: 'https://learn.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-messages-d2c',
          source: 'Microsoft Learn',
          description: 'Official guide on routing endpoints, queries, fallback routes, and enrichment.'
        }
      ]
    }
  },
  {
    id: 'az-iot-08',
    category: 'Microsoft Azure IoT',
    question: '8. How does Over-The-Air (OTA) Firmware Update architecture work using Device Update for Azure IoT Hub, and how do you prevent bricking devices during network failures?',
    difficulty: 'Senior (6+ YOE)',
    tags: ['Microsoft Azure IoT', 'OTA', 'Firmware', 'Device Update', 'Resilience', 'Security'],
    shortSummary: 'Covers A/B Dual-Bank partitioning, update manifests, step-by-step rolling deployments, cryptographic signing, and automatic rollback.',
    detailedAnswer: {
      executiveSummary: 'Over-The-Air (OTA) firmware updating is critical for lifecycle security patching in remote IoT fleets. Device Update for Azure IoT Hub provides cloud-managed, staged rollouts of image-based and package-based updates. To guarantee zero bricked devices during power or network failure, devices must utilize an A/B Dual-Bank Partitioning scheme: the active OS runs from Slot A while the update agent downloads and flashes the new image into inactive Slot B. Upon successful cryptographic hash verification, the bootloader (U-Boot) marks Slot B as trial boot; if the new firmware fails health checks or crashes within 60 seconds, the hardware watchdog timer automatically reboots back into safe Slot A.',
      keyPoints: [
        'A/B Dual Partitioning: Device contains two complete OS slots; updates write exclusively to the dormant slot without interrupting active operations.',
        'Cryptographic Manifest Verification: Update manifest is signed by manufacturer private key; device validates SHA256 checksum and digital signature before applying update.',
        'Hardware Watchdog & Automatic Rollback: Bootloader resets to known good partition if trial firmware fails to signal operational readiness within timeout window.',
        'Staged Phased Deployment: Cloud deploys firmware to 1% canary group -> monitors crash telemetry for 24h -> rolls out to 10% -> 100% full fleet.'
      ],
      codeOrQuerySnippet: {
        title: 'Device Update Import Manifest (importManifest.json)',
        language: 'json',
        code: `{
  "updateId": {
    "provider": "MortgageTech",
    "name": "BranchSensorOS",
    "version": "2.4.1"
  },
  "compatibility": [
    {
      "deviceManufacturer": "MortgageTech-Hardware",
      "deviceModel": "SensorNode-V2"
    }
  ],
  "instructions": {
    "steps": [
      {
        "handler": "microsoft/swupdate:1",
        "files": ["firmware_v2.4.1.swu"]
      }
    ]
  },
  "files": [
    {
      "filename": "firmware_v2.4.1.swu",
      "sizeInBytes": 14285714,
      "hashes": {
        "sha256": "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a"
      }
    }
  ],
  "createdDateTime": "2026-08-01T08:00:00Z"
}`
      },
      secondaryCodeSnippet: {
        title: 'A/B Partitioning Bootloader State Machine Logic (C/C++)',
        language: 'text',
        code: `// U-Boot Environment State Machine
1. Flash Update to /dev/mmcblk0p3 (Inactive Partition B)
2. Verify SHA256 Hash matches Signed Manifest
3. Set U-Boot env: boot_partition = B, trial_boot_count = 1
4. Reboot
5. If OS boots successfully -> Clear trial_boot_count -> Mark Partition B as Permanent
6. If Kernel Panics / Watchdog fires 3 times -> Revert boot_partition to A`
      },
      proTipOrPitfall: 'Never perform in-place firmware updates on a single partition over wireless connections. A power outage or dropped cellular packet mid-write will permanently corrupt the flash memory and brick the device.',
      studyResources: [
        {
          title: 'What is Device Update for Azure IoT Hub?',
          url: 'https://learn.microsoft.com/en-us/azure/iot-hub-device-update/understand-device-update',
          source: 'Microsoft Learn',
          description: 'Official architecture guide for OTA update campaigns, import manifests, and agent integration.'
        }
      ]
    }
  },
  {
    id: 'az-iot-09',
    category: 'Microsoft Azure IoT',
    question: '9. How do you implement Zero-Trust Security in Azure IoT solutions using Hardware Security Modules (HSM), TPM 2.0, X.509 Certificate Revocation Lists (CRL), and TLS 1.3?',
    difficulty: 'Staff / Lead Architect',
    tags: ['Microsoft Azure IoT', 'Security', 'Zero Trust', 'X.509', 'HSM', 'TPM 2.0', 'Cryptography'],
    shortSummary: 'Explains Hardware Root of Trust, mutual TLS authentication, certificate rotation, and perimeter security hardening.',
    detailedAnswer: {
      executiveSummary: 'Zero-Trust in IoT assumes that network perimeters are compromised and physical devices are subject to tampering. End-to-end security relies on three foundations: 1) Hardware Root of Trust (storing private keys in tamper-resistant chips like TPM 2.0, Microchip ATECC608, or Azure Sphere Pluton where keys can never be extracted via memory dumps or JTAG probes), 2) Mutual TLS 1.2/1.3 Authentication (verifying both server and device identities on every connection), and 3) Certificate Lifecycle Governance (automated X.509 certificate rotation and instant revocation via Certificate Revocation Lists - CRL or disabling device identity in IoT Hub registry).',
      keyPoints: [
        'Hardware Security Module (HSM): Performs cryptographic operations (ECDSA sign/verify) internally on-chip without exposing raw private keys to device application memory.',
        'Per-Device Identity: Never share symmetric keys across devices. Each device possesses a unique X.509 leaf certificate.',
        'Defense-in-Depth Network Isolation: Restrict IoT Hub public access using Azure Private Endpoints (Private Link) inside a dedicated VNet, blocking public internet egress.',
        'Compromised Device Isolation: Disabling a device in IoT Hub registry immediately drops active TCP sockets and blocks SAS token generation in <1 second.'
      ],
      codeOrQuerySnippet: {
        title: 'Revoking Compromised Device Identity via Azure IoT Hub Service SDK (C#)',
        language: 'csharp',
        code: `using Microsoft.Azure.Devices;

public class SecurityGovernanceService
{
    private readonly RegistryManager _registryManager;

    public async Task QuarantineCompromisedDeviceAsync(string deviceId)
    {
        // Fetch current device identity from registry
        Device device = await _registryManager.GetDeviceAsync(deviceId);
        
        if (device != null)
        {
            // Instantly disable device (Zero Trust Quarantine)
            device.Status = DeviceStatus.Disabled;
            device.StatusReason = "Security Alert: Anomaly detected by Microsoft Defender for IoT";

            await _registryManager.UpdateDeviceAsync(device);
            Console.WriteLine($"[QUARANTINED] Device {deviceId} revoked and disconnected from IoT Hub.");
        }
    }
}`
      },
      secondaryCodeSnippet: {
        title: 'Zero-Trust IoT Security Architecture Checklist',
        language: 'json',
        code: `{
  "Security_Pillars": {
    "Silicon": "Hardware Root of Trust (TPM 2.0 / ATECC608 / Pluton)",
    "Transport": "Enforce TLS 1.3 / TLS 1.2 with strong cipher suites (ECDHE-RSA-AES128-GCM-SHA256)",
    "Identity": "Unique X.509 Device Certificates with 1-year auto-rotation",
    "Network": "Azure Private Link + IP Filter Firewall Rules",
    "Monitoring": "Microsoft Defender for IoT (Agentless network sensor & anomaly detection)"
  }
}`
      },
      proTipOrPitfall: 'Never store plain-text connection strings or private keys in source code, environment variables, or SD cards on edge devices. If physical hardware is stolen, attackers will read the flash chip and impersonate your cloud fleet.',
      studyResources: [
        {
          title: 'Azure IoT Security Architecture and Zero Trust Guide',
          url: 'https://learn.microsoft.com/en-us/azure/iot-hub/iot-hub-security-ground-up',
          source: 'Microsoft Learn',
          description: 'Official security principles covering hardware roots of trust and secure communication.'
        }
      ]
    }
  },
  {
    id: 'az-iot-10',
    category: 'Microsoft Azure IoT',
    question: '10. What is Industrial IoT (IIoT), how does OPC-UA PubSub integrate with Azure IoT Operations and Edge Akri, and how do you optimize IoT Hub scalability for 1,000,000+ devices?',
    difficulty: 'Principal Architect',
    tags: ['Microsoft Azure IoT', 'Industrial IoT', 'OPC-UA', 'Azure IoT Operations', 'Akri', 'Scalability', 'FinOps'],
    shortSummary: 'Covers IEC 62541 OPC-UA standards, Kubernetes-enabled Azure IoT Operations, Edge Akri asset discovery, and IoT Hub unit sizing.',
    detailedAnswer: {
      executiveSummary: 'Industrial IoT (IIoT) connects legacy programmable logic controllers (PLCs), SCADA systems, and robotics using the standardized OPC-UA (Open Platform Communications Unified Architecture) protocol. Azure IoT Operations runs on edge Kubernetes clusters (Azure Arc-enabled K3s/AKS Edge Essentials) to ingest OPC-UA industrial asset telemetry via Edge Akri asset discovery and the Azure MQTT Broker. To scale Azure IoT Hub to 1,000,000+ devices, architects use multi-unit S3 IoT Hubs (supporting up to 300,000,000 messages/day), partition telemetry by Device ID, batch messages on edge gateways, and tune keep-alive intervals to optimize cost.',
      keyPoints: [
        'OPC-UA Standard: Vendor-neutral industrial communication protocol featuring semantic information models and binary TCP / PubSub over MQTT transport.',
        'Azure IoT Operations: Cloud-native edge data plane built on Kubernetes, featuring a distributed MQTT broker (MQ), data transformation pipelines, and OPC-UA connector.',
        'Akri Asset Discovery: Discovers leaf devices (OPC-UA servers, IP cameras, USB sensors) and automatically creates Kubernetes custom resources for each asset.',
        'IoT Hub Unit Capacity: Standard S1 = 400,000 msgs/day; S2 = 6,000,000 msgs/day; S3 = 300,000,000 msgs/day. Up to 200 S3 units can scale to billions of messages/day.'
      ],
      codeOrQuerySnippet: {
        title: 'Batching High-Frequency Industrial Telemetry on Edge Gateway (C#)',
        language: 'csharp',
        code: `public class IndustrialTelemetryBatcher
{
    private readonly DeviceClient _gatewayClient;
    private readonly List<Message> _telemetryBatch = new();
    private readonly object _lock = new();

    public async Task EnqueueSensorReadingAsync(string plcTag, double value, DateTime timestamp)
    {
        var reading = new { tag = plcTag, val = value, ts = timestamp };
        var msg = new Message(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(reading)))
        {
            ContentType = "application/json",
            ContentEncoding = "utf-8"
        };

        lock (_lock)
        {
            _telemetryBatch.Add(msg);
        }

        // Batch send 100 messages or every 5 seconds to reduce IoT Hub metering operations
        if (_telemetryBatch.Count >= 100)
        {
            await FlushBatchAsync();
        }
    }

    private async Task FlushBatchAsync()
    {
        List<Message> toSend;
        lock (_lock)
        {
            if (_telemetryBatch.Count == 0) return;
            toSend = new List<Message>(_telemetryBatch);
            _telemetryBatch.Clear();
        }

        // Send up to 500 messages in a single HTTP/MQTT batch call
        await _gatewayClient.SendEventBatchAsync(toSend);
        Console.WriteLine($"[Batch Dispatched] Sent {toSend.Count} industrial readings in 1 network operation.");
    }
}`
      },
      secondaryCodeSnippet: {
        title: 'Azure IoT Operations OPC-UA Asset Endpoint Configuration (CRD)',
        language: 'json',
        code: `{
  "apiVersion": "deviceregistry.microsoft.com/v1",
  "kind": "Asset",
  "metadata": { "name": "mortgage-doc-scanner-plc-01" },
  "spec": {
    "assetEndpointProfileRef": "opc-ua-connector-profile",
    "datasets": [
      {
        "name": "throughput_telemetry",
        "dataPoints": [
          { "name": "ScanSpeedPPM", "address": "ns=2;s=Scanner.Speed" },
          { "name": "PaperJamError", "address": "ns=2;s=Scanner.JamAlarm" }
        ]
      }
    ]
  }
}`
      },
      proTipOrPitfall: 'In IoT Hub, a 4KB chunk of payload counts as 1 billable message. If a sensor sends a 100-byte message every 1 second, it consumes 86,400 billable messages/day. By batching 10 readings into one 1KB payload every 10 seconds, billable message volume drops by 90% with zero data loss.',
      studyResources: [
        {
          title: 'What is Azure IoT Operations?',
          url: 'https://learn.microsoft.com/en-us/azure/iot-operations/overview-iot-operations',
          source: 'Microsoft Learn',
          description: 'Official overview of containerized Kubernetes edge data plane, OPC-UA, and distributed MQTT broker.'
        }
      ]
    }
  }
];
