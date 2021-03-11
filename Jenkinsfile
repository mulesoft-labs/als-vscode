#!groovy

def slackChannel = '#als-extension-bot'

def getVersion(alsVersion) {
    if(alsVersion.contains("-SNAPSHOT"))
        "2.1.0-SNAPSHOT"
    else "2.0.${env.BUILD_NUMBER}"
}

def getNexusFullUri(version){
    if(version.contains("-SNAPSHOT"))
        "https://repository-master.mulesoft.org/nexus/content/repositories/snapshots/com/mulesoft/als/alsvscode/${version}"
    else
        "https://repository-master.mulesoft.org/nexus/content/repositories/releases/com/mulesoft/als/alsvscode/${version}"

}
def getNexusUri(version){
    if(version.contains("-SNAPSHOT"))
        "https://repository-master.mulesoft.org/nexus/content/repositories/snapshots"
    else
        "https://repository-master.mulesoft.org/nexus/content/repositories/releases"

}
pipeline {
    agent {
        dockerfile true
    }
    parameters {
        string(name: 'ALS_VERSION', defaultValue: '3.3.0-SNAPSHOT.222', description: 'ALS node client version')
    }

    environment {
        // ALS_VERSION =  '$jsBuild'
        VERSION = getVersion("$ALS_VERSION")

        NEXUS = credentials('exchange-nexus')
        NEXUSIQ = credentials('nexus-iq')
        NEXUSURL = getNexusUri("$VERSION")
        NEXUSFULLURL = getNexusFullUri("$VERSION")

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
                    def exitCode = 1
                    exitCode = sh script:"bash install_compile.sh", returnStatus:true
                    if(exitCode != 0) {
                        sh "echo ${exitCode}"
                        fail "Failed Install & Compile"
                    }
                }
            }
        }
        stage('Test') {
            steps {
                script {
                    def exitCode = 1
                    sh 'Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &'
                    sh 'echo ">>> Started xvfb"'
                    sh "sleep 3" // Give xvfb time to startup

                    exitCode = sh script:"DISPLAY=:99 npm test", returnStatus:true
                    if(exitCode != 0) {
                        sh "echo ${exitCode}"
                        fail "Failed Install & Compile"
                    }
                    
                }
            }
        }
        stage('Package') {
            when {
                anyOf {
                    branch 'publish/*'
                    branch 'master'
                }
            }
            steps {
                script {
                    sh 'vsce package'
                }
            }
        }
        stage('Upload') {
            when {
                anyOf {
                    branch 'publish/*'
                    branch 'master'
                }
            }
            steps {
                script {
                    sh 'chmod +x gradlew'
                    sh "./gradlew --info --stacktrace publish"
                }
            }
        }
        stage("Report to Slack") {
            when {
                anyOf {
                    branch 'publish/*'
                    branch 'master'
                }
            }
            steps {
                script {
                    slackSend color: '#00FF00', channel: "${slackChannel}", message: ":ok_hand: VS Code extension published :ok_hand:\nversion: ${env.VERSION}\nALS version: ${ALS_VERSION}\nlink: ${NEXUSFULLURL}"
                }
            }
        }
    }
}