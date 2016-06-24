// @see http://stackoverflow.com/questions/7451635/how-to-detect-supported-video-formats-for-the-html5-video-tag/7451727#7451727
var $v = document.createElement('video');
var $content = document.getElementById('content');

// Helper - do support test on video tag
function hasSupport(type, codecs) {
    codecs = codecs || '';
    var q = [type, codecs].join(';');

    return $v.canPlayType(q);
}

// Helper - get parameters form url.
function getUrlVars() {
    var vars = {};
    var hash = null;
    var href = window.location.href;
    var hashes = href.slice(href.indexOf('?') + 1).split('&');

    for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars[hash[0]] = hash[1];
    }

    return vars;
}

// Helper - build table layout.
function buildTable() {
    var $table = document.createElement('table');
    var $tbody = document.createElement('tbody');
    var $caption = document.createElement('caption');

    $caption.align = 'bottom';
    $caption.style.fontSize = '11px';
    $caption.style.paddingTop = $caption.style.paddingBottom = '5px';
    $caption.style.textAlign = 'left';

    $caption.innerHTML = [
        '"probably" - appears to be playable',
        '"maybe" - is playable without playing it',
        '"no" - definitely cannot be played'
    ].join('<br>');

    $table.appendChild($tbody);
    $table.appendChild($caption);

    return $table;
}

function addInfoMessage() {
    var $p = document.createElement('p');
    $p.innerHTML = ([
        'You can check support for custom type and codecs by URL',
        'Example: '+ window.location.href + '?type=video/mp4&codecs=mp4v.20.8'
    ].join('<br>'));

    $content.appendChild($p);
}

function addClearUrlLink() {
    var $a = document.createElement('a');
    var loc = window.location;
    var href = loc.href;

    $a.innerText = 'Clear URL from query string';
    $a.href = href.replace(loc.search, '')
    $content.appendChild($a);
}

// Helper - print text/html by adding row in table.
HTMLTableElement.prototype.addRow = function (title, html) {
    var $tbody = this.querySelector('tbody') || document.createElement('tbody');
    var $tr = document.createElement('tr');
    var $th = document.createElement('th');
    var $td = document.createElement('td');

    $th.innerText = title;
    $td.innerHTML = html;

    $tr.appendChild($th);
    $tr.appendChild($td);
    $tbody.appendChild($tr);

    this.appendChild($tbody);

    // Higlight result by changing td background.
    $td.highlightResult();

    return this;
}

HTMLTableCellElement.prototype.highlightResult = function () {
    var text = this.innerText.toLowerCase();
    var colorsMap = {
        '': 'red',
        probably: 'green',
        maybe: 'orange'
    }

    // If not supported then return empty string, so we replace it to `no` label.
    if (text === '') {
        this.innerHTML = 'no';
    }

    // this.innerHTML = mark;
    this.style.fontWeight = 'bold';
    this.style.textTransform = 'uppercase';
    this.style.color = 'white';
    this.style.background = colorsMap[text];
}

var VIDEO_TYPES = {
    mpeg4: 'video/mp4',
    ogg: 'video/ogg',
    webm: 'video/webm',
    hls: 'application/x-mpegURL'
};

// Print results.
window.onload = function () {
    var $table = buildTable();
    var urlParams = getUrlVars();

    // If params passed by URL.
    if (urlParams && urlParams.type) {
        addClearUrlLink();

        var type = urlParams.type;
        var codecs = urlParams.codecs;
        var title = type;

        if (codecs) {
            title += ' (' + codecs+ ')';
        }

        $table.addRow(title, hasSupport(type, codecs));
    } else {
        addInfoMessage();

        $table
            .addRow('mpeg4', hasSupport(VIDEO_TYPES['mpeg4'], 'mp4v.20.8'))
            .addRow('mpeg4 (h264)', hasSupport(VIDEO_TYPES['mpeg4'], 'avc1.42E01E, mp4a.40.2'))
            .addRow('ogg', hasSupport(VIDEO_TYPES['ogg'], 'theora'))
            .addRow('webm', hasSupport(VIDEO_TYPES['webm'], 'vorbis'))
            .addRow('webm (vp9)', hasSupport(VIDEO_TYPES['webm'], 'v9'))
            .addRow('hls', hasSupport(VIDEO_TYPES['hls'], 'avc1.42E01E'))
        ;//END
    }

    $content.appendChild($table);
}
