// 時計を毎秒描画する
$(function() {
    setInterval(draw, 1000);
});

// 時計を描画する
function draw() {

    // 円のスタイルを定義する
    // radius はキャンバスサイズに対する比率
    var circle = {
        ColorWheel: {
            radius  : 0.9,
        },
        hour: {
            radius  : 0.85,
        },
        minute: {
            radius  : 0.5,
        },
        second: {
            radius  : 0.1,
        }
    };

    // 目盛りのスタイルを定義する
    // from, to はキャンバスサイズに対する比率
    var lines = {
        long: {
            from    : 0.8,
            to      : 0.68,
            width   : 1,
            color   : "#2a2a2a"
        },
        short: {
            from    : 0.8,
            to      : 0.75,
            width   : 1,
            color   : "#2a2a2a"
        }
    };

    // 針のスタイルを設定する
    // length は キャンバスサイズに対する比率
    // ratio は反対側の長さの比率
    var hands = {
        hour: {
            length  : 0.43,
            width   : 8,
            cap     : "round",
            color   : "#333",
            ratio   : 0.2
        },
        minute: {
            length  : 0.5,
            width   : 6,
            cap     : "round",
            color   : "#333",
            ratio   : 0.2
        },
        second: {
            length  : 0.1,
            width   : 2,
            cap     : "round",
            color   : "#dd3c3c",
            ratio   : 0.2
        }
    }

    // キャンバスを設定する
    var canvas = document.getElementById("canvas");
//    canvas.width = $(window).width();
//    canvas.height = $(window).height();
    canvas.width = 720;
    canvas.height = 720;
    var context = canvas.getContext("2d");
    var center = {
        x: Math.floor(canvas.width / 2),
        y: Math.floor(canvas.height / 2)
    };
    var radius = Math.min(center.x, center.y);
    var angle;
    var len;

    // 現在時刻を取得する
    var date = new Date();
    var h = date.getHours() % 12;
    var m = date.getMinutes();
    var s = date.getSeconds();
    var hms = h*3600 + m*60 + s

    // 円を描画する

    // 色相環を描写
    context.arc(center.x, center.y, radius * circle.ColorWheel.radius, 0, Math.PI * 2, false);
    context.fill();

    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var pixelArray = imageData.data;

    for(var x = 0; x < canvas.width; x++) {
        for(var y = 0; y < canvas.height; y++) {
            var baseIndex = (y * canvas.width + x) * 4;

            // 透明でなければ上書きする
            if(pixelArray[baseIndex + 3] > 0) {
                var hue = Math.atan2(x - center.x, y - center.y) / Math.PI / 2 * 360;
                var color = hsvToRGB(hue+180, 1, 1);
                pixelArray[baseIndex  ] = color[0];
                pixelArray[baseIndex+1] = color[1];
                pixelArray[baseIndex+2] = color[2];
            }
        }
    }
    context.putImageData(imageData, 0, 0);

    //時　色相
    context.beginPath();
    context.fillStyle = hsvToRgb2(360-hms/43200*360,1,1);
    context.arc(center.x, center.y, radius * circle.hour.radius, 0, Math.PI * 2, false);
    context.fill();

    //分　色相彩度
    context.beginPath();
    context.fillStyle = hsvToRgb2(360-hms/43200*360, 1-m/60, 1);
    context.arc(center.x, center.y, radius * circle.minute.radius, 0, Math.PI * 2, false);
    context.fill();

    //秒 色相明度
    context.beginPath();
    context.fillStyle = hsvToRgb2(360-hms/43200*360, 1-m/60, 1-s/60);
    context.arc(center.x, center.y, radius * circle.second.radius, 0, Math.PI * 2, false);
    context.fill();

    // 目盛りを描画する
//    for (var i = 0; i < 60; i++) {
//        angle = Math.PI * i / 30;
//        context.beginPath();
//        var line = (i % 5 == 0) ? lines.long : lines.short;
//        context.lineWidth = line.width;
//        context.strokeStyle = line.color;
//        context.moveTo(center.x + Math.sin(angle) * radius * line.from, center.y - Math.cos(angle) * radius * line.from);
//        context.lineTo(center.x + Math.sin(angle) * radius * line.to, center.y - Math.cos(angle) * radius * line.to);
//        context.stroke();
//    }

    // 文字盤
    context.save();
    context.font        = "80px 'sans-serif'";
    context.textAlign   ="center";
    context.textBaseline    ="middle";
    context.fillStyle   = "rgb(0, 0, 0)";
//    context.shadowBlur = 5;
//    context.shadowColor = "#FFF";
    for (var i = 1; i < 13; i++) {
        var radian = i * Math.PI / 6;
        context.fillStyle = hsvToRgb2(360*(1-i/12),1,1)
        var x = center.x + 245 * Math.sin(radian);
        var y = center.y - 245 * Math.cos(radian);
        var text = "" + (i == 0 ? "12" : i);
        context.fillText(text, x, y);
    }
    context.restore();

//    // 時針を描画する
//    angle = Math.PI * (h + m / 60) / 6;
//    len = radius * hands.hour.length;
//    context.beginPath();
//    context.lineWidth = hands.hour.width;
//    context.lineCap = hands.hour.cap;
//    context.strokeStyle = hands.hour.color;
//    context.moveTo(center.x - Math.sin(angle) * len * hands.hour.ratio, center.y + Math.cos(angle) * len * hands.hour.ratio);
//    context.lineTo(center.x + Math.sin(angle) * len, center.y - Math.cos(angle) * len);
//    context.stroke();
//
//    // 分針を描画する
//    angle = Math.PI * (m + s / 60) / 30;
//    len = radius * hands.minute.length;
//    context.beginPath();
//    context.lineWidth = hands.minute.width;
//    context.lineCap = hands.minute.cap;
//    context.strokeStyle = hands.minute.color;
//    context.moveTo(center.x - Math.sin(angle) * len * hands.minute.ratio, center.y + Math.cos(angle) * len * hands.minute.ratio);
//    context.lineTo(center.x + Math.sin(angle) * len, center.y - Math.cos(angle) * len);
//    context.stroke();
//
//    // 秒針を描画する
//    angle = Math.PI * s / 30;
//    len = radius * hands.second.length;
//    context.beginPath();
//    context.lineWidth = hands.second.width;
//    context.lineCap = hands.second.cap;
//    context.strokeStyle = hands.second.color;
//    context.moveTo(center.x - Math.sin(angle) * len * hands.second.ratio, center.y + Math.cos(angle) * len * hands.second.ratio);
//    context.lineTo(center.x + Math.sin(angle) * len, center.y - Math.cos(angle) * len);
//    context.stroke();
}

