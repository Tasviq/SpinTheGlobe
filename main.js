const globeConfig = {
    continuousRotation: true, // flag to track if globe should rotate continuously
    initialRotationSpeed: 200,
    isDragging: false, // When mouse used to rotate the globe
};

const dimensions = {
    width: 960,
    height: 600,
};

const svg = d3.select('svg').attr('width', dimensions.width).attr('height', dimensions.height);
const projection = d3.geoOrthographic();
const path = d3.geoPath().projection(projection);
const origin = [dimensions.width / 2, dimensions.height / 2];

// Get input from "Visit a Country" dropdown
const countryInput = document.getElementById('country');
countryInput.addEventListener('change', updateSelectedCountry)

// save the coordinates of the last selected country, 
// will be the inital viewpoint for the d3.interpolate in the visitCountry() function
let [gCurrentLat, gCurrentLng] = projection.invert(origin);

// Add an event listener to the tilt angle input
const tiltAngleInput = document.getElementById('tilt-angle');
tiltAngleInput.addEventListener('input', function () {
  // Get the current tilt angle value from the input
  const tiltAngleDegrees = parseFloat(this.value);

  // Modify the projection's rotation to include the new tilt angle
  projection.rotate([projection.rotate()[0], projection.rotate()[1], tiltAngleDegrees]);

  // Redraw the globe
  svg.selectAll("path").attr("d", path);

  // Update the displayed tilt angle value
  document.getElementById('tilt-value').textContent = `${tiltAngleDegrees}°`;
});


// Get references to the speed slider and value elements
const speedSlider = document.getElementById('speedInput');
const speedValue = document.getElementById('speed-value');

// Initialize the speed value with the slider's initial value
speedValue.textContent = speedSlider.value + ' MPH';

// Add an event listener to the slider to update the value when it changes
speedSlider.addEventListener('input', function () {
    // Get the current speed value from the slider
    let speed = parseFloat(this.value);

    // Update the displayed speed value
    speedValue.textContent = speed + ' MPH';
  
    // Update the continuous rotation speed (adjust the timeout for rotation speed)
    startContinuousRotation(speed);
});


// Start the continuous rotation
startContinuousRotation(globeConfig.initialRotationSpeed);
// Function to start continuous rotation with the specified speed
function startContinuousRotation(speed) {
  if (globeConfig.continuousRotation ) {
    let speedTaken = speed/500;
    projection.rotate([projection.rotate()[0] + speedTaken, projection.rotate()[1], projection.rotate()[2]]);
    svg.selectAll('path').attr('d', path);

    // Adjust the timeout for rotation speed
    const rotationInterval = 10 / speed;
    setTimeout(function () {
      startContinuousRotation(speed);
    }, rotationInterval);
  }
}


svg.on("mousedown", function () {
    globeConfig.continuousRotation = false;
    globeConfig.isDragging = true;
    dragStartCoords = d3.mouse(this);
});

svg.on("mousemove", function () {
    if (globeConfig.isDragging) {
        const dragEndCoords = d3.mouse(this);
        const dx = dragEndCoords[0] - dragStartCoords[0];
        const dy = dragEndCoords[1] - dragStartCoords[1];

        // Adjust the rotation angles based on the mouse movement
        const rotation = projection.rotate();
        const newRotation = [
            rotation[0] + dx / 2,
            rotation[1] - dy / 2, // Invert dy to match the globe's orientation
            rotation[2]
        ];

        projection.rotate(newRotation);
        svg.selectAll("path").attr("d", path);

        // Update the drag start coordinates for the next movement
        dragStartCoords = dragEndCoords;
    }
});

svg.on("mouseup", function () {
    globeConfig.isDragging = false;
});


drawGlobe();
drawLatLongLines();
populateCountryOptions();

// Using d3 polygon: https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-110m.json
function drawGlobe() {
    d3.queue()
        .defer(d3.json, 'https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-110m.json')
        .await((error, worldData, locationData) => {
            svg.selectAll(".segment")
                .data(topojson.feature(worldData, worldData.objects.countries).features)
                .enter().append("path")
                .attr("class", "segment")
                .attr("d", path)
                .style("stroke", "#808080")
                .style("stroke-width", "1px")
                .style("fill", (d, i) => '#000')
                .style("opacity", ".8");
            locations = locationData;
        });
}

//Outline latitude and longitude lines with d3.geoGraticule()
function drawLatLongLines() {
    const graticule = d3.geoGraticule()
        .step([10, 10]);

    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path)
        .style("fill", "#fff")
        .style("stroke", "#e3e3");
}


// Rotates to the selected country and places a pointer
function visitCountry(lat, lng) {

    // use transition with tween for the animation
    d3.transition()
        .duration(1000)
        .tween("rotate", function () {
            // get an interpolator from the current coordinates (view) to the selected country -> needed for the animation
            const r = d3.interpolate([-gCurrentLng, -gCurrentLat], [-lng, -lat]);
            // use the interpolator to rotate step by step with the animation
            return function (t) {
                projection.rotate(r(t));
                svg.selectAll("path").attr("d", path);
            };
        })
        .on("end", () => {
            // draw the marker
            placePointer(lat, lng), // save current coordinates to gCurrentLat and gCurrentLng to use them as starting point for the next interpolation
            // override the globals gCurrentLat and gCurrentLng to use them for the next rotation
            gCurrentLat = lat
            gCurrentLng = lng
        })
}


// draws a red circle at the latitude and longitude coordinates
function placePointer(lat, lng) {
    globeConfig.continuousRotation = false;

    // Define a filter for creating a shadow effect
    const filter = svg.append("filter")
        .attr("id", "marker-shadow")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");
    filter.append("feOffset")
        .attr("result", "offOut")
        .attr("in", "SourceAlpha")
        .attr("dx", 2) // Adjust the shadow's horizontal offset
        .attr("dy", 2) // Adjust the shadow's vertical offset
    filter.append("feGaussianBlur")
        .attr("result", "blurOut")
        .attr("in", "offOut")
        .attr("stdDeviation", 3); // Adjust the blur level for the shadow
    filter.append("feBlend")
        .attr("in", "SourceGraphic")
        .attr("in2", "blurOut")
        .attr("mode", "normal");

    // Create the marker circle and apply the shadow filter
    const marker = svg.append("circle")
        .attr('cx', projection([lng, lat])[0])
        .attr('cy', projection([lng, lat])[1])
        .attr('fill', 'red')
        .attr('r', 6)
        .attr('filter', 'url(#marker-shadow)'); // Apply the shadow filter

    // Add a class to the marker for styling
    marker.attr('class', 'blinking-marker');
}


function populateCountryOptions() {
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.name;
        option.textContent = country.name;
        countryInput.appendChild(option);
    });
}

// When selected country changes
function updateSelectedCountry(e) {
    const selectedCountry = countries.find((country) => country.name === e.target.value);
    visitCountry(selectedCountry.latitude, selectedCountry.longitude)
}


/** 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
 */