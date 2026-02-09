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

const runtimeSAEmail = infraStack.getOutput("gcpBackendRuntimeSAEmail");
const artifactRegistryName = infraStack.getOutput("gcpArtifactRegistryName");
const vpcName = infraStack.getOutput("gcpVpcName");
const publicSubnetName = infraStack.getOutput("gcpPublicSubnetName");
const hostingUrl = infraStack.getOutput("gcpFirebaseHostingUrl");

// Create CloudRun service
const appImage = pulumi.interpolate`${region}-docker.pkg.dev/${project}/${artifactRegistryName}/afl-tracker-web:${imageTag}`;
const cloudRunServiceName = config.require("cloudRunServiceName");
const service = new gcp.cloudrunv2.Service(cloudRunServiceName, {
  name: cloudRunServiceName,
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
      envs: [
        {
          name: "VITE_API_ORIGIN",
          value: hostingUrl,
        }
      ],
      resources: {
        limits: {
          cpu: "1",
          memory: "512Mi"
        }
      },
    }],
    scaling: {
      minInstanceCount: 0,
      maxInstanceCount: 1,
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
export const firebaseHostingUrl = hostingUrl;