#!/usr/bin/env bash
# cloud-deploy.sh — Deploy eoAPI to AWS (CDK) or Kubernetes (Helm).
# Choose one section below. See linked repos for full configuration options.

set -euo pipefail

# --- AWS CDK ---
# Requires: AWS CLI configured, Node.js, CDK bootstrapped in target account/region.
# Deploys to Lambda + RDS Aurora Serverless + CloudFront.
# Docs: https://github.com/developmentseed/eoapi-cdk

git clone https://github.com/developmentseed/eoapi-cdk
cd eoapi-cdk
npm install

# Bootstrap CDK (once per account/region)
npx cdk bootstrap aws://ACCOUNT_ID/REGION

# Deploy — review the stack config in the repo before running
npx cdk deploy

# --- Kubernetes Helm ---
# Docs: https://github.com/developmentseed/eoapi-k8s

# git clone https://github.com/developmentseed/eoapi-k8s
# cd eoapi-k8s
# helm install eoapi ./helm/eoapi -f values.yaml
