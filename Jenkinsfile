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
                script {
                    def result = sh(script: "curl -f -s -o /dev/null -w '%{http_code}' http://${vps_host}:3000/api/persons", returnStdout: true).trim()
                    if (result == "200") {
                        echo '✅ App répond correctement (HTTP 200)'
                    } else {
                        echo "⚠️ App retourne HTTP ${result}"
                        // Afficher les logs PM2 pour debug
                        sshagent(['vps-ssh-key']) {
                            sh """
                                ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} '
                                    echo "📋 Derniers logs PM2:" &&
                                    pm2 logs backend-app --lines 10 --nostream
                                '
                            """
                        }
                    }
                }
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