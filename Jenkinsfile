pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: sonar-scanner
    image: sonarsource/sonar-scanner-cli
    command: ["cat"]
    tty: true

  - name: kubectl
    image: bitnami/kubectl:latest
    command: ["cat"]
    tty: true
    securityContext:
      runAsUser: 0
    env:
    - name: KUBECONFIG
      value: /kube/config
    volumeMounts:
    - name: kubeconfig-secret
      mountPath: /kube/config
      subPath: kubeconfig

  volumes:
    - name: kubeconfig-secret
      secret:
        secretName: kubeconfig-secret
'''
        }
    }

    stages {

        stage('Checkout Source Code from Git') {
            steps {
                git branch: 'main', url: 'https://github.com/Bhav-Snipet/GoogleSheetCloneProject.git'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                    withCredentials([string(credentialsId: 'sonar-token-2401025', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            sonar-scanner \
                                -Dsonar.projectKey=googlesheetclone \
                                -Dsonar.projectName=googlesheetclone \
                                -Dsonar.sources=.
                        '''
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    script {
                        dir('k8s') {
                            sh """
                            kubectl get namespace 2401025 || kubectl create namespace 2401025

                            kubectl apply -f deployment.yaml -n 2401025
                            kubectl apply -f service.yaml -n 2401025
                            kubectl apply -f ingress.yaml -n 2401025

                            kubectl rollout restart deployment googlesheetclone-deployment -n 2401025
                            """
                        }
                    }
                }
            }
        }

        stage('Debug Kubernetes State') {
            steps {
                container('kubectl') {
                    sh """
                    kubectl get pods -n 2401025
                    kubectl get svc -n 2401025
                    kubectl get ingress -n 2401025
                    kubectl logs -l app=googlesheetclone -n 2401025 --tail=50 || true
                    """
                }
            }
        }
    }
}
