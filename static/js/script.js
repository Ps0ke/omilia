$(document).ready(function(){
	// scroll away or auto-focus search field
	if(location.pathname.split('/')[1] == 'show'){
		window.scroll(0,60);
	} else {
		$('#search').focus();
	}


	// activate tooltips
	$('[rel=tooltip]').tooltip();


	// show modals
	if(window.location.hash == '#delete-account'){
		$('#delete-account').modal();
	}
	if(window.location.hash == '#change-password'){
		$('#change-password').modal();
	}

	
	// Change button label for login-register-button
	$('#login-form #password_repeat').keyup(function(){
		if($(this).val() == ''){
			$('#login-register-button').text('Login');
		} else {
			$('#login-register-button').text('Register');
		}
	});


	// search field suggestions
	var suggestions = [];
	$.ajax({
		'url': '/suggest',
		'dataType': 'json',
		'async': false,
		'success': function(response){
			suggestions = response;
		},
		'type': 'GET'
	});

	$('#search').typeahead({
		'source': suggestions
	});
	

	// star hover toggle
	$('.fav[class*=icon-star]').mouseenter(function(e){
		if($(this).hasClass('icon-star')){
			$(this).removeClass('icon-star').addClass('icon-star-empty');
		}
		else if($(this).hasClass('icon-star-empty')){
			$(this).addClass('icon-star').removeClass('icon-star-empty');
		}
	});

	$('.fav[class*=icon-star]').mouseleave(function(e){
		if($(this).hasClass('changed')){
			$(this).removeClass('changed');
		}
		else{
			if($(this).hasClass('icon-star')){
				$(this).removeClass('icon-star').addClass('icon-star-empty');
			}
			else if($(this).hasClass('icon-star-empty')){
				$(this).addClass('icon-star').removeClass('icon-star-empty');
			}
		}
	});


	// Faving shows
	var faving = function(action, show, successCallback, errorCallback){
		$.ajax({
			'url': '/show/' + show,
			'dataType': 'text',
			'async': true,
			'success': successCallback,
			'error': errorCallback,
			'type': action
		});
	}

	$('li.search .fav[class*=icon-star]').on('click', function(e){
		tis = $(this);
		if(tis.hasClass('icon-star-empty')){
			faving(
				'DELETE',
				tis.attr('show'),
				function(response){
					console.log('sucess');
					tis.addClass('changed');
					tis.tooltip('destroy');
					tis.attr('title', 'Add to favorites');
					tis.tooltip();
				},
				function(resonse){
					console.log('error');
				}
			);
		}
		else if(tis.hasClass('icon-star')){
			faving(
				'PUT',
				tis.attr('show'),
				function(response){
					console.log('sucess');
					tis.addClass('changed');
					tis.tooltip('destroy');
					tis.attr('title', 'Delete from favorites');
					tis.tooltip();
				},
				function(resonse){
					console.log('error');
				}
			);
		}
		return false;
	});

	$('li.home i.fav.icon-star').on('click', function(e){
		var tis = $(this);
		faving(
			'DELETE',
			tis.attr('show'),
			function(response){
				console.log('sucess');
				tis.parent().animate(
					{ opacity:0, height:0 },
					500,
					function(){
						tis.parent().remove();
					}
				);
			},
			function(resonse){
				console.log('error');
			}
		);
		return false;
	});

	$('button.fav').on('click', function(e){
		var tis = $(this);
		if(tis.hasClass('add')){
			faving(
				'PUT',
				tis.attr('show'),
				function(response){
					console.log('sucess');
					tis.addClass('remove');
					tis.removeClass('add');
					tis.text('Remove from favorites');
				},
				function(resonse){
					console.log('error aaaaaaadd');
				}
			);
		}
		else if(tis.hasClass('remove')){
			faving(
				'DELETE',
				tis.attr('show'),
				function(response){
					console.log('sucess');
					tis.addClass('add');
					tis.removeClass('remove');
					tis.text('Add to favorites');
					$('input[type=checkbox]').prop('checked', false);
				},
				function(resonse){
					console.log('error remooooooovee');
				}
			);
		}
		return false;
	});


	// update info
	var set_gradient = function(element, progress){
		element.css({
			'background' :	'-webkit-gradient(linear, left top, right top, color-stop(' + progress + '% ,rgba(0, 0, 0, .05)), color-stop(' + progress + '%, rgba(0, 0, 0, 0)), color-stop(100%, rgba(0, 0, 0, 0))),' +
							'-webkit-gradient(linear, left top, left bottom, color-stop(0%, rgb(255, 255, 255)), color-stop(100%, rgb(242, 242, 242)))'
		});
		element.css({
			'background' :	'-webkit-linear-gradient(left,      rgba(0, 0, 0, .05) ' + progress + '%, rgba(0, 0, 0, 0) ' + progress + '%, rgba(0, 0, 0, 0)),' +
							'-webkit-linear-gradient(top,       rgb(255, 255, 255), rgb(242, 242, 242))'
		});
		element.css({
			'background' :	        'linear-gradient(to right,  rgba(0, 0, 0, .05) ' + progress + '%, rgba(0, 0, 0, 0) ' + progress + '%, rgba(0, 0, 0, 0)),' +
							        'linear-gradient(to bottom, rgb(255, 255, 255), rgb(242, 242, 242))'
		}); 
	}


	// watching episodes
	var watching = function(action, async, show, id, successCallback, errorCallback){
		// js 1.7, does not work in Chrome
		// https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7#Destructuring_assignment_%28Merge_into_own_page.2Fsection%29
		// var [season, episode] = id.split('_');
		var season = id.split('_')[0];
		var episode = id.split('_')[1];
		$.ajax({
			'url': '/show/' + show + '/' + season + '/' + episode,
			'dataType': 'text',
			'async': async,
			'success': successCallback,
			'error': errorCallback,
			'type': action
		});
	}
	
	$('input[type=checkbox].episode').on('change', function(event){
		var tis = $(this);
		watching(
			tis.prop('checked') ? 'PUT' : 'DELETE',
			true,
			location.pathname.split('/').pop(),
			tis.attr('id'),
			function(response){
				console.log('success! ' + response);
			},
			function(response){
				console.log('error! ' + response);
				faving(
					'PUT',
					show,
					function(res){
						console.log('success');
						var btn = $('#favbtn');
						btn.addClass('remove');
						btn.removeClass('add');
						btn.text('Remove from favorites');
					},
					function(res){
						if (tis.prop('checked')){
							tis.prop('checked', false);
						} else {
							tis.prop('checked', true);
						}
					}
				);
			}
		);
	});

	$('button.next-up').on('click', function(event){
		var tis = $(this);
		tis.button('loading');
		watching(
			'PUT',
			false,
			tis.attr('show'),
			tis.attr('next-up'),
			function(response){
				var info;
				$.ajax({
					'url': '/info/' + tis.attr('show'),
					'dataType': 'json',
					'async': false,
					'success': function(response){ info = response},
					'error': function(response){info = null},
					'type': 'GET'
				});
				if(info){
					if(info.unwatched && info.next_season && info.next_episode){
						tis.attr('next-up', info.next_id);
						tis.siblings('.badge.unwatched').text(info.unwatched);
						tis.siblings('.badge.unwatched').tooltip('destroy');
						tis.siblings('.badge.unwatched').attr('title', info.unwatched + ' unwatched episodes');
						tis.siblings('.badge.unwatched').tooltip();
						tis.tooltip('destroy');
						tis.attr('title', 'Mark s' + info.next_season + 'e' + info.next_episode + ' as watched')
						tis.tooltip();
						set_gradient(tis.parent(), info.progress);
						tis.button('reset');
						tis.text('next up: s' + info.next_season + 'e' + info.next_episode);
					} else if(info.unwatched && !info.next_season && !info.next_episode){
						tis.siblings('.badge.unwatched').text(info.unwatched);
						tis.siblings('.badge.unwatched').tooltip('destroy');
						tis.siblings('.badge.unwatched').attr('title', info.unwatched + ' unwatched episodes');
						tis.siblings('.badge.unwatched').tooltip();
						set_gradient(tis.parent(), info.progress);
						tis.tooltip('destroy');
						tis.remove();
					} else {
						tis.siblings('.badge.unwatched').html('<i class="icon-ok icon-white"></i>');
						tis.siblings('.badge.unwatched').tooltip('destroy');
						tis.siblings('.badge.unwatched').attr('title', 'No unwatched episodes');
						tis.siblings('.badge.unwatched').tooltip();
						set_gradient(tis.parent(), info.progress);
						tis.tooltip('destroy');
						tis.remove();
					}
				} else {
					tis.button('reset');
				}
			},
			function(response){
				console.log('error ' + response)
				tis.button('reset');
			}
		);
		return false;
	});


	// mark all in season as watched
	$('a[watch-season]').on('click', function(){
		$('input[type=checkbox].episode[id^=' +$(this).attr('watch-season') + '_]:not(:checked)').trigger('click');
	});


	// collapsing
	$('.season.collapsed ol').hide();

	$('i[class*=icon-chevron]').on('click', function(){
		tis = $(this);
		var show = location.pathname.split('/').pop();
		$.ajax({
			'url': '/collapse/' + show + '/' + tis.attr('collapse-season'),
			'dataType': 'text',
			'async': true,
			'success': function(response){
				console.log('success! ' + response);
			},
			'type': tis.hasClass('icon-chevron-down') ? 'PUT' : 'DELETE'
		});

		if(tis.hasClass('icon-chevron-right')){
			tis.addClass('icon-chevron-down');
			tis.removeClass('icon-chevron-right')
		}
		else if(tis.hasClass('icon-chevron-down')){
			tis.removeClass('icon-chevron-down');
			tis.addClass('icon-chevron-right')
		}
		tis.parent().siblings('ol').slideToggle();
	});
});

