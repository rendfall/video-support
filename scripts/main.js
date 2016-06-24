// @see http://stackoverflow.com/questions/7451635/how-to-detect-supported-video-formats-for-the-html5-video-tag/7451727#7451727
var $v = document.createElement('video');
var $content = document.getElementById('content');

// Helper - get JSON file
function getJSON(url, cb) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            if (typeof cb === 'function') {
                cb(response);
            }
        }
    };

    xhr.open('GET', url, true);
    xhr.send();
}

// Helper - do support test on video tag
function hasSupport(mime, codecs) {
    var q = mime +';codecs="' + codecs + '"';
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

// Polyfill - loop through array
Array.prototype.every = function (cb, context) {
    if (typeof cb !== 'function') {
        throw new TypeError(cb + ' is not a function!');
    }

    var len = this.length;
    for (var i = 0; i < len; i += 1) {
        cb.call(context, this[i], i, this);
    }
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

    return $tr;
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

        getJSON('./media-list.json', function (response) {
            response.every(function (item, idx) {
                var name = item.name;
                var mime = item.details.mime;
                var codecs = item.details.codecs;

                // Render table row with data.
                var $tr = $table.addRow(name, hasSupport(mime, codecs));

                // Add `title` attribute to add tooltip with extra info.
                $tr.title = [
                    'mime="' + mime + '";',
                    'codecs="' + codecs + '"'
                ].join(' ');
            });
        });
    }

    $content.appendChild($table);
}
