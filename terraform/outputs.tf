output "deployer_service_account" {
  description = "ServiceAccount name for GitHub Actions"
  value       = kubernetes_service_account.github_deployer.metadata[0].name
}

output "get_kubeconfig_command" {
  description = "Run this after terraform apply to generate the KUBE_CONFIG secret for GitHub"
  value       = <<-EOT
    # 1. Get the token
    TOKEN=$(kubectl get secret github-deployer-token -n mathquiz -o jsonpath='{.data.token}' | base64 -d)

    # 2. Get cluster info
    SERVER=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')
    CA=$(kubectl get secret github-deployer-token -n mathquiz -o jsonpath='{.data.ca\.crt}')

    # 3. Build a minimal kubeconfig and base64-encode it for GitHub secret
    cat <<EOF | base64 | tr -d '\n'
    apiVersion: v1
    kind: Config
    clusters:
    - cluster:
        certificate-authority-data: $CA
        server: $SERVER
      name: mathquiz-cluster
    contexts:
    - context:
        cluster: mathquiz-cluster
        namespace: mathquiz
        user: github-actions-deployer
      name: mathquiz
    current-context: mathquiz
    users:
    - name: github-actions-deployer
      user:
        token: $TOKEN
    EOF
    # → Paste the output as the KUBE_CONFIG secret in GitHub → Settings → Secrets
  EOT
}
