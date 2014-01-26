var LocalWikipageCache = (function($) {
    var LocalCache = function() {

        this.title    = getTitle();
        this.revision = getRevision();

        function getTitle() {
            var title = isEditPage() ? 
                $('.contents header h1').text() :
                $('meta[property="og:title"]').attr('content');
            return title;
        }

        function getRevision() {
            var rev = isEditPage() ? 
                $('.content input[name=revision]').val() :
                $('.revision').text();
            return parseInt(rev);
        }

        this.getCurrentContent = function() {
            var body = isEditPage() ? 
                $('form.editform textarea[name="body"]').text() :
                null;
            return body;
        };

        function isEditPage() {
            return document.location.search.indexOf('view=edit') !== -1;
        }

        this.key = function(title, revision) {
            title    = typeof title    === "undefined" ? this.title : title;
            revision = typeof revision === "undefined" ? this.revision : revision;
            return ['model', 'body', title, String(revision)].join("\t");
        };

        this.read = function(revision) {
            return window.localStorage.getItem(this.key(this.title, revision));
        };

        this.readPreviouses = function() {
            var previousCaches = [];

            var startIndex = Math.max(this.revision-1, 0);
            for(var i = startIndex; i >= 0; i--) {
                var cache = this.read(i);
                if (cache) {
                    previousCaches.push(cache);
                }
            }

            return previousCaches;
        };

        this.clearPreviouses = function() {
            var startIndex = Math.max(this.revision-1, 0);
            for(var i = startIndex; i >= 0; i--) {
                this.remove(i);
            }
        };

        this.save = function() {
            if (!isEditPage()) {
                return;
            }
            window.localStorage.setItem(this.key(), this.getCurrentContent());
        };

        this.remove = function(revision) {
            if (!isEditPage()) {
                return;
            }
            window.localStorage.removeItem(this.key(this.title, revision));
        };

        this.message = function(content, onClick) {
            var $container;
            var $messageBox = $(
                '<div class="infobox message wikipage-cache">' + '\n' +
                    '<div class="close">x</div>' + '\n' +
                    '<p>there is unapplied change: <a href="?view=edit">edit</a></p>' + '\n' + 
                '</div>' + '\n'
            );
            if (isEditPage()) {
                $container = $('form.editform');
                $messageBox.find('a')
                    .attr('title', 'appy this content to editor')
                    .text('apply')
                    .on('click', onClick);
            } else {
                $container = $('article .body');
            }
            $container.prepend(
                $messageBox
                    .append('<pre>' + content + '</pre>')
            );
        };

        this.error = function(contents, onClick) {
            var $messageBox = $(
                '<div class="infobox error wikipage-cache">' + '\n' +
                    '<div class="close">x</div>' + '\n' +
                '</div>' + '\n'
            );
            var $msg  = $('<p>there was unsaved cache.</p>'),
                $link = $('<a href="?view=edit">edit</a>');

            var $container;
            if (isEditPage()) {
                $container = $('form.editform');
                $msg.text('there was unsaved cache. copy the content if necessary and ');
                $link
                    .text('remove')
                    .attr('title', "it's okay to delete cache")
                    .on('click', onClick);
            } else {
                $container = $('article .body');
                $msg.text('there was unsaved cache. ');
                $link.text('edit');
            }

            var $ul = $('<ul> </ul>');
            for(var i=0; i<contents.length; i++) {
                $ul.append('<pre>' + contents[i] + '</pre>');
            }

            $container.prepend(
                $messageBox
                    .append($msg.append($link))
                    .append($ul)
            );
        };

    };

///////

    return LocalCache;
})($);

