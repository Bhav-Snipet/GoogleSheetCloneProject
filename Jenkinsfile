pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:

    - name: dind
      image: docker:27.0.3-dind
      securityContext:
        privileged: true
      env:
        - name: DOCKER_TLS_CERTDIR
          value: ""
        - name: DOCKER_HOST
          value: "tcp://127.0.0.1:2375"
      command:
        - dockerd-entrypoint.sh
      args:
        - "--host=tcp://0.0.0.0:2375"
        - "--host=unix:///var/run/docker.sock"
        - "--tls=false"
        - "--tlsverify=false"
        - "--storage-driver=overlay2"
        - "--insecure-registry=nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"

    - name: kubectl
      image: bitnami/kubectl:latest
      command: ["cat"]
      tty: true
'''
        }
    }

    environment {
        IMAGE_LOCAL = "googlesheetclone:latest"
        REGISTRY = "nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"
        REPO = "2401025-project"
        IMAGE_REMOTE = "${REGISTRY}/${REPO}/googlesheetclone:latest"
        K8S_NAMESPACE = "2401025"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'master',
                    url: 'https://github.com/Bhav-Snipet/GoogleSheetCloneProject.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                container('dind') {
                    sh '''
                        sleep 10
                        docker build -t $IMAGE_LOCAL .
                        docker image ls
                    '''
                }
            }
        }

        stage('Login to Nexus Registry') {
            steps {
                container('dind') {
                    sh '''
                        docker login $REGISTRY -u admin -p Changeme@2025
                    '''
                }
            }
        }

        stage('Tag & Push Image') {
            steps {
                container('dind') {
                    sh '''
                        docker tag $IMAGE_LOCAL $IMAGE_REMOTE
                        docker push $IMAGE_REMOTE
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    sh '''
                    kubectl get namespace $K8S_NAMESPACE || kubectl create namespace $K8S_NAMESPACE
                    kubectl apply -f k8s/deployment.yaml -n $K8S_NAMESPACE
                    kubectl apply -f k8s/service.yaml -n $K8S_NAMESPACE
                    kubectl apply -f k8s/ingress.yaml -n $K8S_NAMESPACE

                    kubectl delete pod -l app=googlesheetclone -n $K8S_NAMESPACE || true
                    '''
                }
            }
        }

        stage('Debug Kubernetes') {
            steps {
                container('kubectl') {
                    sh '''
                        kubectl get pods -n $K8S_NAMESPACE
                        kubectl get svc -n $K8S_NAMESPACE
                        kubectl get ingress -n $K8S_NAMESPACE
                    '''
                }
            }
        }

    }
}
