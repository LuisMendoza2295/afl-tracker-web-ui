import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const config = new pulumi.Config();
const gcpConfig = new pulumi.Config("gcp");

const project = gcpConfig.require("project");
const region = gcpConfig.require("region");
const env = pulumi.getStack();

const imageTag = config.get("imageTag") || "latest";

// Get existing data from Pulumi infra stack
const infraStack = new pulumi.StackReference(`${config.require("infra-stack")}/${env}`);

const runtimeSAEmail = infraStack.getOutput("backendRuntimeSAEmail");
const artifactRegistryName = infraStack.getOutput("artifactRegistryName");
const vpcName = infraStack.getOutput("vpcName");
const publicSubnetName = infraStack.getOutput("publicSubnetName");

// Create CloudRun service
const appImage = pulumi.interpolate`${region}-docker.pkg.dev/${project}/${artifactRegistryName}/afl-tracker-web:${imageTag}`;
const cloudRunServiceName = config.require("cloudRunServiceName");
const service = new gcp.cloudrunv2.Service(cloudRunServiceName, {
  location: region,
  ingress: "INGRESS_TRAFFIC_ALL",
  template: {
    serviceAccount: runtimeSAEmail,
    vpcAccess: {
      networkInterfaces: [{
        network: vpcName,
        subnetwork: publicSubnetName,
      }],
      egress: "PRIVATE_RANGES_ONLY",
    },
    containers: [{
      image: appImage,
      ports: {
        containerPort: 8080
      },
      resources: {
        limits: {
          cpu: "1",
          memory: "512Mi"
        }
      },
    }],
    scaling: {
      minInstanceCount: 1,
      maxInstanceCount: 2,
    },
  },
});

new gcp.cloudrunv2.ServiceIamMember("afl-tracker-web-invoker", {
  name: service.name,
  location: region,
  role: "roles/run.invoker",
  member: "allUsers",
});

export const appUrl = service.uri;