function hsvToRGB(hue, saturation, value) {
    var hi;
    var f;
    var p;
    var q;
    var t;

    while (hue < 0) {
        hue += 360;
    }
    hue = hue % 360;

    saturation = saturation < 0 ? 0
        : saturation > 1 ? 1
        : saturation;

    value = value < 0 ? 0
        : value > 1 ? 1
        : value;

    value *= 255;
        hi = (hue / 60 | 0) % 6;
        f = hue / 60 - hi;
        p = value * (1 -           saturation) | 0;
        q = value * (1 -      f  * saturation) | 0;
        t = value * (1 - (1 - f) * saturation) | 0;
    value |= 0;

    switch (hi) {
        case 0:
            return [value, t, p];
        case 1:
            return [q, value, p];
        case 2:
            return [p, value, t];
        case 3:
            return [p, q, value];
        case 4:
            return [t, p, value];
        case 5:
            return [value, p, q];
    }

    throw new Error('invalid hue');
}

function toHex(v) {
    return ("00" + v.toString(16)).slice(-2).toUpperCase();
}

function hsvToRgb2(H,S,V) {
    //https://en.wikipedia.org/wiki/HSL_and_HSV#From_HSV

    var C = V * S;
    var Hp = H / 60;
    var X = C * (1 - Math.abs(Hp % 2 - 1));

    var R, G, B;
    if (0 <= Hp && Hp < 1) {[R,G,B]=[C,X,0]};
    if (1 <= Hp && Hp < 2) {[R,G,B]=[X,C,0]};
    if (2 <= Hp && Hp < 3) {[R,G,B]=[0,C,X]};
    if (3 <= Hp && Hp < 4) {[R,G,B]=[0,X,C]};
    if (4 <= Hp && Hp < 5) {[R,G,B]=[X,0,C]};
    if (5 <= Hp && Hp < 6) {[R,G,B]=[C,0,X]};

    var m = V - C;
    [R, G, B] = [R+m, G+m, B+m];

    R = Math.floor(R * 255);
    G = Math.floor(G * 255);
    B = Math.floor(B * 255);

    return "#" + toHex(R) + toHex(G) + toHex(B);
}