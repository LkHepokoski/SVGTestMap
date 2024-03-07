var projection = d3.geoAlbersUsa();
var path = d3.geoPath().projection(projection);

// Load GeoJSON data
d3.json('geojson.json').then(function (geojson) {
    // Bind GeoJSON data to SVG elements
    d3.select('#map')
        .selectAll('path')
        .data(geojson.features)
        .enter().append('path')
        .attr('d', path)
        .attr('class', function (d) {
            if (d.properties.class === 'hidden') {
                return 'hidden';
            } else {
                return 'clickable ' + (d.properties.class === 'unclickable' ? 'unclickable' : '');
            }
        })
        .on('click', function (d) {
            if (!$(this).hasClass('unclickable')) {
                handleZoom(this);
            }
        });
});

// Geocode addresses using OpenCage Geocoding API and add markers
d3.json('markers.json').then(function (addressData) {
    addressData.forEach(function (address) {
        var fullAddress = `${address.address_line1}, ${address.city_locality}, ${address.state_province} ${address.postal_code}, ${address.country_code}`;

        // Use OpenCage Geocoding API to get coordinates
        var geocodingUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(fullAddress)}&key=228be9bd90fd4a158a427c3b964f487e`;

        // Make a request to the Geocoding API
        d3.json(geocodingUrl).then(function (geocodingResult) {
            if (geocodingResult.results && geocodingResult.results.length > 0) {
                var location = geocodingResult.results[0].geometry;

                // Add markers using the obtained coordinates
                d3.select('#map')
                    .append('circle')
                    .attr('class', 'marker')
                    .attr('cx', projection([location.lng, location.lat])[0])
                    .attr('cy', projection([location.lng, location.lat])[1])
                    .attr('r', 3) // Adjust the radius as needed
                    .on('click', function () {
                        // Handle marker click event
                        var link = address.link;
                        window.open(link, '_blank');
                        console.log('Marker clicked:', fullAddress);
                    });
            } else {
                console.error(`Geocoding failed for address: ${fullAddress}`);
            }
        });
    });
});

// Wait for the document to be ready
$(document).ready(function() {
    // Hide the back button initially
    $("#back-button").hide();

    // Add initial click event listener to the paths and circles
    $("path:not(.unclickable), circle:not(.unclickable)").one("click", function() {
       // console.log("Clicked path/circle");

        // Check if the clicked element is clickable
        if (!$(this).hasClass('unclickable')) {
            console.log("Clickable path/circle clicked");

            // Call the function to handle zooming
            handleZoom(this);
        }
    });
});


$(document).ready(function() {
    originalViewBox = $("#map").attr("viewBox");
  });
  function animateZoom(viewBox) {
    requestAnimationFrame(() => {
        gsap.to("#map", {
            duration: 1,
            attr: {
                viewBox: viewBox,
            },
            // shows button and markers upon zoom
            onComplete: function () {
                $("#back-button").show();
                $(".marker").css({opacity: "100%"});
                $("path:not(.unclickable), circle:not(.unclickable)").off("click");
                 // hides button upon button click
                $("#back-button").click(function () {
                    $("#back-button").hide();

                    $("path:not(.unclickable), circle:not(.unclickable)").one("click", function () {
                        handleZoom(this);
                    });

                    gsap.to("#map", {
                        duration: 1,
                        attr: {
                            viewBox: originalViewBox,
                        },
                        // hides markers after zoom out
                        onStart: function () {
                            $(".marker").css({opacity: "0%"});
                        }
                    });
                });
            },
        });
    });
}

// gets new viewBox based on the bounding box of clicked element and calls the animateZoom function.
function handleZoom(element) {
    var bbox = element.getBBox();
    var viewBoxX = bbox.x - 10;
    var viewBoxY = bbox.y - 10;
    var viewBoxWidth = bbox.width + 20;
    var viewBoxHeight = bbox.height + 20;

    animateZoom(`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`);
}