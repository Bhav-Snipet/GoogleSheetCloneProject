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
