/*global describe, it, expect*/
describe('TextEditlet', function() {
    var sandbox;

    beforeEach(function() {
        sandbox = document.createElement('div');
        document.body.appendChild(sandbox);
    });

    describe('Factory', function() {
        var cm_backup;
        var textarea;

        beforeEach(function() {
            cm_backup = window['CodeMirror'];
            sandbox.innerHTML = '<form><textarea></textarea><input type="submit"></form>';
            textarea = sandbox.querySelector('textarea');
        });
        afterEach(function() {
            window['CodeMirror'] = cm_backup;
        });

        it('should create CodeMirrorEditlet if there is CodeMirror', function() {
            var editlet = editor2.TextEditlet.createInstance(textarea);
            expect(editlet instanceof editor2.CodeMirrorTextEditlet).toBeTruthy();
        });

        it('should create SimpleTextEditlet if there is no CodeMirror', function() {
            delete window['CodeMirror'];

            var editlet = editor2.TextEditlet.createInstance(textarea);
            expect(editlet instanceof editor2.SimpleTextEditlet).toBeTruthy();
        });
    });

    describe('SimpleTextEditlet', function() {
        var textarea;
        var editlet;

        beforeEach(function() {
            sandbox.innerHTML = '<form><textarea></textarea><input type="submit"></form>';
            textarea = sandbox.querySelector('textarea');
            editlet = new editor2.SimpleTextEditlet(textarea);
        });

        it('should work with associated textarea', function() {
            editlet.setContent('Hello');
            expect(editlet.getContent()).toEqual('Hello');
            expect(textarea.value).toEqual('Hello');
        });

        it('should append text to current content', function() {
            editlet.setContent('Hello');
            editlet.appendContent('there?');
            expect(editlet.getContent()).toEqual('Hello\n\nthere?');
        });
    });

    describe('CodeMirrorTextEditlet', function() {
        var textarea;
        var editlet;

        beforeEach(function() {
            sandbox.innerHTML = '<form><textarea id="this"></textarea><p>Hello</p><input type="submit" id="target"></form>';
            textarea = sandbox.querySelector('textarea');
            editlet = new editor2.CodeMirrorTextEditlet(textarea);
        });

        it('should work with associated textarea', function() {
            editlet.setContent('Hello');
            expect(editlet.getContent()).toEqual('Hello');
            expect(textarea.value).toEqual('Hello');
        });

        it('should append text to current content', function() {
            editlet.setContent('Hello');
            editlet.appendContent('there?');
            expect(editlet.getContent()).toEqual('Hello\n\nthere?');
        });
    });

    describe('CodeMirrorTextEditlet.getNextFocusTarget', function() {
        it('should find next form element', function() {
            sandbox.innerHTML = '<form><textarea id="this"></textarea><p>Hello</p><input type="submit" id="target"></form>';
            var textarea = sandbox.querySelector('textarea');
            var editlet = new editor2.CodeMirrorTextEditlet(textarea);
            expect(editlet.getNextFocusTarget().getAttribute('id')).toEqual('target');
        });

        it('should select the first form element if the textarea is the last element', function() {
            sandbox.innerHTML = '<form><input type="text" id="target"><textarea id="this"></textarea></form>';
            var textarea = sandbox.querySelector('textarea');
            var editlet = new editor2.CodeMirrorTextEditlet(textarea);
            expect(editlet.getNextFocusTarget().getAttribute('id')).toEqual('target');
        });
    });
});


describe('Editor', function() {
    var sandbox;
    var textarea;
    var editor;
    var $root;

    beforeEach(function() {
        sandbox = document.createElement('div');
        document.body.appendChild(sandbox);

        sandbox.innerHTML = '<form><textarea></textarea></form>';
        textarea = sandbox.querySelector('textarea');
        editor = new editor2.Editor(textarea);
        $root = $(textarea).next();
    });

    it('should modify DOM', function() {
        // Attach div.ecogwiki-editor right after the original textarea
        expect($root.hasClass('ecogwiki-editor')).toBeTruthy();

        // Hide original textarea
        expect($(textarea).css('display')).toEqual('none');

        // Create tabs
        expect($root.find('ul.mode-tab > li').length).toEqual(2);
        expect($root.find('ul.mode-tab > li.active').hasClass('plain')).toBeTruthy();

        // Create content panes
        expect($root.find('ul.mode-pane > li').length).toEqual(2);
    });

    it('should start from plain mode', function() {
        expect(editor.getActiveModeName()).toEqual('plain');
    });

    it('should switch plain mode to structured modes', function() {
        $root.find('ul.mode-tab > li.structured > a').click();
        expect(editor.getActiveModeName()).toEqual('structured');
        expect(editor.getActiveMode() instanceof editor2.StructuredEditMode).toBeTruthy();
        expect($root.find('ul.mode-tab > li.active').hasClass('structured')).toBeTruthy();
        expect($root.find('ul.mode-pane > li.plain').css('display')).toEqual('none');
    });

    it('should switch structured mode to plain modes', function() {
        $root.find('ul.mode-tab > li.plain > a').click();
        expect(editor.getActiveModeName()).toEqual('plain');
        expect(editor.getActiveMode() instanceof editor2.PlainEditMode).toBeTruthy();
        expect($root.find('ul.mode-tab > li.active').hasClass('plain')).toBeTruthy();
        expect($root.find('ul.mode-pane > li.structured').css('display')).toEqual('none');
    });
});

