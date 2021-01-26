#!groovy
pipeline {
    agent {
        dockerfile true
    }

    environment {
        NEXUS = credentials('exchange-nexus')
        NEXUSIQ = credentials('nexus-iq')
        NPM_TOKEN = credentials('npm-mulesoft')
        NPM_CONFIG_PRODUCTION = true
        NODE_ENV = 'dev'
        VERSION = "${env.BUILD_NUMBER}"
        NODE_MODULES_CACHE = false
        NODE_OPTIONS = '--max_old_space_size=4096'
    }
    stages {
        stage('NPM Registry') {
            steps {
                script {
                    sh bash add_registry.sh
                }
            }
        }
    stages {
        stage('Install') {
            steps {
                script {
                    sh 'npm install'
                }
            }
        }
        stage('Compile modules') {
            steps {
                script {
                    sh 'npm run compile'
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