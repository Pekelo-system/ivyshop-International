import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage } from "./storage/resource";

const backend = defineBackend({
  auth,
  data,
  storage,
});

// Override Cognito User Pool password policy via CDK L1 construct
const { cfnUserPool } = backend.auth.resources.cfnResources;

cfnUserPool.policies = {
  passwordPolicy: {
    minimumLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: false,
    temporaryPasswordValidityDays: 7,
  },
};
