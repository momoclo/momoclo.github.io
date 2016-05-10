window.onload = function() {
    gid("q").focus();
}

{
    $_ = String.prototype;

    $_.mReplace = function(pat, flag) {
        var tmp = this;
        if (!flag) {
            flag = "";
        }
        for (var i in pat) {
            var re = new RegExp(i, flag);
            tmp = tmp.replace(re, pat[i]);
        }
        return tmp;
    }
}

{
    $_ = Date.prototype;

    $_.format = "yyyy-mm-dd HH:MM:SS";
    $_.formatTime = function(format) {
        var yy;
        var o = {
            yyyy : ((yy = this.getYear()) < 2000) ? yy + 1900 : yy,
            mm   : this.getMonth() + 1,
            dd   : this.getDate(),
            HH   : this.getHours(),
            MM   : this.getMinutes(),
            SS   : this.getSeconds()
        };
        for (var i in o) {
            if (o[i] < 10) {
                o[i] = "0" + o[i];
            }
        }
        return (format) ? format.mReplace(o)
                        : this.format.mReplace(o);
    }
}

var start = new Date().getTime();
var bodylist = [];
var st = gid("stat");
var re = gid("result");
var nv = gid("navi");
var max = 25;
var KC = {
    enter: 13,
    left : 37,
    up   : 38,
    right: 39,
    down : 40
};

function gid(id) {
    return document.getElementById(id);
}

function ignore_case() {
    var a = arguments;
    return "[" + a[0] + a[0].toUpperCase() + "]";
}

function do_find(v) {
    if (this.lastquery == v) {
        return;
    }
    this.lastquery = v;
    var re = find(v);
    if (re.length) {
        pagenavi(re);
        view(re);
    }
}

function key(c) {
    switch(c) {
        case KC.left : mv(-1); break;
        case KC.up   : mv(-1); break;
        case KC.right: mv(1);  break;
        case KC.down : mv(1);  break;
        case KC.enter: mv(1);  break;
    }
}

function find(v) {
    var query = v;
    if (!v) {
        return [];
    }
    var ambiguous;
    if (query) {
        ambiguous = query.replace(/[a-z]/g, ignore_case);
        try {
            reg = new RegExp(ambiguous, "g");
        } catch(e) {
            reg = /(.)/g;
        }
    } else {
        reg = /(.)/g;
    }
    var start = new Date().getTime();
    var result = [];
    for (var i = 0; i < data.length; i++) {
        var s = bodylist[i];
        var res = reg.exec(s);
        if (!res) {
            continue;
        }
        var len = res[0].length;
        var idx = res.index;
        if (idx != -1) {
            result.push([i, idx, len]);
        }
    }
    if (result.length) {
        st.innerHTML = data.length + "件中 " + result.length + "件見つかりました。";
    }
    var end = new Date().getTime();

    console.log("Find: " + (end - start) + " ms");
    return result;
}

function time2date(time) {
    if (!this.cache) {
        this.cache = {};
    }
    if (this.cache[time]) {
        return this.cache[time];
    }
    var d = new Date(time * 1000);
    this.cache[time] = d.formatTime("yyyy年mm月dd日");
    return this.cache[time];
}

function snippet(body, idx, len) {
    var start = idx - 20;
    return [
        body.substring(start, idx),
        "<strong>",
        body.substr(idx, len),
        "</strong>",
        body.substr(idx + len, 50),
    ].join("");
}

function pagenavi(result) {
    var len = result.length;
    var ct = Math.ceil(len / max);
    var buf = [];
    for (var i = 0; i < ct; i++) {
        buf.push(
            "<span onclick='view(\"\",",
            i + 1,
            ");sw(", i, ")'>",
            i + 1,
            "</span>"
        );
    }
    nv.innerHTML = buf.join("");
    sw(0);
}

function sw(t) {
    var span = nv.getElementsByTagName("span");
    for (var i = 0; i < span.length; i++) {
        span[i].className = (i == t) ? "selected"
                                     : "";
    }
}

function mv(to) {
    var span = nv.getElementsByTagName("span");
    var current;
    if (!span.length) {
        return;
    }
    for (var i = 0; i < span.length; i++) {
        if (span[i].className == "selected") {
            current = i;
            break;
        }
    }
    var moveto = current + to;
    if (moveto < 0) {
        return;
    }
    if (moveto > span.length - 1) {
        moveto = 0;
    }
    sw(moveto);
    view("", moveto + 1)
}

function view(result, offset) {
    if (!offset) {
        offset = 1;
    }
    if (!result) {
        result = this.last.reverse();
    } else {
        this.last = result;
    }
    var r = result.reverse();
    var buf = ["<dl>"];
    var count = 0;
    for (var i = (offset - 1) * max; i < r.length; i++) {
        count++;
        if (count > max) {
            break;
        }
        var num = r[i][0];
        var idx = r[i][1];
        var len = r[i][2];
        with(data[num]) {
            buf.push(
                "<dt><a href='", url, "'>",
                date,
                " ",
                title || "無題",
                "</a>",
                "<dd>",
                snippet(bodylist[num], idx, len)
            );
        }
    }
    re.innerHTML = buf.join("");
}
for (var i = 0; i < data.length; i++) {
    bodylist.push(data[i].title + " " + data[i].content);
}
var bodyidx = bodylist.join("<>");
var end = new Date().getTime();

console.log("Index: " + (end - start) + " ms");
