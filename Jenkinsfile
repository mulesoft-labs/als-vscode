#!groovy
pipeline {
    agent {
        dockerfile true
    }

    environment {
        NEXUS = credentials('exchange-nexus')
        NEXUSIQ = credentials('nexus-iq')
        NPM_TOKEN = credentials('npm-mulesoft')
        NPM_CONFIG_PRODUCTION = false
        VERSION = "2.0.${env.BUILD_NUMBER}" // check if ALS version is snapshot, and adjust accordingly?
        NODE_MODULES_CACHE = false
        NODE_OPTIONS = '--max_old_space_size=4096'
    }
    stages {
        stage('Install') {
            steps {
                script {
                    sh 'bash add_registry.sh'
                }
            }
        }
        stage('Package') {
            steps {
                script {
                    sh 'vsce package'
                }
            }
        }
        stage('Upload') {
            steps {
                script {
                    sh 'chmod +x gradlew'
                    sh "./gradlew nexusIq"
                }
            }
        }
    }
}