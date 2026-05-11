terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.27"
    }
  }
}

provider "kubernetes" {
  config_path    = var.kubeconfig_path
  config_context = var.kube_context
}

# ── Namespace ─────────────────────────────────────────────────────────────────
resource "kubernetes_namespace" "mathquiz" {
  metadata {
    name = "mathquiz"
  }
}

# ── ServiceAccount for GitHub Actions deployer ────────────────────────────────
resource "kubernetes_service_account" "github_deployer" {
  metadata {
    name      = "github-actions-deployer"
    namespace = kubernetes_namespace.mathquiz.metadata[0].name
  }
}

# ── Role: minimal deploy permissions (no cluster-admin) ──────────────────────
resource "kubernetes_role" "deployer" {
  metadata {
    name      = "deployer"
    namespace = kubernetes_namespace.mathquiz.metadata[0].name
  }

  rule {
    api_groups = ["apps"]
    resources  = ["deployments", "statefulsets"]
    verbs      = ["get", "list", "watch", "create", "update", "patch"]
  }

  rule {
    api_groups = [""]
    resources  = ["services", "configmaps", "persistentvolumeclaims", "pods"]
    verbs      = ["get", "list", "watch", "create", "update", "patch"]
  }

  rule {
    api_groups = [""]
    resources  = ["pods/log"]
    verbs      = ["get", "list"]
  }

  rule {
    api_groups = ["networking.k8s.io"]
    resources  = ["ingresses"]
    verbs      = ["get", "list", "watch", "create", "update", "patch"]
  }
}

# ── RoleBinding: attach role to ServiceAccount ───────────────────────────────
resource "kubernetes_role_binding" "deployer" {
  metadata {
    name      = "deployer-binding"
    namespace = kubernetes_namespace.mathquiz.metadata[0].name
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = kubernetes_role.deployer.metadata[0].name
  }

  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.github_deployer.metadata[0].name
    namespace = kubernetes_namespace.mathquiz.metadata[0].name
  }
}

# ── Long-lived token for the deploy ServiceAccount (K8s 1.24+) ───────────────
resource "kubernetes_secret" "deployer_token" {
  metadata {
    name      = "github-deployer-token"
    namespace = kubernetes_namespace.mathquiz.metadata[0].name
    annotations = {
      "kubernetes.io/service-account.name" = kubernetes_service_account.github_deployer.metadata[0].name
    }
  }
  type = "kubernetes.io/service-account-token"
}
