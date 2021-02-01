#!groovy

def slackChannel = '#als-extension-bot'

def getVersion(alsVersion) {
    if(alsVersion.contains("-SNAPSHOT"))
        "2.1.0-SNAPSHOT"
    else "2.0.${env.BUILD_NUMBER}"
}

pipeline {
    agent {
        dockerfile true
    }
    parameters {
        string(name: 'ALS_VERSION', defaultValue: '3.3.0-SNAPSHOT.30', description: 'ALS node client version')
    }

    environment {
        // ALS_VERSION =  '$jsBuild'
        VERSION = getVersion("$ALS_VERSION")

        NEXUS = credentials('exchange-nexus')
        NEXUSIQ = credentials('nexus-iq')

        NPM_TOKEN = credentials('npm-mulesoft')
        NPM_CONFIG_PRODUCTION = false
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
                    sh 'chmod +x gradlew'
                    sh "./gradlew --info --stacktrace publish"
                }
            }
        }
        stage("Report to Slack") {
            steps {
                script {
                    slackSend color: '#00FF00', channel: "${slackChannel}",
                    message: ":ok_hand: VS Code extension published :ok_hand:\nversion: ${env.VERSION}\nlink: https://repository-master.mulesoft.org/nexus/content/repositories/snapshots/com/mulesoft/als/alsvscode/${env.VERSION}"
                }
            }
        }
    }
}