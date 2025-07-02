pipeline {
    agent any
    
    environment {
        VPS_HOST = '51.222.110.241'
        VPS_USER = 'debian'
        PROJECT_PATH = '/var/www/html/api_jackpot/api_topkcaj_A/Jack-pot-/api'
    }
    
    stages {
        stage('Pull & Build') {
            steps {
                echo '🚀 Déploiement en cours...'
                sshagent(['vps-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} '
                            cd ${PROJECT_PATH} &&
                            echo "📥 Git pull..." &&
                            git pull origin main &&
                            echo "📦 npm install..." &&
                            npm install &&
                            echo "🔨 Build..." &&
                            npm run build &&
                            echo "🔄 PM2 reload..." &&
                            pm2 reload all &&
                            echo "📊 PM2 status:" &&
                            pm2 status
                        '
                    """
                }
            }
        }
        
        stage('Verify') {
            steps {
                echo '🏥 Vérification...'
                sleep(3)
                sh "curl -f http://${VPS_HOST}:3000 || echo '⚠️ App pas accessible'"
            }
        }
    }
    
    post {
        success {
            echo '✅ Déploiement réussi ! 🎉'
        }
        failure {
            echo '❌ Merde, ça a foiré 💥'
        }
    }
}