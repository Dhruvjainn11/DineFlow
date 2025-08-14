const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');
const { runComprehensiveTest } = require('./testCafeFlow');

const BASE_URL = 'http://localhost:5000';
const SERVER_PATH = path.join(__dirname, 'server');

// Check if server is already running
async function isServerRunning() {
    try {
        await axios.get(BASE_URL, { timeout: 3000 });
        return true;
    } catch (error) {
        return false;
    }
}

// Start the server
function startServer() {
    return new Promise((resolve, reject) => {
        console.log('🚀 Starting DineFlow server...');
        console.log(`   Server directory: ${SERVER_PATH}`);
        
        // Try to start the server directly with node server.js
        const serverProcess = spawn('node', ['server.js'], {
            cwd: SERVER_PATH,
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: true
        });

        let serverReady = false;
        const timeout = setTimeout(() => {
            if (!serverReady) {
                serverProcess.kill();
                reject(new Error('Server startup timeout'));
            }
        }, 30000); // 30 second timeout

        serverProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(`   Server: ${output.trim()}`);
            
            // Look for common server startup messages
            if (output.includes('Server running') || 
                output.includes('listening') || 
                output.includes('port 5000') ||
                output.includes('server started')) {
                serverReady = true;
                clearTimeout(timeout);
                console.log('✅ Server started successfully!');
                resolve(serverProcess);
            }
        });

        serverProcess.stderr.on('data', (data) => {
            console.error(`   Server Error: ${data.toString().trim()}`);
        });

        serverProcess.on('error', (error) => {
            clearTimeout(timeout);
            reject(error);
        });

        // Give it a few seconds to start even if we don't see the success message
        setTimeout(() => {
            if (!serverReady) {
                console.log('⏳ Server might be starting... checking connectivity...');
                checkServerAndResolve();
            }
        }, 10000);

        async function checkServerAndResolve() {
            for (let i = 0; i < 5; i++) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                if (await isServerRunning()) {
                    serverReady = true;
                    clearTimeout(timeout);
                    console.log('✅ Server is responsive!');
                    resolve(serverProcess);
                    return;
                }
            }
            if (!serverReady) {
                serverProcess.kill();
                reject(new Error('Server failed to become responsive'));
            }
        }
    });
}

async function main() {
    console.log('🔧 DineFlow E2E Test Runner');
    console.log('============================\n');

    let serverProcess = null;
    let serverWasStartedByUs = false;

    try {
        // Check if server is already running
        if (await isServerRunning()) {
            console.log('✅ Server is already running');
        } else {
            console.log('📡 Server not detected, attempting to start...');
            serverProcess = await startServer();
            serverWasStartedByUs = true;
            
            // Wait a bit more for the server to fully initialize
            console.log('⏳ Waiting for server to fully initialize...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Run the tests
        console.log('\n🧪 Running E2E tests...\n');
        await runComprehensiveTest();

    } catch (error) {
        console.error('❌ Failed to run tests:', error.message);
        
        if (error.message.includes('Server startup timeout')) {
            console.log('\n💡 Troubleshooting tips:');
            console.log('   1. Make sure you have all dependencies installed in the server directory');
            console.log('   2. Check if there are any environment variables required (.env file)');
            console.log('   3. Verify the database connection is working');
            console.log('   4. Try starting the server manually: cd server && npm run dev');
        }
        
        process.exit(1);
    } finally {
        // Clean up: kill the server if we started it
        if (serverProcess && serverWasStartedByUs) {
            console.log('\n🧹 Cleaning up: stopping server...');
            serverProcess.kill();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log('\n⚠️  Test interrupted by user');
    process.exit(0);
});

if (require.main === module) {
    main();
}

module.exports = { main, startServer, isServerRunning };
