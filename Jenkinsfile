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
        stage('Install') {
            runStage('Install', {
                sh 'CI=true bash run.sh npm install'
            })
        }
        stage('Compile modules') {
            runStage('Compile modules', {
                sh 'CI=true bash run.sh npm run compile'
            })
        }
        stage('Package') {
            runStage('Package', {
                sh 'CI=true bash run.sh vsce package'
            })
        }
        stage('Upload') {
            steps {
                sh 'chmod +x gradlew'
                sh "./gradlew nexusIq"
            }
        }
    }
}