// Set default lighter color for clickable states
$("path:not(.unclickable), circle:not(.unclickable)").css({
  'fill': '#00b2e3', // Lighter color
  'stroke-width': '0px',
  'stroke-linejoin': 'round',
  'cursor': 'pointer'
});

$("path, circle").hover(function(e) {
  if (!$(this).hasClass('unclickable')) {
    $('#info-box').css('display','block');
    $('#info-box').html($(this).data('info'));
    // Change to darker color on hover
    $(this).css({
      'fill': '#1c355e', // Darker color on hover
      'stroke-width': '0px',
      'stroke-linejoin': 'round',
      'cursor': 'pointer'
    });
  }
});

$("path, circle").mouseleave(function(e) {
  $('#info-box').css('display','none');
  // Reset to default lighter color on mouse leave
  if (!$(this).hasClass('unclickable')) {
    $(this).css({
      'fill': '#00b2e3', // Lighter color on mouse leave
      'stroke': '#00b2e3',
      'stroke-linejoin': 'round',
      'cursor': 'pointer'
    });
  }
});

//  make specific states unclickable
$("path.unclickable, circle.unclickable").css('pointer-events', 'none');

$(document).mousemove(function(e) {
  $('#info-box').css('top',e.pageY-$('#info-box').height()-30);
  $('#info-box').css('left',e.pageX-($('#info-box').width())/2);
}).mouseover();

var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
if(ios) {
  $('a').on('click touchend', function() {
    var link = $(this).attr('href');
    window.open(link,'_blank');
    return false;
  });
}

// Store the original viewBox values
var originalViewBox = $("#us-map").attr("viewBox");
// Function to handle zooming
function handleZoom(element) {
  // Get the bounding box of the clicked path
  var bbox = element.getBBox();

  // Calculate the new viewBox based on the clicked path's bounding box
  var viewBoxX = bbox.x - 10; // Adjust for padding
  var viewBoxY = bbox.y - 10; // Adjust for padding
  var viewBoxWidth = bbox.width + 20; // Adjust for padding
  var viewBoxHeight = bbox.height + 20; // Adjust for padding

  // Set the new viewBox with smooth animation using GSAP
  gsap.to("#us-map", { duration: 1, attr: { viewBox: `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`, width: "100%" }, onComplete: function() {
    // Show the back button after zooming in completely
    $("#back-button").show();
  } });

  // Remove the click event listener after the first click
  $("path:not(.unclickable), circle:not(.unclickable)").off("click");

  // Add click event listener to the back button
  $("#back-button").click(function() {
    // Hide the back button immediately on click
    $("#back-button").hide();

    // Reattach the click event listener to the paths and circles
    $("path:not(.unclickable), circle:not(.unclickable)").one("click", function() {
      handleZoom(this);
    });

    // Revert to the original viewBox with smooth animation using GSAP
    gsap.to("#us-map", { duration: 1.5, attr: { viewBox: originalViewBox, width: "100%" } });
  });
}


// Hide the back button initially
$("#back-button").hide();

// Add initial click event listener to the paths and circles
$("path:not(.unclickable), circle:not(.unclickable)").one("click", function() {
  console.log("Clicked path/circle");

  // Check if the clicked element is a path
  if (!$(this).hasClass('unclickable')) {
    console.log("Clickable path/circle clicked");

    // Call the function to handle zooming
    handleZoom(this);
  }
});


/*
function placeMarkers(data) {
  data.forEach(function(location) {
    // Find the corresponding SVG path using the state code
    var stateCode = location.state_province;
    var svgPath = $('#' + stateCode);

    // Check if the SVG path exists
    if (svgPath.length > 0) {
      // Get the bounding box of the SVG path
      var bbox = svgPath[0].getBBox();

      // Calculate marker position
      var markerX = bbox.x + bbox.width / 2;
      var markerY = bbox.y + bbox.height / 2;

      // Create and append marker to the SVG
      var marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      marker.setAttribute('cx', markerX);
      marker.setAttribute('cy', markerY);
      marker.setAttribute('r', 3); // Adjust the radius as needed
      marker.setAttribute('fill', 'red'); // Set the marker color

      // Append the marker to the SVG
      $('#us-map').append(marker);
    }
  });
}

$.getJSON('markers.json', function(data) {
  placeMarkers(data);
});
*/