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
      readOnlyRootFilesystem: false
    env:
    - name: KUBECONFIG
      value: /kube/config
    volumeMounts:
    - name: kubeconfig-secret
      mountPath: /kube/config
      subPath: kubeconfig

  - name: dind
    image: docker:dind
    securityContext:
      privileged: true
    env:
    - name: DOCKER_TLS_CERTDIR
      value: ""
    volumeMounts:
    - name: docker-config
      mountPath: /etc/docker/daemon.json
      subPath: daemon.json

  volumes:
  - name: docker-config
    configMap:
      name: docker-daemon-config
  - name: kubeconfig-secret
    secret:
      secretName: kubeconfig-secret
'''
        }
    }

    stages {

        stage('Build Docker Image') {
            steps {
                container('dind') {
                    sh '''
                        sleep 15
                        docker build -t sheet-app:latest .
                        docker image ls
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                    withCredentials([string(credentialsId: 'sonar-token-2401025', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            sonar-scanner \
                                -Dsonar.projectKey=GoogleSheetClone \
                                -Dsonar.projectName=GoogleSheetClone \
                                -Dsonar.host.url=http://my-sonarqube-sonarqube.sonarqube.svc.cluster.local:9000 \
                                -Dsonar.login=$SONAR_TOKEN \
                                -Dsonar.sources=.
                        '''
                    }
                }
            }
        }

        stage('Login to Docker Registry') {
            steps {
                container('dind') {
                    sh '''
                        docker --version
                        sleep 10
                        docker login nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085 -u admin -p Changeme@2025
                    '''
                }
            }
        }

        stage('Build - Tag - Push') {
            steps {
                container('dind') {
                    sh '''
                        docker tag sheet-app:latest nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401025-project/sheet-app-2401025:latest
                        docker push nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401025-project/sheet-app-2401025:latest
                        docker image ls
                    '''
                }
            }
        }

        stage('Deploy App') {
            steps {
                container('kubectl') {
                    script {
                        dir('k8s') {
                            sh """
                            # Create namespace if missing
                            kubectl get namespace 2401025 || kubectl create namespace 2401025

                            # Apply deployment
                            kubectl apply -f deployment.yaml -n 2401025
                            
                            # Delete old pods for rollout
                            kubectl delete pod -l app=sheet-app -n 2401025 || true

                            # Restart deployment
                            kubectl scale deployment sheet-app-deployment --replicas=0 -n 2401025
                            sleep 5
                            kubectl scale deployment sheet-app-deployment --replicas=1 -n 2401025
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
                    echo "========== PODS =========="
                    kubectl get pods -n 2401025

                    echo "========== SERVICES =========="
                    kubectl get svc -n 2401025

                    echo "========== INGRESS =========="
                    kubectl get ingress -n 2401025

                    echo "========== POD LOGS =========="
                    kubectl logs -l app=sheet-app -n 2401025 || true
                    """
                }
            }
        }

    }
}
