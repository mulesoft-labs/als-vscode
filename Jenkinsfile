#!groovy
pipeline {
    agent {
        dockerfile true
    }

    environment {
        NEXUS = credentials('exchange-nexus')
        NEXUSIQ = credentials('nexus-iq')
        NPM_TOKEN = credentials('npm-mulesoft')
        ALS_VERSION = "3.3.0-SNAPSHOT.30" // set with received parameter when available
        NPM_CONFIG_PRODUCTION = false
        VERSION = "2.0.${env.BUILD_NUMBER}" // check if ALS version is snapshot, and adjust accordingly?
        NODE_MODULES_CACHE = false
        NODE_OPTIONS = '--max_old_space_size=4096'
    }
    stages {
        stage('Set versions') {
            steps {
                script {
                    sh 'bash set_versions.sh'
                }
            }
        }
        stage('Install & Compile') {
            steps {
                script {
                    sh 'bash install_compile.sh'
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
                    sh "ls -larth ."
                    sh "ls -larth ./build/distributions"
                    sh 'chmod +x gradlew'
                    sh "./gradlew --info --stacktrace publish"
                    sh "ls -larth ."
                }
            }
        }
    }
}