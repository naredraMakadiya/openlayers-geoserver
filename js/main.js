(function ($) {

	"use strict";

	var fullHeight = function () {
		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function () {
			$('.js-fullheight').css('height', $(window).height());
		});
	};

	fullHeight();

	$('#sidebarCollapse').on('click', function () {
		$('#sidebar').toggleClass('active');
	});

	$(document).ready(function () {
		$('ul.list-unstyled.components li a').on('click', function (e) {
			e.preventDefault();

			// Remove the "active" class from all navigation items
			$('ul.list-unstyled.components li').removeClass('active');

			var targetContentId = $(this).data('content');

			// Add the "active" class to the clicked navigation item
			$(this).closest('li').addClass('active');
			$('.content-section').hide();
			$('#' + targetContentId).show();
		});
	});

})(jQuery);



