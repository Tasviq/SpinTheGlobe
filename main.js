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