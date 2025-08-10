// Remote Camera Control System - Main Application
class RemoteCameraControlSystem {
    constructor() {
        this.currentMode = 'select';
        this.peerConnection = null;
        this.dataChannel = null;
        this.localStream = null;
        this.mediaRecorder = null;
        this.isRecording = false;
        this.recordingStartTime = null;
        this.recordingDuration = 0;
        this.pairingCode = null;
        this.isConnected = false;
        this.recordedFiles = [];
        
        // Device state
        this.deviceState = {
            batteryLevel: 85,
            batteryCharging: false,
            temperature: 72,
            zoom: 1.0,
            quality: '1080p',
            frameRate: 30,
            cameraFacing: 'environment',
            flashOn: false,
            gridVisible: false,
            storageAvailable: '30GB',
            signalStrength: 85
        };

        // WebRTC configuration
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };

        // Timers
        this.timers = {
            recording: null,
            telemetry: null,
            heartbeat: null,
            battery: null
        };

        this.init();
    }

    async init() {
        console.log('Initializing Remote Camera Control System...');
        this.cacheElements();
        this.bindEvents();
        this.updateTime();
        this.startSystemMonitoring();
        
        // Initialize with mode selection
        this.showModeSelection();
        
        console.log('Remote Camera Control System initialized');
    }

    cacheElements() {
        console.log('Caching DOM elements...');
        
        // Mode selection elements
        this.elements = {
            modeSelection: document.getElementById('modeSelection'),
            remoteControlMode: document.getElementById('remoteControlMode'),
            cameraDeviceMode: document.getElementById('cameraDeviceMode'),
            
            // Remote control elements
            remoteControlApp: document.getElementById('remoteControlApp'),
            backFromRemote: document.getElementById('backFromRemote'),
            remoteConnectionStatus: document.getElementById('remoteConnectionStatus'),
            remoteConnectionText: document.getElementById('remoteConnectionText'),
            connectionSection: document.getElementById('connectionSection'),
            controlDashboard: document.getElementById('controlDashboard'),
            
            // Connection elements
            scanQRBtn: document.getElementById('scanQRBtn'),
            qrScanner: document.getElementById('qrScanner'),
            scannerVideo: document.getElementById('scannerVideo'),
            closeScannerBtn: document.getElementById('closeScannerBtn'),
            connectionCodeInput: document.getElementById('connectionCodeInput'),
            connectCodeBtn: document.getElementById('connectCodeBtn'),
            
            // Remote control dashboard
            remoteBatteryLevel: document.getElementById('remoteBatteryLevel'),
            remoteBatteryFill: document.getElementById('remoteBatteryFill'),
            remoteTemperature: document.getElementById('remoteTemperature'),
            remoteStorage: document.getElementById('remoteStorage'),
            remoteSignal: document.getElementById('remoteSignal'),
            recordingStatusText: document.getElementById('recordingStatusText'),
            remoteRecDot: document.getElementById('remoteRecDot'),
            remoteRecordingDuration: document.getElementById('remoteRecordingDuration'),
            remoteRecordButton: document.getElementById('remoteRecordButton'),
            stopRecordingBtn: document.getElementById('stopRecordingBtn'),
            pauseRecordingBtn: document.getElementById('pauseRecordingBtn'),
            
            // Remote settings
            remoteQualitySelect: document.getElementById('remoteQualitySelect'),
            remoteFramerateSelect: document.getElementById('remoteFramerateSelect'),
            remoteZoomOut: document.getElementById('remoteZoomOut'),
            remoteZoomIn: document.getElementById('remoteZoomIn'),
            remoteZoomValue: document.getElementById('remoteZoomValue'),
            remoteFlipCamera: document.getElementById('remoteFlipCamera'),
            
            // Remote actions
            remoteToggleFlash: document.getElementById('remoteToggleFlash'),
            remoteToggleGrid: document.getElementById('remoteToggleGrid'),
            remoteViewGallery: document.getElementById('remoteViewGallery'),
            remoteDisconnect: document.getElementById('remoteDisconnect'),
            
            // Camera device elements
            cameraDeviceApp: document.getElementById('cameraDeviceApp'),
            backFromCamera: document.getElementById('backFromCamera'),
            currentTime: document.getElementById('currentTime'),
            cameraConnectionStatus: document.getElementById('cameraConnectionStatus'),
            cameraConnectionText: document.getElementById('cameraConnectionText'),
            cameraBatteryFill: document.getElementById('cameraBatteryFill'),
            cameraBatteryText: document.getElementById('cameraBatteryText'),
            cameraTemperatureText: document.getElementById('cameraTemperatureText'),
            
            // Pairing elements
            pairingSection: document.getElementById('pairingSection'),
            pairingCodeDisplay: document.getElementById('pairingCodeDisplay'),
            qrCodeDisplay: document.getElementById('qrCodeDisplay'),
            refreshPairingBtn: document.getElementById('refreshPairingBtn'),
            
            // Camera elements
            cameraContainer: document.getElementById('cameraContainer'),
            videoPreview: document.getElementById('videoPreview'),
            cameraRecordingIndicator: document.getElementById('cameraRecordingIndicator'),
            cameraRecordingDuration: document.getElementById('cameraRecordingDuration'),
            cameraGrid: document.getElementById('cameraGrid'),
            cameraRemoteIndicator: document.getElementById('cameraRemoteIndicator'),
            cameraErrorMessage: document.getElementById('cameraErrorMessage'),
            cameraRetryBtn: document.getElementById('cameraRetryBtn'),
            
            // Camera controls
            cameraControls: document.getElementById('cameraControls'),
            cameraZoomOut: document.getElementById('cameraZoomOut'),
            cameraZoomIn: document.getElementById('cameraZoomIn'),
            cameraZoomValue: document.getElementById('cameraZoomValue'),
            cameraRecordButton: document.getElementById('cameraRecordButton'),
            cameraFlipButton: document.getElementById('cameraFlipButton'),
            cameraFlashBtn: document.getElementById('cameraFlashBtn'),
            cameraGridBtn: document.getElementById('cameraGridBtn'),
            cameraGalleryBtn: document.getElementById('cameraGalleryBtn'),
            cameraFileCount: document.getElementById('cameraFileCount'),
            
            // Notifications
            notificationContainer: document.getElementById('notificationContainer')
        };
        
        // Log missing elements
        Object.keys(this.elements).forEach(key => {
            if (!this.elements[key]) {
                console.warn(`Element not found: ${key}`);
            }
        });
    }

    bindEvents() {
        console.log('Binding events...');
        
        // Mode selection
        if (this.elements.remoteControlMode) {
            this.elements.remoteControlMode.addEventListener('click', () => {
                console.log('Remote Control Mode clicked');
                this.enterRemoteControlMode();
            });
        }
        
        if (this.elements.cameraDeviceMode) {
            this.elements.cameraDeviceMode.addEventListener('click', () => {
                console.log('Camera Device Mode clicked');
                this.enterCameraDeviceMode();
            });
        }
        
        // Back buttons
        if (this.elements.backFromRemote) {
            this.elements.backFromRemote.addEventListener('click', () => {
                console.log('Back from remote clicked');
                this.showModeSelection();
            });
        }
        
        if (this.elements.backFromCamera) {
            this.elements.backFromCamera.addEventListener('click', () => {
                console.log('Back from camera clicked');
                this.showModeSelection();
            });
        }
        
        // Remote control events
        if (this.elements.scanQRBtn) {
            this.elements.scanQRBtn.addEventListener('click', () => {
                console.log('Scan QR button clicked');
                this.startQRScanning();
            });
        }
        
        if (this.elements.closeScannerBtn) {
            this.elements.closeScannerBtn.addEventListener('click', () => {
                console.log('Close scanner button clicked');
                this.stopQRScanning();
            });
        }
        
        if (this.elements.connectCodeBtn) {
            this.elements.connectCodeBtn.addEventListener('click', () => {
                console.log('Connect code button clicked');
                this.connectWithCode();
            });
        }
        
        if (this.elements.connectionCodeInput) {
            this.elements.connectionCodeInput.addEventListener('input', (e) => {
                console.log('Connection code input changed');
                this.formatConnectionCode(e);
            });
            
            this.elements.connectionCodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('Enter pressed in connection code input');
                    this.connectWithCode();
                }
            });
        }
        
        // Remote control dashboard
        if (this.elements.remoteRecordButton) {
            this.elements.remoteRecordButton.addEventListener('click', () => {
                console.log('Remote record button clicked');
                this.toggleRemoteRecording();
            });
        }
        
        if (this.elements.stopRecordingBtn) {
            this.elements.stopRecordingBtn.addEventListener('click', () => {
                console.log('Stop recording button clicked');
                this.stopRemoteRecording();
            });
        }
        
        if (this.elements.remoteQualitySelect) {
            this.elements.remoteQualitySelect.addEventListener('change', (e) => {
                console.log('Remote quality changed:', e.target.value);
                this.changeRemoteQuality(e.target.value);
            });
        }
        
        if (this.elements.remoteFramerateSelect) {
            this.elements.remoteFramerateSelect.addEventListener('change', (e) => {
                console.log('Remote framerate changed:', e.target.value);
                this.changeRemoteFramerate(e.target.value);
            });
        }
        
        if (this.elements.remoteZoomOut) {
            this.elements.remoteZoomOut.addEventListener('click', () => {
                console.log('Remote zoom out clicked');
                this.adjustRemoteZoom(-0.1);
            });
        }
        
        if (this.elements.remoteZoomIn) {
            this.elements.remoteZoomIn.addEventListener('click', () => {
                console.log('Remote zoom in clicked');
                this.adjustRemoteZoom(0.1);
            });
        }
        
        if (this.elements.remoteFlipCamera) {
            this.elements.remoteFlipCamera.addEventListener('click', () => {
                console.log('Remote flip camera clicked');
                this.flipRemoteCamera();
            });
        }
        
        if (this.elements.remoteToggleFlash) {
            this.elements.remoteToggleFlash.addEventListener('click', () => {
                console.log('Remote toggle flash clicked');
                this.toggleRemoteFlash();
            });
        }
        
        if (this.elements.remoteToggleGrid) {
            this.elements.remoteToggleGrid.addEventListener('click', () => {
                console.log('Remote toggle grid clicked');
                this.toggleRemoteGrid();
            });
        }
        
        if (this.elements.remoteDisconnect) {
            this.elements.remoteDisconnect.addEventListener('click', () => {
                console.log('Remote disconnect clicked');
                this.disconnect();
            });
        }
        
        // Camera device events
        if (this.elements.refreshPairingBtn) {
            this.elements.refreshPairingBtn.addEventListener('click', () => {
                console.log('Refresh pairing button clicked');
                this.generatePairingCode();
            });
        }
        
        if (this.elements.cameraRetryBtn) {
            this.elements.cameraRetryBtn.addEventListener('click', () => {
                console.log('Camera retry button clicked');
                this.initializeCamera();
            });
        }
        
        if (this.elements.cameraRecordButton) {
            this.elements.cameraRecordButton.addEventListener('click', () => {
                console.log('Camera record button clicked');
                this.toggleCameraRecording();
            });
        }
        
        if (this.elements.cameraFlipButton) {
            this.elements.cameraFlipButton.addEventListener('click', () => {
                console.log('Camera flip button clicked');
                this.flipCamera();
            });
        }
        
        if (this.elements.cameraZoomOut) {
            this.elements.cameraZoomOut.addEventListener('click', () => {
                console.log('Camera zoom out clicked');
                this.adjustCameraZoom(-0.1);
            });
        }
        
        if (this.elements.cameraZoomIn) {
            this.elements.cameraZoomIn.addEventListener('click', () => {
                console.log('Camera zoom in clicked');
                this.adjustCameraZoom(0.1);
            });
        }
        
        if (this.elements.cameraFlashBtn) {
            this.elements.cameraFlashBtn.addEventListener('click', () => {
                console.log('Camera flash button clicked');
                this.toggleCameraFlash();
            });
        }
        
        if (this.elements.cameraGridBtn) {
            this.elements.cameraGridBtn.addEventListener('click', () => {
                console.log('Camera grid button clicked');
                this.toggleCameraGrid();
            });
        }
        
        console.log('Event binding completed');
    }

    // Mode Management
    showModeSelection() {
        console.log('Showing mode selection');
        this.currentMode = 'select';
        this.cleanup();
        
        if (this.elements.modeSelection) {
            this.elements.modeSelection.classList.remove('hidden');
        }
        if (this.elements.remoteControlApp) {
            this.elements.remoteControlApp.classList.add('hidden');
        }
        if (this.elements.cameraDeviceApp) {
            this.elements.cameraDeviceApp.classList.add('hidden');
        }
    }

    async enterRemoteControlMode() {
        console.log('Entering remote control mode');
        this.currentMode = 'remote';
        
        if (this.elements.modeSelection) {
            this.elements.modeSelection.classList.add('hidden');
        }
        if (this.elements.remoteControlApp) {
            this.elements.remoteControlApp.classList.remove('hidden');
        }
        if (this.elements.cameraDeviceApp) {
            this.elements.cameraDeviceApp.classList.add('hidden');
        }
        
        // Show connection section initially
        if (this.elements.connectionSection) {
            this.elements.connectionSection.classList.remove('hidden');
        }
        if (this.elements.controlDashboard) {
            this.elements.controlDashboard.classList.add('hidden');
        }
        
        this.updateRemoteConnectionStatus();
        this.showNotification('Remote Control Mode activated', 'info');
    }

    async enterCameraDeviceMode() {
        console.log('Entering camera device mode');
        this.currentMode = 'camera';
        
        if (this.elements.modeSelection) {
            this.elements.modeSelection.classList.add('hidden');
        }
        if (this.elements.remoteControlApp) {
            this.elements.remoteControlApp.classList.add('hidden');
        }
        if (this.elements.cameraDeviceApp) {
            this.elements.cameraDeviceApp.classList.remove('hidden');
        }
        
        // Generate pairing code and show pairing section
        this.generatePairingCode();
        if (this.elements.pairingSection) {
            this.elements.pairingSection.classList.remove('hidden');
        }
        if (this.elements.cameraContainer) {
            this.elements.cameraContainer.classList.add('hidden');
        }
        if (this.elements.cameraControls) {
            this.elements.cameraControls.classList.add('hidden');
        }
        
        this.updateCameraConnectionStatus();
        this.showNotification('Camera Device Mode activated', 'info');
        
        // Initialize camera in background
        // setTimeout(() => this.initializeCamera(), 1000);
        this.initializeCamera();
    }

    // Remote Control Functions
    async startQRScanning() {
        console.log('Starting QR scanning');
        try {
            if (this.elements.qrScanner) {
                this.elements.qrScanner.classList.add('active');
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            
            if (this.elements.scannerVideo) {
                this.elements.scannerVideo.srcObject = stream;
            }
            
            // Simple QR detection simulation
            this.simulateQRDetection();
            this.showNotification('QR Scanner activated. Point camera at QR code.', 'info');
            
        } catch (error) {
            console.error('QR scanning failed:', error);
            this.showNotification('Camera access failed for QR scanning', 'error');
        }
    }

    stopQRScanning() {
        console.log('Stopping QR scanning');
        if (this.elements.qrScanner) {
            this.elements.qrScanner.classList.remove('active');
        }
        
        if (this.elements.scannerVideo && this.elements.scannerVideo.srcObject) {
            const tracks = this.elements.scannerVideo.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.elements.scannerVideo.srcObject = null;
        }
        
        this.showNotification('QR Scanner closed', 'info');
    }

    simulateQRDetection() {
        // Simulate QR code detection after 3 seconds
        setTimeout(() => {
            const mockCode = this.generateMockCode();
            this.showNotification(`QR Code detected: ${mockCode}`, 'success');
            this.connectWithCode(mockCode);
            this.stopQRScanning();
        }, 3000);
    }

    formatConnectionCode(event) {
        let value = event.target.value.replace(/\D/g, '');
        if (value.length > 6) value = value.slice(0, 6);
        event.target.value = value;
        
        // Enable connect button when 6 digits are entered
        if (this.elements.connectCodeBtn) {
            this.elements.connectCodeBtn.disabled = value.length !== 6;
        }
    }

    async connectWithCode(code = null) {
        const connectionCode = code || (this.elements.connectionCodeInput ? this.elements.connectionCodeInput.value : '');
        
        console.log('Attempting to connect with code:', connectionCode);
        
        if (!connectionCode || connectionCode.length !== 6) {
            this.showNotification('Please enter a valid 6-digit code', 'error');
            return;
        }
        
        this.showNotification('Connecting to camera device...', 'info');
        
        try {
            await this.establishPeerConnection();
            this.showRemoteControlDashboard();
            this.showNotification('Successfully connected to camera device!', 'success');
            
            // Clear the input field
            if (this.elements.connectionCodeInput) {
                this.elements.connectionCodeInput.value = '';
            }
        } catch (error) {
            console.error('Connection failed:', error);
            this.showNotification('Failed to connect to camera device', 'error');
        }
    }

    async establishPeerConnection() {
        console.log('Establishing peer connection');
        
        // Create peer connection
        this.peerConnection = new RTCPeerConnection(this.rtcConfig);
        
        // Create data channel
        this.dataChannel = this.peerConnection.createDataChannel('commands', {
            ordered: true
        });
        
        this.dataChannel.onopen = () => {
            console.log('Data channel opened');
            this.isConnected = true;
            this.updateRemoteConnectionStatus();
            this.startHeartbeat();
        };
        
        this.dataChannel.onmessage = (event) => {
            console.log('Received message:', event.data);
            this.handleRemoteMessage(JSON.parse(event.data));
        };
        
        this.dataChannel.onclose = () => {
            console.log('Data channel closed');
            this.isConnected = false;
            this.updateRemoteConnectionStatus();
            this.showNotification('Connection to camera device lost', 'warning');
        };
        
        // Simulate successful connection
        return new Promise((resolve) => {
            setTimeout(() => {
                this.isConnected = true;
                this.updateRemoteConnectionStatus();
                this.startTelemetryUpdates();
                resolve();
            }, 1500);
        });
    }

    showRemoteControlDashboard() {
        console.log('Showing remote control dashboard');
        if (this.elements.connectionSection) {
            this.elements.connectionSection.classList.add('hidden');
        }
        if (this.elements.controlDashboard) {
            this.elements.controlDashboard.classList.remove('hidden');
        }
        this.updateRemoteDashboard();
    }

    // Remote Control Commands
    toggleRemoteRecording() {
        if (this.isRecording) {
            this.stopRemoteRecording();
        } else {
            this.startRemoteRecording();
        }
    }

    startRemoteRecording() {
        console.log('Starting remote recording');
        this.sendCommand('start_recording');
        this.isRecording = true;
        this.recordingStartTime = Date.now();
        this.recordingDuration = 0;
        
        if (this.elements.remoteRecordButton) {
            this.elements.remoteRecordButton.classList.add('recording');
        }
        if (this.elements.remoteRecDot) {
            this.elements.remoteRecDot.classList.add('recording');
        }
        if (this.elements.recordingStatusText) {
            this.elements.recordingStatusText.textContent = 'Recording';
        }
        
        this.timers.recording = setInterval(() => {
            this.recordingDuration = Math.floor((Date.now() - this.recordingStartTime) / 1000);
            this.updateRemoteRecordingDuration();
        }, 1000);
        
        this.showNotification('Recording started', 'success');
    }

    stopRemoteRecording() {
        console.log('Stopping remote recording');
        this.sendCommand('stop_recording');
        this.isRecording = false;
        
        if (this.elements.remoteRecordButton) {
            this.elements.remoteRecordButton.classList.remove('recording');
        }
        if (this.elements.remoteRecDot) {
            this.elements.remoteRecDot.classList.remove('recording');
        }
        if (this.elements.recordingStatusText) {
            this.elements.recordingStatusText.textContent = 'Ready to Record';
        }
        
        if (this.timers.recording) {
            clearInterval(this.timers.recording);
            this.timers.recording = null;
        }
        
        this.showNotification('Recording stopped', 'success');
    }

    changeRemoteQuality(quality) {
        console.log('Changing remote quality to:', quality);
        this.deviceState.quality = quality;
        this.sendCommand('set_quality', { quality });
        this.showNotification(`Quality changed to ${quality}`, 'info');
    }

    changeRemoteFramerate(frameRate) {
        console.log('Changing remote framerate to:', frameRate);
        this.deviceState.frameRate = parseInt(frameRate);
        this.sendCommand('set_framerate', { frameRate });
        this.showNotification(`Frame rate changed to ${frameRate} FPS`, 'info');
    }

    adjustRemoteZoom(delta) {
        this.deviceState.zoom = Math.max(1.0, Math.min(5.0, this.deviceState.zoom + delta));
        if (this.elements.remoteZoomValue) {
            this.elements.remoteZoomValue.textContent = `${this.deviceState.zoom.toFixed(1)}x`;
        }
        this.sendCommand('set_zoom', { zoom: this.deviceState.zoom });
        this.showNotification(`Zoom: ${this.deviceState.zoom.toFixed(1)}x`, 'info');
    }

    flipRemoteCamera() {
        console.log('Flipping remote camera');
        this.deviceState.cameraFacing = this.deviceState.cameraFacing === 'environment' ? 'user' : 'environment';
        this.sendCommand('flip_camera');
        this.showNotification('Camera flipped', 'info');
    }

    toggleRemoteFlash() {
        console.log('Toggling remote flash');
        this.deviceState.flashOn = !this.deviceState.flashOn;
        if (this.elements.remoteToggleFlash) {
            this.elements.remoteToggleFlash.classList.toggle('active', this.deviceState.flashOn);
        }
        this.sendCommand('toggle_flash');
        this.showNotification(`Flash ${this.deviceState.flashOn ? 'on' : 'off'}`, 'info');
    }

    toggleRemoteGrid() {
        console.log('Toggling remote grid');
        this.deviceState.gridVisible = !this.deviceState.gridVisible;
        if (this.elements.remoteToggleGrid) {
            this.elements.remoteToggleGrid.classList.toggle('active', this.deviceState.gridVisible);
        }
        this.sendCommand('toggle_grid');
        this.showNotification(`Grid ${this.deviceState.gridVisible ? 'enabled' : 'disabled'}`, 'info');
    }

    // Camera Device Functions
    generatePairingCode() {
        console.log('Generating pairing code');
        this.pairingCode = Math.random().toString().slice(2, 8);
        if (this.elements.pairingCodeDisplay) {
            this.elements.pairingCodeDisplay.textContent = this.pairingCode;
        }
        this.generateQRCode();
        this.showNotification('New pairing code generated', 'info');
    }

    generateQRCode() {
        console.log('Generating QR code for:', this.pairingCode);
        // Simple QR code simulation
        const qrData = `CAMERA_CONNECT:${this.pairingCode}`;
        if (this.elements.qrCodeDisplay) {
            this.elements.qrCodeDisplay.innerHTML = `
                <div style="font-family: monospace; font-size: 12px; line-height: 1.2; white-space: pre;">
QR Code
${this.pairingCode}

Scan with
Remote Control
                </div>
            `;
            this.elements.qrCodeDisplay.style.display = 'flex';
            this.elements.qrCodeDisplay.style.alignItems = 'center';
            this.elements.qrCodeDisplay.style.justifyContent = 'center';
        }
    }

    async initializeCamera() {
        console.log('Initializing camera');
        try {
            if (this.elements.cameraErrorMessage) {
                this.elements.cameraErrorMessage.classList.remove('active');
            }
            
            const constraints = {
                video: {
                    width: { ideal: this.deviceState.quality === '4k' ? 3840 : 1920 },
                    height: { ideal: this.deviceState.quality === '4k' ? 2160 : 1080 },
                    frameRate: { ideal: this.deviceState.frameRate },
                    facingMode: this.deviceState.cameraFacing
                },
                audio: true
            };
            
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => track.stop());
            }
            
            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            if (this.elements.videoPreview) {
                this.elements.videoPreview.srcObject = this.localStream;
            }
            
            this.showCameraInterface();
            this.showNotification('Camera initialized successfully', 'success');
            
        } catch (error) {
            console.error('Camera initialization failed:', error);
            this.handleCameraError(error);
        }
    }

    handleCameraError(error) {
        console.error('Camera error:', error);
        let message = 'Unable to access camera';
        
        if (error.name === 'NotAllowedError') {
            message = 'Camera access denied. Please allow camera permissions.';
        } else if (error.name === 'NotFoundError') {
            message = 'No camera found on this device.';
        } else if (error.name === 'NotSupportedError') {
            message = 'Camera not supported by this browser.';
        }
        
        if (this.elements.cameraErrorMessage) {
            this.elements.cameraErrorMessage.classList.add('active');
            const messageElement = this.elements.cameraErrorMessage.querySelector('p');
            if (messageElement) {
                messageElement.textContent = message;
            }
        }
    }

    showCameraInterface() {
        console.log('Showing camera interface');
        if (this.elements.pairingSection) {
            this.elements.pairingSection.classList.add('hidden');
        }
        if (this.elements.cameraContainer) {
            this.elements.cameraContainer.classList.remove('hidden');
        }
        if (this.elements.cameraControls) {
            this.elements.cameraControls.classList.remove('hidden');
        }
    }

    toggleCameraRecording() {
        if (this.isRecording) {
            this.stopCameraRecording();
        } else {
            this.startCameraRecording();
        }
    }

    async startCameraRecording() {
        console.log('Starting camera recording');
        if (!this.localStream) {
            this.showNotification('No camera stream available', 'error');
            return;
        }
        
        try {
            const options = { mimeType: 'video/webm' };
            this.mediaRecorder = new MediaRecorder(this.localStream, options);
            const recordedChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                this.saveRecording(blob);
            };
            
            this.mediaRecorder.start(1000);
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            this.recordingDuration = 0;
            
            if (this.elements.cameraRecordButton) {
                this.elements.cameraRecordButton.classList.add('recording');
            }
            if (this.elements.cameraRecordingIndicator) {
                this.elements.cameraRecordingIndicator.classList.add('active');
            }
            if (this.elements.cameraRemoteIndicator) {
                this.elements.cameraRemoteIndicator.classList.add('active');
            }
            
            this.timers.recording = setInterval(() => {
                this.recordingDuration = Math.floor((Date.now() - this.recordingStartTime) / 1000);
                this.updateCameraRecordingDuration();
            }, 1000);
            
            this.broadcastStatus('recording_started');
            this.showNotification('Recording started', 'success');
            
        } catch (error) {
            console.error('Recording failed:', error);
            this.showNotification('Failed to start recording', 'error');
        }
    }

    stopCameraRecording() {
        console.log('Stopping camera recording');
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            if (this.elements.cameraRecordButton) {
                this.elements.cameraRecordButton.classList.remove('recording');
            }
            if (this.elements.cameraRecordingIndicator) {
                this.elements.cameraRecordingIndicator.classList.remove('active');
            }
            
            if (this.timers.recording) {
                clearInterval(this.timers.recording);
                this.timers.recording = null;
            }
            
            this.broadcastStatus('recording_stopped');
            this.showNotification('Recording stopped', 'success');
        }
    }

    saveRecording(blob) {
        console.log('Saving recording, size:', blob.size);
        const filename = `recording_${Date.now()}.webm`;
        const file = {
            name: filename,
            blob: blob,
            size: blob.size,
            duration: this.recordingDuration,
            timestamp: new Date(),
            url: URL.createObjectURL(blob)
        };
        
        this.recordedFiles.push(file);
        this.updateFileCount();
        
        // Auto-download for demo
        const a = document.createElement('a');
        a.href = file.url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        this.showNotification(`Recording saved (${(blob.size / 1024 / 1024).toFixed(2)} MB)`, 'success');
    }

    flipCamera() {
        console.log('Flipping camera');
        this.deviceState.cameraFacing = this.deviceState.cameraFacing === 'environment' ? 'user' : 'environment';
        this.initializeCamera();
        this.broadcastStatus('camera_flipped');
    }

    adjustCameraZoom(delta) {
        this.deviceState.zoom = Math.max(1.0, Math.min(5.0, this.deviceState.zoom + delta));
        if (this.elements.cameraZoomValue) {
            this.elements.cameraZoomValue.textContent = `${this.deviceState.zoom.toFixed(1)}x`;
        }
        this.broadcastStatus('zoom_changed');
    }

    toggleCameraFlash() {
        console.log('Toggling camera flash');
        this.deviceState.flashOn = !this.deviceState.flashOn;
        if (this.elements.cameraFlashBtn) {
            this.elements.cameraFlashBtn.classList.toggle('active', this.deviceState.flashOn);
        }
        this.broadcastStatus('flash_toggled');
        this.showNotification(`Flash ${this.deviceState.flashOn ? 'on' : 'off'}`, 'info');
    }

    toggleCameraGrid() {
        console.log('Toggling camera grid');
        this.deviceState.gridVisible = !this.deviceState.gridVisible;
        if (this.elements.cameraGrid) {
            this.elements.cameraGrid.classList.toggle('active', this.deviceState.gridVisible);
        }
        if (this.elements.cameraGridBtn) {
            this.elements.cameraGridBtn.classList.toggle('active', this.deviceState.gridVisible);
        }
        this.broadcastStatus('grid_toggled');
    }

    // Communication Functions
    sendCommand(command, data = {}) {
        console.log('Sending command:', command, data);
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            const message = {
                type: 'command',
                command: command,
                data: data,
                timestamp: Date.now()
            };
            
            this.dataChannel.send(JSON.stringify(message));
        } else {
            // Simulate command execution for demo
            this.simulateCommand(command, data);
        }
    }

    simulateCommand(command, data) {
        console.log('Simulating command:', command, data);
        // Simulate camera device responding to commands
        setTimeout(() => {
            switch (command) {
                case 'start_recording':
                    this.isRecording = true;
                    this.recordingStartTime = Date.now();
                    break;
                case 'stop_recording':
                    this.isRecording = false;
                    break;
                case 'set_quality':
                    this.deviceState.quality = data.quality;
                    break;
                case 'set_zoom':
                    this.deviceState.zoom = data.zoom;
                    break;
            }
        }, 200);
    }

    handleRemoteMessage(message) {
        console.log('Handling remote message:', message);
        switch (message.type) {
            case 'telemetry':
                this.updateRemoteTelemetry(message.data);
                break;
            case 'status':
                this.updateRemoteStatus(message.data);
                break;
            case 'response':
                this.handleCommandResponse(message);
                break;
        }
    }

    broadcastStatus(event, data = {}) {
        console.log('Broadcasting status:', event, data);
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            const message = {
                type: 'status',
                event: event,
                state: {
                    isRecording: this.isRecording,
                    batteryLevel: this.deviceState.batteryLevel,
                    temperature: this.deviceState.temperature,
                    recordingDuration: this.recordingDuration,
                    zoom: this.deviceState.zoom,
                    quality: this.deviceState.quality
                },
                data: data,
                timestamp: Date.now()
            };
            
            this.dataChannel.send(JSON.stringify(message));
        }
    }

    // System Monitoring
    startSystemMonitoring() {
        console.log('Starting system monitoring');
        
        // Update time
        setInterval(() => this.updateTime(), 1000);
        
        // Battery monitoring
        this.startBatteryMonitoring();
        
        // Temperature monitoring
        this.startTemperatureMonitoring();
        
        // Telemetry updates
        this.timers.telemetry = setInterval(() => {
            if (this.currentMode === 'camera' && this.isConnected) {
                this.broadcastStatus('telemetry_update');
            }
        }, 2000);
    }

    startBatteryMonitoring() {
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                this.updateBatteryInfo(battery);
                battery.addEventListener('chargingchange', () => this.updateBatteryInfo(battery));
                battery.addEventListener('levelchange', () => this.updateBatteryInfo(battery));
            }).catch(() => {
                this.simulateBattery();
            });
        } else {
            this.simulateBattery();
        }
    }

    simulateBattery() {
        this.timers.battery = setInterval(() => {
            if (this.isRecording && this.deviceState.batteryLevel > 0) {
                this.deviceState.batteryLevel = Math.max(0, this.deviceState.batteryLevel - 0.1);
            } else if (!this.isRecording && this.deviceState.batteryLevel < 100) {
                this.deviceState.batteryLevel = Math.min(100, this.deviceState.batteryLevel + 0.02);
            }
            this.updateBatteryDisplay();
        }, 5000);
    }

    updateBatteryInfo(battery) {
        this.deviceState.batteryLevel = Math.round(battery.level * 100);
        this.deviceState.batteryCharging = battery.charging;
        this.updateBatteryDisplay();
    }

    updateBatteryDisplay() {
        const percentage = Math.round(this.deviceState.batteryLevel);
        
        // Update camera device battery
        if (this.elements.cameraBatteryFill) {
            this.elements.cameraBatteryFill.style.width = `${percentage}%`;
            this.elements.cameraBatteryFill.classList.remove('low', 'medium');
            if (percentage < 20) {
                this.elements.cameraBatteryFill.classList.add('low');
            } else if (percentage < 50) {
                this.elements.cameraBatteryFill.classList.add('medium');
            }
        }
        
        if (this.elements.cameraBatteryText) {
            this.elements.cameraBatteryText.textContent = `${percentage}%`;
        }
        
        // Update remote control display
        if (this.elements.remoteBatteryFill) {
            this.elements.remoteBatteryFill.style.width = `${percentage}%`;
            this.elements.remoteBatteryFill.classList.remove('low', 'medium');
            if (percentage < 20) {
                this.elements.remoteBatteryFill.classList.add('low');
            } else if (percentage < 50) {
                this.elements.remoteBatteryFill.classList.add('medium');
            }
        }
        
        if (this.elements.remoteBatteryLevel) {
            this.elements.remoteBatteryLevel.textContent = `${percentage}%`;
        }
    }

    startTemperatureMonitoring() {
        setInterval(() => {
            // Simulate temperature changes
            this.deviceState.temperature += (Math.random() - 0.5) * 2;
            this.deviceState.temperature = Math.max(65, Math.min(95, this.deviceState.temperature));
            
            if (this.isRecording) {
                this.deviceState.temperature += 0.2;
            }
            
            this.updateTemperatureDisplay();
        }, 3000);
    }

    updateTemperatureDisplay() {
        const temp = Math.round(this.deviceState.temperature);
        
        if (this.elements.cameraTemperatureText) {
            this.elements.cameraTemperatureText.textContent = `${temp}°F`;
        }
        
        if (this.elements.remoteTemperature) {
            this.elements.remoteTemperature.textContent = `${temp}°F`;
        }
    }

    startHeartbeat() {
        this.timers.heartbeat = setInterval(() => {
            if (this.isConnected) {
                this.sendCommand('heartbeat');
            }
        }, 5000);
    }

    startTelemetryUpdates() {
        // Simulate telemetry updates for remote control
        setInterval(() => {
            if (this.currentMode === 'remote' && this.isConnected) {
                this.updateRemoteTelemetry({
                    batteryLevel: this.deviceState.batteryLevel,
                    temperature: this.deviceState.temperature,
                    storage: this.deviceState.storageAvailable,
                    signal: this.deviceState.signalStrength,
                    isRecording: this.isRecording,
                    recordingDuration: this.recordingDuration
                });
            }
        }, 1000);
    }

    // UI Updates
    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: false 
        });
        
        if (this.elements.currentTime) {
            this.elements.currentTime.textContent = timeString;
        }
    }

    updateRemoteConnectionStatus() {
        const dot = this.elements.remoteConnectionStatus?.querySelector('.connection-dot');
        if (dot) {
            dot.classList.remove('connected', 'pairing');
            if (this.isConnected) {
                dot.classList.add('connected');
            }
        }
        
        if (this.elements.remoteConnectionText) {
            this.elements.remoteConnectionText.textContent = this.isConnected ? 'Connected' : 'Disconnected';
        }
    }

    updateCameraConnectionStatus() {
        const dot = this.elements.cameraConnectionStatus?.querySelector('.connection-dot');
        if (dot) {
            dot.classList.remove('connected', 'pairing');
            if (this.isConnected) {
                dot.classList.add('connected');
            } else if (this.pairingCode) {
                dot.classList.add('pairing');
            }
        }
        
        if (this.elements.cameraConnectionText) {
            if (this.isConnected) {
                this.elements.cameraConnectionText.textContent = 'Connected';
            } else if (this.pairingCode) {
                this.elements.cameraConnectionText.textContent = 'Waiting...';
            } else {
                this.elements.cameraConnectionText.textContent = 'Disconnected';
            }
        }
    }

    updateRemoteDashboard() {
        this.updateRemoteTelemetry({
            batteryLevel: this.deviceState.batteryLevel,
            temperature: this.deviceState.temperature,
            storage: this.deviceState.storageAvailable,
            signal: this.deviceState.signalStrength
        });
        
        if (this.elements.remoteZoomValue) {
            this.elements.remoteZoomValue.textContent = `${this.deviceState.zoom.toFixed(1)}x`;
        }
    }

    updateRemoteTelemetry(data) {
        if (data.batteryLevel !== undefined) {
            this.deviceState.batteryLevel = data.batteryLevel;
            this.updateBatteryDisplay();
        }
        
        if (data.temperature !== undefined) {
            this.deviceState.temperature = data.temperature;
            this.updateTemperatureDisplay();
        }
        
        if (data.storage && this.elements.remoteStorage) {
            this.elements.remoteStorage.textContent = data.storage;
        }
        
        if (data.signal && this.elements.remoteSignal) {
            this.elements.remoteSignal.textContent = `${data.signal}%`;
        }
        
        if (data.isRecording !== undefined) {
            this.isRecording = data.isRecording;
            if (this.elements.remoteRecordButton) {
                this.elements.remoteRecordButton.classList.toggle('recording', this.isRecording);
            }
            if (this.elements.remoteRecDot) {
                this.elements.remoteRecDot.classList.toggle('recording', this.isRecording);
            }
            if (this.elements.recordingStatusText) {
                this.elements.recordingStatusText.textContent = this.isRecording ? 'Recording' : 'Ready to Record';
            }
        }
        
        if (data.recordingDuration !== undefined) {
            this.recordingDuration = data.recordingDuration;
            this.updateRemoteRecordingDuration();
        }
    }

    updateRemoteRecordingDuration() {
        const formatted = this.formatDuration(this.recordingDuration);
        if (this.elements.remoteRecordingDuration) {
            this.elements.remoteRecordingDuration.textContent = formatted;
        }
    }

    updateCameraRecordingDuration() {
        const formatted = this.formatDuration(this.recordingDuration);
        if (this.elements.cameraRecordingDuration) {
            this.elements.cameraRecordingDuration.textContent = formatted;
        }
    }

    updateFileCount() {
        const count = this.recordedFiles.length;
        if (this.elements.cameraFileCount) {
            this.elements.cameraFileCount.textContent = count.toString();
            this.elements.cameraFileCount.classList.toggle('visible', count > 0);
        }
    }

    // Utility Functions
    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    generateMockCode() {
        return Math.random().toString().slice(2, 8);
    }

    disconnect() {
        console.log('Disconnecting');
        this.isConnected = false;
        this.isRecording = false;
        
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }
        
        // Clear timers
        Object.values(this.timers).forEach(timer => {
            if (timer) clearInterval(timer);
        });
        
        this.updateRemoteConnectionStatus();
        this.updateCameraConnectionStatus();
        
        // Return to connection screen
        if (this.currentMode === 'remote') {
            if (this.elements.connectionSection) {
                this.elements.connectionSection.classList.remove('hidden');
            }
            if (this.elements.controlDashboard) {
                this.elements.controlDashboard.classList.add('hidden');
            }
        }
        
        this.showNotification('Disconnected', 'warning');
    }

    showNotification(message, type = 'info') {
        console.log(`Notification [${type}]:`, message);
        
        if (!this.elements.notificationContainer) {
            console.error('Notification container not found');
            return;
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        
        this.elements.notificationContainer.appendChild(notification);
        
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    cleanup() {
        console.log('Cleaning up');
        
        // Stop all streams
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        
        // Stop recording
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
        }
        
        // Close peer connections
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        // Clear timers
        Object.values(this.timers).forEach(timer => {
            if (timer) clearInterval(timer);
        });
        
        // Reset state
        this.isConnected = false;
        this.isRecording = false;
        this.pairingCode = null;
    }
}

// Initialize the application
let cameraSystem;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing system...');
    try {
        cameraSystem = new RemoteCameraControlSystem();
        window.cameraSystem = cameraSystem; // For debugging
        console.log('Remote Camera Control System ready');
    } catch (error) {
        console.error('Failed to initialize system:', error);
    }
});

// Handle page visibility and cleanup
document.addEventListener('visibilitychange', () => {
    if (document.hidden && cameraSystem?.isRecording) {
        cameraSystem.stopCameraRecording();
        cameraSystem.showNotification('Recording stopped (app in background)', 'warning');
    }
});

window.addEventListener('beforeunload', () => {
    if (cameraSystem) {
        cameraSystem.cleanup();
    }
});

// Handle orientation changes
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        if (cameraSystem?.currentMode === 'camera' && cameraSystem.localStream) {
            cameraSystem.initializeCamera().catch(err => {
                console.error('Failed to reinitialize camera after orientation change:', err);
            });
        }
    }, 500);
});