import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const config = new pulumi.Config();
const gcpConfig = new pulumi.Config("gcp");

const project = gcpConfig.require("project");
const region = gcpConfig.require("region");
const artifactRepoName = config.require("artifactRepoName");
const imageTag = config.get("imageTag") || "latest";
const infraSAEmail = config.requireSecret("infra-sa-email");

const githubRepo = "LuisMendoza2295/afl-tracker-web-ui";

// Get existing infra-sa
const infraSA = gcp.serviceaccount.getAccountOutput({
  accountId: infraSAEmail
});

// Create the WIF
const githubPool = new gcp.iam.WorkloadIdentityPool("github-pool", {
  workloadIdentityPoolId: "wif-github-pool",
  displayName: "WIF Pool for Github actions"
});

// Create OIDC Provider for Github
const providerName = "github-provider";
const githubProvider = new gcp.iam.WorkloadIdentityPoolProvider(providerName, {
  displayName: "WIF Github Provider",
  workloadIdentityPoolId: githubPool.workloadIdentityPoolId,
  workloadIdentityPoolProviderId: providerName,
  attributeMapping: {
    "google.subject": "assertion.sub",
    "attribute.repository": "assertion.repository"
  },
  oidc: {
    issuerUri: "https://token.actions.githubusercontent.com",
  },
});

// Bind WIF Pool Identity to existing infra-sa
new gcp.serviceaccount.IAMMember("wif-sa-token-creator", {
  serviceAccountId: pulumi.interpolate`${infraSA.name}`,
  member: pulumi.interpolate`$principalSet://iam.googleapis.com/${githubPool.name}/attribute.repository/${githubRepo}`,
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
const appImage = pulumi.interpolate`${artifactRegistry.registryUri}/afl-tracker-web:${imageTag}`;
const cloudRunServiceName = config.require("cloudRunServiceName");
const service = new gcp.cloudrunv2.Service(cloudRunServiceName, {
  location: region,
  template: {
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