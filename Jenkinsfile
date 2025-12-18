pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: dind
    image: docker:dind
    args:
      - "--storage-driver=overlay2"
      - "--insecure-registry=nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"
    securityContext:
      privileged: true
    env:
      - name: DOCKER_TLS_CERTDIR
        value: ""

  - name: kubectl
    image: bitnami/kubectl:latest
    command: ["cat"]
    tty: true
'''
        }
    }

    environment {
        APP_NAME      = "googlesheetclone"
        IMAGE_TAG     = "v1"
        REGISTRY_URL  = "nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"
        REGISTRY_REPO = "2401025-googlesheetclone"
        IMAGE_NAME    = "${REGISTRY_URL}/${REGISTRY_REPO}/${APP_NAME}:${IMAGE_TAG}"
        K8S_NAMESPACE = "2401025-googlesheetclone"
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
                        dockerd-entrypoint.sh &
                        sleep 20
                        docker info
                        docker build -t $IMAGE_NAME .
                        docker images
                    '''
                }
            }
        }

        stage('Push Image to Nexus') {
            steps {
                container('dind') {
                    withCredentials([usernamePassword(
                        credentialsId: 'nexus-credentials',
                        usernameVariable: 'NEXUS_USER',
                        passwordVariable: 'NEXUS_PASS'
                    )]) {
                        sh '''
                            docker login http://nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085 \
                                -u $NEXUS_USER -p $NEXUS_PASS
                            docker push $IMAGE_NAME
                        '''
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    sh '''
                        kubectl apply -n $K8S_NAMESPACE -f k8s/
                        kubectl rollout status deployment/googlesheetclone-deployment -n $K8S_NAMESPACE
                    '''
                }
            }
        }

    } // end stages
} // end pipeline
