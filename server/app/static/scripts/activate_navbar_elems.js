/*Variable to get the navbar item with link to the current url*/
var selector='.nav a[href^="/' + location.pathname.split("/")[1] + '"]';

$(selector).parent().addClass('active');