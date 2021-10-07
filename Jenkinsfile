#!groovy

def slackChannel = '#als-extension-bot'

def getVersion(alsVersion) {
    if(alsVersion.contains("-SNAPSHOT"))
        "0.4.0-SNAPSHOT"
    else "0.3.${env.BUILD_NUMBER}"
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
        string(name: 'ALS_VERSION', defaultValue: '4.2.0-SNAPSHOT.357', description: 'ALS node client version')
    }

    environment {
        VERSION = getVersion("$ALS_VERSION")
        
        ALS_VERSION = "$ALS_VERSION"    // Internal parameter to env variable
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
                        error("Failed Install & Compile")
                    }
                }
            }
        }
        stage('Test') {
            steps {
                script {
                    def exitCode = 1
                    exitCode = sh script:"bash test.sh", returnStatus:true
                    if(exitCode != 0) {
                        sh "echo ${exitCode}"
                        error("Failed tests")
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

def runWithXvfb(String command) {
   def status = sh script:"xvfb-run ${command}", returnStatus:true
   return status
}