import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const config = new pulumi.Config();
const gcpConfig = new pulumi.Config("gcp");

const project = gcpConfig.require("project");
const region = gcpConfig.require("region");

const artifactRepoName = config.require("artifactRepoName");
const imageTag = config.get("imageTag") || "latest";
const infraSAEmail = config.requireSecret("infra-sa-email");
const poolId = config.require("workload-identity-pool-id");
const providerId = config.require("workload-identity-provider-id");

const githubRepo = "LuisMendoza2295/afl-tracker-web-ui";

// Get existing infra-sa
const infraSA = gcp.serviceaccount.getAccountOutput({
  accountId: infraSAEmail
});

const githubPool = gcp.iam.getWorkloadIdentityPoolOutput({
  workloadIdentityPoolId: poolId,
});

const githubProvider = gcp.iam.getWorkloadIdentityPoolProviderOutput({
  workloadIdentityPoolId: githubPool.workloadIdentityPoolId,
  workloadIdentityPoolProviderId: providerId,
});

const wifActor = new gcp.serviceaccount.IAMMember("wif-sa-actor", {
  serviceAccountId: infraSA.name,
  member: pulumi.interpolate`principalSet://iam.googleapis.com/${githubPool.name}/attribute.repository/${githubRepo}`,
  role: "roles/iam.serviceAccountUser"
});

// Bind WIF Pool Identity to existing infra-sa
const wifTokenCreator = new gcp.serviceaccount.IAMMember("wif-sa-token-creator", {
  serviceAccountId: infraSA.name,
  member: pulumi.interpolate`principalSet://iam.googleapis.com/${githubPool.name}/attribute.repository/${githubRepo}`,
  role: "roles/iam.serviceAccountTokenCreator"
})

// Create Artifact Registry
const artifactRegistry = new gcp.artifactregistry.Repository(artifactRepoName, {
  repositoryId: artifactRepoName,
  description: "Artifact repository for Images",
  format: "DOCKER",
  project: project,
  location: region,
}, { protect: true });

// Create CloudRun service
// const appImage = pulumi.interpolate`${artifactRegistry.registryUri}/afl-tracker-web:${imageTag}`;
const appImage = pulumi.interpolate`${region}-docker.pkg.dev/${project}/${artifactRegistry.repositoryId}/afl-tracker-web:${imageTag}`;
const cloudRunServiceName = config.require("cloudRunServiceName");
const service = new gcp.cloudrunv2.Service(cloudRunServiceName, {
  location: region,
  template: {
    serviceAccount: infraSA.email,
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
},
{ 
  dependsOn: [wifActor, wifTokenCreator], 
});

new gcp.cloudrunv2.ServiceIamMember("afl-tracker-web-invoker", {
  name: service.name,
  location: region,
  role: "roles/run.invoker",
  member: "allUsers",
});

export const appUrl = service.uri;