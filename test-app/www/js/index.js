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
        this.heroImg = document.getElementById('heroImg');
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

        var canvas = document.getElementById('canvas');
        var canvas2 = document.getElementById('canvas2');
        // var ctx = canvas.getContext('2d');
        var ctx2 = canvas2.getContext('2d');
        var video = document.getElementById('video');

        // set canvas size = video size when known
        video.addEventListener('loadedmetadata', function() {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        });

        video.addEventListener('play', function(event) {
            var $this = this; //cache
            (function loop() {
                if (!$this.paused && !$this.ended) {
                    ctx2.drawImage($this, 0, 0, canvas.width, canvas.height);
                    imageFilter.applyFilter({ srcUrl: canvas2.toDataURL(), filter: { name: 'AnonymousFaces' } },
                        function(filteredImg) {
                            // ctx.drawImage(filteredImg, 0, 0, 320, 240);
                            canvas.src = filteredImg;
                            // setTimeout(loop, 1000 / 30); // drawing at 30fps
                            setTimeout(loop); // drawing at 30fps
                        },
                        function() {
                            console.log('imageFilter.applyFilter() failed');
                        });
                }
            })();
        }, 0);

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
        app.applyFilter({ name: 'AnonymousFaces' });
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
        // document.getElementById('video').play();
    }
};

app.initialize();