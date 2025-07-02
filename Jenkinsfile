pipeline {
  agent any

  tools {
    nodejs 'NodeJS'
  }

  stages {
    stage('Pull code') {
      steps {
        // Clone automatique si pas déjà dans Jenkins
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
          sh 'npm start'
        }
      }
    }

    stage('Restart with pm2') {
      steps {
        dir('api') {
          // Si déjà démarré, restart. Sinon start.
          sh 'pm2 restart backend-app || pm2 start dist/src/main.js --name backend-app'
        }
      }
    }
  }
}