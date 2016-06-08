/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    imgageNumber: 1,
    lastImageNumber: 11,
    originalAttrName: 'original',
    // Application Constructor
    initialize: function() {
        this.rawQueue = new Queue();
        this.filterQueue = new Queue();
        this.fpsDelayCapture = 1000 / 3;
        this.fpsDelayDisplay = 1000 / 10;
        this.heroImg = document.getElementById('heroImg');
        this.video = document.getElementById('video');
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext('2d');
        this.videoImg = document.getElementById('videoImage');
        this.anonymousFacesFilter = { name: 'AnonymousFaces' };
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.getElementById('original').addEventListener('click', this.showOriginal, false);
        document.getElementById('faceFilter').addEventListener('click', this.applyFaceFilter, false);
        document.getElementById('sepiaToneFilter').addEventListener('click', this.applySepiaToneFilter, false);
        document.getElementById('previousImage').addEventListener('click', this.previousImage, false);
        document.getElementById('nextImage').addEventListener('click', this.nextImage, false);
        this.heroImg.addEventListener('load', this.loadImage);
        this.video.addEventListener('loadedmetadata', this.adjustCanvasDimension, false);
        // this.video.addEventListener('loadeddata', this.applyAnonymousFaceFilterOnVideoBody, false);
        this.video.addEventListener('play', this.doPlay, false);
    },
    adjustCanvasDimension: function() {
        app.canvas.width = this.videoWidth;
        app.canvas.height = this.videoHeight;
    },
    applyAnonymousFaceFilterOnVideoBody: function(rawData) {
        imageFilter.applyFilter({ srcUrl: rawData, filter: app.anonymousFacesFilter },
            app.applyAnonymousFaceFilterOnVideoSuccessCB,
            app.applyAnonymousFaceFilterOnVideoFailCB);
    },
    applyAnonymousFaceFilterOnVideoSuccessCB: function(filteredImg) {
        app.filterQueue.enqueue(filteredImg);
        requestAnimationFrame(app.startVideoFilter);
    },
    applyAnonymousFaceFilterOnVideoFailCB: function() {
        app.video.pause();
        console.log('imageFilter.applyFilter() failed');
    },
    startVideoFilter: function() {
        var rawData = app.rawQueue.dequeue();
        if (rawData) {
            app.applyAnonymousFaceFilterOnVideoBody(rawData);
        } else {
            requestAnimationFrame(app.startVideoFilter);
        }
    },
    captureRaw: function() {
        if (!app.video.paused && !app.video.ended) {
            // console.log(app.video.currentTime);
            var startTime = new Date().getTime();
            // console.log(startTime);
            app.ctx.drawImage(app.video, 0, 0, app.canvas.width, app.canvas.height);
            app.rawQueue.enqueue(app.canvas.toDataURL());
            var delay = app.fpsDelayCapture - (new Date().getTime() - startTime);
            // console.log(app.rawQueue.getLength());
            if (delay < 0) {
                delay = 0;
            }
            setTimeout(app.captureRaw, delay); // drawing at 30fps
        }
    },
    showFiltered: function() {
        if (!app.video.paused && !app.video.ended) {
            var delay = app.fpsDelayDisplay;
            var startTime = new Date().getTime();
            // console.log(app.filterQueue.getLength());
            if (app.filterQueue.getLength() > 3) {
                var filteredImg = app.filterQueue.dequeue();
                app.videoImg.src = filteredImg;
                delay = delay - (new Date().getTime() - startTime);
                // console.log(delay);
                if (delay < 0) {
                    delay = 0;
                }
            }
            setTimeout(app.showFiltered, delay); // drawing at 30fps
        }
    },
    doPlay: function() {
        app.captureRaw();
        app.showFiltered();
    },
    applyFilter: function(filter) {
        app.showFilterPanel(false);
        // call the plugin: imageFilter.applyFilter()
        imageFilter.applyFilter({ srcUrl: app.heroImg.src, filter: filter },
            function(filteredImg) {
                app.heroImg.src = filteredImg;
                app.showFilterPanel(true);
            },
            function() {
                app.showFilterPanel(true);
                console.log('imageFilter.applyFilter() failed');
            });
    },
    applyFaceFilter: function(event) {
        event.preventDefault();
        app.applyFilter(app.anonymousFacesFilter);
    },
    applySepiaToneFilter: function(event) {
        event.preventDefault();
        app.applyFilter({ name: 'SepiaTone', intensity: 0.7 });
    },
    loadImage: function() {
        document.getElementById('heroImgWidth').textContent = this.naturalWidth;
        document.getElementById('heroImgHeight').textContent = this.naturalHeight;
    },
    setImage: function() {
        if (app.imgageNumber <= 0) app.imgageNumber = app.lastImageNumber;
        if (app.imgageNumber > app.lastImageNumber) app.imgageNumber = 1;
        app.heroImg.src = 'img/img' + app.imgageNumber + '.jpg';
        app.heroImg.setAttribute(app.originalAttrName, app.heroImg.src);
    },
    previousImage: function(event) {
        event.preventDefault();
        app.imgageNumber--;
        app.setImage();
    },
    nextImage: function(event) {
        event.preventDefault();
        app.imgageNumber++;
        app.setImage();
    },
    showOriginal: function(event) {
        event.preventDefault();
        app.heroImg.src = app.heroImg.getAttribute(app.originalAttrName);
    },
    showFilterPanel: function(isShow) {
        var display = (isShow) ? 'block' : 'none';
        document.getElementById('filterPanel').setAttribute('style', 'display:' + display + ';');
    },
    // deviceready Event Handler
    //
    onDeviceReady: function() {
        app.setImage();
        app.showFilterPanel(true);
        app.startVideoFilter();
        // app.video.load();
    }
};

app.initialize();