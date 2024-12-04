import * as React from 'react';
import './DockerControl.css';

const DockerControl = () => {
    const [status, setStatus] = React.useState('');
    const [dockerRunning, setDockerRunning] = React.useState(false);


    const isDockerRunning = async () => {
        try {
            const result = await window.electron.ipcRenderer.invoke('check-docker-process');
            return result.success;
        } catch {
            return false;
        }
    };

    const startDockerApp = async () => {
        try {
            await window.electron.ipcRenderer.invoke('start-docker-app');
            alert('Docker app started successfully.');
            setDockerRunning(true);
        } catch (error) {
            alert(`Error starting Docker app: ${error.message}`);
        }
    };

    React.useEffect(() => {
        const checkDockerRunning = async () => {
            const running = await isDockerRunning();
            setDockerRunning(running);
        };

        const fetchDockerStatus = async () => {
            await checkDockerRunning();
            const result = await window.electron.ipcRenderer.invoke('status-container', 'phyrexamp-phpmyadmin');
            if (result.success) {
                setStatus(result.message);
            } else {
                setStatus(`Error fetching Docker status: ${result.error}`);
            }

        };
        fetchDockerStatus();
    }, []);
    const executeCommand = async (command) => {
        const dockerRunning = await isDockerRunning();
        if (!dockerRunning) {
            const startDocker = window.confirm('Docker is not running. Would you like to start it?');
            if (startDocker) {
                await startDockerApp();
            } else {
                return;
            }
        }
        const result = await window.electron.ipcRenderer.invoke(command);
        if (result.success) {
            alert(result.message);
            if (command === 'status-container') {
                setStatus(result.message);
            }
        } else {
            alert(`Error executing ${command}: ${result.error}`);
        }
    };

    return (
        <div className="docker-control">
            <button onClick={() => executeCommand('start-container')}>Start</button>
            <button onClick={() => executeCommand('stop-container')}>Stop</button>
            <button onClick={() => executeCommand('restart-container')}>Restart</button>
            <button onClick={() => executeCommand('status-container')}>Status</button>
            <p>Docker Daemon: {dockerRunning ? 'Running' : 'Not Running'}</p>
            {status && <p>Container Status: {status}</p>}
        </div>
    );
};

export default DockerControl;