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
    },
    applyFilter: function(filter) {
        app.showFilterPanel(false);
        // call the plugin: imageFilter.applyFilter()
        imageFilter.applyFilter(
            {srcUrl: app.heroImg.src, filter: filter},
            function(filteredImg){
                app.heroImg.src = filteredImg;
                app.showFilterPanel(true);
            },
            function(){
                app.showFilterPanel(true);
                console.log('imageFilter.applyFilter() failed');
            });
    },
    applyFaceFilter: function(event) {
        event.preventDefault();
        app.applyFilter({name:'AnonymousFaces'});
    },
    applySepiaToneFilter: function(event) {
        event.preventDefault();
        app.applyFilter({name:'SepiaTone', intensity: 0.7});
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
    }
};

app.initialize();