describe('Edit mode', function() {
    var sandbox;

    beforeEach(function() {
        sandbox = document.createElement('div');
        document.body.appendChild(sandbox);
    });

    describe('Plain mode', function() {
        it('should create TextEditlet with given initial content', function() {
            var mode = new editor2.PlainEditMode(sandbox, 'Hello');
            var editlet = mode.getEditlet();
            expect(mode.getContent()).toEqual('Hello');
            expect(editlet.getContent()).toEqual('Hello');
        });
        it('should connected to TextEditlet', function() {
            var mode = new editor2.PlainEditMode(sandbox, 'Hello');
            var editlet = mode.getEditlet();

            mode.setContent('Hello');
            expect(mode.getContent()).toEqual('Hello');
            expect(editlet.getContent()).toEqual('Hello');

            editlet.setContent('World');
            expect(mode.getContent()).toEqual('World');
            expect(editlet.getContent()).toEqual('World');
        });
    });

    describe('Structured mode', function() {

    });

    describe('ContentParser', function() {
        var parser;

        beforeEach(function() {
            parser = new editor2.ContentParser();
        });

        it('should parse empty body', function() {
            expect(parser.parseBody('')).toEqual({
                'itemtype': 'Article',
                'data': {},
                'body': ''
            });
        });

        it('should parse simple text', function() {
            expect(parser.parseBody('Hello\nthere?')).toEqual({
                'itemtype': 'Article',
                'data': {},
                'body': 'Hello\nthere?'
            });
        });

        it('should recognize itemtype', function() {
            expect(parser.parseBody('.schema Book\n\nHello\nthere?')).toEqual({
                'itemtype': 'Book',
                'data': {},
                'body': 'Hello\nthere?'
            });
        });

        it('should retain other metadata', function() {
            expect(parser.parseBody('.schema Book\n.pub\n\nHello\nthere?')).toEqual({
                'itemtype': 'Book',
                'data': [],
                'body': '.pub\n\nHello\nthere?'
            });
        });

        it('should recognize yaml block', function() {
            expect(parser.parseBody('.schema Book\n\n    #!yaml/schema\n    author: AK\n\nHello\nthere?')).toEqual({
                'itemtype': 'Book',
                'data': {'author': 'AK'},
                'body': 'Hello\nthere?'
            });
        });

        it('should generate empty string with default data', function() {
            var data = {
                'itemtype': 'Article',
                'data': {},
                'body': ''
            }
            expect(parser.generateBody(data)).toEqual('');
        });

        it('should generate simple text', function() {
            var data = {
                'itemtype': 'Article',
                'data': {},
                'body': 'Hello\nthere?'
            };
            expect(parser.generateBody(data)).toEqual('Hello\nthere?');
        });

        it('should generate schema metadata', function() {
            var data = {
                'itemtype': 'Book',
                'data': {},
                'body': 'Hello\nthere?'
            };
            expect(parser.generateBody(data)).toEqual('.schema Book\n\nHello\nthere?');
        });

        it('should generate yaml block', function() {
            var data = {
                'itemtype': 'Book',
                'data': {'author': 'AK'},
                'body': 'Hello\nthere?'
            };
            expect(parser.generateBody(data)).toEqual('.schema Book\n\n    #!yaml/schema\n    author: AK\n\nHello\nthere?');
        });

        it('should roundtrip parse/generate', function() {
            var bodies = [
                '',
                'Hello\nthere?',
                '.schema Book\n\nHello\nthere?',
                '.schema Book\n.pub\n\nHello\nthere?',
                '.schema Book\n\n    #!yaml/schema\n    author: AK\n\nHello\nthere?',
                '.schema Book\n.pub\n\n    #!yaml/schema\n    author: AK\n\nHello\nthere?'
            ];
            for(var i = 0; i < bodies.length; i++) {
                var body = bodies[i];
                expect(parser.generateBody(parser.parseBody(body))).toEqual(body);
            }
        });
    });
});

//    var types = [
//        'Article',
//        'Person'
//    ];
//    var person = {
//        "supertypes": ["Thing"],
//        "properties": {
//            "birthDate": {
//                "type": {
//                    "reversed_label": "%s Born",
//                    "label": "Birth Date",
//                    "comment": "Date of birth.",
//                    "domains": ["Person"],
//                    "ranges": ["Date"],
//                    "comment_plain": "Date of birth.",
//                    "id": "birthDate"
//                },
//                "cardinality": [0, 0]
//            },
//            "email": {
//                "type": {
//                    "reversed_label": "[%s] Email",
//                    "label": "Email",
//                    "comment": "Email address.",
//                    "domains": ["Person", "ContactPoint", "Organization"],
//                    "ranges": ["Text"],
//                    "comment_plain": "Email address.",
//                    "id": "email"
//                },
//                "cardinality": [1, 0]
//            },
//            "gender": {
//                "type": {
//                    "reversed_label": "[%s] Gender",
//                    "label": "Gender",
//                    "comment": "Gender of the person.",
//                    "domains": ["Person"],
//                    "ranges": ["Text"],
//                    "comment_plain": "Gender of the person.",
//                    "id": "gender"
//                },
//                "cardinality": [1, 1]
//            },
//            "parent": {
//                "type": {
//                    "reversed_label": "Children (%s)",
//                    "label": "Parent",
//                    "comment": "A parent of this person.",
//                    "domains": ["Person"],
//                    "ranges": ["Person"],
//                    "comment_plain": "A parent of this person.",
//                    "id": "parent"
//                },
//                "cardinality": [0, 0]
//            }
//        },
//        "comment": "",
//        "subtypes": ["Politician"],
//        "url": "http://schema.org/Person",
//        "label": "Person",
//        "ancestors": ["Thing"],
//        "comment_plain": "",
//        "id": "Person",
//        "plural_label": "People"
//    };
