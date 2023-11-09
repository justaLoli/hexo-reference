'use strict';

var md = require('markdown-it')({
    // allow HTML tags
    html: true
});

/**
 * Render markdown footnotes
 * @param {String} text
 * @returns {String} text
 */
function renderFootnotes(text) {
    var footnotes = [];
    var reFootnoteContent = /\[\^([a-zA-Z\d]+)\]: ?([\S\s]+?)(?=\[\^(?:\d+)\]|\n\n|$)/g;

    var reFootnoteHint = /\[\^([a-zA-Z\d]+)\]/g;
    var html = '';
    
    // threat all footnote contents
    text = text.replace(reFootnoteContent, function (match, index, content) {
        footnotes.push({
            index: index,
            content: content,
            hint: index
        });
        // remove footnote content
        return '';
    });


    // create map for looking footnotes array
    function createLookMap() {
        var map = {}
        for (var i = 0; i < footnotes.length; i++) {
            var item = footnotes[i]
            var hint = item["hint"];
            map[hint] = item;
            map[hint]["index"] = i+1;
        }
        return map
    }

    var indexMap = createLookMap()

    // console.log('indexMap:',indexMap);
    
    // render (HTML) footnotes reference
    text = text.replace(reFootnoteHint,
        function(match, hint){
            var tooltip = indexMap[hint].content;
            return '<sup id="fnref:' + hint + '">' +
                '<a href="#fn:'+ hint +'" rel="footnote">' +
                '<span class="hint--top hint--error hint--medium hint--rounded hint--bounce" aria-label="'
                + tooltip +
                '">[' + indexMap[hint]["index"] +']</span></a></sup>';
        });

    // render footnotes (HTML)
    footnotes.forEach(function (footNote) {
        html += '<li id="fn:' + footNote.hint + '">';
        html += '<span style="display: inline-block; vertical-align: top; margin-left: 10px;">';
        html += md.renderInline(footNote.content.trim());
        html += '<a href="#fnref:' + footNote.hint + '" rev="footnote"> ↩</a></span></li>';
    });

    // add footnotes at the end of the content
    if (footnotes.length) {
        text += '<div id="footnotes">';
        text += '<hr>';
        text += '<div id="footnotelist">';
        text += '<ol style="list-style: none; padding-left: 0; margin-left: 40px">' + html + '</ol>';
        text += '</div></div>';
    }
    return text;
}
module.exports = renderFootnotes;