variable "kubeconfig_path" {
  description = "Path to kubeconfig file"
  type        = string
  default     = "~/.kube/config"
}

variable "kube_context" {
  description = "kubectl context to use (docker-desktop, minikube, kind-kind, etc.)"
  type        = string
  default     = "docker-desktop"
}
