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
                        docker build -t googlesheetclone-app:latest .
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
                                -Dsonar.projectKey=googlesheetclone \
                                -Dsonar.projectName=googlesheetclone \
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
                        docker login nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085 \
                        -u admin -p Changeme@2025
                    '''
                }
            }
        }

        stage('Build - Tag - Push') {
            steps {
                container('dind') {
                    sh '''
                        docker tag googlesheetclone-app:latest \
                        nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401025-project/googlesheetclone-app-2401025:latest
                        
                        docker push nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401025-project/googlesheetclone-app-2401025:latest
                    '''
                }
            }
        }

        stage('Create ImagePull Secret') {
            steps {
                container('kubectl') {
                    sh """
                    kubectl create secret docker-registry nexus-registry-secret \
                    --docker-server=nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085 \
                    --docker-username=admin \
                    --docker-password=Changeme@2025 \
                    --namespace=2401025 \
                    || echo "Secret already exists, continuing..."
                    """
                }
            }
        }


        stage('Deploy App') {
            steps {
                container('kubectl') {
                    script {
                        dir('k8s') {
                            sh """
                            kubectl get namespace 2401025 || kubectl create namespace 2401025

                            kubectl apply -f deployment.yaml -n 2401025
                            kubectl apply -f service.yaml -n 2401025
                            kubectl apply -f ingress.yaml -n 2401025

                            kubectl delete pod -l app=googlesheetclone -n 2401025 || true

                            kubectl scale deployment googlesheetclone-deployment --replicas=0 -n 2401025
                            sleep 5
                            kubectl scale deployment googlesheetclone-deployment --replicas=1 -n 2401025
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
                    kubectl logs -l app=googlesheetclone -n 2401025 || true
                    """
                }
            }
        }

        stage('Check Secrets') {
            steps {
                container('kubectl') {
                    sh "kubectl get secrets -n 2401025"
                }
            }
        }

        stage('Test Image Pull') {
            steps {
                container('kubectl') {
                    sh """
                        kubectl run test-pull --image=nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401025-project/googlesheetclone-app-2401025:latest \
                        --namespace=2401025 --restart=Never --image-pull-policy=Always --dry-run=client -o yaml
                    """
                }
            }
        }
        
        stage('Verify Secrets') {
            steps {
                container('kubectl') {
                sh 'kubectl get secret -n 2401025'
                }
            }
        }

        stage('Describe Pods') {
            steps {
                container('kubectl') {
                    sh 'kubectl describe pods -n 2401025 | sed -n "/Events/,$p"'
                }
            }
        }




    }
}
