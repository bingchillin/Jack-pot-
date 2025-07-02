pipeline {
  agent any

  environment {
    NODE_ENV = 'production'
  }

  stages {
    stage('Check Node') {
      steps {
        sh 'node -v'
        sh 'npm -v'
      }
    }

    stage('Pull code') {
      steps {
        git url: 'https://github.com/bingchillin/Jack-pot-.git', branch: 'main'
      }
    }

    stage('Install dependencies') {
      steps {
        dir('api') {
          sh 'npm install'
        }
      }
    }

    stage('Build backend') {
      steps {
        dir('api') {
          sh './node_modules/.bin/nest build'
          // Ou si tu préfères npm run build avec PATH modifié :
          // sh '''
          //   export PATH=$PWD/node_modules/.bin:$PATH
          //   npm run build
          // '''
        }
      }
    }

    stage('Restart with pm2') {
      steps {
        dir('api') {
          sh '''
            pm2 describe backend-app || pm2 start dist/src/main.js --name backend-app
            pm2 restart backend-app
          '''
        }
      }
    }
  }
}
