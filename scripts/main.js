// NSDoc - A wiki for documenting JavaScript namespaces.
/*globals Showdown */
namespace.lookup('com.pageforest.nsdoc').defineOnce(function(ns) {
    var dom = namespace.lookup('org.startpad.dom');
    var nsdoc = namespace.lookup('org.startpad.nsdoc');
    var client;
    var markdown = new Showdown.converter();

    var page;
    var lastMarkdown = "";
    var syncTime = 5;
    var editVisible = false;
    var editorInitialized = false;

    function onEditChange() {
        var newText = page.editor.value;
        if (newText == lastMarkdown) {
            return;
        }
        lastMarkdown = newText;
        try {
            page.section.innerHTML = markdown.makeHtml(newText);
            nsdoc.updateScriptSections(page.section);
        } catch (e) {}
    }

    function toggleEditor(evt) {
        editVisible = !editVisible;
        if (editVisible) {
            $(page.editBlock).show();
            // Binding this in the onReady function does not work
            // since the original textarea is hidden.
            if (!editorInitialized) {
                editorInitialized = true;
                $(page.editor)
                    .bind('keyup', onEditChange)
                    .autoResize({limit: (screen.height - 100) / 2});
            }
        } else {
            $(page.editBlock).hide();
        }
        $(page.edit).val(editVisible ? 'hide' : 'edit');
    }

    function updateMeta(json) {
        document.title = json.title;
        $('#title').text(json.title);
    }

    function generateDoc() {
        var sNamespace = page.namespace.value;
        var nsGen = namespace.lookup(sNamespace);
        var sDoc = nsdoc.namespaceDoc(nsGen);
        page.editor.value = sDoc;
        onEditChange();
        updateMeta({title: sNamespace});
    }

    function onReady() {
        page = dom.bindIDs();
        client = new namespace.com.pageforest.client.Client(ns);

        client.addAppBar();

        $(page.edit).click(toggleEditor);
        $(page.generate).click(generateDoc);

        setInterval(onEditChange, syncTime * 1000);
    }

    function onSaveSuccess(json) {
        updateMeta(client.meta);
    }

    function setDoc(json) {
        page.editor.value = json.blob.markdown;
        onEditChange();
        updateMeta(json);
    }

    function getDoc() {
        return {
            blob: {
                version: 1,
                markdown: page.editor.value
            },
            readers: ['public']
        };
    }

    ns.extend({
        'onReady': onReady,
        'getDoc': getDoc,
        'setDoc': setDoc,
        'onSaveSuccess': onSaveSuccess
    });
});
