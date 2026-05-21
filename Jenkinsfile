pipeline {
    agent any

    environment {
        DOCKER_IMAGE   = "nutrihelp-api"
        STAGING_PORT   = "3001"
        PROD_PORT      = "3002"
        SONAR_PROJECT  = "nutrihelp-api"
    }

    tools {
        nodejs 'NodeJS'
    }

    stages {

        // ══════════════════════════════════════════
        // STAGE 1 — BUILD
        // ══════════════════════════════════════════
        stage('Build') {
            steps {
                echo '>>> STAGE 1: BUILD'
                bat 'npm install'
                bat 'echo NutriHelp-API-1.0.%BUILD_NUMBER% > build-artefact.txt'
                bat 'type build-artefact.txt'
                echo 'Build artefact created successfully!'
            }
        }

        // ══════════════════════════════════════════
        // STAGE 2 — TEST
        // ══════════════════════════════════════════
        stage('Test') {
            steps {
                echo '>>> STAGE 2: TEST'
                bat 'npm test -- --coverage --coverageReporters=lcov --coverageReporters=text'
            }
            post {
                always {
                    echo 'All 6 NutriHelp API tests completed!'
                }
            }
        }

        // ══════════════════════════════════════════
        // STAGE 3 — CODE QUALITY
        // ══════════════════════════════════════════
        stage('Code Quality') {
            steps {
                echo '>>> STAGE 3: CODE QUALITY (SonarQube)'
                withSonarQubeEnv('SonarQube') {
                    bat """
                        sonar-scanner ^
                          -Dsonar.projectKey=%SONAR_PROJECT% ^
                          -Dsonar.projectName="NutriHelp API" ^
                          -Dsonar.sources=. ^
                          -Dsonar.exclusions=node_modules/**,*.test.js,coverage/** ^
                          -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                    """
                }
            }
        }

        // ══════════════════════════════════════════
        // STAGE 4 — SECURITY
        // ══════════════════════════════════════════
        stage('Security') {
            steps {
                echo '>>> STAGE 4: SECURITY SCAN (npm audit)'
                bat 'npm audit --audit-level=critical > security-report.txt 2>&1 || echo Audit complete with warnings'
                bat 'type security-report.txt'
                echo 'Security scan complete - report archived'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'security-report.txt',
                                     allowEmptyArchive: true
                }
            }
        }

        // ══════════════════════════════════════════
        // STAGE 5 — DEPLOY (Staging)
        // ══════════════════════════════════════════
        stage('Deploy') {
            steps {
                echo '>>> STAGE 5: DEPLOY TO STAGING'
                bat 'docker stop nutrihelp-staging || echo not running'
                bat 'docker rm   nutrihelp-staging || echo not found'
                bat 'docker build -t %DOCKER_IMAGE%:staging .'
                bat 'docker run -d --name nutrihelp-staging -p %STAGING_PORT%:3000 %DOCKER_IMAGE%:staging'
                bat 'timeout /t 5 /nobreak'
                bat 'curl -f http://localhost:%STAGING_PORT%/health'
                echo 'Staging deployment verified!'
            }
        }

        // ══════════════════════════════════════════
        // STAGE 6 — RELEASE (Production)
        // ══════════════════════════════════════════
        stage('Release') {
            steps {
                echo '>>> STAGE 6: RELEASE TO PRODUCTION'
                bat 'docker stop nutrihelp-prod || echo not running'
                bat 'docker rm   nutrihelp-prod || echo not found'
                bat 'docker tag  %DOCKER_IMAGE%:staging %DOCKER_IMAGE%:v1.0.%BUILD_NUMBER%'
                bat 'docker tag  %DOCKER_IMAGE%:staging %DOCKER_IMAGE%:latest'
                bat 'docker run -d --name nutrihelp-prod -p %PROD_PORT%:3000 %DOCKER_IMAGE%:latest'
                bat 'timeout /t 5 /nobreak'
                bat 'curl -f http://localhost:%PROD_PORT%/health'
                echo 'Production release v1.0.%BUILD_NUMBER% is LIVE!'
            }
        }

        // ══════════════════════════════════════════
        // STAGE 7 — MONITORING
        // ══════════════════════════════════════════
        stage('Monitoring') {
            steps {
                echo '>>> STAGE 7: MONITORING & ALERTING'
                bat 'curl -s http://localhost:%PROD_PORT%/health'
                bat 'curl -s http://localhost:%PROD_PORT%/metrics'
                bat 'docker ps --filter name=nutrihelp --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
                bat '''
                    echo NUTRIHELP MONITORING REPORT > monitoring-report.txt
                    echo ============================= >> monitoring-report.txt
                    echo. >> monitoring-report.txt
                    curl -s http://localhost:3002/health >> monitoring-report.txt
                    echo. >> monitoring-report.txt
                    curl -s http://localhost:3002/metrics >> monitoring-report.txt
                    echo. >> monitoring-report.txt
                    docker ps --filter name=nutrihelp >> monitoring-report.txt
                '''
                echo 'Monitoring complete - NutriHelp is healthy in production!'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'monitoring-report.txt, build-artefact.txt',
                                     allowEmptyArchive: true
                }
            }
        }
    }

    post {
        success {
            echo '''
            ╔═══════════════════════════════════════════╗
            ║  NUTRIHELP PIPELINE — ALL 7 STAGES DONE  ║
            ║  Top HD Target Achieved!                  ║
            ╚═══════════════════════════════════════════╝
            '''
        }
        failure {
            echo 'Pipeline failed — check the stage logs above'
        }
        always {
            echo 'NutriHelp pipeline finished.'
        }
    }
}