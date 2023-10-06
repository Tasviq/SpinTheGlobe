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