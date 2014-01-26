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

        function getBody() {
            var body = isEditPage() ? 
                $('form.editform textarea[name="body"]').text() :
                null;
            return body;
        }

        function isEditPage() {
            return document.location.search.indexOf('view=edit') !== -1;
        }

        this.key = function() {
            return ['model', 'body', this.title, String(this.revision)].join("\t");
        };

        this.read = function() {
            return window.localStorage.getItem(this.key());
        };

        this.save = function() {
            if (!isEditPage()) {
                return;
            }
            window.localStorage.setItem(this.key(), getBody());
        };

        this.remove = function() {
            if (!isEditPage()) {
                return;
            }
            window.localStorage.removeItem(this.key());
        };

        this.warn = function(content, onClick) {
            var $container;
            var $messageBox = $(
                '<div class="infobox message wikipage-cache">' + '\n' +
                    '<div class="close">x</div>' + '\n' +
                    '<p>there is unapplied change: <a href="?view=edit">apply</a></p>' + '\n' + 
                '</div>' + '\n'
            );
            if (isEditPage()) {
                $container = $('form.editform');
                $messageBox.find('a')
                    .attr('title', 'appy this content to editor')
                    .on('click', onClick);
            } else {
                $container = $('article .body');
            }
            $container.prepend(
                $messageBox
                    .append('<pre>' + content + '</pre>')
            );
        };

    };

///////

    return LocalCache;
})($);

