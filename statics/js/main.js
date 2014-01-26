$(function() {
    "use strict";

    // Render score graph
    (function() {
        $('span.score').each(function() {
            var $this = $(this);
            var percent = (+$this.text() * 100) + '%';
            var $replace = $('<span>').addClass('scorebar');
            $('<span>').appendTo($replace).addClass('bar').css('width', percent);
            $this.replaceWith($replace);
        })
    })();

    // Localize datetime
    (function() {
        $('time').each(function() {
            // if there are multiple children it means it's a wikilink
            if(this.childNodes.length > 1) return;

            var date = new Date(this.getAttribute('datetime'));
            var month = '0' + (date.getMonth() + 1);
            var day = '0' + date.getDate();
            var hour = '0' + date.getHours();
            var min = '0' + date.getMinutes();
            var result;
            if(this.innerHTML.length == 11) {
                result = month.substr(month.length - 2) + '-' +
                    day.substr(day.length - 2) + ' ' +
                    hour.substr(hour.length - 2) + ':' +
                    min.substr(min.length - 2);
            } else {
                var year = '' + date.getFullYear();
                result = year + '-' +
                    month.substr(month.length - 2) + '-' +
                    day.substr(day.length - 2) + ' ' +
                    hour.substr(hour.length - 2) + ':' +
                    min.substr(min.length - 2);
            }
            this.innerHTML = result;
        });
    })();

    // Make strong>em elements to quotable
    (function() {
        var url = $('link[rel="canonical"]').attr('href');
        $('strong > em').wrap(function() {
            var text = $(this).text();
            var twitter = $('meta[name="twitter:site"]').attr('content').substring(1);
            return '<a class="quotable" href="https://twitter.com/intent/tweet?via=' + twitter + '&url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(text) + '" />';
        });
    })();

    // Search box
    (function() {
        var $search = $('#searchbox');
        if ($search.length === 0) return;

        $($search[0].form).on('submit', function() {
            var value = $search.val();
            if(value) {
                document.cookie = 'ecogwiki_search_query=' + value;
                location.href = '/' + value;
            }
            return false;
        })
    })();

    // Shortcut keys
    (function() {
        var $editor = $('.editform, .preferencesform');

        // not in editor mode
        if ($editor.length) return;

        var $caret_targets = $('.caret-target');
        var caret_index = 0;
        if($caret_targets.length) navigateFocus(caret_index, true);

        // shortcuts
        var shortcuts = [];
        $('.shortcut').each(function() {
            shortcuts.push($(this).data('shortcut').toUpperCase());
        });

        $(window).on('keydown', function(e) {
            if(e.metaKey || e.ctrlKey) return true;

            var keyCode = e.keyCode;
            var key = String.fromCharCode(keyCode);

            var $focused = $('input:focus');
            if ($focused.length) {
                if(27 === keyCode) {
                    $focused.blur();
                    return false;
                } else {
                    return true;
                }
            }

            if(shortcuts.indexOf(key) != -1) {
                $('#shortcut_' + key).focus();
                return false;
            } else if(69 === keyCode) {
                // [E]
                $('#edit').focus();
                return false;
            } else if(191 === keyCode || 83 === keyCode) {
                // [/] or [S]earch
                $('#searchbox').focus();
                return false;
            } else if(74 === keyCode) {
                // J for down
                $caret_targets = $('.caret-target');

                if($caret_targets.length) {
                    caret_index++;
                    if(caret_index >= $caret_targets.length) caret_index = 0;
                    navigateFocus(caret_index, false);
                }
                return false;
            } else if(75 === keyCode) {
                // K for up
                $caret_targets = $('.caret-target');

                if($caret_targets.length) {
                    caret_index--;
                    if(caret_index < 0) caret_index = $caret_targets.length - 1;
                    navigateFocus(caret_index, false);
                }
                return false;
            } else {
                return true;
            }
        });

        function navigateFocus(index, isFirstTime) {
            $('.vcaret').removeClass('vcaret');
            $('.vcaret-parent').removeClass('vcaret-parent');

            var $target = $($caret_targets[index]);
            $target.addClass('vcaret').focus();
            if(isFirstTime) return;

            var $parent = $target.parent();
            if($parent[0].nodeName === 'TD') {
                $parent = $parent.parent();
            }

            $parent
                .addClass('vcaret-parent')
                .on('transitionend', function() {
                    $(this).removeClass('vcaret-parent');
                }
            );
        }
    })();

    // Embed wikiquery results
    (function() {
        $('a.wikiquery').each(function() {
            var $this = $(this);
            if(this.parentNode.firstChild === this && this.parentNode.lastChild === this) {
                if(this.parentNode.nodeName == 'P') {
                    // P cannot contain block-level elements so replace it with div
                    var $container = $('<div>');
                    $container.addClass('wikiquery-container');
                    $(this.parentNode).replaceWith($container);
                    $container.load($this.attr('href') + '?view=bodyonly .wrap');
                } else {
                    // Other block-level elements can contain block-level elements so use it as a parent
                    $(this.parentNode).addClass('wikiquery-container').load($this.attr('href') + '?view=bodyonly .wrap');
                }
            } else {
                // Do nothing for now (I don't know what should be happened here, yet)
            }
        });
    })();

    // Partials
    (function() {
        // checkbox
        var checkbox_selector = 'article input[type="checkbox"].partial';
        if($('#edit').length === 0) {
            $(checkbox_selector).prop('disabled', true);
            return;
        }
        $(document).on('change', checkbox_selector, function() {
            var $this = $(this);
            var body = $(this).is(':checked') ? '1' : '0';
            var revision = parseInt($('.revision').text());
            var index = $this.index(checkbox_selector);

            $(checkbox_selector).prop('disabled', true);
            $.post('?_method=PUT&partial=checkbox[' + index + ']', {'body': body, 'revision': revision}, function(data) {
                $('.revision').text(data['revision']);
            }).fail(function() {
                alert('Failed to update content. Please refresh the page.');
            }).done(function() {
                $(checkbox_selector).prop('disabled', false);
            });
        });

        // log
        var log_selector = 'article form.partial.log';
        if($('#edit').length === 0) {
            $(log_selector + ' input').prop('disabled', true);
            return;
        }
        $(document).on('submit', log_selector, function(e) {
            e.preventDefault();

            var $this = $(this);
            var value = $(this).find('input[type="text"]').val();
            var revision = parseInt($('.revision').text());
            var index = $this.index(log_selector);

            $(log_selector + ' input').prop('disabled', true);
            $.post('?_method=PUT&partial=log[' + index + ']', {'body': value, 'revision': revision}, function() {
                location.reload();
            }).fail(function() {
                alert('Failed to update content. Please refresh the page.');
            }).done(function() {
                $(log_selector + ' input').prop('disabled', false);
            });
        });
    })();

    // Close button
    (function() {
        $(document).on('click', '.infobox .close', function() {
            $(this.parentNode).hide();
        });
    })();

    
    // Pagination
    (function() {
        $('.next-page').on('click', function(e) {
            e.preventDefault();

            var url = $(this).attr('href');
            var $container = $('<table></table>');
            var $target = $('.pagelist tbody');

            $('.next-page').hide();
            $('.loading-indicator').show();
            $container.load(url + '&view=bodyonly .wrap', function() {
                $('.next-page').show();
                $('.loading-indicator').hide();

                var $this = $(this);
                var $rows = $this.find('tr.page');
                var next_href = $this.find('.next-page').attr('href');
                if($rows.length) {
                    $rows.each(function() {$target.append(this);});
                    $('.next-page').attr('href', next_href);
                } else {
                    $('.next-page').remove();
                }
            });
        });
    })();

    // Track outbound links
    (function() {
        var host = window.location.host;
        $('article').on('click', 'a:not(.wikipage)', function() {
            var url = String(this.href);
            if(url.indexOf('http://' + host) === 0 ||
               url.indexOf('https://' + host) === 0 ||
               url.indexOf('/') === 0) return true;
            ga('send', 'event', 'Outbound links', url);
        });
    })();

    // local wikipage cache
    (function() {
        var pageCache = new LocalWikipageCache();
        //
        var content = pageCache.read();
        if (content && content.data !== pageCache.getCurrentContent()) {
            // apply on click
            pageCache.message(content, function(e) {
                e.preventDefault();
                editor.codeMirror.setValue(content.data);
                saveCache();
                // close messagebox
                $(this).parents('.wikipage-cache.message').find('.close').click();
            });
        } else {
            var previousContents = pageCache.readPreviouses();
            if (previousContents.length > 0) {
                // delete previous caches on click
                pageCache.error(previousContents, function(e) {
                    e.preventDefault();
                    pageCache.clearPreviouses();
                    // close messagebox
                    $(this).parents('.wikipage-cache.error').find('.close').click();
                });
            }
        }

        //
        if (typeof editor === 'object' && editor.codeMirror) {
            var cm = editor.codeMirror;
            // save on blur or on 'enter'
            cm.on('blur', function(cm, event) {
                saveCache();
            });
            cm.on('keyup', function(cm, event) {
                if (event.keyCode === 13 && !event.metaKey) {
                    saveCache();
                }
            });
            var saveCache = function() {
                editor.updateFormValues();
                pageCache.save();
            };
            // remove
            $('form.editform').on('submit', function(event) {
                pageCache.remove();
            });

        }
    })();
});
